import React, { useEffect, useMemo, useState } from 'react';
import {
  Bell,
  BellOff,
  BellRing,
  CheckCircle2,
  Clock,
  Save,
  Search,
  Send,
  ShieldCheck,
  Smartphone,
  Volume2,
} from 'lucide-react';
import { LIST_16_KUA } from '../data/jeparaData';
import { useBimwin } from '../store/useBimwinStore';
import { MobileNotifFrequency, MobileNotifPolicy, MobileNotifTriggers } from '../types/bimwin';
import { formatIndonesianDate, normalizeVillageName } from '../utils/bimwinLogic';
import {
  classifyParticipantReminder,
  filterApkNotifRecipients,
  isWithinQuietHours,
  renderMobilePushPreview,
  resolveMobileNotifPolicy,
} from '../utils/smartReminder';
import { ModalDialog } from './UiPrimitives';

interface MobileNotifConfigModalProps {
  open: boolean;
  onClose: () => void;
  scopeMode: 'all' | 'kua';
  kuaName?: string;
  initialScopeKua?: string;
  roleTitle: string;
}

type ModalSubTab = 'pengaturan' | 'peserta';
type DeviceFilter = 'apk_only' | 'active_only' | 'paused_only' | 'not_installed' | 'all';

const TRIGGER_ITEMS: Array<{
  key: keyof MobileNotifTriggers;
  label: string;
  desc: string;
}> = [
  {
    key: 'belumSinkron',
    label: 'Belum Sinkron Pasangan (Langkah 1)',
    desc: 'Mengingatkan Catin yang belum menautkan akun pasangan.',
  },
  {
    key: 'moocTertunda',
    label: 'MOOC / Pretest / Postest Tertunda (Langkah 2–4)',
    desc: 'Pengingat otomatis untuk melanjutkan 5 modul video & kuis.',
  },
  {
    key: 'surveiIkm',
    label: 'Belum Mengisi Survei IKM (Langkah 6)',
    desc: 'Membuka akses pemilihan kelas setelah MOOC tuntas.',
  },
  {
    key: 'jadwalKelas',
    label: 'Pengingat Jadwal Kelas Online / Offline (H-1)',
    desc: 'Notifikasi HP satu hari sebelum jadwal kelas BIMWIN KUA.',
  },
  {
    key: 'akadMendekat',
    label: 'Prioritas Akad Nikah Mendekat (H-14, H-7, H-3)',
    desc: 'Pengingat prioritas bagi Catin yang jadwal akadnya kurang dari 14 hari.',
  },
  {
    key: 'sertifikatTerbit',
    label: 'Sertifikat & 4 Dokumen Resmi Terbit (Langkah 8)',
    desc: 'Notifikasi instan saat Fasilitator mengesahkan kelulusan peserta.',
  },
];

const FREQUENCY_OPTIONS: Array<{ value: MobileNotifFrequency; label: string }> = [
  { value: 'otomatis_tahap', label: 'Otomatis Sesuai Tahap Tertunda' },
  { value: 'harian', label: 'Setiap Hari (Harian)' },
  { value: 'dua_hari', label: 'Setiap 2 Hari Sekali' },
  { value: 'mingguan', label: 'Setiap Minggu (Mingguan)' },
];

export const MobileNotifConfigModal: React.FC<MobileNotifConfigModalProps> = ({
  open,
  onClose,
  scopeMode,
  kuaName,
  initialScopeKua,
  roleTitle,
}) => {
  const {
    data,
    saveMobileNotifPolicy,
    toggleParticipantMobileNotif,
    sendMobilePushReminder,
    pushToast,
  } = useBimwin();

  const lockedKua = kuaName || 'KUA Jepara';
  const [activeScope, setActiveScope] = useState<string>(
    scopeMode === 'all' ? initialScopeKua || 'ALL' : lockedKua
  );
  const [subTab, setSubTab] = useState<ModalSubTab>('pengaturan');
  const [deviceFilter, setDeviceFilter] = useState<DeviceFilter>('apk_only');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!open) return;
    setActiveScope(scopeMode === 'all' ? initialScopeKua || 'ALL' : lockedKua);
    setSubTab('pengaturan');
    setSearch('');
  }, [open, scopeMode, initialScopeKua, lockedKua]);

  const effectiveScope = scopeMode === 'all' ? activeScope : lockedKua;
  const savedPolicy = useMemo(
    () => resolveMobileNotifPolicy(data.mobileNotifPolicies, effectiveScope),
    [data.mobileNotifPolicies, effectiveScope]
  );

  const [draftPolicy, setDraftPolicy] = useState<MobileNotifPolicy>(savedPolicy);

  useEffect(() => {
    setDraftPolicy(savedPolicy);
  }, [savedPolicy]);

  const scopedPeserta = useMemo(() => {
    return data.users
      .filter(
        (u) =>
          u.role === 'Peserta' &&
          (effectiveScope === 'ALL' || u.kua === effectiveScope)
      )
      .sort((a, b) => a.nama.localeCompare(b.nama));
  }, [data.users, effectiveScope]);

  const stats = useMemo(() => {
    const installed = filterApkNotifRecipients(scopedPeserta, effectiveScope, {
      onlyPushEnabled: false,
    });
    const active = filterApkNotifRecipients(scopedPeserta, effectiveScope, {
      onlyPushEnabled: true,
    });
    return {
      total: scopedPeserta.length,
      installedCount: installed.length,
      activeCount: active.length,
      pausedCount: installed.length - active.length,
      notInstalledCount: scopedPeserta.length - installed.length,
    };
  }, [scopedPeserta, effectiveScope]);

  const filteredDevices = useMemo(() => {
    const q = search.trim().toLowerCase();
    return scopedPeserta.filter((u) => {
      const matchQuery =
        !q ||
        u.nama.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        u.kua.toLowerCase().includes(q) ||
        (u.noHp || '').toLowerCase().includes(q);
      if (!matchQuery) return false;

      const installed = Boolean(u.appNotification?.apkInstalled);
      const active = Boolean(
        installed && u.appNotification?.pushEnabled && !u.appNotification?.mutedByOfficer
      );

      if (deviceFilter === 'apk_only') return installed;
      if (deviceFilter === 'active_only') return active;
      if (deviceFilter === 'paused_only') return installed && !active;
      if (deviceFilter === 'not_installed') return !installed;
      return true;
    });
  }, [scopedPeserta, search, deviceFilter]);

  const samplePreviewUser = useMemo(() => {
    const activeApk = filterApkNotifRecipients(scopedPeserta, effectiveScope, {
      onlyPushEnabled: true,
    });
    return activeApk[0] || scopedPeserta[0] || null;
  }, [scopedPeserta, effectiveScope]);

  const previewData = useMemo(() => {
    if (!samplePreviewUser) {
      return {
        title: draftPolicy.customTitleTemplate,
        body: draftPolicy.customBodyTemplate,
      };
    }
    const profile = classifyParticipantReminder(samplePreviewUser, data.modules.length);
    return renderMobilePushPreview(draftPolicy, samplePreviewUser, profile);
  }, [draftPolicy, samplePreviewUser, data.modules.length]);

  const scheduleInsideQuiet = isWithinQuietHours(
    draftPolicy.scheduleTime,
    draftPolicy.quietHoursStart,
    draftPolicy.quietHoursEnd
  );

  const scopeTitle =
    effectiveScope === 'ALL'
      ? 'Semua Peserta (16 KUA Kab. Jepara)'
      : `Peserta Wilayah ${effectiveScope}`;

  const handleSavePolicy = () => {
    saveMobileNotifPolicy(effectiveScope, draftPolicy);
  };

  const handleSendBatchPush = () => {
    const eligible = filterApkNotifRecipients(scopedPeserta, effectiveScope, {
      onlyPushEnabled: true,
    });
    if (eligible.length === 0) {
      pushToast(
        'info',
        'Tidak Ada Penerima APK Aktif',
        'Pastikan terdapat peserta yang sudah memasang APK dan notifikasi HP-nya aktif.'
      );
      return;
    }
    const targets = eligible.map((u) => {
      const profile = classifyParticipantReminder(u, data.modules.length);
      const rendered = renderMobilePushPreview(draftPolicy, u, profile);
      return {
        username: u.username,
        nama: u.nama,
        kua: u.kua,
        subject: rendered.title,
        message: rendered.body,
      };
    });
    sendMobilePushReminder({
      scopeKua: effectiveScope,
      targets,
    });
  };

  const handleSendSinglePush = (userId: string) => {
    const targetUser = scopedPeserta.find((u) => u.id === userId);
    if (!targetUser) return;
    const profile = classifyParticipantReminder(targetUser, data.modules.length);
    const rendered = renderMobilePushPreview(draftPolicy, targetUser, profile);
    sendMobilePushReminder({
      scopeKua: effectiveScope,
      targets: [
        {
          username: targetUser.username,
          nama: targetUser.nama,
          kua: targetUser.kua,
          subject: rendered.title,
          message: rendered.body,
        },
      ],
    });
  };

  return (
    <ModalDialog
      open={open}
      onClose={onClose}
      title="Pengaturan Notifikasi HP (Peserta Pengguna APK)"
      subtitle={`${roleTitle} · Cakupan: ${scopeTitle}`}
      maxWidth="4xl"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-emerald-950"
          >
            Tutup
          </button>
          <button
            type="button"
            onClick={handleSendBatchPush}
            disabled={stats.activeCount === 0}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 text-[#0F684E] dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-950 disabled:opacity-40 text-xs font-semibold transition"
          >
            <Send className="w-3.5 h-3.5" />
            Kirim Notif HP Massal ({stats.activeCount} APK Aktif)
          </button>
          <button
            type="button"
            onClick={handleSavePolicy}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0F684E] hover:bg-[#0B523D] text-white text-xs font-semibold transition"
          >
            <Save className="w-3.5 h-3.5" />
            Simpan Pengaturan Notif HP
          </button>
        </>
      }
    >
      <div className="space-y-5">
        {/* Scope Bar + KPI Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-[#F8FAF9] dark:bg-[#0D1613] border border-slate-200 dark:border-emerald-950">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-100/80 dark:bg-emerald-950 text-[#0F684E] dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                {scopeMode === 'all'
                  ? 'Wewenang Admin Kemenag — Seluruh Peserta Kab. Jepara'
                  : `Wewenang Wilayah Kecamatan — ${lockedKua}`}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {scopeMode === 'all'
                  ? 'Atur notifikasi HP secara serentak untuk seluruh 16 KUA atau pilih KUA tertentu.'
                  : `Pengaturan dan pengiriman notifikasi HP dibatasi khusus untuk peserta di ${lockedKua}.`}
              </p>
            </div>
          </div>

          {scopeMode === 'all' ? (
            <select
              value={activeScope}
              onChange={(e) => setActiveScope(e.target.value)}
              aria-label="Pilih cakupan wilayah notifikasi HP"
              className="px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-white dark:bg-[#111C18] text-xs font-semibold shrink-0"
            >
              <option value="ALL">Semua 16 KUA (Seluruh Peserta)</option>
              {LIST_16_KUA.map((kua) => (
                <option key={kua} value={kua}>
                  {kua}
                </option>
              ))}
            </select>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-900 text-xs font-bold text-[#0F684E] dark:text-emerald-300 shrink-0">
              <ShieldCheck className="w-3.5 h-3.5" />
              {lockedKua}
            </span>
          )}
        </div>

        {/* 4 Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-3 rounded-xl bg-white dark:bg-[#111C18] border border-slate-200 dark:border-emerald-950">
            <p className="text-[11px] font-semibold text-slate-500">Total Peserta Wilayah</p>
            <p className="font-mono-num text-xl font-bold text-slate-900 dark:text-white mt-0.5">
              {stats.total}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-white dark:bg-[#111C18] border border-slate-200 dark:border-emerald-950">
            <p className="text-[11px] font-semibold text-slate-500">Sudah Download APK</p>
            <p className="font-mono-num text-xl font-bold text-[#0F684E] dark:text-emerald-400 mt-0.5">
              {stats.installedCount}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-white dark:bg-[#111C18] border border-slate-200 dark:border-emerald-950">
            <p className="text-[11px] font-semibold text-slate-500">Notif HP Aktif</p>
            <p className="font-mono-num text-xl font-bold text-blue-600 dark:text-blue-400 mt-0.5">
              {stats.activeCount}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-white dark:bg-[#111C18] border border-slate-200 dark:border-emerald-950">
            <p className="text-[11px] font-semibold text-slate-500">Belum Pasang APK</p>
            <p className="font-mono-num text-xl font-bold text-amber-600 dark:text-amber-400 mt-0.5">
              {stats.notInstalledCount}
            </p>
          </div>
        </div>

        {/* Modal Sub-tabs */}
        <div
          role="tablist"
          aria-label="Bagian pengaturan notifikasi HP"
          className="flex items-center gap-2 border-b border-slate-200 dark:border-emerald-950 pb-2.5"
        >
          <button
            type="button"
            role="tab"
            aria-selected={subTab === 'pengaturan'}
            onClick={() => setSubTab('pengaturan')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition ${
              subTab === 'pengaturan'
                ? 'bg-[#0F684E] text-white'
                : 'bg-slate-100 dark:bg-emerald-950/50 text-slate-600 dark:text-slate-300 hover:bg-slate-200/70'
            }`}
          >
            <BellRing className="w-3.5 h-3.5" />
            Aturan &amp; Jadwal Notif HP
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={subTab === 'peserta'}
            onClick={() => setSubTab('peserta')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition ${
              subTab === 'peserta'
                ? 'bg-[#0F684E] text-white'
                : 'bg-slate-100 dark:bg-emerald-950/50 text-slate-600 dark:text-slate-300 hover:bg-slate-200/70'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            Daftar Peserta Pengguna APK ({stats.installedCount})
          </button>
        </div>

        {subTab === 'pengaturan' ? (
          <div className="space-y-4">
            {/* Master Enable Switch */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-slate-200 dark:border-emerald-950 bg-white dark:bg-[#111C18]">
              <div className="space-y-0.5">
                <p className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  {draftPolicy.enabled ? (
                    <Bell className="w-4 h-4 text-[#0F684E]" />
                  ) : (
                    <BellOff className="w-4 h-4 text-slate-400" />
                  )}
                  Status Layanan Notifikasi HP (Push APK)
                </p>
                <p className="text-xs text-slate-500">
                  {draftPolicy.enabled
                    ? `Aktif — Notifikasi pengingat dikirim ke HP peserta pengguna APK pada cakupan ${scopeTitle}.`
                    : 'Nonaktif — Pengiriman notifikasi HP otomatis sedang dijeda untuk wilayah ini.'}
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={draftPolicy.enabled}
                onClick={() =>
                  setDraftPolicy((prev) => ({ ...prev, enabled: !prev.enabled }))
                }
                className={`px-4 py-2 rounded-lg text-xs font-bold transition shrink-0 ${
                  draftPolicy.enabled
                    ? 'bg-[#0F684E] text-white hover:bg-[#0B523D]'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300'
                }`}
              >
                {draftPolicy.enabled ? 'Notif HP: AKTIF' : 'Notif HP: NONAKTIF'}
              </button>
            </div>

            {/* Schedule & Quiet Hours */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="min-w-0">
                <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
                  Frekuensi Pengingat
                </label>
                <select
                  value={draftPolicy.frequency}
                  onChange={(e) =>
                    setDraftPolicy((prev) => ({
                      ...prev,
                      frequency: e.target.value as MobileNotifFrequency,
                    }))
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-[#F8FAF9] dark:bg-[#0D1613]"
                >
                  {FREQUENCY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="min-w-0">
                <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
                  Jam Kirim Utama (WIB)
                </label>
                <input
                  type="time"
                  value={draftPolicy.scheduleTime}
                  onChange={(e) =>
                    setDraftPolicy((prev) => ({ ...prev, scheduleTime: e.target.value }))
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-[#F8FAF9] dark:bg-[#0D1613] font-mono-num"
                />
              </div>

              <div className="min-w-0">
                <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
                  Jam Tenang (Mulai – Selesai)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    aria-label="Jam tenang mulai"
                    value={draftPolicy.quietHoursStart}
                    onChange={(e) =>
                      setDraftPolicy((prev) => ({ ...prev, quietHoursStart: e.target.value }))
                    }
                    className="min-w-0 flex-1 px-2.5 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-[#F8FAF9] dark:bg-[#0D1613] font-mono-num"
                  />
                  <span className="text-slate-400 shrink-0">–</span>
                  <input
                    type="time"
                    aria-label="Jam tenang selesai"
                    value={draftPolicy.quietHoursEnd}
                    onChange={(e) =>
                      setDraftPolicy((prev) => ({ ...prev, quietHoursEnd: e.target.value }))
                    }
                    className="min-w-0 flex-1 px-2.5 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-[#F8FAF9] dark:bg-[#0D1613] font-mono-num"
                  />
                </div>
              </div>

              <div className="min-w-0 flex flex-col justify-end">
                <span className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
                  Dering &amp; Getar Perangkat
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setDraftPolicy((prev) => ({
                      ...prev,
                      soundAndVibrate: !prev.soundAndVibrate,
                    }))
                  }
                  className={`w-full px-3 py-2 rounded-lg border text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition ${
                    draftPolicy.soundAndVibrate
                      ? 'border-emerald-300 bg-emerald-50/70 dark:bg-emerald-950/50 text-[#0F684E] dark:text-emerald-300'
                      : 'border-slate-300 dark:border-emerald-900 bg-white dark:bg-[#111C18] text-slate-500'
                  }`}
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  {draftPolicy.soundAndVibrate ? 'Suara & Getar: Aktif' : 'Mode Senyap'}
                </button>
              </div>
            </div>

            {scheduleInsideQuiet && (
              <p className="text-[11px] text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 rounded-lg px-3 py-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 shrink-0" />
                Jam kirim utama ({draftPolicy.scheduleTime} WIB) berada di dalam rentang Jam Tenang (
                {draftPolicy.quietHoursStart}–{draftPolicy.quietHoursEnd} WIB). Disarankan memilih jam siang/pagi agar tidak mengganggu peserta.
              </p>
            )}

            {/* 6 Triggers */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Pemicu Otomatis Notifikasi HP Peserta
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {TRIGGER_ITEMS.map((item) => {
                  const checked = draftPolicy.triggers[item.key];
                  return (
                    <label
                      key={item.key}
                      className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition ${
                        checked
                          ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/30'
                          : 'border-slate-200 dark:border-emerald-950 bg-white dark:bg-[#111C18]'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) =>
                          setDraftPolicy((prev) => ({
                            ...prev,
                            triggers: {
                              ...prev.triggers,
                              [item.key]: e.target.checked,
                            },
                          }))
                        }
                        className="mt-0.5 rounded accent-[#0F684E]"
                      />
                      <div className="min-w-0">
                        <span className="block text-xs font-bold text-slate-900 dark:text-white">
                          {item.label}
                        </span>
                        <span className="block text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {item.desc}
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Template + Live Mobile Push Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-1">
              <div className="lg:col-span-7 space-y-2.5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
                    Template Judul Notifikasi HP
                  </label>
                  <input
                    type="text"
                    value={draftPolicy.customTitleTemplate}
                    onChange={(e) =>
                      setDraftPolicy((prev) => ({
                        ...prev,
                        customTitleTemplate: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-[#F8FAF9] dark:bg-[#0D1613]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
                    Template Isi Pesan Notifikasi HP
                  </label>
                  <textarea
                    rows={3}
                    value={draftPolicy.customBodyTemplate}
                    onChange={(e) =>
                      setDraftPolicy((prev) => ({
                        ...prev,
                        customBodyTemplate: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-[#F8FAF9] dark:bg-[#0D1613]"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Variabel otomatis: <span className="font-mono-num">{'{nama}'}</span>,{' '}
                    <span className="font-mono-num">{'{kua}'}</span>,{' '}
                    <span className="font-mono-num">{'{tahap}'}</span>,{' '}
                    <span className="font-mono-num">{'{progres}'}</span>,{' '}
                    <span className="font-mono-num">{'{tanggal_akad}'}</span>
                  </p>
                </div>
              </div>

              {/* Live Phone Banner Preview */}
              <div className="lg:col-span-5">
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                  Pratinjau Tampilan di Layar HP Peserta
                </p>
                <div className="rounded-2xl bg-slate-900 p-4 text-white border border-slate-700 space-y-2.5 shadow-sm">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono-num">
                    <span>{draftPolicy.scheduleTime || '08:00'} WIB</span>
                    <span>SAMAWA APK · {draftPolicy.soundAndVibrate ? 'Suara + Getar' : 'Senyap'}</span>
                  </div>
                  <div className="rounded-xl bg-white/95 text-slate-900 p-3 space-y-1 shadow-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#0F684E]">
                        <img
                          src="/pwa-192x192.png"
                          alt="SAMAWA"
                          className="w-5 h-5 object-contain"
                        />
                        SAMAWA Kemenag Jepara
                      </span>
                      <span className="text-[10px] text-slate-400">baru saja</span>
                    </div>
                    <p className="text-xs font-bold text-slate-900 leading-snug">
                      {previewData.title}
                    </p>
                    <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-3">
                      {previewData.body}
                    </p>
                  </div>
                  {savedPolicy.updatedAt && (
                    <p className="text-[10px] text-emerald-300/90">
                      Terakhir diperbarui: {formatIndonesianDate(savedPolicy.updatedAt)} oleh{' '}
                      {savedPolicy.updatedBy || roleTitle}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3.5">
            {/* Search & Device Status Filter */}
            <div className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari nama peserta, username, atau KUA..."
                  className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-white dark:bg-[#111C18] text-xs outline-none focus:border-[#0F684E]"
                />
              </div>
              <select
                value={deviceFilter}
                onChange={(e) => setDeviceFilter(e.target.value as DeviceFilter)}
                aria-label="Filter status aplikasi peserta"
                className="px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-white dark:bg-[#111C18] text-xs font-semibold"
              >
                <option value="apk_only">Sudah Download APK ({stats.installedCount})</option>
                <option value="active_only">Notif HP Aktif ({stats.activeCount})</option>
                <option value="paused_only">Notif HP Dijeda ({stats.pausedCount})</option>
                <option value="not_installed">Belum Pasang APK ({stats.notInstalledCount})</option>
                <option value="all">Semua Peserta Wilayah ({stats.total})</option>
              </select>
            </div>

            {/* Participant APK Device List */}
            <div className="border border-slate-200 dark:border-emerald-950 rounded-xl overflow-hidden">
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-200 dark:divide-emerald-950">
                {filteredDevices.length === 0 ? (
                  <p className="px-4 py-8 text-center text-xs text-slate-500">
                    Tidak ada peserta yang sesuai dengan filter perangkat saat ini.
                  </p>
                ) : (
                  filteredDevices.map((u) => {
                    const installed = Boolean(u.appNotification?.apkInstalled);
                    const pushOn = Boolean(
                      installed &&
                        u.appNotification?.pushEnabled &&
                        !u.appNotification?.mutedByOfficer
                    );
                    const profile = classifyParticipantReminder(u, data.modules.length);

                    return (
                      <div
                        key={u.id}
                        className="px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#111C18] hover:bg-slate-50/70 dark:hover:bg-emerald-950/20"
                      >
                        <div className="min-w-0 space-y-0.5">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <p className="text-xs font-bold text-slate-900 dark:text-white">
                              {u.nama}
                            </p>
                            {installed ? (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-900 text-[10px] font-bold text-[#0F684E] dark:text-emerald-300">
                                <Smartphone className="w-2.5 h-2.5" />
                                APK {u.appNotification?.devicePlatform || 'HP'}
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-500">
                                Belum Download APK
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500">
                            {u.kua} · {normalizeVillageName(u.desaTempatNikah, u.kua)} ·{' '}
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                              {profile.categoryLabel}
                            </span>
                          </p>
                          {u.appNotification?.lastPushSentAt && (
                            <p className="text-[10px] text-emerald-700 dark:text-emerald-400 inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              Notif HP terakhir: {formatIndonesianDate(u.appNotification.lastPushSentAt)}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {installed ? (
                            <>
                              <button
                                type="button"
                                role="switch"
                                aria-checked={pushOn}
                                aria-label={`Atur notifikasi HP ${u.nama}`}
                                onClick={() => toggleParticipantMobileNotif(u.id, !pushOn)}
                                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition ${
                                  pushOn
                                    ? 'border-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 text-[#0F684E] dark:text-emerald-300'
                                    : 'border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-500'
                                }`}
                              >
                                {pushOn ? 'Notif Aktif' : 'Dijeda'}
                              </button>
                              <button
                                type="button"
                                disabled={!pushOn}
                                onClick={() => handleSendSinglePush(u.id)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#0F684E] hover:bg-[#0B523D] disabled:opacity-40 text-white text-[11px] font-semibold transition"
                              >
                                <Send className="w-3 h-3" />
                                Kirim Notif HP
                              </button>
                            </>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">
                              Arahkan pasang APK dahulu
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </ModalDialog>
  );
};
