import React, { useMemo, useState } from 'react';
import {
  Bell,
  Calendar,
  CheckCheck,
  CheckCircle2,
  Eye,
  MessageSquare,
  Plus,
  Printer,
  QrCode,
  ScanLine,
  Search,
  Trash2,
  UserCog,
  Users,
} from 'lucide-react';
import { FASILITATOR_QUICK_NOTES } from '../data/jeparaData';
import { useBimwin } from '../store/useBimwinStore';
import { AttendanceStatus, BimwinClassSchedule, BimwinUser } from '../types/bimwin';
import {
  canFasilitatorVerify,
  evaluatePesertaStep,
  formatIndonesianDate,
  maskNik,
  normalizeVillageName,
} from '../utils/bimwinLogic';
import { AccountSecurityCard } from './AccountSecurityCard';
import { AttendanceSheetModal } from './OfficialDocuments';
import { QRScannerModal } from './QRScannerModal';
import { ModalDialog } from './UiPrimitives';
import { NavItem, WorkspaceShell } from './WorkspaceShell';

export const FasilitatorDashboard: React.FC = () => {
  const {
    data,
    currentUser,
    verifyPesertaByFasilitator,
    batchVerifyMoocGraduates,
    verifyAttendanceByCode,
    createClassSchedule,
    deleteClassSchedule,
    verifyClassAttendee,
    replyConsultation,
    sendReminderNotification,
    updateOwnProfile,
    requestConfirm,
  } = useBimwin();

  const [activeTab, setActiveTab] = useState('binaan');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'ready' | 'verified' | 'progress'>('all');

  // Local editable row state for notes & attendance
  const [rowAttendance, setRowAttendance] = useState<Record<string, AttendanceStatus>>({});
  const [rowNotes, setRowNotes] = useState<Record<string, string>>({});

  // Code attendance verification modal
  const [absenModalOpen, setAbsenModalOpen] = useState(false);
  const [absenCode, setAbsenCode] = useState('');
  const [absenUser, setAbsenUser] = useState('');
  const [absenErr, setAbsenErr] = useState('');

  // Class schedule creation modal & printable sheet
  const [newClassOpen, setNewClassOpen] = useState(false);
  const [sheetClass, setSheetClass] = useState<BimwinClassSchedule | null>(null);
  const [qrScanTarget, setQrScanTarget] = useState<'absen' | 'peserta' | null>(null);
  const [classForm, setClassForm] = useState({
    tipe: 'Offline' as 'Online' | 'Offline',
    judul: '',
    tanggal: '2026-04-28',
    waktu: '08.30 – 11.30 WIB',
    lokasiAtauLink: '',
    narasumber: currentUser?.nama || '',
    kuota: 30,
  });

  // Consultation reply draft
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});

  // Reminder form
  const [remTitle, setRemTitle] = useState('');
  const [remMsg, setRemMsg] = useState('');
  const [remUser, setRemUser] = useState('');

  // Peserta detail inspection
  const [detailPeserta, setDetailPeserta] = useState<BimwinUser | null>(null);

  if (!currentUser) return null;

  const myPeserta = useMemo(
    () => data.users.filter((u) => u.role === 'Peserta' && u.kua === currentUser.kua),
    [data.users, currentUser.kua]
  );

  const filteredPeserta = useMemo(() => {
    const q = search.trim().toLowerCase();
    return myPeserta.filter((u) => {
      const matchQ =
        !q ||
        u.nama.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        (u.desaTempatNikah || '').toLowerCase().includes(q);
      if (!matchQ) return false;
      const moocReady = canFasilitatorVerify(u, data.modules.length);
      const verified = Boolean(u.progress?.verifikasiFasilitator);
      if (statusFilter === 'ready') return moocReady && !verified;
      if (statusFilter === 'verified') return verified;
      if (statusFilter === 'progress') return !moocReady;
      return true;
    });
  }, [myPeserta, search, statusFilter, data.modules.length]);

  const myClasses = useMemo(
    () => data.classes.filter((c) => c.kua === currentUser.kua),
    [data.classes, currentUser.kua]
  );

  const myConsults = useMemo(
    () => data.consultations.filter((c) => c.kua === currentUser.kua),
    [data.consultations, currentUser.kua]
  );

  const pendingConsults = myConsults.filter((c) => c.status === 'Menunggu').length;
  const readyToVerifyCount = myPeserta.filter(
    (u) => canFasilitatorVerify(u, data.modules.length) && !u.progress?.verifikasiFasilitator
  ).length;

  const navItems: NavItem[] = [
    { id: 'binaan', label: 'Peserta Binaan', icon: Users, badge: readyToVerifyCount || undefined, section: 'Layanan KUA' },
    { id: 'kelas', label: 'Jadwal Kelas & Absensi', icon: Calendar, badge: myClasses.length, section: 'Layanan KUA' },
    { id: 'konsultasi', label: 'Konsultasi & Mediasi', icon: MessageSquare, badge: pendingConsults || undefined, section: 'Layanan KUA' },
    { id: 'pengingat', label: 'Kirim Pengingat Peserta', icon: Bell, section: 'Komunikasi' },
    { id: 'akun', label: 'Profil & Keamanan Akun', icon: UserCog, section: 'Akun Saya' },
  ];

  return (
    <WorkspaceShell
      navItems={navItems}
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      roleLabel={`Fasilitator · ${currentUser.kua}`}
    >
      {/* TAB 1: PESERTA BINAAN */}
      {activeTab === 'binaan' && (
        <div className="space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-semibold">
                Verifikasi Peserta Binaan — {currentUser.kua}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Total binaan: <strong className="font-mono-num">{myPeserta.length}</strong> · Siap
                disahkan: <strong className="font-mono-num text-[#0F684E]">{readyToVerifyCount}</strong>
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setAbsenModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-white dark:bg-[#111C18] text-xs font-semibold hover:bg-slate-50 dark:hover:bg-emerald-950/60"
              >
                <QrCode className="w-3.5 h-3.5 text-[#0F684E]" />
                Verifikasi Kode Absensi
              </button>
              <button
                type="button"
                onClick={() => batchVerifyMoocGraduates(currentUser.kua)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0F684E] hover:bg-[#0B523D] text-white text-xs font-semibold"
              >
                <CheckCheck className="w-4 h-4" />
                Sahkan Semua Tuntas MOOC ({readyToVerifyCount})
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama, username, atau desa..."
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-white dark:bg-[#111C18] text-xs sm:text-sm outline-none focus:border-[#0F684E]"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(
                [
                  { id: 'all', label: 'Semua' },
                  { id: 'ready', label: 'Siap Disahkan' },
                  { id: 'verified', label: 'Terverifikasi' },
                  { id: 'progress', label: 'Berjalan' },
                ] as const
              ).map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setStatusFilter(f.id)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition ${
                    statusFilter === f.id
                      ? 'bg-[#0F684E] text-white'
                      : 'bg-white dark:bg-[#111C18] border border-slate-200 dark:border-emerald-950 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-[#111C18] border border-slate-200 dark:border-emerald-950 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-[#F8FAF9] dark:bg-[#0D1613] border-b border-slate-200 dark:border-emerald-950 text-slate-600 dark:text-slate-300">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold">Peserta &amp; Pasangan</th>
                    <th className="text-left px-4 py-3 font-semibold">Progres MOOC</th>
                    <th className="text-left px-4 py-3 font-semibold">Kehadiran Kelas</th>
                    <th className="text-left px-4 py-3 font-semibold">Catatan Fasilitator</th>
                    <th className="text-right px-4 py-3 font-semibold">Pengesahan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-emerald-950">
                  {filteredPeserta.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                        Tidak ada peserta binaan yang sesuai filter.
                      </td>
                    </tr>
                  ) : (
                    filteredPeserta.map((u) => {
                      const step = evaluatePesertaStep(u, data.modules.length);
                      const moocReady = canFasilitatorVerify(u, data.modules.length);
                      const verified = Boolean(u.progress?.verifikasiFasilitator);
                      const currentAttend =
                        rowAttendance[u.id] ?? u.progress?.kehadiranKelas ?? 'Belum Hadir';
                      const currentNote =
                        rowNotes[u.id] ?? u.progress?.catatanFasilitator ?? '';

                      return (
                        <tr key={u.id} className="hover:bg-slate-50/70 dark:hover:bg-emerald-950/20">
                          <td className="px-4 py-3 align-top">
                            <p className="font-bold text-slate-900 dark:text-white">{u.nama}</p>
                            <p className="text-[11px] text-slate-500 font-mono-num">
                              @{u.username} · {normalizeVillageName(u.desaTempatNikah, u.kua)}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              Pasangan: {u.pasanganNama || 'Belum tersinkron'}
                            </p>
                          </td>
                          <td className="px-4 py-3 align-top font-mono-num">
                            <p className="font-bold text-[#0F684E] dark:text-emerald-400">
                              {step.progressPercent}% (Langkah {step.currentStep}/8)
                            </p>
                            <p className="text-[11px] text-slate-500">
                              Pre {u.progress?.pretestScore ?? 0} → Post {u.progress?.postestScore ?? 0}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              Modul: {u.progress?.modulesCompleted.length || 0}/{data.modules.length} · IKM:{' '}
                              {u.progress?.ikmDone ? 'Sudah' : 'Belum'}
                            </p>
                          </td>
                          <td className="px-4 py-3 align-top">
                            <select
                              value={currentAttend}
                              onChange={(e) =>
                                setRowAttendance((prev) => ({
                                  ...prev,
                                  [u.id]: e.target.value as AttendanceStatus,
                                }))
                              }
                              className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-emerald-900 bg-[#F8FAF9] dark:bg-[#0D1613] text-xs"
                            >
                              <option value="Belum Hadir">Belum Hadir</option>
                              <option value="Hadir Kelas Online">Hadir Kelas Online</option>
                              <option value="Hadir Kelas Offline">Hadir Kelas Offline</option>
                            </select>
                          </td>
                          <td className="px-4 py-3 align-top space-y-1.5 min-w-[220px]">
                            <input
                              type="text"
                              value={currentNote}
                              onChange={(e) =>
                                setRowNotes((prev) => ({ ...prev, [u.id]: e.target.value }))
                              }
                              placeholder="Catatan untuk rapor portofolio..."
                              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-emerald-900 bg-[#F8FAF9] dark:bg-[#0D1613] text-xs"
                            />
                            <select
                              value=""
                              onChange={(e) => {
                                if (e.target.value)
                                  setRowNotes((prev) => ({ ...prev, [u.id]: e.target.value }));
                              }}
                              className="w-full px-2 py-1 rounded border border-slate-200 dark:border-emerald-950 bg-transparent text-[11px] text-slate-500"
                            >
                              <option value="">+ Template catatan cepat...</option>
                              {FASILITATOR_QUICK_NOTES.map((note) => (
                                <option key={note} value={note}>
                                  {note.slice(0, 52)}...
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-3 align-top text-right space-y-1.5">
                            <div className="inline-flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => setDetailPeserta(u)}
                                className="p-1.5 rounded-lg border border-slate-200 dark:border-emerald-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-emerald-950"
                                title="Lihat detail progres & gizi"
                                aria-label="Lihat detail peserta"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                disabled={!moocReady && !verified}
                                onClick={() =>
                                  verifyPesertaByFasilitator(u.id, {
                                    verified: !verified,
                                    kehadiranKelas:
                                      !verified && currentAttend === 'Belum Hadir'
                                        ? 'Hadir Kelas Offline'
                                        : currentAttend,
                                    catatanFasilitator: currentNote,
                                  })
                                }
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                                  verified
                                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-[#0F684E] dark:text-emerald-300'
                                    : moocReady
                                      ? 'bg-[#0F684E] hover:bg-[#0B523D] text-white'
                                      : 'bg-slate-100 dark:bg-emerald-950/40 text-slate-400 cursor-not-allowed'
                                }`}
                              >
                                {verified
                                  ? 'Sah · Batalkan'
                                  : moocReady
                                    ? 'Sahkan Lulus'
                                    : 'MOOC Belum Tuntas'}
                              </button>
                            </div>
                            {u.progress?.nomorSertifikat && (
                              <p className="font-mono-num text-[10px] text-slate-500">
                                {u.progress.nomorSertifikat}
                              </p>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: JADWAL KELAS & ABSENSI */}
      {activeTab === 'kelas' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-semibold">
                Jadwal Kelas Online &amp; Offline — {currentUser.kua}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Kelola jadwal bimbingan, verifikasi kehadiran peserta, dan cetak Daftar Hadir ber-QR.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setNewClassOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0F684E] hover:bg-[#0B523D] text-white text-xs font-semibold"
            >
              <Plus className="w-4 h-4" />
              Buat Jadwal Kelas
            </button>
          </div>

          <div className="space-y-4">
            {myClasses.map((cls) => (
              <div
                key={cls.id}
                className="bg-white dark:bg-[#111C18] border border-slate-200 dark:border-emerald-950 rounded-2xl p-5 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold text-[#0F684E] dark:text-emerald-400">
                      Kelas {cls.tipe} · <span className="font-mono-num">{cls.kodeAbsen}</span>
                    </p>
                    <h3 className="font-bold text-base mt-0.5">{cls.judul}</h3>
                    <p className="text-xs text-slate-500 font-mono-num mt-0.5">
                      {formatIndonesianDate(cls.tanggal)} · {cls.waktu} · Kuota {cls.rsvps.length}/
                      {cls.kuota}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Lokasi/Tautan: {cls.lokasiAtauLink}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setSheetClass(cls)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-emerald-900 text-xs font-semibold"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      Daftar Hadir
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        requestConfirm({
                          title: 'Hapus Jadwal Kelas?',
                          message: `Jadwal "${cls.judul}" akan dihapus permanen.`,
                          confirmLabel: 'Hapus',
                          danger: true,
                          onConfirm: () => deleteClassSchedule(cls.id),
                        })
                      }
                      className="p-2 rounded-lg border border-red-200 dark:border-red-900 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                      aria-label="Hapus kelas"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {cls.rsvps.length > 0 && (
                  <div className="border-t border-slate-200 dark:border-emerald-950 pt-3 space-y-2">
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      Daftar RSVP Peserta ({cls.rsvps.length})
                    </p>
                    <div className="divide-y divide-slate-100 dark:divide-emerald-950">
                      {cls.rsvps.map((r) => (
                        <div
                          key={r.username}
                          className="py-2 flex items-center justify-between gap-3 text-xs"
                        >
                          <div>
                            <span className="font-semibold">{r.nama}</span>{' '}
                            <span className="font-mono-num text-slate-500">(@{r.username})</span>
                            <span className="text-slate-500 ml-2">· {r.status}</span>
                          </div>
                          {r.verifiedHadir ? (
                            <span className="text-emerald-700 dark:text-emerald-400 font-semibold inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Hadir Terverifikasi
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => verifyClassAttendee(cls.id, r.username)}
                              className="px-3 py-1 rounded-lg bg-[#0F684E] text-white font-semibold"
                            >
                              Verifikasi Hadir
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: KONSULTASI & MEDIASI */}
      {activeTab === 'konsultasi' && (
        <div className="space-y-4">
          <h2 className="font-display text-2xl font-semibold">
            Kotak Konsultasi &amp; Eskalasi Mediasi — {currentUser.kua}
          </h2>
          {myConsults.length === 0 ? (
            <div className="bg-white dark:bg-[#111C18] border border-slate-200 dark:border-emerald-950 rounded-2xl p-8 text-center text-xs text-slate-500">
              Belum ada pertanyaan konsultasi masuk.
            </div>
          ) : (
            myConsults.map((c) => (
              <div
                key={c.id}
                className="bg-white dark:bg-[#111C18] border border-slate-200 dark:border-emerald-950 rounded-2xl p-5 space-y-3"
              >
                <div className="flex items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">{c.pesertaNama}</span>{' '}
                    <span className="text-slate-500">· {c.topik}</span>
                    {c.isEscalatedMediasi && (
                      <span className="ml-2 font-bold text-amber-700 dark:text-amber-400">
                        [PRIORITAS MEDIASI]
                      </span>
                    )}
                  </div>
                  <span className="font-mono-num text-slate-500">
                    {formatIndonesianDate(c.createdAt)} · {c.status}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200">{c.pertanyaan}</p>
                {c.balasanFasilitator ? (
                  <div className="p-3 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-xs">
                    <strong>Balasan Anda ({c.dibalasPada}):</strong> {c.balasanFasilitator}
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={replyDrafts[c.id] || ''}
                      onChange={(e) =>
                        setReplyDrafts((prev) => ({ ...prev, [c.id]: e.target.value }))
                      }
                      placeholder="Tulis tanggapan atau jadwal mediasi untuk peserta..."
                      className="flex-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-[#F8FAF9] dark:bg-[#0D1613] text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const text = replyDrafts[c.id]?.trim();
                        if (!text) return;
                        replyConsultation(c.id, text);
                        setReplyDrafts((prev) => ({ ...prev, [c.id]: '' }));
                      }}
                      className="px-4 py-2 rounded-lg bg-[#0F684E] hover:bg-[#0B523D] text-white text-xs font-semibold shrink-0"
                    >
                      Kirim Balasan
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 4: KIRIM PENGINGAT */}
      {activeTab === 'pengingat' && (
        <div className="max-w-xl bg-white dark:bg-[#111C18] border border-slate-200 dark:border-emerald-950 rounded-2xl p-6 space-y-4">
          <div>
            <h2 className="font-display text-xl font-semibold">Kirim Pengingat Peserta Binaan</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Pesan akan muncul di Kotak Masuk Pengingat peserta {currentUser.kua}.
            </p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!remTitle.trim() || !remMsg.trim()) return;
              sendReminderNotification(currentUser.kua, remTitle, remMsg, remUser || undefined);
              setRemTitle('');
              setRemMsg('');
              setRemUser('');
            }}
            className="space-y-3.5 text-xs sm:text-sm"
          >
            <div>
              <label className="block font-semibold mb-1">Sasaran Penerima</label>
              <select
                value={remUser}
                onChange={(e) => setRemUser(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-[#F8FAF9] dark:bg-[#0D1613]"
              >
                <option value="">Seluruh Peserta {currentUser.kua}</option>
                {myPeserta.map((p) => (
                  <option key={p.id} value={p.username}>
                    {p.nama} (@{p.username})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1">Judul Pengingat *</label>
              <input
                type="text"
                required
                value={remTitle}
                onChange={(e) => setRemTitle(e.target.value)}
                placeholder="Contoh: Jadwal Verifikasi & Kelas Tatap Muka"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-[#F8FAF9] dark:bg-[#0D1613]"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Isi Pesan *</label>
              <textarea
                rows={4}
                required
                value={remMsg}
                onChange={(e) => setRemMsg(e.target.value)}
                placeholder="Tuliskan arahan jadwal, berkas, atau pengingat penyelesaian modul..."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-[#F8FAF9] dark:bg-[#0D1613]"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg bg-[#0F684E] hover:bg-[#0B523D] text-white text-xs font-semibold"
            >
              Kirim Pengingat Sekarang
            </button>
          </form>
        </div>
      )}

      {/* TAB 5: PROFIL & KEAMANAN AKUN FASILITATOR */}
      {activeTab === 'akun' && (
        <AccountSecurityCard roleDisplay={`Fasilitator · ${currentUser.kua}`} includeProfileEditor />
      )}

      {/* Modal Verifikasi Kode Absensi */}
      <ModalDialog
        open={absenModalOpen}
        onClose={() => setAbsenModalOpen(false)}
        title="Verifikasi Kehadiran via Kode / QR Kelas"
        subtitle="Masukkan Kode Absensi kelas dan username peserta."
        maxWidth="md"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setAbsenErr('');
            const res = verifyAttendanceByCode(absenCode, absenUser);
            if (!res.ok) setAbsenErr(res.error || 'Gagal verifikasi.');
            else {
              setAbsenCode('');
              setAbsenUser('');
              setAbsenModalOpen(false);
            }
          }}
          className="space-y-3.5 text-xs sm:text-sm"
        >
          <div>
            <label className="block font-semibold mb-1">Kode Absensi Kelas</label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={absenCode}
                onChange={(e) => setAbsenCode(e.target.value)}
                placeholder="Contoh: ABSEN-JEP-2026-01"
                className="flex-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-[#F8FAF9] dark:bg-[#0D1613] font-mono-num"
              />
              <button
                type="button"
                onClick={() => setQrScanTarget('absen')}
                className="px-3 py-2 rounded-lg border border-[#0F684E]/40 text-[#0F684E] dark:text-emerald-300 text-xs font-semibold inline-flex items-center gap-1 shrink-0 hover:bg-[#0F684E]/5"
              >
                <ScanLine className="w-3.5 h-3.5" />
                Pindai QR
              </button>
            </div>
          </div>
          <div>
            <label className="block font-semibold mb-1">Username / Kartu QR Peserta</label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={absenUser}
                onChange={(e) => setAbsenUser(e.target.value)}
                placeholder="Contoh: ahmad_jepara"
                className="flex-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-[#F8FAF9] dark:bg-[#0D1613]"
              />
              <button
                type="button"
                onClick={() => setQrScanTarget('peserta')}
                className="px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 text-slate-700 dark:text-slate-200 text-xs font-semibold inline-flex items-center gap-1 shrink-0 hover:bg-slate-50 dark:hover:bg-emerald-950/40"
              >
                <ScanLine className="w-3.5 h-3.5" />
                Scan Kartu
              </button>
            </div>
          </div>
          {absenErr && <p className="text-xs text-red-600">{absenErr}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setAbsenModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 text-xs font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-[#0F684E] text-white text-xs font-semibold"
            >
              Verifikasi Kehadiran
            </button>
          </div>
        </form>
      </ModalDialog>

      <QRScannerModal
        open={Boolean(qrScanTarget)}
        onClose={() => setQrScanTarget(null)}
        title={
          qrScanTarget === 'absen'
            ? 'Pindai QR Daftar Hadir Kelas'
            : 'Pindai QR Kartu Peserta Catin'
        }
        subtitle={
          qrScanTarget === 'absen'
            ? 'Pindai QR pada lembar Daftar Hadir Kelas (ABSEN-...) dengan kamera atau unggah gambar QR.'
            : 'Pindai QR pada Kartu Peserta atau Sertifikat peserta untuk mengisi otomatis identitas peserta.'
        }
        onDetected={(code) => {
          if (qrScanTarget === 'absen') {
            setAbsenCode(code.toUpperCase());
          } else {
            setAbsenUser(code);
          }
          setAbsenErr('');
          setQrScanTarget(null);
        }}
      />

      {/* Modal Tambah Jadwal Kelas */}
      <ModalDialog
        open={newClassOpen}
        onClose={() => setNewClassOpen(false)}
        title={`Buat Jadwal Kelas Baru — ${currentUser.kua}`}
        maxWidth="lg"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createClassSchedule({ ...classForm, kua: currentUser.kua });
            setClassForm({ ...classForm, judul: '', lokasiAtauLink: '' });
            setNewClassOpen(false);
          }}
          className="space-y-3.5 text-xs sm:text-sm"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1">Jenis Kelas</label>
              <select
                value={classForm.tipe}
                onChange={(e) =>
                  setClassForm({ ...classForm, tipe: e.target.value as 'Online' | 'Offline' })
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-[#F8FAF9] dark:bg-[#0D1613]"
              >
                <option value="Offline">Offline (Tatap Muka Balai Nikah)</option>
                <option value="Online">Online (Zoom / Google Meet)</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1">Kuota Peserta</label>
              <input
                type="number"
                min={5}
                value={classForm.kuota}
                onChange={(e) => setClassForm({ ...classForm, kuota: Number(e.target.value) || 20 })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-[#F8FAF9] dark:bg-[#0D1613] font-mono-num"
              />
            </div>
          </div>
          <div>
            <label className="block font-semibold mb-1">Judul Sesi Kelas *</label>
            <input
              type="text"
              required
              value={classForm.judul}
              onChange={(e) => setClassForm({ ...classForm, judul: e.target.value })}
              placeholder="Contoh: Bimwin Tatap Muka Angkatan V"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-[#F8FAF9] dark:bg-[#0D1613]"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1">Tanggal *</label>
              <input
                type="date"
                required
                value={classForm.tanggal}
                onChange={(e) => setClassForm({ ...classForm, tanggal: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-[#F8FAF9] dark:bg-[#0D1613] font-mono-num"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Waktu *</label>
              <input
                type="text"
                required
                value={classForm.waktu}
                onChange={(e) => setClassForm({ ...classForm, waktu: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-[#F8FAF9] dark:bg-[#0D1613]"
              />
            </div>
          </div>
          <div>
            <label className="block font-semibold mb-1">Lokasi Balai Nikah atau Tautan Meeting *</label>
            <input
              type="text"
              required
              value={classForm.lokasiAtauLink}
              onChange={(e) => setClassForm({ ...classForm, lokasiAtauLink: e.target.value })}
              placeholder="Alamat Balai Nikah atau https://meet.google.com/..."
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-[#F8FAF9] dark:bg-[#0D1613]"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Narasumber *</label>
            <input
              type="text"
              required
              value={classForm.narasumber}
              onChange={(e) => setClassForm({ ...classForm, narasumber: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-[#F8FAF9] dark:bg-[#0D1613]"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setNewClassOpen(false)}
              className="px-4 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 text-xs font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-[#0F684E] text-white text-xs font-semibold"
            >
              Simpan Jadwal
            </button>
          </div>
        </form>
      </ModalDialog>

      <AttendanceSheetModal
        open={Boolean(sheetClass)}
        onClose={() => setSheetClass(null)}
        schedule={sheetClass}
      />

      {/* Detail Peserta Inspection Modal */}
      {detailPeserta && (
        <ModalDialog
          open={Boolean(detailPeserta)}
          onClose={() => setDetailPeserta(null)}
          title={`Rincian Progres Peserta — ${detailPeserta.nama}`}
          subtitle={`${detailPeserta.kua} · Desa ${normalizeVillageName(detailPeserta.desaTempatNikah, detailPeserta.kua)}`}
          maxWidth="2xl"
          footer={
            <button
              type="button"
              onClick={() => setDetailPeserta(null)}
              className="px-4 py-2 rounded-lg bg-[#0F684E] text-white text-xs font-semibold"
            >
              Tutup Rincian
            </button>
          }
        >
          <div className="space-y-4 text-xs sm:text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-[#F8FAF9] dark:bg-[#0D1613] border border-slate-200 dark:border-emerald-950">
              <div>
                <p className="text-[11px] text-slate-500">NIK (Tersamar) &amp; Usia</p>
                <p className="font-mono-num font-bold">
                  {maskNik(detailPeserta.nik)} · {detailPeserta.usia ?? '-'} tahun
                </p>
              </div>
              <div>
                <p className="text-[11px] text-slate-500">Pasangan Tersinkron</p>
                <p className="font-bold">{detailPeserta.pasanganNama || 'Belum tersinkron'}</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-500">Rencana Akad &amp; WhatsApp</p>
                <p className="font-mono-num">
                  {formatIndonesianDate(detailPeserta.tanggalRencanaNikah)} · {detailPeserta.noHp || '-'}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-slate-500">Skrining Gizi &amp; Stunting</p>
                <p className="font-semibold">
                  {detailPeserta.stunting
                    ? `${detailPeserta.stunting.status} (IMT ${detailPeserta.stunting.imt}, LiLA ${detailPeserta.stunting.lilaCm} cm, Hb ${detailPeserta.stunting.hbGdL})`
                    : 'Belum melakukan skrining'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <div className="p-3 rounded-xl border border-slate-200 dark:border-emerald-950">
                <p className="text-[11px] text-slate-500">Pretest</p>
                <p className="font-mono-num text-lg font-bold">
                  {detailPeserta.progress?.pretestDone ? detailPeserta.progress.pretestScore : '—'}
                </p>
              </div>
              <div className="p-3 rounded-xl border border-slate-200 dark:border-emerald-950">
                <p className="text-[11px] text-slate-500">Postest</p>
                <p className="font-mono-num text-lg font-bold text-[#0F684E] dark:text-emerald-400">
                  {detailPeserta.progress?.postestDone ? detailPeserta.progress.postestScore : '—'}
                </p>
              </div>
              <div className="p-3 rounded-xl border border-slate-200 dark:border-emerald-950 col-span-2 sm:col-span-1">
                <p className="text-[11px] text-slate-500">Piagam Kami Kompak</p>
                <p className="font-mono-num text-xs font-bold mt-1">
                  {detailPeserta.kompak?.kodePiagam || 'Belum disusun'}
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <p className="font-bold text-xs uppercase tracking-wider text-slate-500">
                Rincian Nilai 5 Modul Nasional
              </p>
              <div className="divide-y divide-slate-200 dark:divide-emerald-950 border border-slate-200 dark:border-emerald-950 rounded-xl overflow-hidden">
                {data.modules.map((m) => {
                  const score = detailPeserta.progress?.moduleScores[m.id];
                  const passed = detailPeserta.progress?.modulesCompleted.includes(m.id);
                  return (
                    <div key={m.id} className="px-3.5 py-2 flex items-center justify-between gap-2 text-xs">
                      <span className="font-medium truncate">
                        Modul {m.id}: {m.shortTitle}
                      </span>
                      <span className="font-mono-num font-bold shrink-0">
                        {score !== undefined ? `${score}%` : '—'} ·{' '}
                        <span className={passed ? 'text-[#0F684E] dark:text-emerald-400' : 'text-slate-400'}>
                          {passed ? 'Lulus' : 'Belum'}
                        </span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </ModalDialog>
      )}
    </WorkspaceShell>
  );
};
