import { BimwinUser, MobileNotifPolicy } from '../types/bimwin';
import { evaluatePesertaStep, formatIndonesianDate, normalizeVillageName } from './bimwinLogic';

export type SmartReminderFilter =
  | 'semua'
  | 'perlu_tindak_lanjut'
  | 'belum_sinkron'
  | 'belum_pretest'
  | 'modul_berjalan'
  | 'belum_postest'
  | 'belum_ikm'
  | 'belum_verifikasi'
  | 'akad_dekat'
  | 'sudah_lulus';

export type ReminderUrgency = 'tinggi' | 'sedang' | 'normal';

export interface ParticipantReminderProfile {
  category: Exclude<SmartReminderFilter, 'semua' | 'perlu_tindak_lanjut' | 'akad_dekat'>;
  categoryLabel: string;
  urgency: ReminderUrgency;
  daysToAkad: number | null;
  isAkadNear: boolean;
  progressPercent: number;
  pendingSummary: string;
  defaultSubject: string;
  defaultMessage: string;
  normalizedWa: string;
  hasValidWa: boolean;
  hasValidEmail: boolean;
}

/**
 * Normalizes Indonesian phone/WhatsApp numbers into E.164 digits (62xxxxxxxxxx) for wa.me links.
 */
export function normalizeWhatsAppNumber(rawPhone?: string): string {
  const digits = String(rawPhone || '').replace(/\D/g, '');
  if (!digits || digits.length < 8) return '';
  if (digits.startsWith('62')) return digits;
  if (digits.startsWith('0')) return `62${digits.slice(1)}`;
  if (digits.startsWith('8')) return `62${digits}`;
  return digits;
}

export function isValidEmailAddress(rawEmail?: string): boolean {
  const trimmed = String(rawEmail || '').trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

export function computeDaysUntilAkad(
  tanggalRencanaNikah?: string,
  now: Date = new Date()
): number | null {
  if (!tanggalRencanaNikah) return null;
  const target = new Date(`${tanggalRencanaNikah}T00:00:00`);
  if (Number.isNaN(target.getTime())) return null;
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function classifyParticipantReminder(
  user: BimwinUser,
  totalModules: number = 5,
  now: Date = new Date()
): ParticipantReminderProfile {
  const evalStep = evaluatePesertaStep(user, totalModules);
  const daysToAkad = computeDaysUntilAkad(user.tanggalRencanaNikah, now);
  const isAkadNear = daysToAkad !== null && daysToAkad >= 0 && daysToAkad <= 14;
  const normalizedWa = normalizeWhatsAppNumber(user.noHp);
  const hasValidWa = normalizedWa.length >= 10;
  const hasValidEmail = isValidEmailAddress(user.email);

  const desa = normalizeVillageName(user.desaTempatNikah, user.kua);
  const akadLabel = user.tanggalRencanaNikah
    ? formatIndonesianDate(`${user.tanggalRencanaNikah}T00:00:00`)
    : 'belum dijadwalkan';
  const akadNote =
    daysToAkad !== null && daysToAkad >= 0
      ? ` (H-${daysToAkad} menuju akad ${akadLabel})`
      : '';

  let category: ParticipantReminderProfile['category'] = 'sudah_lulus';
  let categoryLabel = 'Lulus & Bersertifikat';
  let pendingSummary = 'Seluruh rangkaian BIMWIN tuntas dan terverifikasi.';
  let actionInstruction =
    'Sertifikat BIMWIN dan 4 dokumen resmi Anda telah aktif. Silakan unduh melalui menu Selesai & Dokumen untuk kelengkapan berkas SIMKAH KUA.';
  let urgency: ReminderUrgency = 'normal';

  const hasPartner = Boolean(user.pasanganUsername);
  const pretestDone = Boolean(user.progress?.pretestDone);
  const modulesCompleted = user.progress?.modulesCompleted?.length || 0;
  const postestDone = Boolean(user.progress?.postestDone);
  const ikmDone = Boolean(user.progress?.ikmDone);
  const verified = Boolean(user.progress?.verifikasiFasilitator);

  if (!hasPartner) {
    category = 'belum_sinkron';
    categoryLabel = 'Belum Sinkron Pasangan';
    pendingSummary = 'Langkah 1: Akun pasangan belum tersinkronisasi.';
    actionInstruction =
      'Mohon segera menyinkronkan akun pasangan Anda di Langkah 1 Ruang Belajar (pastikan KUA, Desa Tempat Nikah, dan Rencana Tanggal Akad sama) agar Pretest terbuka.';
    urgency = isAkadNear ? 'tinggi' : 'sedang';
  } else if (!pretestDone) {
    category = 'belum_pretest';
    categoryLabel = 'Belum Pretest';
    pendingSummary = 'Langkah 2: Pretest (5 Soal) belum dikerjakan.';
    actionInstruction =
      'Akun pasangan Anda sudah tersinkron. Silakan segera mengerjakan Pretest (Langkah 2) di Portal SAMAWA untuk membuka 5 Modul Bimbingan Perkawinan.';
    urgency = isAkadNear ? 'tinggi' : 'sedang';
  } else if (modulesCompleted < totalModules) {
    category = 'modul_berjalan';
    categoryLabel = `Modul ${modulesCompleted}/${totalModules}`;
    pendingSummary = `Langkah 3: Baru menuntaskan ${modulesCompleted} dari ${totalModules} modul.`;
    actionInstruction = `Anda telah menuntaskan ${modulesCompleted} dari ${totalModules} modul. Mohon segera menyelesaikan sisa modul beserta video & kuisnya (minimal skor 80%) agar dapat melanjutkan ke Postest.`;
    urgency = isAkadNear ? 'tinggi' : 'sedang';
  } else if (!postestDone) {
    category = 'belum_postest';
    categoryLabel = 'Belum Postest';
    pendingSummary = 'Langkah 4: 5 Modul tuntas, menunggu Postest.';
    actionInstruction =
      'Selamat, 5 Modul telah Anda tuntaskan! Segera kerjakan Postest (Langkah 4) untuk menuntaskan tahap pembelajaran MOOC.';
    urgency = isAkadNear ? 'tinggi' : 'sedang';
  } else if (!ikmDone) {
    category = 'belum_ikm';
    categoryLabel = 'Belum Survei IKM';
    pendingSummary = 'Langkah 6: MOOC tuntas, wajib mengisi Survei IKM.';
    actionInstruction =
      'Pembelajaran MOOC Anda sudah 100% tuntas. Silakan segera mengisi Survei Kepuasan Masyarakat (IKM) agar menu pemilihan Kelas Online/Offline terbuka.';
    urgency = isAkadNear ? 'tinggi' : 'sedang';
  } else if (!verified) {
    category = 'belum_verifikasi';
    categoryLabel = 'Menunggu Kelas / Verifikasi';
    pendingSummary = `Langkah 7: Kehadiran (${user.progress?.kehadiranKelas || 'Belum Hadir'}) menunggu pengesahan Fasilitator.`;
    actionInstruction =
      'MOOC dan Survei IKM Anda telah selesai. Mohon segera memilih jadwal Kelas Online atau Offline di menu Kelas dan mengikuti sesi pendampingan agar Fasilitator KUA dapat menerbitkan Sertifikat BIMWIN.';
    urgency = isAkadNear ? 'tinggi' : 'normal';
  }

  const defaultSubject = `[SAMAWA ${user.kua}] Pengingat BIMWIN — ${categoryLabel} (${user.nama})`;
  const defaultMessage = [
    `Assalamu'alaikum Wr. Wb. Yth. Sdr/i ${user.nama},`,
    '',
    `Kami dari layanan SAMAWA Bimbingan Perkawinan ${user.kua} (Desa ${desa}) mengingatkan progres belajar BIMWIN Anda saat ini: ${evalStep.progressPercent}% — ${categoryLabel}${akadNote}.`,
    '',
    actionInstruction,
    '',
    `Silakan masuk ke Portal SAMAWA dengan username @${user.username}. Terima kasih.`,
    `Wassalamu'alaikum Wr. Wb.`,
    `Tim Bimbingan Perkawinan ${user.kua} · Kemenag Kab. Jepara`,
  ].join('\n');

  return {
    category,
    categoryLabel,
    urgency,
    daysToAkad,
    isAkadNear,
    progressPercent: evalStep.progressPercent,
    pendingSummary,
    defaultSubject,
    defaultMessage,
    normalizedWa,
    hasValidWa,
    hasValidEmail,
  };
}

export function renderReminderTemplate(
  template: string,
  user: BimwinUser,
  profile: ParticipantReminderProfile
): string {
  const akadLabel = user.tanggalRencanaNikah
    ? formatIndonesianDate(`${user.tanggalRencanaNikah}T00:00:00`)
    : 'belum diisi';
  return template
    .replace(/\{nama\}/gi, user.nama)
    .replace(/\{username\}/gi, user.username)
    .replace(/\{kua\}/gi, user.kua)
    .replace(/\{desa\}/gi, normalizeVillageName(user.desaTempatNikah, user.kua))
    .replace(/\{tahap\}/gi, profile.categoryLabel)
    .replace(/\{progres\}/gi, `${profile.progressPercent}%`)
    .replace(/\{tanggal_akad\}/gi, akadLabel);
}

export function buildWhatsAppReminderUrl(rawPhone: string, message: string): string {
  const wa = normalizeWhatsAppNumber(rawPhone);
  if (!wa) return '';
  return `https://wa.me/${wa}?text=${encodeURIComponent(message)}`;
}

export function buildEmailReminderUrl(email: string, subject: string, body: string): string {
  const trimmed = email.trim();
  if (!isValidEmailAddress(trimmed)) return '';
  return `mailto:${encodeURIComponent(trimmed)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function buildBatchEmailBccUrl(
  emails: string[],
  subject: string,
  body: string
): string {
  const validUnique = Array.from(
    new Set(emails.map((e) => e.trim()).filter((e) => isValidEmailAddress(e)))
  );
  if (validUnique.length === 0) return '';
  return `mailto:?bcc=${encodeURIComponent(validUnique.join(','))}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function createDefaultMobileNotifPolicy(scopeKey: string): MobileNotifPolicy {
  const scopeLabel = scopeKey === 'ALL' ? 'Kemenag Kab. Jepara' : scopeKey;
  return {
    scopeKey,
    enabled: true,
    frequency: 'otomatis_tahap',
    scheduleTime: '08:00',
    quietHoursStart: '21:00',
    quietHoursEnd: '06:00',
    soundAndVibrate: true,
    triggers: {
      belumSinkron: true,
      moocTertunda: true,
      surveiIkm: true,
      jadwalKelas: true,
      akadMendekat: true,
      sertifikatTerbit: true,
    },
    customTitleTemplate: `Pengingat SAMAWA ${scopeLabel} — {tahap}`,
    customBodyTemplate:
      'Halo {nama}, progres BIMWIN Anda di {kua} saat ini {progres} ({tahap}). Rencana akad: {tanggal_akad}. Buka aplikasi SAMAWA untuk melanjutkan.',
  };
}

export function resolveMobileNotifPolicy(
  policies: Record<string, MobileNotifPolicy> | undefined,
  scopeKey: string
): MobileNotifPolicy {
  if (policies?.[scopeKey]) {
    return policies[scopeKey];
  }
  if (scopeKey !== 'ALL' && policies?.ALL) {
    return {
      ...policies.ALL,
      scopeKey,
    };
  }
  return createDefaultMobileNotifPolicy(scopeKey);
}

/**
 * Enforces strict RBAC for mobile APK notification settings:
 * - SuperAdmin (Admin Kemenag) can configure 'ALL' and any KUA kecamatan.
 * - AdminKUA & Fasilitator can ONLY configure their own kecamatan (actor.kua).
 */
export function canManageMobileNotifScope(
  actor: Pick<BimwinUser, 'role' | 'kua'> | null | undefined,
  scopeKey: string
): boolean {
  if (!actor) return false;
  if (actor.role === 'SuperAdmin') return true;
  if (actor.role === 'AdminKUA' || actor.role === 'Fasilitator') {
    return Boolean(scopeKey && scopeKey !== 'ALL' && scopeKey === actor.kua);
  }
  return false;
}

/**
 * Filters participants eligible for mobile APK push notifications within a given KUA scope.
 */
export function filterApkNotifRecipients(
  users: BimwinUser[],
  scopeKua: string,
  options: { onlyPushEnabled?: boolean } = {}
): BimwinUser[] {
  const { onlyPushEnabled = false } = options;
  return users.filter((u) => {
    if (u.role !== 'Peserta') return false;
    if (scopeKua !== 'ALL' && u.kua !== scopeKua) return false;
    if (!u.appNotification?.apkInstalled) return false;
    if (onlyPushEnabled && (!u.appNotification.pushEnabled || u.appNotification.mutedByOfficer)) {
      return false;
    }
    return true;
  });
}

function parseMinutesOfDay(hhmm: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h < 0 || h > 23 || min < 0 || min > 59) return null;
  return h * 60 + min;
}

/**
 * Returns true when timeHHMM falls inside the configured quiet hours window (supports overnight ranges like 21:00 -> 06:00).
 */
export function isWithinQuietHours(
  timeHHMM: string,
  quietStart: string,
  quietEnd: string
): boolean {
  const current = parseMinutesOfDay(timeHHMM);
  const start = parseMinutesOfDay(quietStart);
  const end = parseMinutesOfDay(quietEnd);
  if (current === null || start === null || end === null || start === end) return false;
  if (start < end) {
    return current >= start && current < end;
  }
  // Overnight span (e.g., 21:00 to 06:00)
  return current >= start || current < end;
}

export function renderMobilePushPreview(
  policy: MobileNotifPolicy,
  user: BimwinUser,
  profile: ParticipantReminderProfile
): { title: string; body: string } {
  const titleSource = policy.customTitleTemplate.trim() || profile.defaultSubject;
  const bodySource = policy.customBodyTemplate.trim() || profile.pendingSummary;
  return {
    title: renderReminderTemplate(titleSource, user, profile),
    body: renderReminderTemplate(bodySource, user, profile),
  };
}

/**
 * Dispatches a real native browser / PWA Service Worker notification on the device when permitted.
 */
export async function dispatchBrowserPushNotification(
  title: string,
  body: string,
  tag: string = 'samawa-bimwin-push'
): Promise<'sent' | 'denied' | 'unsupported'> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  if (window.Notification.permission !== 'granted') {
    return 'denied';
  }
  try {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg && typeof reg.showNotification === 'function') {
        await reg.showNotification(title, {
          body,
          icon: '/pwa-192x192.png',
          badge: '/pwa-192x192.png',
          tag,
        });
        return 'sent';
      }
    }
    new window.Notification(title, {
      body,
      icon: '/pwa-192x192.png',
      tag,
    });
    return 'sent';
  } catch {
    return 'unsupported';
  }
}

