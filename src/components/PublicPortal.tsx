import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  ChevronDown,
  Eye,
  EyeOff,
  MapPin,
  MessageSquare,
  Moon,
  Phone,
  QrCode,
  Search,
  ShieldCheck,
  Sun,
  UserPlus,
  X,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { DATA_DIREKTORI_16_KUA, LIST_16_KUA } from '../data/jeparaData';
import { useBimwin } from '../store/useBimwinStore';
import { VerificationResult } from '../types/bimwin';
import { countUniqueSyncedCouples, verifyDocumentQuery } from '../utils/bimwinLogic';
import { KemenagLogo } from './UiPrimitives';
import {
  ForgotPasswordModal,
  KritikSaranModal,
  PanduanModal,
  RegisterModal,
} from './AuthModals';
import { VerificationModal } from './VerificationModal';

export const PublicPortal: React.FC<{ initialVerifyCode?: string }> = ({
  initialVerifyCode = '',
}) => {
  const { data, login, darkMode, toggleDarkMode } = useBimwin();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [showNotice, setShowNotice] = useState(true);

  const [verifyInput, setVerifyInput] = useState(initialVerifyCode);
  const [verifyResult, setVerifyResult] = useState<VerificationResult | null>(() =>
    initialVerifyCode ? verifyDocumentQuery(initialVerifyCode, data.users, data.classes) : null
  );

  const [kuaSearch, setKuaSearch] = useState('');
  const [openFaqId, setOpenFaqId] = useState<string>(data.faqs[0]?.id || '');

  const [registerOpen, setRegisterOpen] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [kritikOpen, setKritikOpen] = useState(false);
  const [panduanOpen, setPanduanOpen] = useState(false);

  const pesertaList = useMemo(
    () => data.users.filter((u) => u.role === 'Peserta'),
    [data.users]
  );

  const totalCouples = useMemo(() => countUniqueSyncedCouples(data.users), [data.users]);

  const totalCertificates = useMemo(
    () => pesertaList.filter((u) => u.progress?.verifikasiFasilitator).length,
    [pesertaList]
  );

  const kuaChartData = useMemo(() => {
    return LIST_16_KUA.map((kua) => {
      const items = pesertaList.filter((p) => p.kua === kua);
      const lulus = items.filter((p) => p.progress?.verifikasiFasilitator).length;
      return {
        kua: kua.replace('KUA ', ''),
        peserta: items.length,
        lulus,
      };
    });
  }, [pesertaList]);

  const filteredDirectory = useMemo(() => {
    const q = kuaSearch.trim().toLowerCase();
    if (!q) return DATA_DIREKTORI_16_KUA;
    return DATA_DIREKTORI_16_KUA.filter(
      (d) => d.kua.toLowerCase().includes(q) || d.alamat.toLowerCase().includes(q)
    );
  }, [kuaSearch]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const res = login(username, password);
    if (!res.ok) setLoginError(res.error || 'Gagal masuk.');
  };

  const quickDemoLogin = (u: string, p: string) => {
    setLoginError('');
    const res = login(u, p);
    if (!res.ok) setLoginError(res.error || 'Gagal masuk.');
  };

  const handleVerify = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const res = verifyDocumentQuery(verifyInput, data.users, data.classes);
    setVerifyResult(res);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAF9] dark:bg-[#0A110F] text-slate-900 dark:text-slate-100">
      {/* 3-Zone Single-Row Institutional Top Bar */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#0D1613]/95 backdrop-blur border-b border-slate-200 dark:border-emerald-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
          <a href="#beranda" className="flex items-center gap-3 shrink-0">
            <KemenagLogo size="sm" />
            <div className="leading-tight">
              <span className="font-bold text-sm sm:text-base tracking-tight text-slate-900 dark:text-white whitespace-nowrap block">
                BIMWIN Kemenag Jepara
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
                Kementerian Agama Kabupaten Jepara
              </span>
            </div>
          </a>

          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600 dark:text-slate-300">
            <a href="#verifikasi" className="hover:text-[#0F684E] dark:hover:text-emerald-400 transition whitespace-nowrap">
              Verifikasi
            </a>
            <button
              type="button"
              onClick={() => setPanduanOpen(true)}
              className="hover:text-[#0F684E] dark:hover:text-emerald-400 transition whitespace-nowrap"
            >
              Panduan
            </button>
            <a href="#statistik" className="hover:text-[#0F684E] dark:hover:text-emerald-400 transition whitespace-nowrap">
              Statistik 16 KUA
            </a>
            <a href="#direktori" className="hover:text-[#0F684E] dark:hover:text-emerald-400 transition whitespace-nowrap">
              Direktori KUA
            </a>
            <a href="#faq" className="hover:text-[#0F684E] dark:hover:text-emerald-400 transition whitespace-nowrap">
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setRegisterOpen(true)}
              className="px-4 py-2 rounded-lg bg-[#0F684E] hover:bg-[#0B523D] text-white text-xs sm:text-sm font-semibold transition whitespace-nowrap"
            >
              Daftar Catin
            </button>
          </div>
        </div>
      </header>

      {/* Calm Institutional Notice Strip (Replaces Scrolling Marquee) */}
      {showNotice && (
        <div className="bg-[#094232] text-emerald-50 border-b border-amber-500/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between gap-3 text-[11px] sm:text-xs">
            <p className="leading-snug line-clamp-2 sm:line-clamp-none">
              <span className="font-bold text-amber-300 mr-1.5">Pengumuman Resmi:</span>
              {data.settings.announcement}
            </p>
            <button
              type="button"
              onClick={() => setShowNotice(false)}
              aria-label="Tutup pengumuman"
              className="text-emerald-200 hover:text-white shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      <main id="beranda" className="flex-1">
        {/* Hero & Login Split Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Editorial Institutional Pitch (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0F684E] dark:text-emerald-400">
                  Layanan Digital Nasional · 16 KUA Kecamatan Kabupaten Jepara
                </p>
                <h1 className="font-display text-3xl sm:text-4xl lg:text-[2.75rem] font-semibold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
                  Kenali Diri, Pahami Pasangan, Siapkan Pernikahan Sakinah.
                </h1>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                  Platform resmi Bimbingan Perkawinan Mandiri (MOOC) Kementerian Agama Kabupaten Jepara.
                  Dilengkapi kurikulum 5 modul keluarga sakinah, skrining kesiapan gizi pencegahan stunting,
                  Piagam Komitmen Kami Kompak, dan sertifikat terverifikasi QR Code.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setRegisterOpen(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#0F684E] hover:bg-[#0B523D] text-white text-sm font-semibold transition"
                >
                  <UserPlus className="w-4 h-4" />
                  Pendaftaran Calon Pengantin
                </button>
                <button
                  type="button"
                  onClick={() => setPanduanOpen(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-slate-300 dark:border-emerald-900 bg-white dark:bg-[#111C18] hover:bg-slate-50 dark:hover:bg-emerald-950/60 text-slate-800 dark:text-slate-200 text-sm font-semibold transition"
                >
                  <BookOpen className="w-4 h-4 text-[#0F684E] dark:text-emerald-400" />
                  Buku Saku 8 Langkah
                </button>
                <a
                  href="#masuk-portal"
                  className="lg:hidden inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold text-[#0F684E] dark:text-emerald-400 hover:underline"
                >
                  Masuk Portal
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>

              {/* Clean Institutional Metrics Bar (Aligned baselines) */}
              <div className="pt-4 border-t border-slate-200 dark:border-emerald-950 grid grid-cols-3 gap-4 sm:gap-8">
                <div className="flex flex-col justify-between">
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug">
                    Peserta Terdaftar
                  </p>
                  <p className="font-mono-num text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1">
                    {pesertaList.length}
                  </p>
                </div>
                <div className="flex flex-col justify-between">
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug">
                    Pasangan Tersinkron
                  </p>
                  <p className="font-mono-num text-2xl sm:text-3xl font-bold text-[#0F684E] dark:text-emerald-400 mt-1">
                    {totalCouples}
                  </p>
                </div>
                <div className="flex flex-col justify-between">
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug">
                    Sertifikat Terbit
                  </p>
                  <p className="font-mono-num text-2xl sm:text-3xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                    {totalCertificates}
                  </p>
                </div>
              </div>

              {/* Document Verification Strip */}
              <div
                id="verifikasi"
                className="bg-white dark:bg-[#111C18] border border-slate-200 dark:border-emerald-950 rounded-2xl p-5 space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <QrCode className="w-4 h-4 text-[#0F684E] dark:text-emerald-400" />
                      Verifikasi Keabsahan Dokumen &amp; NIK
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Cek keaslian Sertifikat (<span className="font-mono-num">JPR-...</span>), Piagam Kami Kompak (<span className="font-mono-num">KOMPAK-...</span>), Daftar Hadir (<span className="font-mono-num">ABSEN-...</span>), atau NIK 16 digit.
                    </p>
                  </div>
                </div>
                <form onSubmit={handleVerify} className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={verifyInput}
                    onChange={(e) => setVerifyInput(e.target.value)}
                    placeholder="Contoh: JPR-JEP-2026-0001 atau KOMPAK-2026-0001"
                    className="flex-1 px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-emerald-900 bg-[#F8FAF9] dark:bg-[#0D1613] text-xs sm:text-sm font-mono-num outline-none focus:border-[#0F684E]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-lg bg-slate-900 dark:bg-emerald-700 hover:bg-slate-800 dark:hover:bg-emerald-600 text-white text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-1.5 transition shrink-0"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Periksa Keabsahan
                  </button>
                </form>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                  <span>Contoh cepat:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setVerifyInput('JPR-JEP-2026-0001');
                      setVerifyResult(verifyDocumentQuery('JPR-JEP-2026-0001', data.users, data.classes));
                    }}
                    className="font-mono-num underline hover:text-[#0F684E] dark:hover:text-emerald-400"
                  >
                    JPR-JEP-2026-0001
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setVerifyInput('KOMPAK-2026-0001');
                      setVerifyResult(verifyDocumentQuery('KOMPAK-2026-0001', data.users, data.classes));
                    }}
                    className="font-mono-num underline hover:text-[#0F684E] dark:hover:text-emerald-400"
                  >
                    KOMPAK-2026-0001
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setVerifyInput('ABSEN-JEP-2026-01');
                      setVerifyResult(verifyDocumentQuery('ABSEN-JEP-2026-01', data.users, data.classes));
                    }}
                    className="font-mono-num underline hover:text-[#0F684E] dark:hover:text-emerald-400"
                  >
                    ABSEN-JEP-2026-01
                  </button>
                </div>
              </div>
            </div>

            {/* Login Panel (5 cols) */}
            <div
              id="masuk-portal"
              className="lg:col-span-5 bg-white dark:bg-[#111C18] border border-slate-200 dark:border-emerald-950 rounded-2xl p-6 sm:p-7 shadow-sm space-y-5"
            >
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Masuk ke Portal</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Akses ruang kerja Peserta, Fasilitator, Admin KUA, atau SuperAdmin Kemenag.
                </p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value.replace(/\s+/g, ''))}
                    placeholder="Masukkan username"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-emerald-900 bg-[#F8FAF9] dark:bg-[#0D1613] text-sm outline-none focus:border-[#0F684E]"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                      Kata Sandi
                    </label>
                    <button
                      type="button"
                      onClick={() => setForgotOpen(true)}
                      className="text-xs font-medium text-[#0F684E] dark:text-emerald-400 hover:underline"
                    >
                      Lupa Kata Sandi?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Masukkan kata sandi"
                      className="w-full pl-3.5 pr-10 py-2.5 rounded-lg border border-slate-300 dark:border-emerald-900 bg-[#F8FAF9] dark:bg-[#0D1613] text-sm outline-none focus:border-[#0F684E]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass((v) => !v)}
                      aria-label="Tampilkan kata sandi"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                    >
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {loginError && (
                  <p className="text-xs text-red-600 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg px-3 py-2">
                    {loginError}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg bg-[#0F684E] hover:bg-[#0B523D] text-white text-sm font-semibold inline-flex items-center justify-center gap-2 transition"
                >
                  Masuk Sistem
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <div className="pt-4 border-t border-slate-200 dark:border-emerald-950 space-y-2.5">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Akses Demo Cepat Berdasarkan Peran
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => quickDemoLogin('rizky_tahunan', 'bimwin2026')}
                    className="text-left px-3 py-2 rounded-lg border border-slate-200 dark:border-emerald-900 hover:border-[#0F684E] hover:bg-emerald-50/50 dark:hover:bg-emerald-950/40 transition"
                  >
                    <span className="block text-xs font-bold text-slate-900 dark:text-white truncate">
                      Peserta (Alur 8 Langkah)
                    </span>
                    <span className="block text-[11px] text-slate-500 font-mono-num truncate">
                      rizky_tahunan · Tahunan
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => quickDemoLogin('ahmad_jepara', 'bimwin2026')}
                    className="text-left px-3 py-2 rounded-lg border border-slate-200 dark:border-emerald-900 hover:border-[#0F684E] hover:bg-emerald-50/50 dark:hover:bg-emerald-950/40 transition"
                  >
                    <span className="block text-xs font-bold text-slate-900 dark:text-white truncate">
                      Peserta Lulus (4 Dokumen)
                    </span>
                    <span className="block text-[11px] text-slate-500 font-mono-num truncate">
                      ahmad_jepara · Jepara
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => quickDemoLogin('fasilitator_jepara', 'fasilitator2026')}
                    className="text-left px-3 py-2 rounded-lg border border-slate-200 dark:border-emerald-900 hover:border-[#0F684E] hover:bg-emerald-50/50 dark:hover:bg-emerald-950/40 transition"
                  >
                    <span className="block text-xs font-bold text-slate-900 dark:text-white truncate">
                      Fasilitator KUA
                    </span>
                    <span className="block text-[11px] text-slate-500 font-mono-num truncate">
                      fasilitator_jepara
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => quickDemoLogin('admin', 'admin2026')}
                    className="text-left px-3 py-2 rounded-lg border border-slate-200 dark:border-emerald-900 hover:border-[#0F684E] hover:bg-emerald-50/50 dark:hover:bg-emerald-950/40 transition"
                  >
                    <span className="block text-xs font-bold text-slate-900 dark:text-white truncate">
                      SuperAdmin Kemenag
                    </span>
                    <span className="block text-[11px] text-slate-500 font-mono-num truncate">
                      admin · 16 KUA Jepara
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Statistik 16 KUA Section */}
        <section
          id="statistik"
          className="border-t border-slate-200 dark:border-emerald-950 bg-white dark:bg-[#0D1613] py-12"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-[#0F684E] dark:text-emerald-400">
                  Transparansi Layanan Publik
                </p>
                <h2 className="font-display text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white mt-1">
                  Sebaran Peserta &amp; Kelulusan 16 KUA Jepara
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Data terakumulasi real-time dari seluruh kecamatan · Tahun Anggaran 2026
              </p>
            </div>

            <div className="bg-[#F8FAF9] dark:bg-[#111C18] border border-slate-200 dark:border-emerald-950 rounded-2xl p-4 sm:p-6">
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={kuaChartData} margin={{ top: 10, right: 12, left: -16, bottom: 28 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#1e3a32' : '#e2e8f0'} />
                    <XAxis
                      dataKey="kua"
                      angle={-30}
                      textAnchor="end"
                      interval={0}
                      tick={{ fontSize: 11, fill: darkMode ? '#94a3b8' : '#475569' }}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 11, fill: darkMode ? '#94a3b8' : '#475569' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: darkMode ? '#0D1613' : '#FFFFFF',
                        borderColor: darkMode ? '#14532d' : '#e2e8f0',
                        borderRadius: '10px',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="peserta" name="Total Peserta" fill="#0F684E" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="lulus" name="Sertifikat Terbit" fill="#C69214" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </section>

        {/* Direktori 16 KUA Section */}
        <section id="direktori" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#0F684E] dark:text-emerald-400">
                Unit Layanan Kecamatan
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white mt-1">
                Direktori 16 KUA Kabupaten Jepara
              </h2>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={kuaSearch}
                onChange={(e) => setKuaSearch(e.target.value)}
                placeholder="Cari kecamatan atau alamat..."
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-white dark:bg-[#111C18] text-xs sm:text-sm outline-none focus:border-[#0F684E]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {filteredDirectory.map((entry) => (
              <div
                key={entry.kua}
                className="bg-white dark:bg-[#111C18] border border-slate-200 dark:border-emerald-950 rounded-xl p-4 flex flex-col justify-between gap-3"
              >
                <div className="space-y-1.5">
                  <h3 className="font-bold text-sm text-[#0F684E] dark:text-emerald-400">
                    {entry.kua}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-400" />
                    <span>{entry.alamat}</span>
                  </p>
                  <p className="text-xs font-mono-num text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                    <span>{entry.telp}</span>
                  </p>
                </div>
                <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-emerald-950">
                  {entry.jamLayanan}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Galeri Kegiatan & FAQ */}
        <section
          id="faq"
          className="border-t border-slate-200 dark:border-emerald-950 bg-white dark:bg-[#0D1613] py-12"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Galeri (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-[#0F684E] dark:text-emerald-400">
                  Dokumentasi Program
                </p>
                <h2 className="font-display text-2xl font-semibold text-slate-900 dark:text-white mt-1">
                  Galeri Kegiatan KUA
                </h2>
              </div>
              <div className="space-y-3">
                {data.gallery.slice(0, 4).map((item) => (
                  <article
                    key={item.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-emerald-950 bg-[#F8FAF9] dark:bg-[#111C18] space-y-1"
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="font-semibold text-[#0F684E] dark:text-emerald-400">
                        {item.kua}
                      </span>
                      <span className="font-mono-num">{item.tanggal}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{item.judul}</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {item.deskripsi}
                    </p>
                  </article>
                ))}
              </div>
            </div>

            {/* FAQ (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-[#0F684E] dark:text-emerald-400">
                    Pusat Bantuan
                  </p>
                  <h2 className="font-display text-2xl font-semibold text-slate-900 dark:text-white mt-1">
                    Pertanyaan Umum (FAQ)
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setKritikOpen(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0F684E] dark:text-emerald-400 hover:underline"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Kirim Kritik &amp; Saran
                </button>
              </div>
              <div className="divide-y divide-slate-200 dark:divide-emerald-950 border border-slate-200 dark:border-emerald-950 rounded-xl overflow-hidden bg-[#F8FAF9] dark:bg-[#111C18]">
                {data.faqs.map((faq) => {
                  const isOpen = openFaqId === faq.id;
                  return (
                    <div key={faq.id}>
                      <button
                        type="button"
                        onClick={() => setOpenFaqId(isOpen ? '' : faq.id)}
                        className="w-full px-4 py-3.5 text-left flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-emerald-950/30 transition"
                      >
                        <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {faq.t}
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${
                            isOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      {isOpen && (
                        <div className="px-4 pb-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                          {faq.j}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Clean Institutional Footer */}
      <footer className="border-t border-slate-200 dark:border-emerald-950 bg-[#F8FAF9] dark:bg-[#0A110F]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2.5">
            <KemenagLogo size="sm" />
            <span>
              Kantor Kementerian Agama Kabupaten Jepara · Seksi Bimbingan Masyarakat Islam
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setKritikOpen(true)}
              className="hover:text-[#0F684E] dark:hover:text-emerald-400 font-medium"
            >
              Kritik &amp; Saran
            </button>
            <button
              type="button"
              onClick={toggleDarkMode}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-emerald-900 hover:bg-white dark:hover:bg-[#111C18] text-slate-700 dark:text-slate-200 font-medium transition"
            >
              {darkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-600" />}
              {darkMode ? 'Mode Terang' : 'Mode Gelap'}
            </button>
          </div>
        </div>
      </footer>

      <RegisterModal open={registerOpen} onClose={() => setRegisterOpen(false)} />
      <ForgotPasswordModal open={forgotOpen} onClose={() => setForgotOpen(false)} />
      <KritikSaranModal open={kritikOpen} onClose={() => setKritikOpen(false)} />
      <PanduanModal open={panduanOpen} onClose={() => setPanduanOpen(false)} />
      <VerificationModal result={verifyResult} onClose={() => setVerifyResult(null)} />
    </div>
  );
};
