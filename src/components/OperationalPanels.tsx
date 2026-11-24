import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Cloud,
  CloudDownload,
  CloudUpload,
  LogIn,
  Megaphone,
  RefreshCw,
  Send,
  ShieldAlert,
  TicketCheck,
} from 'lucide-react';
import { LIST_16_KUA } from '../data/jeparaData';
import { useBimwin } from '../store/useBimwinStore';
import { DataTicketStatus } from '../types/bimwin';

/**
 * 1. Cloud Sync Toolbar for Admin Kemenag, Admin KUA, and Fasilitator
 */
export const CloudSyncBar: React.FC = () => {
  const {
    firebaseUser,
    cloudSyncState,
    loginWithGoogle,
    syncWorkspaceToCloud,
    pullWorkspaceFromCloud,
  } = useBimwin();

  return (
    <div className="mb-5 rounded-2xl border border-emerald-200/80 dark:border-emerald-900/70 bg-white dark:bg-[#111C18] px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex items-center gap-2.5 min-w-0">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
            firebaseUser
              ? 'bg-emerald-50 dark:bg-emerald-950 text-[#0F684E] dark:text-emerald-400'
              : 'bg-slate-100 dark:bg-emerald-950/50 text-slate-500'
          }`}
        >
          <Cloud className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
            {firebaseUser
              ? `Firebase Cloud Aktif · ${firebaseUser.email}`
              : 'Sinkronisasi Database Cloud (Firebase Firestore)'}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
            {cloudSyncState.lastSyncedAt
              ? `Terakhir tersinkron: ${new Date(cloudSyncState.lastSyncedAt).toLocaleString('id-ID')}`
              : 'Hubungkan akun Google petugas untuk sinkronisasi lintas perangkat & verifikasi QR pusat.'}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 shrink-0">
        {!firebaseUser ? (
          <button
            type="button"
            onClick={() => void loginWithGoogle()}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#0F684E] hover:bg-[#0B523D] text-white text-xs font-semibold transition"
          >
            <LogIn className="w-3.5 h-3.5" />
            Hubungkan Google Cloud
          </button>
        ) : (
          <>
            <button
              type="button"
              disabled={cloudSyncState.syncing}
              onClick={() => void pullWorkspaceFromCloud()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-emerald-900 bg-[#F8FAF9] dark:bg-[#0D1613] hover:bg-slate-100 text-xs font-semibold text-slate-700 dark:text-slate-200 disabled:opacity-50 transition"
            >
              <CloudDownload className="w-3.5 h-3.5" />
              Tarik Cloud
            </button>
            <button
              type="button"
              disabled={cloudSyncState.syncing}
              onClick={() => void syncWorkspaceToCloud()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0F684E] hover:bg-[#0B523D] text-white text-xs font-semibold disabled:opacity-50 transition"
            >
              <CloudUpload className="w-3.5 h-3.5" />
              {cloudSyncState.syncing ? 'Menyinkronkan...' : 'Unggah ke Cloud'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

/**
 * 2. Official Announcements & Data Correction Tickets Manager (Admin Kemenag / Admin KUA)
 */
export const AnnouncementsTicketsPanel: React.FC<{ isSuper: boolean; kuaName: string }> = ({
  isSuper,
  kuaName,
}) => {
  const {
    data,
    publishOfficialAnnouncement,
    toggleAnnouncementActive,
    resolveDataCorrectionTicket,
  } = useBimwin();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [kuaScope, setKuaScope] = useState(isSuper ? 'ALL' : kuaName);
  const [priority, setPriority] = useState<'normal' | 'penting'>('normal');
  const [replyNotes, setReplyNotes] = useState<Record<string, string>>({});

  const scopedAnnouncements = useMemo(() => {
    const all = data.officialAnnouncements || [];
    return isSuper ? all : all.filter((a) => a.kuaScope === 'ALL' || a.kuaScope === kuaName);
  }, [data.officialAnnouncements, isSuper, kuaName]);

  const scopedTickets = useMemo(() => {
    const all = data.dataTickets || [];
    return isSuper ? all : all.filter((t) => t.kua === kuaName);
  }, [data.dataTickets, isSuper, kuaName]);

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim().length < 3 || body.trim().length < 5) return;
    await publishOfficialAnnouncement({
      title,
      body,
      kuaScope: isSuper ? kuaScope : kuaName,
      priority,
    });
    setTitle('');
    setBody('');
  };

  const handleResolve = (ticketId: string, status: DataTicketStatus) => {
    resolveDataCorrectionTicket(
      ticketId,
      status,
      replyNotes[ticketId] ||
        (status === 'selesai'
          ? 'Permohonan telah diproses dan data disesuaikan oleh petugas KUA.'
          : 'Permohonan belum dapat dipenuhi, silakan hubungi petugas KUA dengan dokumen pendukung.')
    );
  };

  return (
    <div className="space-y-6">
      {/* Official Announcements Section */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <form
          onSubmit={handlePublish}
          className="lg:col-span-2 bg-white dark:bg-[#111C18] border border-slate-200 dark:border-emerald-950 rounded-2xl p-5 space-y-3.5"
        >
          <div className="flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-[#0F684E]" />
            <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
              Terbitkan Pengumuman Resmi
            </h3>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Judul Pengumuman</label>
            <input
              type="text"
              required
              minLength={3}
              maxLength={160}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Jadwal Bimbingan Serentak Bulan Depan"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-[#F8FAF9] dark:bg-[#0D1613] text-xs"
            />
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-semibold mb-1">Cakupan Wilayah</label>
              {isSuper ? (
                <select
                  value={kuaScope}
                  onChange={(e) => setKuaScope(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-[#F8FAF9] dark:bg-[#0D1613] text-xs"
                >
                  <option value="ALL">Semua 16 KUA</option>
                  {LIST_16_KUA.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  readOnly
                  value={kuaName}
                  className="w-full px-2.5 py-2 rounded-lg border border-slate-200 dark:border-emerald-900 bg-slate-100 dark:bg-[#0D1613] text-xs font-semibold"
                />
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Prioritas</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as 'normal' | 'penting')}
                className="w-full px-2.5 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-[#F8FAF9] dark:bg-[#0D1613] text-xs"
              >
                <option value="normal">Informasi Umum</option>
                <option value="penting">Penting / Edaran Resmi</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Isi Pengumuman</label>
            <textarea
              required
              minLength={5}
              maxLength={2000}
              rows={4}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Tulis isi edaran atau pengumuman untuk Calon Pengantin..."
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-[#F8FAF9] dark:bg-[#0D1613] text-xs"
            />
          </div>
          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#0F684E] hover:bg-[#0B523D] text-white text-xs font-semibold transition"
          >
            <Send className="w-3.5 h-3.5" />
            Publikasikan Pengumuman
          </button>
        </form>

        <div className="lg:col-span-3 bg-white dark:bg-[#111C18] border border-slate-200 dark:border-emerald-950 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
              Daftar Pengumuman &amp; Edaran ({scopedAnnouncements.length})
            </h3>
          </div>
          <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
            {scopedAnnouncements.length === 0 ? (
              <p className="text-xs text-slate-500">Belum ada pengumuman resmi.</p>
            ) : (
              scopedAnnouncements.map((ann) => (
                <div
                  key={ann.id}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-emerald-950 bg-[#F8FAF9] dark:bg-[#0D1613] space-y-1.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span
                        className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded mr-1.5 ${
                          ann.priority === 'penting'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        }`}
                      >
                        {ann.priority === 'penting' ? 'EDARAN PENTING' : 'INFO RESMI'}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500">
                        {ann.kuaScope === 'ALL' ? 'Semua 16 KUA' : ann.kuaScope}
                      </span>
                      <p className="text-xs font-bold text-slate-900 dark:text-white mt-1">
                        {ann.title}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleAnnouncementActive(ann.id)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border shrink-0 ${
                        ann.active
                          ? 'border-emerald-300 bg-emerald-50 text-[#0F684E]'
                          : 'border-slate-300 bg-slate-100 text-slate-500'
                      }`}
                    >
                      {ann.active ? 'Tayang' : 'Diarsipkan'}
                    </button>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">{ann.body}</p>
                  <p className="text-[10px] text-slate-400">Oleh: {ann.authorName}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Data Correction Tickets Section */}
      <div className="bg-white dark:bg-[#111C18] border border-slate-200 dark:border-emerald-950 rounded-2xl p-5 space-y-3.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <TicketCheck className="w-4 h-4 text-[#0F684E]" />
            <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
              Antrean Tiket Bantuan &amp; Perubahan Data Catin ({scopedTickets.length})
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-slate-500">
            Menunggu: {scopedTickets.filter((t) => t.status === 'menunggu').length}
          </span>
        </div>

        {scopedTickets.length === 0 ? (
          <p className="text-xs text-slate-500">
            Belum ada tiket perubahan data pada cakupan wilayah Anda.
          </p>
        ) : (
          <div className="space-y-3">
            {scopedTickets.map((tkt) => (
              <div
                key={tkt.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-emerald-950 bg-[#F8FAF9] dark:bg-[#0D1613] space-y-2.5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      {tkt.pesertaNama}{' '}
                      <span className="font-mono-num text-slate-500 font-normal">
                        (@{tkt.pesertaUsername} · {tkt.kua})
                      </span>
                    </p>
                    <p className="text-[11px] font-semibold text-[#0F684E] dark:text-emerald-400">
                      Kategori: {tkt.category}
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ${
                      tkt.status === 'selesai'
                        ? 'bg-emerald-100 text-emerald-800'
                        : tkt.status === 'ditolak'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {tkt.status}
                  </span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-200">{tkt.details}</p>

                {tkt.status === 'menunggu' ? (
                  <div className="flex flex-col sm:flex-row gap-2 pt-1">
                    <input
                      type="text"
                      value={replyNotes[tkt.id] || ''}
                      onChange={(e) =>
                        setReplyNotes((prev) => ({ ...prev, [tkt.id]: e.target.value }))
                      }
                      placeholder="Catatan tindak lanjut petugas KUA..."
                      className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-emerald-900 bg-white dark:bg-[#111C18] text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => handleResolve(tkt.id, 'selesai')}
                      className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-[#0F684E] hover:bg-[#0B523D] text-white text-xs font-semibold"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Setujui &amp; Selesai
                    </button>
                    <button
                      type="button"
                      onClick={() => handleResolve(tkt.id, 'ditolak')}
                      className="px-3 py-1.5 rounded-lg border border-red-200 text-red-700 hover:bg-red-50 text-xs font-semibold"
                    >
                      Tolak
                    </button>
                  </div>
                ) : (
                  tkt.officerNote && (
                    <p className="text-[11px] text-slate-500 border-t border-slate-200 dark:border-emerald-950 pt-2">
                      <strong>Tindak lanjut ({tkt.resolvedBy || 'Petugas'}):</strong> {tkt.officerNote}
                    </p>
                  )
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * 3. Officer Auto-Logout Inactivity Guard (15-min idle with 60s countdown warning)
 */
export const OfficerInactivityGuard: React.FC = () => {
  const { currentUser, logout, pushToast } = useBimwin();
  const isOfficer = Boolean(currentUser && currentUser.role !== 'Peserta');
  const [countdown, setCountdown] = useState<number | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  useEffect(() => {
    if (!isOfficer) {
      setCountdown(null);
      return;
    }

    const IDLE_WARN_MS = 14 * 60 * 1000; // warn at 14 min
    const IDLE_LOGOUT_MS = 15 * 60 * 1000; // logout at 15 min

    const resetActivity = () => {
      lastActivityRef.current = Date.now();
      setCountdown((prev) => (prev !== null ? null : prev));
    };

    const events = ['mousemove', 'keydown', 'click', 'touchstart', 'scroll'];
    events.forEach((ev) => window.addEventListener(ev, resetActivity, { passive: true }));

    const timer = window.setInterval(() => {
      const elapsed = Date.now() - lastActivityRef.current;
      if (elapsed >= IDLE_LOGOUT_MS) {
        setCountdown(null);
        logout();
        pushToast(
          'info',
          'Sesi Petugas Berakhir Otomatis',
          'Demi keamanan komputer KUA bersama, sesi diakhiri setelah 15 menit tidak aktif.'
        );
      } else if (elapsed >= IDLE_WARN_MS) {
        setCountdown(Math.max(1, Math.ceil((IDLE_LOGOUT_MS - elapsed) / 1000)));
      }
    }, 1000);

    return () => {
      events.forEach((ev) => window.removeEventListener(ev, resetActivity));
      window.clearInterval(timer);
    };
  }, [isOfficer, logout, pushToast]);

  if (countdown === null) return null;

  return (
    <div
      role="alert"
      className="fixed top-4 right-4 z-[70] max-w-sm rounded-2xl border border-amber-300 bg-amber-50 dark:bg-[#1E1A0E] dark:border-amber-800 p-4 shadow-xl space-y-2.5"
    >
      <div className="flex items-start gap-2.5">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-bold text-amber-950 dark:text-amber-200">
            Keamanan Sesi Petugas KUA
          </p>
          <p className="text-amber-900 dark:text-amber-300">
            Tidak ada aktivitas terdeteksi. Sesi akan keluar otomatis dalam{' '}
            <strong className="font-mono-num">{countdown} detik</strong>.
          </p>
        </div>
      </div>
      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={logout}
          className="px-3 py-1.5 rounded-lg border border-amber-300 text-xs font-semibold text-amber-900 dark:text-amber-200"
        >
          Keluar Sekarang
        </button>
        <button
          type="button"
          onClick={() => {
            lastActivityRef.current = Date.now();
            setCountdown(null);
          }}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#0F684E] text-white text-xs font-semibold"
        >
          <Clock className="w-3.5 h-3.5" />
          Perpanjang Sesi
        </button>
      </div>
    </div>
  );
};

/**
 * 4. PWA Service Worker Update Prompt (Web APK seamless version refresh)
 */
export const PWAUpdatePrompt: React.FC = () => {
  const [needRefresh, setNeedRefresh] = useState(false);
  const updateSwRef = useRef<((reloadPage?: boolean) => Promise<void>) | null>(null);

  useEffect(() => {
    let active = true;
    import('virtual:pwa-register')
      .then(({ registerSW }) => {
        if (!active) return;
        const updateSW = registerSW({
          immediate: true,
          onNeedRefresh() {
            setNeedRefresh(true);
          },
        });
        updateSwRef.current = updateSW;
      })
      .catch(() => {
        // Ignore in non-PWA environments
      });
    return () => {
      active = false;
    };
  }, []);

  if (!needRefresh) return null;

  return (
    <div
      role="status"
      className="fixed bottom-20 md:bottom-5 right-4 z-[65] max-w-xs rounded-2xl border border-emerald-300 dark:border-emerald-800 bg-white dark:bg-[#111C18] p-3.5 shadow-xl flex items-center gap-3"
    >
      <RefreshCw className="w-4 h-4 text-[#0F684E] shrink-0" />
      <div className="text-xs flex-1">
        <p className="font-bold text-slate-900 dark:text-white">Versi Baru SAMAWA Tersedia</p>
        <p className="text-[11px] text-slate-500">Muat ulang untuk pembaruan fitur terbaru.</p>
      </div>
      <button
        type="button"
        onClick={() => {
          if (updateSwRef.current) {
            void updateSwRef.current(true);
          } else {
            window.location.reload();
          }
        }}
        className="px-2.5 py-1.5 rounded-lg bg-[#0F684E] text-white text-[11px] font-semibold shrink-0"
      >
        Perbarui
      </button>
    </div>
  );
};
