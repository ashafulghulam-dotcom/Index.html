import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { BimwinUser } from '../types/bimwin.ts';
import {
  buildBatchEmailBccUrl,
  buildEmailReminderUrl,
  buildWhatsAppReminderUrl,
  classifyParticipantReminder,
  computeDaysUntilAkad,
  isValidEmailAddress,
  normalizeWhatsAppNumber,
  renderReminderTemplate,
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
});
