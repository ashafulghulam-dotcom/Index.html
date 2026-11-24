import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { LIST_16_KUA } from '../data/jeparaData';
import { createInitialSeedData } from '../data/seedData';
import {
  buildAttendanceQrPayload,
  buildIcsCalendarContent,
  buildSimkahCsvTemplate,
  detectDuplicatePeserta,
  generateSequentialCertificateNumber,
  isIdentityLockedAfterCert,
  parseAttendanceQrPayload,
  parseSimkahCsv,
} from './operationalTools';

describe('Operational Tools (SIMKAH CSV, Sequential Cert, Attendance QR, ICS)', () => {
  it('parses SIMKAH CSV with comma or semicolon delimiters and flags invalid NIK rows', () => {
    const csv = [
      'nama;nik;jenis_kelamin;hp;email;kua;desa;tanggal_akad;pendidikan',
      'Budi Santoso;3320061204980101;Laki-laki;085225009911;budi@catin.id;KUA Tahunan;Mantingan;2026-12-22;S1',
      'Data Salah;12345;Perempuan;08123456789;;KUA Jepara;Kauman;2026-12-22;SMA',
    ].join('\n');

    const parsed = parseSimkahCsv(csv, { defaultKua: 'KUA Jepara' });
    assert.equal(parsed.validRows.length, 1);
    assert.equal(parsed.errors.length, 1);
    assert.equal(parsed.validRows[0].kua, 'KUA Tahunan');
    assert.equal(parsed.validRows[0].desa, 'Mantingan');
    assert.equal(parsed.validRows[0].nik, '3320061204980101');
  });

  it('enforces lockToKua for Admin KUA imports and detects existing & in-batch duplicate NIKs', () => {
    const seed = createInitialSeedData();
    const existingPeserta = seed.users.find((u) => u.role === 'Peserta')!;
    const csv = [
      'nama,nik,jenis_kelamin,hp,kua',
      `Duplikat Lama,${existingPeserta.nik},Laki-laki,085225111111,KUA Bangsri`,
      'Peserta Baru 1,3320062205998801,Laki-laki,085225111112,KUA Bangsri',
      'Peserta Baru Duplikat Batch,3320062205998801,Perempuan,085225111113,KUA Bangsri',
    ].join('\n');

    const parsed = parseSimkahCsv(csv, { defaultKua: 'KUA Jepara', lockToKua: 'KUA Jepara' });
    assert.equal(parsed.validRows.length, 3);
    assert.ok(parsed.validRows.every((r) => r.kua === 'KUA Jepara'));

    const checked = detectDuplicatePeserta(parsed.validRows, seed.users);
    assert.equal(checked.cleanRows.length, 1);
    assert.equal(checked.duplicates.length, 2);
    assert.equal(checked.cleanRows[0].nama, 'Peserta Baru 1');
  });

  it('generates downloadable CSV template with valid parsable sample rows', () => {
    const tpl = buildSimkahCsvTemplate('KUA Bangsri');
    const parsed = parseSimkahCsv(tpl, { defaultKua: 'KUA Bangsri' });
    assert.equal(parsed.errors.length, 0);
    assert.equal(parsed.validRows.length, 2);
  });

  it('generates collision-free sequential certificate numbers per KUA and year', () => {
    const seed = createInitialSeedData();
    const peserta = seed.users.find((u) => u.role === 'Peserta' && u.progress)!;
    const d = new Date('2026-11-23T08:00:00Z');
    const expectedCode = String(LIST_16_KUA.indexOf('KUA Jepara') + 1).padStart(2, '0');
    const first = generateSequentialCertificateNumber(seed.users, 'KUA Jepara', d);
    assert.match(first, new RegExp(`^B-\\d{4}\\/Kk\\.11\\.20\\/${expectedCode}\\/PW\\.01\\/11\\/2026$`));

    const withFirst = [
      ...seed.users,
      {
        ...peserta,
        id: 'tmp-cert-1',
        progress: { ...peserta.progress!, nomorSertifikat: first },
      },
    ];
    const second = generateSequentialCertificateNumber(withFirst, 'KUA Jepara', d);
    assert.notEqual(second, first);
    const seq1 = Number(first.slice(2, 6));
    const seq2 = Number(second.slice(2, 6));
    assert.equal(seq2, seq1 + 1);
  });

  it('locks core participant identity fields once certificate is issued', () => {
    const seed = createInitialSeedData();
    const peserta = seed.users.find((u) => u.role === 'Peserta' && u.progress)!;
    assert.equal(
      isIdentityLockedAfterCert({
        progress: { ...peserta.progress!, verifikasiFasilitator: true },
      }),
      true
    );
    assert.equal(
      isIdentityLockedAfterCert({
        progress: {
          ...peserta.progress!,
          verifikasiFasilitator: false,
          nomorSertifikat: undefined,
        },
      }),
      false
    );
  });

  it('builds and validates tamper-resistant classroom QR attendance payloads', () => {
    const qr = buildAttendanceQrPayload({
      classId: 'cls-jepara-1',
      kua: 'KUA Jepara',
      tanggal: '2026-12-05',
    });
    const parsed = parseAttendanceQrPayload(qr);
    assert.equal(parsed.valid, true);
    const expectedCode = String(LIST_16_KUA.indexOf('KUA Jepara') + 1).padStart(2, '0');
    if (parsed.valid) {
      assert.equal(parsed.classId, 'cls-jepara-1');
      assert.equal(parsed.kuaCode, expectedCode);
      assert.equal(parsed.dateDigits, '20261205');
    }

    const tampered = qr.replace('cls-jepara-1', 'cls-tahunan-9');
    const bad = parseAttendanceQrPayload(tampered);
    assert.equal(bad.valid, false);
  });

  it('builds valid RFC 5545 ICS calendar content with H-1 and 1-hour alarms', () => {
    const ics = buildIcsCalendarContent({
      uid: 'kelas-1',
      title: 'Kelas BIMWIN KUA Jepara',
      description: 'Bimbingan Perkawinan Tatap Muka',
      location: 'Aula KUA Jepara',
      dateIso: '2026-12-10',
      startHour: 8,
      startMinute: 30,
      durationMinutes: 150,
    });
    assert.ok(ics.includes('BEGIN:VCALENDAR'));
    assert.ok(ics.includes('DTSTART:20261210T083000'));
    assert.ok(ics.includes('DTEND:20261210T110000'));
    assert.ok(ics.includes('TRIGGER:-P1D'));
    assert.ok(ics.includes('END:VCALENDAR'));
  });
});
