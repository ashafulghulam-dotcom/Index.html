export type UserRole = 'Peserta' | 'Fasilitator' | 'AdminKUA' | 'SuperAdmin';

export type Gender = 'Laki-laki' | 'Perempuan';

export const EDUCATION_LEVEL_OPTIONS = [
  'TIDAK/BLM SEKOLAH',
  'BELUM TAMAT SD/SEDERAJAT',
  'TAMAT SD/SEDERAJAT',
  'SLTP/SEDERAJAT',
  'SLTA/SEDERAJAT',
  'DIPLOMA I/II',
  'AKADEMI/DIPLOMA III/SARJANA MUDA',
  'DIPLOMA IV/STRATA I',
  'STRATA-II',
  'STRATA-III',
] as const;

export type EducationLevel = (typeof EDUCATION_LEVEL_OPTIONS)[number];

export type AttendanceStatus = 'Belum Hadir' | 'Hadir Kelas Online' | 'Hadir Kelas Offline';

export type StuntingStatus = 'Siap Hamil / Ideal' | 'Perlu Perhatian Gizi' | 'Belum Cek';

export interface StuntingCheckRecord {
  tinggiCm: number;
  beratKg: number;
  lilaCm: number;
  hbGdL: number;
  imt: number;
  imtCategory: string;
  kekRisk: boolean;
  anemiaRisk: boolean;
  status: StuntingStatus;
  checkedAt: string;
}

export interface KompakData {
  kodePiagam: string;
  peranKeluarga: string;
  pendidikanKarakter: string;
  disiplinPositif: string;
  jawabanKuis: Record<number, number>; // questionId -> selected option index
  updatedAt: string;
}

export interface IkmSurveyRecord {
  id: string;
  username: string;
  nama: string;
  kua: string;
  rating: number; // 1 - 5
  aspek: string;
  ulasan: string;
  createdAt: string;
}

export interface PesertaProgress {
  pretestDone: boolean;
  pretestScore: number; // 0-100
  postestDone: boolean;
  postestScore: number; // 0-100
  videosWatched: number[]; // module ids
  modulesRead: number[]; // module ids
  modulesCompleted: number[]; // module ids passed quiz >= 80%
  moduleScores: Record<number, number>; // moduleId -> best score 0-100
  selesaiClicked: boolean;
  ikmDone: boolean;
  preferredClassMode?: 'Online' | 'Offline';
  verifikasiFasilitator: boolean;
  verifikasiOleh?: string;
  verifikasiTanggal?: string;
  kehadiranKelas: AttendanceStatus;
  catatanFasilitator?: string;
  nomorSertifikat?: string;
  tanggalTerbitSertifikat?: string;
}

export interface BimwinUser {
  id: string;
  username: string;
  password: string;
  role: UserRole;
  nama: string;
  nik?: string;
  jenisKelamin?: Gender;
  tempatLahir?: string;
  tanggalLahir?: string; // YYYY-MM-DD
  ttl?: string;
  usia?: number;
  pendidikan?: EducationLevel;
  pekerjaan?: string;
  noHp?: string;
  email?: string;
  kua: string;
  desaTempatNikah?: string;
  alamat?: string;
  tanggalRencanaNikah?: string;
  pasanganUsername?: string;
  pasanganNama?: string;
  progress?: PesertaProgress;
  stunting?: StuntingCheckRecord;
  kompak?: KompakData;
  berkasChecklist?: Record<string, boolean>;
  createdAt: string;
  jabatan?: string; // for Fasilitator/Admin
  nip?: string;
}

export interface QuizQuestion {
  id: string;
  q: string;
  opt: string[];
  ans: number;
}

export interface ModuleSection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface ModuleDefinition {
  id: number;
  shortTitle: string;
  judul: string;
  desc: string;
  durationMinutes: number;
  driveUrl: string;
  videoUrl: string;
  videoDurationSeconds?: number;
  videoFileName?: string;
  sections: ModuleSection[];
  keyTakeaway: string;
  translations: {
    jv: string;
    en: string;
    ar: string;
  };
  quiz: QuizQuestion[];
}

export interface CompatibilityQuestion {
  id: number;
  tanya: string;
  opsi: string[];
}

export interface ClassRsvp {
  username: string;
  nama: string;
  kua: string;
  status: 'InsyaAllah Hadir' | 'Izin';
  alasanIzin?: string;
  verifiedHadir?: boolean;
  rsvpAt: string;
}

export interface BimwinClassSchedule {
  id: string;
  kodeAbsen: string;
  tipe: 'Online' | 'Offline';
  judul: string;
  kua: string;
  tanggal: string; // YYYY-MM-DD
  waktu: string;
  lokasiAtauLink: string;
  narasumber: string;
  kuota: number;
  rsvps: ClassRsvp[];
  createdBy: string;
}

export interface ConsultationMessage {
  id: string;
  pesertaUsername: string;
  pesertaNama: string;
  kua: string;
  topik: string;
  pertanyaan: string;
  smartFaqReply?: string;
  balasanFasilitator?: string;
  dibalasOleh?: string;
  dibalasPada?: string;
  status: 'Menunggu' | 'Dijawab';
  isEscalatedMediasi?: boolean;
  createdAt: string;
}

export interface PostMarriageJournal {
  id: string;
  pesertaUsername: string;
  pesertaNama: string;
  kua: string;
  bulanKe: number;
  skorHarmoni: number; // 1-5
  aspekUtama?: string;
  catatan: string;
  butuhMediasi: boolean;
  linkedConsultationId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ReminderLogItem {
  id: string;
  pesertaUsername: string;
  pesertaNama: string;
  kua: string;
  channel: 'WhatsApp' | 'Email' | 'InApp';
  subject: string;
  message: string;
  sentBy: string;
  sentByRole: UserRole;
  sentAt: string;
}

export interface NotificationItem {
  id: string;
  targetKua: string; // 'ALL' or specific KUA
  targetUsername?: string;
  judul: string;
  pesan: string;
  pengirim: string;
  readBy: string[];
  createdAt: string;
}

export interface KritikSaranItem {
  id: string;
  nama: string;
  kua: string;
  pesan: string;
  balasanAdmin?: string;
  createdAt: string;
}

export interface FaqItem {
  id: string;
  t: string;
  j: string;
}

export interface DocumentDownloadItem {
  id: string;
  judul: string;
  kat: string;
  url: string;
}

export interface GalleryItem {
  id: string;
  judul: string;
  kua: string;
  tanggal: string;
  deskripsi: string;
  imageUrl?: string;
}

export interface AuditLogItem {
  id: string;
  actor: string;
  actorUsername?: string;
  role: UserRole;
  kua?: string;
  action: string;
  timestamp: string;
}

export interface PejabatConfig {
  jabatan: string;
  nama: string;
  nip: string;
}

export interface SystemSettings {
  announcement: string;
  pejabat: PejabatConfig;
  maintenanceMode: boolean;
}

export interface VerificationResult {
  found: boolean;
  type:
    | 'Sertifikat Bimwin'
    | 'Piagam Kami Kompak'
    | 'Daftar Hadir Kelas'
    | 'Laporan Resmi'
    | 'Data Peserta (NIK)'
    | 'Kartu & Portofolio Peserta'
    | 'Sertifikat & Portofolio Peserta'
    | 'Tidak Ditemukan';
  code: string;
  title: string;
  statusLabel: string;
  valid: boolean;
  details: Array<{ label: string; value: string }>;
  note?: string;
}
