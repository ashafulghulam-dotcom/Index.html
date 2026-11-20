export interface CredentialChangeInput {
  currentUsername: string;
  currentPasswordStored: string;
  currentPasswordInput: string;
  newUsername: string;
  newPassword?: string;
  confirmPassword?: string;
  existingUsernames: string[];
}

export interface CredentialChangeValidationResult {
  ok: boolean;
  error?: string;
  normalizedUsername?: string;
  passwordChanged?: boolean;
  usernameChanged?: boolean;
}

const USERNAME_PATTERN = /^[a-z0-9._-]{4,32}$/;

export function normalizeAccountUsername(raw: string): string {
  return (raw || '').trim().toLowerCase().replace(/\s+/g, '');
}

export function validateCredentialChange(
  input: CredentialChangeInput
): CredentialChangeValidationResult {
  const currentNorm = normalizeAccountUsername(input.currentUsername);
  const nextUsername = normalizeAccountUsername(input.newUsername);
  const nextPassword = input.newPassword ?? '';
  const confirmPassword = input.confirmPassword ?? '';

  if (!input.currentPasswordInput) {
    return {
      ok: false,
      error: 'Masukkan kata sandi saat ini untuk memverifikasi identitas akun Anda.',
    };
  }

  if (input.currentPasswordInput !== input.currentPasswordStored) {
    return {
      ok: false,
      error: 'Kata sandi saat ini tidak sesuai.',
    };
  }

  if (!nextUsername || nextUsername.length < 4) {
    return {
      ok: false,
      error: 'Username minimal 4 karakter tanpa spasi.',
    };
  }

  if (!USERNAME_PATTERN.test(nextUsername)) {
    return {
      ok: false,
      error:
        'Username hanya boleh menggunakan huruf kecil, angka, titik (.), garis bawah (_), atau tanda hubung (-), maksimal 32 karakter.',
    };
  }

  const usernameChanged = nextUsername !== currentNorm;
  if (usernameChanged) {
    const taken = input.existingUsernames.some(
      (u) => normalizeAccountUsername(u) === nextUsername
    );
    if (taken) {
      return {
        ok: false,
        error: `Username "${nextUsername}" sudah digunakan oleh akun lain. Pilih username yang berbeda.`,
      };
    }
  }

  const passwordChanged = nextPassword.length > 0;
  if (!usernameChanged && !passwordChanged) {
    return {
      ok: false,
      error: 'Tidak ada perubahan username maupun kata sandi baru untuk disimpan.',
    };
  }

  if (passwordChanged) {
    if (nextPassword.length < 6) {
      return {
        ok: false,
        error: 'Kata sandi baru minimal 6 karakter.',
      };
    }
    if (nextPassword !== confirmPassword) {
      return {
        ok: false,
        error: 'Konfirmasi kata sandi baru tidak cocok.',
      };
    }
  }

  return {
    ok: true,
    normalizedUsername: nextUsername,
    usernameChanged,
    passwordChanged,
  };
}

export interface SnapshotLike {
  users: Array<{
    id: string;
    username: string;
    role: string;
    pasanganUsername?: string;
  }>;
  classes: Array<{
    createdBy: string;
    rsvps: Array<{ username: string }>;
  }>;
  consultations: Array<{
    pesertaUsername: string;
  }>;
  journals: Array<{
    pesertaUsername: string;
  }>;
  notifications: Array<{
    targetUsername?: string;
    readBy: string[];
  }>;
  modules: unknown[];
  settings?: {
    pejabat?: { nama?: string; jabatan?: string; nip?: string };
  };
}

/**
 * Cascades a username rename across all relational references in the store
 * (partner sync links, class RSVPs/creators, consultations, journals, notifications).
 */
export function cascadeUsernameReferences<T extends SnapshotLike>(
  snapshot: T,
  oldUsername: string,
  newUsername: string
): T {
  const prevNorm = normalizeAccountUsername(oldUsername);
  const nextNorm = normalizeAccountUsername(newUsername);
  if (!prevNorm || !nextNorm || prevNorm === nextNorm) return snapshot;

  const isSame = (val?: string) => Boolean(val && normalizeAccountUsername(val) === prevNorm);

  return {
    ...snapshot,
    users: snapshot.users.map((u) =>
      isSame(u.pasanganUsername) ? { ...u, pasanganUsername: nextNorm } : u
    ),
    classes: snapshot.classes.map((cls) => ({
      ...cls,
      createdBy: isSame(cls.createdBy) ? nextNorm : cls.createdBy,
      rsvps: cls.rsvps.map((r) => (isSame(r.username) ? { ...r, username: nextNorm } : r)),
    })),
    consultations: snapshot.consultations.map((c) =>
      isSame(c.pesertaUsername) ? { ...c, pesertaUsername: nextNorm } : c
    ),
    journals: snapshot.journals.map((j) =>
      isSame(j.pesertaUsername) ? { ...j, pesertaUsername: nextNorm } : j
    ),
    notifications: snapshot.notifications.map((n) => ({
      ...n,
      targetUsername: isSame(n.targetUsername) ? nextNorm : n.targetUsername,
      readBy: Array.isArray(n.readBy)
        ? n.readBy.map((reader) => (isSame(reader) ? nextNorm : reader))
        : [],
    })),
  };
}

const VALID_ROLES = new Set(['Peserta', 'Fasilitator', 'AdminKUA', 'SuperAdmin']);

export function validateBackupSnapshot<T extends SnapshotLike>(
  jsonText: string
): { ok: true; snapshot: T } | { ok: false; error: string } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    return { ok: false, error: 'File JSON rusak atau tidak dapat dibaca.' };
  }

  if (!parsed || typeof parsed !== 'object') {
    return { ok: false, error: 'Format file JSON tidak sesuai struktur cadangan SAMAWA.' };
  }

  const candidate = parsed as Partial<T>;
  const requiredArrays: Array<keyof SnapshotLike> = [
    'users',
    'modules',
    'classes',
    'consultations',
    'journals',
    'notifications',
  ];
  for (const key of requiredArrays) {
    if (!Array.isArray(candidate[key])) {
      return {
        ok: false,
        error: `Struktur cadangan tidak lengkap: daftar "${String(key)}" tidak ditemukan.`,
      };
    }
  }

  if (!candidate.settings || !candidate.settings.pejabat?.nama) {
    return {
      ok: false,
      error: 'Struktur pengaturan sistem & pejabat penandatangan tidak ditemukan dalam cadangan.',
    };
  }

  const users = candidate.users!;
  if (users.length === 0) {
    return { ok: false, error: 'File cadangan tidak memiliki data akun pengguna.' };
  }

  const invalidUser = users.find(
    (u) =>
      !u ||
      typeof u.id !== 'string' ||
      typeof u.username !== 'string' ||
      !u.username.trim() ||
      !VALID_ROLES.has(u.role)
  );
  if (invalidUser) {
    return {
      ok: false,
      error: 'Terdapat entri akun pengguna yang tidak valid atau perannya tidak dikenali.',
    };
  }

  const hasSuperAdmin = users.some((u) => u.role === 'SuperAdmin');
  if (!hasSuperAdmin) {
    return {
      ok: false,
      error: 'Pemulihan dibatalkan: cadangan wajib memiliki minimal 1 akun SuperAdmin aktif.',
    };
  }

  return { ok: true, snapshot: candidate as T };
}
