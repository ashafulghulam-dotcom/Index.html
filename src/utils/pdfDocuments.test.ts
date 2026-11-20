import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildExecutiveReportRows,
  DOCUMENT_A4_SPECS,
  sanitizeFilenameSegment,
} from './pdfDocuments';

test('Sertifikat uses A4 horizontal (landscape 297x210mm) and other official documents use A4 vertical (portrait 210x297mm)', () => {
  assert.equal(DOCUMENT_A4_SPECS.sertifikat.orientation, 'landscape');
  assert.equal(DOCUMENT_A4_SPECS.sertifikat.widthMm, 297);
  assert.equal(DOCUMENT_A4_SPECS.sertifikat.heightMm, 210);

  for (const key of ['piagam_kompak', 'rapor_portofolio', 'laporan_eksekutif', 'daftar_hadir'] as const) {
    assert.equal(DOCUMENT_A4_SPECS[key].orientation, 'portrait');
    assert.equal(DOCUMENT_A4_SPECS[key].widthMm, 210);
    assert.equal(DOCUMENT_A4_SPECS[key].heightMm, 297);
  }
});

test('buildExecutiveReportRows calculates pass rates accurately including zero-participant units', () => {
  const rows = buildExecutiveReportRows([
    { name: 'Jepara', Peserta: 4, Lulus: 3 },
    { name: 'Tahunan', Peserta: 2, Lulus: 2 },
    { name: 'Donorojo', Peserta: 0, Lulus: 0 },
  ]);

  assert.deepEqual(rows, [
    { unit: 'Jepara', peserta: 4, lulus: 3, rate: 75 },
    { unit: 'Tahunan', peserta: 2, lulus: 2, rate: 100 },
    { unit: 'Donorojo', peserta: 0, lulus: 0, rate: 0 },
  ]);
});

test('sanitizeFilenameSegment strips unsafe filename characters cleanly', () => {
  assert.equal(sanitizeFilenameSegment('KUA Jepara / 2026'), 'KUA_Jepara_2026');
  assert.equal(sanitizeFilenameSegment('JPR-JEP-2026-0001'), 'JPR-JEP-2026-0001');
  assert.equal(sanitizeFilenameSegment('   '), 'dokumen');
});
