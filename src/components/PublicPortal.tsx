import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BarChart3,
  BookOpen,
  Building2,
  ChevronDown,
  ChevronRight,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  HeartHandshake,
  HelpCircle,
  Home,
  Lock,
  MapPin,
  Menu,
  MessageSquare,
  Moon,
  Phone,
  QrCode,
  ScanLine,
  Search,
  ShieldCheck,
  Sun,
  User,
  UserPlus,
  Users,
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
import {
  buildKuaGoogleMapsUrl,
  LIST_16_KUA,
} from '../data/jeparaData';
import { verifyCertificateFromCloud } from '../firebase';
import { useBimwin } from '../store/useBimwinStore';
import { VerificationResult } from '../types/bimwin';
import { countUniqueSyncedCouples, verifyDocumentQuery } from '../utils/bimwinLogic';
import { normalizeWhatsAppNumber } from '../utils/smartReminder';
import { SamawaBrandHeader } from './UiPrimitives';
import {
  ForgotPasswordModal,
  KritikSaranModal,
  PanduanModal,
  RegisterModal,
} from './AuthModals';
import { PrivacyPolicyModal } from './PrivacyPolicyModal';
import {
  PWAInstallDrawerItem,
  PWAInstallHeaderButton,
  PWAInstallModal,
} from './PWAInstallControls';
import { QRScannerModal } from './QRScannerModal';
import { VerificationModal } from './VerificationModal';

type PortalSection = 'beranda' | 'verifikasi' | 'statistik' | 'direktori' | 'faq';

export const PublicPortal: React.FC<{ initialVerifyCode?: string }> = ({
  initialVerifyCode = '',
}) => {
  const { data, login, darkMode, toggleDarkMode, pushToast } = useBimwin();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [menuDrawerOpen, setMenuDrawerOpen] = useState(false);
  const [installModalOpen, setInstallModalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<PortalSection>(
    initialVerifyCode ? 'verifikasi' : 'beranda'
  );

  const [verifyInput, setVerifyInput] = useState(initialVerifyCode);
  const [verifyResult, setVerifyResult] = useState<VerificationResult | null>(null);
  const [qrScannerOpen, setQrScannerOpen] = useState(false);

  const [kuaSearch, setKuaSearch] = useState('');
  const [openFaqId, setOpenFaqId] = useState<string>(data.faqs[0]?.id || '');

  const [registerOpen, setRegisterOpen] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [kritikOpen, setKritikOpen] = useState(false);
  const [panduanOpen, setPanduanOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);

  useEffect(() => {
    if (!menuDrawerOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuDrawerOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [menuDrawerOpen]);

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
    if (!q) return data.kuaDirectory;
    return data.kuaDirectory.filter(
      (d) =>
        d.kua.toLowerCase().includes(q) ||
        d.alamat.toLowerCase().includes(q) ||
        d.telp.toLowerCase().includes(q) ||
        (d.whatsapp || '').toLowerCase().includes(q) ||
        (d.kepalaKua || '').toLowerCase().includes(q)
    );
  }, [data.kuaDirectory, kuaSearch]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const res = login(username, password);
    if (!res.ok) setLoginError(res.error || 'Gagal masuk.');
  };

  const resolveVerificationWithCloud = async (code: string): Promise<VerificationResult> => {
    const localRes = verifyDocumentQuery(code, data.users, data.classes);
    if (localRes.valid || localRes.found) return localRes;
    const cloudCert = await verifyCertificateFromCloud(code);
    if (cloudCert) {
      return {
        found: true,
        type: 'Sertifikat Bimwin',
        code: cloudCert.certCode,
        title: `Sertifikat ${cloudCert.documentType} Terverifikasi Cloud`,
        statusLabel: cloudCert.status === 'valid' ? 'SAH · TERVERIFIKASI CLOUD' : 'DICABUT',
        valid: cloudCert.status === 'valid',
        details: [
          { label: 'Nomor Sertifikat', value: cloudCert.certificateNumber },
          { label: 'Nama Peserta', value: cloudCert.participantName },
          ...(cloudCert.partnerName
            ? [{ label: 'Nama Pasangan', value: cloudCert.partnerName }]
            : []),
          { label: 'KUA Kecamatan', value: cloudCert.kua },
          { label: 'Tanggal Terbit', value: cloudCert.issuedAt },
        ],
        note: 'Keabsahan ditarik langsung dari basis data Cloud Firestore Kemenag Kab. Jepara.',
      };
    }
    return localRes;
  };

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const res = await resolveVerificationWithCloud(verifyInput);
    setVerifyResult(res);
  };

  const navigateSection = (section: PortalSection) => {
    setActiveSection(section);
    setMenuDrawerOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const drawerSections: Array<{
    id: PortalSection;
    label: string;
    desc: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    {
      id: 'beranda',
      label: 'Beranda & Masuk Portal',
      desc: 'Halaman utama, ringkasan, dan login akun',
      icon: Home,
    },
    {
      id: 'verifikasi',
      label: 'Verifikasi Dokumen & NIK',
      desc: 'Cek keabsahan sertifikat, piagam, dan daftar hadir',
      icon: QrCode,
    },
    {
      id: 'statistik',
      label: 'Statistik 16 KUA Jepara',
      desc: 'Grafik sebaran peserta dan kelulusan kecamatan',
      icon: BarChart3,
    },
    {
      id: 'direktori',
      label: 'Direktori 16 KUA',
      desc: 'Alamat, telepon, dan jam layanan seluruh KUA',
      icon: Building2,
    },
    {
      id: 'faq',
      label: 'Galeri Kegiatan & FAQ',
      desc: 'Dokumentasi program dan pertanyaan umum',
      icon: HelpCircle,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col overflow-x-clip bg-white dark:bg-[#060F0C] text-slate-900 dark:text-slate-100">
      {/* Luxury Institutional Top Bar */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#07110E]/92 backdrop-blur-xl border-b border-slate-200/80 dark:border-[#D4AF37]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3 h-full min-w-0">
            <button
              type="button"
              onClick={() => setMenuDrawerOpen(true)}
              aria-label="Buka menu navigasi"
              aria-expanded={menuDrawerOpen}
              className="p-2 rounded-lg border border-slate-200/90 dark:border-[#D4AF37]/25 bg-white dark:bg-[#0D1A15] text-slate-700 dark:text-slate-200 hover:border-[#C9A654]/70 hover:bg-slate-50 dark:hover:bg-emerald-950/60 transition shrink-0"
            >
              <Menu className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => navigateSection('beranda')}
              className="flex items-center h-full min-w-0 text-left"
            >
              <SamawaBrandHeader
                subtitle="KEMENTERIAN AGAMA KABUPATEN JEPARA"
                hideSubtitleOnMobile
              />
            </button>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <PWAInstallHeaderButton onOpenModal={() => setInstallModalOpen(true)} />
            <button
              type="button"
              onClick={() => setRegisterOpen(true)}
              className="px-3.5 sm:px-4 py-2 rounded-lg bg-gradient-to-r from-[#0A4A37] to-[#0F684E] hover:from-[#083B2C] hover:to-[#0C553F] ring-1 ring-[#D4AF37]/30 shadow-[0_6px_16px_-8px_rgba(10,74,55,0.65)] text-white text-xs sm:text-sm font-semibold transition whitespace-nowrap"
            >
              Daftar<span className="hidden sm:inline"> Catin</span>
            </button>
            <button
              type="button"
              onClick={toggleDarkMode}
              aria-label={darkMode ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'}
              className="p-2 rounded-lg border border-slate-200/90 dark:border-[#D4AF37]/25 bg-white dark:bg-[#0D1A15] text-slate-600 dark:text-slate-300 hover:border-[#C9A654]/70 hover:bg-slate-50 dark:hover:bg-emerald-950/60 transition"
            >
              {darkMode ? <Sun className="w-4 h-4 text-[#F1D680]" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Slide-Over Navigation Drawer (Triggered from Garis 3 on Left) */}
      {menuDrawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-[1px]"
            onClick={() => setMenuDrawerOpen(false)}
          />
          <aside
            aria-label="Menu navigasi portal"
            className="relative z-10 w-80 max-w-[88vw] h-full bg-white dark:bg-[#0D1613] border-r border-slate-200 dark:border-emerald-950 shadow-2xl flex flex-col"
          >
            <div className="h-16 px-5 flex items-center justify-between border-b border-slate-200 dark:border-emerald-950 shrink-0">
              <SamawaBrandHeader subtitle="KEMENAG KAB. JEPARA" />
              <button
                type="button"
                onClick={() => setMenuDrawerOpen(false)}
                aria-label="Tutup menu navigasi"
                className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-emerald-950/60 transition shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-4 space-y-6">
              <div className="space-y-1">
                <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Menu Portal
                </p>
                {drawerSections.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => navigateSection(item.id)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl flex items-start gap-3 transition ${
                        isActive
                          ? 'bg-[#0F684E] text-white'
                          : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-emerald-950/60'
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 shrink-0 mt-0.5 ${
                          isActive ? 'text-amber-300' : 'text-[#0F684E] dark:text-emerald-400'
                        }`}
                      />
                      <div className="min-w-0">
                        <span className="block text-sm font-semibold leading-snug">
                          {item.label}
                        </span>
                        <span
                          className={`block text-[11px] leading-snug mt-0.5 ${
                            isActive ? 'text-emerald-100' : 'text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          {item.desc}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-emerald-950 space-y-1">
                <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Panduan &amp; Layanan
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setMenuDrawerOpen(false);
                    setPanduanOpen(true);
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-3 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-emerald-950/60 transition"
                >
                  <BookOpen className="w-4 h-4 text-[#0F684E] dark:text-emerald-400 shrink-0" />
                  Panduan Aplikasi
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMenuDrawerOpen(false);
                    setKritikOpen(true);
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-3 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-emerald-950/60 transition"
                >
                  <MessageSquare className="w-4 h-4 text-[#0F684E] dark:text-emerald-400 shrink-0" />
                  Kritik &amp; Saran
                </button>
                <PWAInstallDrawerItem
                  variant="portal"
                  onBeforeAction={() => setMenuDrawerOpen(false)}
                  onOpenModal={() => setInstallModalOpen(true)}
                />
              </div>
            </nav>

            <div className="p-4 border-t border-slate-200 dark:border-emerald-950 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setMenuDrawerOpen(false);
                  setRegisterOpen(true);
                }}
                className="w-full py-2.5 rounded-xl bg-[#0F684E] hover:bg-[#0B523D] text-white text-xs font-semibold inline-flex items-center justify-center gap-2 transition"
              >
                <UserPlus className="w-4 h-4" />
                Pendaftaran Calon Pengantin
              </button>
            </div>
          </aside>
        </div>
      )}

      <main id="beranda" className="relative flex-1 flex flex-col bg-white dark:bg-[#060F0C]">
        {/* DEFAULT VIEW: Pure White Porcelain, Imperial Emerald & Champagne Gold Luxury Dashboard */}
        {activeSection === 'beranda' && (
          <section className="relative flex-1 flex flex-col justify-center bg-white dark:bg-[#060F0C]">
            <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-11 lg:py-12 space-y-8 lg:space-y-10">
              <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                {/* Editorial Luxury Institutional Pitch (7 cols) */}
                <div className="lg:col-span-7 space-y-6 sm:space-y-7">
                  <div className="space-y-3.5 sm:space-y-4">
                    <h1 className="font-display text-[clamp(10.5px,3.25vw,14px)] sm:text-[34px] lg:text-[44px] font-semibold tracking-[-0.015em] text-slate-900 dark:text-white leading-[18px] sm:leading-[1.12] whitespace-nowrap sm:whitespace-normal sm:text-balance">
                      Kenali Diri, Pahami Pasangan, Siapkan Pernikahan.
                    </h1>

                    <p className="text-[12px] sm:text-[15px] text-slate-600 dark:text-slate-300 leading-[17px] sm:leading-relaxed max-w-xl">
                      SAMAWA (Sarana Membangun Wawasan Keluarga) Platform Resmi Bimbingan Perkawinan
                      Kementerian Agama Kabupaten Jepara dengan Sistem{' '}
                      <em className="italic font-medium text-slate-900 dark:text-[#FDF6DC]">
                        Blended Learning
                      </em>{' '}
                      guna Mempersiapkan Keluarga Sakinah.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 sm:gap-3.5">
                    <button
                      type="button"
                      onClick={() => setPanduanOpen(true)}
                      className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl border border-[#DFD7C6] dark:border-[#D4AF37]/35 bg-white dark:bg-[#0D1A15] hover:border-[#C9A654] hover:bg-[#FDFCF9] dark:hover:bg-[#11221C] text-slate-800 dark:text-slate-100 text-xs sm:text-sm font-semibold shadow-[0_8px_20px_-14px_rgba(9,66,50,0.3)] transition whitespace-nowrap"
                    >
                      <BookOpen className="w-4 h-4 text-[#0F684E] dark:text-[#F3D882]" />
                      Panduan Aplikasi
                    </button>
                    <button
                      type="button"
                      onClick={() => setKritikOpen(true)}
                      className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl border border-[#DFD7C6] dark:border-[#D4AF37]/30 bg-white dark:bg-[#0D1A15] hover:border-[#C9A654] hover:bg-[#FDFCF9] dark:hover:bg-[#11221C] text-slate-800 dark:text-slate-100 text-xs sm:text-sm font-semibold shadow-[0_8px_20px_-14px_rgba(9,66,50,0.25)] transition whitespace-nowrap"
                    >
                      <MessageSquare className="w-4 h-4 text-[#B08A2E] dark:text-[#F3D882]" />
                      <span>Kritik &amp; Saran</span>
                    </button>
                  </div>

                  {/* Centered Pure-White & Brushed-Gold Luxury KPI Plinth */}
                  <div className="relative rounded-2xl border border-[#E6DFD0] dark:border-[#D4AF37]/25 bg-white dark:bg-[#0B1713] shadow-[0_18px_42px_-24px_rgba(9,66,50,0.22)] dark:shadow-[0_24px_56px_-22px_rgba(0,0,0,0.65)] max-w-xl w-full mx-auto lg:mx-0 overflow-hidden">
                    <div
                      aria-hidden="true"
                      className="h-[2px] w-full bg-gradient-to-r from-[#0F684E]/75 via-[#D4AF37]/85 to-[#0F684E]/75"
                    />
                    <div className="grid grid-cols-3 divide-x divide-[#EFEAE0] dark:divide-[#D4AF37]/18">
                      <div className="flex flex-col items-center justify-start text-center px-2.5 py-4 sm:px-5 sm:py-5 transition-colors hover:bg-[#FCFBF8] dark:hover:bg-white/[0.03]">
                        <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-50 dark:bg-white/10 border border-slate-200/80 dark:border-white/15 text-slate-700 dark:text-emerald-50 flex items-center justify-center mb-2.5">
                          <Users className="w-4 h-4" />
                        </span>
                        <p className="font-mono-num text-2xl sm:text-3xl font-bold tracking-tight leading-none text-slate-900 dark:text-white">
                          {pesertaList.length}
                        </p>
                        <p className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-emerald-100/75 leading-snug mt-1.5">
                          Peserta
                          <br className="sm:hidden" /> Terdaftar
                        </p>
                      </div>
                      <div className="flex flex-col items-center justify-start text-center px-2.5 py-4 sm:px-5 sm:py-5 transition-colors hover:bg-[#FCFBF8] dark:hover:bg-white/[0.03]">
                        <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#0F684E]/[0.08] dark:bg-emerald-400/12 border border-[#0F684E]/20 dark:border-emerald-300/25 text-[#0F684E] dark:text-[#7CE8BE] flex items-center justify-center mb-2.5">
                          <HeartHandshake className="w-4 h-4" />
                        </span>
                        <p className="font-mono-num text-2xl sm:text-3xl font-bold tracking-tight leading-none text-[#0F684E] dark:text-[#7CE8BE]">
                          {totalCouples}
                        </p>
                        <p className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-emerald-100/75 leading-snug mt-1.5">
                          Pasangan
                          <br className="sm:hidden" /> Tersinkron
                        </p>
                      </div>
                      <div className="flex flex-col items-center justify-start text-center px-2.5 py-4 sm:px-5 sm:py-5 transition-colors hover:bg-[#FCFBF8] dark:hover:bg-white/[0.03]">
                        <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#D4AF37]/12 dark:bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#B0821B] dark:text-[#F4D678] flex items-center justify-center mb-2.5">
                          <Award className="w-4 h-4" />
                        </span>
                        <p className="font-mono-num text-2xl sm:text-3xl font-bold tracking-tight leading-none text-[#B0821B] dark:text-[#F4D678]">
                          {totalCertificates}
                        </p>
                        <p className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-emerald-100/75 leading-snug mt-1.5">
                          Sertifikat
                          <br className="sm:hidden" /> Terbit
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sculpted Luxury Concierge Login Vault (5 cols) */}
                <div
                  id="masuk-portal"
                  className="lg:col-span-5 bg-white dark:bg-[#0B1713] border border-[#E2DAC9] dark:border-[#D4AF37]/28 rounded-3xl shadow-[0_24px_60px_-24px_rgba(9,56,42,0.22)] dark:shadow-[0_32px_72px_-20px_rgba(0,0,0,0.65)] overflow-hidden"
                >
                  <div className="h-1.5 w-full bg-gradient-to-r from-[#094735] via-[#D4AF37] to-[#094735]" />
                  <div className="p-6 sm:p-8 space-y-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="text-xl font-bold tracking-[0.04em] text-slate-900 dark:text-white">
                          MASUK
                        </h2>
                        <p className="text-xs sm:text-[13px] text-slate-500 dark:text-slate-400 mt-1">
                          Silahkan masuk ke Aplikasi dengan Akun Anda
                        </p>
                      </div>
                    </div>

                    <form onSubmit={handleLoginSubmit} className="space-y-4">
                      <div>
                        <label
                          htmlFor="login-username"
                          className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5"
                        >
                          Username
                        </label>
                        <div className="relative">
                          <User className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            id="login-username"
                            type="text"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value.replace(/\s+/g, ''))}
                            placeholder="Masukkan username"
                            className="w-full pl-10 pr-3.5 py-2.5 sm:py-3 rounded-xl border border-slate-200/90 dark:border-emerald-900/80 bg-[#FAFAF8] dark:bg-[#07110E] text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none transition focus:bg-white dark:focus:bg-[#0D1A15] focus:border-[#0F684E] dark:focus:border-[#D4AF37]/65 focus:ring-2 focus:ring-[#0F684E]/15 dark:focus:ring-[#D4AF37]/15"
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label
                            htmlFor="login-password"
                            className="text-xs font-semibold text-slate-700 dark:text-slate-200"
                          >
                            Kata Sandi
                          </label>
                          <button
                            type="button"
                            onClick={() => setForgotOpen(true)}
                            className="text-xs font-semibold text-[#0F684E] dark:text-[#F1D680] hover:underline"
                          >
                            Lupa Kata Sandi?
                          </button>
                        </div>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            id="login-password"
                            type={showPass ? 'text' : 'password'}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Masukkan kata sandi"
                            className="w-full pl-10 pr-10 py-2.5 sm:py-3 rounded-xl border border-slate-200/90 dark:border-emerald-900/80 bg-[#FAFAF8] dark:bg-[#07110E] text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none transition focus:bg-white dark:focus:bg-[#0D1A15] focus:border-[#0F684E] dark:focus:border-[#D4AF37]/65 focus:ring-2 focus:ring-[#0F684E]/15 dark:focus:ring-[#D4AF37]/15"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPass((v) => !v)}
                            aria-label="Tampilkan kata sandi"
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
                          >
                            {showPass ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      {loginError && (
                        <p className="text-xs text-red-600 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl px-3.5 py-2.5">
                          {loginError}
                        </p>
                      )}

                      <button
                        type="submit"
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-[#083E2E] via-[#0F684E] to-[#0A4D39] hover:from-[#063124] hover:to-[#083E2E] ring-1 ring-[#D4AF37]/35 text-white text-sm font-semibold inline-flex items-center justify-center gap-2 shadow-[0_14px_30px_-10px_rgba(8,62,46,0.55)] transition group"
                      >
                        Masuk Sistem
                        <ArrowRight className="w-4 h-4 text-[#F3D882] transition-transform group-hover:translate-x-0.5" />
                      </button>
                    </form>

                    <div className="pt-4 border-t border-slate-100 dark:border-emerald-900/70 text-center">
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                        Calon Pengantin belum punya akun?{' '}
                        <button
                          type="button"
                          onClick={() => setRegisterOpen(true)}
                          className="font-semibold text-[#0F684E] dark:text-[#F1D680] hover:underline focus:outline-none focus:underline"
                        >
                          Daftar
                        </button>
                        .
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Luxury Editorial Public Services Strip */}
              <div className="pt-6 border-t border-[#EFEAE0] dark:border-[#D4AF37]/15">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  {[
                    {
                      num: '01',
                      id: 'verifikasi' as const,
                      title: 'Verifikasi QR',
                      desc: 'Cek keabsahan sertifikat & piagam',
                      icon: QrCode,
                    },
                    {
                      num: '02',
                      id: 'statistik' as const,
                      title: 'Statistik 16 KUA',
                      desc: 'Sebaran peserta & kelulusan',
                      icon: BarChart3,
                    },
                    {
                      num: '03',
                      id: 'direktori' as const,
                      title: 'Direktori 16 KUA',
                      desc: 'Alamat Maps, kontak & jam buka',
                      icon: Building2,
                    },
                    {
                      num: '04',
                      id: 'faq' as const,
                      title: 'Galeri & FAQ',
                      desc: 'Dokumentasi & tanya jawab resmi',
                      icon: HelpCircle,
                    },
                  ].map((svc) => {
                    const Icon = svc.icon;
                    return (
                      <button
                        key={svc.id}
                        type="button"
                        onClick={() => navigateSection(svc.id)}
                        className="group text-left p-4 sm:p-[18px] rounded-2xl border border-[#E6DFD0] dark:border-[#D4AF37]/20 bg-white dark:bg-[#0D1A15] hover:border-[#C9A654] dark:hover:border-[#D4AF37]/55 shadow-[0_12px_28px_-22px_rgba(9,42,32,0.24)] dark:shadow-[0_16px_36px_-22px_rgba(0,0,0,0.75)] hover:shadow-[0_18px_36px_-18px_rgba(9,42,32,0.28)] hover:-translate-y-0.5 transition-all duration-200 flex items-start gap-3"
                      >
                        <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0F684E]/10 to-[#D4AF37]/15 dark:from-emerald-950/90 dark:to-[#D4AF37]/18 border border-[#D4AF37]/25 text-[#0B523D] dark:text-[#F1D680] flex items-center justify-center shrink-0 transition-colors duration-200 group-hover:from-[#0B523D] group-hover:to-[#083D2D] group-hover:text-[#F5DC89] group-hover:border-[#D4AF37]/45">
                          <Icon className="w-4 h-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-mono-num text-[10px] font-semibold tracking-wider text-[#B08A2E] dark:text-[#E5C25C]">
                              {svc.num}
                            </span>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0F684E] dark:group-hover:text-[#F1D680] shrink-0 transition-transform group-hover:translate-x-0.5" />
                          </div>
                          <span className="block text-xs sm:text-[13.5px] font-semibold text-slate-900 dark:text-slate-100 truncate mt-0.5">
                            {svc.title}
                          </span>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mt-0.5 line-clamp-2">
                            {svc.desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ON-DEMAND VIEW 1: Verifikasi Keabsahan Dokumen & NIK */}
        {activeSection === 'verifikasi' && (
          <section
            id="verifikasi"
            className="max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14 space-y-6"
          >
            <button
              type="button"
              onClick={() => navigateSection('beranda')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0F684E] dark:text-emerald-400 hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Kembali ke Beranda
            </button>

            <div className="bg-white dark:bg-[#111C18] border border-slate-200 dark:border-emerald-950 rounded-2xl p-6 sm:p-8 space-y-5">
              <div className="space-y-1.5">
                <h1 className="font-display text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white flex items-center gap-2.5">
                  <QrCode className="w-6 h-6 text-[#0F684E] dark:text-emerald-400 shrink-0" />
                  Verifikasi Keabsahan Dokumen &amp; NIK
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Periksa keaslian Sertifikat (<span className="font-mono-num">JPR-...</span>), Piagam Kami Kompak (<span className="font-mono-num">KOMPAK-...</span>), Daftar Hadir (<span className="font-mono-num">ABSEN-...</span>), atau NIK 16 digit peserta Bimbingan Perkawinan.
                </p>
              </div>
              <form onSubmit={handleVerify} className="flex flex-col sm:flex-row gap-2.5">
                <input
                  type="text"
                  value={verifyInput}
                  onChange={(e) => setVerifyInput(e.target.value)}
                  placeholder="Contoh: JPR-JEP-2026-0001, KOMPAK-2026-0001, atau tempel tautan QR"
                  className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 dark:border-emerald-900 bg-[#F8FAF9] dark:bg-[#0D1613] text-xs sm:text-sm font-mono-num outline-none focus:border-[#0F684E]"
                />
                <button
                  type="button"
                  onClick={() => setQrScannerOpen(true)}
                  className="px-4 py-2.5 rounded-lg border border-[#0F684E]/40 dark:border-emerald-700/60 bg-[#0F684E]/5 dark:bg-emerald-950/50 hover:bg-[#0F684E]/10 text-[#0F684E] dark:text-emerald-300 text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-1.5 transition shrink-0"
                >
                  <ScanLine className="w-4 h-4" />
                  Pindai QR
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-slate-900 dark:bg-emerald-700 hover:bg-slate-800 dark:hover:bg-emerald-600 text-white text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-1.5 transition shrink-0"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Periksa Keabsahan
                </button>
              </form>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Tip: Anda dapat memindai QR Code pada Sertifikat, Piagam Kami Kompak, Daftar Hadir, Rapor, atau Kartu Peserta langsung dengan kamera HP maupun mengunggah foto/tangkapan layar QR.
              </p>
            </div>
          </section>
        )}

        {/* ON-DEMAND VIEW 2: Statistik 16 KUA Jepara */}
        {activeSection === 'statistik' && (
          <section
            id="statistik"
            className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6"
          >
            <button
              type="button"
              onClick={() => navigateSection('beranda')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0F684E] dark:text-emerald-400 hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Kembali ke Beranda
            </button>

            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-[#0F684E] dark:text-emerald-400">
                  Transparansi Layanan Publik
                </p>
                <h1 className="font-display text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white mt-1">
                  Sebaran Peserta &amp; Kelulusan 16 KUA Jepara
                </h1>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Data terakumulasi real-time dari seluruh kecamatan · Tahun Anggaran 2026
              </p>
            </div>

            <div className="bg-white dark:bg-[#111C18] border border-slate-200 dark:border-emerald-950 rounded-2xl p-4 sm:p-6 overflow-x-auto">
              <div className="h-72 min-w-[620px] sm:min-w-0 w-full">
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
              <div className="flex items-center justify-between pt-2 text-[11px] text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-4">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-[#0F684E]" /> Total Peserta
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-[#C69214]" /> Sertifikat Terbit
                  </span>
                </div>
                <span className="sm:hidden">Geser grafik untuk melihat 16 KUA →</span>
              </div>
            </div>
          </section>
        )}

        {/* ON-DEMAND VIEW 3: Direktori 16 KUA Kabupaten Jepara */}
        {activeSection === 'direktori' && (
          <section
            id="direktori"
            className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6"
          >
            <button
              type="button"
              onClick={() => navigateSection('beranda')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0F684E] dark:text-emerald-400 hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Kembali ke Beranda
            </button>

            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-[#0F684E] dark:text-emerald-400">
                  Unit Layanan Kecamatan
                </p>
                <h1 className="font-display text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white mt-1">
                  Direktori 16 KUA Kabupaten Jepara
                </h1>
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
              {filteredDirectory.map((entry) => {
                const kuaStat = kuaChartData.find((k) => `KUA ${k.kua}` === entry.kua);
                return (
                  <div
                    key={entry.kua}
                    className="bg-white dark:bg-[#111C18] border border-slate-200 dark:border-emerald-950 rounded-xl p-4 flex flex-col justify-between gap-3 hover:border-[#0F684E]/50 transition"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-bold text-sm text-[#0F684E] dark:text-emerald-400">
                          {entry.kua}
                        </h3>
                        {kuaStat && (
                          <span className="font-mono-num text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                            {kuaStat.lulus}/{kuaStat.peserta} lulus
                          </span>
                        )}
                      </div>
                      <a
                        href={buildKuaGoogleMapsUrl(entry)}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={`Buka lokasi ${entry.kua} di Google Maps`}
                        className="group text-xs text-slate-600 dark:text-slate-300 hover:text-[#0F684E] dark:hover:text-emerald-400 leading-relaxed flex items-start gap-1.5 transition"
                      >
                        <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#0F684E] dark:text-emerald-400" />
                        <span className="underline decoration-dotted underline-offset-2 group-hover:decoration-solid">
                          {entry.alamat}
                        </span>
                        <ExternalLink className="w-3 h-3 shrink-0 mt-0.5 opacity-60 group-hover:opacity-100" />
                      </a>
                      <p className="text-xs font-mono-num text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                        <span>{entry.telp}</span>
                      </p>
                      {entry.whatsapp && (() => {
                        const waNum = normalizeWhatsAppNumber(entry.whatsapp);
                        return waNum ? (
                          <a
                            href={`https://wa.me/${waNum}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-mono-num text-[#0F684E] dark:text-emerald-400 hover:underline flex items-center gap-1.5"
                          >
                            <span>WA: {entry.whatsapp}</span>
                            <ExternalLink className="w-3 h-3 shrink-0 opacity-70" />
                          </a>
                        ) : (
                          <p className="text-xs font-mono-num text-[#0F684E] dark:text-emerald-400">
                            WA: {entry.whatsapp}
                          </p>
                        );
                      })()}
                      {entry.kepalaKua && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          Kepala KUA: {entry.kepalaKua}
                        </p>
                      )}
                      {entry.email && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {entry.email}
                        </p>
                      )}
                      {entry.catatan && (
                        <p className="text-[11px] text-amber-800 dark:text-amber-300 bg-amber-50/70 dark:bg-amber-950/30 rounded-md px-2 py-1">
                          {entry.catatan}
                        </p>
                      )}
                    </div>
                    <div className="pt-2 border-t border-slate-100 dark:border-emerald-950 space-y-2">
                      <p
                        className="text-[11px] text-slate-500 dark:text-slate-400 whitespace-pre-line leading-relaxed"
                        title={entry.jamLayanan.replace(/\s*\n\s*/g, ' | ')}
                      >
                        {entry.jamLayanan}
                      </p>
                      <div className="flex items-center justify-end gap-3">
                        <a
                          href={buildKuaGoogleMapsUrl(entry)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0F684E] dark:text-emerald-400 hover:underline"
                        >
                          <MapPin className="w-3 h-3" />
                          Maps
                        </a>
                        <button
                          type="button"
                          onClick={() => {
                            const parts = [
                              `${entry.kua} — ${entry.alamat}`,
                              `Telp: ${entry.telp}`,
                              entry.whatsapp ? `WA: ${entry.whatsapp}` : '',
                              `Jam Layanan: ${entry.jamLayanan.replace(/\s*\n\s*/g, '; ')}`,
                            ].filter(Boolean);
                            navigator.clipboard?.writeText(parts.join(' | ')).catch(() => {});
                            pushToast('info', `Info ${entry.kua} Disalin`, entry.alamat);
                          }}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-[#0F684E] dark:text-slate-400 dark:hover:text-emerald-400 hover:underline"
                        >
                          <Copy className="w-3 h-3" />
                          Salin
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ON-DEMAND VIEW 4: Galeri Kegiatan & FAQ */}
        {activeSection === 'faq' && (
          <section
            id="faq"
            className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6"
          >
            <button
              type="button"
              onClick={() => navigateSection('beranda')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0F684E] dark:text-emerald-400 hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Kembali ke Beranda
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
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
                      className="p-4 rounded-xl border border-slate-200 dark:border-emerald-950 bg-white dark:bg-[#111C18] space-y-1"
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
                <div className="divide-y divide-slate-200 dark:divide-emerald-950 border border-slate-200 dark:border-emerald-950 rounded-xl overflow-hidden bg-white dark:bg-[#111C18]">
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
        )}
      </main>

      {/* Refined Luxury Institutional Footer */}
      <footer className="border-t border-slate-200/85 dark:border-[#D4AF37]/18 bg-white dark:bg-[#050C0A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
          <div className="flex flex-col items-center sm:items-start leading-relaxed">
            <p className="whitespace-nowrap font-medium text-slate-700 dark:text-slate-200">
              Copyright © Kantor Kementerian Agama Kabupaten Jepara
            </p>
            <p className="whitespace-nowrap">Seksi Bimbingan Masyarakat Islam</p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-2.5 gap-y-1">
              <p className="whitespace-nowrap">SAMAWA (Sarana Membangun Wawasan Keluarga)</p>
              <span aria-hidden="true" className="text-slate-300 dark:text-emerald-900">·</span>
              <button
                type="button"
                onClick={() => setPrivacyOpen(true)}
                className="font-semibold text-[#0F684E] dark:text-[#F1D680] hover:underline"
              >
                Kebijakan Privasi &amp; Ketentuan Layanan
              </button>
            </div>
          </div>
          <nav aria-label="Media sosial resmi" className="flex items-center gap-2 shrink-0">
            <a
              href="https://www.tiktok.com/@bimwinkemenagjepara?is_from_webapp=1&sender_device=pc"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok Bimwin Kemenag Jepara"
              title="TikTok"
              className="w-9 h-9 rounded-lg border border-slate-200/90 dark:border-[#D4AF37]/25 bg-white dark:bg-[#0D1A15] text-slate-600 dark:text-slate-300 hover:border-[#C9A654] hover:text-slate-950 dark:hover:border-[#F1D680] dark:hover:text-white flex items-center justify-center transition"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="w-[17px] h-[17px]">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
              </svg>
            </a>
            <a
              href="https://www.youtube.com/channel/UCiVF-2shdp1FjaNAdgYGlhA"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube Bimwin Kemenag Jepara"
              title="YouTube"
              className="w-9 h-9 rounded-lg border border-slate-200/90 dark:border-[#D4AF37]/25 bg-white dark:bg-[#0D1A15] text-slate-600 dark:text-slate-300 hover:border-[#FF0000]/50 hover:text-[#FF0000] dark:hover:border-red-500/60 dark:hover:text-red-400 flex items-center justify-center transition"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="w-[18px] h-[18px]">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>
            <a
              href="https://www.instagram.com/bimwinkemenagjepara/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram Bimwin Kemenag Jepara"
              title="Instagram"
              className="w-9 h-9 rounded-lg border border-slate-200/90 dark:border-[#D4AF37]/25 bg-white dark:bg-[#0D1A15] text-slate-600 dark:text-slate-300 hover:border-[#E1306C]/50 hover:text-[#E1306C] dark:hover:border-pink-400/60 dark:hover:text-pink-400 flex items-center justify-center transition"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="w-[17px] h-[17px]">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
              </svg>
            </a>
          </nav>
        </div>
      </footer>

      <RegisterModal open={registerOpen} onClose={() => setRegisterOpen(false)} />
      <ForgotPasswordModal open={forgotOpen} onClose={() => setForgotOpen(false)} />
      <KritikSaranModal open={kritikOpen} onClose={() => setKritikOpen(false)} />
      <PanduanModal open={panduanOpen} onClose={() => setPanduanOpen(false)} />
      <PrivacyPolicyModal open={privacyOpen} onClose={() => setPrivacyOpen(false)} />
      <PWAInstallModal open={installModalOpen} onClose={() => setInstallModalOpen(false)} />
      <QRScannerModal
        open={qrScannerOpen}
        onClose={() => setQrScannerOpen(false)}
        title="Pindai QR Code Dokumen Resmi"
        subtitle="Arahkan kamera ke QR Code pada Sertifikat, Piagam Kompak, Daftar Hadir, Laporan, atau unggah gambar QR."
        onDetected={async (code) => {
          setVerifyInput(code);
          const res = await resolveVerificationWithCloud(code);
          setVerifyResult(res);
          pushToast(
            res.valid ? 'success' : 'error',
            res.valid ? 'QR Code Terverifikasi' : 'Dokumen Tidak Ditemukan',
            `Kode terbaca: ${code}`
          );
        }}
      />
      <VerificationModal result={verifyResult} onClose={() => setVerifyResult(null)} />
    </div>
  );
};
