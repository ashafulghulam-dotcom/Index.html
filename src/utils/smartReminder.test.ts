import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { BimwinUser } from '../types/bimwin.ts';
import {
  buildBatchEmailBccUrl,
  buildEmailReminderUrl,
  buildWhatsAppReminderUrl,
  canManageMobileNotifScope,
  classifyParticipantReminder,
  computeDaysUntilAkad,
  createDefaultMobileNotifPolicy,
  filterApkNotifRecipients,
  isValidEmailAddress,
  isWithinQuietHours,
  normalizeWhatsAppNumber,
  renderMobilePushPreview,
  renderReminderTemplate,
  resolveMobileNotifPolicy,
} from './smartReminder.ts';

function makeUser(overrides: Partial<BimwinUser> = {}): BimwinUser {
  return {
    id: 'u_rem_1',
    username: 'rizky_tahunan',
    password: 'secret',
    role: 'Peserta',
    nama: 'Rizky Pratama',
    nik: '3320091408990001',
    noHp: '0812-3456-7890',
    email: 'rizky.pratama@example.id',
    kua: 'KUA Tahunan',
    desaTempatNikah: 'Tahunan',
    tanggalRencanaNikah: '2026-04-10',
    createdAt: '2026-03-01T08:00:00.000Z',
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
    ...overrides,
  };
}

describe('Smart Reminder WA & Email Pure Logic', () => {
  it('normalizes Indonesian phone numbers to E.164 62xxx format and rejects invalid numbers', () => {
    assert.equal(normalizeWhatsAppNumber('0812-3456-7890'), '6281234567890');
    assert.equal(normalizeWhatsAppNumber('+62 856 0011 2233'), '6285600112233');
    assert.equal(normalizeWhatsAppNumber('81399887766'), '6281399887766');
    assert.equal(normalizeWhatsAppNumber('1234'), '');
    assert.equal(normalizeWhatsAppNumber(''), '');
  });

  it('validates email addresses accurately', () => {
    assert.equal(isValidEmailAddress('catin@kemenag.go.id'), true);
    assert.equal(isValidEmailAddress('  user.name+1@gmail.com '), true);
    assert.equal(isValidEmailAddress('bukan-email'), false);
    assert.equal(isValidEmailAddress(''), false);
  });

  it('computes days until akad and flags urgency when akad is within 14 days', () => {
    const now = new Date('2026-04-01T10:00:00Z');
    assert.equal(computeDaysUntilAkad('2026-04-10', now), 9);

    const urgentProfile = classifyParticipantReminder(makeUser(), 5, now);
    assert.equal(urgentProfile.category, 'belum_sinkron');
    assert.equal(urgentProfile.isAkadNear, true);
    assert.equal(urgentProfile.urgency, 'tinggi');
    assert.equal(urgentProfile.hasValidWa, true);
    assert.equal(urgentProfile.hasValidEmail, true);
  });

  it('classifies participants across MOOC stages and graduated state', () => {
    const now = new Date('2026-03-01T00:00:00Z');
    const ikmPending = makeUser({
      pasanganUsername: 'nadia_tahunan',
      pasanganNama: 'Nadia Putri',
      tanggalRencanaNikah: '2026-07-01',
      progress: {
        pretestDone: true,
        pretestScore: 70,
        postestDone: true,
        postestScore: 100,
        videosWatched: [1, 2, 3, 4, 5],
        modulesRead: [1, 2, 3, 4, 5],
        modulesCompleted: [1, 2, 3, 4, 5],
        moduleScores: { 1: 100, 2: 100, 3: 100, 4: 100, 5: 100 },
        selesaiClicked: true,
        ikmDone: false,
        verifikasiFasilitator: false,
        kehadiranKelas: 'Belum Hadir',
      },
    });
    const ikmProf = classifyParticipantReminder(ikmPending, 5, now);
    assert.equal(ikmProf.category, 'belum_ikm');
    assert.match(ikmProf.defaultMessage, /Survei Kepuasan Masyarakat/i);

    const graduated = makeUser({
      ...ikmPending,
      progress: {
        ...ikmPending.progress!,
        ikmDone: true,
        verifikasiFasilitator: true,
      },
    });
    const gradProf = classifyParticipantReminder(graduated, 5, now);
    assert.equal(gradProf.category, 'sudah_lulus');
    assert.equal(gradProf.progressPercent, 100);
  });

  it('renders template placeholders and constructs valid WA, Email, and Batch BCC URLs', () => {
    const user = makeUser();
    const prof = classifyParticipantReminder(user, 5, new Date('2026-04-01T00:00:00Z'));
    const rendered = renderReminderTemplate(
      'Halo {nama} (@{username}) dari {kua} Desa {desa}: {tahap} ({progres})',
      user,
      prof
    );
    assert.equal(
      rendered,
      'Halo Rizky Pratama (@rizky_tahunan) dari KUA Tahunan Desa Tahunan: Belum Sinkron Pasangan (0%)'
    );

    const waUrl = buildWhatsAppReminderUrl(user.noHp || '', rendered);
    assert.ok(waUrl.startsWith('https://wa.me/6281234567890?text='));

    const mailUrl = buildEmailReminderUrl(user.email || '', 'Pengingat BIMWIN', rendered);
    assert.ok(mailUrl.startsWith('mailto:rizky.pratama%40example.id?subject='));

    const bccUrl = buildBatchEmailBccUrl(
      ['a@example.id', 'b@example.id', 'a@example.id', 'invalid'],
      'Broadcast',
      'Halo'
    );
    assert.ok(bccUrl.startsWith('mailto:?bcc=a%40example.id%2Cb%40example.id&subject='));
  });

  it('enforces RBAC scopes for mobile APK notification management (Admin Kemenag vs KUA/Fasilitator)', () => {
    const superAdmin = { role: 'SuperAdmin' as const, kua: 'Kemenag Kab. Jepara' };
    const adminJepara = { role: 'AdminKUA' as const, kua: 'KUA Jepara' };
    const fasTahunan = { role: 'Fasilitator' as const, kua: 'KUA Tahunan' };
    const peserta = { role: 'Peserta' as const, kua: 'KUA Jepara' };

    // SuperAdmin (Admin Kemenag) can manage ALL and any KUA
    assert.equal(canManageMobileNotifScope(superAdmin, 'ALL'), true);
    assert.equal(canManageMobileNotifScope(superAdmin, 'KUA Jepara'), true);
    assert.equal(canManageMobileNotifScope(superAdmin, 'KUA Tahunan'), true);

    // Admin KUA & Fasilitator can ONLY manage their own kecamatan
    assert.equal(canManageMobileNotifScope(adminJepara, 'KUA Jepara'), true);
    assert.equal(canManageMobileNotifScope(adminJepara, 'ALL'), false);
    assert.equal(canManageMobileNotifScope(adminJepara, 'KUA Tahunan'), false);

    assert.equal(canManageMobileNotifScope(fasTahunan, 'KUA Tahunan'), true);
    assert.equal(canManageMobileNotifScope(fasTahunan, 'ALL'), false);
    assert.equal(canManageMobileNotifScope(fasTahunan, 'KUA Jepara'), false);

    // Peserta cannot manage KUA/system policy
    assert.equal(canManageMobileNotifScope(peserta, 'KUA Jepara'), false);
    assert.equal(canManageMobileNotifScope(null, 'ALL'), false);
  });

  it('filters APK-installed recipients by KUA scope and active push status, resolves policies, quiet hours, and push preview', () => {
    const users: BimwinUser[] = [
      makeUser({
        id: 'p1',
        username: 'catin_tahunan_aktif',
        kua: 'KUA Tahunan',
        appNotification: { apkInstalled: true, devicePlatform: 'Android', pushEnabled: true },
      }),
      makeUser({
        id: 'p2',
        username: 'catin_tahunan_jeda',
        kua: 'KUA Tahunan',
        appNotification: {
          apkInstalled: true,
          devicePlatform: 'iOS',
          pushEnabled: false,
          mutedByOfficer: true,
        },
      }),
      makeUser({
        id: 'p3',
        username: 'catin_tahunan_noapk',
        kua: 'KUA Tahunan',
        appNotification: { apkInstalled: false, pushEnabled: false },
      }),
      makeUser({
        id: 'p4',
        username: 'catin_jepara_aktif',
        kua: 'KUA Jepara',
        appNotification: { apkInstalled: true, devicePlatform: 'Android', pushEnabled: true },
      }),
    ];

    // ALL scope (Kemenag) sees all 3 APK-installed users, 2 active
    assert.equal(filterApkNotifRecipients(users, 'ALL').length, 3);
    assert.equal(filterApkNotifRecipients(users, 'ALL', { onlyPushEnabled: true }).length, 2);

    // Kecamatan scope (KUA Tahunan) sees ONLY KUA Tahunan APK users (2 installed, 1 active)
    const tahunanInstalled = filterApkNotifRecipients(users, 'KUA Tahunan');
    assert.deepEqual(
      tahunanInstalled.map((u) => u.id),
      ['p1', 'p2']
    );
    const tahunanActive = filterApkNotifRecipients(users, 'KUA Tahunan', { onlyPushEnabled: true });
    assert.deepEqual(
      tahunanActive.map((u) => u.id),
      ['p1']
    );

    // Policy inheritance: KUA falls back to ALL policy when no KUA override exists
    const allPolicy = { ...createDefaultMobileNotifPolicy('ALL'), scheduleTime: '09:30' };
    const resolvedKua = resolveMobileNotifPolicy({ ALL: allPolicy }, 'KUA Tahunan');
    assert.equal(resolvedKua.scopeKey, 'KUA Tahunan');
    assert.equal(resolvedKua.scheduleTime, '09:30');

    // Quiet hours (overnight 21:00 -> 06:00)
    assert.equal(isWithinQuietHours('22:30', '21:00', '06:00'), true);
    assert.equal(isWithinQuietHours('05:15', '21:00', '06:00'), true);
    assert.equal(isWithinQuietHours('08:00', '21:00', '06:00'), false);

    // Live push preview renders personalized template variables
    const profile = classifyParticipantReminder(users[0], 5, new Date('2026-04-01T00:00:00Z'));
    const preview = renderMobilePushPreview(resolvedKua, users[0], profile);
    assert.ok(preview.title.includes(profile.categoryLabel));
    assert.ok(preview.body.includes(users[0].nama));
    assert.ok(preview.body.includes(users[0].kua));
  });
});

