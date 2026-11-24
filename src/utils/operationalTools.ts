import { DESA_PER_KUA_JEPARA, LIST_16_KUA } from '../data/jeparaData';
import { BimwinUser, Gender } from '../types/bimwin';
import { isValidNik, normalizeEducationLevel, normalizeVillageName } from './bimwinLogic';

export interface SimkahCsvParsedRow {
  rowNumber: number;
  nama: string;
  nik: string;
  jenisKelamin: Gender;
  hp: string;
  email: string;
  kua: string;
  desa: string;
  rencanaAkad: string;
  pendidikan: string;
  tempatLahir: string;
  tanggalLahir: string;
  suggestedUsername: string;
}

export interface SimkahCsvParseResult {
  validRows: SimkahCsvParsedRow[];
  errors: Array<{ rowNumber: number; reason: string }>;
}

function splitCsvLine(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === delimiter && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

function slugifyUsernamePart(value: string): string {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 12);
}

function resolveCanonicalKua(rawKua: string | undefined, fallbackKua: string): string {
  const clean = String(rawKua || '').trim();
  if (!clean) return fallbackKua;
  const matched = LIST_16_KUA.find(
    (k) =>
      k.toLowerCase() === clean.toLowerCase() ||
      k.toLowerCase().replace(/^kua\s+/, '') === clean.toLowerCase().replace(/^kua\s+/, '')
  );
  return matched || fallbackKua;
}

export function parseSimkahCsv(
  csvText: string,
  options: { defaultKua: string; lockToKua?: string }
): SimkahCsvParseResult {
  const lines = String(csvText || '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length < 2) {
    return {
      validRows: [],
      errors: [{ rowNumber: 1, reason: 'File CSV kosong atau belum memiliki baris data di bawah header.' }],
    };
  }

  const headerLine = lines[0];
  const delimiter = headerLine.includes(';') && !headerLine.includes(',') ? ';' : ',';
  const headers = splitCsvLine(headerLine, delimiter).map((h) =>
    h.toLowerCase().replace(/[^a-z0-9]/g, '')
  );

  const findCol = (aliases: string[]) =>
    headers.findIndex((h) => aliases.some((a) => h === a || h.includes(a)));

  const idxNama = findCol(['nama', 'namalengkap', 'namacatin']);
  const idxNik = findCol(['nik', 'noktp']);
  const idxGender = findCol(['jeniskelamin', 'gender', 'jk', 'kelamin']);
  const idxHp = findCol(['hp', 'nohp', 'whatsapp', 'wa', 'telepon']);
  const idxEmail = findCol(['email', 'surel']);
  const idxKua = findCol(['kua', 'kecamatan']);
  const idxDesa = findCol(['desa', 'kelurahan']);
  const idxAkad = findCol(['tanggalakad', 'rencanaakad', 'tglakad', 'akad']);
  const idxPend = findCol(['pendidikan', 'pendidikanterakhir']);
  const idxTempat = findCol(['tempatlahir', 'tmplahir']);
  const idxTglLahir = findCol(['tanggallahir', 'tgllahir', 'dob']);

  if (idxNama === -1 || idxNik === -1) {
    return {
      validRows: [],
      errors: [
        {
          rowNumber: 1,
          reason: 'Header CSV wajib memiliki kolom "nama" dan "nik" (contoh: nama,nik,jenis_kelamin,hp,email,kua,desa,tanggal_akad).',
        },
      ],
    };
  }

  const validRows: SimkahCsvParsedRow[] = [];
  const errors: Array<{ rowNumber: number; reason: string }> = [];

  for (let i = 1; i < lines.length; i += 1) {
    const rowNumber = i + 1;
    const cols = splitCsvLine(lines[i], delimiter);
    const nama = (cols[idxNama] || '').trim();
    const nik = (cols[idxNik] || '').replace(/\D/g, '');

    if (!nama || nama.length < 2) {
      errors.push({ rowNumber, reason: 'Nama peserta kosong atau terlalu pendek.' });
      continue;
    }
    if (!isValidNik(nik)) {
      errors.push({ rowNumber, reason: `NIK "${cols[idxNik] || ''}" harus 16 digit angka valid.` });
      continue;
    }

    const rawGender = (idxGender >= 0 ? cols[idxGender] : '').toLowerCase();
    const jenisKelamin: Gender =
      rawGender.startsWith('p') || rawGender.includes('wanita') || rawGender.includes('istri')
        ? 'Perempuan'
        : 'Laki-laki';

    const kua = options.lockToKua
      ? options.lockToKua
      : resolveCanonicalKua(idxKua >= 0 ? cols[idxKua] : '', options.defaultKua);

    const rawDesa = idxDesa >= 0 ? cols[idxDesa] : '';
    const defaultDesa = DESA_PER_KUA_JEPARA[kua]?.[0] || 'Kauman';
    const desa = rawDesa ? normalizeVillageName(rawDesa, kua) : defaultDesa;

    const rawHp = (idxHp >= 0 ? cols[idxHp] : '').replace(/[^\d+]/g, '') || '085200000000';
    const firstWord = slugifyUsernamePart(nama.split(/\s+/)[0] || 'catin');
    const kuaSlug = slugifyUsernamePart(kua.replace(/^kua\s+/i, ''));
    const suggestedUsername = `${firstWord}_${kuaSlug}_${nik.slice(-4)}`;
    const email =
      (idxEmail >= 0 && cols[idxEmail]?.includes('@') ? cols[idxEmail].trim() : '') ||
      `${suggestedUsername}@catinjepara.id`;

    const rawAkad = idxAkad >= 0 ? cols[idxAkad]?.trim() : '';
    const rencanaAkad = /^\d{4}-\d{2}-\d{2}$/.test(rawAkad) ? rawAkad : '2026-12-20';
    const pendidikan =
      normalizeEducationLevel(idxPend >= 0 ? cols[idxPend] : 'SMA/SMK/MA') || 'SMA/SMK/MA';
    const tempatLahir = (idxTempat >= 0 && cols[idxTempat]?.trim()) || 'Jepara';
    const rawDob = idxTglLahir >= 0 ? cols[idxTglLahir]?.trim() : '';
    const tanggalLahir = /^\d{4}-\d{2}-\d{2}$/.test(rawDob) ? rawDob : '1999-05-15';

    validRows.push({
      rowNumber,
      nama,
      nik,
      jenisKelamin,
      hp: rawHp,
      email,
      kua,
      desa,
      rencanaAkad,
      pendidikan,
      tempatLahir,
      tanggalLahir,
      suggestedUsername,
    });
  }

  return { validRows, errors };
}

export interface DuplicateCheckResult {
  cleanRows: SimkahCsvParsedRow[];
  duplicates: Array<{ rowNumber: number; nama: string; nik: string; reason: string }>;
}

export function detectDuplicatePeserta(
  incomingRows: SimkahCsvParsedRow[],
  existingUsers: BimwinUser[]
): DuplicateCheckResult {
  const existingNiks = new Set(
    existingUsers.map((u) => String(u.nik || '').replace(/\D/g, '')).filter(Boolean)
  );
  const existingUsernames = new Set(existingUsers.map((u) => u.username.toLowerCase()));
  const seenBatchNiks = new Set<string>();
  const seenBatchUsers = new Set<string>();

  const cleanRows: SimkahCsvParsedRow[] = [];
  const duplicates: DuplicateCheckResult['duplicates'] = [];

  for (const row of incomingRows) {
    const cleanNik = row.nik.replace(/\D/g, '');
    const lowerUser = row.suggestedUsername.toLowerCase();

    if (existingNiks.has(cleanNik)) {
      duplicates.push({
        rowNumber: row.rowNumber,
        nama: row.nama,
        nik: cleanNik,
        reason: 'NIK sudah terdaftar di sistem SAMAWA.',
      });
      continue;
    }
    if (seenBatchNiks.has(cleanNik)) {
      duplicates.push({
        rowNumber: row.rowNumber,
        nama: row.nama,
        nik: cleanNik,
        reason: 'NIK ganda di dalam file CSV yang sama.',
      });
      continue;
    }
    if (existingUsernames.has(lowerUser) || seenBatchUsers.has(lowerUser)) {
      const disambiguated = `${row.suggestedUsername}_${row.rowNumber}`;
      seenBatchNiks.add(cleanNik);
      seenBatchUsers.add(disambiguated.toLowerCase());
      cleanRows.push({ ...row, suggestedUsername: disambiguated });
      continue;
    }

    seenBatchNiks.add(cleanNik);
    seenBatchUsers.add(lowerUser);
    cleanRows.push(row);
  }

  return { cleanRows, duplicates };
}

export function buildSimkahCsvTemplate(kuaName = 'KUA Jepara'): string {
  const defaultDesa = DESA_PER_KUA_JEPARA[kuaName]?.[0] || 'Kauman';
  return [
    'nama,nik,jenis_kelamin,hp,email,kua,desa,tanggal_akad,pendidikan,tempat_lahir,tanggal_lahir',
    `Muhammad Farhan,3320061102990101,Laki-laki,085225110001,farhan@catinjepara.id,${kuaName},${defaultDesa},2026-12-20,S1,Jepara,1999-02-11`,
    `Aulia Rahmawati,3320065408000102,Perempuan,085225110002,aulia@catinjepara.id,${kuaName},${defaultDesa},2026-12-20,S1,Jepara,2000-08-14`,
  ].join('\n');
}

export function generateSequentialCertificateNumber(
  existingUsers: BimwinUser[],
  kuaName: string,
  issuedDate = new Date()
): string {
  const kuaIndex = Math.max(1, LIST_16_KUA.indexOf(kuaName) + 1);
  const kuaCode = String(kuaIndex).padStart(2, '0');
  const year = issuedDate.getFullYear();
  const month = String(issuedDate.getMonth() + 1).padStart(2, '0');

  let maxSeq = 0;
  const pattern = new RegExp(`^B-(\\d{4})\\/Kk\\.11\\.20\\/${kuaCode}\\/PW\\.01\\/\\d{2}\\/${year}$`);
  for (const user of existingUsers) {
    const nomor = user.progress?.nomorSertifikat;
    if (!nomor) continue;
    const match = nomor.match(pattern);
    if (match) {
      const seq = Number(match[1]);
      if (seq > maxSeq) maxSeq = seq;
    }
  }
  const nextSeq = String(maxSeq + 1).padStart(4, '0');
  return `B-${nextSeq}/Kk.11.20/${kuaCode}/PW.01/${month}/${year}`;
}

export function isIdentityLockedAfterCert(user: Pick<BimwinUser, 'progress'>): boolean {
  return Boolean(user.progress?.verifikasiFasilitator || user.progress?.nomorSertifikat);
}

export function buildAttendanceQrPayload(input: {
  classId: string;
  kua: string;
  tanggal: string;
}): string {
  const cleanClassId = input.classId.trim();
  const kuaCode = String(Math.max(1, LIST_16_KUA.indexOf(input.kua) + 1)).padStart(2, '0');
  const cleanDate = input.tanggal.replace(/[^0-9]/g, '').slice(0, 8) || '20260101';
  let hash = 0;
  const seed = `${cleanClassId}:${kuaCode}:${cleanDate}:SAMAWA`;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) % 9973;
  }
  const checksum = String(hash).padStart(4, '0');
  return `SAMAWA-ABSEN|${cleanClassId}|${kuaCode}|${cleanDate}|${checksum}`;
}

export function parseAttendanceQrPayload(
  rawText: string
): { valid: true; classId: string; kuaCode: string; dateDigits: string } | { valid: false; error: string } {
  const trimmed = String(rawText || '').trim();
  const parts = trimmed.split('|');
  if (parts.length !== 5 || parts[0] !== 'SAMAWA-ABSEN') {
    return { valid: false, error: 'Kode QR bukan format Absensi Kelas SAMAWA yang valid.' };
  }
  const [, classId, kuaCode, dateDigits, checksum] = parts;
  if (!classId || !/^\d{2}$/.test(kuaCode) || !/^\d{8}$/.test(dateDigits)) {
    return { valid: false, error: 'Struktur kode QR absensi tidak lengkap.' };
  }
  let hash = 0;
  const seed = `${classId}:${kuaCode}:${dateDigits}:SAMAWA`;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) % 9973;
  }
  if (String(hash).padStart(4, '0') !== checksum) {
    return { valid: false, error: 'Kode verifikasi QR absensi tidak cocok atau telah diubah.' };
  }
  return { valid: true, classId, kuaCode, dateDigits };
}

export interface CalendarEventSpec {
  uid: string;
  title: string;
  description: string;
  location: string;
  dateIso: string; // YYYY-MM-DD
  startHour?: number;
  startMinute?: number;
  durationMinutes?: number;
}

function escapeIcsText(val: string): string {
  return String(val || '')
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

export function buildIcsCalendarContent(event: CalendarEventSpec): string {
  const digits = event.dateIso.replace(/[^0-9]/g, '').slice(0, 8);
  const startH = String(event.startHour ?? 8).padStart(2, '0');
  const startM = String(event.startMinute ?? 0).padStart(2, '0');
  const totalEndMin = (event.startHour ?? 8) * 60 + (event.startMinute ?? 0) + (event.durationMinutes ?? 120);
  const endH = String(Math.min(23, Math.floor(totalEndMin / 60))).padStart(2, '0');
  const endM = String(totalEndMin % 60).padStart(2, '0');
  const dtStart = `${digits}T${startH}${startM}00`;
  const dtEnd = `${digits}T${endH}${endM}00`;
  const dtStamp = new Date().toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z';

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Kemenag Kabupaten Jepara//SAMAWA BIMWIN//ID',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${escapeIcsText(event.uid)}@samawa.kemenagjepara.id`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${escapeIcsText(event.title)}`,
    `DESCRIPTION:${escapeIcsText(event.description)}`,
    `LOCATION:${escapeIcsText(event.location)}`,
    'BEGIN:VALARM',
    'TRIGGER:-P1D',
    'ACTION:DISPLAY',
    'DESCRIPTION:Pengingat H-1 Jadwal SAMAWA Kemenag Jepara',
    'END:VALARM',
    'BEGIN:VALARM',
    'TRIGGER:-PT1H',
    'ACTION:DISPLAY',
    'DESCRIPTION:Pengingat 1 Jam Sebelum Jadwal SAMAWA',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

export function downloadIcsFile(filename: string, icsContent: string): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.ics') ? filename : `${filename}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
