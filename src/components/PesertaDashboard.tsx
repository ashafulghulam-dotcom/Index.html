import React, { useEffect, useMemo, useState } from 'react';
import {
  Award,
  Bell,
  BellRing,
  BookOpen,
  Building2,
  Calculator,
  Calendar,
  CalendarPlus,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Copy,
  CreditCard,
  Download,
  Edit3,
  FileCheck2,
  FileText,
  GraduationCap,
  Heart,
  HeartHandshake,
  HelpCircle,
  Lock,
  Megaphone,
  MessageCircle,
  PlayCircle,
  Printer,
  QrCode,
  Share2,
  Smartphone,
  Sparkles,
  TicketCheck,
  Trash2,
  UserPlus,
  Video,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { DEFAULT_KOMPAK_COMMITMENTS, DOA_PENGANTIN } from '../data/jeparaData';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useBimwin } from '../store/useBimwinStore';
import { DataTicketCategory, ModuleDefinition } from '../types/bimwin';
import {
  buildIcsCalendarContent,
  downloadIcsFile,
  isIdentityLockedAfterCert,
} from '../utils/operationalTools';
import { resolveMobileNotifPolicy } from '../utils/smartReminder';
import {
  calculateBudgetAllocation,
  calculateCompatibilityScore,
  calculateFertilityWindow,
  calculateStuntingReadiness,
  canAccessClassSelection,
  canAccessModuleQuiz,
  canAccessPiagamKompak,
  evaluatePesertaStep,
  formatIndonesianDate,
  formatRupiahInput,
  getMinAkadDate,
  isUnderageMarriage,
  maskNik,
  normalizeVillageName,
  parseRupiahInput,
  validateRencanaAkadDate,
} from '../utils/bimwinLogic';
import {
  downloadParticipantCardPdf,
  ID_CARD_SPEC,
  printParticipantCard,
} from '../utils/pdfDocuments';
import { AchievementBadges } from './AchievementBadges';
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
import { QRScannerModal } from './QRScannerModal';
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
    selectClassMode,
    rsvpClass,
    submitConsultation,
    submitPostMarriageJournal,
    updatePostMarriageJournal,
    deletePostMarriageJournal,
    updateOwnProfile,
    toggleBerkasChecklist,
    markNotificationRead,
    registerPesertaApkDevice,
    toggleParticipantMobileNotif,
    submitDataCorrectionTicket,
    checkInClassByQrPayload,
    requestConfirm,
    pushToast,
  } = useBimwin();
  const { isInstalled: isPwaInstalled, platform: detectedPlatform } = usePWAInstall();

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'Peserta') return;
    if (isPwaInstalled && !currentUser.appNotification?.apkInstalled) {
      const devicePlatform =
        detectedPlatform === 'ios'
          ? 'iOS'
          : detectedPlatform === 'android'
            ? 'Android'
            : 'Desktop';
      registerPesertaApkDevice(devicePlatform, true);
    }
  }, [currentUser, isPwaInstalled, detectedPlatform, registerPesertaApkDevice]);

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
  const [attendanceQrOpen, setAttendanceQrOpen] = useState(false);
  const [manualQrInput, setManualQrInput] = useState('');
  const [ticketCategory, setTicketCategory] = useState<DataTicketCategory>('Koreksi Identitas');
  const [ticketDetails, setTicketDetails] = useState('');
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
  const [konsulTopikLainnya, setKonsulTopikLainnya] = useState('');
  const [konsulTanya, setKonsulTanya] = useState('');
  const [konsulError, setKonsulError] = useState('');

  const [jurnalForm, setJurnalForm] = useState({
    bulanKe: '1',
    skorHarmoni: 5,
    aspekUtama: 'Komunikasi & Kesalingan',
    catatan: '',
    butuhMediasi: false,
  });
  const [editingJournalId, setEditingJournalId] = useState<string | null>(null);
  const [jurnalError, setJurnalError] = useState('');
  const [cardDownloading, setCardDownloading] = useState(false);
  const [showAllClassSchedules, setShowAllClassSchedules] = useState(false);

  // Profile edit state
  const [profileForm, setProfileForm] = useState({
    nama: currentUser?.nama || '',
    noHp: currentUser?.noHp || '',
    email: currentUser?.email || '',
    pekerjaan: currentUser?.pekerjaan || '',
    alamat: currentUser?.alamat || '',
    tanggalRencanaNikah: currentUser?.tanggalRencanaNikah || '',
  });
  const [profileError, setProfileError] = useState('');
  const minAkadDate = useMemo(
    () => getMinAkadDate(currentUser?.createdAt),
    [currentUser?.createdAt]
  );

  // Izin reason per class
  const [izinReasons, setIzinReasons] = useState<Record<string, string>>({});

  // Sync local form drafts whenever active user account changes
  useEffect(() => {
    if (!currentUser) return;
    setProfileForm({
      nama: currentUser.nama || '',
      noHp: currentUser.noHp || '',
      email: currentUser.email || '',
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
    setEditingJournalId(null);
    setJurnalError('');
    setKonsulError('');
    setShowAllClassSchedules(false);
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
  const classAccess = canAccessClassSelection(currentUser, data.modules.length);
  const kompakAccess = canAccessPiagamKompak(currentUser, data.modules.length);
  const partnerUser = data.users.find(
    (u) => u.role === 'Peserta' && u.username === currentUser.pasanganUsername
  );
  const partnerEval = partnerUser
    ? evaluatePesertaStep(partnerUser, data.modules.length)
    : null;

  const myNotifications = (data.notifications || []).filter(
    (n) =>
      (n.targetKua === 'ALL' || n.targetKua === currentUser.kua) &&
      (!n.targetUsername || n.targetUsername === currentUser.username)
  );
  const unreadCount = myNotifications.filter(
    (n) => !n.readBy.includes(currentUser.username)
  ).length;

  const myClasses = (data.classes || []).filter((c) => c.kua === currentUser.kua);
  const activeAnnouncements = (data.officialAnnouncements || []).filter(
    (a) => a.active && (a.kuaScope === 'ALL' || a.kuaScope === currentUser.kua)
  );
  const myTickets = (data.dataTickets || []).filter(
    (t) => t.pesertaUsername === currentUser.username
  );
  const identityLocked = isIdentityLockedAfterCert(currentUser);
  const myConsultations = (data.consultations || []).filter(
    (c) => c.pesertaUsername === currentUser.username
  );
  const myJournals = (data.journals || []).filter(
    (j) => j.pesertaUsername === currentUser.username
  );
  const avgHarmonyScore =
    myJournals.length > 0
      ? (
          myJournals.reduce((sum, item) => sum + (Number(item.skorHarmoni) || 0), 0) /
          myJournals.length
        ).toFixed(1)
      : '—';

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
    {
      id: 'kompak',
      label: 'Piagam Kami Kompak',
      icon: HeartHandshake,
      badge: kompakAccess.unlocked
        ? currentUser.kompak?.kodePiagam
          ? 'Tersimpan'
          : undefined
        : 'Terkunci',
      section: 'Pembelajaran MOOC',
    },
    {
      id: 'kelas',
      label: 'Kelas Online & Offline',
      icon: Calendar,
      badge: classAccess.unlocked
        ? currentUser.progress?.preferredClassMode || myClasses.length
        : 'Terkunci',
      section: 'Pembelajaran MOOC',
    },
    { id: 'berkas', label: 'Checklist Berkas SIMKAH', icon: ClipboardCheck, badge: `${berkasDoneCount}/${berkasItems.length}`, section: 'Perangkat Catin' },
    { id: 'kalkulator', label: 'Kalkulator Keluarga', icon: Calculator, section: 'Perangkat Catin' },
    { id: 'doa', label: 'Doa Pengantin (4 Bahasa)', icon: Sparkles, section: 'Perangkat Catin' },
    { id: 'konsultasi', label: 'Pojok Konsultasi', icon: MessageCircle, badge: myConsultations.length || undefined, section: 'Pendampingan' },
    { id: 'pascanikah', label: 'Evaluasi Pasca Nikah', icon: Heart, section: 'Pendampingan' },
    { id: 'dokumen', label: 'Pusat Dokumen & FAQ', icon: HelpCircle, section: 'Pendampingan' },
    { id: 'profil', label: 'Profil, Lencana & ID Card', icon: CreditCard, section: 'Akun Saya' },
    { id: 'notifikasi', label: 'Kotak Masuk Pengingat', icon: Bell, badge: unreadCount || undefined, section: 'Akun Saya' },
  ];

  const formatRupiah = (n: number) => `Rp ${formatRupiahInput(n)}`;

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
          {/* Pengumuman & Surat Edaran Resmi Kemenag / KUA */}
          {activeAnnouncements.length > 0 && (
            <section className="space-y-2.5" aria-label="Pengumuman Resmi Kemenag dan KUA">
              {activeAnnouncements.slice(0, 2).map((ann) => (
                <div
                  key={ann.id}
                  className={`rounded-2xl border p-4 flex items-start gap-3 ${
                    ann.priority === 'penting'
                      ? 'bg-amber-50/80 dark:bg-amber-950/25 border-amber-300 dark:border-amber-800/70'
                      : 'bg-emerald-50/60 dark:bg-emerald-950/25 border-emerald-200 dark:border-emerald-900/70'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      ann.priority === 'penting'
                        ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300'
                        : 'bg-emerald-100 dark:bg-emerald-900/50 text-[#0F684E] dark:text-emerald-300'
                    }`}
                  >
                    <Megaphone className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#0F684E] dark:text-emerald-400">
                        Pengumuman Resmi · {ann.kuaScope === 'ALL' ? 'Kemenag Kab. Jepara' : ann.kuaScope}
                      </span>
                      {ann.priority === 'penting' && (
                        <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-amber-200/80 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200">
                          Penting
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                      {ann.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                      {ann.body}
                    </p>
                  </div>
                </div>
              ))}
            </section>
          )}

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
          <section className="space-y-3">
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

            <div className="bg-white dark:bg-[#111C18] border border-slate-200 dark:border-emerald-950 rounded-2xl p-5 sm:p-6 space-y-4">
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
                    ,{' '}
                    <strong>
                      Rencana Tanggal Akad sama (
                      {currentUser.tanggalRencanaNikah
                        ? formatIndonesianDate(`${currentUser.tanggalRencanaNikah}T00:00:00`)
                        : 'belum diisi'}
                      )
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
            </div>
          </section>

          {/* STEP 2: PRETEST */}
          <section className="space-y-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Langkah 2 · Evaluasi Awal
              </p>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Pretest Bimwin (5 Soal)
              </h3>
            </div>

            <div className="bg-white dark:bg-[#111C18] border border-slate-200 dark:border-emerald-950 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                Mengukur pemahaman awal calon pengantin sebelum membuka 5 modul utama. Hanya dapat dikerjakan 1 kali.
              </p>
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <span className="font-mono-num text-sm font-bold text-slate-800 dark:text-slate-200">
                  {currentUser.progress?.pretestDone
                    ? `Skor: ${currentUser.progress.pretestScore}/100`
                    : 'Belum dikerjakan'}
                </span>
                <button
                  type="button"
                  disabled={!evalStep.canTakePretest}
                  title={
                    currentUser.progress?.pretestDone
                      ? 'Pretest hanya dapat dikerjakan 1 kali dan tidak dapat diulangi.'
                      : undefined
                  }
                  onClick={() => {
                    if (evalStep.canTakePretest) setQuizTarget({ kind: 'pretest' });
                  }}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition ${
                    currentUser.progress?.pretestDone
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[#0F684E] dark:text-emerald-400 cursor-not-allowed'
                      : evalStep.canTakePretest
                        ? 'bg-[#0F684E] hover:bg-[#0B523D] text-white'
                        : 'bg-slate-200 dark:bg-emerald-950 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {currentUser.progress?.pretestDone ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Sudah Dikerjakan
                    </>
                  ) : (
                    <>
                      {!evalStep.canTakePretest && <Lock className="w-3.5 h-3.5" />}
                      Mulai Pretest
                    </>
                  )}
                </button>
              </div>
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
                          Tonton video pembelajaran hingga selesai untuk membuka tombol Kuis Modul 0{mod.id}.
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
          <section className="space-y-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Langkah 4 · Evaluasi Akhir
              </p>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Postest Bimwin (5 Soal)
              </h3>
            </div>

            <div className="bg-white dark:bg-[#111C18] border border-slate-200 dark:border-emerald-950 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                Terbuka setelah seluruh 5 modul lulus kuis (≥80%). Mengukur peningkatan pemahaman (Before-After Gain) dan hanya dapat dikerjakan 1 kali.
              </p>
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
                  title={
                    currentUser.progress?.postestDone
                      ? 'Postest hanya dapat dikerjakan 1 kali dan tidak dapat diulangi.'
                      : undefined
                  }
                  onClick={() => {
                    if (evalStep.canTakePostest) setQuizTarget({ kind: 'postest' });
                  }}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition ${
                    currentUser.progress?.postestDone
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[#0F684E] dark:text-emerald-400 cursor-not-allowed'
                      : evalStep.canTakePostest
                        ? 'bg-[#0F684E] hover:bg-[#0B523D] text-white'
                        : 'bg-slate-200 dark:bg-emerald-950 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {currentUser.progress?.postestDone ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Sudah Dikerjakan
                    </>
                  ) : (
                    <>
                      {!evalStep.canTakePostest && <Lock className="w-3.5 h-3.5" />}
                      Mulai Postest
                    </>
                  )}
                </button>
              </div>
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
          {!kompakAccess.unlocked ? (
            <div className="bg-white dark:bg-[#111C18] border border-amber-300 dark:border-amber-800/70 rounded-2xl p-6 space-y-5">
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 flex items-center justify-center shrink-0">
                  <Lock className="w-5 h-5 text-amber-700 dark:text-amber-400" />
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                    Piagam Kami Kompak Terkunci
                  </p>
                  <h2 className="font-display text-xl sm:text-2xl font-semibold text-slate-900 dark:text-white">
                    Selesaikan MOOC &amp; Survei IKM untuk Membuka Piagam &ldquo;Kami Kompak&rdquo;
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {kompakAccess.reason}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div
                  className={`p-4 rounded-xl border flex items-start justify-between gap-3 ${
                    kompakAccess.moocFinished
                      ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800'
                      : 'bg-[#F8FAF9] dark:bg-[#0D1613] border-slate-200 dark:border-emerald-950'
                  }`}
                >
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      1. Tuntaskan Pembelajaran MOOC
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Sinkron Pasangan, Pretest, 5 Modul (Video + Kuis ≥80%), dan Postest.
                    </p>
                    <p
                      className={`text-xs font-semibold pt-1 ${
                        kompakAccess.moocFinished
                          ? 'text-[#0F684E] dark:text-emerald-400'
                          : 'text-amber-700 dark:text-amber-400'
                      }`}
                    >
                      {kompakAccess.moocFinished ? 'Sudah Tuntas' : 'Belum Selesai'}
                    </p>
                  </div>
                  {kompakAccess.moocFinished ? (
                    <CheckCircle2 className="w-5 h-5 text-[#0F684E] dark:text-emerald-400 shrink-0" />
                  ) : (
                    <button
                      type="button"
                      onClick={() => setActiveTab('belajar')}
                      className="px-3 py-1.5 rounded-lg bg-[#0F684E] hover:bg-[#0B523D] text-white text-xs font-semibold shrink-0"
                    >
                      Ke Ruang Belajar
                    </button>
                  )}
                </div>

                <div
                  className={`p-4 rounded-xl border flex items-start justify-between gap-3 ${
                    kompakAccess.ikmDone
                      ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800'
                      : 'bg-[#F8FAF9] dark:bg-[#0D1613] border-slate-200 dark:border-emerald-950'
                  }`}
                >
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      2. Isi Survei Kepuasan Masyarakat (IKM)
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Survei evaluasi layanan BIMWIN Kemenag Kab. Jepara sebelum menyusun Piagam Kami Kompak.
                    </p>
                    <p
                      className={`text-xs font-semibold pt-1 ${
                        kompakAccess.ikmDone
                          ? 'text-[#0F684E] dark:text-emerald-400'
                          : 'text-amber-700 dark:text-amber-400'
                      }`}
                    >
                      {kompakAccess.ikmDone ? 'Sudah Diisi' : 'Wajib Diisi'}
                    </p>
                  </div>
                  {kompakAccess.ikmDone ? (
                    <CheckCircle2 className="w-5 h-5 text-[#0F684E] dark:text-emerald-400 shrink-0" />
                  ) : (
                    <button
                      type="button"
                      disabled={!kompakAccess.moocFinished}
                      onClick={() => setIkmOpen(true)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 ${
                        kompakAccess.moocFinished
                          ? 'bg-[#0F684E] hover:bg-[#0B523D] text-white'
                          : 'bg-slate-200 dark:bg-emerald-950 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      Isi Survei IKM
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-[#111C18] border border-slate-200 dark:border-emerald-950 rounded-2xl p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-emerald-950 pb-4">
                <div>
                  <h2 className="font-display text-2xl font-semibold text-slate-900 dark:text-white">
                    Kuis Kecocokan &amp; Piagam &ldquo;Kami Kompak&rdquo;
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
          )}
        </div>
      )}

      {/* TAB 4: KELAS ONLINE & OFFLINE */}
      {activeTab === 'kelas' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="font-display text-2xl font-semibold text-slate-900 dark:text-white">
                Pemilihan Kelas Online &amp; Offline — {currentUser.kua}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Status Kehadiran Anda saat ini:{' '}
                <strong className="text-[#0F684E] dark:text-emerald-400">
                  {currentUser.progress?.kehadiranKelas || 'Belum Hadir'}
                </strong>
                {currentUser.progress?.preferredClassMode && (
                  <>
                    {' '}· Pilihan Kelas:{' '}
                    <strong className="text-slate-900 dark:text-white">
                      Kelas {currentUser.progress.preferredClassMode}
                    </strong>
                  </>
                )}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setAttendanceQrOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0F684E] hover:bg-[#0B523D] text-white text-xs font-semibold shrink-0 transition"
            >
              <QrCode className="w-4 h-4" />
              Scan QR Absensi Kelas
            </button>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!manualQrInput.trim()) return;
              const ok = checkInClassByQrPayload(manualQrInput.trim());
              if (ok) setManualQrInput('');
            }}
            className="bg-white dark:bg-[#111C18] border border-slate-200 dark:border-emerald-950 rounded-2xl p-3.5 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5"
          >
            <input
              type="text"
              value={manualQrInput}
              onChange={(e) => setManualQrInput(e.target.value)}
              placeholder="Atau tempel kode QR absensi dari proyektor Fasilitator (SAMAWA-ABSEN|...)"
              className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-emerald-900 bg-[#F8FAF9] dark:bg-[#0D1613] text-xs font-mono-num outline-none focus:border-[#0F684E]"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-lg border border-[#0F684E]/40 text-[#0F684E] dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-xs font-semibold shrink-0"
            >
              Check-In Kode
            </button>
          </form>

          {!classAccess.unlocked ? (
            <div className="bg-white dark:bg-[#111C18] border border-amber-300 dark:border-amber-800/70 rounded-2xl p-6 space-y-5">
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 flex items-center justify-center shrink-0">
                  <Lock className="w-5 h-5 text-amber-700 dark:text-amber-400" />
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                    Menu Kelas Terkunci
                  </p>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    Selesaikan MOOC &amp; Survei IKM untuk Memilih Kelas Online atau Offline
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {classAccess.reason}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div
                  className={`p-4 rounded-xl border flex items-start justify-between gap-3 ${
                    classAccess.moocFinished
                      ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800'
                      : 'bg-[#F8FAF9] dark:bg-[#0D1613] border-slate-200 dark:border-emerald-950'
                  }`}
                >
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      1. Tuntaskan Pembelajaran MOOC
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Sinkron Pasangan, Pretest, 5 Modul (Video + Kuis ≥80%), dan Postest.
                    </p>
                    <p
                      className={`text-xs font-semibold pt-1 ${
                        classAccess.moocFinished
                          ? 'text-[#0F684E] dark:text-emerald-400'
                          : 'text-amber-700 dark:text-amber-400'
                      }`}
                    >
                      {classAccess.moocFinished ? 'Sudah Tuntas' : 'Belum Selesai'}
                    </p>
                  </div>
                  {classAccess.moocFinished ? (
                    <CheckCircle2 className="w-5 h-5 text-[#0F684E] dark:text-emerald-400 shrink-0" />
                  ) : (
                    <button
                      type="button"
                      onClick={() => setActiveTab('belajar')}
                      className="px-3 py-1.5 rounded-lg bg-[#0F684E] hover:bg-[#0B523D] text-white text-xs font-semibold shrink-0"
                    >
                      Ke Ruang Belajar
                    </button>
                  )}
                </div>

                <div
                  className={`p-4 rounded-xl border flex items-start justify-between gap-3 ${
                    classAccess.ikmDone
                      ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800'
                      : 'bg-[#F8FAF9] dark:bg-[#0D1613] border-slate-200 dark:border-emerald-950'
                  }`}
                >
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      2. Isi Survei Kepuasan Masyarakat (IKM)
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Survei evaluasi layanan BIMWIN Kemenag Kab. Jepara sebelum memilih kelas.
                    </p>
                    <p
                      className={`text-xs font-semibold pt-1 ${
                        classAccess.ikmDone
                          ? 'text-[#0F684E] dark:text-emerald-400'
                          : 'text-amber-700 dark:text-amber-400'
                      }`}
                    >
                      {classAccess.ikmDone ? 'Sudah Diisi' : 'Wajib Diisi'}
                    </p>
                  </div>
                  {classAccess.ikmDone ? (
                    <CheckCircle2 className="w-5 h-5 text-[#0F684E] dark:text-emerald-400 shrink-0" />
                  ) : (
                    <button
                      type="button"
                      disabled={!classAccess.moocFinished}
                      onClick={() => setIkmOpen(true)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 ${
                        classAccess.moocFinished
                          ? 'bg-[#0F684E] hover:bg-[#0B523D] text-white'
                          : 'bg-slate-200 dark:bg-emerald-950 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      Isi Survei IKM
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Pilihan Mode Kelas Online vs Offline */}
              <section className="bg-white dark:bg-[#111C18] border border-slate-200 dark:border-emerald-950 rounded-2xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#0F684E] dark:text-emerald-400">
                      Tahap Pemilihan Kelas Terbuka
                    </p>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Pilih Jenis Kelas Bimbingan Perkawinan Anda
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      MOOC dan Survei IKM telah tuntas. Pilih mode kelas yang paling sesuai, lalu konfirmasi jadwal di bawah ini.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {(
                    [
                      {
                        mode: 'Online' as const,
                        title: 'Kelas Online (Daring / Zoom)',
                        desc: 'Sesi pendampingan interaktif jarak jauh melalui Zoom / Google Meet bersama Fasilitator KUA bagi catin yang bekerja atau berada di luar daerah.',
                        icon: Video,
                        count: myClasses.filter((c) => c.tipe === 'Online').length,
                      },
                      {
                        mode: 'Offline' as const,
                        title: 'Kelas Offline (Tatap Muka KUA)',
                        desc: 'Sesi bimbingan langsung di Balai Nikah / Aula KUA Kecamatan bersama Penyuluh Agama, Puskesmas, dan diskusi kelompok calon pengantin.',
                        icon: Building2,
                        count: myClasses.filter((c) => c.tipe === 'Offline').length,
                      },
                    ] as const
                  ).map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = currentUser.progress?.preferredClassMode === opt.mode;
                    return (
                      <button
                        key={opt.mode}
                        type="button"
                        onClick={() => {
                          selectClassMode(opt.mode);
                          setShowAllClassSchedules(false);
                        }}
                        className={`text-left p-4 rounded-xl border-2 transition flex flex-col justify-between gap-3 ${
                          isSelected
                            ? 'border-[#0F684E] bg-emerald-50/60 dark:bg-emerald-950/40'
                            : 'border-slate-200 dark:border-emerald-950 hover:border-emerald-400 bg-[#F8FAF9] dark:bg-[#0D1613]'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="inline-flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
                              <Icon className="w-4 h-4 text-[#0F684E] dark:text-emerald-400" />
                              {opt.title}
                            </span>
                            {isSelected && (
                              <span className="text-[11px] font-bold text-[#0F684E] dark:text-emerald-400 inline-flex items-center gap-1">
                                <CheckCircle2 className="w-4 h-4" />
                                Dipilih
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                            {opt.desc}
                          </p>
                        </div>
                        <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-200/70 dark:border-emerald-950">
                          <span className="font-mono-num text-slate-500">
                            {opt.count} jadwal tersedia di {currentUser.kua}
                          </span>
                          <span className="font-semibold text-[#0F684E] dark:text-emerald-400">
                            {isSelected ? 'Pilihan Aktif' : `Pilih Kelas ${opt.mode} →`}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>

              {(() => {
                const preferred = currentUser.progress?.preferredClassMode;
                const filteredClasses =
                  preferred && !showAllClassSchedules
                    ? myClasses.filter((c) => c.tipe === preferred)
                    : myClasses;

                return (
                  <div className="space-y-3">
                    {preferred && myClasses.length > filteredClasses.length && (
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>
                          Menampilkan jadwal <strong>Kelas {preferred}</strong> ({filteredClasses.length} sesi).
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowAllClassSchedules((prev) => !prev)}
                          className="font-semibold text-[#0F684E] dark:text-emerald-400 hover:underline"
                        >
                          {showAllClassSchedules
                            ? `Filter Khusus Kelas ${preferred}`
                            : `Tampilkan Semua Jadwal (${myClasses.length})`}
                        </button>
                      </div>
                    )}

                    {filteredClasses.length === 0 ? (
                      <div className="bg-white dark:bg-[#111C18] border border-slate-200 dark:border-emerald-950 rounded-2xl p-8 text-center space-y-2">
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                          Belum ada jadwal {preferred ? `Kelas ${preferred}` : 'kelas aktif'} di {currentUser.kua}.
                        </p>
                        <p className="text-xs text-slate-500">
                          Pilihan Anda sudah tercatat untuk Fasilitator KUA. Anda juga dapat melihat jadwal mode lainnya atau menghubungi Fasilitator melalui Pojok Konsultasi.
                        </p>
                        {preferred && myClasses.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setShowAllClassSchedules(true)}
                            className="mt-2 px-3.5 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 text-xs font-semibold"
                          >
                            Lihat Semua Jadwal Tersedia ({myClasses.length})
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredClasses.map((cls) => {
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
                                  Lokasi / Tautan:{' '}
                                  <span className="font-medium text-slate-700 dark:text-slate-200">
                                    {cls.lokasiAtauLink}
                                  </span>
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
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const ics = buildIcsCalendarContent({
                                        uid: `kelas-${cls.id}`,
                                        title: `BIMWIN SAMAWA: ${cls.judul}`,
                                        description: `Kelas ${cls.tipe} Bimbingan Perkawinan ${cls.kua}. Narasumber: ${cls.narasumber}. Kode Absen: ${cls.kodeAbsen}`,
                                        location: cls.lokasiAtauLink,
                                        dateIso: cls.tanggal,
                                        startHour: 8,
                                        startMinute: 30,
                                        durationMinutes: 180,
                                      });
                                      downloadIcsFile(`jadwal-bimwin-${cls.kodeAbsen}.ics`, ics);
                                      pushToast(
                                        'success',
                                        'Jadwal Tersimpan (.ics)',
                                        'Buka file kalender yang terunduh untuk menambahkan pengingat H-1 ke kalender HP Anda.'
                                      );
                                    }}
                                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#0F684E]/35 text-[#0F684E] dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-xs font-semibold"
                                  >
                                    <CalendarPlus className="w-3.5 h-3.5" />
                                    Simpan Kalender (.ics)
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })()}
            </>
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
                <label
                  htmlFor="penghasilan-bulanan-keluarga"
                  className="block text-xs font-semibold mb-1"
                >
                  Total Penghasilan Bulanan Keluarga (Rp)
                </label>
                <div className="relative">
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-sm font-semibold text-slate-500 dark:text-slate-400"
                  >
                    Rp
                  </span>
                  <input
                    id="penghasilan-bulanan-keluarga"
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder="Contoh: 5.000.000"
                    value={formatRupiahInput(monthlyIncome, { allowEmptyZero: true })}
                    onChange={(e) => {
                      const inputEl = e.currentTarget;
                      const selectionStart = inputEl.selectionStart ?? inputEl.value.length;
                      const digitsBeforeCaret = inputEl.value
                        .slice(0, selectionStart)
                        .replace(/\D/g, '').length;
                      const parsed = parseRupiahInput(inputEl.value);
                      setMonthlyIncome(parsed);
                      const formatted = formatRupiahInput(parsed, { allowEmptyZero: true });
                      requestAnimationFrame(() => {
                        if (document.activeElement !== inputEl) return;
                        let seenDigits = 0;
                        let nextCaret = formatted.length;
                        for (let i = 0; i < formatted.length; i += 1) {
                          if (/\d/.test(formatted[i])) {
                            seenDigits += 1;
                          }
                          if (seenDigits >= digitsBeforeCaret) {
                            nextCaret = digitsBeforeCaret === 0 ? 0 : i + 1;
                            break;
                          }
                        }
                        inputEl.setSelectionRange(nextCaret, nextCaret);
                      });
                    }}
                    className="w-full pl-11 pr-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-emerald-900 bg-[#F8FAF9] dark:bg-[#0D1613] font-mono-num text-sm font-semibold text-slate-900 dark:text-white"
                  />
                </div>
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
                setKonsulError('');
                const resolvedTopik =
                  konsulTopik === '__LAINNYA__' ? konsulTopikLainnya.trim() : konsulTopik;
                if (konsulTopik === '__LAINNYA__' && resolvedTopik.length < 3) {
                  setKonsulError('Tuliskan topik konsultasi Anda minimal 3 karakter.');
                  return;
                }
                if (!konsulTanya.trim()) {
                  setKonsulError('Uraian pertanyaan tidak boleh kosong.');
                  return;
                }
                submitConsultation(resolvedTopik, konsulTanya);
                setKonsulTanya('');
                if (konsulTopik === '__LAINNYA__') setKonsulTopikLainnya('');
              }}
              className="space-y-3"
            >
              <div>
                <label htmlFor="konsul-topik-select" className="block text-xs font-semibold mb-1">
                  Topik Konsultasi
                </label>
                <select
                  id="konsul-topik-select"
                  value={konsulTopik}
                  onChange={(e) => {
                    setKonsulTopik(e.target.value);
                    setKonsulError('');
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-[#F8FAF9] dark:bg-[#0D1613] text-xs sm:text-sm"
                >
                  <option value="Berkas Nikah & SIMKAH">Berkas Nikah &amp; SIMKAH</option>
                  <option value="Sertifikat & Progres MOOC">Sertifikat &amp; Progres MOOC</option>
                  <option value="Kesiapan Gizi & Stunting">Kesiapan Gizi &amp; Stunting</option>
                  <option value="Komunikasi & Hukum Keluarga">Komunikasi &amp; Hukum Keluarga</option>
                  <option value="__LAINNYA__">Topik Lainnya (Tulis Sendiri)</option>
                </select>
              </div>
              {konsulTopik === '__LAINNYA__' && (
                <div>
                  <label htmlFor="konsul-topik-lainnya" className="block text-xs font-semibold mb-1">
                    Tulis Topik Konsultasi Anda *
                  </label>
                  <input
                    id="konsul-topik-lainnya"
                    type="text"
                    required
                    maxLength={100}
                    value={konsulTopikLainnya}
                    onChange={(e) => {
                      setKonsulTopikLainnya(e.target.value);
                      setKonsulError('');
                    }}
                    placeholder="Contoh: Wali Nikah di Luar Negeri / Dispensasi Jadwal"
                    className="w-full px-3 py-2 rounded-lg border border-[#0F684E] dark:border-emerald-700 bg-[#F8FAF9] dark:bg-[#0D1613] text-xs sm:text-sm outline-none"
                  />
                </div>
              )}
              <div>
                <label htmlFor="konsul-uraian" className="block text-xs font-semibold mb-1">
                  Uraian Pertanyaan *
                </label>
                <textarea
                  id="konsul-uraian"
                  rows={4}
                  required
                  value={konsulTanya}
                  onChange={(e) => {
                    setKonsulTanya(e.target.value);
                    setKonsulError('');
                  }}
                  placeholder="Tulis pertanyaan Anda secara jelas..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-[#F8FAF9] dark:bg-[#0D1613] text-xs sm:text-sm"
                />
              </div>
              {konsulError && (
                <p className="text-xs text-red-600 bg-red-50 dark:bg-red-950/40 rounded-lg px-3 py-2">
                  {konsulError}
                </p>
              )}
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
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="font-bold text-base">
                  {editingJournalId ? 'Edit Jurnal Evaluasi Pasca Nikah' : 'Jurnal Evaluasi Pasca Nikah'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Refleksi keharmonisan bulanan. Centang mediasi jika membutuhkan pendampingan Penyuluh KUA.
                </p>
              </div>
              {editingJournalId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingJournalId(null);
                    setJurnalError('');
                    setJurnalForm({
                      bulanKe: String(myJournals.length + 1),
                      skorHarmoni: 5,
                      aspekUtama: 'Komunikasi & Kesalingan',
                      catatan: '',
                      butuhMediasi: false,
                    });
                  }}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 shrink-0"
                >
                  Batal Edit
                </button>
              )}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setJurnalError('');
                const parsedMonth = parseInt(jurnalForm.bulanKe, 10);
                if (!Number.isFinite(parsedMonth) || parsedMonth < 1 || parsedMonth > 600) {
                  setJurnalError('Masukkan usia nikah dalam bulan (angka minimal 1).');
                  return;
                }
                if (jurnalForm.catatan.trim().length < 5) {
                  setJurnalError('Catatan refleksi minimal 5 karakter agar evaluasi bermakna.');
                  return;
                }

                const payload = {
                  bulanKe: parsedMonth,
                  skorHarmoni: jurnalForm.skorHarmoni,
                  aspekUtama: jurnalForm.aspekUtama,
                  catatan: jurnalForm.catatan.trim(),
                  butuhMediasi: jurnalForm.butuhMediasi,
                };

                const res = editingJournalId
                  ? updatePostMarriageJournal(editingJournalId, payload)
                  : submitPostMarriageJournal(payload);

                if (!res.ok) {
                  setJurnalError(res.error || 'Gagal menyimpan jurnal evaluasi.');
                  return;
                }

                setEditingJournalId(null);
                setJurnalForm({
                  bulanKe: String(parsedMonth + 1),
                  skorHarmoni: 5,
                  aspekUtama: 'Komunikasi & Kesalingan',
                  catatan: '',
                  butuhMediasi: false,
                });
              }}
              className="space-y-3.5"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="jurnal-bulan" className="block text-xs font-semibold mb-1">
                    Usia Nikah (Bulan ke-) *
                  </label>
                  <input
                    id="jurnal-bulan"
                    type="text"
                    inputMode="numeric"
                    value={jurnalForm.bulanKe}
                    onChange={(e) => {
                      const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 3);
                      setJurnalForm({ ...jurnalForm, bulanKe: digitsOnly });
                      setJurnalError('');
                    }}
                    placeholder="Contoh: 1"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-[#F8FAF9] dark:bg-[#0D1613] font-mono-num text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="jurnal-aspek" className="block text-xs font-semibold mb-1">
                    Aspek Evaluasi Utama
                  </label>
                  <select
                    id="jurnal-aspek"
                    value={jurnalForm.aspekUtama}
                    onChange={(e) =>
                      setJurnalForm({ ...jurnalForm, aspekUtama: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-[#F8FAF9] dark:bg-[#0D1613] text-xs sm:text-sm"
                  >
                    <option>Komunikasi &amp; Kesalingan</option>
                    <option>Keuangan Rumah Tangga</option>
                    <option>Adaptasi Keluarga Besar</option>
                    <option>Kesehatan &amp; Pengasuhan</option>
                    <option>Ibadah &amp; Spiritualitas</option>
                  </select>
                </div>
              </div>

              <div>
                <span className="block text-xs font-semibold mb-1.5">
                  Skor Keharmonisan Bulan Ini ({jurnalForm.skorHarmoni}/5)
                </span>
                <div className="grid grid-cols-5 gap-1.5" role="group" aria-label="Pilih skor harmoni 1 sampai 5">
                  {[
                    { score: 1, label: 'Sulit' },
                    { score: 2, label: 'Kurang' },
                    { score: 3, label: 'Cukup' },
                    { score: 4, label: 'Baik' },
                    { score: 5, label: 'Harmonis' },
                  ].map((opt) => {
                    const active = jurnalForm.skorHarmoni === opt.score;
                    return (
                      <button
                        key={opt.score}
                        type="button"
                        onClick={() => setJurnalForm({ ...jurnalForm, skorHarmoni: opt.score })}
                        className={`py-2 px-1 rounded-lg border text-center transition ${
                          active
                            ? 'bg-[#0F684E] border-[#0F684E] text-white'
                            : 'bg-[#F8FAF9] dark:bg-[#0D1613] border-slate-200 dark:border-emerald-900 text-slate-700 dark:text-slate-300 hover:border-[#0F684E]'
                        }`}
                      >
                        <div className="font-mono-num text-sm font-bold leading-none">{opt.score}</div>
                        <div className="text-[10px] mt-1 leading-none">{opt.label}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label htmlFor="jurnal-catatan" className="block text-xs font-semibold mb-1">
                  Catatan Refleksi *
                </label>
                <textarea
                  id="jurnal-catatan"
                  rows={3}
                  required
                  value={jurnalForm.catatan}
                  onChange={(e) => {
                    setJurnalForm({ ...jurnalForm, catatan: e.target.value });
                    setJurnalError('');
                  }}
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

              {jurnalError && (
                <p className="text-xs text-red-600 bg-red-50 dark:bg-red-950/40 rounded-lg px-3 py-2">
                  {jurnalError}
                </p>
              )}

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-[#0F684E] hover:bg-[#0B523D] text-white text-xs font-semibold"
              >
                {editingJournalId ? 'Simpan Perubahan Jurnal' : 'Simpan Jurnal Evaluasi'}
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white dark:bg-[#111C18] border border-slate-200 dark:border-emerald-950 rounded-xl p-3.5">
                <p className="text-[11px] text-slate-500">Total Catatan</p>
                <p className="font-mono-num text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                  {myJournals.length}
                </p>
              </div>
              <div className="bg-white dark:bg-[#111C18] border border-slate-200 dark:border-emerald-950 rounded-xl p-3.5">
                <p className="text-[11px] text-slate-500">Rata-rata Harmoni</p>
                <p className="font-mono-num text-xl font-bold text-[#0F684E] dark:text-emerald-400 mt-0.5">
                  {avgHarmonyScore}
                  <span className="text-xs font-normal text-slate-400">/5</span>
                </p>
              </div>
              <div className="bg-white dark:bg-[#111C18] border border-slate-200 dark:border-emerald-950 rounded-xl p-3.5">
                <p className="text-[11px] text-slate-500">Permintaan Mediasi</p>
                <p className="font-mono-num text-xl font-bold text-amber-700 dark:text-amber-400 mt-0.5">
                  {myJournals.filter((j) => j.butuhMediasi).length}
                </p>
              </div>
            </div>

            <h3 className="font-bold text-sm">Catatan Evaluasi Tersimpan ({myJournals.length})</h3>
            {myJournals.length === 0 ? (
              <div className="bg-white dark:bg-[#111C18] border border-slate-200 dark:border-emerald-950 rounded-2xl p-6 text-center text-xs text-slate-500">
                Belum ada jurnal evaluasi pasca nikah. Mulai catat refleksi bulan pertama Anda di formulir sebelah kiri.
              </div>
            ) : (
              myJournals.map((j) => {
                const linkedConsult = j.linkedConsultationId
                  ? myConsultations.find((c) => c.id === j.linkedConsultationId)
                  : undefined;
                return (
                  <div
                    key={j.id}
                    className="bg-white dark:bg-[#111C18] border border-slate-200 dark:border-emerald-950 rounded-2xl p-4 space-y-2"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold font-mono-num text-[#0F684E] dark:text-emerald-400">
                          Bulan ke-{j.bulanKe} · Harmoni {j.skorHarmoni}/5
                        </span>
                        {j.aspekUtama && (
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">
                            · {j.aspekUtama}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 font-mono-num">
                          {formatIndonesianDate(j.updatedAt || j.createdAt)}
                        </span>
                        <button
                          type="button"
                          aria-label={`Edit Jurnal Bulan ke-${j.bulanKe}`}
                          onClick={() => {
                            setEditingJournalId(j.id);
                            setJurnalError('');
                            setJurnalForm({
                              bulanKe: String(j.bulanKe),
                              skorHarmoni: j.skorHarmoni,
                              aspekUtama: j.aspekUtama || 'Komunikasi & Kesalingan',
                              catatan: j.catatan,
                              butuhMediasi: j.butuhMediasi,
                            });
                          }}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-emerald-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-emerald-950"
                          title="Edit Jurnal"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          aria-label={`Hapus Jurnal Bulan ke-${j.bulanKe}`}
                          onClick={() =>
                            requestConfirm({
                              title: 'Hapus Jurnal Evaluasi?',
                              message: `Catatan evaluasi Bulan ke-${j.bulanKe} akan dihapus secara permanen dari riwayat Anda.`,
                              confirmLabel: 'Hapus Jurnal',
                              danger: true,
                              onConfirm: () => {
                                deletePostMarriageJournal(j.id);
                                if (editingJournalId === j.id) setEditingJournalId(null);
                              },
                            })
                          }
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-emerald-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40"
                          title="Hapus Jurnal"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                      {j.catatan}
                    </p>

                    {j.butuhMediasi && (
                      <div className="p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 space-y-1">
                        <p className="text-[11px] font-bold text-amber-800 dark:text-amber-300">
                          Tereskalasi ke Fasilitator {currentUser.kua} untuk pendampingan mediasi.
                        </p>
                        {linkedConsult?.balasanFasilitator ? (
                          <p className="text-xs text-slate-800 dark:text-emerald-100">
                            <strong>Tanggapan {linkedConsult.dibalasOleh}:</strong>{' '}
                            {linkedConsult.balasanFasilitator}
                          </p>
                        ) : (
                          <p className="text-[11px] text-slate-600 dark:text-slate-400">
                            Menunggu tanggapan Fasilitator KUA (cek juga di tab Pojok Konsultasi).
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
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
          <div className="lg:col-span-7 space-y-5">
            <div className="bg-white dark:bg-[#111C18] border border-slate-200 dark:border-emerald-950 rounded-2xl p-6 space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h2 className="font-bold text-base">Biodata Calon Pengantin</h2>
                  {identityLocked && (
                    <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 shrink-0" />
                      Nama, NIK, dan TTL dikunci otomatis setelah Sertifikat BIMWIN terbit. Ajukan Tiket Perubahan Data di bawah jika ada kesalahan ejaan.
                    </p>
                  )}
                </div>
                {identityLocked && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] font-bold text-amber-800 dark:text-amber-300">
                    <Lock className="w-3 h-3" />
                    Identitas Terkunci Pasca-Sertifikat
                  </span>
                )}
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setProfileError('');
                  if (
                    profileForm.tanggalRencanaNikah !== (currentUser.tanggalRencanaNikah || '')
                  ) {
                    const akadCheck = validateRencanaAkadDate(
                      profileForm.tanggalRencanaNikah,
                      currentUser.createdAt
                    );
                    if (!akadCheck.ok) {
                      setProfileError(
                        akadCheck.error || 'Rencana tanggal akad nikah tidak valid.'
                      );
                      return;
                    }
                  }
                  updateOwnProfile(profileForm);
                }}
                className="space-y-3 text-xs sm:text-sm"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Nama Lengkap</label>
                    <input
                      type="text"
                      disabled={identityLocked}
                      value={profileForm.nama}
                      onChange={(e) => setProfileForm({ ...profileForm, nama: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-[#F8FAF9] dark:bg-[#0D1613] disabled:opacity-60"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">NIK KTP (16 Digit)</label>
                    <input
                      type="text"
                      disabled
                      readOnly
                      value={currentUser.nik || '-'}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-slate-100 dark:bg-[#0B1411] font-mono-num opacity-75"
                    />
                  </div>
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
                    <label className="block font-semibold mb-1">Email Aktif</label>
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      placeholder="nama@email.com"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-[#F8FAF9] dark:bg-[#0D1613]"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Pekerjaan</label>
                    <input
                      type="text"
                      value={profileForm.pekerjaan}
                      onChange={(e) => setProfileForm({ ...profileForm, pekerjaan: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-[#F8FAF9] dark:bg-[#0D1613]"
                    />
                  </div>
                  <div>
                    <label htmlFor="profil-tanggal-akad" className="block font-semibold mb-1">
                      Rencana Tanggal Akad Nikah
                    </label>
                    <input
                      id="profil-tanggal-akad"
                      type="date"
                      min={minAkadDate}
                      value={profileForm.tanggalRencanaNikah}
                      onChange={(e) => {
                        setProfileError('');
                        setProfileForm({ ...profileForm, tanggalRencanaNikah: e.target.value });
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-[#F8FAF9] dark:bg-[#0D1613] font-mono-num"
                    />
                    <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                      Minimal {formatIndonesianDate(minAkadDate)} (tidak bisa memilih waktu yang telah berlalu).
                    </p>
                  </div>
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
                {profileError && (
                  <p className="text-xs text-red-600 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg px-3 py-2">
                    {profileError}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-[#0F684E] hover:bg-[#0B523D] text-white text-xs font-semibold"
                  >
                    Simpan Perubahan Profil
                  </button>
                  {profileForm.tanggalRencanaNikah && (
                    <button
                      type="button"
                      onClick={() => {
                        const ics = buildIcsCalendarContent({
                          uid: `akad-${currentUser.username}-${profileForm.tanggalRencanaNikah}`,
                          title: `Rencana Akad Nikah — ${currentUser.nama}`,
                          description: `Pengingat persiapan berkas KUA & Sertifikat BIMWIN SAMAWA di ${currentUser.kua}.`,
                          location: `${currentUser.kua}, Kab. Jepara`,
                          dateIso: profileForm.tanggalRencanaNikah,
                          startHour: 8,
                          startMinute: 0,
                          durationMinutes: 120,
                        });
                        downloadIcsFile(`rencana-akad-${currentUser.username}.ics`, ics);
                        pushToast(
                          'success',
                          'Jadwal Akad Tersimpan (.ics)',
                          'Pengingat H-1 akad nikah siap ditambahkan ke kalender HP Anda.'
                        );
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#0F684E]/40 text-[#0F684E] dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-xs font-semibold"
                    >
                      <CalendarPlus className="w-3.5 h-3.5" />
                      Simpan Jadwal Akad ke Kalender (.ics)
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Tiket Bantuan & Perubahan Data Catin */}
            <div className="bg-white dark:bg-[#111C18] border border-slate-200 dark:border-emerald-950 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2">
                <TicketCheck className="w-4 h-4 text-[#0F684E]" />
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Ajukan Tiket Perubahan Data / Bantuan KUA
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Untuk koreksi ejaan nama/NIK setelah sertifikat terbit, pindah KUA tujuan, atau kendala akun.
                  </p>
                </div>
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (ticketDetails.trim().length < 8) return;
                  await submitDataCorrectionTicket({
                    category: ticketCategory,
                    details: ticketDetails,
                  });
                  setTicketDetails('');
                }}
                className="space-y-3 text-xs"
              >
                <div>
                  <label className="block font-semibold mb-1">Kategori Permohonan</label>
                  <select
                    value={ticketCategory}
                    onChange={(e) => setTicketCategory(e.target.value as DataTicketCategory)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-[#F8FAF9] dark:bg-[#0D1613]"
                  >
                    <option value="Koreksi Identitas">Koreksi Identitas (Nama / NIK / TTL)</option>
                    <option value="Pindah KUA">Pindah KUA Tujuan Nikah</option>
                    <option value="Ubah Jadwal Akad">Perubahan Jadwal Akad Nikah</option>
                    <option value="Kendala Teknis">Kendala Teknis Aplikasi</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Rincian Permohonan</label>
                  <textarea
                    rows={3}
                    required
                    minLength={8}
                    maxLength={800}
                    value={ticketDetails}
                    onChange={(e) => setTicketDetails(e.target.value)}
                    placeholder="Jelaskan perubahan data yang dimohonkan sesuai KTP/KK Anda..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-[#F8FAF9] dark:bg-[#0D1613]"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#0F684E] hover:bg-[#0B523D] text-white font-semibold"
                >
                  Kirim Tiket ke Admin {currentUser.kua}
                </button>
              </form>

              {myTickets.length > 0 && (
                <div className="pt-3 border-t border-slate-100 dark:border-emerald-950 space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Riwayat Tiket Anda ({myTickets.length})
                  </p>
                  <div className="space-y-2">
                    {myTickets.map((t) => (
                      <div
                        key={t.id}
                        className="p-3 rounded-xl border border-slate-200 dark:border-emerald-950 bg-[#F8FAF9] dark:bg-[#0D1613] text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-slate-900 dark:text-white">{t.category}</span>
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                              t.status === 'selesai'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : t.status === 'ditolak'
                                  ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            }`}
                          >
                            {t.status}
                          </span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300">{t.details}</p>
                        {t.officerNote && (
                          <p className="text-[11px] text-[#0F684E] dark:text-emerald-400 font-medium pt-1">
                            Tanggapan Petugas ({t.resolvedBy || 'Admin KUA'}): {t.officerNote}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-5 space-y-5">
            {/* Digital ID Card — Exact ISO/IEC 7810 ID-1 (CR80): 85.6 mm × 53.98 mm */}
            <div className="bg-white dark:bg-[#111C18] border border-slate-200 dark:border-emerald-950 rounded-2xl p-5 space-y-3.5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-sm">Kartu Peserta Digital (ID Card)</h3>
                  <p className="text-[11px] text-slate-500 font-mono-num">
                    Ukuran standar CR80: {ID_CARD_SPEC.widthMm.toString().replace('.', ',')} mm ×{' '}
                    {ID_CARD_SPEC.heightMm.toString().replace('.', ',')} mm
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    disabled={cardDownloading}
                    onClick={async () => {
                      setCardDownloading(true);
                      try {
                        await downloadParticipantCardPdf(currentUser);
                        pushToast(
                          'success',
                          'Kartu Peserta Digital PDF (85,6 × 53,98 mm) berhasil diunduh.'
                        );
                      } catch {
                        pushToast('error', 'Gagal membuat file PDF Kartu Peserta.');
                      } finally {
                        setCardDownloading(false);
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#0F684E] hover:bg-[#0B523D] text-white text-xs font-semibold inline-flex items-center gap-1.5 disabled:opacity-60"
                  >
                    <Download className="w-3.5 h-3.5" />
                    {cardDownloading ? 'Menyiapkan...' : 'Download Kartu'}
                  </button>
                  <button
                    type="button"
                    onClick={() => printParticipantCard()}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-emerald-900 text-xs font-semibold text-slate-700 dark:text-slate-200 inline-flex items-center gap-1.5 hover:bg-slate-50 dark:hover:bg-emerald-950/60"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Cetak Kartu
                  </button>
                </div>
              </div>

              <div
                data-testid="participant-id-card"
                className="print-id-card relative aspect-[85.6/53.98] w-full rounded-xl bg-gradient-to-br from-[#07382A] via-[#0B4F3B] to-[#0F684E] text-white p-4 border-2 border-[#C89B3C]/80 flex flex-col justify-between overflow-hidden shadow-md"
              >
                <div className="flex items-center justify-between border-b border-white/15 pb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <KemenagLogo size="sm" />
                    <div className="leading-tight min-w-0">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-amber-300 truncate">
                        Kemenag Kab. Jepara · SAMAWA
                      </p>
                      <p className="text-xs font-bold truncate">Kartu Peserta BIMWIN</p>
                    </div>
                  </div>
                  <span className="font-mono-num text-[10px] text-emerald-100 shrink-0">
                    @{currentUser.username}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3 py-1">
                  <div className="space-y-0.5 text-xs min-w-0">
                    <p className="font-bold text-sm leading-tight truncate">{currentUser.nama}</p>
                    <p className="font-mono-num text-[10px] text-emerald-100">
                      NIK: {maskNik(currentUser.nik)}
                    </p>
                    <p className="text-[10px] text-emerald-100 truncate">
                      {currentUser.kua} · {normalizeVillageName(currentUser.desaTempatNikah, currentUser.kua)}
                    </p>
                    <p className="text-[10px] text-amber-200 truncate">
                      Pasangan: {currentUser.pasanganNama || 'Belum Tersinkron'}
                    </p>
                  </div>
                  <QRCodeBox
                    value={currentUser.progress?.nomorSertifikat || currentUser.username}
                    kind="peserta"
                    size={58}
                    className="shrink-0"
                  />
                </div>

                <div className="flex items-center justify-between text-[9px] text-emerald-100/90 border-t border-white/15 pt-1.5">
                  <span className="font-semibold uppercase tracking-wide text-amber-200">
                    {currentUser.progress?.verifikasiFasilitator
                      ? 'Terverifikasi Lulus BIMWIN'
                      : 'Peserta Aktif BIMWIN'}
                  </span>
                  <span className="font-mono-num">85,6 × 53,98 mm</span>
                </div>
              </div>
            </div>

            {/* Professional SVG Achievement Badges */}
            <AchievementBadges user={currentUser} moocFinished={evalStep.moocFinished} />
          </div>
        </div>
      )}

      {/* TAB 11: KOTAK MASUK PENGINGAT */}
      {activeTab === 'notifikasi' && (() => {
        const kuaPolicy = resolveMobileNotifPolicy(data.mobileNotifPolicies, currentUser.kua);
        const appNotif = currentUser.appNotification;
        const apkReady = Boolean(appNotif?.apkInstalled || isPwaInstalled);
        const pushActive = Boolean(
          apkReady && appNotif?.pushEnabled && !appNotif?.mutedByOfficer
        );

        const handleToggleMyHpNotif = async () => {
          const devicePlatform =
            detectedPlatform === 'ios'
              ? 'iOS'
              : detectedPlatform === 'android'
                ? 'Android'
                : 'Desktop';

          if (!pushActive) {
            if (typeof window !== 'undefined' && 'Notification' in window && window.Notification.permission === 'default') {
              try {
                await window.Notification.requestPermission();
              } catch {
                // ignore permission prompt error in restricted frames
              }
            }
            if (!appNotif?.apkInstalled) {
              registerPesertaApkDevice(devicePlatform, true);
              pushToast(
                'success',
                'Notifikasi HP (APK) Diaktifkan',
                `Perangkat ${devicePlatform} Anda terdaftar untuk menerima pengingat dari ${currentUser.kua}.`
              );
            } else {
              toggleParticipantMobileNotif(currentUser.id, true);
            }
          } else {
            toggleParticipantMobileNotif(currentUser.id, false);
          }
        };

        return (
          <div className="space-y-4">
            <h2 className="font-display text-2xl font-semibold">Kotak Masuk Pengingat Resmi</h2>

            {/* Mobile APK Notification Status Card */}
            <div className="bg-white dark:bg-[#111C18] border border-emerald-200 dark:border-emerald-900 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-[#0F684E] dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-sm font-bold text-slate-900 dark:text-white flex flex-wrap items-center gap-2">
                    <span>Notifikasi HP (Aplikasi SAMAWA)</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        pushActive
                          ? 'bg-emerald-50 dark:bg-emerald-950/70 text-[#0F684E] dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}
                    >
                      {pushActive
                        ? `Aktif (${appNotif?.devicePlatform || 'HP'})`
                        : apkReady
                          ? 'Dijeda'
                          : 'Belum Aktif'}
                    </span>
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {kuaPolicy.enabled
                      ? `Jadwal pengingat otomatis ${currentUser.kua}: pukul ${kuaPolicy.scheduleTime} WIB (Jam tenang ${kuaPolicy.quietHoursStart}–${kuaPolicy.quietHoursEnd} WIB).`
                      : `Pengingat HP otomatis dari ${currentUser.kua} sedang dijeda sementara oleh petugas.`}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleToggleMyHpNotif}
                className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold shrink-0 transition ${
                  pushActive
                    ? 'border border-slate-300 dark:border-emerald-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-emerald-950'
                    : 'bg-[#0F684E] hover:bg-[#0B523D] text-white'
                }`}
              >
                <BellRing className="w-3.5 h-3.5" />
                {pushActive ? 'Jeda Notif HP' : 'Aktifkan Notif HP'}
              </button>
            </div>

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
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span>
                          {n.pengirim} ·{' '}
                          <span className="font-mono-num">{formatIndonesianDate(n.createdAt)}</span>
                        </span>
                        {n.channel === 'PushHP' && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-900 text-[10px] font-bold text-[#0F684E] dark:text-emerald-300">
                            <Smartphone className="w-2.5 h-2.5" />
                            Notif HP APK
                          </span>
                        )}
                      </div>
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
        );
      })()}

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
        oneTimeOnly={quizTarget?.kind === 'pretest' || quizTarget?.kind === 'postest'}
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
      <QRScannerModal
        open={attendanceQrOpen}
        onClose={() => setAttendanceQrOpen(false)}
        title="Scan QR Absensi Kelas BIMWIN"
        subtitle="Arahkan kamera ke QR Absensi yang ditampilkan Fasilitator di proyektor ruang kelas KUA."
        onDetected={(code) => {
          checkInClassByQrPayload(code);
          setAttendanceQrOpen(false);
        }}
      />
    </WorkspaceShell>
  );
};
