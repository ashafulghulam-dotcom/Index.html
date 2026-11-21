import React, { useEffect, useMemo, useState } from 'react';
import {
  Award,
  Bell,
  BookOpen,
  Calculator,
  Calendar,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Copy,
  CreditCard,
  Download,
  FileCheck2,
  FileText,
  GraduationCap,
  Heart,
  HeartHandshake,
  HelpCircle,
  Lock,
  MessageCircle,
  PlayCircle,
  Printer,
  Share2,
  Sparkles,
  UserCheck,
  UserPlus,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { DEFAULT_KOMPAK_COMMITMENTS, DOA_PENGANTIN } from '../data/jeparaData';
import { useBimwin } from '../store/useBimwinStore';
import { ModuleDefinition } from '../types/bimwin';
import {
  calculateBudgetAllocation,
  calculateCompatibilityScore,
  calculateFertilityWindow,
  calculateStuntingReadiness,
  canAccessModuleQuiz,
  evaluatePesertaStep,
  formatIndonesianDate,
  isUnderageMarriage,
  maskNik,
  normalizeVillageName,
} from '../utils/bimwinLogic';
import { formatDurationClock, resolveRequiredWatchSeconds } from '../utils/videoWatchGuard';
import { CreatePartnerModal } from './AuthModals';
import {
  IkmSurveyModal,
  ModuleReaderModal,
  QuizModal,
  VideoPlayerModal,
} from './LearningModals';
import {
  CertificatePreviewModal,
  PiagamKompakPreviewModal,
  PortfolioPreviewModal,
  StoryCardModal,
} from './OfficialDocuments';
import { KemenagLogo, QRCodeBox } from './UiPrimitives';
import { NavItem, WorkspaceShell } from './WorkspaceShell';

export const PesertaDashboard: React.FC = () => {
  const {
    data,
    currentUser,
    syncPartnerByUsername,
    unlinkPartner,
    completePretest,
    markModuleRead,
    markVideoWatched,
    completeModuleQuiz,
    completePostest,
    markSelesaiClicked,
    submitIkmSurvey,
    saveStuntingCheck,
    saveKompakData,
    rsvpClass,
    submitConsultation,
    submitPostMarriageJournal,
    updateOwnProfile,
    toggleBerkasChecklist,
    markNotificationRead,
    requestConfirm,
    pushToast,
  } = useBimwin();

  const [activeTab, setActiveTab] = useState('belajar');

  // Learning modals
  const [readingModule, setReadingModule] = useState<ModuleDefinition | null>(null);
  const [videoModule, setVideoModule] = useState<ModuleDefinition | null>(null);
  const [quizTarget, setQuizTarget] = useState<
    | { kind: 'pretest' }
    | { kind: 'postest' }
    | { kind: 'module'; module: ModuleDefinition }
    | null
  >(null);
  const [ikmOpen, setIkmOpen] = useState(false);

  // Official documents preview modals
  const [certOpen, setCertOpen] = useState(false);
  const [piagamOpen, setPiagamOpen] = useState(false);
  const [portfolioOpen, setPortfolioOpen] = useState(false);
  const [storyOpen, setStoryOpen] = useState(false);

  // Partner sync state
  const [partnerInput, setPartnerInput] = useState('');
  const [partnerError, setPartnerError] = useState('');
  const [createPartnerOpen, setCreatePartnerOpen] = useState(false);

  // Calculators state
  const [calcTab, setCalcTab] = useState<'keuangan' | 'stunting' | 'subur'>('keuangan');
  const [monthlyIncome, setMonthlyIncome] = useState(5000000);
  const [stuntingForm, setStuntingForm] = useState({
    tinggiCm: currentUser?.stunting?.tinggiCm || 160,
    beratKg: currentUser?.stunting?.beratKg || 54,
    lilaCm: currentUser?.stunting?.lilaCm || 25,
    hbGdL: currentUser?.stunting?.hbGdL || 12.6,
  });
  const [hpht, setHpht] = useState('2026-03-01');
  const [cycleLen, setCycleLen] = useState(28);
  const [periodLen, setPeriodLen] = useState(7);

  // Kami Kompak state
  const [kompakForm, setKompakForm] = useState({
    peranKeluarga:
      currentUser?.kompak?.peranKeluarga || DEFAULT_KOMPAK_COMMITMENTS.peranKeluarga,
    pendidikanKarakter:
      currentUser?.kompak?.pendidikanKarakter || DEFAULT_KOMPAK_COMMITMENTS.pendidikanKarakter,
    disiplinPositif:
      currentUser?.kompak?.disiplinPositif || DEFAULT_KOMPAK_COMMITMENTS.disiplinPositif,
    jawabanKuis: currentUser?.kompak?.jawabanKuis || ({} as Record<number, number>),
  });

  // Doa Pengantin state
  const [doaLang, setDoaLang] = useState<'id' | 'jv' | 'en' | 'ar'>('id');
  const [speakingDoaId, setSpeakingDoaId] = useState<string | null>(null);

  // Konsultasi & Pasca Nikah state
  const [konsulTopik, setKonsulTopik] = useState('Berkas Nikah & SIMKAH');
  const [konsulTanya, setKonsulTanya] = useState('');
  const [jurnalForm, setJurnalForm] = useState({
    bulanKe: 1,
    skorHarmoni: 5,
    catatan: '',
    butuhMediasi: false,
  });

  // Profile edit state
  const [profileForm, setProfileForm] = useState({
    nama: currentUser?.nama || '',
    noHp: currentUser?.noHp || '',
    pekerjaan: currentUser?.pekerjaan || '',
    alamat: currentUser?.alamat || '',
    tanggalRencanaNikah: currentUser?.tanggalRencanaNikah || '',
  });

  // Izin reason per class
  const [izinReasons, setIzinReasons] = useState<Record<string, string>>({});

  // Sync local form drafts whenever active user account changes
  useEffect(() => {
    if (!currentUser) return;
    setProfileForm({
      nama: currentUser.nama || '',
      noHp: currentUser.noHp || '',
      pekerjaan: currentUser.pekerjaan || '',
      alamat: currentUser.alamat || '',
      tanggalRencanaNikah: currentUser.tanggalRencanaNikah || '',
    });
    setStuntingForm({
      tinggiCm: currentUser.stunting?.tinggiCm || 160,
      beratKg: currentUser.stunting?.beratKg || 54,
      lilaCm: currentUser.stunting?.lilaCm || 25,
      hbGdL: currentUser.stunting?.hbGdL || 12.6,
    });
    setKompakForm({
      peranKeluarga:
        currentUser.kompak?.peranKeluarga || DEFAULT_KOMPAK_COMMITMENTS.peranKeluarga,
      pendidikanKarakter:
        currentUser.kompak?.pendidikanKarakter || DEFAULT_KOMPAK_COMMITMENTS.pendidikanKarakter,
      disiplinPositif:
        currentUser.kompak?.disiplinPositif || DEFAULT_KOMPAK_COMMITMENTS.disiplinPositif,
      jawabanKuis: currentUser.kompak?.jawabanKuis || {},
    });
  }, [currentUser?.id]);

  // Stop speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (!currentUser) return null;

  const evalStep = evaluatePesertaStep(currentUser, data.modules.length);
  const partnerUser = data.users.find(
    (u) => u.role === 'Peserta' && u.username === currentUser.pasanganUsername
  );
  const partnerEval = partnerUser
    ? evaluatePesertaStep(partnerUser, data.modules.length)
    : null;

  const myNotifications = data.notifications.filter(
    (n) =>
      (n.targetKua === 'ALL' || n.targetKua === currentUser.kua) &&
      (!n.targetUsername || n.targetUsername === currentUser.username)
  );
  const unreadCount = myNotifications.filter(
    (n) => !n.readBy.includes(currentUser.username)
  ).length;

  const myClasses = data.classes.filter((c) => c.kua === currentUser.kua);
  const myConsultations = data.consultations.filter(
    (c) => c.pesertaUsername === currentUser.username
  );
  const myJournals = data.journals.filter(
    (j) => j.pesertaUsername === currentUser.username
  );

  const budgetResult = useMemo(
    () => calculateBudgetAllocation(monthlyIncome),
    [monthlyIncome]
  );
  const stuntingPreview = useMemo(
    () => calculateStuntingReadiness(stuntingForm),
    [stuntingForm]
  );
  const fertilityResult = useMemo(
    () => calculateFertilityWindow(hpht, cycleLen, periodLen),
    [hpht, cycleLen, periodLen]
  );
  const compatScore = useMemo(
    () =>
      calculateCompatibilityScore(
        kompakForm.jawabanKuis,
        partnerUser?.kompak?.jawabanKuis,
        data.compatibilityQuiz.length
      ),
    [kompakForm.jawabanKuis, partnerUser?.kompak?.jawabanKuis, data.compatibilityQuiz.length]
  );

  const needsDispensasiPA = isUnderageMarriage(currentUser.usia);

  const berkasItems = useMemo(() => {
    const base = [
      {
        key: 'n1_n2_n4',
        title: 'Surat Pengantar Nikah (Model N1, N2, N4)',
        desc: 'Diperoleh dari Kantor Kelurahan/Desa tempat tinggal masing-masing calon pengantin.',
        wajib: true,
        autoDone: false,
      },
      {
        key: 'ktp_kk',
        title: 'Fotokopi e-KTP & Kartu Keluarga (KK)',
        desc: 'KTP dan KK kedua calon pengantin beserta KTP orang tua / wali nikah.',
        wajib: true,
        autoDone: false,
      },
      {
        key: 'akta_ijazah',
        title: 'Fotokopi Akta Kelahiran / Ijazah Terakhir',
        desc: 'Digunakan untuk verifikasi nama lengkap, tempat tanggal lahir, dan nama orang tua di buku nikah.',
        wajib: true,
        autoDone: false,
      },
      {
        key: 'pasfoto_biru',
        title: 'Pasfoto Berlatar Belakang Biru (2×3 & 4×6)',
        desc: 'Masing-masing 4 lembar ukuran 2×3 cm dan 2 lembar ukuran 4×6 cm + file digital untuk SIMKAH.',
        wajib: true,
        autoDone: false,
      },
      {
        key: 'elsimil_tt',
        title: 'Surat Imunisasi TT & Sertifikat Elsimil Puskesmas',
        desc: 'Pemeriksaan kesehatan pra-nikah, skrining gizi/anemia, dan imunisasi Tetanus Toksoid di Puskesmas.',
        wajib: true,
        autoDone: Boolean(currentUser.stunting),
      },
      {
        key: 'sertifikat_bimwin',
        title: 'Sertifikat Bimbingan Perkawinan (BIMWIN) Kemenag',
        desc: 'Otomatis tercentang setelah lulus MOOC 5 modul, mengisi IKM, dan disahkan oleh Fasilitator KUA.',
        wajib: true,
        autoDone: Boolean(currentUser.progress?.verifikasiFasilitator),
      },
      {
        key: 'daftar_simkah',
        title: 'Bukti Pendaftaran Online SIMKAH Web (simkah4.kemenag.go.id)',
        desc: 'Minimal H-10 hari kerja sebelum tanggal pelaksanaan akad nikah di KUA kecamatan.',
        wajib: true,
        autoDone: false,
      },
    ];
    if (needsDispensasiPA) {
      base.push({
        key: 'dispensasi_pa',
        title: 'Penetapan Dispensasi Kawin Pengadilan Agama (Usia < 19 Tahun)',
        desc: 'Wajib berdasarkan UU No. 16 Tahun 2019 apabila salah satu calon pengantin berusia di bawah 19 tahun.',
        wajib: true,
        autoDone: false,
      });
    }
    return base;
  }, [currentUser.progress?.verifikasiFasilitator, currentUser.stunting, needsDispensasiPA]);

  const berkasDoneCount = berkasItems.filter(
    (item) => item.autoDone || Boolean(currentUser.berkasChecklist?.[item.key])
  ).length;
  const berkasPercent = Math.round((berkasDoneCount / berkasItems.length) * 100);

  const daysToAkad = useMemo(() => {
    if (!currentUser.tanggalRencanaNikah) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(`${currentUser.tanggalRencanaNikah}T00:00:00`);
    if (Number.isNaN(target.getTime())) return null;
    return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }, [currentUser.tanggalRencanaNikah]);

  const navItems: NavItem[] = [
    { id: 'belajar', label: 'Ruang Belajar', icon: GraduationCap, badge: `${evalStep.progressPercent}%`, section: 'Pembelajaran MOOC' },
    { id: 'selesai', label: 'Selesai & Dokumen', icon: FileCheck2, badge: evalStep.canDownloadDocuments ? 'Siap' : undefined, section: 'Pembelajaran MOOC' },
    { id: 'kompak', label: 'Piagam Kami Kompak', icon: HeartHandshake, section: 'Pembelajaran MOOC' },
    { id: 'kelas', label: 'Kelas Online & Offline', icon: Calendar, badge: myClasses.length, section: 'Pembelajaran MOOC' },
    { id: 'berkas', label: 'Checklist Berkas SIMKAH', icon: ClipboardCheck, badge: `${berkasDoneCount}/${berkasItems.length}`, section: 'Perangkat Catin' },
    { id: 'kalkulator', label: 'Kalkulator Keluarga', icon: Calculator, section: 'Perangkat Catin' },
    { id: 'doa', label: 'Doa Pengantin (4 Bahasa)', icon: Sparkles, section: 'Perangkat Catin' },
    { id: 'konsultasi', label: 'Pojok Konsultasi', icon: MessageCircle, badge: myConsultations.length || undefined, section: 'Pendampingan' },
    { id: 'pascanikah', label: 'Evaluasi Pasca Nikah', icon: Heart, section: 'Pendampingan' },
    { id: 'dokumen', label: 'Pusat Dokumen & FAQ', icon: HelpCircle, section: 'Pendampingan' },
    { id: 'profil', label: 'Profil, Lencana & ID Card', icon: CreditCard, section: 'Akun Saya' },
    { id: 'notifikasi', label: 'Kotak Masuk Pengingat', icon: Bell, badge: unreadCount || undefined, section: 'Akun Saya' },
  ];

  const formatRupiah = (n: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

  const toggleSpeakDoa = (doaId: string, text: string, lang: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      pushToast('info', 'Browser Anda belum mendukung fitur pembaca suara.');
      return;
    }
    if (speakingDoaId === doaId) {
      window.speechSynthesis.cancel();
      setSpeakingDoaId(null);
      return;
    }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    u.rate = 0.92;
    u.onend = () => setSpeakingDoaId(null);
    u.onerror = () => setSpeakingDoaId(null);
    setSpeakingDoaId(doaId);
    window.speechSynthesis.speak(u);
  };

  const copyDoaText = async (judul: string, arab: string, latin: string, terjemah: string) => {
    const content = `${judul}\n\n${arab}\n\n${latin}\n\nArtinya: ${terjemah}`;
    try {
      await navigator.clipboard.writeText(content);
      pushToast('success', `Teks "${judul}" berhasil disalin.`);
    } catch {
      pushToast('error', 'Gagal menyalin teks doa.');
    }
  };

  return (
    <WorkspaceShell
      navItems={navItems}
      activeTab={activeTab}
      onSelectTab={(tab) => {
        if (tab === 'selesai' && evalStep.canOpenSelesai) markSelesaiClicked();
        setActiveTab(tab);
      }}
      roleLabel="Peserta Calon Pengantin"
      unreadNotifications={unreadCount}
      onOpenNotifications={() => setActiveTab('notifikasi')}
    >
      {/* TAB 1: RUANG BELAJAR (8 LANGKAH) */}
      {activeTab === 'belajar' && (
        <div className="space-y-6">
          {/* 8-Step Progress Summary */}
          <section className="bg-white dark:bg-[#111C18] border border-slate-200 dark:border-emerald-950 rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#0F684E] dark:text-emerald-400">
                  Alur Wajib 8 Langkah · {currentUser.kua}
                </p>
                <h2 className="font-display text-xl sm:text-2xl font-semibold text-slate-900 dark:text-white mt-0.5">
                  {evalStep.nextActionLabel}
                </h2>
              </div>
              <div className="text-left sm:text-right shrink-0">
                <span className="font-mono-num text-2xl font-bold text-[#0F684E] dark:text-emerald-400">
                  {evalStep.progressPercent}%
                </span>
                <p className="text-[11px] text-slate-500">
                  {evalStep.completedSteps.length} dari 8 tahap tuntas
                </p>
              </div>
            </div>

            <div className="h-2 w-full bg-slate-100 dark:bg-emerald-950 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#0F684E] transition-all duration-300"
                style={{ width: `${evalStep.progressPercent}%` }}
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-1.5 text-center text-[11px]">
              {[
                { label: '1. Sinkron', action: () => {} },
                {
                  label: '2. Pretest',
                  action: () => {
                    if (evalStep.canTakePretest) setQuizTarget({ kind: 'pretest' });
                  },
                },
                { label: '3. 5 Modul', action: () => {} },
                {
                  label: '4. Postest',
                  action: () => {
                    if (evalStep.canTakePostest) setQuizTarget({ kind: 'postest' });
                  },
                },
                {
                  label: '5. Selesai',
                  action: () => {
                    if (evalStep.canOpenSelesai) markSelesaiClicked();
                    setActiveTab('selesai');
                  },
                },
                {
                  label: '6. IKM',
                  action: () => {
                    if (evalStep.moocFinished && !currentUser.progress?.ikmDone) setIkmOpen(true);
                    else setActiveTab('selesai');
                  },
                },
                { label: '7. Kelas', action: () => setActiveTab('kelas') },
                { label: '8. Dokumen', action: () => setActiveTab('selesai') },
              ].map((stepItem, idx) => {
                const stepNo = idx + 1;
                const done = evalStep.completedSteps.includes(stepNo);
                const active = evalStep.currentStep === stepNo && !done;
                return (
                  <button
                    key={stepItem.label}
                    type="button"
                    onClick={stepItem.action}
                    className={`px-2 py-2 rounded-lg border font-medium truncate transition cursor-pointer ${
                      done
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-[#0F684E] dark:text-emerald-300 hover:bg-emerald-100/70'
                        : active
                          ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 font-bold hover:bg-amber-100/60'
                          : 'bg-[#F8FAF9] dark:bg-[#0D1613] border-slate-200 dark:border-emerald-950 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    {stepItem.label}
                  </button>
                );
              })}
            </div>
          </section>

          {/* STEP 1: SINKRONISASI PASANGAN */}
          <section className="bg-white dark:bg-[#111C18] border border-slate-200 dark:border-emerald-950 rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Langkah 1 · Wajib Sebelum Pretest
                </p>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Sinkronisasi Akun Pasangan Calon Pengantin
                </h3>
              </div>
              {currentUser.pasanganUsername && (
                <span className="text-xs font-semibold text-[#0F684E] dark:text-emerald-400 inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Tersinkronisasi
                </span>
              )}
            </div>

            {currentUser.pasanganUsername ? (
              <div className="p-4 rounded-xl bg-[#F8FAF9] dark:bg-[#0D1613] border border-slate-200 dark:border-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {currentUser.pasanganNama}{' '}
                    <span className="font-mono-num text-xs font-normal text-slate-500">
                      (@{currentUser.pasanganUsername})
                    </span>
                  </p>
                  {partnerEval && (
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      Progres Pasangan:{' '}
                      <strong className="font-mono-num text-[#0F684E] dark:text-emerald-400">
                        {partnerEval.progressPercent}%
                      </strong>{' '}
                      · Modul Tuntas: {partnerUser?.progress?.modulesCompleted.length || 0}/
                      {data.modules.length} ·{' '}
                      {partnerUser?.progress?.verifikasiFasilitator
                        ? 'Terverifikasi Lulus'
                        : 'Dalam Proses'}
                    </p>
                  )}
                </div>
                {!currentUser.progress?.verifikasiFasilitator && (
                  <button
                    type="button"
                    onClick={() =>
                      requestConfirm({
                        title: 'Lepas Tautan Pasangan?',
                        message:
                          'Tautan akun pasangan akan dilepas sementara. Anda dapat menyinkronkan ulang kapan saja sebelum verifikasi Fasilitator.',
                        confirmLabel: 'Lepas Tautan',
                        danger: true,
                        onConfirm: unlinkPartner,
                      })
                    }
                    className="px-3.5 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-emerald-950 shrink-0"
                  >
                    Ubah Pasangan
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setPartnerError('');
                    const res = syncPartnerByUsername(partnerInput);
                    if (!res.ok) setPartnerError(res.error || 'Gagal menyinkronkan.');
                    else setPartnerInput('');
                  }}
                  className="flex flex-col sm:flex-row gap-2"
                >
                  <input
                    type="text"
                    required
                    value={partnerInput}
                    onChange={(e) => setPartnerInput(e.target.value.replace(/\s+/g, ''))}
                    placeholder="Masukkan username pasangan (contoh: nadia_tahunan)"
                    className="flex-1 px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-emerald-900 bg-[#F8FAF9] dark:bg-[#0D1613] text-xs sm:text-sm outline-none focus:border-[#0F684E]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-lg bg-[#0F684E] hover:bg-[#0B523D] text-white text-xs sm:text-sm font-semibold shrink-0"
                  >
                    Hubungkan Pasangan
                  </button>
                  <button
                    type="button"
                    onClick={() => setCreatePartnerOpen(true)}
                    className="px-4 py-2.5 rounded-lg border border-slate-300 dark:border-emerald-900 text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-1.5 hover:bg-slate-50 dark:hover:bg-emerald-950/60 shrink-0"
                  >
                    <UserPlus className="w-4 h-4 text-[#0F684E]" />
                    Buat Akun Pasangan
                  </button>
                </form>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Syarat sinkronisasi: pilihan <strong>KUA sama ({currentUser.kua})</strong>,{' '}
                  <strong>
                    Desa Tempat Nikah sama ({normalizeVillageName(currentUser.desaTempatNikah, currentUser.kua)})
                  </strong>
                  , serta pasangan <strong>Laki-laki &amp; Perempuan</strong>.
                </p>
                {partnerError && (
                  <p className="text-xs text-red-600 bg-red-50 dark:bg-red-950/40 rounded-lg px-3 py-2">
                    {partnerError}
                  </p>
                )}
              </div>
            )}
          </section>

          {/* STEP 2: PRETEST */}
          <section className="bg-white dark:bg-[#111C18] border border-slate-200 dark:border-emerald-950 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Langkah 2 · Evaluasi Awal
              </p>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Pretest Bimwin (5 Soal)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Mengukur pemahaman awal calon pengantin sebelum membuka 5 modul utama.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <span className="font-mono-num text-sm font-bold text-slate-800 dark:text-slate-200">
                {currentUser.progress?.pretestDone
                  ? `Skor: ${currentUser.progress.pretestScore}/100`
                  : 'Belum dikerjakan'}
              </span>
              <button
                type="button"
                disabled={!evalStep.canTakePretest}
                onClick={() => setQuizTarget({ kind: 'pretest' })}
                className={`px-4 py-2 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition ${
                  evalStep.canTakePretest
                    ? 'bg-[#0F684E] hover:bg-[#0B523D] text-white'
                    : 'bg-slate-200 dark:bg-emerald-950 text-slate-400 cursor-not-allowed'
                }`}
              >
                {!evalStep.canTakePretest && <Lock className="w-3.5 h-3.5" />}
                {currentUser.progress?.pretestDone ? 'Ulangi Pretest' : 'Mulai Pretest'}
              </button>
            </div>
          </section>

          {/* STEP 3: 5 MODUL KURIKULUM */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Langkah 3 · Kurikulum Nasional Kemenag RI
                </p>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  5 Modul Bimbingan Perkawinan Mandiri
                </h3>
              </div>
              <span className="font-mono-num text-xs font-semibold text-slate-500">
                {currentUser.progress?.modulesCompleted.length || 0} / {data.modules.length} Lulus
              </span>
            </div>

            <div className="space-y-3">
              {data.modules.map((mod) => {
                const orderedIds = data.modules.map((m) => m.id);
                const access = canAccessModuleQuiz(currentUser, mod.id, orderedIds);
                const unlocked = access.unlocked;
                const videoDone = access.videoDone;
                const canTakeQuiz = access.canTakeQuiz;
                const passed = Boolean(currentUser.progress?.modulesCompleted.includes(mod.id));
                const score = currentUser.progress?.moduleScores[mod.id];
                const minWatchLabel = formatDurationClock(resolveRequiredWatchSeconds(mod));

                return (
                  <div
                    key={mod.id}
                    className={`bg-white dark:bg-[#111C18] border rounded-2xl p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition ${
                      passed
                        ? 'border-emerald-300 dark:border-emerald-800'
                        : 'border-slate-200 dark:border-emerald-950'
                    }`}
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="font-mono-num font-bold text-[#0F684E] dark:text-emerald-400">
                          MODUL 0{mod.id}
                        </span>
                        <span className="text-slate-300 dark:text-slate-600">·</span>
                        <span className="text-slate-500 font-mono-num">
                          Video {minWatchLabel}
                        </span>
                        {passed && (
                          <>
                            <span className="text-slate-300 dark:text-slate-600">·</span>
                            <span className="text-emerald-700 dark:text-emerald-400 font-semibold font-mono-num">
                              Lulus ({score}%)
                            </span>
                          </>
                        )}
                      </div>
                      <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                        {mod.judul}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{mod.desc}</p>
                      {unlocked && !videoDone && (
                        <p className="text-[11px] font-medium text-amber-700 dark:text-amber-400 pt-0.5">
                          Tonton video pembelajaran hingga selesai ({minWatchLabel}) untuk membuka tombol Kuis Modul 0{mod.id}.
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        type="button"
                        disabled={!unlocked}
                        onClick={() => {
                          markModuleRead(mod.id);
                          setReadingModule(mod);
                        }}
                        className={`px-3.5 py-2 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 border transition ${
                          unlocked
                            ? 'border-slate-300 dark:border-emerald-900 hover:bg-slate-50 dark:hover:bg-emerald-950/60 text-slate-800 dark:text-slate-200'
                            : 'border-slate-200 dark:border-emerald-950 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        Ringkasan Materi
                      </button>

                      <button
                        type="button"
                        disabled={!unlocked}
                        onClick={() => setVideoModule(mod)}
                        className={`px-3.5 py-2 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 border transition ${
                          unlocked
                            ? videoDone
                              ? 'border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/30'
                              : 'border-[#0F684E] text-[#0F684E] dark:border-emerald-600 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/60'
                            : 'border-slate-200 dark:border-emerald-950 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        <PlayCircle className="w-3.5 h-3.5" />
                        {videoDone ? 'Video Tuntas' : 'Tonton Video'}
                      </button>

                      <button
                        type="button"
                        disabled={!canTakeQuiz}
                        title={
                          canTakeQuiz
                            ? `Kerjakan Kuis Modul 0${mod.id}`
                            : access.reason
                        }
                        onClick={() => {
                          if (!canTakeQuiz) return;
                          setQuizTarget({ kind: 'module', module: mod });
                        }}
                        className={`px-4 py-2 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition ${
                          canTakeQuiz
                            ? 'bg-[#0F684E] hover:bg-[#0B523D] text-white'
                            : 'bg-slate-200 dark:bg-emerald-950 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        {!canTakeQuiz && <Lock className="w-3.5 h-3.5" />}
                        {passed ? 'Ulangi Kuis' : 'Kerjakan Kuis'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* STEP 4: POSTEST (BERURUTAN DI BAWAH 5 MODUL) */}
          <section className="bg-white dark:bg-[#111C18] border border-slate-200 dark:border-emerald-950 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Langkah 4 · Evaluasi Akhir
              </p>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Postest Bimwin (5 Soal)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Terbuka setelah seluruh 5 modul lulus kuis (≥80%). Mengukur peningkatan pemahaman (Before-After Gain).
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <span className="font-mono-num text-sm font-bold text-slate-800 dark:text-slate-200">
                {currentUser.progress?.postestDone
                  ? `Skor: ${currentUser.progress.postestScore}/100 (Gain ${
                      (currentUser.progress.postestScore || 0) -
                      (currentUser.progress.pretestScore || 0) >=
                      0
                        ? '+'
                        : ''
                    }${
                      (currentUser.progress.postestScore || 0) -
                      (currentUser.progress.pretestScore || 0)
                    })`
                  : 'Terkunci hingga 5 modul tuntas'}
              </span>
              <button
                type="button"
                disabled={!evalStep.canTakePostest}
                onClick={() => setQuizTarget({ kind: 'postest' })}
                className={`px-4 py-2 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition ${
                  evalStep.canTakePostest
                    ? 'bg-[#0F684E] hover:bg-[#0B523D] text-white'
                    : 'bg-slate-200 dark:bg-emerald-950 text-slate-400 cursor-not-allowed'
                }`}
              >
                {!evalStep.canTakePostest && <Lock className="w-3.5 h-3.5" />}
                {currentUser.progress?.postestDone ? 'Ulangi Postest' : 'Mulai Postest'}
              </button>
            </div>
          </section>
        </div>
      )}

      {/* TAB 2: MENU SELESAI & 4 DOKUMEN RESMI */}
      {activeTab === 'selesai' && (
        <div className="space-y-6">
          <section className="bg-white dark:bg-[#111C18] border border-slate-200 dark:border-emerald-950 rounded-2xl p-6 space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#0F684E] dark:text-emerald-400">
                Tahap Akhir Kelulusan (Langkah 5–8)
              </p>
              <h2 className="font-display text-2xl font-semibold text-slate-900 dark:text-white mt-0.5">
                Verifikasi Kelulusan &amp; Unduhan 4 Dokumen Resmi
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-emerald-950 bg-[#F8FAF9] dark:bg-[#0D1613] space-y-2">
                <p className="text-xs font-semibold text-slate-500">Syarat 1 · MOOC 5 Modul &amp; Postest</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {evalStep.moocFinished ? 'Tuntas 100%' : 'Belum Tuntas'}
                </p>
                <p className="text-xs text-slate-500">
                  {evalStep.moocFinished
                    ? `Postest ${currentUser.progress?.postestScore}/100`
                    : 'Selesaikan Langkah 1–4 terlebih dahulu.'}
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-emerald-950 bg-[#F8FAF9] dark:bg-[#0D1613] flex flex-col justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold text-slate-500">Syarat 2 · Survei IKM (Langkah 6)</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                    {currentUser.progress?.ikmDone ? 'Sudah Mengisi IKM' : 'Wajib Diisi'}
                  </p>
                </div>
                {!currentUser.progress?.ikmDone && (
                  <button
                    type="button"
                    disabled={!evalStep.moocFinished}
                    onClick={() => setIkmOpen(true)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold w-fit ${
                      evalStep.moocFinished
                        ? 'bg-[#0F684E] hover:bg-[#0B523D] text-white'
                        : 'bg-slate-200 dark:bg-emerald-950 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    Isi Survei IKM Sekarang
                  </button>
                )}
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-emerald-950 bg-[#F8FAF9] dark:bg-[#0D1613] flex flex-col justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold text-slate-500">
                    Syarat 3 · Kelas &amp; Verifikasi Fasilitator
                  </p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                    {currentUser.progress?.verifikasiFasilitator
                      ? 'Sah & Terverifikasi'
                      : 'Menunggu Pengesahan KUA'}
                  </p>
                </div>
                {!currentUser.progress?.verifikasiFasilitator && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('kelas')}
                    className="text-xs font-semibold text-[#0F684E] dark:text-emerald-400 hover:underline w-fit"
                  >
                    Pilih Jadwal Kelas KUA →
                  </button>
                )}
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                title: '1. Sertifikat Bimwin Mandiri (A4 Horizontal)',
                desc: 'Sertifikat resmi Kemenag Kabupaten Jepara format A4 Horizontal siap cetak & PDF ber-QR Code untuk berkas SIMKAH KUA.',
                icon: Award,
                action: () => setCertOpen(true),
              },
              {
                title: '2. Piagam Komitmen "Kami Kompak" (A4 Vertikal)',
                desc: 'Piagam kesepakatan visi keluarga & pola asuh positif format A4 Vertikal siap cetak ditandatangani kedua mempelai.',
                icon: HeartHandshake,
                action: () => setPiagamOpen(true),
              },
              {
                title: '3. Rapor Portofolio Catin (A4 Vertikal)',
                desc: 'Ringkasan nilai Pretest, Postest, 5 Modul, skrining stunting, dan catatan Fasilitator format A4 siap cetak.',
                icon: FileText,
                action: () => setPortfolioOpen(true),
              },
              {
                title: '4. Kartu Story WA / IG / TikTok',
                desc: 'Desain latar putih bersih HD 1080×1920 PNG ber-QR Code siap dibagikan untuk syiar keluarga sakinah.',
                icon: Share2,
                action: () => setStoryOpen(true),
              },
            ].map((doc) => {
              const Icon = doc.icon;
              return (
                <div
                  key={doc.title}
                  className="bg-white dark:bg-[#111C18] border border-slate-200 dark:border-emerald-950 rounded-2xl p-5 flex flex-col justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <Icon className="w-5 h-5 text-[#0F684E] dark:text-emerald-400" />
                    <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                      {doc.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {doc.desc}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={!evalStep.canDownloadDocuments}
                    onClick={doc.action}
                    className={`w-full py-2.5 rounded-lg text-xs font-semibold inline-flex items-center justify-center gap-2 transition ${
                      evalStep.canDownloadDocuments
                        ? 'bg-[#0F684E] hover:bg-[#0B523D] text-white'
                        : 'bg-slate-100 dark:bg-emerald-950/60 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {evalStep.canDownloadDocuments ? (
                      <>
                        <Download className="w-4 h-4" />
                        Buka &amp; Cetak Dokumen
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        Terkunci — Lengkapi IKM &amp; Verifikasi Fasilitator
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </section>
        </div>
      )}

      {/* TAB 3: PIAGAM KAMI KOMPAK & KUIS KECOCOKAN */}
      {activeTab === 'kompak' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#111C18] border border-slate-200 dark:border-emerald-950 rounded-2xl p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-emerald-950 pb-4">
              <div>
                <h2 className="font-display text-2xl font-semibold text-slate-900 dark:text-white">
                  Kuis Kecocokan &amp; Piagam "Kami Kompak"
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Selaraskan visi komunikasi, keuangan, peran domestik, dan pengasuhan anak bersama pasangan.
                </p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-[11px] text-slate-500">Skor Keselarasan Pasangan</p>
                <p className="font-mono-num text-xl font-bold text-[#0F684E] dark:text-emerald-400">
                  {compatScore.percent}% · <span className="text-xs font-sans">{compatScore.label}</span>
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {data.compatibilityQuiz.map((q) => {
                const partnerChoice = partnerUser?.kompak?.jawabanKuis?.[q.id];
                return (
                  <div
                    key={q.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-emerald-950 bg-[#F8FAF9] dark:bg-[#0D1613] space-y-2.5"
                  >
                    <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">
                      {q.id}. {q.tanya}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {q.opsi.map((opt, idx) => {
                        const mine = kompakForm.jawabanKuis[q.id] === idx;
                        const isPartner = partnerChoice === idx;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() =>
                              setKompakForm((prev) => ({
                                ...prev,
                                jawabanKuis: { ...prev.jawabanKuis, [q.id]: idx },
                              }))
                            }
                            className={`text-left px-3 py-2 rounded-lg border text-xs transition ${
                              mine
                                ? 'border-[#0F684E] bg-emerald-50 dark:bg-emerald-950/60 font-semibold text-slate-900 dark:text-white'
                                : 'border-slate-200 dark:border-emerald-900 bg-white dark:bg-[#111C18]'
                            }`}
                          >
                            {opt}
                            {isPartner && (
                              <span className="block text-[10px] font-semibold text-amber-600 dark:text-amber-400 mt-1">
                                Pilihan {partnerUser?.nama}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-emerald-950">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                3 Komitmen Tertulis Piagam Pasangan
              </h3>
              <div>
                <label className="block text-xs font-semibold mb-1">
                  1. Kesalingan Peran &amp; Kesehatan Keluarga
                </label>
                <textarea
                  rows={2}
                  value={kompakForm.peranKeluarga}
                  onChange={(e) => setKompakForm({ ...kompakForm, peranKeluarga: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-[#F8FAF9] dark:bg-[#0D1613] text-xs sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">
                  2. Moderasi Beragama &amp; Pendidikan Karakter Anak
                </label>
                <textarea
                  rows={2}
                  value={kompakForm.pendidikanKarakter}
                  onChange={(e) =>
                    setKompakForm({ ...kompakForm, pendidikanKarakter: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-[#F8FAF9] dark:bg-[#0D1613] text-xs sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">
                  3. Pengasuhan &amp; Disiplin Positif Tanpa Kekerasan
                </label>
                <textarea
                  rows={2}
                  value={kompakForm.disiplinPositif}
                  onChange={(e) =>
                    setKompakForm({ ...kompakForm, disiplinPositif: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-[#F8FAF9] dark:bg-[#0D1613] text-xs sm:text-sm"
                />
              </div>

              <div className="flex flex-wrap justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => saveKompakData(kompakForm)}
                  className="px-5 py-2 rounded-lg bg-[#0F684E] hover:bg-[#0B523D] text-white text-xs font-semibold"
                >
                  Simpan Kesepakatan Pasangan
                </button>
                {evalStep.canDownloadDocuments && (
                  <button
                    type="button"
                    onClick={() => setPiagamOpen(true)}
                    className="px-4 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 text-xs font-semibold inline-flex items-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Pratinjau &amp; Cetak Piagam
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: KELAS ONLINE & OFFLINE */}
      {activeTab === 'kelas' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="font-display text-2xl font-semibold text-slate-900 dark:text-white">
                Jadwal Kelas Bimwin — {currentUser.kua}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Status Kehadiran Anda saat ini:{' '}
                <strong className="text-[#0F684E] dark:text-emerald-400">
                  {currentUser.progress?.kehadiranKelas || 'Belum Hadir'}
                </strong>
              </p>
            </div>
          </div>

          {myClasses.length === 0 ? (
            <div className="bg-white dark:bg-[#111C18] border border-slate-200 dark:border-emerald-950 rounded-2xl p-8 text-center text-sm text-slate-500">
              Belum ada jadwal kelas aktif di {currentUser.kua}. Silakan hubungi Fasilitator melalui Pojok Konsultasi.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myClasses.map((cls) => {
                const myRsvp = cls.rsvps.find((r) => r.username === currentUser.username);
                return (
                  <div
                    key={cls.id}
                    className="bg-white dark:bg-[#111C18] border border-slate-200 dark:border-emerald-950 rounded-2xl p-5 flex flex-col justify-between gap-4"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold uppercase tracking-wider text-[#0F684E] dark:text-emerald-400">
                          Kelas {cls.tipe}
                        </span>
                        <span className="font-mono-num text-slate-500">{cls.kodeAbsen}</span>
                      </div>
                      <h3 className="font-bold text-base text-slate-900 dark:text-white">
                        {cls.judul}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 font-mono-num">
                        {formatIndonesianDate(cls.tanggal)} · {cls.waktu}
                      </p>
                      <p className="text-xs text-slate-500">
                        Lokasi / Tautan: <span className="font-medium text-slate-700 dark:text-slate-200">{cls.lokasiAtauLink}</span>
                      </p>
                      <p className="text-xs text-slate-500">Narasumber: {cls.narasumber}</p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-emerald-950 space-y-2.5">
                      {myRsvp && (
                        <p className="text-xs font-semibold text-[#0F684E] dark:text-emerald-400">
                          Konfirmasi Anda: {myRsvp.status}
                          {myRsvp.verifiedHadir ? ' · Terverifikasi Hadir oleh Fasilitator' : ''}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => rsvpClass(cls.id, 'InsyaAllah Hadir')}
                          className="px-3.5 py-2 rounded-lg bg-[#0F684E] hover:bg-[#0B523D] text-white text-xs font-semibold"
                        >
                          InsyaAllah Hadir
                        </button>
                        <input
                          type="text"
                          value={izinReasons[cls.id] || ''}
                          onChange={(e) =>
                            setIzinReasons((prev) => ({ ...prev, [cls.id]: e.target.value }))
                          }
                          placeholder="Alasan izin (opsional)"
                          className="flex-1 min-w-[140px] px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-emerald-900 bg-[#F8FAF9] dark:bg-[#0D1613] text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => rsvpClass(cls.id, 'Izin', izinReasons[cls.id])}
                          className="px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 text-xs font-semibold"
                        >
                          Izin
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB BARU: CHECKLIST BERKAS SIMKAH & HITUNG MUNDUR AKAD NIKAH */}
      {activeTab === 'berkas' && (
        <div className="space-y-5">
          <section className="bg-white dark:bg-[#111C18] border border-slate-200 dark:border-emerald-950 rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#0F684E] dark:text-emerald-400">
                  Persiapan Administrasi · {currentUser.kua}
                </p>
                <h2 className="font-display text-2xl font-semibold text-slate-900 dark:text-white mt-0.5">
                  Checklist Berkas Nikah SIMKAH &amp; Hitung Mundur Akad
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Tandai dokumen yang sudah siap agar berkas pendaftaran di KUA Kecamatan lengkap tepat waktu (minimal H-10 hari kerja).
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#094232] text-white shrink-0 min-w-[210px]">
                <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-amber-300 font-semibold">
                  <Clock className="w-3.5 h-3.5" />
                  Hitung Mundur Akad
                </div>
                {daysToAkad !== null ? (
                  <>
                    <p className="font-mono-num text-xl sm:text-2xl font-bold mt-1">
                      {daysToAkad > 0
                        ? `H-${daysToAkad} Hari`
                        : daysToAkad === 0
                          ? 'Hari Ini!'
                          : 'Jadwal Terlaksana'}
                    </p>
                    <p className="text-[11px] text-emerald-100 mt-0.5">
                      Rencana: {formatIndonesianDate(currentUser.tanggalRencanaNikah)}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-bold mt-1">Tanggal Belum Diisi</p>
                    <button
                      type="button"
                      onClick={() => setActiveTab('profil')}
                      className="text-[11px] text-amber-300 underline mt-1"
                    >
                      Atur di Profil Akun →
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-emerald-950">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  Kesiapan Dokumen KUA
                </span>
                <span className="font-mono-num font-bold text-[#0F684E] dark:text-emerald-400">
                  {berkasDoneCount}/{berkasItems.length} berkas ({berkasPercent}%)
                </span>
              </div>
              <div className="h-2 w-full bg-slate-100 dark:bg-emerald-950 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#0F684E] transition-all duration-300"
                  style={{ width: `${berkasPercent}%` }}
                />
              </div>
            </div>
          </section>

          <section className="space-y-2.5">
            {berkasItems.map((item) => {
              const checked = item.autoDone || Boolean(currentUser.berkasChecklist?.[item.key]);
              return (
                <label
                  key={item.key}
                  className={`flex items-start gap-3.5 p-4 rounded-2xl border transition cursor-pointer ${
                    checked
                      ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800'
                      : 'bg-white dark:bg-[#111C18] border-slate-200 dark:border-emerald-950 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={item.autoDone}
                    onChange={() => toggleBerkasChecklist(item.key)}
                    className="mt-1 w-4 h-4 accent-[#0F684E] shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-sm font-bold ${
                          checked
                            ? 'text-[#0F684E] dark:text-emerald-300 line-through decoration-emerald-500/60'
                            : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {item.title}
                      </span>
                      {item.autoDone && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900 text-[#0F684E] dark:text-emerald-200">
                          Terverifikasi Sistem
                        </span>
                      )}
                      {item.key === 'dispensasi_pa' && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                          Wajib Usia &lt; 19 Th
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </label>
              );
            })}
          </section>
        </div>
      )}

      {/* TAB 5: KALKULATOR KELUARGA (KEUANGAN, STUNTING, MASA SUBUR) */}
      {activeTab === 'kalkulator' && (
        <div className="space-y-5">
          <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-emerald-950 pb-3">
            {(
              [
                { id: 'keuangan', label: '1. Kalkulator Keuangan (50/20/10/10/10)' },
                { id: 'stunting', label: '2. Skrining Cegah Stunting (IMT, LiLA, Hb)' },
                { id: 'subur', label: '3. Masa Subur & Fiqih Haid' },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setCalcTab(t.id)}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
                  calcTab === t.id
                    ? 'bg-[#0F684E] text-white'
                    : 'bg-white dark:bg-[#111C18] border border-slate-200 dark:border-emerald-950 text-slate-700 dark:text-slate-300'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {calcTab === 'keuangan' && (
            <div className="bg-white dark:bg-[#111C18] border border-slate-200 dark:border-emerald-950 rounded-2xl p-6 space-y-5">
              <div>
                <h2 className="font-display text-xl font-semibold">Simulasi Anggaran Rumah Tangga Sakinah</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Rumus sehat 50% kebutuhan pokok, 20% tabungan awal bulan (Pay Yourself First), 10% dana darurat, 10% zakat/sosial, dan 10% rekreasional.
                </p>
              </div>
              <div className="max-w-sm">
                <label className="block text-xs font-semibold mb-1">
                  Total Penghasilan Bulanan Keluarga (Rp)
                </label>
                <input
                  type="number"
                  min={0}
                  step={100000}
                  value={monthlyIncome}
                  onChange={(e) => setMonthlyIncome(Number(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-emerald-900 bg-[#F8FAF9] dark:bg-[#0D1613] font-mono-num text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {[
                  { label: 'Kebutuhan Pokok (50%)', val: budgetResult.pokok50 },
                  { label: 'Tabungan & Investasi (20%)', val: budgetResult.tabungan20 },
                  { label: 'Dana Darurat (10%)', val: budgetResult.darurat10 },
                  { label: 'Zakat / Infak / Orang Tua (10%)', val: budgetResult.sosialZakat10 },
                  { label: 'Hiburan & Pengembangan (10%)', val: budgetResult.hiburan10 },
                ].map((pos) => (
                  <div
                    key={pos.label}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-emerald-950 bg-[#F8FAF9] dark:bg-[#0D1613]"
                  >
                    <p className="text-[11px] text-slate-500">{pos.label}</p>
                    <p className="font-mono-num text-base font-bold text-slate-900 dark:text-white mt-1">
                      {formatRupiah(pos.val)}
                    </p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Target Ideal Dana Darurat (3–6× biaya pokok):{' '}
                <strong className="font-mono-num text-[#0F684E] dark:text-emerald-400">
                  {formatRupiah(budgetResult.targetDanaDaruratMin)} –{' '}
                  {formatRupiah(budgetResult.targetDanaDaruratMax)}
                </strong>
              </p>
            </div>
          )}

          {calcTab === 'stunting' && (
            <div className="bg-white dark:bg-[#111C18] border border-slate-200 dark:border-emerald-950 rounded-2xl p-6 space-y-5">
              <div>
                <h2 className="font-display text-xl font-semibold">
                  Skrining Kesiapan Gizi Pra-Nikah &amp; Cegah Stunting
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Standar Kemenkes RI: IMT 18,5–24,9 · Lingkar Lengan Atas (LiLA) ≥ 23,5 cm · Hemoglobin (Hb) ≥ 12,0 g/dL.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold mb-1">Tinggi Badan (cm)</label>
                  <input
                    type="number"
                    value={stuntingForm.tinggiCm}
                    onChange={(e) =>
                      setStuntingForm({ ...stuntingForm, tinggiCm: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-[#F8FAF9] dark:bg-[#0D1613] font-mono-num text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Berat Badan (kg)</label>
                  <input
                    type="number"
                    value={stuntingForm.beratKg}
                    onChange={(e) =>
                      setStuntingForm({ ...stuntingForm, beratKg: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-[#F8FAF9] dark:bg-[#0D1613] font-mono-num text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">LiLA (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={stuntingForm.lilaCm}
                    onChange={(e) =>
                      setStuntingForm({ ...stuntingForm, lilaCm: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-[#F8FAF9] dark:bg-[#0D1613] font-mono-num text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Kadar Hb (g/dL)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={stuntingForm.hbGdL}
                    onChange={(e) =>
                      setStuntingForm({ ...stuntingForm, hbGdL: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-[#F8FAF9] dark:bg-[#0D1613] font-mono-num text-sm"
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-emerald-950 bg-[#F8FAF9] dark:bg-[#0D1613] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-slate-500">Hasil Analisis Kesiapan Gizi</p>
                  <p
                    className={`text-base font-bold ${
                      stuntingPreview.status === 'Siap Hamil / Ideal'
                        ? 'text-[#0F684E] dark:text-emerald-400'
                        : 'text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {stuntingPreview.status}
                  </p>
                  <p className="text-xs font-mono-num text-slate-600 dark:text-slate-300">
                    IMT: {stuntingPreview.imt} ({stuntingPreview.imtCategory}) · KEK:{' '}
                    {stuntingPreview.kekRisk ? 'Berisiko (<23,5 cm)' : 'Normal'} · Anemia:{' '}
                    {stuntingPreview.anemiaRisk ? 'Berisiko (<12 g/dL)' : 'Normal'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => saveStuntingCheck(stuntingPreview)}
                  className="px-4 py-2.5 rounded-lg bg-[#0F684E] hover:bg-[#0B523D] text-white text-xs font-semibold shrink-0"
                >
                  Simpan ke Rapor Portofolio
                </button>
              </div>
            </div>
          )}

          {calcTab === 'subur' && (
            <div className="bg-white dark:bg-[#111C18] border border-slate-200 dark:border-emerald-950 rounded-2xl p-6 space-y-5">
              <div>
                <h2 className="font-display text-xl font-semibold">
                  Kalkulator Masa Subur &amp; Panduan Fiqih Haid
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Perhitungan berbasis Hari Pertama Haid Terakhir (HPHT) dan kaidah fiqih ibadah.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold mb-1">Tanggal HPHT</label>
                  <input
                    type="date"
                    value={hpht}
                    onChange={(e) => setHpht(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-[#F8FAF9] dark:bg-[#0D1613] font-mono-num text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Panjang Siklus (Hari)</label>
                  <input
                    type="number"
                    min={21}
                    max={45}
                    value={cycleLen}
                    onChange={(e) => setCycleLen(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-[#F8FAF9] dark:bg-[#0D1613] font-mono-num text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Lama Haid (Hari)</label>
                  <input
                    type="number"
                    min={1}
                    max={15}
                    value={periodLen}
                    onChange={(e) => setPeriodLen(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-[#F8FAF9] dark:bg-[#0D1613] font-mono-num text-sm"
                  />
                </div>
              </div>

              {fertilityResult && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-xl border border-slate-200 dark:border-emerald-950 bg-[#F8FAF9] dark:bg-[#0D1613]">
                      <p className="text-[11px] text-slate-500">Perkiraan Suci Haid</p>
                      <p className="font-mono-num font-bold text-sm mt-1">
                        {fertilityResult.perkiraanSuciHaid}
                      </p>
                    </div>
                    <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/30">
                      <p className="text-[11px] text-[#0F684E] dark:text-emerald-400">
                        Jendela Masa Subur (Puncak: {fertilityResult.puncakOvulasi})
                      </p>
                      <p className="font-mono-num font-bold text-sm mt-1">
                        {fertilityResult.awalMasaSubur} – {fertilityResult.akhirMasaSubur}
                      </p>
                    </div>
                    <div className="p-3.5 rounded-xl border border-slate-200 dark:border-emerald-950 bg-[#F8FAF9] dark:bg-[#0D1613]">
                      <p className="text-[11px] text-slate-500">Perkiraan Haid Berikutnya</p>
                      <p className="font-mono-num font-bold text-sm mt-1">
                        {fertilityResult.perkiraanHaidBerikutnya}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    <strong>Catatan Fiqih:</strong> {fertilityResult.fiqihNote}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 6: DOA PENGANTIN (4 BAHASA + TTS) */}
      {activeTab === 'doa' && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-semibold">Tuntunan Doa Pengantin</h2>
              <p className="text-xs text-slate-500">
                Lengkap dengan teks Arab, transliterasi Latin, terjemahan 4 bahasa, dan pembaca suara.
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              {(['id', 'jv', 'en', 'ar'] as const).map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setDoaLang(code)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                    doaLang === code
                      ? 'bg-[#0F684E] text-white'
                      : 'bg-white dark:bg-[#111C18] border border-slate-200 dark:border-emerald-950'
                  }`}
                >
                  {code === 'id' ? 'Indonesia' : code === 'jv' ? 'Jawa Krama' : code === 'en' ? 'English' : 'العربية'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {DOA_PENGANTIN.map((doa) => (
              <div
                key={doa.id}
                className="bg-white dark:bg-[#111C18] border border-slate-200 dark:border-emerald-950 rounded-2xl p-6 space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">{doa.judul}</h3>
                    <p className="text-xs text-slate-500">{doa.subjudul}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() =>
                        copyDoaText(doa.judul, doa.arab, doa.latin, doa.translations[doaLang])
                      }
                      className="p-2 rounded-lg border border-slate-200 dark:border-emerald-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-emerald-950/60"
                      title="Salin teks doa"
                      aria-label={`Salin ${doa.judul}`}
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        toggleSpeakDoa(
                          doa.id,
                          doa.translations[doaLang],
                          doaLang === 'en' ? 'en-US' : doaLang === 'ar' ? 'ar-SA' : 'id-ID'
                        )
                      }
                      className={`p-2 rounded-lg border transition ${
                        speakingDoaId === doa.id
                          ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'
                          : 'border-slate-200 dark:border-emerald-900 text-[#0F684E] dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/60'
                      }`}
                      title={speakingDoaId === doa.id ? 'Hentikan suara' : 'Bacakan doa'}
                      aria-label={
                        speakingDoaId === doa.id
                          ? `Hentikan pembacaan ${doa.judul}`
                          : `Bacakan ${doa.judul}`
                      }
                    >
                      {speakingDoaId === doa.id ? (
                        <VolumeX className="w-4 h-4" />
                      ) : (
                        <Volume2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
                <p
                  dir="rtl"
                  className="text-xl sm:text-2xl leading-loose text-right font-serif text-[#094232] dark:text-emerald-300 bg-[#F8FAF9] dark:bg-[#0D1613] p-4 rounded-xl border border-slate-200 dark:border-emerald-950"
                >
                  {doa.arab}
                </p>
                <p className="text-xs italic text-slate-600 dark:text-slate-300">{doa.latin}</p>
                <p
                  dir={doaLang === 'ar' ? 'rtl' : 'ltr'}
                  className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed"
                >
                  {doa.translations[doaLang]}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: POJOK KONSULTASI + SMART FAQ */}
      {activeTab === 'konsultasi' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-white dark:bg-[#111C18] border border-slate-200 dark:border-emerald-950 rounded-2xl p-5 space-y-4 h-fit">
            <div>
              <h2 className="font-bold text-base">Kirim Pertanyaan ke Fasilitator</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Pertanyaan langsung masuk ke {currentUser.kua} disertai panduan cepat Smart FAQ.
              </p>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!konsulTanya.trim()) return;
                submitConsultation(konsulTopik, konsulTanya);
                setKonsulTanya('');
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-xs font-semibold mb-1">Topik Konsultasi</label>
                <select
                  value={konsulTopik}
                  onChange={(e) => setKonsulTopik(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-[#F8FAF9] dark:bg-[#0D1613] text-xs sm:text-sm"
                >
                  <option>Berkas Nikah &amp; SIMKAH</option>
                  <option>Sertifikat &amp; Progres MOOC</option>
                  <option>Kesiapan Gizi &amp; Stunting</option>
                  <option>Komunikasi &amp; Hukum Keluarga</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Uraian Pertanyaan *</label>
                <textarea
                  rows={4}
                  required
                  value={konsulTanya}
                  onChange={(e) => setKonsulTanya(e.target.value)}
                  placeholder="Tulis pertanyaan Anda secara jelas..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-[#F8FAF9] dark:bg-[#0D1613] text-xs sm:text-sm"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-[#0F684E] hover:bg-[#0B523D] text-white text-xs font-semibold"
              >
                Kirim Konsultasi
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 space-y-3">
            <h3 className="font-bold text-sm text-slate-700 dark:text-slate-200">
              Riwayat Konsultasi Anda ({myConsultations.length})
            </h3>
            {myConsultations.length === 0 ? (
              <div className="bg-white dark:bg-[#111C18] border border-slate-200 dark:border-emerald-950 rounded-2xl p-6 text-center text-xs text-slate-500">
                Belum ada riwayat konsultasi.
              </div>
            ) : (
              myConsultations.map((c) => (
                <div
                  key={c.id}
                  className="bg-white dark:bg-[#111C18] border border-slate-200 dark:border-emerald-950 rounded-2xl p-4 space-y-2.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#0F684E] dark:text-emerald-400">{c.topik}</span>
                    <span className="font-mono-num text-slate-500">
                      {formatIndonesianDate(c.createdAt)} · {c.status}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200">{c.pertanyaan}</p>
                  {c.smartFaqReply && (
                    <div className="p-3 rounded-lg bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-xs text-slate-700 dark:text-slate-200">
                      <strong>Panduan Cepat Smart FAQ:</strong> {c.smartFaqReply}
                    </div>
                  )}
                  {c.balasanFasilitator && (
                    <div className="p-3 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-xs text-slate-800 dark:text-emerald-100">
                      <strong>Balasan {c.dibalasOleh}:</strong> {c.balasanFasilitator}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 8: EVALUASI PASCA NIKAH */}
      {activeTab === 'pascanikah' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-white dark:bg-[#111C18] border border-slate-200 dark:border-emerald-950 rounded-2xl p-5 space-y-4 h-fit">
            <div>
              <h2 className="font-bold text-base">Jurnal Evaluasi Pasca Nikah</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Refleksi keharmonisan bulanan. Centang mediasi jika membutuhkan pendampingan Penyuluh KUA.
              </p>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!jurnalForm.catatan.trim()) return;
                submitPostMarriageJournal(jurnalForm);
                setJurnalForm({ bulanKe: jurnalForm.bulanKe + 1, skorHarmoni: 5, catatan: '', butuhMediasi: false });
              }}
              className="space-y-3"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Usia Nikah (Bulan ke-)</label>
                  <input
                    type="number"
                    min={1}
                    value={jurnalForm.bulanKe}
                    onChange={(e) => setJurnalForm({ ...jurnalForm, bulanKe: Number(e.target.value) || 1 })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-[#F8FAF9] dark:bg-[#0D1613] font-mono-num text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Skor Harmoni (1–5)</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={jurnalForm.skorHarmoni}
                    onChange={(e) =>
                      setJurnalForm({
                        ...jurnalForm,
                        skorHarmoni: Math.min(5, Math.max(1, Number(e.target.value) || 1)),
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-[#F8FAF9] dark:bg-[#0D1613] font-mono-num text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Catatan Refleksi *</label>
                <textarea
                  rows={3}
                  required
                  value={jurnalForm.catatan}
                  onChange={(e) => setJurnalForm({ ...jurnalForm, catatan: e.target.value })}
                  placeholder="Bagaimana komunikasi, keuangan, dan adaptasi rumah tangga bulan ini?"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-[#F8FAF9] dark:bg-[#0D1613] text-xs sm:text-sm"
                />
              </div>
              <label className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={jurnalForm.butuhMediasi}
                  onChange={(e) => setJurnalForm({ ...jurnalForm, butuhMediasi: e.target.checked })}
                  className="mt-0.5 accent-[#0F684E]"
                />
                <span>
                  Ajukan pendampingan mediasi privat bersama Fasilitator {currentUser.kua} (otomatis tereskalasi).
                </span>
              </label>
              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-[#0F684E] hover:bg-[#0B523D] text-white text-xs font-semibold"
              >
                Simpan Jurnal Evaluasi
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 space-y-3">
            <h3 className="font-bold text-sm">Catatan Evaluasi Tersimpan ({myJournals.length})</h3>
            {myJournals.length === 0 ? (
              <div className="bg-white dark:bg-[#111C18] border border-slate-200 dark:border-emerald-950 rounded-2xl p-6 text-center text-xs text-slate-500">
                Belum ada jurnal evaluasi pasca nikah.
              </div>
            ) : (
              myJournals.map((j) => (
                <div
                  key={j.id}
                  className="bg-white dark:bg-[#111C18] border border-slate-200 dark:border-emerald-950 rounded-2xl p-4 space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold font-mono-num text-[#0F684E] dark:text-emerald-400">
                      Bulan ke-{j.bulanKe} · Harmoni {j.skorHarmoni}/5
                    </span>
                    <span className="text-slate-500 font-mono-num">{formatIndonesianDate(j.createdAt)}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200">{j.catatan}</p>
                  {j.butuhMediasi && (
                    <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                      Tereskalasi ke Fasilitator KUA untuk pendampingan mediasi.
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 9: PUSAT DOKUMEN & FAQ */}
      {activeTab === 'dokumen' && (
        <div className="space-y-6">
          <section className="space-y-3">
            <h2 className="font-display text-2xl font-semibold">Pusat Unduhan Berkas Resmi</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white dark:bg-[#111C18] border border-slate-200 dark:border-emerald-950 rounded-2xl p-4 flex flex-col justify-between gap-3"
                >
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-[#0F684E] dark:text-emerald-400">
                      {doc.kat}
                    </p>
                    <h3 className="font-bold text-sm mt-1">{doc.judul}</h3>
                  </div>
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-emerald-950/60"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Unduh Berkas
                  </a>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="font-bold text-base">Pertanyaan Umum (FAQ)</h3>
            <div className="divide-y divide-slate-200 dark:divide-emerald-950 border border-slate-200 dark:border-emerald-950 rounded-2xl bg-white dark:bg-[#111C18] overflow-hidden">
              {data.faqs.map((faq) => (
                <div key={faq.id} className="p-4 space-y-1">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{faq.t}</p>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {faq.j}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* TAB 10: PROFIL, LENCANA & ID CARD DIGITAL */}
      {activeTab === 'profil' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-white dark:bg-[#111C18] border border-slate-200 dark:border-emerald-950 rounded-2xl p-6 space-y-4">
            <div>
              <h2 className="font-bold text-base">Biodata Calon Pengantin</h2>
              {currentUser.progress?.verifikasiFasilitator && (
                <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                  Nama dan TTL dikunci otomatis setelah verifikasi Fasilitator demi kesesuaian Sertifikat.
                </p>
              )}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateOwnProfile(profileForm);
              }}
              className="space-y-3 text-xs sm:text-sm"
            >
              <div>
                <label className="block font-semibold mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  disabled={Boolean(currentUser.progress?.verifikasiFasilitator)}
                  value={profileForm.nama}
                  onChange={(e) => setProfileForm({ ...profileForm, nama: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-[#F8FAF9] dark:bg-[#0D1613] disabled:opacity-60"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">No. WhatsApp</label>
                  <input
                    type="tel"
                    value={profileForm.noHp}
                    onChange={(e) => setProfileForm({ ...profileForm, noHp: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-[#F8FAF9] dark:bg-[#0D1613] font-mono-num"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Pekerjaan</label>
                  <input
                    type="text"
                    value={profileForm.pekerjaan}
                    onChange={(e) => setProfileForm({ ...profileForm, pekerjaan: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-[#F8FAF9] dark:bg-[#0D1613]"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold mb-1">Rencana Tanggal Akad Nikah</label>
                <input
                  type="date"
                  value={profileForm.tanggalRencanaNikah}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, tanggalRencanaNikah: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-[#F8FAF9] dark:bg-[#0D1613] font-mono-num"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Alamat Domisili</label>
                <input
                  type="text"
                  value={profileForm.alamat}
                  onChange={(e) => setProfileForm({ ...profileForm, alamat: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-[#F8FAF9] dark:bg-[#0D1613]"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-[#0F684E] hover:bg-[#0B523D] text-white text-xs font-semibold"
              >
                Simpan Perubahan Profil
              </button>
            </form>
          </div>

          <div className="lg:col-span-5 space-y-5">
            {/* Digital ID Card (8.56 x 5.4 cm aspect ratio) */}
            <div className="bg-white dark:bg-[#111C18] border border-slate-200 dark:border-emerald-950 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm">Kartu Peserta Digital (ID Card)</h3>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="text-xs font-semibold text-[#0F684E] dark:text-emerald-400 inline-flex items-center gap-1 hover:underline"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Cetak
                </button>
              </div>
              <div className="print-only-sheet rounded-xl bg-gradient-to-br from-[#07382A] to-[#0F684E] text-white p-4 border border-amber-500/60 space-y-3">
                <div className="flex items-center justify-between border-b border-white/15 pb-2.5">
                  <div className="flex items-center gap-2">
                    <KemenagLogo size="sm" />
                    <div className="leading-tight">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                        Kemenag Kab. Jepara
                      </p>
                      <p className="text-xs font-bold">Kartu Peserta BIMWIN</p>
                    </div>
                  </div>
                  <span className="font-mono-num text-[10px] text-emerald-200">
                    @{currentUser.username}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div className="space-y-0.5 text-xs min-w-0">
                    <p className="font-bold text-sm truncate">{currentUser.nama}</p>
                    <p className="font-mono-num text-[11px] text-emerald-100">
                      NIK: {maskNik(currentUser.nik)}
                    </p>
                    <p className="text-[11px] text-emerald-100">
                      {currentUser.kua} · {normalizeVillageName(currentUser.desaTempatNikah, currentUser.kua)}
                    </p>
                    <p className="text-[11px] text-amber-200">
                      Pasangan: {currentUser.pasanganNama || 'Belum Tersinkron'}
                    </p>
                  </div>
                  <QRCodeBox
                    value={currentUser.progress?.nomorSertifikat || currentUser.username}
                    kind="peserta"
                    size={64}
                    className="shrink-0"
                  />
                </div>
              </div>
            </div>

            {/* 3 Achievement Badges */}
            <div className="bg-white dark:bg-[#111C18] border border-slate-200 dark:border-emerald-950 rounded-2xl p-5 space-y-3">
              <h3 className="font-bold text-sm">Lencana Prestasi Catin</h3>
              <div className="space-y-2">
                {[
                  {
                    title: 'Pasangan Harmonis',
                    desc: 'Berhasil menyinkronkan akun pasangan',
                    earned: Boolean(currentUser.pasanganUsername),
                  },
                  {
                    title: 'Pembelajar Sakinah',
                    desc: 'Menuntaskan seluruh 5 Modul & Postest',
                    earned: evalStep.moocFinished,
                  },
                  {
                    title: 'Siap Keluarga Berkualitas',
                    desc: 'Lulus terverifikasi Fasilitator & skrining gizi',
                    earned: Boolean(currentUser.progress?.verifikasiFasilitator && currentUser.stunting),
                  },
                ].map((badge) => (
                  <div
                    key={badge.title}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                      badge.earned
                        ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/30'
                        : 'border-slate-200 dark:border-emerald-950 opacity-60'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-bold">{badge.title}</p>
                      <p className="text-[11px] text-slate-500">{badge.desc}</p>
                    </div>
                    <UserCheck
                      className={`w-4 h-4 shrink-0 ${
                        badge.earned ? 'text-[#0F684E] dark:text-emerald-400' : 'text-slate-400'
                      }`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 11: KOTAK MASUK PENGINGAT */}
      {activeTab === 'notifikasi' && (
        <div className="space-y-3">
          <h2 className="font-display text-2xl font-semibold">Kotak Masuk Pengingat Resmi</h2>
          {myNotifications.length === 0 ? (
            <div className="bg-white dark:bg-[#111C18] border border-slate-200 dark:border-emerald-950 rounded-2xl p-8 text-center text-xs text-slate-500">
              Belum ada pengingat masuk.
            </div>
          ) : (
            myNotifications.map((n) => {
              const isRead = n.readBy.includes(currentUser.username);
              return (
                <div
                  key={n.id}
                  className={`bg-white dark:bg-[#111C18] border rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isRead
                      ? 'border-slate-200 dark:border-emerald-950'
                      : 'border-[#0F684E] bg-emerald-50/30 dark:bg-emerald-950/20'
                  }`}
                >
                  <div className="space-y-1">
                    <p className="text-xs text-slate-500">
                      {n.pengirim} · <span className="font-mono-num">{formatIndonesianDate(n.createdAt)}</span>
                    </p>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{n.judul}</h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {n.pesan}
                    </p>
                  </div>
                  {!isRead && (
                    <button
                      type="button"
                      onClick={() => markNotificationRead(n.id)}
                      className="px-3.5 py-1.5 rounded-lg bg-[#0F684E] text-white text-xs font-semibold shrink-0"
                    >
                      Tandai Dibaca
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Create & Link Partner Modal (Aligned with Participant Registration Form) */}
      <CreatePartnerModal
        open={createPartnerOpen}
        onClose={() => setCreatePartnerOpen(false)}
        currentUser={currentUser}
      />

      {/* Modals */}
      <ModuleReaderModal
        module={readingModule}
        videoWatched={Boolean(
          readingModule && currentUser.progress?.videosWatched.includes(readingModule.id)
        )}
        onClose={() => setReadingModule(null)}
        onOpenVideo={(id) => {
          const mod = data.modules.find((m) => m.id === id);
          setReadingModule(null);
          if (mod) setVideoModule(mod);
        }}
        onOpenQuiz={(id) => {
          const mod = data.modules.find((m) => m.id === id);
          setReadingModule(null);
          if (mod && currentUser.progress?.videosWatched.includes(mod.id)) {
            setQuizTarget({ kind: 'module', module: mod });
          } else {
            pushToast(
              'info',
              'Tonton Video Terlebih Dahulu',
              `Kuis Modul ${id} baru terbuka setelah video ditonton hingga selesai.`
            );
          }
        }}
      />
      <VideoPlayerModal
        module={videoModule}
        alreadyWatched={Boolean(
          videoModule && currentUser.progress?.videosWatched.includes(videoModule.id)
        )}
        onClose={() => setVideoModule(null)}
        onConfirmWatched={markVideoWatched}
      />
      <QuizModal
        open={Boolean(quizTarget)}
        title={
          quizTarget?.kind === 'pretest'
            ? 'Pretest Bimbingan Perkawinan (5 Soal)'
            : quizTarget?.kind === 'postest'
              ? 'Postest Bimbingan Perkawinan (5 Soal)'
              : quizTarget?.kind === 'module'
                ? `Kuis Evaluasi — Modul ${quizTarget.module.id}`
                : ''
        }
        subtitle={
          quizTarget?.kind === 'module'
            ? quizTarget.module.shortTitle
            : 'Evaluasi Pemahaman Calon Pengantin Kemenag Jepara'
        }
        questions={
          quizTarget?.kind === 'pretest'
            ? data.pretest
            : quizTarget?.kind === 'postest'
              ? data.postest
              : quizTarget?.kind === 'module'
                ? quizTarget.module.quiz
                : []
        }
        passingScore={quizTarget?.kind === 'module' ? 80 : 0}
        onClose={() => setQuizTarget(null)}
        onComplete={(score) => {
          if (!quizTarget) return;
          if (quizTarget.kind === 'pretest') completePretest(score);
          else if (quizTarget.kind === 'postest') completePostest(score);
          else completeModuleQuiz(quizTarget.module.id, score);
        }}
      />
      <IkmSurveyModal open={ikmOpen} onClose={() => setIkmOpen(false)} onSubmit={submitIkmSurvey} />
      <CertificatePreviewModal
        open={certOpen}
        onClose={() => setCertOpen(false)}
        user={currentUser}
        pejabat={data.settings.pejabat}
      />
      <PiagamKompakPreviewModal
        open={piagamOpen}
        onClose={() => setPiagamOpen(false)}
        user={currentUser}
      />
      <PortfolioPreviewModal
        open={portfolioOpen}
        onClose={() => setPortfolioOpen(false)}
        user={currentUser}
        modules={data.modules}
      />
      <StoryCardModal open={storyOpen} onClose={() => setStoryOpen(false)} user={currentUser} />
    </WorkspaceShell>
  );
};
