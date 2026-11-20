import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildVerificationQrUrl,
  extractVerificationCode,
  inferQrKindFromCode,
  readVerificationCodeFromSearch,
} from './qrVerification';
import { verifyDocumentQuery } from './bimwinLogic';
import { BimwinClassSchedule, BimwinUser } from '../types/bimwin';

const demoOrigin = 'https://samawa-jepara.app';

test('buildVerificationQrUrl builds proper clickable URLs for every QR document type', () => {
  assert.equal(
    buildVerificationQrUrl('JPR-JEP-2026-0001', 'sertifikat', demoOrigin),
    'https://samawa-jepara.app/?cek=JPR-JEP-2026-0001'
  );
  assert.equal(
    buildVerificationQrUrl('KOMPAK-2026-0001', 'kompak', demoOrigin),
    'https://samawa-jepara.app/?cek_kompak=KOMPAK-2026-0001'
  );
  assert.equal(
    buildVerificationQrUrl('ABSEN-JEP-2026-01', 'absen', demoOrigin),
    'https://samawa-jepara.app/?cek_absen=ABSEN-JEP-2026-01'
  );
  assert.equal(
    buildVerificationQrUrl('LAP-BIMWIN-2026-JEP', 'laporan', demoOrigin),
    'https://samawa-jepara.app/?cek_laporan=LAP-BIMWIN-2026-JEP'
  );
  // Idempotent when already a full URL
  assert.equal(
    buildVerificationQrUrl('https://samawa-jepara.app/?cek=JPR-JEP-2026-0001', 'sertifikat', demoOrigin),
    'https://samawa-jepara.app/?cek=JPR-JEP-2026-0001'
  );
});

test('inferQrKindFromCode infers document kind accurately', () => {
  assert.equal(inferQrKindFromCode('JPR-JEP-2026-0001'), 'sertifikat');
  assert.equal(inferQrKindFromCode('KOMPAK-2026-0001'), 'kompak');
  assert.equal(inferQrKindFromCode('ABSEN-JEP-2026-01'), 'absen');
  assert.equal(inferQrKindFromCode('LAP-BIMWIN-2026-ALL'), 'laporan');
  assert.equal(inferQrKindFromCode('ahmad_jepara'), 'peserta');
});

test('extractVerificationCode parses full QR URLs, query strings, raw codes, and @usernames', () => {
  assert.equal(
    extractVerificationCode('https://samawa-jepara.app/?cek=JPR-JEP-2026-0001'),
    'JPR-JEP-2026-0001'
  );
  assert.equal(
    extractVerificationCode('https://samawa-jepara.app/?cek_kompak=KOMPAK-2026-0001'),
    'KOMPAK-2026-0001'
  );
  assert.equal(
    extractVerificationCode('https://samawa-jepara.app/?cek_absen=ABSEN-JEP-2026-01'),
    'ABSEN-JEP-2026-01'
  );
  assert.equal(
    extractVerificationCode('https://samawa-jepara.app/?cek_laporan=LAP-BIMWIN-2026-ALL'),
    'LAP-BIMWIN-2026-ALL'
  );
  assert.equal(extractVerificationCode('  @ahmad_jepara  '), 'ahmad_jepara');
});

test('readVerificationCodeFromSearch extracts all supported verification query parameters', () => {
  assert.equal(readVerificationCodeFromSearch('?cek=JPR-JEP-2026-0001'), 'JPR-JEP-2026-0001');
  assert.equal(readVerificationCodeFromSearch('?cek_kompak=KOMPAK-2026-0001'), 'KOMPAK-2026-0001');
  assert.equal(readVerificationCodeFromSearch('?cek_absen=ABSEN-JEP-2026-01'), 'ABSEN-JEP-2026-01');
  assert.equal(readVerificationCodeFromSearch('?cek_laporan=LAP-BIMWIN-2026-ALL'), 'LAP-BIMWIN-2026-ALL');
  assert.equal(readVerificationCodeFromSearch(''), '');
});

test('verifyDocumentQuery resolves full QR URLs and Peserta usernames cleanly', () => {
  const peserta: BimwinUser = {
    id: 'u1',
    username: 'ahmad_jepara',
    password: 'secret',
    role: 'Peserta',
    nama: 'Ahmad Rifai',
    nik: '3320061205980001',
    kua: 'KUA Jepara',
    desaTempatNikah: 'Kauman',
    pasanganNama: 'Siti Nurhaliza',
    createdAt: '2026-04-01T00:00:00.000Z',
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
      tanggalTerbitSertifikat: '2026-10-01',
    },
    kompak: {
      kodePiagam: 'KOMPAK-2026-0001',
      peranKeluarga: 'A',
      pendidikanKarakter: 'B',
      disiplinPositif: 'C',
      jawabanKuis: {},
      updatedAt: '2026-10-01',
    },
  };
  const cls: BimwinClassSchedule = {
    id: 'c1',
    kua: 'KUA Jepara',
    tipe: 'Offline',
    judul: 'Kelas Bimwin Angkatan I',
    tanggal: '2026-11-25',
    waktu: '08.00 - 12.00 WIB',
    lokasiAtauLink: 'Balai Nikah KUA Jepara',
    narasumber: 'Ust. H. Miftahul Huda',
    kuota: 30,
    kodeAbsen: 'ABSEN-JEP-2026-01',
    rsvps: [],
    createdBy: 'fasilitator_jepara',
  };

  // Scan full Sertifikat QR URL
  const certFromUrl = verifyDocumentQuery(
    'https://samawa-jepara.app/?cek=JPR-JEP-2026-0001',
    [peserta],
    [cls]
  );
  assert.equal(certFromUrl.found, true);
  assert.equal(certFromUrl.valid, true);
  assert.equal(certFromUrl.type, 'Sertifikat Bimwin');

  // Scan full Absensi QR URL
  const absenFromUrl = verifyDocumentQuery(
    'https://samawa-jepara.app/?cek_absen=ABSEN-JEP-2026-01',
    [peserta],
    [cls]
  );
  assert.equal(absenFromUrl.found, true);
  assert.equal(absenFromUrl.valid, true);
  assert.equal(absenFromUrl.type, 'Daftar Hadir Kelas');

  // Scan full Kompak QR URL
  const kompakFromUrl = verifyDocumentQuery(
    'https://samawa-jepara.app/?cek_kompak=KOMPAK-2026-0001',
    [peserta],
    [cls]
  );
  assert.equal(kompakFromUrl.found, true);
  assert.equal(kompakFromUrl.valid, true);
  assert.equal(kompakFromUrl.type, 'Piagam Kami Kompak');

  // Scan username QR (e.g. Rapor Portofolio / ID Card before graduation)
  const byUsername = verifyDocumentQuery(
    'https://samawa-jepara.app/?cek=ahmad_jepara',
    [peserta],
    [cls]
  );
  assert.equal(byUsername.found, true);
  assert.equal(byUsername.title, 'Ahmad Rifai');
});
