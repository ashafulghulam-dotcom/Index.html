import React, { useMemo, useState } from 'react';
import {
  Bell,
  BellRing,
  CheckCircle2,
  Clock,
  Copy,
  History,
  Mail,
  MessageCircle,
  Search,
  Send,
  Smartphone,
  Sparkles,
} from 'lucide-react';
import { LIST_16_KUA } from '../data/jeparaData';
import { useBimwin } from '../store/useBimwinStore';
import { formatIndonesianDate, normalizeVillageName } from '../utils/bimwinLogic';
import {
  buildBatchEmailBccUrl,
  buildEmailReminderUrl,
  buildWhatsAppReminderUrl,
  classifyParticipantReminder,
  computeDaysUntilAkad,
  isValidEmailAddress,
  normalizeWhatsAppNumber,
  ParticipantReminderProfile,
  renderMobilePushPreview,
  renderReminderTemplate,
  resolveMobileNotifPolicy,
} from '../utils/smartReminder';
import { MobileNotifConfigModal } from './MobileNotifConfigModal';

interface SmartReminderPanelProps {
  scopeMode: 'all' | 'kua';
  kuaName?: string;
  roleTitle: string;
}

type FilterMode =
  | 'need_action'
  | 'all'
  | 'akad_dekat'
  | 'apk_installed'
  | ParticipantReminderProfile['category'];

export const SmartReminderPanel: React.FC<SmartReminderPanelProps> = ({
  scopeMode,
  kuaName,
  roleTitle,
}) => {
  const { data, logSmartReminder, sendMobilePushReminder, pushToast } = useBimwin();

  const [selectedKua, setSelectedKua] = useState<string>(
    scopeMode === 'all' ? 'ALL' : kuaName || 'KUA Jepara'
  );
  const [filterMode, setFilterMode] = useState<FilterMode>('need_action');
  const [search, setSearch] = useState('');
  const [useCustomTemplate, setUseCustomTemplate] = useState(false);
  const [customSubject, setCustomSubject] = useState(
    'Pengingat Resmi Bimbingan Perkawinan SAMAWA — {kua}'
  );
  const [customMessage, setCustomMessage] = useState(
    'Assalamu\'alaikum {nama},\n\nKami mengingatkan untuk melanjutkan tahapan Bimbingan Perkawinan Mandiri di {kua} ({tahap}, rencana akad {tanggal_akad}).\n\nTerima kasih.\nSAMAWA — Kementerian Agama Kab. Jepara'
  );
  const [showHistory, setShowHistory] = useState(false);
  const [mobileNotifModalOpen, setMobileNotifModalOpen] = useState(false);

  const effectiveKua = scopeMode === 'all' ? selectedKua : kuaName || 'KUA Jepara';
  const activeMobilePolicy = useMemo(
    () => resolveMobileNotifPolicy(data.mobileNotifPolicies, effectiveKua),
    [data.mobileNotifPolicies, effectiveKua]
  );

  const scopedPeserta = useMemo(() => {
    return data.users.filter(
      (u) =>
        u.role === 'Peserta' &&
        (effectiveKua === 'ALL' || u.kua === effectiveKua)
    );
  }, [data.users, effectiveKua]);

  const enrichedList = useMemo(() => {
    return scopedPeserta
      .map((user) => {
        const classification = classifyParticipantReminder(user, data.modules.length);
        const daysToAkad = computeDaysUntilAkad(user.tanggalRencanaNikah);
        const lastLog = (data.reminderLogs || []).find(
          (l) => l.pesertaUsername === user.username
        );
        return {
          user,
          classification,
          daysToAkad,
          lastLog,
          hasWa: Boolean(normalizeWhatsAppNumber(user.noHp)),
          hasEmail: isValidEmailAddress(user.email),
          apkInstalled: Boolean(user.appNotification?.apkInstalled),
          apkPushActive: Boolean(
            user.appNotification?.apkInstalled &&
              user.appNotification.pushEnabled &&
              !user.appNotification.mutedByOfficer
          ),
        };
      })
      .sort((a, b) => {
        const weight: Record<string, number> = { tinggi: 0, sedang: 1, normal: 2 };
        const diff = (weight[a.classification.urgency] ?? 2) - (weight[b.classification.urgency] ?? 2);
        if (diff !== 0) return diff;
        return a.user.nama.localeCompare(b.user.nama);
      });
  }, [scopedPeserta, data.modules.length, data.reminderLogs]);

  const counts = useMemo(() => {
    return {
      total: enrichedList.length,
      needAction: enrichedList.filter((i) => i.classification.category !== 'sudah_lulus').length,
      akadDekat: enrichedList.filter(
        (i) => i.daysToAkad !== null && i.daysToAkad >= 0 && i.daysToAkad <= 14 && i.classification.category !== 'sudah_lulus'
      ).length,
      belumSinkron: enrichedList.filter((i) => i.classification.category === 'belum_sinkron').length,
      moocBelum: enrichedList.filter(
        (i) =>
          i.classification.category === 'belum_pretest' ||
          i.classification.category === 'modul_berjalan' ||
          i.classification.category === 'belum_postest'
      ).length,
      belumIkm: enrichedList.filter((i) => i.classification.category === 'belum_ikm').length,
      belumVerifikasi: enrichedList.filter((i) => i.classification.category === 'belum_verifikasi').length,
      apkInstalled: enrichedList.filter((i) => i.apkInstalled).length,
      apkPushActive: enrichedList.filter((i) => i.apkPushActive).length,
    };
  }, [enrichedList]);

  const filteredList = useMemo(() => {
    const q = search.trim().toLowerCase();
    return enrichedList.filter((item) => {
      const matchQuery =
        !q ||
        item.user.nama.toLowerCase().includes(q) ||
        item.user.username.toLowerCase().includes(q) ||
        item.user.kua.toLowerCase().includes(q) ||
        (item.user.email || '').toLowerCase().includes(q) ||
        (item.user.noHp || '').toLowerCase().includes(q);
      if (!matchQuery) return false;

      if (filterMode === 'all') return true;
      if (filterMode === 'need_action') return item.classification.category !== 'sudah_lulus';
      if (filterMode === 'apk_installed') return item.apkInstalled;
      if (filterMode === 'akad_dekat') {
        return (
          item.daysToAkad !== null &&
          item.daysToAkad >= 0 &&
          item.daysToAkad <= 14 &&
          item.classification.category !== 'sudah_lulus'
        );
      }
      return item.classification.category === filterMode;
    });
  }, [enrichedList, filterMode, search]);

  const filteredApkActive = useMemo(
    () => filteredList.filter((i) => i.apkPushActive),
    [filteredList]
  );

  const resolveMessageForItem = (item: (typeof enrichedList)[number]) => {
    if (!useCustomTemplate) {
      return {
        subject: item.classification.defaultSubject,
        message: item.classification.defaultMessage,
      };
    }
    return {
      subject: renderReminderTemplate(customSubject, item.user, item.classification),
      message: renderReminderTemplate(customMessage, item.user, item.classification),
    };
  };

  const scopedLogs = useMemo(() => {
    return (data.reminderLogs || []).filter(
      (log) => effectiveKua === 'ALL' || log.kua === effectiveKua
    );
  }, [data.reminderLogs, effectiveKua]);

  const batchEmailUrl = useMemo(() => {
    const emails = filteredList
      .map((item) => item.user.email || '')
      .filter((e) => isValidEmailAddress(e));
    const subject = useCustomTemplate
      ? customSubject.replace(/\{kua\}/g, effectiveKua === 'ALL' ? 'Kemenag Kab. Jepara' : effectiveKua)
      : `Pengingat Bimbingan Perkawinan SAMAWA — ${
          effectiveKua === 'ALL' ? 'Kemenag Kab. Jepara' : effectiveKua
        }`;
    const body = useCustomTemplate
      ? customMessage
          .replace(/\{nama\}/g, 'Calon Pengantin')
          .replace(/\{kua\}/g, effectiveKua === 'ALL' ? 'KUA Tujuan Anda' : effectiveKua)
          .replace(/\{tahap\}/g, 'Tahapan MOOC & Kelas BIMWIN')
          .replace(/\{tanggal_akad\}/g, 'sesuai jadwal akad')
      : `Assalamu'alaikum Calon Pengantin,\n\nKami mengingatkan untuk segera menuntaskan rangkaian Bimbingan Perkawinan Mandiri (MOOC 5 Modul, Postest, Survei IKM, dan Kelas KUA) pada portal SAMAWA Kementerian Agama Kabupaten Jepara.\n\nSalam hormat,\n${roleTitle}`;
    return buildBatchEmailBccUrl(emails, subject, body);
  }, [filteredList, useCustomTemplate, customSubject, customMessage, effectiveKua, roleTitle]);

  const handleBatchInApp = () => {
    if (filteredList.length === 0) {
      pushToast('info', 'Tidak Ada Peserta Terfilter');
      return;
    }
    filteredList.forEach((item) => {
      const { subject, message } = resolveMessageForItem(item);
      logSmartReminder({
        pesertaUsername: item.user.username,
        pesertaNama: item.user.nama,
        kua: item.user.kua,
        channel: 'InApp',
        subject,
        message,
      });
    });
    pushToast(
      'success',
      `Smart Reminder In-App Terkirim (${filteredList.length} Peserta)`,
      'Notifikasi personal masuk ke Kotak Masuk Pengingat masing-masing peserta.'
    );
  };

  const handleBatchPushHp = () => {
    if (filteredApkActive.length === 0) {
      pushToast(
        'info',
        'Belum Ada Pengguna APK Aktif',
        'Tidak ada peserta terfilter yang sudah memasang APK dengan notifikasi HP aktif.'
      );
      return;
    }
    const targets = filteredApkActive.map((item) => {
      const rendered = useCustomTemplate
        ? resolveMessageForItem(item)
        : (() => {
            const preview = renderMobilePushPreview(
              activeMobilePolicy,
              item.user,
              item.classification
            );
            return { subject: preview.title, message: preview.body };
          })();
      return {
        username: item.user.username,
        nama: item.user.nama,
        kua: item.user.kua,
        subject: rendered.subject,
        message: rendered.message,
      };
    });
    sendMobilePushReminder({
      scopeKua: effectiveKua,
      targets,
    });
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#0F684E] dark:text-emerald-400 inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Smart Reminder WA, Email &amp; Notif HP (APK) · {roleTitle}
          </p>
          <h2 className="font-display text-2xl font-semibold text-slate-900 dark:text-white mt-0.5">
            Pengingat Cerdas Peserta —{' '}
            {effectiveKua === 'ALL' ? 'Semua 16 KUA Jepara' : effectiveKua}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Otomatis mendeteksi tahapan tertunda (sinkronisasi, MOOC, IKM, jadwal kelas, &amp; akad dekat) dengan pesan personal siap kirim via WhatsApp, Email, Notifikasi HP (APK), atau Portal.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {scopeMode === 'all' && (
            <select
              value={selectedKua}
              onChange={(e) => setSelectedKua(e.target.value)}
              aria-label="Filter wilayah KUA"
              className="px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-white dark:bg-[#111C18] text-xs font-semibold"
            >
              <option value="ALL">Semua 16 KUA Jepara</option>
              {LIST_16_KUA.map((kua) => (
                <option key={kua} value={kua}>
                  {kua}
                </option>
              ))}
            </select>
          )}
          <button
            type="button"
            onClick={() => setMobileNotifModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#0F684E] hover:bg-[#0B523D] text-white text-xs font-semibold shadow-xs transition"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Atur Notif HP (APK)</span>
            <span className="px-1.5 py-0.5 rounded bg-white/15 font-mono-num text-[10px]">
              {counts.apkPushActive}/{counts.apkInstalled}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setShowHistory((v) => !v)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-white dark:bg-[#111C18] text-xs font-semibold hover:bg-slate-50 dark:hover:bg-emerald-950/60"
          >
            <History className="w-3.5 h-3.5 text-[#0F684E]" />
            Riwayat Kirim ({scopedLogs.length})
          </button>
        </div>
      </div>

      {/* Smart KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {[
          { id: 'need_action' as FilterMode, label: 'Perlu Pengingat', value: counts.needAction, tone: 'text-[#0F684E] dark:text-emerald-400' },
          { id: 'akad_dekat' as FilterMode, label: 'Akad ≤ 14 Hari', value: counts.akadDekat, tone: 'text-red-600 dark:text-red-400' },
          { id: 'belum_sinkron' as FilterMode, label: 'Belum Sinkron', value: counts.belumSinkron, tone: 'text-amber-600 dark:text-amber-400' },
          { id: 'belum_ikm' as FilterMode, label: 'Belum Survei IKM', value: counts.belumIkm, tone: 'text-blue-600 dark:text-blue-400' },
          { id: 'belum_verifikasi' as FilterMode, label: 'Kelas / Verifikasi', value: counts.belumVerifikasi, tone: 'text-indigo-600 dark:text-indigo-400' },
          { id: 'all' as FilterMode, label: 'Total Peserta', value: counts.total, tone: 'text-slate-900 dark:text-white' },
        ].map((card) => (
          <button
            key={card.id}
            type="button"
            onClick={() => setFilterMode(card.id)}
            className={`text-left p-3.5 rounded-xl border transition ${
              filterMode === card.id
                ? 'border-[#0F684E] bg-emerald-50/70 dark:bg-emerald-950/50 ring-1 ring-[#0F684E]'
                : 'border-slate-200 dark:border-emerald-950 bg-white dark:bg-[#111C18] hover:border-slate-300'
            }`}
          >
            <p className="text-[11px] font-semibold text-slate-500 truncate">{card.label}</p>
            <p className={`font-mono-num text-xl font-bold mt-0.5 ${card.tone}`}>{card.value}</p>
          </button>
        ))}
      </div>

      {/* Template Mode & Batch Actions */}
      <div className="bg-white dark:bg-[#111C18] border border-slate-200 dark:border-emerald-950 rounded-2xl p-4 sm:p-5 space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setUseCustomTemplate(false)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                !useCustomTemplate
                  ? 'bg-[#0F684E] text-white'
                  : 'bg-slate-100 dark:bg-emerald-950/60 text-slate-600 dark:text-slate-300'
              }`}
            >
              Pesan Cerdas Otomatis (Sesuai Tahap)
            </button>
            <button
              type="button"
              onClick={() => setUseCustomTemplate(true)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                useCustomTemplate
                  ? 'bg-[#0F684E] text-white'
                  : 'bg-slate-100 dark:bg-emerald-950/60 text-slate-600 dark:text-slate-300'
              }`}
            >
              Ubah Template Pesan Manual
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleBatchPushHp}
              disabled={filteredApkActive.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-300 dark:border-emerald-800 bg-emerald-50/80 dark:bg-emerald-950/50 text-[#0F684E] dark:text-emerald-300 hover:bg-emerald-100/80 disabled:opacity-40 text-xs font-semibold transition"
            >
              <BellRing className="w-3.5 h-3.5" />
              Kirim Notif HP ({filteredApkActive.length} APK)
            </button>
            <button
              type="button"
              onClick={handleBatchInApp}
              disabled={filteredList.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0F684E] hover:bg-[#0B523D] disabled:opacity-40 text-white text-xs font-semibold"
            >
              <Bell className="w-3.5 h-3.5" />
              Kirim In-App Massal ({filteredList.length})
            </button>
            {batchEmailUrl && (
              <a
                href={batchEmailUrl}
                onClick={() =>
                  pushToast(
                    'info',
                    'Aplikasi Email Terbuka (BCC Massal)',
                    'Daftar alamat email peserta terfilter otomatis dimasukkan ke kolom BCC.'
                  )
                }
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-300 dark:border-blue-800 bg-blue-50/70 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 text-xs font-semibold hover:bg-blue-100/70"
              >
                <Mail className="w-3.5 h-3.5" />
                Email BCC Massal
              </a>
            )}
          </div>
        </div>

        {useCustomTemplate && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-emerald-950 text-xs">
            <div>
              <label className="block font-semibold mb-1">Subjek Email / Judul Notifikasi</label>
              <input
                type="text"
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-[#F8FAF9] dark:bg-[#0D1613]"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Variabel otomatis: <span className="font-mono-num">{'{nama}'}</span>,{' '}
                <span className="font-mono-num">{'{kua}'}</span>,{' '}
                <span className="font-mono-num">{'{tahap}'}</span>,{' '}
                <span className="font-mono-num">{'{tanggal_akad}'}</span>
              </p>
            </div>
            <div>
              <label className="block font-semibold mb-1">Isi Template WhatsApp &amp; Email</label>
              <textarea
                rows={3}
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-[#F8FAF9] dark:bg-[#0D1613]"
              />
            </div>
          </div>
        )}
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama peserta, username, nomor WA, email, atau KUA..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-white dark:bg-[#111C18] text-xs sm:text-sm outline-none focus:border-[#0F684E]"
          />
        </div>
        <select
          value={filterMode}
          onChange={(e) => setFilterMode(e.target.value as FilterMode)}
          aria-label="Filter kategori smart reminder"
          className="px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-white dark:bg-[#111C18] text-xs font-semibold"
        >
          <option value="need_action">Semua yang Perlu Pengingat ({counts.needAction})</option>
          <option value="apk_installed">Sudah Download APK ({counts.apkInstalled})</option>
          <option value="akad_dekat">Prioritas Akad ≤ 14 Hari ({counts.akadDekat})</option>
          <option value="belum_sinkron">Belum Sinkron Pasangan ({counts.belumSinkron})</option>
          <option value="belum_pretest">Belum Pretest</option>
          <option value="modul_berjalan">Sedang Belajar 5 Modul</option>
          <option value="belum_postest">Belum Postest</option>
          <option value="belum_ikm">Belum Survei IKM ({counts.belumIkm})</option>
          <option value="belum_verifikasi">Menunggu Kelas / Verifikasi ({counts.belumVerifikasi})</option>
          <option value="sudah_lulus">Sudah Lulus &amp; Bersertifikat</option>
          <option value="all">Semua Peserta ({counts.total})</option>
        </select>
      </div>

      {/* Reminder History Drawer */}
      {showHistory && (
        <div className="bg-white dark:bg-[#111C18] border border-slate-200 dark:border-emerald-950 rounded-2xl p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Riwayat Smart Reminder Terkirim ({scopedLogs.length})
            </h3>
            <button
              type="button"
              onClick={() => setShowHistory(false)}
              className="text-xs font-semibold text-[#0F684E] hover:underline"
            >
              Tutup
            </button>
          </div>
          {scopedLogs.length === 0 ? (
            <p className="text-xs text-slate-500 py-3 text-center">
              Belum ada pengingat WA/Email yang dikirim pada sesi ini.
            </p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-emerald-950 max-h-64 overflow-y-auto">
              {scopedLogs.slice(0, 25).map((log) => (
                <div key={log.id} className="py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                  <div className="min-w-0">
                    <span className="font-bold text-slate-900 dark:text-white">{log.pesertaNama}</span>{' '}
                    <span className="text-slate-500">({log.kua})</span> ·{' '}
                    <span className="font-semibold text-[#0F684E] dark:text-emerald-400">
                      {log.channel}
                    </span>
                    <p className="text-[11px] text-slate-500 truncate">{log.subject}</p>
                  </div>
                  <span className="font-mono-num text-[11px] text-slate-400 shrink-0">
                    {formatIndonesianDate(log.sentAt)} · {log.sentBy}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Participant Smart Reminder Table */}
      <div className="bg-white dark:bg-[#111C18] border border-slate-200 dark:border-emerald-950 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-[#F8FAF9] dark:bg-[#0D1613] border-b border-slate-200 dark:border-emerald-950 text-slate-600 dark:text-slate-300">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">Peserta &amp; Kontak</th>
                <th className="text-left px-4 py-3 font-semibold">Status &amp; Rekomendasi</th>
                <th className="text-left px-4 py-3 font-semibold">Jadwal Akad</th>
                <th className="text-right px-4 py-3 font-semibold">Aksi WA / Email / Notif HP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-emerald-950">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                    Tidak ada peserta yang cocok dengan filter Smart Reminder saat ini.
                  </td>
                </tr>
              ) : (
                filteredList.map((item) => {
                  const {
                    user,
                    classification,
                    daysToAkad,
                    lastLog,
                    hasWa,
                    hasEmail,
                    apkInstalled,
                    apkPushActive,
                  } = item;
                  const { subject, message } = resolveMessageForItem(item);
                  const waUrl = buildWhatsAppReminderUrl(user.noHp || '', message);
                  const emailUrl = buildEmailReminderUrl(user.email || '', subject, message);

                  const priorityBadgeClass =
                    classification.urgency === 'tinggi'
                      ? 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-900'
                      : classification.urgency === 'sedang'
                        ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-900'
                        : 'bg-emerald-50 dark:bg-emerald-950/40 text-[#0F684E] dark:text-emerald-300 border-emerald-200 dark:border-emerald-900';

                  return (
                    <tr key={user.id} className="hover:bg-slate-50/70 dark:hover:bg-emerald-950/20">
                      <td className="px-4 py-3 align-top">
                        <p className="font-bold text-slate-900 dark:text-white">{user.nama}</p>
                        <p className="text-[11px] text-[#0F684E] dark:text-emerald-400 font-medium">
                          {user.kua} · {normalizeVillageName(user.desaTempatNikah, user.kua)}
                        </p>
                        <p className="text-[11px] text-slate-500 font-mono-num mt-0.5">
                          WA: {user.noHp || 'Belum diisi'}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate max-w-[230px]">
                          Email: {user.email || 'Belum diisi'}
                        </p>
                        {apkInstalled && (
                          <p className="text-[10px] font-semibold text-[#0F684E] dark:text-emerald-400 inline-flex items-center gap-1 mt-1">
                            <Smartphone className="w-3 h-3" />
                            APK {user.appNotification?.devicePlatform || 'HP'} ·{' '}
                            {apkPushActive ? 'Notif HP Aktif' : 'Notif Dijeda'}
                          </p>
                        )}
                      </td>

                      <td className="px-4 py-3 align-top space-y-1">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded border text-[11px] font-bold ${priorityBadgeClass}`}
                        >
                          {classification.categoryLabel}
                        </span>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 max-w-xs leading-relaxed">
                          {classification.pendingSummary}
                        </p>
                        {lastLog && (
                          <p className="text-[10px] text-emerald-700 dark:text-emerald-400 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Terakhir diingatkan ({lastLog.channel}): {formatIndonesianDate(lastLog.sentAt)}
                          </p>
                        )}
                      </td>

                      <td className="px-4 py-3 align-top font-mono-num whitespace-nowrap">
                        <p className="text-slate-700 dark:text-slate-200">
                          {user.tanggalRencanaNikah
                            ? formatIndonesianDate(`${user.tanggalRencanaNikah}T00:00:00`)
                            : '—'}
                        </p>
                        {daysToAkad !== null && (
                          <p
                            className={`text-[11px] font-bold inline-flex items-center gap-1 mt-0.5 ${
                              daysToAkad <= 14 && daysToAkad >= 0
                                ? 'text-red-600 dark:text-red-400'
                                : 'text-slate-500'
                            }`}
                          >
                            <Clock className="w-3 h-3" />
                            {daysToAkad > 0
                              ? `H-${daysToAkad} hari`
                              : daysToAkad === 0
                                ? 'Hari ini'
                                : 'Terlewati'}
                          </p>
                        )}
                      </td>

                      <td className="px-4 py-3 align-top text-right">
                        <div className="inline-flex flex-wrap items-center justify-end gap-1.5">
                          {hasWa && waUrl ? (
                            <a
                              href={waUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => {
                                logSmartReminder({
                                  pesertaUsername: user.username,
                                  pesertaNama: user.nama,
                                  kua: user.kua,
                                  channel: 'WhatsApp',
                                  subject,
                                  message,
                                  alsoSendInApp: true,
                                });
                                pushToast(
                                  'success',
                                  `WhatsApp Pengingat Siap (${user.nama})`,
                                  'Pesan juga tercatat di riwayat & kotak masuk peserta.'
                                );
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#16A34A] hover:bg-[#15803D] text-white font-semibold transition"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              WhatsApp
                            </a>
                          ) : (
                            <span className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-emerald-950/50 text-slate-400">
                              No WA Kosong
                            </span>
                          )}

                          {hasEmail && emailUrl ? (
                            <a
                              href={emailUrl}
                              onClick={() => {
                                logSmartReminder({
                                  pesertaUsername: user.username,
                                  pesertaNama: user.nama,
                                  kua: user.kua,
                                  channel: 'Email',
                                  subject,
                                  message,
                                  alsoSendInApp: true,
                                });
                                pushToast(
                                  'success',
                                  `Email Pengingat Dibuka (${user.nama})`,
                                  `Tujuan: ${user.email}`
                                );
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition"
                            >
                              <Mail className="w-3.5 h-3.5" />
                              Email
                            </a>
                          ) : (
                            <span className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-emerald-950/50 text-slate-400">
                              Email Kosong
                            </span>
                          )}

                          <button
                            type="button"
                            disabled={!apkPushActive}
                            onClick={() => {
                              const pushPreview = useCustomTemplate
                                ? { title: subject, body: message }
                                : renderMobilePushPreview(activeMobilePolicy, user, classification);
                              sendMobilePushReminder({
                                scopeKua: effectiveKua,
                                targets: [
                                  {
                                    username: user.username,
                                    nama: user.nama,
                                    kua: user.kua,
                                    subject: pushPreview.title,
                                    message: pushPreview.body,
                                  },
                                ],
                              });
                            }}
                            title={
                              apkPushActive
                                ? 'Kirim Notifikasi HP (APK Terpasang)'
                                : apkInstalled
                                  ? 'Notifikasi HP peserta sedang dijeda (atur via Atur Notif HP)'
                                  : 'Peserta belum memasang Aplikasi/APK SAMAWA'
                            }
                            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-semibold transition ${
                              apkPushActive
                                ? 'bg-[#0F684E] hover:bg-[#0B523D] text-white'
                                : 'bg-slate-100 dark:bg-emerald-950/50 text-slate-400 cursor-not-allowed'
                            }`}
                          >
                            <Smartphone className="w-3 h-3" />
                            Notif HP
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              logSmartReminder({
                                pesertaUsername: user.username,
                                pesertaNama: user.nama,
                                kua: user.kua,
                                channel: 'InApp',
                                subject,
                                message,
                              });
                              pushToast('success', `Pengingat Portal Terkirim ke ${user.nama}`);
                            }}
                            title="Kirim ke Kotak Masuk Portal Peserta"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-emerald-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-emerald-950 font-semibold"
                          >
                            <Send className="w-3 h-3" />
                            In-App
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard?.writeText(message).catch(() => {});
                              pushToast('info', 'Teks Pengingat Disalin', user.nama);
                            }}
                            title="Salin teks pengingat"
                            aria-label={`Salin teks pengingat ${user.nama}`}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-emerald-900 text-slate-500 hover:bg-slate-100 dark:hover:bg-emerald-950"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pengaturan Notifikasi HP (Peserta Pengguna APK) Modal */}
      <MobileNotifConfigModal
        open={mobileNotifModalOpen}
        onClose={() => setMobileNotifModalOpen(false)}
        scopeMode={scopeMode}
        kuaName={kuaName}
        initialScopeKua={effectiveKua}
        roleTitle={roleTitle}
      />
    </div>
  );
};
