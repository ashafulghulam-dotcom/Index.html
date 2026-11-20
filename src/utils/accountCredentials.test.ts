import test from 'node:test';
import assert from 'node:assert/strict';
import {
  cascadeUsernameReferences,
  normalizeAccountUsername,
  validateBackupSnapshot,
  validateCredentialChange,
} from './accountCredentials';
import { generateUniqueCertificateCode } from './bimwinLogic';
import { BimwinUser } from '../types/bimwin';

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

test('cascadeUsernameReferences updates partner link, RSVPs, consultations, journals, and notifications', () => {
  const snapshot = {
    users: [
      { id: 'u1', username: 'ahmad_baru', role: 'Peserta', pasanganUsername: 'siti_jepara' },
      { id: 'u2', username: 'siti_jepara', role: 'Peserta', pasanganUsername: 'ahmad_lama' },
    ],
    classes: [
      {
        createdBy: 'ahmad_lama',
        rsvps: [{ username: 'ahmad_lama' }, { username: 'siti_jepara' }],
      },
    ],
    consultations: [{ pesertaUsername: 'ahmad_lama' }],
    journals: [{ pesertaUsername: 'ahmad_lama' }],
    notifications: [
      { targetUsername: 'ahmad_lama', readBy: ['ahmad_lama', 'siti_jepara'] },
    ],
    modules: [],
    settings: { pejabat: { nama: 'Kepala' } },
  };

  const next = cascadeUsernameReferences(snapshot, 'ahmad_lama', 'ahmad_baru');
  assert.equal(next.users[1].pasanganUsername, 'ahmad_baru');
  assert.equal(next.classes[0].createdBy, 'ahmad_baru');
  assert.equal(next.classes[0].rsvps[0].username, 'ahmad_baru');
  assert.equal(next.classes[0].rsvps[1].username, 'siti_jepara');
  assert.equal(next.consultations[0].pesertaUsername, 'ahmad_baru');
  assert.equal(next.journals[0].pesertaUsername, 'ahmad_baru');
  assert.equal(next.notifications[0].targetUsername, 'ahmad_baru');
  assert.deepEqual(next.notifications[0].readBy, ['ahmad_baru', 'siti_jepara']);
});

test('validateBackupSnapshot rejects corrupted JSON, missing SuperAdmin, or invalid roles', () => {
  assert.equal(validateBackupSnapshot('{not-json').ok, false);
  assert.equal(validateBackupSnapshot('{}').ok, false);

  const noSuperAdmin = JSON.stringify({
    users: [{ id: 'u1', username: 'peserta1', role: 'Peserta' }],
    modules: [],
    classes: [],
    consultations: [],
    journals: [],
    notifications: [],
    settings: { pejabat: { nama: 'Kepala' } },
  });
  const resNoSuper = validateBackupSnapshot(noSuperAdmin);
  assert.equal(resNoSuper.ok, false);
  assert.match(resNoSuper.ok ? '' : resNoSuper.error, /SuperAdmin/i);

  const validJson = JSON.stringify({
    users: [{ id: 'u0', username: 'admin', role: 'SuperAdmin' }],
    modules: [],
    classes: [],
    consultations: [],
    journals: [],
    notifications: [],
    settings: { pejabat: { nama: 'Kepala' } },
  });
  assert.equal(validateBackupSnapshot(validJson).ok, true);
});

test('generateUniqueCertificateCode never collides even after deletions or in batch issuance', () => {
  const year = new Date().getFullYear();
  const makeUser = (id: string, kua: string, nomorSertifikat?: string): BimwinUser => ({
    id,
    username: `user_${id}`,
    password: 'secret',
    role: 'Peserta',
    nama: `Peserta ${id}`,
    kua,
    createdAt: '2026-04-01T00:00:00.000Z',
    progress: {
      pretestDone: true,
      pretestScore: 80,
      postestDone: true,
      postestScore: 100,
      videosWatched: [1, 2, 3, 4, 5],
      modulesRead: [1, 2, 3, 4, 5],
      modulesCompleted: [1, 2, 3, 4, 5],
      moduleScores: { 1: 100, 2: 100, 3: 100, 4: 100, 5: 100 },
      selesaiClicked: true,
      ikmDone: true,
      verifikasiFasilitator: true,
      kehadiranKelas: 'Hadir Kelas Offline',
      nomorSertifikat,
    },
  });

  // Imagine 0001 and 0002 were deleted, leaving only 0005! Count is 1, but next must be 0006.
  const existing = [makeUser('a', 'KUA Jepara', `JPR-JEP-${year}-0005`)];
  const first = generateUniqueCertificateCode('KUA Jepara', existing);
  assert.equal(first, `JPR-JEP-${year}-0006`);

  // Batch reservation should step cleanly to 0007 without collision
  const second = generateUniqueCertificateCode('KUA Jepara', existing, [first]);
  assert.equal(second, `JPR-JEP-${year}-0007`);
});
