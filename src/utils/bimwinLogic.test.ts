import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  buildPesertaCsv,
  calculateAgeFromDob,
  calculateBudgetAllocation,
  calculateCompatibilityScore,
  calculateFertilityWindow,
  calculateStuntingReadiness,
  canFasilitatorVerify,
  countUniqueSyncedCouples,
  evaluatePesertaStep,
  getSmartFaqReply,
  isUnderageMarriage,
  isValidNik,
  maskNik,
  normalizeVillageName,
  shuffleQuizQuestions,
  verifyDocumentQuery,
} from './bimwinLogic.ts';
import type { BimwinClassSchedule, BimwinUser } from '../types/bimwin.ts';

function makePeserta(overrides: Partial<BimwinUser> = {}): BimwinUser {
  return {
    id: 'u_test',
    username: 'peserta_test',
    password: 'secret',
    role: 'Peserta',
    nama: 'Ahmad Fauzi',
    nik: '3320061205980001',
    kua: 'KUA Jepara',
    desaTempatNikah: 'Kauman',
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

describe('BIMWIN Pure Domain Logic', () => {
  it('calculates age accurately and flags underage marriage (<19 UU No. 16/2019)', () => {
    const ref = new Date('2026-04-01T00:00:00Z');
    assert.equal(calculateAgeFromDob('2000-03-15', ref), 26);
    assert.equal(calculateAgeFromDob('2008-05-20', ref), 17);
    assert.equal(isUnderageMarriage(18), true);
    assert.equal(isUnderageMarriage(19), false);
    assert.equal(isUnderageMarriage(25), false);
  });

  it('validates and masks 16-digit NIK for privacy', () => {
    assert.equal(isValidNik('3320061205980001'), true);
    assert.equal(isValidNik('3320061205'), false);
    assert.equal(maskNik('3320061205980001'), '332006******0001');
  });

  it('normalizes legacy Jepara village names', () => {
    assert.equal(normalizeVillageName('Banjarsari', 'KUA Bangsri'), 'Banjaran');
    assert.equal(normalizeVillageName('sumberejo', 'KUA Donorojo'), 'Sumberrejo');
    assert.equal(normalizeVillageName('', 'KUA Jepara'), 'Belum Memilih Desa');
  });

  it('computes 50/20/10/10/10 budget allocation with exact sum and emergency fund range', () => {
    const res = calculateBudgetAllocation(6000000);
    assert.equal(res.pokok50, 3000000);
    assert.equal(res.tabungan20, 1200000);
    assert.equal(res.darurat10, 600000);
    assert.equal(res.sosialZakat10, 600000);
    assert.equal(res.hiburan10, 600000);
    assert.equal(
      res.pokok50 + res.tabungan20 + res.darurat10 + res.sosialZakat10 + res.hiburan10,
      6000000
    );
    assert.equal(res.targetDanaDaruratMin, 9000000);
    assert.equal(res.targetDanaDaruratMax, 18000000);
  });

  it('evaluates stunting readiness (IMT, LiLA >= 23.5, Hb >= 12)', () => {
    const ideal = calculateStuntingReadiness({ tinggiCm: 160, beratKg: 54, lilaCm: 25, hbGdL: 12.8 });
    assert.equal(ideal.status, 'Siap Hamil / Ideal');
    assert.equal(ideal.kekRisk, false);
    assert.equal(ideal.anemiaRisk, false);

    const risk = calculateStuntingReadiness({ tinggiCm: 158, beratKg: 42, lilaCm: 21.5, hbGdL: 10.8 });
    assert.equal(risk.status, 'Perlu Perhatian Gizi');
    assert.equal(risk.kekRisk, true);
    assert.equal(risk.anemiaRisk, true);
  });

  it('calculates fertility window and fiqih haid guidance', () => {
    const calc = calculateFertilityWindow('2026-03-01', 28, 7);
    assert.ok(calc);
    assert.equal(calc.hphtDate, '1 Maret 2026');
    assert.equal(calc.puncakOvulasi, '15 Maret 2026');
    assert.match(calc.fiqihNote, /Syafi'iyyah/);
  });

  it('enforces the 8-step MOOC state machine and facilitator verification gate', () => {
    const step1 = makePeserta();
    assert.equal(evaluatePesertaStep(step1).currentStep, 1);
    assert.equal(evaluatePesertaStep(step1).canTakePretest, false);
    assert.equal(canFasilitatorVerify(step1), false);

    const step2 = makePeserta({ pasanganUsername: 'siti_test', pasanganNama: 'Siti Aminah' });
    assert.equal(evaluatePesertaStep(step2).currentStep, 2);
    assert.equal(evaluatePesertaStep(step2).canTakePretest, true);

    const moocDone = makePeserta({
      pasanganUsername: 'siti_test',
      pasanganNama: 'Siti Aminah',
      progress: {
        pretestDone: true,
        pretestScore: 60,
        postestDone: true,
        postestScore: 100,
        videosWatched: [1, 2, 3, 4, 5],
        modulesRead: [1, 2, 3, 4, 5],
        modulesCompleted: [1, 2, 3, 4, 5],
        moduleScores: { 1: 100, 2: 80, 3: 100, 4: 100, 5: 100 },
        selesaiClicked: true,
        ikmDone: false,
        verifikasiFasilitator: false,
        kehadiranKelas: 'Belum Hadir',
      },
    });
    assert.equal(canFasilitatorVerify(moocDone), true);
    assert.equal(evaluatePesertaStep(moocDone).currentStep, 6);
    assert.equal(evaluatePesertaStep(moocDone).canDownloadDocuments, false);

    const graduated = makePeserta({
      ...moocDone,
      progress: {
        ...moocDone.progress!,
        ikmDone: true,
        verifikasiFasilitator: true,
        nomorSertifikat: 'JPR-JEP-2026-0001',
      },
    });
    const evalGrad = evaluatePesertaStep(graduated);
    assert.equal(evalGrad.currentStep, 8);
    assert.equal(evalGrad.canDownloadDocuments, true);
    assert.equal(evalGrad.progressPercent, 100);
  });

  it('counts unique synced couples without double-counting mirrored links', () => {
    const a = makePeserta({ username: 'ahmad', pasanganUsername: 'siti' });
    const b = makePeserta({ username: 'siti', pasanganUsername: 'ahmad' });
    const c = makePeserta({ username: 'budi' });
    assert.equal(countUniqueSyncedCouples([a, b, c]), 1);
  });

  it('computes compatibility score between synced couple answers', () => {
    const score = calculateCompatibilityScore(
      { 1: 0, 2: 1, 3: 2, 4: 0, 5: 1 },
      { 1: 0, 2: 1, 3: 0, 4: 0, 5: 1 },
      5
    );
    assert.equal(score.matched, 4);
    assert.equal(score.percent, 80);
    assert.equal(score.label, 'Sangat Selaras & Kompak');
  });

  it('preserves correct answer integrity when shuffling quiz options', () => {
    const sample = [
      { id: 'q1', q: 'Test?', opt: ['Benar', 'Salah 1', 'Salah 2', 'Salah 3'], ans: 0 },
    ];
    const shuffled = shuffleQuizQuestions(sample);
    assert.equal(shuffled[0].opt[shuffled[0].ans], 'Benar');
  });

  it('verifies certificate, piagam kompak, attendance code, and masked NIK queries', () => {
    const grad = makePeserta({
      username: 'ahmad_jepara',
      nama: 'Ahmad Rifai',
      nik: '3320061205980001',
      pasanganUsername: 'siti_jepara',
      pasanganNama: 'Siti Nurhaliza',
      progress: {
        pretestDone: true,
        pretestScore: 60,
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
        nomorSertifikat: 'JPR-JEP-2026-0001',
      },
      kompak: {
        kodePiagam: 'KOMPAK-2026-0001',
        peranKeluarga: 'Kompak',
        pendidikanKarakter: 'Kompak',
        disiplinPositif: 'Kompak',
        jawabanKuis: { 1: 0 },
        updatedAt: '2026-03-10T00:00:00Z',
      },
    });
    const cls: BimwinClassSchedule = {
      id: 'cls_1',
      kodeAbsen: 'ABSEN-JEP-001',
      tipe: 'Offline',
      judul: 'Kelas Bimwin Angkatan I',
      kua: 'KUA Jepara',
      tanggal: '2026-04-12',
      waktu: '08.30 - 11.30 WIB',
      lokasiAtauLink: 'Balai Nikah KUA Jepara',
      narasumber: 'H. Ahmad Subhan, S.Ag.',
      kuota: 30,
      rsvps: [],
      createdBy: 'fasilitator_jepara',
    };

    const certRes = verifyDocumentQuery('JPR-JEP-2026-0001', [grad], [cls]);
    assert.equal(certRes.found, true);
    assert.equal(certRes.valid, true);
    assert.equal(certRes.type, 'Sertifikat Bimwin');

    const kompakRes = verifyDocumentQuery('KOMPAK-2026-0001', [grad], [cls]);
    assert.equal(kompakRes.found, true);
    assert.equal(kompakRes.type, 'Piagam Kami Kompak');

    const absenRes = verifyDocumentQuery('ABSEN-JEP-001', [grad], [cls]);
    assert.equal(absenRes.found, true);
    assert.equal(absenRes.type, 'Daftar Hadir Kelas');

    const nikRes = verifyDocumentQuery('3320061205980001', [grad], [cls]);
    assert.equal(nikRes.found, true);
    assert.equal(nikRes.code, '332006******0001');

    const missing = verifyDocumentQuery('TIDAK-ADA-999', [grad], [cls]);
    assert.equal(missing.found, false);
  });

  it('matches Smart FAQ guidance and exports CSV with masked NIK', () => {
    assert.ok(getSmartFaqReply('Apa syarat berkas N1 dan SIMKAH?'));
    const csv = buildPesertaCsv([makePeserta()]);
    assert.match(csv, /332006\*{6}0001/);
    assert.doesNotMatch(csv, /3320061205980001/);
  });
});
