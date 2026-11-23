import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { BimwinStoreSnapshot, createInitialSeedData } from '../data/seedData';
import {
  DATA_DIREKTORI_16_KUA,
  DEFAULT_KOMPAK_COMMITMENTS,
  KuaDirectoryEntry,
} from '../data/jeparaData';
import {
  AttendanceStatus,
  BimwinClassSchedule,
  BimwinUser,
  CompatibilityQuestion,
  DocumentDownloadItem,
  EducationLevel,
  FaqItem,
  GalleryItem,
  Gender,
  MobileNotifPolicy,
  ModuleDefinition,
  QuizQuestion,
  ReminderLogItem,
  StuntingCheckRecord,
  SystemSettings,
  UserRole,
} from '../types/bimwin';
import {
  calculateAgeFromDob,
  canAccessClassSelection,
  canAccessPiagamKompak,
  canFasilitatorVerify,
  formatIndonesianDate,
  formatTtlFromParts,
  generateUniqueCertificateCode,
  getSmartFaqReply,
  mergeKuaDirectoryWithDefaults,
  mergeModuleLocalizedDefaults,
  normalizeEducationLevel,
  normalizeVillageName,
  validateKuaDirectoryUpdate,
  validatePartnerSync,
  validateRencanaAkadDate,
} from '../utils/bimwinLogic';
import {
  canManageMobileNotifScope,
  createDefaultMobileNotifPolicy,
  dispatchBrowserPushNotification,
} from '../utils/smartReminder';
import {
  cascadeUsernameReferences,
  validateBackupSnapshot,
  validateCredentialChange,
} from '../utils/accountCredentials';
import { extractVerificationCode } from '../utils/qrVerification';

const STORAGE_KEY = 'bimwin_kemenag_jepara_store_v3';
const SESSION_KEY = 'bimwin_kemenag_jepara_session_v3';
const THEME_KEY = 'bimwin_kemenag_jepara_theme_v3';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  description?: string;
}

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
}

export interface RegisterPayload {
  username: string;
  password: string;
  nama: string;
  nik: string;
  jenisKelamin: Gender;
  tempatLahir: string;
  tanggalLahir: string;
  pendidikan: EducationLevel;
  pekerjaan: string;
  noHp: string;
  email?: string;
  kua: string;
  desaTempatNikah: string;
  alamat: string;
  tanggalRencanaNikah: string;
}

interface BimwinContextValue {
  data: BimwinStoreSnapshot;
  currentUser: BimwinUser | null;
  darkMode: boolean;
  toggleDarkMode: () => void;
  toasts: ToastMessage[];
  pushToast: (type: ToastMessage['type'], title: string, description?: string) => void;
  dismissToast: (id: string) => void;
  confirmDialog: ConfirmOptions | null;
  requestConfirm: (options: ConfirmOptions) => void;
  closeConfirm: () => void;

  // Auth
  login: (username: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;
  registerPeserta: (payload: RegisterPayload) => { ok: boolean; error?: string };
  resetPasswordRequest: (username: string, nikOrPhone: string, newPassword: string) => { ok: boolean; error?: string };
  updateOwnCredentials: (payload: {
    currentPassword: string;
    newUsername: string;
    newPassword?: string;
    confirmPassword?: string;
  }) => { ok: boolean; error?: string };

  // Peserta workflows
  syncPartnerByUsername: (partnerUsername: string) => { ok: boolean; error?: string };
  createAndLinkPartner: (payload: RegisterPayload) => { ok: boolean; error?: string };
  unlinkPartner: () => void;
  completePretest: (score: number) => void;
  markModuleRead: (moduleId: number) => void;
  markVideoWatched: (moduleId: number) => void;
  completeModuleQuiz: (moduleId: number, score: number) => boolean;
  completePostest: (score: number) => void;
  markSelesaiClicked: () => void;
  submitIkmSurvey: (payload: { rating: number; aspek: string; ulasan: string }) => void;
  saveStuntingCheck: (record: StuntingCheckRecord) => void;
  saveKompakData: (payload: {
    peranKeluarga: string;
    pendidikanKarakter: string;
    disiplinPositif: string;
    jawabanKuis: Record<number, number>;
  }) => void;
  selectClassMode: (mode: 'Online' | 'Offline') => { ok: boolean; error?: string };
  rsvpClass: (
    classId: string,
    status: 'InsyaAllah Hadir' | 'Izin',
    alasanIzin?: string
  ) => { ok: boolean; error?: string };
  submitConsultation: (topik: string, pertanyaan: string) => void;
  submitPostMarriageJournal: (payload: {
    bulanKe: number;
    skorHarmoni: number;
    aspekUtama?: string;
    catatan: string;
    butuhMediasi: boolean;
  }) => { ok: boolean; error?: string };
  updatePostMarriageJournal: (
    journalId: string,
    updates: {
      bulanKe: number;
      skorHarmoni: number;
      aspekUtama?: string;
      catatan: string;
      butuhMediasi: boolean;
    }
  ) => { ok: boolean; error?: string };
  deletePostMarriageJournal: (journalId: string) => void;
  updateOwnProfile: (updates: Partial<BimwinUser>) => void;
  toggleBerkasChecklist: (itemKey: string) => void;
  markNotificationRead: (notifId: string) => void;

  // Fasilitator workflows
  verifyPesertaByFasilitator: (
    pesertaId: string,
    payload: {
      verified: boolean;
      kehadiranKelas: AttendanceStatus;
      catatanFasilitator: string;
    }
  ) => void;
  batchVerifyMoocGraduates: (kua: string) => number;
  verifyAttendanceByCode: (kodeAbsen: string, username: string) => { ok: boolean; error?: string };
  createClassSchedule: (payload: Omit<BimwinClassSchedule, 'id' | 'kodeAbsen' | 'rsvps' | 'createdBy'>) => void;
  deleteClassSchedule: (classId: string) => void;
  verifyClassAttendee: (classId: string, username: string) => void;
  replyConsultation: (consultationId: string, reply: string) => void;
  sendReminderNotification: (targetKua: string, judul: string, pesan: string, targetUsername?: string) => void;
  logSmartReminder: (payload: {
    pesertaUsername: string;
    pesertaNama: string;
    kua: string;
    channel: ReminderLogItem['channel'];
    subject: string;
    message: string;
    alsoSendInApp?: boolean;
  }) => void;
  saveMobileNotifPolicy: (
    scopeKey: string,
    policy: MobileNotifPolicy
  ) => { ok: boolean; error?: string };
  toggleParticipantMobileNotif: (
    pesertaId: string,
    enabled: boolean
  ) => { ok: boolean; error?: string };
  registerPesertaApkDevice: (
    platform?: 'Android' | 'iOS' | 'Desktop',
    pushEnabled?: boolean
  ) => void;
  sendMobilePushReminder: (payload: {
    scopeKua: string;
    targets: Array<{
      username: string;
      nama: string;
      kua: string;
      subject: string;
      message: string;
    }>;
  }) => { ok: boolean; sentCount: number; error?: string };

  // Admin & SuperAdmin workflows
  updatePesertaByAdmin: (pesertaId: string, updates: Partial<BimwinUser>) => void;
  deleteUserByAdmin: (userId: string) => void;
  saveStaffAccount: (payload: {
    id?: string;
    username: string;
    password: string;
    nama: string;
    role: 'AdminKUA' | 'Fasilitator';
    kua: string;
    jabatan?: string;
    nip?: string;
  }) => { ok: boolean; error?: string };
  updateModuleCurriculum: (moduleId: number, updated: ModuleDefinition) => void;
  updateAssessmentQuiz: (kind: 'pretest' | 'postest', questions: QuizQuestion[]) => void;
  updateCompatibilityQuiz: (questions: CompatibilityQuestion[]) => void;
  updateSystemSettings: (settings: SystemSettings) => void;
  updateKuaDirectoryEntry: (
    kua: string,
    updates: Omit<KuaDirectoryEntry, 'kua'>
  ) => { ok: boolean; error?: string };
  resetKuaDirectoryEntry: (kua: string) => void;
  addFaq: (t: string, j: string) => void;
  deleteFaq: (id: string) => void;
  addDocument: (doc: Omit<DocumentDownloadItem, 'id'>) => void;
  deleteDocument: (id: string) => void;
  addGalleryItem: (item: Omit<GalleryItem, 'id'>) => void;
  deleteGalleryItem: (id: string) => void;
  submitKritikSaran: (nama: string, kua: string, pesan: string) => void;
  replyKritikSaran: (id: string, balasan: string) => void;
  importBackupJson: (jsonText: string) => { ok: boolean; error?: string };
  resetDemoDatabase: () => void;
}

const BimwinContext = createContext<BimwinContextValue | null>(null);

function normalizeStoreSnapshot(parsed: Partial<BimwinStoreSnapshot>): BimwinStoreSnapshot {
  const seed = createInitialSeedData();
  const seedEmailByUsername = new Map(
    seed.users.filter((u) => u.email).map((u) => [u.username.toLowerCase(), u.email])
  );
  const seedAppNotifByUsername = new Map(
    seed.users
      .filter((u) => u.appNotification)
      .map((u) => [u.username.toLowerCase(), u.appNotification])
  );
  const users = Array.isArray(parsed.users) && parsed.users.length > 0
    ? parsed.users.map((u) => ({
        ...u,
        email: u.email || seedEmailByUsername.get(u.username.toLowerCase()),
        pendidikan: normalizeEducationLevel(u.pendidikan),
        appNotification:
          u.appNotification || seedAppNotifByUsername.get(u.username.toLowerCase()),
      }))
    : seed.users;

  const mobileNotifPolicies: Record<string, MobileNotifPolicy> = {
    ALL: createDefaultMobileNotifPolicy('ALL'),
    ...(parsed.mobileNotifPolicies || {}),
  };

  return {
    ...seed,
    ...parsed,
    users,
    modules:
      Array.isArray(parsed.modules) && parsed.modules.length > 0
        ? mergeModuleLocalizedDefaults(parsed.modules, seed.modules)
        : seed.modules,
    pretest: Array.isArray(parsed.pretest) && parsed.pretest.length > 0 ? parsed.pretest : seed.pretest,
    postest: Array.isArray(parsed.postest) && parsed.postest.length > 0 ? parsed.postest : seed.postest,
    compatibilityQuiz:
      Array.isArray(parsed.compatibilityQuiz) && parsed.compatibilityQuiz.length > 0
        ? parsed.compatibilityQuiz
        : seed.compatibilityQuiz,
    classes: Array.isArray(parsed.classes) ? parsed.classes : seed.classes,
    consultations: Array.isArray(parsed.consultations) ? parsed.consultations : seed.consultations,
    journals: Array.isArray(parsed.journals) ? parsed.journals : seed.journals,
    ikmSurveys: Array.isArray(parsed.ikmSurveys) ? parsed.ikmSurveys : seed.ikmSurveys,
    notifications: Array.isArray(parsed.notifications) ? parsed.notifications : seed.notifications,
    faqs: Array.isArray(parsed.faqs) ? parsed.faqs : seed.faqs,
    documents: Array.isArray(parsed.documents) ? parsed.documents : seed.documents,
    gallery: Array.isArray(parsed.gallery) ? parsed.gallery : seed.gallery,
    kuaDirectory: mergeKuaDirectoryWithDefaults(parsed.kuaDirectory),
    kritikSaran: Array.isArray(parsed.kritikSaran) ? parsed.kritikSaran : seed.kritikSaran,
    auditLogs: Array.isArray(parsed.auditLogs) ? parsed.auditLogs : seed.auditLogs,
    reminderLogs: Array.isArray(parsed.reminderLogs) ? parsed.reminderLogs : [],
    mobileNotifPolicies,
    settings: parsed.settings || seed.settings,
  };
}

function loadInitialStore(): BimwinStoreSnapshot {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<BimwinStoreSnapshot>;
      if (parsed && Array.isArray(parsed.users) && Array.isArray(parsed.modules) && parsed.users.length > 0) {
        return normalizeStoreSnapshot(parsed);
      }
    }
  } catch {
    // ignore storage corruption and fall back to seed
  }
  return createInitialSeedData();
}

export const BimwinProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<BimwinStoreSnapshot>(loadInitialStore);
  const [sessionUserId, setSessionUserId] = useState<string | null>(() => {
    try {
      return localStorage.getItem(SESSION_KEY);
    } catch {
      return null;
    }
  });
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem(THEME_KEY) === 'dark';
    } catch {
      return false;
    }
  });
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmOptions | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // ignore quota error
    }
  }, [data]);

  useEffect(() => {
    try {
      if (sessionUserId) localStorage.setItem(SESSION_KEY, sessionUserId);
      else localStorage.removeItem(SESSION_KEY);
    } catch {
      // ignore
    }
  }, [sessionUserId]);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) root.classList.add('dark');
    else root.classList.remove('dark');
    try {
      localStorage.setItem(THEME_KEY, darkMode ? 'dark' : 'light');
    } catch {
      // ignore
    }
  }, [darkMode]);

  const currentUser = useMemo(
    () => data.users.find((u) => u.id === sessionUserId) || null,
    [data.users, sessionUserId]
  );

  const pushToast = useCallback(
    (type: ToastMessage['type'], title: string, description?: string) => {
      const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      setToasts((prev) => [...prev.slice(-3), { id, type, title, description }]);
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4200);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const requestConfirm = useCallback((options: ConfirmOptions) => {
    setConfirmDialog(options);
  }, []);

  const closeConfirm = useCallback(() => {
    setConfirmDialog(null);
  }, []);

  const appendAudit = useCallback(
    (
      snapshot: BimwinStoreSnapshot,
      actor: string,
      role: UserRole,
      action: string,
      meta?: { kua?: string; actorUsername?: string }
    ): BimwinStoreSnapshot => {
      const matchedUser = snapshot.users.find(
        (u) =>
          (meta?.actorUsername && u.username.toLowerCase() === meta.actorUsername.toLowerCase()) ||
          u.nama.trim().toLowerCase() === actor.trim().toLowerCase()
      );
      return {
        ...snapshot,
        auditLogs: [
          {
            id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
            actor,
            actorUsername: meta?.actorUsername || matchedUser?.username,
            role,
            kua: meta?.kua || matchedUser?.kua || 'Kemenag Kab. Jepara',
            action,
            timestamp: new Date().toISOString(),
          },
          ...snapshot.auditLogs,
        ].slice(0, 120),
      };
    },
    []
  );

  const toggleDarkMode = useCallback(() => setDarkMode((d) => !d), []);

  const login = useCallback(
    (username: string, password: string) => {
      const cleanUser = username.trim().toLowerCase();
      const found = data.users.find(
        (u) => u.username.toLowerCase() === cleanUser && u.password === password
      );
      if (!found) {
        return { ok: false, error: 'Username atau kata sandi tidak sesuai.' };
      }
      if (data.settings.maintenanceMode && found.role !== 'SuperAdmin') {
        return {
          ok: false,
          error: 'Sistem sedang dalam mode pemeliharaan. Hanya SuperAdmin Kemenag yang dapat masuk.',
        };
      }
      setSessionUserId(found.id);
      pushToast('success', `Selamat datang, ${found.nama}`, `${found.role} · ${found.kua}`);
      return { ok: true };
    },
    [data.settings.maintenanceMode, data.users, pushToast]
  );

  const logout = useCallback(() => {
    setSessionUserId(null);
    pushToast('info', 'Sesi diakhiri', 'Anda telah keluar dari sistem dengan aman.');
  }, [pushToast]);

  const registerPeserta = useCallback(
    (payload: RegisterPayload) => {
      const cleanUsername = payload.username.trim().toLowerCase().replace(/\s+/g, '');
      if (cleanUsername.length < 4) {
        return { ok: false, error: 'Username minimal 4 karakter tanpa spasi.' };
      }
      if (data.users.some((u) => u.username.toLowerCase() === cleanUsername)) {
        return { ok: false, error: 'Username sudah terdaftar. Gunakan username lain.' };
      }
      if (!/^\d{16}$/.test(payload.nik.trim())) {
        return { ok: false, error: 'NIK harus terdiri dari tepat 16 digit angka.' };
      }
      const akadCheck = validateRencanaAkadDate(payload.tanggalRencanaNikah);
      if (!akadCheck.ok) {
        return { ok: false, error: akadCheck.error };
      }
      const usia = calculateAgeFromDob(payload.tanggalLahir) ?? undefined;
      const newUser: BimwinUser = {
        id: `u_peserta_${Date.now()}`,
        username: cleanUsername,
        password: payload.password,
        role: 'Peserta',
        nama: payload.nama.trim(),
        nik: payload.nik.trim(),
        jenisKelamin: payload.jenisKelamin,
        tempatLahir: payload.tempatLahir.trim(),
        tanggalLahir: payload.tanggalLahir,
        ttl: formatTtlFromParts(payload.tempatLahir, payload.tanggalLahir),
        usia,
        pendidikan: payload.pendidikan,
        pekerjaan: payload.pekerjaan.trim(),
        noHp: payload.noHp.trim(),
        email: payload.email?.trim() || undefined,
        kua: payload.kua,
        desaTempatNikah: normalizeVillageName(payload.desaTempatNikah, payload.kua),
        alamat: payload.alamat.trim(),
        tanggalRencanaNikah: payload.tanggalRencanaNikah,
        createdAt: new Date().toISOString(),
        progress: {
          pretestDone: false,
          pretestScore: 0,
          postestDone: false,
          postestScore: 0,
          videosWatched: [],
          modulesRead: [],
          modulesCompleted: [],
          moduleScores: {},
          selesaiClicked: false,
          ikmDone: false,
          verifikasiFasilitator: false,
          kehadiranKelas: 'Belum Hadir',
        },
      };

      setData((prev) => ({ ...prev, users: [newUser, ...prev.users] }));
      setSessionUserId(newUser.id);
      pushToast('success', 'Pendaftaran Berhasil', 'Akun Calon Pengantin aktif. Mulai dari Langkah 1.');
      return { ok: true };
    },
    [data.users, pushToast]
  );

  const resetPasswordRequest = useCallback(
    (username: string, nikOrPhone: string, newPassword: string) => {
      const cleanUser = username.trim().toLowerCase();
      const cleanCheck = nikOrPhone.trim();
      const target = data.users.find(
        (u) =>
          u.username.toLowerCase() === cleanUser &&
          u.role === 'Peserta' &&
          (u.nik === cleanCheck || u.noHp === cleanCheck)
      );
      if (!target) {
        return {
          ok: false,
          error: 'Data tidak cocok. Pastikan Username dan NIK / No. WhatsApp sesuai saat pendaftaran.',
        };
      }
      if (newPassword.length < 6) {
        return { ok: false, error: 'Kata sandi baru minimal 6 karakter.' };
      }
      setData((prev) => ({
        ...prev,
        users: prev.users.map((u) => (u.id === target.id ? { ...u, password: newPassword } : u)),
      }));
      pushToast('success', 'Kata Sandi Diperbarui', 'Silakan masuk kembali dengan kata sandi baru Anda.');
      return { ok: true };
    },
    [data.users, pushToast]
  );

  const updateOwnCredentials = useCallback(
    (payload: {
      currentPassword: string;
      newUsername: string;
      newPassword?: string;
      confirmPassword?: string;
    }) => {
      if (!currentUser) {
        return { ok: false, error: 'Sesi pengguna tidak ditemukan. Silakan masuk kembali.' };
      }

      const otherUsernames = data.users
        .filter((u) => u.id !== currentUser.id)
        .map((u) => u.username);

      const validation = validateCredentialChange({
        currentUsername: currentUser.username,
        currentPasswordStored: currentUser.password,
        currentPasswordInput: payload.currentPassword,
        newUsername: payload.newUsername,
        newPassword: payload.newPassword,
        confirmPassword: payload.confirmPassword,
        existingUsernames: otherUsernames,
      });

      if (!validation.ok || !validation.normalizedUsername) {
        return { ok: false, error: validation.error || 'Data kredensial tidak valid.' };
      }

      const nextUsername = validation.normalizedUsername;
      const nextPassword = validation.passwordChanged
        ? (payload.newPassword as string)
        : currentUser.password;

      const changeSummary = [
        validation.usernameChanged ? `username (@${currentUser.username} -> @${nextUsername})` : null,
        validation.passwordChanged ? 'kata sandi' : null,
      ]
        .filter(Boolean)
        .join(' dan ');

      setData((prev) => {
        const updatedBase: BimwinStoreSnapshot = {
          ...prev,
          users: prev.users.map((u) =>
            u.id === currentUser.id
              ? { ...u, username: nextUsername, password: nextPassword }
              : u
          ),
        };
        const cascaded = validation.usernameChanged
          ? cascadeUsernameReferences(updatedBase, currentUser.username, nextUsername)
          : updatedBase;
        return appendAudit(
          cascaded,
          currentUser.nama,
          currentUser.role,
          `Memperbarui ${changeSummary} akun sendiri (${currentUser.role}).`
        );
      });

      pushToast(
        'success',
        'Kredensial Akun Diperbarui',
        `Perubahan ${changeSummary} berhasil disimpan.`
      );
      return { ok: true };
    },
    [appendAudit, currentUser, data.users, pushToast]
  );

  const syncPartnerByUsername = useCallback(
    (partnerUsername: string) => {
      if (!currentUser || currentUser.role !== 'Peserta') {
        return { ok: false, error: 'Hanya peserta yang dapat menyinkronkan pasangan.' };
      }
      const cleanTarget = partnerUsername.trim().toLowerCase();
      if (!cleanTarget || cleanTarget === currentUser.username.toLowerCase()) {
        return { ok: false, error: 'Masukkan username akun pasangan yang berbeda dari akun Anda.' };
      }
      const partner = data.users.find(
        (u) => u.username.toLowerCase() === cleanTarget && u.role === 'Peserta'
      );
      if (!partner) {
        return {
          ok: false,
          error: `Akun "${partnerUsername}" tidak ditemukan. Anda dapat membuatnya melalui tombol "Buat Akun Pasangan".`,
        };
      }

      const syncCheck = validatePartnerSync(currentUser, partner);
      if (!syncCheck.ok) {
        return syncCheck;
      }

      setData((prev) => ({
        ...prev,
        users: prev.users.map((u) => {
          if (u.id === currentUser.id) {
            return { ...u, pasanganUsername: partner.username, pasanganNama: partner.nama };
          }
          if (u.id === partner.id) {
            return { ...u, pasanganUsername: currentUser.username, pasanganNama: currentUser.nama };
          }
          return u;
        }),
      }));
      pushToast('success', 'Pasangan Tersinkronisasi', `Tersambung dengan ${partner.nama}. Langkah 2 (Pretest) kini terbuka.`);
      return { ok: true };
    },
    [currentUser, data.users, pushToast]
  );

  const createAndLinkPartner = useCallback(
    (payload: RegisterPayload) => {
      if (!currentUser || currentUser.role !== 'Peserta') {
        return { ok: false, error: 'Sesi peserta tidak aktif.' };
      }
      const cleanUsername = payload.username.trim().toLowerCase().replace(/\s+/g, '');
      if (cleanUsername.length < 4) {
        return { ok: false, error: 'Username pasangan minimal 4 karakter tanpa spasi.' };
      }
      if (data.users.some((u) => u.username.toLowerCase() === cleanUsername)) {
        return { ok: false, error: 'Username pasangan sudah digunakan. Gunakan username lain.' };
      }
      if (payload.password.length < 6) {
        return { ok: false, error: 'Kata sandi pasangan minimal 6 karakter.' };
      }
      if (!/^\d{16}$/.test(payload.nik.trim())) {
        return { ok: false, error: 'NIK pasangan wajib terdiri dari tepat 16 digit angka.' };
      }

      const targetKua = payload.kua || currentUser.kua;
      const targetDesa = normalizeVillageName(
        payload.desaTempatNikah || currentUser.desaTempatNikah,
        targetKua
      );
      const targetTanggalNikah = payload.tanggalRencanaNikah || currentUser.tanggalRencanaNikah;

      const syncCheck = validatePartnerSync(currentUser, {
        username: cleanUsername,
        role: 'Peserta',
        nama: payload.nama.trim(),
        kua: targetKua,
        desaTempatNikah: targetDesa,
        jenisKelamin: payload.jenisKelamin,
        tanggalRencanaNikah: targetTanggalNikah,
      });
      if (!syncCheck.ok) {
        return syncCheck;
      }

      const usia = calculateAgeFromDob(payload.tanggalLahir) ?? undefined;
      const partnerUser: BimwinUser = {
        id: `u_partner_${Date.now()}`,
        username: cleanUsername,
        password: payload.password,
        role: 'Peserta',
        nama: payload.nama.trim(),
        nik: payload.nik.trim(),
        jenisKelamin: payload.jenisKelamin,
        tempatLahir: payload.tempatLahir.trim(),
        tanggalLahir: payload.tanggalLahir,
        ttl: formatTtlFromParts(payload.tempatLahir, payload.tanggalLahir),
        usia,
        pendidikan: payload.pendidikan,
        pekerjaan: payload.pekerjaan.trim(),
        noHp: payload.noHp.trim(),
        email: payload.email?.trim() || undefined,
        kua: targetKua,
        desaTempatNikah: targetDesa,
        alamat: payload.alamat.trim(),
        tanggalRencanaNikah: payload.tanggalRencanaNikah || currentUser.tanggalRencanaNikah,
        pasanganUsername: currentUser.username,
        pasanganNama: currentUser.nama,
        createdAt: new Date().toISOString(),
        progress: {
          pretestDone: false,
          pretestScore: 0,
          postestDone: false,
          postestScore: 0,
          videosWatched: [],
          modulesRead: [],
          modulesCompleted: [],
          moduleScores: {},
          selesaiClicked: false,
          ikmDone: false,
          verifikasiFasilitator: false,
          kehadiranKelas: 'Belum Hadir',
        },
      };

      setData((prev) => ({
        ...prev,
        users: [
          partnerUser,
          ...prev.users.map((u) =>
            u.id === currentUser.id
              ? { ...u, pasanganUsername: partnerUser.username, pasanganNama: partnerUser.nama }
              : u
          ),
        ],
      }));
      pushToast(
        'success',
        'Akun Pasangan Dibuat & Tersinkron',
        `${partnerUser.nama} (${partnerUser.username}) siap masuk dan belajar bersama.`
      );
      return { ok: true };
    },
    [currentUser, data.users, pushToast]
  );

  const unlinkPartner = useCallback(() => {
    if (!currentUser || currentUser.progress?.verifikasiFasilitator) return;
    const oldPartner = currentUser.pasanganUsername;
    setData((prev) => ({
      ...prev,
      users: prev.users.map((u) => {
        if (u.id === currentUser.id || (oldPartner && u.username === oldPartner)) {
          return { ...u, pasanganUsername: undefined, pasanganNama: undefined };
        }
        return u;
      }),
    }));
    pushToast('info', 'Tautan Pasangan Dilepas', 'Anda dapat menyinkronkan ulang akun pasangan di Langkah 1.');
  }, [currentUser, pushToast]);

  const updateCurrentPesertaProgress = useCallback(
    (updater: (prev: NonNullable<BimwinUser['progress']>) => NonNullable<BimwinUser['progress']>) => {
      if (!currentUser) return;
      setData((prev) => ({
        ...prev,
        users: prev.users.map((u) => {
          if (u.id !== currentUser.id) return u;
          const base = u.progress || {
            pretestDone: false,
            pretestScore: 0,
            postestDone: false,
            postestScore: 0,
            videosWatched: [],
            modulesRead: [],
            modulesCompleted: [],
            moduleScores: {},
            selesaiClicked: false,
            ikmDone: false,
            verifikasiFasilitator: false,
            kehadiranKelas: 'Belum Hadir' as const,
          };
          return { ...u, progress: updater(base) };
        }),
      }));
    },
    [currentUser]
  );

  const completePretest = useCallback(
    (score: number) => {
      if (currentUser?.progress?.pretestDone) {
        pushToast(
          'info',
          'Pretest Sudah Dikerjakan',
          'Pretest hanya dapat dikerjakan 1 kali dan tidak dapat diulangi.'
        );
        return;
      }
      updateCurrentPesertaProgress((p) => {
        if (p.pretestDone) return p;
        return {
          ...p,
          pretestDone: true,
          pretestScore: score,
        };
      });
      pushToast('success', `Pretest Selesai (Skor ${score})`, 'Seluruh 5 Modul Pembelajaran kini terbuka.');
    },
    [currentUser?.progress?.pretestDone, pushToast, updateCurrentPesertaProgress]
  );

  const markModuleRead = useCallback(
    (moduleId: number) => {
      updateCurrentPesertaProgress((p) => ({
        ...p,
        modulesRead: Array.from(new Set([...p.modulesRead, moduleId])),
      }));
    },
    [updateCurrentPesertaProgress]
  );

  const markVideoWatched = useCallback(
    (moduleId: number) => {
      updateCurrentPesertaProgress((p) => ({
        ...p,
        videosWatched: Array.from(new Set([...p.videosWatched, moduleId])),
      }));
      pushToast('success', `Video Modul ${moduleId} Tuntas`, 'Silakan lanjutkan mengerjakan Kuis Modul.');
    },
    [pushToast, updateCurrentPesertaProgress]
  );

  const completeModuleQuiz = useCallback(
    (moduleId: number, score: number) => {
      if (!currentUser?.progress?.videosWatched.includes(moduleId)) {
        pushToast(
          'error',
          `Video Modul ${moduleId} Belum Tuntas`,
          'Tonton video pembelajaran modul ini hingga selesai terlebih dahulu sebelum mengerjakan kuis.'
        );
        return false;
      }
      const passed = score >= 80;
      updateCurrentPesertaProgress((p) => ({
        ...p,
        moduleScores: {
          ...p.moduleScores,
          [moduleId]: Math.max(p.moduleScores[moduleId] || 0, score),
        },
        modulesCompleted: passed
          ? Array.from(new Set([...p.modulesCompleted, moduleId]))
          : p.modulesCompleted,
      }));
      if (passed) {
        pushToast('success', `Modul ${moduleId} Lulus (${score}%)`, 'Progres modul tersimpan otomatis.');
      } else {
        pushToast('error', `Skor ${score}% — Belum Memenuhi 80%`, 'Pelajari ringkasan materi lalu ulangi kuis.');
      }
      return passed;
    },
    [currentUser?.progress?.videosWatched, pushToast, updateCurrentPesertaProgress]
  );

  const completePostest = useCallback(
    (score: number) => {
      if (currentUser?.progress?.postestDone) {
        pushToast(
          'info',
          'Postest Sudah Dikerjakan',
          'Postest hanya dapat dikerjakan 1 kali dan tidak dapat diulangi.'
        );
        return;
      }
      updateCurrentPesertaProgress((p) => {
        if (p.postestDone) return p;
        return {
          ...p,
          postestDone: true,
          postestScore: score,
        };
      });
      pushToast(
        'success',
        `Postest Selesai (Skor ${score})`,
        'Buka Menu SELESAI untuk mengisi Survei IKM dan memilih jadwal kelas KUA.'
      );
    },
    [currentUser?.progress?.postestDone, pushToast, updateCurrentPesertaProgress]
  );

  const markSelesaiClicked = useCallback(() => {
    updateCurrentPesertaProgress((p) => ({ ...p, selesaiClicked: true }));
  }, [updateCurrentPesertaProgress]);

  const submitIkmSurvey = useCallback(
    (payload: { rating: number; aspek: string; ulasan: string }) => {
      if (!currentUser) return;
      setData((prev) => ({
        ...prev,
        ikmSurveys: [
          {
            id: `ikm_${Date.now()}`,
            username: currentUser.username,
            nama: currentUser.nama,
            kua: currentUser.kua,
            rating: payload.rating,
            aspek: payload.aspek,
            ulasan: payload.ulasan.trim(),
            createdAt: new Date().toISOString(),
          },
          ...prev.ikmSurveys,
        ],
        users: prev.users.map((u) =>
          u.id === currentUser.id && u.progress
            ? { ...u, progress: { ...u.progress, ikmDone: true, selesaiClicked: true } }
            : u
        ),
      }));
      pushToast('success', 'Survei IKM Tersimpan', 'Terima kasih atas penilaian Anda terhadap layanan Bimwin.');
    },
    [currentUser, pushToast]
  );

  const saveStuntingCheck = useCallback(
    (record: StuntingCheckRecord) => {
      if (!currentUser) return;
      setData((prev) => ({
        ...prev,
        users: prev.users.map((u) => (u.id === currentUser.id ? { ...u, stunting: record } : u)),
      }));
      pushToast('success', 'Hasil Skrining Gizi Tersimpan', `Status: ${record.status} (IMT ${record.imt})`);
    },
    [currentUser, pushToast]
  );

  const saveKompakData = useCallback(
    (payload: {
      peranKeluarga: string;
      pendidikanKarakter: string;
      disiplinPositif: string;
      jawabanKuis: Record<number, number>;
    }) => {
      if (!currentUser) return;
      const access = canAccessPiagamKompak(currentUser, data.modules.length);
      if (!access.unlocked) {
        pushToast('error', 'Piagam Kami Kompak Masih Terkunci', access.reason);
        return;
      }
      const existingCode =
        currentUser.kompak?.kodePiagam ||
        data.users.find((u) => u.username === currentUser.pasanganUsername)?.kompak?.kodePiagam ||
        `KOMPAK-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`;

      setData((prev) => ({
        ...prev,
        users: prev.users.map((u) => {
          if (u.id === currentUser.id) {
            return {
              ...u,
              kompak: {
                kodePiagam: existingCode,
                peranKeluarga: payload.peranKeluarga.trim() || DEFAULT_KOMPAK_COMMITMENTS.peranKeluarga,
                pendidikanKarakter:
                  payload.pendidikanKarakter.trim() || DEFAULT_KOMPAK_COMMITMENTS.pendidikanKarakter,
                disiplinPositif:
                  payload.disiplinPositif.trim() || DEFAULT_KOMPAK_COMMITMENTS.disiplinPositif,
                jawabanKuis: payload.jawabanKuis,
                updatedAt: new Date().toISOString(),
              },
            };
          }
          // Sync commitment text & code to partner if linked
          if (currentUser.pasanganUsername && u.username === currentUser.pasanganUsername) {
            return {
              ...u,
              kompak: {
                kodePiagam: existingCode,
                peranKeluarga: payload.peranKeluarga.trim() || DEFAULT_KOMPAK_COMMITMENTS.peranKeluarga,
                pendidikanKarakter:
                  payload.pendidikanKarakter.trim() || DEFAULT_KOMPAK_COMMITMENTS.pendidikanKarakter,
                disiplinPositif:
                  payload.disiplinPositif.trim() || DEFAULT_KOMPAK_COMMITMENTS.disiplinPositif,
                jawabanKuis: u.kompak?.jawabanKuis || {},
                updatedAt: new Date().toISOString(),
              },
            };
          }
          return u;
        }),
      }));
      pushToast('success', 'Piagam Kami Kompak Tersimpan', `Kode Registrasi: ${existingCode}`);
    },
    [currentUser, data.modules.length, data.users, pushToast]
  );

  const selectClassMode = useCallback(
    (mode: 'Online' | 'Offline') => {
      if (!currentUser || currentUser.role !== 'Peserta') {
        return { ok: false, error: 'Hanya peserta yang dapat memilih moda kelas.' };
      }
      const access = canAccessClassSelection(currentUser, data.modules.length);
      if (!access.unlocked) {
        pushToast('error', 'Pemilihan Kelas Masih Terkunci', access.reason);
        return { ok: false, error: access.reason };
      }
      updateCurrentPesertaProgress((p) => ({
        ...p,
        preferredClassMode: mode,
      }));
      pushToast(
        'success',
        `Pilihan Kelas ${mode} Tersimpan`,
        mode === 'Online'
          ? 'Anda memilih Kelas Online. Silakan konfirmasi kehadiran pada jadwal daring KUA.'
          : 'Anda memilih Kelas Offline (Tatap Muka). Silakan konfirmasi kehadiran di Balai Nikah KUA.'
      );
      return { ok: true };
    },
    [currentUser, data.modules.length, pushToast, updateCurrentPesertaProgress]
  );

  const rsvpClass = useCallback(
    (classId: string, status: 'InsyaAllah Hadir' | 'Izin', alasanIzin?: string) => {
      if (!currentUser) return { ok: false, error: 'Sesi tidak aktif.' };
      const access = canAccessClassSelection(currentUser, data.modules.length);
      if (!access.unlocked) {
        pushToast('error', 'Kelas Masih Terkunci', access.reason);
        return { ok: false, error: access.reason };
      }
      const targetClass = data.classes.find((c) => c.id === classId);
      setData((prev) => ({
        ...prev,
        classes: prev.classes.map((cls) => {
          if (cls.id !== classId) return cls;
          const others = cls.rsvps.filter((r) => r.username !== currentUser.username);
          return {
            ...cls,
            rsvps: [
              ...others,
              {
                username: currentUser.username,
                nama: currentUser.nama,
                kua: currentUser.kua,
                status,
                alasanIzin: status === 'Izin' ? alasanIzin?.trim() : undefined,
                rsvpAt: new Date().toISOString(),
              },
            ],
          };
        }),
        users: prev.users.map((u) =>
          u.id === currentUser.id && u.progress && targetClass
            ? {
                ...u,
                progress: {
                  ...u.progress,
                  preferredClassMode: targetClass.tipe,
                },
              }
            : u
        ),
      }));
      pushToast('success', 'Konfirmasi Kelas Tercatat', `Status kehadiran: ${status}`);
      return { ok: true };
    },
    [currentUser, data.classes, data.modules.length, pushToast]
  );

  const submitConsultation = useCallback(
    (topik: string, pertanyaan: string) => {
      if (!currentUser) return;
      const smartFaqReply = getSmartFaqReply(`${topik} ${pertanyaan}`);
      setData((prev) => ({
        ...prev,
        consultations: [
          {
            id: `kon_${Date.now()}`,
            pesertaUsername: currentUser.username,
            pesertaNama: currentUser.nama,
            kua: currentUser.kua,
            topik: topik.trim(),
            pertanyaan: pertanyaan.trim(),
            smartFaqReply,
            status: 'Menunggu',
            createdAt: new Date().toISOString(),
          },
          ...(prev.consultations || []),
        ],
      }));
      pushToast(
        'success',
        'Konsultasi Terkirim ke Fasilitator',
        smartFaqReply ? 'Panduan cepat Smart FAQ tersedia sembari menunggu balasan Ustadz/Fasilitator.' : undefined
      );
    },
    [currentUser, pushToast]
  );

  const submitPostMarriageJournal = useCallback(
    (payload: {
      bulanKe: number;
      skorHarmoni: number;
      aspekUtama?: string;
      catatan: string;
      butuhMediasi: boolean;
    }) => {
      if (!currentUser) {
        return { ok: false, error: 'Sesi peserta tidak aktif.' };
      }
      const bulanKe = Math.max(1, Math.min(600, Math.round(Number(payload.bulanKe) || 0)));
      const skorHarmoni = Math.max(1, Math.min(5, Math.round(Number(payload.skorHarmoni) || 0)));
      const cleanNote = payload.catatan.trim();
      if (!bulanKe || bulanKe < 1) {
        return { ok: false, error: 'Masukkan usia pernikahan (minimal bulan ke-1).' };
      }
      if (cleanNote.length < 5) {
        return { ok: false, error: 'Catatan refleksi minimal 5 karakter agar dapat dievaluasi.' };
      }

      const nowIso = new Date().toISOString();
      const consultId = payload.butuhMediasi
        ? `kon_med_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`
        : undefined;
      const journalId = `jur_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`;

      setData((prev) => {
        const existingConsults = Array.isArray(prev.consultations) ? prev.consultations : [];
        const existingJournals = Array.isArray(prev.journals) ? prev.journals : [];
        const nextConsults =
          payload.butuhMediasi && consultId
            ? [
                {
                  id: consultId,
                  pesertaUsername: currentUser.username,
                  pesertaNama: currentUser.nama,
                  kua: currentUser.kua,
                  topik: 'Permohonan Mediasi Keluarga (Pasca Nikah)',
                  pertanyaan: `[Eskalasi Evaluasi Bulan ke-${bulanKe} · Skor Harmoni ${skorHarmoni}/5${
                    payload.aspekUtama ? ` · Aspek: ${payload.aspekUtama}` : ''
                  }] ${cleanNote}`,
                  status: 'Menunggu' as const,
                  isEscalatedMediasi: true,
                  createdAt: nowIso,
                },
                ...existingConsults,
              ]
            : existingConsults;

        return {
          ...prev,
          journals: [
            {
              id: journalId,
              pesertaUsername: currentUser.username,
              pesertaNama: currentUser.nama,
              kua: currentUser.kua,
              bulanKe,
              skorHarmoni,
              aspekUtama: payload.aspekUtama?.trim() || 'Komunikasi & Kesalingan',
              catatan: cleanNote,
              butuhMediasi: payload.butuhMediasi,
              linkedConsultationId: consultId,
              createdAt: nowIso,
            },
            ...existingJournals,
          ],
          consultations: nextConsults,
        };
      });
      pushToast(
        'success',
        'Jurnal Evaluasi Pasca Nikah Tersimpan',
        payload.butuhMediasi
          ? 'Permohonan pendampingan mediasi telah diteruskan ke Fasilitator KUA Anda.'
          : 'Tetap jaga komunikasi positif dan rasio interaksi 5:1.'
      );
      return { ok: true };
    },
    [currentUser, pushToast]
  );

  const updatePostMarriageJournal = useCallback(
    (
      journalId: string,
      updates: {
        bulanKe: number;
        skorHarmoni: number;
        aspekUtama?: string;
        catatan: string;
        butuhMediasi: boolean;
      }
    ) => {
      if (!currentUser) return { ok: false, error: 'Sesi tidak aktif.' };
      const cleanNote = updates.catatan.trim();
      if (cleanNote.length < 5) {
        return { ok: false, error: 'Catatan refleksi minimal 5 karakter.' };
      }
      const bulanKe = Math.max(1, Math.min(600, Math.round(Number(updates.bulanKe) || 1)));
      const skorHarmoni = Math.max(1, Math.min(5, Math.round(Number(updates.skorHarmoni) || 5)));
      const nowIso = new Date().toISOString();

      setData((prev) => {
        const existingJournals = Array.isArray(prev.journals) ? prev.journals : [];
        const existingConsults = Array.isArray(prev.consultations) ? prev.consultations : [];
        const target = existingJournals.find(
          (j) => j.id === journalId && j.pesertaUsername === currentUser.username
        );
        if (!target) return prev;

        let consultId = target.linkedConsultationId;
        let nextConsults = existingConsults;
        if (updates.butuhMediasi && !consultId) {
          consultId = `kon_med_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`;
          nextConsults = [
            {
              id: consultId,
              pesertaUsername: currentUser.username,
              pesertaNama: currentUser.nama,
              kua: currentUser.kua,
              topik: 'Permohonan Mediasi Keluarga (Pasca Nikah)',
              pertanyaan: `[Eskalasi Evaluasi Bulan ke-${bulanKe} · Skor Harmoni ${skorHarmoni}/5${
                updates.aspekUtama ? ` · Aspek: ${updates.aspekUtama}` : ''
              }] ${cleanNote}`,
              status: 'Menunggu' as const,
              isEscalatedMediasi: true,
              createdAt: nowIso,
            },
            ...existingConsults,
          ];
        }

        return {
          ...prev,
          journals: existingJournals.map((j) =>
            j.id === journalId
              ? {
                  ...j,
                  bulanKe,
                  skorHarmoni,
                  aspekUtama: updates.aspekUtama?.trim() || j.aspekUtama || 'Komunikasi & Kesalingan',
                  catatan: cleanNote,
                  butuhMediasi: updates.butuhMediasi,
                  linkedConsultationId: consultId,
                  updatedAt: nowIso,
                }
              : j
          ),
          consultations: nextConsults,
        };
      });
      pushToast('success', 'Jurnal Evaluasi Diperbarui', 'Perubahan refleksi pasca nikah telah disimpan.');
      return { ok: true };
    },
    [currentUser, pushToast]
  );

  const deletePostMarriageJournal = useCallback(
    (journalId: string) => {
      if (!currentUser) return;
      setData((prev) => ({
        ...prev,
        journals: (prev.journals || []).filter(
          (j) => !(j.id === journalId && j.pesertaUsername === currentUser.username)
        ),
      }));
      pushToast('info', 'Catatan Jurnal Dihapus');
    },
    [currentUser, pushToast]
  );

  const updateOwnProfile = useCallback(
    (updates: Partial<BimwinUser>) => {
      if (!currentUser) return;
      if (
        currentUser.role === 'Peserta' &&
        updates.tanggalRencanaNikah !== undefined &&
        updates.tanggalRencanaNikah !== (currentUser.tanggalRencanaNikah || '')
      ) {
        const akadCheck = validateRencanaAkadDate(
          updates.tanggalRencanaNikah,
          currentUser.createdAt
        );
        if (!akadCheck.ok) {
          pushToast('error', 'Rencana Tanggal Akad Tidak Valid', akadCheck.error);
          return;
        }
      }
      setData((prev) => {
        const next: BimwinStoreSnapshot = {
          ...prev,
          users: prev.users.map((u) => {
            if (u.id !== currentUser.id) return u;
            const lockedIdentity = u.role === 'Peserta' && Boolean(u.progress?.verifikasiFasilitator);
            const safeUpdates: Partial<BimwinUser> = { ...updates };
            if (lockedIdentity) {
              delete safeUpdates.nama;
              delete safeUpdates.tempatLahir;
              delete safeUpdates.tanggalLahir;
              delete safeUpdates.ttl;
            } else if (safeUpdates.tanggalLahir) {
              safeUpdates.usia = calculateAgeFromDob(safeUpdates.tanggalLahir) ?? u.usia;
              safeUpdates.ttl = formatTtlFromParts(
                safeUpdates.tempatLahir ?? u.tempatLahir ?? 'Jepara',
                safeUpdates.tanggalLahir
              );
            }
            return { ...u, ...safeUpdates };
          }),
        };
        if (currentUser.role !== 'Peserta') {
          return appendAudit(
            next,
            updates.nama || currentUser.nama,
            currentUser.role,
            `Memperbarui profil petugas (${currentUser.kua || 'Kemenag Kab. Jepara'})`
          );
        }
        return next;
      });
      pushToast('success', 'Profil Diperbarui', 'Perubahan biodata telah disimpan.');
    },
    [appendAudit, currentUser, pushToast]
  );

  const toggleBerkasChecklist = useCallback(
    (itemKey: string) => {
      if (!currentUser) return;
      setData((prev) => ({
        ...prev,
        users: prev.users.map((u) => {
          if (u.id !== currentUser.id) return u;
          const nextMap = { ...(u.berkasChecklist || {}), [itemKey]: !(u.berkasChecklist?.[itemKey]) };
          return { ...u, berkasChecklist: nextMap };
        }),
      }));
    },
    [currentUser]
  );

  const markNotificationRead = useCallback(
    (notifId: string) => {
      if (!currentUser) return;
      setData((prev) => ({
        ...prev,
        notifications: prev.notifications.map((n) =>
          n.id === notifId && !n.readBy.includes(currentUser.username)
            ? { ...n, readBy: [...n.readBy, currentUser.username] }
            : n
        ),
      }));
    },
    [currentUser]
  );

  const verifyPesertaByFasilitator = useCallback(
    (
      pesertaId: string,
      payload: {
        verified: boolean;
        kehadiranKelas: AttendanceStatus;
        catatanFasilitator: string;
      }
    ) => {
      if (!currentUser) return;
      const target = data.users.find((u) => u.id === pesertaId);
      if (!target) return;
      if (payload.verified && !canFasilitatorVerify(target, data.modules.length)) {
        pushToast(
          'error',
          'Belum Memenuhi Syarat MOOC',
          'Peserta wajib menuntaskan sinkron pasangan, pretest, 5 modul, dan postest sebelum disahkan.'
        );
        return;
      }

      const todayIndo = formatIndonesianDate(new Date());

      setData((prev) => {
        const updatedUsers = prev.users.map((u) => {
          if (u.id !== pesertaId || !u.progress) return u;
          const certCode =
            payload.verified
              ? u.progress.nomorSertifikat || generateUniqueCertificateCode(u.kua, prev.users)
              : u.progress.nomorSertifikat;
          return {
            ...u,
            progress: {
              ...u.progress,
              verifikasiFasilitator: payload.verified,
              verifikasiOleh: payload.verified ? currentUser.nama : undefined,
              verifikasiTanggal: payload.verified ? todayIndo : undefined,
              kehadiranKelas: payload.kehadiranKelas,
              catatanFasilitator: payload.catatanFasilitator.trim(),
              nomorSertifikat: certCode,
              tanggalTerbitSertifikat: payload.verified
                ? u.progress.tanggalTerbitSertifikat || todayIndo
                : u.progress.tanggalTerbitSertifikat,
            },
          };
        });
        return appendAudit(
          { ...prev, users: updatedUsers },
          currentUser.nama,
          currentUser.role,
          `${payload.verified ? 'Mengesahkan' : 'Memperbarui'} verifikasi peserta ${target.nama} (${target.kua})`
        );
      });
      pushToast(
        'success',
        payload.verified ? 'Peserta Disahkan & Sertifikat Aktif' : 'Data Binaan Diperbarui',
        target.nama
      );
    },
    [appendAudit, currentUser, data.modules.length, data.users, pushToast]
  );

  const batchVerifyMoocGraduates = useCallback(
    (kua: string) => {
      if (!currentUser) return 0;
      const eligible = data.users.filter(
        (u) =>
          u.role === 'Peserta' &&
          u.kua === kua &&
          !u.progress?.verifikasiFasilitator &&
          canFasilitatorVerify(u, data.modules.length)
      );
      if (eligible.length === 0) {
        pushToast('info', 'Tidak Ada Antrean Tuntas MOOC', 'Semua peserta yang tuntas MOOC sudah disahkan.');
        return 0;
      }

      const todayIndo = formatIndonesianDate(new Date());
      const eligibleIds = new Set(eligible.map((e) => e.id));

      setData((prev) => {
        const reservedCodes: string[] = [];
        const nextUsers = prev.users.map((u) => {
          if (!eligibleIds.has(u.id) || !u.progress) return u;
          const issuedCode =
            u.progress.nomorSertifikat ||
            generateUniqueCertificateCode(u.kua, prev.users, reservedCodes);
          reservedCodes.push(issuedCode);
          return {
            ...u,
            progress: {
              ...u.progress,
              verifikasiFasilitator: true,
              verifikasiOleh: currentUser.nama,
              verifikasiTanggal: todayIndo,
              kehadiranKelas:
                u.progress.kehadiranKelas === 'Belum Hadir'
                  ? ('Hadir Kelas Offline' as const)
                  : u.progress.kehadiranKelas,
              nomorSertifikat: issuedCode,
              tanggalTerbitSertifikat: u.progress.tanggalTerbitSertifikat || todayIndo,
            },
          };
        });
        return appendAudit(
          { ...prev, users: nextUsers },
          currentUser.nama,
          currentUser.role,
          `Pengesahan massal ${eligible.length} peserta tuntas MOOC di ${kua}`
        );
      });
      pushToast('success', `${eligible.length} Peserta Berhasil Disahkan`, `Sertifikat otomatis diterbitkan untuk ${kua}.`);
      return eligible.length;
    },
    [appendAudit, currentUser, data.modules.length, data.users, pushToast]
  );

  const verifyAttendanceByCode = useCallback(
    (kodeAbsen: string, username: string) => {
      if (!currentUser) return { ok: false, error: 'Sesi tidak aktif.' };
      const cleanCode = extractVerificationCode(kodeAbsen).trim().toUpperCase();
      const cls = data.classes.find((c) => c.kodeAbsen.toUpperCase() === cleanCode);
      if (!cls) return { ok: false, error: 'Kode absensi kelas tidak ditemukan.' };
      const cleanUser = extractVerificationCode(username).trim().toLowerCase();
      const peserta = data.users.find(
        (u) =>
          (u.username.toLowerCase() === cleanUser ||
            (u.progress?.nomorSertifikat &&
              u.progress.nomorSertifikat.toLowerCase() === cleanUser)) &&
          u.role === 'Peserta'
      );
      if (!peserta) return { ok: false, error: 'Username peserta tidak ditemukan.' };

      const attendanceVal: AttendanceStatus =
        cls.tipe === 'Online' ? 'Hadir Kelas Online' : 'Hadir Kelas Offline';

      setData((prev) => ({
        ...prev,
        classes: prev.classes.map((c) => {
          if (c.id !== cls.id) return c;
          const exists = c.rsvps.some((r) => r.username === peserta.username);
          return {
            ...c,
            rsvps: exists
              ? c.rsvps.map((r) =>
                  r.username === peserta.username
                    ? { ...r, status: 'InsyaAllah Hadir', verifiedHadir: true }
                    : r
                )
              : [
                  ...c.rsvps,
                  {
                    username: peserta.username,
                    nama: peserta.nama,
                    kua: peserta.kua,
                    status: 'InsyaAllah Hadir',
                    verifiedHadir: true,
                    rsvpAt: new Date().toISOString(),
                  },
                ],
          };
        }),
        users: prev.users.map((u) =>
          u.id === peserta.id && u.progress
            ? { ...u, progress: { ...u.progress, kehadiranKelas: attendanceVal } }
            : u
        ),
      }));
      pushToast('success', 'Kehadiran Terverifikasi', `${peserta.nama} tercatat ${attendanceVal}.`);
      return { ok: true };
    },
    [currentUser, data.classes, data.users, pushToast]
  );

  const createClassSchedule = useCallback(
    (payload: Omit<BimwinClassSchedule, 'id' | 'kodeAbsen' | 'rsvps' | 'createdBy'>) => {
      if (!currentUser) return;
      const slug = payload.kua.replace(/^KUA\s+/i, '').slice(0, 3).toUpperCase();
      const seq = String(data.classes.length + 1).padStart(2, '0');
      const newClass: BimwinClassSchedule = {
        ...payload,
        id: `cls_${Date.now()}`,
        kodeAbsen: `ABSEN-${slug}-${new Date().getFullYear()}-${seq}`,
        rsvps: [],
        createdBy: currentUser.username,
      };
      setData((prev) =>
        appendAudit(
          { ...prev, classes: [newClass, ...prev.classes] },
          currentUser.nama,
          currentUser.role,
          `Membuat jadwal kelas ${payload.tipe}: ${payload.judul}`
        )
      );
      pushToast('success', 'Jadwal Kelas Ditambahkan', `Kode Absensi: ${newClass.kodeAbsen}`);
    },
    [appendAudit, currentUser, data.classes.length, pushToast]
  );

  const deleteClassSchedule = useCallback(
    (classId: string) => {
      setData((prev) => ({ ...prev, classes: prev.classes.filter((c) => c.id !== classId) }));
      pushToast('info', 'Jadwal Kelas Dihapus');
    },
    [pushToast]
  );

  const verifyClassAttendee = useCallback(
    (classId: string, username: string) => {
      const cls = data.classes.find((c) => c.id === classId);
      if (!cls) return;
      const attendanceVal: AttendanceStatus =
        cls.tipe === 'Online' ? 'Hadir Kelas Online' : 'Hadir Kelas Offline';
      setData((prev) => ({
        ...prev,
        classes: prev.classes.map((c) =>
          c.id === classId
            ? {
                ...c,
                rsvps: c.rsvps.map((r) =>
                  r.username === username ? { ...r, verifiedHadir: true } : r
                ),
              }
            : c
        ),
        users: prev.users.map((u) =>
          u.username === username && u.progress
            ? { ...u, progress: { ...u.progress, kehadiranKelas: attendanceVal } }
            : u
        ),
      }));
      pushToast('success', 'Kehadiran Peserta Dikonfirmasi', `${username} → ${attendanceVal}`);
    },
    [data.classes, pushToast]
  );

  const replyConsultation = useCallback(
    (consultationId: string, reply: string) => {
      if (!currentUser) return;
      setData((prev) =>
        appendAudit(
          {
            ...prev,
            consultations: prev.consultations.map((c) =>
              c.id === consultationId
                ? {
                    ...c,
                    balasanFasilitator: reply.trim(),
                    dibalasOleh: currentUser.nama,
                    dibalasPada: formatIndonesianDate(new Date()),
                    status: 'Dijawab',
                  }
                : c
            ),
          },
          currentUser.nama,
          currentUser.role,
          `Membalas konsultasi #${consultationId}`
        )
      );
      pushToast('success', 'Balasan Konsultasi Terkirim');
    },
    [appendAudit, currentUser, pushToast]
  );

  const sendReminderNotification = useCallback(
    (targetKua: string, judul: string, pesan: string, targetUsername?: string) => {
      if (!currentUser) return;
      setData((prev) =>
        appendAudit(
          {
            ...prev,
            notifications: [
              {
                id: `notif_${Date.now()}`,
                targetKua,
                targetUsername,
                judul: judul.trim(),
                pesan: pesan.trim(),
                pengirim: currentUser.nama,
                readBy: [],
                createdAt: new Date().toISOString(),
              },
              ...prev.notifications,
            ],
          },
          currentUser.nama,
          currentUser.role,
          `Mengirim pengingat "${judul.trim()}" ke ${targetUsername || targetKua}`
        )
      );
      pushToast('success', 'Pengingat Resmi Terkirim', `Tujuan: ${targetUsername || targetKua}`);
    },
    [appendAudit, currentUser, pushToast]
  );

  const logSmartReminder = useCallback(
    (payload: {
      pesertaUsername: string;
      pesertaNama: string;
      kua: string;
      channel: ReminderLogItem['channel'];
      subject: string;
      message: string;
      alsoSendInApp?: boolean;
    }) => {
      if (!currentUser) return;
      const nowIso = new Date().toISOString();
      const logEntry: ReminderLogItem = {
        id: `rem_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        pesertaUsername: payload.pesertaUsername,
        pesertaNama: payload.pesertaNama,
        kua: payload.kua,
        channel: payload.channel,
        subject: payload.subject.trim(),
        message: payload.message.trim(),
        sentBy: currentUser.nama,
        sentByRole: currentUser.role,
        sentAt: nowIso,
      };
      setData((prev) => {
        const nextNotifs =
          payload.channel === 'InApp' || payload.channel === 'PushHP' || payload.alsoSendInApp
            ? [
                {
                  id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
                  targetKua: payload.kua,
                  targetUsername: payload.pesertaUsername,
                  channel: payload.channel === 'PushHP' ? ('PushHP' as const) : ('Portal' as const),
                  judul: payload.subject.trim(),
                  pesan: payload.message.trim(),
                  pengirim: `${currentUser.nama} (${payload.channel})`,
                  readBy: [],
                  createdAt: nowIso,
                },
                ...(prev.notifications || []),
              ]
            : prev.notifications || [];

        return appendAudit(
          {
            ...prev,
            notifications: nextNotifs,
            reminderLogs: [logEntry, ...(prev.reminderLogs || [])].slice(0, 200),
          },
          currentUser.nama,
          currentUser.role,
          `Mengirim Smart Reminder ${payload.channel} ke ${payload.pesertaNama} (${payload.kua})`
        );
      });
    },
    [appendAudit, currentUser]
  );

  const saveMobileNotifPolicy = useCallback(
    (scopeKey: string, policy: MobileNotifPolicy): { ok: boolean; error?: string } => {
      if (!currentUser) {
        return { ok: false, error: 'Sesi login tidak ditemukan.' };
      }
      if (!canManageMobileNotifScope(currentUser, scopeKey)) {
        const msg = `Anda hanya berwenang mengatur notifikasi HP untuk wilayah ${currentUser.kua}.`;
        pushToast('error', 'Akses Ditolak', msg);
        return { ok: false, error: msg };
      }

      const nowIso = new Date().toISOString();
      const normalizedPolicy: MobileNotifPolicy = {
        ...policy,
        scopeKey,
        customTitleTemplate: policy.customTitleTemplate.trim() || createDefaultMobileNotifPolicy(scopeKey).customTitleTemplate,
        customBodyTemplate: policy.customBodyTemplate.trim() || createDefaultMobileNotifPolicy(scopeKey).customBodyTemplate,
        updatedAt: nowIso,
        updatedBy: currentUser.nama,
      };
      const scopeLabel = scopeKey === 'ALL' ? 'Semua 16 KUA Kab. Jepara' : scopeKey;

      setData((prev) =>
        appendAudit(
          {
            ...prev,
            mobileNotifPolicies: {
              ...(prev.mobileNotifPolicies || {}),
              [scopeKey]: normalizedPolicy,
            },
          },
          currentUser.nama,
          currentUser.role,
          `Memperbarui pengaturan Notifikasi HP (APK) untuk ${scopeLabel} (${normalizedPolicy.enabled ? 'Aktif' : 'Nonaktif'}, jadwal ${normalizedPolicy.scheduleTime} WIB)`
        )
      );

      pushToast(
        'success',
        'Pengaturan Notifikasi HP Tersimpan',
        `Cakupan: ${scopeLabel} · Status: ${normalizedPolicy.enabled ? 'Aktif' : 'Dijeda'}`
      );
      return { ok: true };
    },
    [appendAudit, currentUser, pushToast]
  );

  const toggleParticipantMobileNotif = useCallback(
    (pesertaId: string, enabled: boolean): { ok: boolean; error?: string } => {
      if (!currentUser) {
        return { ok: false, error: 'Sesi login tidak ditemukan.' };
      }
      const target = data.users.find((u) => u.id === pesertaId);
      if (!target || target.role !== 'Peserta') {
        return { ok: false, error: 'Data peserta tidak ditemukan.' };
      }

      const isSelf = currentUser.id === target.id;
      const officerAllowed = canManageMobileNotifScope(currentUser, target.kua);
      if (!isSelf && !officerAllowed) {
        const msg = `Anda hanya dapat mengatur notifikasi HP peserta di wilayah ${currentUser.kua}.`;
        pushToast('error', 'Akses Ditolak', msg);
        return { ok: false, error: msg };
      }

      if (!target.appNotification?.apkInstalled) {
        const msg = `${target.nama} belum memasang Aplikasi/APK SAMAWA di perangkat HP.`;
        pushToast('info', 'Aplikasi Belum Terpasang', msg);
        return { ok: false, error: msg };
      }

      setData((prev) =>
        appendAudit(
          {
            ...prev,
            users: prev.users.map((u) =>
              u.id === pesertaId
                ? {
                    ...u,
                    appNotification: {
                      ...(u.appNotification || { apkInstalled: true, pushEnabled: enabled }),
                      pushEnabled: enabled,
                      mutedByOfficer: isSelf ? false : !enabled,
                    },
                  }
                : u
            ),
          },
          currentUser.nama,
          currentUser.role,
          `${enabled ? 'Mengaktifkan' : 'Menjeda'} Notifikasi HP (APK) untuk ${target.nama} (${target.kua})`
        )
      );

      pushToast(
        'success',
        enabled ? `Notif HP Diaktifkan (${target.nama})` : `Notif HP Dijeda (${target.nama})`,
        `${target.kua} · Perangkat ${target.appNotification.devicePlatform || 'HP'}`
      );
      return { ok: true };
    },
    [appendAudit, currentUser, data.users, pushToast]
  );

  const registerPesertaApkDevice = useCallback(
    (platform: 'Android' | 'iOS' | 'Desktop' = 'Android', pushEnabled: boolean = true) => {
      if (!currentUser || currentUser.role !== 'Peserta') return;
      const nowIso = new Date().toISOString();
      setData((prev) => ({
        ...prev,
        users: prev.users.map((u) =>
          u.id === currentUser.id
            ? {
                ...u,
                appNotification: {
                  ...(u.appNotification || {}),
                  apkInstalled: true,
                  installedAt: u.appNotification?.installedAt || nowIso,
                  devicePlatform: platform,
                  pushEnabled,
                  mutedByOfficer: false,
                },
              }
            : u
        ),
      }));
    },
    [currentUser]
  );

  const sendMobilePushReminder = useCallback(
    (payload: {
      scopeKua: string;
      targets: Array<{
        username: string;
        nama: string;
        kua: string;
        subject: string;
        message: string;
      }>;
    }): { ok: boolean; sentCount: number; error?: string } => {
      if (!currentUser) {
        return { ok: false, sentCount: 0, error: 'Sesi login tidak ditemukan.' };
      }
      if (!canManageMobileNotifScope(currentUser, payload.scopeKua)) {
        const msg = `Anda hanya berwenang mengirim notifikasi HP ke wilayah ${currentUser.kua}.`;
        pushToast('error', 'Akses Ditolak', msg);
        return { ok: false, sentCount: 0, error: msg };
      }

      const eligibleTargets = payload.targets.filter((t) => {
        if (currentUser.role !== 'SuperAdmin' && t.kua !== currentUser.kua) return false;
        const userRec = data.users.find(
          (u) => u.username.toLowerCase() === t.username.toLowerCase()
        );
        return Boolean(
          userRec?.appNotification?.apkInstalled &&
            userRec.appNotification.pushEnabled &&
            !userRec.appNotification.mutedByOfficer
        );
      });

      if (eligibleTargets.length === 0) {
        const msg =
          'Tidak ada peserta dengan Aplikasi/APK terpasang dan Notifikasi HP aktif pada target yang dipilih.';
        pushToast('info', 'Tidak Ada Penerima APK Aktif', msg);
        return { ok: false, sentCount: 0, error: msg };
      }

      const nowIso = new Date().toISOString();
      const targetUsernameSet = new Set(eligibleTargets.map((t) => t.username.toLowerCase()));

      const newLogs: ReminderLogItem[] = eligibleTargets.map((t, idx) => ({
        id: `rem_push_${Date.now()}_${idx}_${Math.random().toString(36).slice(2, 5)}`,
        pesertaUsername: t.username,
        pesertaNama: t.nama,
        kua: t.kua,
        channel: 'PushHP',
        subject: t.subject.trim(),
        message: t.message.trim(),
        sentBy: currentUser.nama,
        sentByRole: currentUser.role,
        sentAt: nowIso,
      }));

      const newNotifs = eligibleTargets.map((t, idx) => ({
        id: `notif_push_${Date.now()}_${idx}_${Math.random().toString(36).slice(2, 5)}`,
        targetKua: t.kua,
        targetUsername: t.username,
        channel: 'PushHP' as const,
        judul: t.subject.trim(),
        pesan: t.message.trim(),
        pengirim: `${currentUser.nama} (Notif HP APK)`,
        readBy: [],
        createdAt: nowIso,
      }));

      const scopeLabel =
        payload.scopeKua === 'ALL' ? 'Semua 16 KUA Kab. Jepara' : payload.scopeKua;

      setData((prev) =>
        appendAudit(
          {
            ...prev,
            users: prev.users.map((u) =>
              targetUsernameSet.has(u.username.toLowerCase()) && u.appNotification
                ? {
                    ...u,
                    appNotification: {
                      ...u.appNotification,
                      lastPushSentAt: nowIso,
                    },
                  }
                : u
            ),
            notifications: [...newNotifs, ...(prev.notifications || [])],
            reminderLogs: [...newLogs, ...(prev.reminderLogs || [])].slice(0, 200),
          },
          currentUser.nama,
          currentUser.role,
          `Mengirim Notifikasi HP (APK) ke ${eligibleTargets.length} peserta (${scopeLabel})`
        )
      );

      // Fire native PWA/Browser notification preview if permitted on current device
      const first = eligibleTargets[0];
      if (first) {
        void dispatchBrowserPushNotification(
          first.subject.trim(),
          eligibleTargets.length > 1
            ? `Terkirim ke ${eligibleTargets.length} perangkat APK (${scopeLabel}). ${first.message.trim().slice(0, 100)}`
            : first.message.trim().slice(0, 140),
          `samawa-push-${Date.now()}`
        );
      }

      pushToast(
        'success',
        `Notifikasi HP Terkirim (${eligibleTargets.length} Perangkat APK)`,
        `Tercatat pada riwayat Smart Reminder & masuk ke perangkat peserta ${scopeLabel}.`
      );
      return { ok: true, sentCount: eligibleTargets.length };
    },
    [appendAudit, currentUser, data.users, pushToast]
  );

  const updatePesertaByAdmin = useCallback(
    (pesertaId: string, updates: Partial<BimwinUser>) => {
      if (!currentUser) return;
      const target = data.users.find((u) => u.id === pesertaId);
      if (!target) return;
      if (currentUser.role === 'AdminKUA' && target.kua !== currentUser.kua) {
        pushToast(
          'error',
          'Akses Ditolak',
          `Admin ${currentUser.kua} hanya berwenang memperbarui peserta di wilayahnya.`
        );
        return;
      }

      const safeUpdates: Partial<BimwinUser> = { ...updates };
      if (!safeUpdates.password || !safeUpdates.password.trim()) {
        delete safeUpdates.password;
      }
      if (currentUser.role === 'AdminKUA') {
        safeUpdates.kua = currentUser.kua;
      }

      setData((prev) => {
        const nextUsers = prev.users.map((u) => {
          if (u.id !== pesertaId) return u;
          const next = { ...u, ...safeUpdates };
          if (safeUpdates.tanggalLahir) {
            next.usia = calculateAgeFromDob(safeUpdates.tanggalLahir) ?? next.usia;
            next.ttl = formatTtlFromParts(next.tempatLahir || 'Jepara', safeUpdates.tanggalLahir);
          }
          if (safeUpdates.desaTempatNikah) {
            next.desaTempatNikah = normalizeVillageName(safeUpdates.desaTempatNikah, next.kua);
          }
          return next;
        });
        return appendAudit(
          { ...prev, users: nextUsers },
          currentUser.nama,
          currentUser.role,
          `Memperbarui data peserta ${safeUpdates.nama || target.nama}`
        );
      });
      pushToast('success', 'Data Peserta Disimpan');
    },
    [appendAudit, currentUser, data.users, pushToast]
  );

  const deleteUserByAdmin = useCallback(
    (userId: string) => {
      if (!currentUser) return;
      const victim = data.users.find((u) => u.id === userId);
      if (!victim) return;
      if (victim.id === currentUser.id) {
        pushToast('error', 'Tidak Dapat Menghapus Akun Sendiri');
        return;
      }
      if (currentUser.role === 'AdminKUA' && (victim.role !== 'Peserta' || victim.kua !== currentUser.kua)) {
        pushToast(
          'error',
          'Akses Ditolak',
          `Admin ${currentUser.kua} hanya dapat menghapus peserta di wilayah KUA sendiri.`
        );
        return;
      }
      setData((prev) =>
        appendAudit(
          { ...prev, users: prev.users.filter((u) => u.id !== userId) },
          currentUser.nama,
          currentUser.role,
          `Menghapus akun ${victim.nama} (${victim.role})`
        )
      );
      pushToast('info', 'Akun Berhasil Dihapus');
    },
    [appendAudit, currentUser, data.users, pushToast]
  );

  const saveStaffAccount = useCallback(
    (payload: {
      id?: string;
      username: string;
      password: string;
      nama: string;
      role: 'AdminKUA' | 'Fasilitator';
      kua: string;
      jabatan?: string;
      nip?: string;
    }) => {
      if (!currentUser) return { ok: false, error: 'Sesi tidak aktif.' };
      if (currentUser.role !== 'SuperAdmin') {
        return { ok: false, error: 'Hanya SuperAdmin Kemenag yang berwenang mengelola akun petugas.' };
      }
      const cleanUser = payload.username.trim().toLowerCase().replace(/\s+/g, '');
      const duplicate = data.users.find(
        (u) => u.username.toLowerCase() === cleanUser && u.id !== payload.id
      );
      if (duplicate) return { ok: false, error: 'Username sudah dipakai oleh akun lain.' };

      const cleanPass = payload.password.trim();
      if (!payload.id && cleanPass.length < 6) {
        return { ok: false, error: 'Kata sandi akun baru minimal 6 karakter.' };
      }
      if (payload.id && cleanPass.length > 0 && cleanPass.length < 6) {
        return { ok: false, error: 'Kata sandi reset minimal 6 karakter.' };
      }

      if (payload.id) {
        const existingStaff = data.users.find((u) => u.id === payload.id);
        setData((prev) => {
          const updatedBase: BimwinStoreSnapshot = {
            ...prev,
            users: prev.users.map((u) =>
              u.id === payload.id
                ? {
                    ...u,
                    username: cleanUser,
                    password: cleanPass ? cleanPass : u.password,
                    nama: payload.nama.trim(),
                    role: payload.role,
                    kua: payload.kua,
                    jabatan: payload.jabatan?.trim(),
                    nip: payload.nip?.trim(),
                  }
                : u
            ),
          };
          const cascaded =
            existingStaff && existingStaff.username.toLowerCase() !== cleanUser
              ? cascadeUsernameReferences(updatedBase, existingStaff.username, cleanUser)
              : updatedBase;
          return appendAudit(
            cascaded,
            currentUser.nama,
            currentUser.role,
            `Memperbarui akun ${payload.role} (${cleanUser})${cleanPass ? ' + reset kata sandi' : ''}`
          );
        });
        pushToast('success', 'Akun Petugas Diperbarui');
      } else {
        const newAccount: BimwinUser = {
          id: `u_staff_${Date.now()}`,
          username: cleanUser,
          password: cleanPass,
          nama: payload.nama.trim(),
          role: payload.role,
          kua: payload.kua,
          jabatan: payload.jabatan?.trim(),
          nip: payload.nip?.trim(),
          createdAt: new Date().toISOString(),
        };
        setData((prev) =>
          appendAudit(
            { ...prev, users: [newAccount, ...prev.users] },
            currentUser.nama,
            currentUser.role,
            `Menambahkan akun ${payload.role} (${cleanUser} · ${payload.kua})`
          )
        );
        pushToast('success', 'Akun Petugas Ditambahkan');
      }
      return { ok: true };
    },
    [appendAudit, currentUser, data.users, pushToast]
  );

  const updateModuleCurriculum = useCallback(
    (moduleId: number, updated: ModuleDefinition) => {
      if (!currentUser) return;
      setData((prev) =>
        appendAudit(
          {
            ...prev,
            modules: prev.modules.map((m) => (m.id === moduleId ? updated : m)),
          },
          currentUser.nama,
          currentUser.role,
          `Memperbarui kurikulum & kuis Modul ${moduleId}`
        )
      );
      pushToast('success', `Modul ${moduleId} Diperbarui`, 'Perubahan langsung aktif di ruang belajar peserta.');
    },
    [appendAudit, currentUser, pushToast]
  );

  const updateAssessmentQuiz = useCallback(
    (kind: 'pretest' | 'postest', questions: QuizQuestion[]) => {
      if (!currentUser) return;
      setData((prev) =>
        appendAudit(
          { ...prev, [kind]: questions },
          currentUser.nama,
          currentUser.role,
          `Memperbarui bank soal ${kind.toUpperCase()}`
        )
      );
      pushToast('success', `Soal ${kind.toUpperCase()} Diperbarui`);
    },
    [appendAudit, currentUser, pushToast]
  );

  const updateCompatibilityQuiz = useCallback(
    (questions: CompatibilityQuestion[]) => {
      if (!currentUser) return;
      setData((prev) =>
        appendAudit(
          { ...prev, compatibilityQuiz: questions },
          currentUser.nama,
          currentUser.role,
          'Memperbarui skenario Kuis Kecocokan Pasangan'
        )
      );
      pushToast('success', 'Kuis Kecocokan Diperbarui');
    },
    [appendAudit, currentUser, pushToast]
  );

  const updateSystemSettings = useCallback(
    (settings: SystemSettings) => {
      if (!currentUser) return;
      setData((prev) =>
        appendAudit(
          { ...prev, settings },
          currentUser.nama,
          currentUser.role,
          'Memperbarui Pengaturan Sistem & Pejabat Penandatangan'
        )
      );
      pushToast('success', 'Pengaturan Sistem Disimpan');
    },
    [appendAudit, currentUser, pushToast]
  );

  const updateKuaDirectoryEntry = useCallback(
    (kua: string, updates: Omit<KuaDirectoryEntry, 'kua'>) => {
      if (!currentUser || currentUser.role !== 'SuperAdmin') {
        return { ok: false, error: 'Hanya SuperAdmin Kemenag yang dapat mengubah Direktori 16 KUA.' };
      }
      const check = validateKuaDirectoryUpdate(updates);
      if (!check.ok) {
        return check;
      }

      const cleaned: KuaDirectoryEntry = {
        kua,
        alamat: updates.alamat.trim(),
        telp: updates.telp.trim(),
        whatsapp: updates.whatsapp?.trim() || undefined,
        email: updates.email?.trim() || undefined,
        kepalaKua: updates.kepalaKua?.trim() || undefined,
        jamLayanan: updates.jamLayanan.trim(),
        mapsUrl: updates.mapsUrl?.trim() || undefined,
        mapsQuery: updates.mapsQuery?.trim() || undefined,
        catatan: updates.catatan?.trim() || undefined,
        updatedAt: new Date().toISOString(),
      };

      setData((prev) =>
        appendAudit(
          {
            ...prev,
            kuaDirectory: mergeKuaDirectoryWithDefaults(prev.kuaDirectory).map((entry) =>
              entry.kua === kua ? cleaned : entry
            ),
          },
          currentUser.nama,
          currentUser.role,
          `Memperbarui Direktori ${kua} (alamat, kontak aktif, dan jam layanan)`,
          { kua, actorUsername: currentUser.username }
        )
      );

      pushToast('success', `Direktori ${kua} Diperbarui`, 'Perubahan langsung tampil di Direktori 16 KUA publik.');
      return { ok: true };
    },
    [appendAudit, currentUser, pushToast]
  );

  const resetKuaDirectoryEntry = useCallback(
    (kua: string) => {
      if (!currentUser || currentUser.role !== 'SuperAdmin') return;
      const defaultEntry = DATA_DIREKTORI_16_KUA.find((item) => item.kua === kua);
      if (!defaultEntry) return;
      setData((prev) =>
        appendAudit(
          {
            ...prev,
            kuaDirectory: mergeKuaDirectoryWithDefaults(prev.kuaDirectory).map((entry) =>
              entry.kua === kua ? { ...defaultEntry } : entry
            ),
          },
          currentUser.nama,
          currentUser.role,
          `Memulihkan data default Direktori ${kua}`,
          { kua, actorUsername: currentUser.username }
        )
      );
      pushToast('info', `Direktori ${kua} Dipulihkan`, 'Data kembali ke pengaturan awal Kemenag Jepara.');
    },
    [appendAudit, currentUser, pushToast]
  );

  const addFaq = useCallback(
    (t: string, j: string) => {
      setData((prev) => ({
        ...prev,
        faqs: [...prev.faqs, { id: `faq_${Date.now()}`, t: t.trim(), j: j.trim() }],
      }));
      pushToast('success', 'FAQ Ditambahkan');
    },
    [pushToast]
  );

  const deleteFaq = useCallback(
    (id: string) => {
      setData((prev) => ({ ...prev, faqs: prev.faqs.filter((f) => f.id !== id) }));
      pushToast('info', 'FAQ Dihapus');
    },
    [pushToast]
  );

  const addDocument = useCallback(
    (doc: Omit<DocumentDownloadItem, 'id'>) => {
      setData((prev) => ({
        ...prev,
        documents: [...prev.documents, { ...doc, id: `dok_${Date.now()}` }],
      }));
      pushToast('success', 'Dokumen Unduhan Ditambahkan');
    },
    [pushToast]
  );

  const deleteDocument = useCallback(
    (id: string) => {
      setData((prev) => ({ ...prev, documents: prev.documents.filter((d) => d.id !== id) }));
      pushToast('info', 'Dokumen Dihapus');
    },
    [pushToast]
  );

  const addGalleryItem = useCallback(
    (item: Omit<GalleryItem, 'id'>) => {
      setData((prev) => ({
        ...prev,
        gallery: [{ ...item, id: `gal_${Date.now()}` }, ...prev.gallery],
      }));
      pushToast('success', 'Kegiatan Galeri Ditambahkan');
    },
    [pushToast]
  );

  const deleteGalleryItem = useCallback(
    (id: string) => {
      setData((prev) => ({ ...prev, gallery: prev.gallery.filter((g) => g.id !== id) }));
      pushToast('info', 'Item Galeri Dihapus');
    },
    [pushToast]
  );

  const submitKritikSaran = useCallback(
    (nama: string, kua: string, pesan: string) => {
      setData((prev) => ({
        ...prev,
        kritikSaran: [
          {
            id: `ks_${Date.now()}`,
            nama: nama.trim(),
            kua,
            pesan: pesan.trim(),
            createdAt: new Date().toISOString(),
          },
          ...prev.kritikSaran,
        ],
      }));
      pushToast('success', 'Terima Kasih atas Masukan Anda', 'Kritik & saran telah diterima oleh Kemenag Jepara.');
    },
    [pushToast]
  );

  const replyKritikSaran = useCallback(
    (id: string, balasan: string) => {
      setData((prev) => ({
        ...prev,
        kritikSaran: prev.kritikSaran.map((k) =>
          k.id === id ? { ...k, balasanAdmin: balasan.trim() } : k
        ),
      }));
      pushToast('success', 'Tanggapan Kritik & Saran Tersimpan');
    },
    [pushToast]
  );

  const importBackupJson = useCallback(
    (jsonText: string) => {
      const check = validateBackupSnapshot<BimwinStoreSnapshot>(jsonText);
      if (!check.ok) {
        return { ok: false, error: check.error };
      }
      const parsed = normalizeStoreSnapshot(check.snapshot);
      setData(
        appendAudit(
          parsed,
          currentUser?.nama || 'SuperAdmin',
          currentUser?.role || 'SuperAdmin',
          `Memulihkan cadangan database JSON (${parsed.users.length} akun)`
        )
      );
      // Guard against SuperAdmin lockout if restored snapshot has a different SuperAdmin ID
      if (currentUser && !parsed.users.some((u) => u.id === currentUser.id)) {
        const restoredSuper = parsed.users.find((u) => u.role === 'SuperAdmin');
        if (restoredSuper) setSessionUserId(restoredSuper.id);
      }
      pushToast('success', 'Cadangan Database Dipulihkan', `${parsed.users.length} akun berhasil dimuat.`);
      return { ok: true };
    },
    [appendAudit, currentUser, pushToast]
  );

  const resetDemoDatabase = useCallback(() => {
    const fresh = createInitialSeedData();
    setData(fresh);
    setSessionUserId(null);
    pushToast('info', 'Data Demo Direset', 'Seluruh data kembali ke kondisi awal yang bersih.');
  }, [pushToast]);

  const value: BimwinContextValue = {
    data,
    currentUser,
    darkMode,
    toggleDarkMode,
    toasts,
    pushToast,
    dismissToast,
    confirmDialog,
    requestConfirm,
    closeConfirm,
    login,
    logout,
    registerPeserta,
    resetPasswordRequest,
    updateOwnCredentials,
    syncPartnerByUsername,
    createAndLinkPartner,
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
    verifyPesertaByFasilitator,
    batchVerifyMoocGraduates,
    verifyAttendanceByCode,
    createClassSchedule,
    deleteClassSchedule,
    verifyClassAttendee,
    replyConsultation,
    sendReminderNotification,
    logSmartReminder,
    saveMobileNotifPolicy,
    toggleParticipantMobileNotif,
    registerPesertaApkDevice,
    sendMobilePushReminder,
    updatePesertaByAdmin,
    deleteUserByAdmin,
    saveStaffAccount,
    updateModuleCurriculum,
    updateAssessmentQuiz,
    updateCompatibilityQuiz,
    updateSystemSettings,
    updateKuaDirectoryEntry,
    resetKuaDirectoryEntry,
    addFaq,
    deleteFaq,
    addDocument,
    deleteDocument,
    addGalleryItem,
    deleteGalleryItem,
    submitKritikSaran,
    replyKritikSaran,
    importBackupJson,
    resetDemoDatabase,
  };

  return <BimwinContext.Provider value={value}>{children}</BimwinContext.Provider>;
};

export function useBimwin() {
  const ctx = useContext(BimwinContext);
  if (!ctx) throw new Error('useBimwin must be used inside BimwinProvider');
  return ctx;
}
