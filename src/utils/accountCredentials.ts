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
