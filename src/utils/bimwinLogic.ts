import { ALIAS_DESA_LAMA_JEPARA, DESA_PER_KUA_JEPARA, SMART_FAQ_RULES } from '../data/jeparaData';
import {
  BimwinClassSchedule,
  BimwinUser,
  QuizQuestion,
  StuntingCheckRecord,
  StuntingStatus,
  VerificationResult,
} from '../types/bimwin';
import { extractVerificationCode } from './qrVerification';

const BULAN_INDO = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

export function formatIndonesianDate(dateInput?: string | Date): string {
  const date = dateInput ? new Date(dateInput) : new Date();
  if (Number.isNaN(date.getTime())) return '-';
  return `${date.getDate()} ${BULAN_INDO[date.getMonth()]} ${date.getFullYear()}`;
}

export function formatTtlFromParts(tempatLahir: string, tanggalLahirIso: string): string {
  if (!tanggalLahirIso) return tempatLahir.trim();
  const parts = tanggalLahirIso.split('-').map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return tempatLahir.trim();
  const [year, month, day] = parts;
  return `${tempatLahir.trim() || 'Jepara'}, ${day} ${BULAN_INDO[month - 1] || ''} ${year}`;
}

export function calculateAgeFromDob(dobIso: string, referenceDate: Date = new Date()): number | null {
  if (!dobIso) return null;
  const parts = dobIso.split('-').map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return null;
  const [year, month, day] = parts;
  if (year < 1920 || year > referenceDate.getFullYear()) return null;

  let age = referenceDate.getFullYear() - year;
  const monthDiff = referenceDate.getMonth() - (month - 1);
  if (monthDiff < 0 || (monthDiff === 0 && referenceDate.getDate() < day)) {
    age -= 1;
  }
  return age >= 0 && age < 120 ? age : null;
}

export function isUnderageMarriage(age: number | null | undefined): boolean {
  return typeof age === 'number' && age > 0 && age < 19;
}

export function isValidNik(nik: string): boolean {
  return /^\d{16}$/.test(nik.trim());
}

export function maskNik(nik?: string): string {
  const clean = String(nik || '').replace(/\D/g, '');
  if (clean.length < 10) return '****************';
  return `${clean.slice(0, 6)}******${clean.slice(-4)}`;
}

export function normalizeVillageName(village?: string, kua?: string): string {
  const clean = String(village || '').trim();
  if (!clean) return 'Belum Memilih Desa';
  const normalized = ALIAS_DESA_LAMA_JEPARA[clean.toLowerCase()] || clean;
  if (kua && DESA_PER_KUA_JEPARA[kua]) {
    const matched = DESA_PER_KUA_JEPARA[kua].find(
      (d) => d.toLowerCase() === normalized.toLowerCase()
    );
    if (matched) return matched;
  }
  return normalized;
}

export interface BudgetAllocation {
  totalIncome: number;
  pokok50: number;
  tabungan20: number;
  darurat10: number;
  sosialZakat10: number;
  hiburan10: number;
  targetDanaDaruratMin: number;
  targetDanaDaruratMax: number;
}

export function calculateBudgetAllocation(monthlyIncome: number): BudgetAllocation {
  const safeIncome = Number.isFinite(monthlyIncome) && monthlyIncome > 0 ? Math.round(monthlyIncome) : 0;
  const pokok50 = Math.round(safeIncome * 0.5);
  const tabungan20 = Math.round(safeIncome * 0.2);
  const darurat10 = Math.round(safeIncome * 0.1);
  const sosialZakat10 = Math.round(safeIncome * 0.1);
  const hiburan10 = safeIncome - pokok50 - tabungan20 - darurat10 - sosialZakat10;

  return {
    totalIncome: safeIncome,
    pokok50,
    tabungan20,
    darurat10,
    sosialZakat10,
    hiburan10,
    targetDanaDaruratMin: pokok50 * 3,
    targetDanaDaruratMax: pokok50 * 6,
  };
}

export function calculateStuntingReadiness(input: {
  tinggiCm: number;
  beratKg: number;
  lilaCm: number;
  hbGdL: number;
  checkedAt?: string;
}): StuntingCheckRecord {
  const heightM = input.tinggiCm / 100;
  const imt = heightM > 0 ? Number((input.beratKg / (heightM * heightM)).toFixed(1)) : 0;

  let imtCategory = 'Normal / Ideal';
  if (imt < 18.5) imtCategory = 'Kurus (Underweight)';
  else if (imt >= 25 && imt < 30) imtCategory = 'Berat Badan Berlebih';
  else if (imt >= 30) imtCategory = 'Obesitas';

  const kekRisk = input.lilaCm < 23.5;
  const anemiaRisk = input.hbGdL < 12.0;
  const imtRisk = imt < 18.5 || imt >= 30;

  const status: StuntingStatus =
    kekRisk || anemiaRisk || imtRisk ? 'Perlu Perhatian Gizi' : 'Siap Hamil / Ideal';

  return {
    tinggiCm: input.tinggiCm,
    beratKg: input.beratKg,
    lilaCm: input.lilaCm,
    hbGdL: input.hbGdL,
    imt,
    imtCategory,
    kekRisk,
    anemiaRisk,
    status,
    checkedAt: input.checkedAt || new Date().toISOString(),
  };
}

export interface FertilityCalculation {
  hphtDate: string;
  perkiraanSuciHaid: string;
  awalMasaSubur: string;
  puncakOvulasi: string;
  akhirMasaSubur: string;
  perkiraanHaidBerikutnya: string;
  fiqihNote: string;
}

export function calculateFertilityWindow(
  hphtIso: string,
  cycleLengthDays: number = 28,
  periodDays: number = 7
): FertilityCalculation | null {
  if (!hphtIso) return null;
  const start = new Date(`${hphtIso}T00:00:00`);
  if (Number.isNaN(start.getTime())) return null;

  const safeCycle = Math.min(45, Math.max(21, Math.round(cycleLengthDays || 28)));
  const safePeriod = Math.min(15, Math.max(1, Math.round(periodDays || 7)));

  const addDays = (base: Date, days: number) => {
    const next = new Date(base);
    next.setDate(next.getDate() + days);
    return next;
  };

  const ovulationOffset = safeCycle - 14;
  const fertileStart = addDays(start, Math.max(safePeriod, ovulationOffset - 4));
  const ovulationDate = addDays(start, ovulationOffset);
  const fertileEnd = addDays(start, ovulationOffset + 1);
  const nextPeriod = addDays(start, safeCycle);
  const cleanDate = addDays(start, safePeriod);

  const fiqihNote =
    safePeriod <= 15
      ? `Durasi haid ${safePeriod} hari berada dalam batas maksimal haid menurut mayoritas ulama Syafi'iyyah (15 hari). Wajib mandi besar (Ghusl) setelah darah berhenti.`
      : 'Darah yang keluar melebihi 15 hari dikategorikan istihadhah; dianjurkan berkonsultasi dengan tenaga medis dan ahli fiqih.';

  return {
    hphtDate: formatIndonesianDate(start),
    perkiraanSuciHaid: formatIndonesianDate(cleanDate),
    awalMasaSubur: formatIndonesianDate(fertileStart),
    puncakOvulasi: formatIndonesianDate(ovulationDate),
    akhirMasaSubur: formatIndonesianDate(fertileEnd),
    perkiraanHaidBerikutnya: formatIndonesianDate(nextPeriod),
    fiqihNote,
  };
}

export interface PesertaStepEvaluation {
  currentStep: number; // 1..8
  completedSteps: number[];
  moocFinished: boolean;
  canTakePretest: boolean;
  canAccessModules: boolean;
  canTakePostest: boolean;
  canOpenSelesai: boolean;
  canDownloadDocuments: boolean;
  nextActionLabel: string;
  progressPercent: number;
}

export function evaluatePesertaStep(
  user: BimwinUser,
  totalModules: number = 5
): PesertaStepEvaluation {
  const p = user.progress;
  const hasPartner = Boolean(user.pasanganUsername && user.pasanganUsername.trim().length > 0);
  const pretestDone = Boolean(p?.pretestDone);
  const modulesCount = p?.modulesCompleted?.length || 0;
  const allModulesDone = modulesCount >= totalModules;
  const postestDone = Boolean(p?.postestDone);
  const moocFinished = hasPartner && pretestDone && allModulesDone && postestDone;
  const selesaiClicked = Boolean(p?.selesaiClicked) || moocFinished;
  const ikmDone = Boolean(p?.ikmDone);
  const verified = Boolean(p?.verifikasiFasilitator);
  const canDownloadDocuments = moocFinished && ikmDone && verified;

  const completedSteps: number[] = [];
  if (hasPartner) completedSteps.push(1);
  if (hasPartner && pretestDone) completedSteps.push(2);
  if (hasPartner && pretestDone && allModulesDone) completedSteps.push(3);
  if (moocFinished) completedSteps.push(4);
  if (moocFinished && selesaiClicked) completedSteps.push(5);
  if (moocFinished && ikmDone) completedSteps.push(6);
  if (moocFinished && ikmDone && verified) {
    completedSteps.push(7);
    completedSteps.push(8);
  }

  let currentStep = 1;
  let nextActionLabel = 'Langkah 1: Sinkronkan akun pasangan terlebih dahulu';
  if (!hasPartner) {
    currentStep = 1;
    nextActionLabel = 'Langkah 1: Sinkronkan akun pasangan terlebih dahulu';
  } else if (!pretestDone) {
    currentStep = 2;
    nextActionLabel = 'Langkah 2: Kerjakan Pretest (5 Soal) untuk membuka modul';
  } else if (!allModulesDone) {
    currentStep = 3;
    nextActionLabel = `Langkah 3: Selesaikan 5 Modul & Kuis (${modulesCount}/${totalModules} tuntas)`;
  } else if (!postestDone) {
    currentStep = 4;
    nextActionLabel = 'Langkah 4: Kerjakan Postest (5 Soal) evaluasi akhir';
  } else if (!ikmDone) {
    currentStep = 6;
    nextActionLabel = 'Langkah 5–6: Buka Menu Selesai & isi Survei Kepuasan (IKM)';
  } else if (!verified) {
    currentStep = 7;
    nextActionLabel = 'Langkah 7: Pilih Kelas Online/Offline & tunggu Verifikasi Fasilitator';
  } else {
    currentStep = 8;
    nextActionLabel = 'Langkah 8: Seluruh 4 Dokumen Resmi telah terbuka dan siap diunduh';
  }

  const progressPercent = Math.round((completedSteps.length / 8) * 100);

  return {
    currentStep,
    completedSteps,
    moocFinished,
    canTakePretest: hasPartner,
    canAccessModules: hasPartner && pretestDone,
    canTakePostest: hasPartner && pretestDone && allModulesDone,
    canOpenSelesai: moocFinished,
    canDownloadDocuments,
    nextActionLabel,
    progressPercent,
  };
}

export function canFasilitatorVerify(user: BimwinUser, totalModules: number = 5): boolean {
  if (user.role !== 'Peserta') return false;
  return evaluatePesertaStep(user, totalModules).moocFinished;
}

export interface PartnerSyncCandidate {
  username?: string;
  role?: BimwinUser['role'];
  nama?: string;
  kua?: string;
  desaTempatNikah?: string;
  jenisKelamin?: BimwinUser['jenisKelamin'];
  pasanganUsername?: string;
}

/**
 * Enforces strict SAMAWA partner synchronization rules:
 * 1. Both accounts must be Peserta with distinct usernames and partner not linked elsewhere.
 * 2. Both accounts must select the exact same KUA Kecamatan.
 * 3. Both accounts must select the exact same Desa/Kelurahan Tempat Nikah.
 * 4. Pair must consist of opposite genders (Laki-laki & Perempuan).
 */
export function validatePartnerSync(
  currentUser: BimwinUser,
  partner: PartnerSyncCandidate
): { ok: boolean; error?: string } {
  if (currentUser.role !== 'Peserta') {
    return { ok: false, error: 'Hanya peserta yang dapat menyinkronkan pasangan.' };
  }
  if (partner.role && partner.role !== 'Peserta') {
    return { ok: false, error: 'Akun pasangan harus berupa akun Peserta Calon Pengantin.' };
  }
  if (
    partner.username &&
    partner.username.trim().toLowerCase() === currentUser.username.trim().toLowerCase()
  ) {
    return { ok: false, error: 'Masukkan username akun pasangan yang berbeda dari akun Anda.' };
  }
  if (
    partner.pasanganUsername &&
    partner.pasanganUsername.trim().toLowerCase() !== currentUser.username.trim().toLowerCase()
  ) {
    return {
      ok: false,
      error: `Akun "${partner.nama || partner.username}" sudah tersinkron dengan pasangan lain.`,
    };
  }

  // 1. Same KUA Kecamatan
  const myKua = String(currentUser.kua || '').trim();
  const partnerKua = String(partner.kua || '').trim();
  if (!myKua || !partnerKua || myKua.toLowerCase() !== partnerKua.toLowerCase()) {
    return {
      ok: false,
      error: `Sinkronisasi ditolak: Pilihan KUA harus sama. Akun Anda terdaftar di ${myKua || '-'}, sedangkan pasangan di ${partnerKua || '-'}.`,
    };
  }

  // 2. Same Desa / Kelurahan Tempat Nikah
  const myDesa = normalizeVillageName(currentUser.desaTempatNikah, myKua);
  const partnerDesa = normalizeVillageName(partner.desaTempatNikah, partnerKua);
  if (
    myDesa === 'Belum Memilih Desa' ||
    partnerDesa === 'Belum Memilih Desa' ||
    myDesa.toLowerCase() !== partnerDesa.toLowerCase()
  ) {
    return {
      ok: false,
      error: `Sinkronisasi ditolak: Desa/Kelurahan tempat nikah harus sama. Akun Anda di Desa ${myDesa}, sedangkan pasangan di Desa ${partnerDesa}.`,
    };
  }

  // 3. Opposite Gender (Laki-laki & Perempuan)
  const myGender = currentUser.jenisKelamin;
  const partnerGender = partner.jenisKelamin;
  const validPair =
    (myGender === 'Laki-laki' && partnerGender === 'Perempuan') ||
    (myGender === 'Perempuan' && partnerGender === 'Laki-laki');

  if (!validPair) {
    return {
      ok: false,
      error:
        'Sinkronisasi ditolak: Pasangan calon pengantin wajib terdiri dari Laki-laki dan Perempuan (tidak dapat menyinkronkan sesama jenis kelamin).',
    };
  }

  return { ok: true };
}

export interface ModuleQuizAccessState {
  unlocked: boolean;
  videoDone: boolean;
  canTakeQuiz: boolean;
  reason?: string;
}

/**
 * Enforces sequential module progression + mandatory full video completion before taking each module's quiz.
 */
export function canAccessModuleQuiz(
  user: BimwinUser,
  moduleId: number,
  orderedModuleIds: number[]
): ModuleQuizAccessState {
  const evalStep = evaluatePesertaStep(user, orderedModuleIds.length || 5);
  const idx = orderedModuleIds.indexOf(moduleId);
  const prevDone =
    idx <= 0 ||
    Boolean(user.progress?.modulesCompleted.includes(orderedModuleIds[idx - 1]));
  const unlocked = evalStep.canAccessModules && prevDone;
  const videoDone = Boolean(user.progress?.videosWatched.includes(moduleId));

  if (!unlocked) {
    return {
      unlocked: false,
      videoDone,
      canTakeQuiz: false,
      reason: !evalStep.canAccessModules
        ? 'Selesaikan Langkah 1 (Sinkron Pasangan) dan Langkah 2 (Pretest) terlebih dahulu.'
        : 'Selesaikan kuis modul sebelumnya terlebih dahulu.',
    };
  }

  if (!videoDone) {
    return {
      unlocked: true,
      videoDone: false,
      canTakeQuiz: false,
      reason: 'Tonton video pembelajaran modul ini hingga selesai terlebih dahulu untuk membuka kuis.',
    };
  }

  return {
    unlocked: true,
    videoDone: true,
    canTakeQuiz: true,
  };
}

export function countUniqueSyncedCouples(users: BimwinUser[]): number {
  const seenPairs = new Set<string>();
  const pesertaOnly = users.filter((u) => u.role === 'Peserta');
  for (const user of pesertaOnly) {
    if (!user.pasanganUsername) continue;
    const key = [user.username.toLowerCase(), user.pasanganUsername.toLowerCase()]
      .sort()
      .join('::');
    seenPairs.add(key);
  }
  return seenPairs.size;
}

export function calculateCompatibilityScore(
  answersA?: Record<number, number>,
  answersB?: Record<number, number>,
  totalQuestions: number = 5
): { matched: number; total: number; percent: number; label: string } {
  if (!answersA || !answersB || totalQuestions <= 0) {
    return { matched: 0, total: totalQuestions, percent: 0, label: 'Menunggu Pasangan' };
  }
  let matched = 0;
  let answeredBoth = 0;
  for (let i = 1; i <= totalQuestions; i += 1) {
    if (answersA[i] !== undefined && answersB[i] !== undefined) {
      answeredBoth += 1;
      if (answersA[i] === answersB[i]) matched += 1;
    }
  }
  if (answeredBoth === 0) {
    return { matched: 0, total: totalQuestions, percent: 0, label: 'Belum Lengkap' };
  }
  const percent = Math.round((matched / totalQuestions) * 100);
  let label = 'Perlu Diskusi Mendalam';
  if (percent >= 80) label = 'Sangat Selaras & Kompak';
  else if (percent >= 60) label = 'Harmonis & Saling Melengkapi';
  else if (percent >= 40) label = 'Cukup Selaras — Perkuat Dialog';

  return { matched, total: totalQuestions, percent, label };
}

export function shuffleQuizQuestions(questions: QuizQuestion[]): QuizQuestion[] {
  const cloned = questions.map((item) => {
    const indexedOpts = item.opt.map((text, idx) => ({ text, isCorrect: idx === item.ans }));
    for (let i = indexedOpts.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [indexedOpts[i], indexedOpts[j]] = [indexedOpts[j], indexedOpts[i]];
    }
    return {
      ...item,
      opt: indexedOpts.map((o) => o.text),
      ans: indexedOpts.findIndex((o) => o.isCorrect),
    };
  });

  for (let i = cloned.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [cloned[i], cloned[j]] = [cloned[j], cloned[i]];
  }
  return cloned;
}

export function getSmartFaqReply(questionText: string): string | undefined {
  const lower = questionText.toLowerCase();
  for (const rule of SMART_FAQ_RULES) {
    if (rule.keywords.some((kw) => lower.includes(kw))) {
      return rule.reply;
    }
  }
  return undefined;
}

export function generateCertificateCode(kua: string, sequence: number): string {
  const slug = kua
    .replace(/^KUA\s+/i, '')
    .replace(/\s+/g, '')
    .slice(0, 3)
    .toUpperCase();
  const year = new Date().getFullYear();
  return `JPR-${slug}-${year}-${String(sequence).padStart(4, '0')}`;
}

/**
 * Generates a guaranteed-unique monotonic certificate serial for a KUA/year
 * even if previously graduated participants were deleted or transferred.
 */
export function generateUniqueCertificateCode(
  kua: string,
  existingUsers: BimwinUser[],
  reservedCodes: Iterable<string> = []
): string {
  const slug = kua
    .replace(/^KUA\s+/i, '')
    .replace(/\s+/g, '')
    .slice(0, 3)
    .toUpperCase();
  const year = new Date().getFullYear();
  const prefix = `JPR-${slug}-${year}-`;

  let maxSeq = 0;
  const scanCode = (code?: string) => {
    if (!code) return;
    const upper = code.trim().toUpperCase();
    if (!upper.startsWith(prefix)) return;
    const tail = upper.slice(prefix.length);
    const num = Number.parseInt(tail, 10);
    if (Number.isFinite(num) && num > maxSeq) maxSeq = num;
  };

  for (const u of existingUsers) {
    scanCode(u.progress?.nomorSertifikat);
  }
  for (const code of reservedCodes) {
    scanCode(code);
  }

  return `${prefix}${String(maxSeq + 1).padStart(4, '0')}`;
}

export function verifyDocumentQuery(
  rawQuery: string,
  users: BimwinUser[],
  classes: BimwinClassSchedule[]
): VerificationResult {
  const query = extractVerificationCode(rawQuery);
  const upper = query.toUpperCase();
  const lower = query.toLowerCase();
  const peserta = users.filter((u) => u.role === 'Peserta');

  if (!query) {
    return {
      found: false,
      type: 'Tidak Ditemukan',
      code: '',
      title: 'Kode Verifikasi Kosong',
      statusLabel: 'Masukkan Nomor Dokumen atau NIK',
      valid: false,
      details: [],
    };
  }

  // 1. Cek Daftar Hadir Kelas (ABSEN-...)
  if (upper.startsWith('ABSEN-')) {
    const cls = classes.find((c) => c.kodeAbsen.toUpperCase() === upper);
    if (cls) {
      const hadirCount = cls.rsvps.filter((r) => r.verifiedHadir || r.status === 'InsyaAllah Hadir').length;
      return {
        found: true,
        type: 'Daftar Hadir Kelas',
        code: cls.kodeAbsen,
        title: cls.judul,
        statusLabel: 'TERDAFTAR & SAH',
        valid: true,
        details: [
          { label: 'Kode Absensi', value: cls.kodeAbsen },
          { label: 'Penyelenggara', value: cls.kua },
          { label: 'Jenis Kelas', value: `Bimwin ${cls.tipe}` },
          { label: 'Tanggal & Waktu', value: `${formatIndonesianDate(cls.tanggal)} · ${cls.waktu}` },
          { label: 'Narasumber', value: cls.narasumber },
          { label: 'Peserta Tercatat', value: `${hadirCount} / ${cls.kuota} peserta` },
        ],
      };
    }
  }

  // 2. Cek Piagam Kami Kompak (KOMPAK-...)
  if (upper.startsWith('KOMPAK-')) {
    const owner = peserta.find((u) => u.kompak?.kodePiagam?.toUpperCase() === upper);
    if (owner) {
      const isVerified = Boolean(owner.progress?.verifikasiFasilitator);
      return {
        found: true,
        type: 'Piagam Kami Kompak',
        code: owner.kompak?.kodePiagam || upper,
        title: `Piagam Komitmen "${owner.nama} & ${owner.pasanganNama || 'Pasangan'}"`,
        statusLabel: isVerified ? 'SAH & TERVERIFIKASI' : 'TERCATAT — MENUNGGU VERIFIKASI',
        valid: isVerified,
        details: [
          { label: 'Nomor Piagam', value: owner.kompak?.kodePiagam || upper },
          { label: 'Nama Peserta', value: owner.nama },
          { label: 'Nama Pasangan', value: owner.pasanganNama || 'Belum Tersinkron' },
          { label: 'Unit KUA', value: owner.kua },
          { label: 'Desa Tempat Nikah', value: normalizeVillageName(owner.desaTempatNikah, owner.kua) },
          { label: 'Status Kelulusan', value: isVerified ? 'Lulus & Disahkan Fasilitator' : 'Dalam Proses' },
        ],
      };
    }
  }

  // 3. Cek Laporan Resmi (LAP-BIMWIN-...)
  if (upper.startsWith('LAP-BIMWIN-')) {
    return {
      found: true,
      type: 'Laporan Resmi',
      code: upper,
      title: 'Laporan Eksekutif Bimbingan Perkawinan Kemenag Jepara',
      statusLabel: 'DOKUMEN EKSEKUTIF VALID',
      valid: true,
      details: [
        { label: 'Kode Laporan', value: upper },
        { label: 'Instansi Penerbit', value: 'Kantor Kementerian Agama Kabupaten Jepara' },
        { label: 'Cakupan Wilayah', value: '16 KUA Kecamatan se-Kabupaten Jepara' },
        { label: 'Total Peserta Aktif', value: `${peserta.length} Calon Pengantin` },
        {
          label: 'Total Sertifikat Terbit',
          value: `${peserta.filter((u) => u.progress?.verifikasiFasilitator).length} Sertifikat`,
        },
      ],
    };
  }

  // 4. Cek Nomor Sertifikat (JPR-...)
  const byCert = peserta.find(
    (u) => u.progress?.nomorSertifikat && u.progress.nomorSertifikat.toUpperCase() === upper
  );
  if (byCert) {
    const valid = Boolean(byCert.progress?.verifikasiFasilitator);
    return {
      found: true,
      type: 'Sertifikat Bimwin',
      code: byCert.progress?.nomorSertifikat || upper,
      title: byCert.nama,
      statusLabel: valid ? 'SERTIFIKAT ASLI & TERVERIFIKASI' : 'BELUM DISAHKAN',
      valid,
      details: [
        { label: 'Nomor Sertifikat', value: byCert.progress?.nomorSertifikat || '-' },
        { label: 'Nama Lengkap', value: byCert.nama },
        { label: 'NIK (Disamarkan)', value: maskNik(byCert.nik) },
        { label: 'Pasangan Tersinkron', value: byCert.pasanganNama || '-' },
        { label: 'KUA & Desa Nikah', value: `${byCert.kua} · ${normalizeVillageName(byCert.desaTempatNikah, byCert.kua)}` },
        {
          label: 'Capaian Evaluasi',
          value: `Pretest ${byCert.progress?.pretestScore ?? 0} → Postest ${byCert.progress?.postestScore ?? 0}`,
        },
        { label: 'Disahkan Oleh', value: byCert.progress?.verifikasiOleh || 'Fasilitator KUA' },
        { label: 'Tanggal Disahkan', value: byCert.progress?.tanggalTerbitSertifikat || '-' },
      ],
    };
  }

  // 5. Cek 16-digit NIK
  if (/^\d{16}$/.test(query)) {
    const byNik = peserta.find((u) => u.nik === query);
    if (byNik) {
      const evalStep = evaluatePesertaStep(byNik);
      return {
        found: true,
        type: 'Data Peserta (NIK)',
        code: maskNik(byNik.nik),
        title: byNik.nama,
        statusLabel: evalStep.canDownloadDocuments
          ? 'LULUS & BERSERTIFIKAT'
          : `PROGRES ${evalStep.progressPercent}% (LANGKAH ${evalStep.currentStep}/8)`,
        valid: evalStep.canDownloadDocuments,
        details: [
          { label: 'NIK (Privasi Terjaga)', value: maskNik(byNik.nik) },
          { label: 'Nama Lengkap', value: byNik.nama },
          { label: 'Unit KUA', value: byNik.kua },
          { label: 'Pasangan', value: byNik.pasanganNama || 'Belum Tersinkron' },
          { label: 'No. Sertifikat', value: byNik.progress?.nomorSertifikat || 'Belum Terbit' },
          { label: 'Status Kelas', value: byNik.progress?.kehadiranKelas || 'Belum Hadir' },
        ],
      };
    }
  }

  // 6. Cek Username Peserta (QR Kartu Peserta / Rapor Portofolio)
  const byUsername = peserta.find((u) => u.username.toLowerCase() === lower);
  if (byUsername) {
    const evalStep = evaluatePesertaStep(byUsername);
    const verified = Boolean(byUsername.progress?.verifikasiFasilitator);
    return {
      found: true,
      type: verified ? 'Sertifikat & Portofolio Peserta' : 'Kartu & Portofolio Peserta',
      code: byUsername.progress?.nomorSertifikat || byUsername.username,
      title: byUsername.nama,
      statusLabel: verified
        ? 'TERDAFTAR — LULUS & TERVERIFIKASI'
        : `TERDAFTAR — PROGRES ${evalStep.progressPercent}% (LANGKAH ${evalStep.currentStep}/8)`,
      valid: verified,
      details: [
        { label: 'Username Peserta', value: `@${byUsername.username}` },
        { label: 'Nama Lengkap', value: byUsername.nama },
        { label: 'NIK (Privasi Terjaga)', value: maskNik(byUsername.nik) },
        { label: 'Unit KUA & Desa', value: `${byUsername.kua} · ${normalizeVillageName(byUsername.desaTempatNikah, byUsername.kua)}` },
        { label: 'Pasangan Tersinkron', value: byUsername.pasanganNama || 'Belum Tersinkron' },
        { label: 'No. Sertifikat', value: byUsername.progress?.nomorSertifikat || 'Belum Terbit' },
        {
          label: 'Capaian MOOC',
          value: `${byUsername.progress?.modulesCompleted.length ?? 0}/5 Modul · Pretest ${byUsername.progress?.pretestScore ?? 0} → Postest ${byUsername.progress?.postestScore ?? 0}`,
        },
      ],
    };
  }

  return {
    found: false,
    type: 'Tidak Ditemukan',
    code: query,
    title: 'Data Dokumen Tidak Ditemukan',
    statusLabel: 'TIDAK TERDAFTAR DI SISTEM',
    valid: false,
    details: [
      { label: 'Kata Kunci Pencarian', value: query },
      { label: 'Format Didukung', value: 'JPR-..., KOMPAK-..., ABSEN-..., LAP-BIMWIN-..., NIK 16 digit, atau Username Peserta' },
    ],
    note: 'Pastikan penulisan kode sertifikat/piagam, tautan QR, atau 16 digit NIK sudah sesuai dengan dokumen asli.',
  };
}

export function buildPesertaCsv(users: BimwinUser[]): string {
  const header = [
    'Username',
    'Nama Lengkap',
    'NIK (Disamarkan)',
    'Jenis Kelamin',
    'Usia',
    'KUA',
    'Desa Tempat Nikah',
    'Pasangan',
    'Pretest',
    'Postest',
    'Modul Tuntas',
    'Kehadiran Kelas',
    'Status Verifikasi',
    'Nomor Sertifikat',
    'Status Stunting',
  ];

  const escapeCell = (val: string | number | undefined) => {
    const str = String(val ?? '');
    if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
    return str;
  };

  const rows = users
    .filter((u) => u.role === 'Peserta')
    .map((u) => [
      u.username,
      u.nama,
      maskNik(u.nik),
      u.jenisKelamin || '-',
      u.usia ?? '-',
      u.kua,
      normalizeVillageName(u.desaTempatNikah, u.kua),
      u.pasanganNama || 'Belum Tersinkron',
      u.progress?.pretestScore ?? 0,
      u.progress?.postestScore ?? 0,
      `${u.progress?.modulesCompleted?.length ?? 0}/5`,
      u.progress?.kehadiranKelas || 'Belum Hadir',
      u.progress?.verifikasiFasilitator ? 'Terverifikasi' : 'Belum Verifikasi',
      u.progress?.nomorSertifikat || '-',
      u.stunting?.status || 'Belum Cek',
    ]);

  return [header, ...rows].map((r) => r.map(escapeCell).join(',')).join('\n');
}
