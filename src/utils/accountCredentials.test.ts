import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeAccountUsername,
  validateCredentialChange,
} from './accountCredentials';

test('normalizeAccountUsername trims whitespace and lowercases cleanly', () => {
  assert.equal(normalizeAccountUsername('  Admin_Jepara  '), 'admin_jepara');
  assert.equal(normalizeAccountUsername('Fasil 01'), 'fasil01');
});

test('validateCredentialChange rejects wrong current password', () => {
  const res = validateCredentialChange({
    currentUsername: 'admin',
    currentPasswordStored: 'admin2026',
    currentPasswordInput: 'salah123',
    newUsername: 'admin_baru',
    newPassword: '',
    confirmPassword: '',
    existingUsernames: ['admin', 'admin_jepara'],
  });
  assert.equal(res.ok, false);
  assert.match(res.error || '', /tidak sesuai/i);
});

test('validateCredentialChange rejects duplicate username from another account', () => {
  const res = validateCredentialChange({
    currentUsername: 'admin_jepara',
    currentPasswordStored: 'kua2026',
    currentPasswordInput: 'kua2026',
    newUsername: 'admin',
    newPassword: '',
    confirmPassword: '',
    existingUsernames: ['admin', 'admin_jepara', 'fasilitator_jepara'],
  });
  assert.equal(res.ok, false);
  assert.match(res.error || '', /sudah digunakan/i);
});

test('validateCredentialChange allows changing username only, password only, or both', () => {
  const usernameOnly = validateCredentialChange({
    currentUsername: 'fasilitator_jepara',
    currentPasswordStored: 'fasilitator2026',
    currentPasswordInput: 'fasilitator2026',
    newUsername: 'fasil.jepara01',
    newPassword: '',
    confirmPassword: '',
    existingUsernames: ['admin', 'fasilitator_jepara'],
  });
  assert.equal(usernameOnly.ok, true);
  assert.equal(usernameOnly.usernameChanged, true);
  assert.equal(usernameOnly.passwordChanged, false);
  assert.equal(usernameOnly.normalizedUsername, 'fasil.jepara01');

  const passwordOnly = validateCredentialChange({
    currentUsername: 'admin',
    currentPasswordStored: 'admin2026',
    currentPasswordInput: 'admin2026',
    newUsername: 'admin',
    newPassword: 'supersecure2026',
    confirmPassword: 'supersecure2026',
    existingUsernames: ['admin'],
  });
  assert.equal(passwordOnly.ok, true);
  assert.equal(passwordOnly.usernameChanged, false);
  assert.equal(passwordOnly.passwordChanged, true);

  const both = validateCredentialChange({
    currentUsername: 'admin_jepara',
    currentPasswordStored: 'kua2026',
    currentPasswordInput: 'kua2026',
    newUsername: 'admin_kua_jepara',
    newPassword: 'kuabaru2026',
    confirmPassword: 'kuabaru2026',
    existingUsernames: ['admin', 'admin_jepara'],
  });
  assert.equal(both.ok, true);
  assert.equal(both.usernameChanged, true);
  assert.equal(both.passwordChanged, true);
});

test('validateCredentialChange rejects mismatched confirm password or short password', () => {
  const shortRes = validateCredentialChange({
    currentUsername: 'admin',
    currentPasswordStored: 'admin2026',
    currentPasswordInput: 'admin2026',
    newUsername: 'admin',
    newPassword: '123',
    confirmPassword: '123',
    existingUsernames: ['admin'],
  });
  assert.equal(shortRes.ok, false);
  assert.match(shortRes.error || '', /minimal 6 karakter/i);

  const mismatchRes = validateCredentialChange({
    currentUsername: 'admin',
    currentPasswordStored: 'admin2026',
    currentPasswordInput: 'admin2026',
    newUsername: 'admin',
    newPassword: 'password1',
    confirmPassword: 'password2',
    existingUsernames: ['admin'],
  });
  assert.equal(mismatchRes.ok, false);
  assert.match(mismatchRes.error || '', /tidak cocok/i);
});
