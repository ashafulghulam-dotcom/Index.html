import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  addDaysToIsoDate,
  buildModuleSpeechText,
  buildPesertaCsv,
  calculateAgeFromDob,
  calculateBudgetAllocation,
  calculateCompatibilityScore,
  calculateFertilityWindow,
  calculateStuntingReadiness,
  canAccessClassSelection,
  canAccessModuleQuiz,
  canAccessPiagamKompak,
  canFasilitatorVerify,
  countUniqueSyncedCouples,
  evaluatePesertaStep,
  filterAuditLogs,
  formatRupiahInput,
  getLocalIsoDate,
  getMinAkadDate,
  getSmartFaqReply,
  isUnderageMarriage,
  isValidNik,
  maskNik,
  mergeKuaDirectoryWithDefaults,
  mergeModuleLocalizedDefaults,
  normalizeEducationLevel,
  normalizeVillageName,
  parseRupiahInput,
  resolveAuditLogKua,
  resolveLocalizedModuleView,
  shuffleQuizQuestions,
  validateKuaDirectoryUpdate,
  validatePartnerSync,
  validateRencanaAkadDate,
  verifyDocumentQuery,
} from './bimwinLogic.ts';
import { DEFAULT_MODULES } from '../data/curriculumData.ts';
import { buildKuaGoogleMapsUrl, DATA_DIREKTORI_16_KUA, DOA_PENGANTIN } from '../data/jeparaData.ts';
import { EDUCATION_LEVEL_OPTIONS } from '../types/bimwin.ts';
import type { AuditLogItem, BimwinClassSchedule, BimwinUser } from '../types/bimwin.ts';

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
    tanggalRencanaNikah: '2026-06-21',
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

  it('formats and parses Indonesian Rupiah currency inputs with dot thousand separators', () => {
    assert.equal(formatRupiahInput(5000000), '5.000.000');
    assert.equal(formatRupiahInput(12500000), '12.500.000');
    assert.equal(formatRupiahInput(750), '750');
    assert.equal(formatRupiahInput(0), '0');
    assert.equal(formatRupiahInput(0, { allowEmptyZero: true }), '');
    assert.equal(formatRupiahInput(-1000, { allowEmptyZero: true }), '');

    assert.equal(parseRupiahInput('5.000.000'), 5000000);
    assert.equal(parseRupiahInput('Rp 12.500.000'), 12500000);
    assert.equal(parseRupiahInput('0005000000'), 5000000);
    assert.equal(parseRupiahInput('5jt abc'), 5);
    assert.equal(parseRupiahInput(''), 0);
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

  it('enforces same KUA, same desa tempat nikah, and opposite gender (Laki-laki & Perempuan) on partner sync', () => {
    const groom = makePeserta({
      username: 'rizky_tahunan',
      nama: 'Rizky',
      jenisKelamin: 'Laki-laki',
      kua: 'KUA Tahunan',
      desaTempatNikah: 'Tahunan',
    });

    const validBride = makePeserta({
      username: 'nadia_tahunan',
      nama: 'Nadia',
      jenisKelamin: 'Perempuan',
      kua: 'KUA Tahunan',
      desaTempatNikah: 'Tahunan',
    });
    assert.equal(validatePartnerSync(groom, validBride).ok, true);

    // Different KUA rejected
    const diffKuaBride = makePeserta({
      username: 'siti_jepara',
      nama: 'Siti',
      jenisKelamin: 'Perempuan',
      kua: 'KUA Jepara',
      desaTempatNikah: 'Kauman',
    });
    const kuaRes = validatePartnerSync(groom, diffKuaBride);
    assert.equal(kuaRes.ok, false);
    assert.match(kuaRes.error || '', /KUA harus sama/i);

    // Same KUA, different Desa rejected
    const diffDesaBride = makePeserta({
      username: 'dewi_kecapi',
      nama: 'Dewi',
      jenisKelamin: 'Perempuan',
      kua: 'KUA Tahunan',
      desaTempatNikah: 'Kecapi',
    });
    const desaRes = validatePartnerSync(groom, diffDesaBride);
    assert.equal(desaRes.ok, false);
    assert.match(desaRes.error || '', /Desa\/Kelurahan tempat nikah harus sama/i);

    // Same KUA & Desa, same gender rejected
    const sameGender = makePeserta({
      username: 'budi_tahunan',
      nama: 'Budi',
      jenisKelamin: 'Laki-laki',
      kua: 'KUA Tahunan',
      desaTempatNikah: 'Tahunan',
      tanggalRencanaNikah: '2026-06-21',
    });
    const genderRes = validatePartnerSync(groom, sameGender);
    assert.equal(genderRes.ok, false);
    assert.match(genderRes.error || '', /Laki-laki dan Perempuan/i);

    // Same KUA, Desa, opposite gender, but DIFFERENT rencana tanggal akad rejected
    const diffDateBride = makePeserta({
      username: 'nadia_bedatgl',
      nama: 'Nadia Beda Tanggal',
      jenisKelamin: 'Perempuan',
      kua: 'KUA Tahunan',
      desaTempatNikah: 'Tahunan',
      tanggalRencanaNikah: '2026-07-05',
    });
    const dateRes = validatePartnerSync(groom, diffDateBride);
    assert.equal(dateRes.ok, false);
    assert.match(dateRes.error || '', /Rencana tanggal akad nikah harus sama/i);

    // Missing rencana tanggal akad rejected
    const missingDateBride = makePeserta({
      username: 'nadia_kosong',
      nama: 'Nadia Kosong',
      jenisKelamin: 'Perempuan',
      kua: 'KUA Tahunan',
      desaTempatNikah: 'Tahunan',
      tanggalRencanaNikah: '',
    });
    const missingDateRes = validatePartnerSync(groom, missingDateBride);
    assert.equal(missingDateRes.ok, false);
    assert.match(missingDateRes.error || '', /belum diisi/i);
  });

  it('locks every module quiz until its video has been watched completely', () => {
    const moduleIds = [1, 2, 3, 4, 5];
    const afterPretest = makePeserta({
      pasanganUsername: 'nadia_tahunan',
      pasanganNama: 'Nadia',
      progress: {
        pretestDone: true,
        pretestScore: 80,
        postestDone: false,
        postestScore: 0,
        videosWatched: [],
        modulesRead: [1],
        modulesCompleted: [],
        moduleScores: {},
        selesaiClicked: false,
        ikmDone: false,
        verifikasiFasilitator: false,
        kehadiranKelas: 'Belum Hadir',
      },
    });

    // Module 1 unlocked, but video not watched -> quiz LOCKED
    const m1BeforeVideo = canAccessModuleQuiz(afterPretest, 1, moduleIds);
    assert.equal(m1BeforeVideo.unlocked, true);
    assert.equal(m1BeforeVideo.videoDone, false);
    assert.equal(m1BeforeVideo.canTakeQuiz, false);

    // After watching Module 1 video -> Module 1 quiz UNLOCKED, Module 2 still locked
    const afterM1Video = makePeserta({
      ...afterPretest,
      progress: { ...afterPretest.progress!, videosWatched: [1] },
    });
    const m1AfterVideo = canAccessModuleQuiz(afterM1Video, 1, moduleIds);
    assert.equal(m1AfterVideo.canTakeQuiz, true);
    const m2Locked = canAccessModuleQuiz(afterM1Video, 2, moduleIds);
    assert.equal(m2Locked.unlocked, false);
    assert.equal(m2Locked.canTakeQuiz, false);

    // After passing Module 1 quiz, Module 2 is unlocked but Module 2 quiz stays locked until Module 2 video is watched
    const afterM1Quiz = makePeserta({
      ...afterM1Video,
      progress: { ...afterM1Video.progress!, modulesCompleted: [1], moduleScores: { 1: 100 } },
    });
    const m2BeforeVideo = canAccessModuleQuiz(afterM1Quiz, 2, moduleIds);
    assert.equal(m2BeforeVideo.unlocked, true);
    assert.equal(m2BeforeVideo.videoDone, false);
    assert.equal(m2BeforeVideo.canTakeQuiz, false);
  });

  it('locks Online/Offline class selection until both MOOC and Survei IKM are completed', () => {
    const initial = makePeserta();
    const initialGate = canAccessClassSelection(initial, 5);
    assert.equal(initialGate.unlocked, false);
    assert.equal(initialGate.moocFinished, false);
    assert.equal(initialGate.ikmDone, false);

    const moocOnly = makePeserta({
      pasanganUsername: 'siti_test',
      pasanganNama: 'Siti Aminah',
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
    const moocOnlyGate = canAccessClassSelection(moocOnly, 5);
    assert.equal(moocOnlyGate.unlocked, false);
    assert.equal(moocOnlyGate.moocFinished, true);
    assert.equal(moocOnlyGate.ikmDone, false);
    assert.match(moocOnlyGate.reason || '', /Survei Kepuasan Masyarakat \(IKM\)/i);

    const unlockedUser = makePeserta({
      ...moocOnly,
      progress: { ...moocOnly.progress!, ikmDone: true },
    });
    const unlockedGate = canAccessClassSelection(unlockedUser, 5);
    assert.equal(unlockedGate.unlocked, true);
    assert.equal(unlockedGate.moocFinished, true);
    assert.equal(unlockedGate.ikmDone, true);
  });

  it('locks Piagam Kami Kompak until both MOOC and Survei IKM are completed', () => {
    const initial = makePeserta();
    const initialGate = canAccessPiagamKompak(initial, 5);
    assert.equal(initialGate.unlocked, false);
    assert.equal(initialGate.moocFinished, false);
    assert.equal(initialGate.ikmDone, false);
    assert.match(initialGate.reason || '', /Piagam "Kami Kompak" masih terkunci/i);

    const moocOnly = makePeserta({
      pasanganUsername: 'siti_test',
      pasanganNama: 'Siti Aminah',
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
    const moocOnlyGate = canAccessPiagamKompak(moocOnly, 5);
    assert.equal(moocOnlyGate.unlocked, false);
    assert.equal(moocOnlyGate.moocFinished, true);
    assert.equal(moocOnlyGate.ikmDone, false);
    assert.match(moocOnlyGate.reason || '', /Survei Kepuasan Masyarakat \(IKM\)/i);

    const unlockedUser = makePeserta({
      ...moocOnly,
      progress: { ...moocOnly.progress!, ikmDone: true },
    });
    const unlockedGate = canAccessPiagamKompak(unlockedUser, 5);
    assert.equal(unlockedGate.unlocked, true);
    assert.equal(unlockedGate.moocFinished, true);
    assert.equal(unlockedGate.ikmDone, true);
  });

  it('builds valid direct Google Maps URLs for all 16 KUA Kabupaten Jepara', () => {
    assert.equal(DATA_DIREKTORI_16_KUA.length, 16);
    for (const entry of DATA_DIREKTORI_16_KUA) {
      const url = buildKuaGoogleMapsUrl(entry);
      assert.ok(url.startsWith('https://www.google.com/maps/search/?api=1&query='));
      assert.ok(decodeURIComponent(url).includes(entry.kua));
      assert.ok(decodeURIComponent(url).includes('Jepara'));
    }
  });

  it('prevents retaking Pretest and Postest once completed', () => {
    const syncedBeforePretest = makePeserta({
      pasanganUsername: 'siti_test',
      pasanganNama: 'Siti Aminah',
    });
    assert.equal(evaluatePesertaStep(syncedBeforePretest, 5).canTakePretest, true);
    assert.equal(evaluatePesertaStep(syncedBeforePretest, 5).canTakePostest, false);

    const afterPretestAndModules = makePeserta({
      ...syncedBeforePretest,
      progress: {
        ...syncedBeforePretest.progress!,
        pretestDone: true,
        pretestScore: 60,
        videosWatched: [1, 2, 3, 4, 5],
        modulesCompleted: [1, 2, 3, 4, 5],
        moduleScores: { 1: 100, 2: 100, 3: 100, 4: 100, 5: 100 },
      },
    });
    assert.equal(evaluatePesertaStep(afterPretestAndModules, 5).canTakePretest, false);
    assert.equal(evaluatePesertaStep(afterPretestAndModules, 5).canTakePostest, true);

    const afterPostest = makePeserta({
      ...afterPretestAndModules,
      progress: {
        ...afterPretestAndModules.progress!,
        postestDone: true,
        postestScore: 100,
      },
    });
    assert.equal(evaluatePesertaStep(afterPostest, 5).canTakePretest, false);
    assert.equal(evaluatePesertaStep(afterPostest, 5).canTakePostest, false);
  });

  it('filters Audit Trail logs accurately by KUA, Fasilitator, and Day/Month/Year date range', () => {
    const users: BimwinUser[] = [
      {
        id: 'u_fas_jepara',
        username: 'fasilitator_jepara',
        password: 'x',
        role: 'Fasilitator',
        nama: 'Ust. H. Miftahul Huda, S.Ag. (Jepara)',
        kua: 'KUA Jepara',
        createdAt: '2026-01-10T08:00:00.000Z',
      },
      {
        id: 'u_fas_tahunan',
        username: 'fasilitator_tahunan',
        password: 'x',
        role: 'Fasilitator',
        nama: 'Ust. H. Miftahul Huda, S.Ag. (Tahunan)',
        kua: 'KUA Tahunan',
        createdAt: '2026-01-10T08:00:00.000Z',
      },
    ];

    const logs: AuditLogItem[] = [
      {
        id: 'l1',
        actor: 'Ust. H. Miftahul Huda, S.Ag. (Jepara)',
        actorUsername: 'fasilitator_jepara',
        role: 'Fasilitator',
        kua: 'KUA Jepara',
        action: 'Mengesahkan peserta KUA Jepara',
        timestamp: '2026-03-12T10:00:00.000Z',
      },
      {
        id: 'l2',
        actor: 'Ust. H. Miftahul Huda, S.Ag. (Tahunan)',
        role: 'Fasilitator',
        // legacy log without explicit kua/actorUsername
        action: 'Membuat jadwal kelas KUA Tahunan',
        timestamp: '2026-03-20T09:00:00.000Z',
      },
      {
        id: 'l3',
        actor: 'Drs. H. Ahmad Munif, M.Ag.',
        actorUsername: 'admin',
        role: 'SuperAdmin',
        kua: 'Kemenag Kab. Jepara',
        action: 'Memperbarui konfigurasi sistem',
        timestamp: '2026-02-05T08:00:00.000Z',
      },
    ];

    // Legacy KUA resolution
    assert.equal(resolveAuditLogKua(logs[1], users), 'KUA Tahunan');

    // Filter by KUA
    const byKua = filterAuditLogs(logs, users, { kua: 'KUA Jepara' });
    assert.equal(byKua.error, undefined);
    assert.deepEqual(
      byKua.items.map((l) => l.id),
      ['l1']
    );

    // Filter by Fasilitator (works even on legacy log matched by name)
    const byFas = filterAuditLogs(logs, users, { fasilitator: 'fasilitator_tahunan' });
    assert.equal(byFas.error, undefined);
    assert.deepEqual(
      byFas.items.map((l) => l.id),
      ['l2']
    );

    // Filter by Day/Month/Year range (10 Maret 2026 s.d. 15 Maret 2026)
    const byRange = filterAuditLogs(logs, users, {
      startDate: { day: '10', month: '3', year: '2026' },
      endDate: { day: '15', month: '3', year: '2026' },
    });
    assert.equal(byRange.error, undefined);
    assert.deepEqual(
      byRange.items.map((l) => l.id),
      ['l1']
    );

    // Invalid calendar date (31 Februari 2026)
    const invalidDate = filterAuditLogs(logs, users, {
      startDate: { day: '31', month: '2', year: '2026' },
    });
    assert.match(invalidDate.error || '', /tidak tersedia/i);

    // Reversed date range (start > end)
    const reversed = filterAuditLogs(logs, users, {
      startDate: { day: '25', month: '3', year: '2026' },
      endDate: { day: '10', month: '3', year: '2026' },
    });
    assert.match(reversed.error || '', /tidak boleh lebih besar/i);
  });

  it('validates, merges, and resolves custom Google Maps URLs for 16 KUA directory management', () => {
    assert.equal(
      validateKuaDirectoryUpdate({
        alamat: 'Jl. KH. Wahid Hasyim No. 12, Potroyudan, Jepara',
        telp: '0291-591014',
        whatsapp: '0813-2500-1010',
        email: 'kua.jepara@kemenag.go.id',
        jamLayanan: 'Senin–Jumat, 07.30–16.00 WIB',
        mapsUrl: 'https://maps.google.com/?q=-6.5888,110.6684',
      }).ok,
      true
    );

    assert.equal(
      validateKuaDirectoryUpdate({
        alamat: 'Jl',
        telp: '0291-591014',
        jamLayanan: 'Senin–Jumat, 07.30–16.00 WIB',
      }).ok,
      false
    );

    assert.equal(
      validateKuaDirectoryUpdate({
        alamat: 'Jl. Raya Jepara',
        telp: '123',
        jamLayanan: 'Senin–Jumat, 07.30–16.00 WIB',
      }).ok,
      false
    );

    assert.equal(
      validateKuaDirectoryUpdate({
        alamat: 'Jl. Raya Jepara',
        telp: '0291-591014',
        jamLayanan: 'Senin–Jumat, 07.30–16.00 WIB',
        email: 'bukan-email',
      }).ok,
      false
    );

    assert.equal(
      validateKuaDirectoryUpdate({
        alamat: 'Jl. Raya Jepara',
        telp: '0291-591014',
        jamLayanan: 'Senin–Jumat, 07.30–16.00 WIB',
        mapsUrl: 'maps.google.com/invalid',
      }).ok,
      false
    );

    const merged = mergeKuaDirectoryWithDefaults([
      {
        kua: 'KUA Jepara',
        alamat: 'Jl. Baru KUA Jepara No. 99',
        telp: '0812-3456-7890',
        jamLayanan: 'Senin–Sabtu, 08.00–15.00 WIB',
        mapsUrl: 'https://maps.app.goo.gl/kuaJeparaCustom',
        updatedAt: '2026-04-01T08:00:00.000Z',
      },
      {
        kua: 'KUA Tahunan',
        alamat: 'Jl. Raya Jepara-Kudus KM 7, Kec. Tahunan',
        telp: '0291-593112',
        jamLayanan: 'Senin–Jumat, 07.30–16.00 WIB',
      },
    ]);
    assert.equal(merged.length, 16);
    const jepara = merged.find((item) => item.kua === 'KUA Jepara')!;
    assert.equal(jepara.alamat, 'Jl. Baru KUA Jepara No. 99');
    assert.equal(jepara.telp, '0812-3456-7890');
    assert.equal(jepara.jamLayanan, 'Senin–Sabtu, 08.00–15.00 WIB');
    assert.equal(buildKuaGoogleMapsUrl(jepara), 'https://maps.app.goo.gl/kuaJeparaCustom');

    const tahunan = merged.find((item) => item.kua === 'KUA Tahunan')!;
    assert.equal(
      tahunan.jamLayanan,
      "Senin–Kamis, 07.30–16.00 WIB\nJum'at, 07.30–16.30 WIB"
    );
  });

  it('provides all 10 official Pendidikan Terakhir options in exact order and migrates legacy values', () => {
    assert.deepEqual([...EDUCATION_LEVEL_OPTIONS], [
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
    ]);
    assert.equal(EDUCATION_LEVEL_OPTIONS.length, 10);
    assert.equal(normalizeEducationLevel('SMA / MA / SMK'), 'SLTA/SEDERAJAT');
    assert.equal(normalizeEducationLevel('S1 / D4'), 'DIPLOMA IV/STRATA I');
    assert.equal(normalizeEducationLevel('STRATA-III'), 'STRATA-III');
  });

  it('prevents selecting Rencana Tanggal Akad Nikah before registration date or in the past', () => {
    const fixedNow = new Date(2026, 10, 21, 10, 30, 0); // 2026-11-21 local
    assert.equal(getLocalIsoDate(fixedNow), '2026-11-21');
    assert.equal(addDaysToIsoDate('2026-11-21', 30), '2026-12-21');

    // New registration: minDate is today (2026-11-21)
    assert.equal(getMinAkadDate(undefined, fixedNow), '2026-11-21');

    // Past date (yesterday, previous month, previous year) must be rejected
    const yesterday = validateRencanaAkadDate('2026-11-20', undefined, fixedNow);
    assert.equal(yesterday.ok, false);
    assert.equal(yesterday.minDate, '2026-11-21');
    assert.match(yesterday.error || '', /tidak boleh sebelum tanggal pendaftaran/i);

    const pastYear = validateRencanaAkadDate('2025-05-10', undefined, fixedNow);
    assert.equal(pastYear.ok, false);

    // Registration day itself and future dates are accepted
    assert.equal(validateRencanaAkadDate('2026-11-21', undefined, fixedNow).ok, true);
    assert.equal(validateRencanaAkadDate('2027-01-15', undefined, fixedNow).ok, true);

    // Existing account created earlier: cannot choose dates before today or before createdAt
    assert.equal(getMinAkadDate('2026-03-01', fixedNow), '2026-11-21');
    assert.equal(validateRencanaAkadDate('2026-06-21', '2026-03-01', fixedNow).ok, false);
    assert.equal(validateRencanaAkadDate('2026-12-10', '2026-03-01', fixedNow).ok, true);

    // If accountCreatedAt is later than clock (skewed clock), respects createdAt too
    assert.equal(getMinAkadDate('2026-11-25', fixedNow), '2026-11-25');
    assert.equal(validateRencanaAkadDate('2026-11-24', '2026-11-25', fixedNow).ok, false);
    assert.equal(validateRencanaAkadDate('2026-11-25', '2026-11-25', fixedNow).ok, true);

    // Rejects empty and impossible calendar dates
    assert.equal(validateRencanaAkadDate('', undefined, fixedNow).ok, false);
    assert.equal(validateRencanaAkadDate('2027-02-31', undefined, fixedNow).ok, false);
  });

  it('provides complete, unabridged 1-to-1 Jawa Krama, English, and Arabic translations for all 5 MOOC modules and Doa Pengantin', () => {
    assert.equal(DEFAULT_MODULES.length, 5);

    for (const mod of DEFAULT_MODULES) {
      const idView = resolveLocalizedModuleView(mod, 'id');
      assert.equal(idView.sections.length, mod.sections.length);
      assert.equal(idView.keyTakeaway, mod.keyTakeaway);

      for (const lang of ['jv', 'en', 'ar'] as const) {
        const view = resolveLocalizedModuleView(mod, lang);
        assert.ok(view.judul.trim().length > 10, `Modul ${mod.id} (${lang}) missing judul`);
        assert.notEqual(view.judul, idView.judul, `Modul ${mod.id} (${lang}) judul should be translated`);
        assert.ok(view.keyTakeawayLabel.trim().length > 5);
        assert.ok(view.keyTakeaway.trim().length > 30);
        assert.notEqual(view.keyTakeaway, idView.keyTakeaway);

        // Exact 1-to-1 section, paragraph, and bullet parity with Indonesian
        assert.equal(
          view.sections.length,
          idView.sections.length,
          `Modul ${mod.id} (${lang}) section count mismatch`
        );

        view.sections.forEach((sec, idx) => {
          const idSec = idView.sections[idx];
          assert.ok(sec.heading.trim().length > 3, `Modul ${mod.id} (${lang}) sec ${idx} missing heading`);
          assert.equal(
            sec.paragraphs.length,
            idSec.paragraphs.length,
            `Modul ${mod.id} (${lang}) sec ${idx} paragraph count mismatch`
          );
          sec.paragraphs.forEach((p, pIdx) => {
            assert.ok(p.trim().length > 20, `Modul ${mod.id} (${lang}) sec ${idx} p ${pIdx} too short`);
          });
          assert.equal(
            sec.bullets?.length ?? 0,
            idSec.bullets?.length ?? 0,
            `Modul ${mod.id} (${lang}) sec ${idx} bullet count mismatch`
          );
        });

        // Speech narration includes title, every section heading, every bullet, and takeaway
        const speech = buildModuleSpeechText(mod, lang);
        assert.ok(speech.includes(view.judul));
        assert.ok(speech.includes(view.keyTakeaway));
        for (const sec of view.sections) {
          assert.ok(speech.includes(sec.heading));
          for (const b of sec.bullets || []) {
            assert.ok(speech.includes(b));
          }
        }
      }
    }

    // Doa Pengantin also has complete translations across all 4 languages
    assert.ok(DOA_PENGANTIN.length >= 2);
    for (const doa of DOA_PENGANTIN) {
      for (const lang of ['id', 'jv', 'en', 'ar'] as const) {
        assert.ok(
          doa.translations[lang].trim().length > 40,
          `Doa ${doa.id} (${lang}) translation should be complete`
        );
      }
    }
  });

  it('hydrates legacy localStorage modules with localizedContent while preserving custom admin edits', () => {
    const legacyStored = DEFAULT_MODULES.map((m) => {
      const clone = { ...m };
      delete clone.localizedContent;
      if (clone.id === 1) {
        clone.videoUrl = 'https://youtu.be/customAdminVideo123';
        clone.driveUrl = 'https://drive.google.com/file/d/customAdminPdf';
      }
      return clone;
    });

    const hydrated = mergeModuleLocalizedDefaults(legacyStored, DEFAULT_MODULES);
    assert.equal(hydrated.length, DEFAULT_MODULES.length);
    assert.equal(hydrated[0].videoUrl, 'https://youtu.be/customAdminVideo123');
    assert.equal(hydrated[0].driveUrl, 'https://drive.google.com/file/d/customAdminPdf');

    for (const mod of hydrated) {
      assert.ok(mod.localizedContent?.jv?.sections.length);
      assert.ok(mod.localizedContent?.en?.sections.length);
      assert.ok(mod.localizedContent?.ar?.sections.length);
    }
  });
});

