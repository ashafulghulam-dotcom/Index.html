import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import {
  BimwinClassSchedule,
  BimwinUser,
  ModuleDefinition,
  PejabatConfig,
} from '../types/bimwin';
import { KEMENAG_LOGO_SVG } from '../data/jeparaData';
import {
  formatIndonesianDate,
  maskNik,
  normalizeVillageName,
} from './bimwinLogic';

export type A4Orientation = 'landscape' | 'portrait';

export interface DocumentA4Spec {
  id: 'sertifikat' | 'piagam_kompak' | 'rapor_portofolio' | 'laporan_eksekutif' | 'daftar_hadir';
  label: string;
  orientation: A4Orientation;
  widthMm: number;
  heightMm: number;
}

export const DOCUMENT_A4_SPECS: Record<DocumentA4Spec['id'], DocumentA4Spec> = {
  sertifikat: {
    id: 'sertifikat',
    label: 'Sertifikat Bimwin Mandiri (A4 Horizontal)',
    orientation: 'landscape',
    widthMm: 297,
    heightMm: 210,
  },
  piagam_kompak: {
    id: 'piagam_kompak',
    label: 'Piagam Komitmen Kami Kompak (A4 Vertikal)',
    orientation: 'portrait',
    widthMm: 210,
    heightMm: 297,
  },
  rapor_portofolio: {
    id: 'rapor_portofolio',
    label: 'Rapor Portofolio Catin (A4 Vertikal)',
    orientation: 'portrait',
    widthMm: 210,
    heightMm: 297,
  },
  laporan_eksekutif: {
    id: 'laporan_eksekutif',
    label: 'Laporan Eksekutif Bimwin (A4 Vertikal)',
    orientation: 'portrait',
    widthMm: 210,
    heightMm: 297,
  },
  daftar_hadir: {
    id: 'daftar_hadir',
    label: 'Daftar Hadir Kelas Bimwin (A4 Vertikal)',
    orientation: 'portrait',
    widthMm: 210,
    heightMm: 297,
  },
};

export interface ExecutiveReportRow {
  unit: string;
  peserta: number;
  lulus: number;
  rate: number;
}

export interface ExecutiveReportData {
  reportCode: string;
  scopeLabel: string;
  unitColumnLabel: string;
  printedDate: string;
  kpis: {
    total: number;
    couples: number;
    verified: number;
    riskGizi: number;
    underage: number;
    avgIkm: string;
    avgPre: number;
    avgPost: number;
  };
  rows: ExecutiveReportRow[];
  educationSummary: Array<{ name: string; value: number }>;
  pejabat: PejabatConfig;
}

export function buildExecutiveReportRows(
  items: Array<{ name: string; Peserta: number; Lulus: number }>
): ExecutiveReportRow[] {
  return items.map((item) => {
    const peserta = item.Peserta;
    const lulus = item.Lulus;
    const rate = peserta > 0 ? Math.round((lulus / peserta) * 100) : 0;
    return {
      unit: item.name,
      peserta,
      lulus,
      rate,
    };
  });
}

export function sanitizeFilenameSegment(raw: string): string {
  return raw
    .trim()
    .replace(/[^a-zA-Z0-9_-]+/g, '_')
    .replace(/^_+|_+$/g, '') || 'dokumen';
}

/**
 * Triggers browser print dialog with exact A4 orientation (@page size: A4 landscape|portrait)
 * and marks body so only the active A4 print sheet is rendered on paper.
 */
export function printA4Document(orientation: A4Orientation): void {
  const styleId = 'bimwin-dynamic-page-style';
  let styleEl = document.getElementById(styleId) as HTMLStyleElement | null;
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = styleId;
    document.head.appendChild(styleEl);
  }
  styleEl.textContent = `@media print { @page { size: A4 ${orientation}; margin: 0; } }`;
  document.body.classList.add('bimwin-printing-sheet');

  const cleanup = () => {
    document.body.classList.remove('bimwin-printing-sheet');
    window.removeEventListener('afterprint', cleanup);
  };
  window.addEventListener('afterprint', cleanup);

  window.setTimeout(() => {
    window.print();
    window.setTimeout(cleanup, 1200);
  }, 60);
}

interface RasterImageAsset {
  dataUrl: string;
  width: number;
  height: number;
}

const SAMAWA_LOGO_PATH = '/assets/aistudio/SAMAWA_transparent_HD_ac107033.png';

async function loadImageAsPngDataUrl(src: string, targetHeight = 220): Promise<RasterImageAsset | null> {
  if (typeof window === 'undefined') return null;
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const natW = img.naturalWidth || 220;
        const natH = img.naturalHeight || 220;
        const ratio = natW / natH;
        const canvas = document.createElement('canvas');
        canvas.height = targetHeight;
        canvas.width = Math.max(1, Math.round(targetHeight * ratio));
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(null);
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve({
          dataUrl: canvas.toDataURL('image/png'),
          width: canvas.width,
          height: canvas.height,
        });
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

async function generateQrPng(value: string, sizePx = 280): Promise<string | null> {
  try {
    return await QRCode.toDataURL(value || 'BIMWIN-KEMENAG-JEPARA', {
      width: sizePx,
      margin: 1,
      color: { dark: '#094232', light: '#FFFFFF' },
    });
  } catch {
    return null;
  }
}

function drawHeaderLogos(
  doc: jsPDF,
  kemenagImg: RasterImageAsset | null,
  samawaImg: RasterImageAsset | null,
  x: number,
  y: number,
  kemenagSizeMm: number,
  samawaHeightMm: number,
  rightEdgeX?: number
) {
  if (kemenagImg) {
    doc.addImage(kemenagImg.dataUrl, 'PNG', x, y, kemenagSizeMm, kemenagSizeMm);
  }
  if (samawaImg && rightEdgeX !== undefined) {
    const samawaW = (samawaImg.width / samawaImg.height) * samawaHeightMm;
    doc.addImage(samawaImg.dataUrl, 'PNG', rightEdgeX - samawaW, y + 1, samawaW, samawaHeightMm);
  }
}

/**
 * 1. SERTIFIKAT BIMWIN MANDIRI — A4 HORIZONTAL (297mm × 210mm) SIAP CETAK
 */
export async function downloadCertificatePdfA4(
  user: BimwinUser,
  pejabat: PejabatConfig
): Promise<void> {
  const spec = DOCUMENT_A4_SPECS.sertifikat;
  const certCode = user.progress?.nomorSertifikat || 'JPR-PREVIEW-2026';
  const doc = new jsPDF({
    orientation: spec.orientation,
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const [kemenagImg, samawaImg, qrPng] = await Promise.all([
    loadImageAsPngDataUrl(KEMENAG_LOGO_SVG, 240),
    loadImageAsPngDataUrl(SAMAWA_LOGO_PATH, 160),
    generateQrPng(certCode, 300),
  ]);

  const W = spec.widthMm; // 297
  const H = spec.heightMm; // 210

  // Crisp white sheet background
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, W, H, 'F');

  // Outer institutional double emerald-gold frame
  doc.setDrawColor(15, 104, 78);
  doc.setLineWidth(1.4);
  doc.rect(10, 10, W - 20, H - 20);

  doc.setDrawColor(198, 146, 20);
  doc.setLineWidth(0.55);
  doc.rect(13.2, 13.2, W - 26.4, H - 26.4);

  // Subtle corner ornaments (gold L-brackets)
  doc.setDrawColor(15, 104, 78);
  doc.setLineWidth(0.9);
  const cLen = 7;
  // Top-left
  doc.line(15.5, 15.5, 15.5 + cLen, 15.5);
  doc.line(15.5, 15.5, 15.5, 15.5 + cLen);
  // Top-right
  doc.line(W - 15.5 - cLen, 15.5, W - 15.5, 15.5);
  doc.line(W - 15.5, 15.5, W - 15.5, 15.5 + cLen);
  // Bottom-left
  doc.line(15.5, H - 15.5, 15.5 + cLen, H - 15.5);
  doc.line(15.5, H - 15.5 - cLen, 15.5, H - 15.5);
  // Bottom-right
  doc.line(W - 15.5 - cLen, H - 15.5, W - 15.5, H - 15.5);
  doc.line(W - 15.5, H - 15.5 - cLen, W - 15.5, H - 15.5);

  // Header band
  drawHeaderLogos(doc, kemenagImg, samawaImg, 21, 19, 18, 8.5, W - 21);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 104, 78);
  doc.text('KEMENTERIAN AGAMA REPUBLIK INDONESIA', 43, 24.5);

  doc.setFont('times', 'bold');
  doc.setFontSize(17.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Kantor Kementerian Agama Kabupaten Jepara', 43, 31.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.8);
  doc.setTextColor(71, 85, 105);
  doc.text(
    `Unit Penyelenggara: ${user.kua} · Desa ${normalizeVillageName(user.desaTempatNikah, user.kua)}`,
    43,
    36.8
  );

  // Registration code under SAMAWA logo on right
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('NOMOR SERTIFIKAT', W - 21, 32.5, { align: 'right' });
  doc.setFont('courier', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 104, 78);
  doc.text(certCode, W - 21, 37.2, { align: 'right' });

  // Gold horizontal divider
  doc.setDrawColor(198, 146, 20);
  doc.setLineWidth(0.75);
  doc.line(21, 42.5, W - 21, 42.5);

  // Center certificate body
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(180, 125, 14);
  doc.text('SERTIFIKAT BIMBINGAN PERKAWINAN MANDIRI', W / 2, 56, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  doc.text('Diberikan kepada Calon Pengantin:', W / 2, 65, { align: 'center' });

  doc.setFont('times', 'bold');
  doc.setFontSize(28);
  doc.setTextColor(9, 66, 50);
  doc.text(user.nama, W / 2, 79, { align: 'center' });

  // Accent line under recipient name
  doc.setDrawColor(198, 146, 20);
  doc.setLineWidth(0.45);
  doc.line(W / 2 - 64, 83.5, W / 2 + 64, 83.5);

  doc.setFont('courier', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(71, 85, 105);
  doc.text(
    `NIK: ${maskNik(user.nik)}   ·   TTL: ${user.ttl || '-'}   ·   Pasangan: ${user.pasanganNama || '-'}`,
    W / 2,
    91,
    { align: 'center' }
  );

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10.5);
  doc.setTextColor(51, 65, 85);
  const statement = `Telah menyelesaikan seluruh rangkaian Bimbingan Perkawinan Mandiri (MOOC 5 Modul Keluarga Sakinah, Pretest, Postest, Survei IKM, serta Sesi Bimbingan ${user.progress?.kehadiranKelas || 'KUA'}) dengan predikat LULUS & TERVERIFIKASI.`;
  const wrappedStatement = doc.splitTextToSize(statement, 215);
  doc.text(wrappedStatement, W / 2, 103, { align: 'center', lineHeightFactor: 1.5 });

  // Subtle horizontal divider above footer row
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(21, 130, W - 21, 130);

  // Left: QR Verification Block
  if (qrPng) {
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.35);
    doc.roundedRect(21, 138, 28, 28, 2, 2);
    doc.addImage(qrPng, 'PNG', 22.5, 139.5, 25, 25);
  }
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('Terverifikasi Digital', 53, 146);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  const qrNote = doc.splitTextToSize(
    'Pindai QR atau masukkan kode registrasi pada portal verifikasi resmi Kemenag Kabupaten Jepara.',
    52
  );
  doc.text(qrNote, 53, 151.5, { lineHeightFactor: 1.4 });

  // Center: Evaluation Summary Box
  doc.setFillColor(248, 250, 249);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.35);
  doc.roundedRect(108, 138, 70, 30, 2.5, 2.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.2);
  doc.setTextColor(15, 104, 78);
  doc.text('CAPAIAN EVALUASI BIMWIN', 143, 145.5, { align: 'center' });

  doc.setFont('courier', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text(
    `Pretest ${user.progress?.pretestScore ?? 0} -> Postest ${user.progress?.postestScore ?? 0}`,
    143,
    154,
    { align: 'center' }
  );

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.6);
  doc.setTextColor(100, 116, 139);
  const fasText = doc.splitTextToSize(
    `Fasilitator: ${user.progress?.verifikasiOleh || `Fasilitator ${user.kua}`}`,
    64
  );
  doc.text(fasText[0] || '', 143, 162, { align: 'center' });

  // Right: Pejabat Signature Block
  const sigX = W - 22;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.8);
  doc.setTextColor(51, 65, 85);
  doc.text(
    `Jepara, ${user.progress?.tanggalTerbitSertifikat || formatIndonesianDate()}`,
    sigX,
    142,
    { align: 'right' }
  );

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 104, 78);
  const jabatanLines = doc.splitTextToSize(pejabat.jabatan, 82);
  doc.text(jabatanLines, sigX, 147.2, { align: 'right', lineHeightFactor: 1.3 });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(pejabat.nama, sigX, 174, { align: 'right' });

  const nameWidth = doc.getTextWidth(pejabat.nama);
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.35);
  doc.line(sigX - nameWidth, 175.2, sigX, 175.2);

  doc.setFont('courier', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(pejabat.nip, sigX, 180.5, { align: 'right' });

  doc.save(`Sertifikat-Bimwin-${sanitizeFilenameSegment(certCode)}-A4-Horizontal.pdf`);
}

/**
 * 2. PIAGAM KOMITMEN "KAMI KOMPAK" — A4 VERTIKAL (210mm × 297mm) SIAP CETAK
 */
export async function downloadPiagamKompakPdfA4(user: BimwinUser): Promise<void> {
  const spec = DOCUMENT_A4_SPECS.piagam_kompak;
  const code = user.kompak?.kodePiagam || 'KOMPAK-2026-0001';
  const doc = new jsPDF({
    orientation: spec.orientation,
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const [kemenagImg, samawaImg, qrPng] = await Promise.all([
    loadImageAsPngDataUrl(KEMENAG_LOGO_SVG, 240),
    loadImageAsPngDataUrl(SAMAWA_LOGO_PATH, 150),
    generateQrPng(code, 280),
  ]);

  const W = spec.widthMm; // 210
  const H = spec.heightMm; // 297

  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, W, H, 'F');

  // Double ceremonial gold + emerald border
  doc.setDrawColor(198, 146, 20);
  doc.setLineWidth(1.4);
  doc.rect(11, 11, W - 22, H - 22);

  doc.setDrawColor(15, 104, 78);
  doc.setLineWidth(0.55);
  doc.rect(14.5, 14.5, W - 29, H - 29);

  // Top emblems
  if (kemenagImg) {
    doc.addImage(kemenagImg.dataUrl, 'PNG', W / 2 - 9, 21, 18, 18);
  }
  if (samawaImg) {
    const sh = 6.5;
    const sw = (samawaImg.width / samawaImg.height) * sh;
    doc.addImage(samawaImg.dataUrl, 'PNG', W - 21 - sw, 22, sw, sh);
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 104, 78);
  doc.text('BIMBINGAN PERKAWINAN KEMENTERIAN AGAMA KABUPATEN JEPARA', W / 2, 46, {
    align: 'center',
  });

  doc.setFont('times', 'bold');
  doc.setFontSize(21);
  doc.setTextColor(15, 23, 42);
  doc.text('PIAGAM KOMITMEN "KAMI KOMPAK"', W / 2, 56, { align: 'center' });

  doc.setFont('courier', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`No. Registrasi: ${code}`, W / 2, 62.5, { align: 'center' });

  doc.setDrawColor(198, 146, 20);
  doc.setLineWidth(0.6);
  doc.line(24, 67.5, W - 24, 67.5);

  // Couple identification
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Kami pasangan calon pengantin yang berikrar untuk membangun keluarga sakinah:', W / 2, 76.5, {
    align: 'center',
  });

  doc.setFont('times', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(9, 66, 50);
  doc.text(`${user.nama}  &  ${user.pasanganNama || 'Pasangan'}`, W / 2, 86.5, {
    align: 'center',
  });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 104, 78);
  doc.text(
    `${user.kua} · Desa ${normalizeVillageName(user.desaTempatNikah, user.kua)}, Kabupaten Jepara`,
    W / 2,
    93.5,
    { align: 'center' }
  );

  // 3 Commitment Boxes
  const commitments = [
    {
      title: '1. Komitmen Kesalingan Peran & Kesehatan Keluarga',
      body:
        user.kompak?.peranKeluarga ||
        'Saling berbagi peran domestik, menjaga kesehatan keluarga, dan mencegah stunting sejak masa pra-nikah.',
    },
    {
      title: '2. Komitmen Moderasi Beragama & Pendidikan Karakter Anak',
      body:
        user.kompak?.pendidikanKarakter ||
        'Menanamkan nilai keagamaan yang ramah, moderat, toleran, serta keteladanan akhlak mulia dalam keluarga.',
    },
    {
      title: '3. Komitmen Pengasuhan & Disiplin Positif Tanpa Kekerasan',
      body:
        user.kompak?.disiplinPositif ||
        'Menerapkan komunikasi penuh kasih sayang, musyawarah, serta pengasuhan positif bebas kekerasan.',
    },
  ];

  let cursorY = 100;
  const boxX = 22;
  const boxW = W - 44;

  commitments.forEach((item) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.3);
    const bodyLines = doc.splitTextToSize(item.body, boxW - 14);
    const bodyHeight = bodyLines.length * 4.8;
    const boxH = Math.max(26, 13.5 + bodyHeight + 4.5);

    doc.setFillColor(248, 250, 249);
    doc.setDrawColor(216, 227, 222);
    doc.setLineWidth(0.4);
    doc.roundedRect(boxX, cursorY, boxW, boxH, 3, 3, 'FD');

    // Emerald left accent stripe
    doc.setFillColor(15, 104, 78);
    doc.rect(boxX, cursorY + 3, 1.5, boxH - 6, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.6);
    doc.setTextColor(15, 104, 78);
    doc.text(item.title, boxX + 7, cursorY + 8.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.3);
    doc.setTextColor(51, 65, 85);
    doc.text(bodyLines, boxX + 7, cursorY + 14.8, { lineHeightFactor: 1.4 });

    cursorY += boxH + 5.5;
  });

  // Closing pledge line with guaranteed clearance above signature block
  const pledgeY = Math.min(cursorY + 5, 225);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8.6);
  doc.setTextColor(71, 85, 105);
  doc.text(
    'Piagam komitmen ini disusun secara sadar dan bersama-sama sebagai pegangan kehidupan rumah tangga.',
    W / 2,
    pledgeY,
    { align: 'center' }
  );

  // Subtle divider above signatures
  const sigTopY = Math.max(pledgeY + 10, 236);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.35);
  doc.line(22, sigTopY - 5, W - 22, sigTopY - 5);
  const leftColX = 48;
  const midColX = W / 2;
  const rightColX = W - 48;

  // Mempelai I
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text('Calon Mempelai I', leftColX, sigTopY + 5, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(user.nama, leftColX, sigTopY + 31, { align: 'center' });
  const w1 = doc.getTextWidth(user.nama);
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.35);
  doc.line(leftColX - w1 / 2, sigTopY + 32.3, leftColX + w1 / 2, sigTopY + 32.3);

  // Center QR
  if (qrPng) {
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(midColX - 13, sigTopY + 1, 26, 26, 2, 2);
    doc.addImage(qrPng, 'PNG', midColX - 11.5, sigTopY + 2.5, 23, 23);
  }
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Validasi QR Resmi', midColX, sigTopY + 32, { align: 'center' });

  // Mempelai II
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(`Jepara, ${formatIndonesianDate()}`, rightColX, sigTopY, { align: 'center' });
  doc.text('Calon Mempelai II', rightColX, sigTopY + 5, { align: 'center' });

  const partnerName = user.pasanganNama || 'Pasangan';
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(partnerName, rightColX, sigTopY + 31, { align: 'center' });
  const w2 = doc.getTextWidth(partnerName);
  doc.setDrawColor(15, 23, 42);
  doc.line(rightColX - w2 / 2, sigTopY + 32.3, rightColX + w2 / 2, sigTopY + 32.3);

  doc.save(`Piagam-Komitmen-Kami-Kompak-${sanitizeFilenameSegment(code)}-A4.pdf`);
}

/**
 * 3. RAPOR PORTOFOLIO CALON PENGANTIN — A4 VERTIKAL (210mm × 297mm) SIAP CETAK
 */
export async function downloadPortfolioPdfA4(
  user: BimwinUser,
  modules: ModuleDefinition[]
): Promise<void> {
  const spec = DOCUMENT_A4_SPECS.rapor_portofolio;
  const qrValue = user.progress?.nomorSertifikat || user.username;
  const pre = user.progress?.pretestScore ?? 0;
  const post = user.progress?.postestScore ?? 0;
  const gain = post - pre;

  const doc = new jsPDF({
    orientation: spec.orientation,
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const [kemenagImg, samawaImg, qrPng] = await Promise.all([
    loadImageAsPngDataUrl(KEMENAG_LOGO_SVG, 220),
    loadImageAsPngDataUrl(SAMAWA_LOGO_PATH, 140),
    generateQrPng(qrValue, 260),
  ]);

  const W = spec.widthMm; // 210
  const H = spec.heightMm; // 297

  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, W, H, 'F');

  // Kop Surat Header
  if (kemenagImg) doc.addImage(kemenagImg.dataUrl, 'PNG', 16, 14, 15, 15);
  if (samawaImg) {
    const sh = 5.6;
    const sw = (samawaImg.width / samawaImg.height) * sh;
    doc.addImage(samawaImg.dataUrl, 'PNG', W - 16 - sw, 14, sw, sh);
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.2);
  doc.setTextColor(15, 104, 78);
  doc.text('KEMENTERIAN AGAMA KABUPATEN JEPARA · SEKSI BIMAS ISLAM', 35, 18.5);

  doc.setFont('times', 'bold');
  doc.setFontSize(13.2);
  doc.setTextColor(15, 23, 42);
  doc.text('RAPOR PORTOFOLIO KESIAPAN CALON PENGANTIN', 35, 24.8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`Dicetak pada: ${formatIndonesianDate()} · Referensi: ${qrValue}`, 35, 29.8);

  doc.setDrawColor(15, 104, 78);
  doc.setLineWidth(0.8);
  doc.line(16, 33.5, W - 16, 33.5);

  // Identity Card + QR
  doc.setFillColor(248, 250, 249);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.35);
  doc.roundedRect(16, 37.5, W - 32, 31, 2.5, 2.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text(user.nama, 21, 45);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.6);
  doc.setTextColor(51, 65, 85);
  doc.text(`NIK: ${maskNik(user.nik)}   |   TTL: ${user.ttl || '-'}`, 21, 51);
  doc.text(
    `Unit KUA: ${user.kua} · Desa ${normalizeVillageName(user.desaTempatNikah, user.kua)}`,
    21,
    56.5
  );
  doc.text(
    `Pasangan Tersinkron: ${user.pasanganNama || '-'}   |   No. Sertifikat: ${user.progress?.nomorSertifikat || 'Proses Verifikasi'}`,
    21,
    62
  );

  if (qrPng) {
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(W - 42, 41, 23, 23, 1.5, 1.5, 'FD');
    doc.addImage(qrPng, 'PNG', W - 40.8, 42.2, 20.6, 20.6);
  }

  // 3 KPI Boxes
  const kpiY = 73.5;
  const kpiW = (W - 32 - 8) / 3;
  const kpiBoxes = [
    { label: 'SKOR PRETEST', val: String(pre), color: [30, 41, 59] as [number, number, number] },
    { label: 'SKOR POSTEST', val: String(post), color: [15, 104, 78] as [number, number, number] },
    {
      label: 'PENINGKATAN (GAIN)',
      val: gain >= 0 ? `+${gain}` : String(gain),
      color: [180, 125, 14] as [number, number, number],
    },
  ];
  kpiBoxes.forEach((box, idx) => {
    const bx = 16 + idx * (kpiW + 4);
    doc.setFillColor(248, 250, 249);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(bx, kpiY, kpiW, 18.5, 2, 2, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.2);
    doc.setTextColor(100, 116, 139);
    doc.text(box.label, bx + kpiW / 2, kpiY + 6, { align: 'center' });
    doc.setFont('courier', 'bold');
    doc.setFontSize(14.5);
    doc.setTextColor(...box.color);
    doc.text(box.val, bx + kpiW / 2, kpiY + 14.5, { align: 'center' });
  });

  // Curriculum Table (auto-wrapped module titles so text never collides with score column)
  let y = 99;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.2);
  doc.setTextColor(15, 104, 78);
  doc.text('A. CAPAIAN KURIKULUM 5 MODUL KELUARGA SAKINAH', 16, y);
  y += 3.5;
  const tableStartY = y;

  // Table header
  doc.setFillColor(15, 104, 78);
  doc.rect(16, y, W - 32, 7.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.2);
  doc.setTextColor(255, 255, 255);
  doc.text('No', 19, y + 5.1);
  doc.text('Modul Kurikulum', 28, y + 5.1);
  doc.text('Nilai Kuis', W - 44, y + 5.1, { align: 'right' });
  doc.text('Status', W - 19, y + 5.1, { align: 'right' });
  y += 7.5;

  modules.forEach((m, i) => {
    const score = user.progress?.moduleScores[m.id] ?? 0;
    const passed = user.progress?.modulesCompleted.includes(m.id);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.2);
    const wrappedTitle = doc.splitTextToSize(m.judul, 114);
    const rowH = Math.max(8, wrappedTitle.length * 4.1 + 3.4);

    if (i % 2 === 1) {
      doc.setFillColor(248, 250, 249);
      doc.rect(16, y, W - 32, rowH, 'F');
    }
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.25);
    doc.line(16, y + rowH, W - 16, y + rowH);

    doc.setFont('courier', 'normal');
    doc.setFontSize(8.2);
    doc.setTextColor(71, 85, 105);
    doc.text(String(i + 1), 19, y + 5);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(wrappedTitle, 28, y + 5, { lineHeightFactor: 1.3 });

    doc.setFont('courier', 'bold');
    doc.text(String(score), W - 44, y + 5, { align: 'right' });

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(passed ? 15 : 180, passed ? 104 : 83, passed ? 78 : 9);
    doc.text(passed ? 'Tuntas' : 'Belum', W - 19, y + 5, { align: 'right' });
    y += rowH;
  });

  // Outer border for table
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.35);
  doc.rect(16, tableStartY, W - 32, y - tableStartY);

  // Section B: Stunting & Facilitator Notes
  y += 7.5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.2);
  doc.setTextColor(15, 104, 78);
  doc.text('B. SKRINING KESIAPAN GIZI & CATATAN FASILITATOR', 16, y);
  y += 3.5;

  const colW = (W - 32 - 5) / 2;
  doc.setFillColor(248, 250, 249);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(16, y, colW, 29, 2, 2, 'FD');
  doc.roundedRect(16 + colW + 5, y, colW, 29, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Skrining Kesiapan Gizi & Stunting', 20, y + 6.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.2);
  doc.setTextColor(71, 85, 105);
  const giziText = user.stunting
    ? `Status: ${user.stunting.status}\nIMT: ${user.stunting.imt} · LiLA: ${user.stunting.lilaCm} cm · Hb: ${user.stunting.hbGdL} g/dL`
    : 'Belum melakukan skrining gizi mandiri.';
  doc.text(doc.splitTextToSize(giziText, colW - 8), 20, y + 12.2, { lineHeightFactor: 1.4 });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Catatan Fasilitator KUA', 20 + colW + 5, y + 6.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.2);
  doc.setTextColor(71, 85, 105);
  const noteText =
    user.progress?.catatanFasilitator ||
    'Terverifikasi memenuhi kompetensi dasar Bimbingan Perkawinan Mandiri Kemenag Jepara.';
  doc.text(doc.splitTextToSize(noteText, colW - 8), 20 + colW + 5, y + 12.2, {
    lineHeightFactor: 1.4,
  });

  // Section C: Ringkasan Komitmen Kami Kompak (dynamically sized, never truncated)
  y += 35.5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.2);
  doc.setTextColor(15, 104, 78);
  doc.text('C. RINGKASAN PIAGAM KOMITMEN "KAMI KOMPAK"', 16, y);
  y += 3.5;

  const kompakItems = [
    { bold: true, text: `Nomor Piagam: ${user.kompak?.kodePiagam || 'Belum disusun'}` },
    { bold: false, text: `1. Peran & Kesehatan: ${user.kompak?.peranKeluarga || '-'}` },
    { bold: false, text: `2. Karakter & Moderasi: ${user.kompak?.pendidikanKarakter || '-'}` },
    { bold: false, text: `3. Pengasuhan Positif: ${user.kompak?.disiplinPositif || '-'}` },
  ];

  doc.setFontSize(8);
  const preparedKompak = kompakItems.map((item) => {
    doc.setFont('helvetica', item.bold ? 'bold' : 'normal');
    return {
      bold: item.bold,
      lines: doc.splitTextToSize(item.text, W - 40),
    };
  });

  const totalKompakHeight =
    preparedKompak.reduce((sum, item) => sum + item.lines.length * 3.9 + 2.6, 0) + 6;
  const maxBoxH = Math.min(totalKompakHeight, H - 25 - y);

  doc.setFillColor(248, 250, 249);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(16, y, W - 32, Math.max(32, maxBoxH), 2, 2, 'FD');

  let ky = y + 6.2;
  preparedKompak.forEach((item) => {
    doc.setFont('helvetica', item.bold ? 'bold' : 'normal');
    doc.setFontSize(8);
    doc.setTextColor(item.bold ? 15 : 51, item.bold ? 23 : 65, item.bold ? 42 : 85);
    doc.text(item.lines, 20, ky, { lineHeightFactor: 1.35 });
    ky += item.lines.length * 3.9 + 2.6;
  });

  // Verification Footer
  doc.setDrawColor(226, 232, 240);
  doc.line(16, H - 22, W - 16, H - 22);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(
    'Dokumen Rapor Portofolio ini diterbitkan otomatis oleh Sistem SAMAWA — Bimbingan Perkawinan Mandiri Kemenag Kabupaten Jepara.',
    16,
    H - 16
  );
  doc.text(
    `Verifikator: ${user.progress?.verifikasiOleh || `Fasilitator ${user.kua}`}`,
    W - 16,
    H - 11,
    { align: 'right' }
  );

  doc.save(`Rapor-Portofolio-Catin-${sanitizeFilenameSegment(user.username)}-A4.pdf`);
}

/**
 * 4. LAPORAN EKSEKUTIF BIMWIN — A4 VERTIKAL (210mm × 297mm) SIAP CETAK
 */
export async function downloadExecutiveReportPdfA4(report: ExecutiveReportData): Promise<void> {
  const spec = DOCUMENT_A4_SPECS.laporan_eksekutif;
  const doc = new jsPDF({
    orientation: spec.orientation,
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const [kemenagImg, samawaImg, qrPng] = await Promise.all([
    loadImageAsPngDataUrl(KEMENAG_LOGO_SVG, 220),
    loadImageAsPngDataUrl(SAMAWA_LOGO_PATH, 140),
    generateQrPng(report.reportCode, 260),
  ]);

  const W = spec.widthMm; // 210
  const H = spec.heightMm; // 297

  const drawPageFrame = () => {
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, W, H, 'F');
  };

  drawPageFrame();

  // Official Kop Surat
  if (kemenagImg) doc.addImage(kemenagImg.dataUrl, 'PNG', 16, 13, 16, 16);
  if (samawaImg) {
    const sh = 6.2;
    const sw = (samawaImg.width / samawaImg.height) * sh;
    doc.addImage(samawaImg.dataUrl, 'PNG', W - 16 - sw, 14, sw, sh);
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 104, 78);
  doc.text('KEMENTERIAN AGAMA REPUBLIK INDONESIA · KABUPATEN JEPARA', 36, 18);

  doc.setFont('times', 'bold');
  doc.setFontSize(15.5);
  doc.setTextColor(15, 23, 42);
  doc.text('LAPORAN EKSEKUTIF BIMBINGAN PERKAWINAN', 36, 24.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.2);
  doc.setTextColor(71, 85, 105);
  doc.text(
    `Cakupan: ${report.scopeLabel} · Kode Laporan: ${report.reportCode} · Tanggal: ${report.printedDate}`,
    36,
    29.5
  );

  doc.setDrawColor(15, 104, 78);
  doc.setLineWidth(0.9);
  doc.line(16, 33, W - 16, 33);
  doc.setDrawColor(198, 146, 20);
  doc.setLineWidth(0.35);
  doc.line(16, 34.4, W - 16, 34.4);

  // 5 KPI Summary Strip
  const kpiY = 39;
  const kpiCount = 5;
  const gap = 3;
  const boxW = (W - 32 - gap * (kpiCount - 1)) / kpiCount;
  const passRate = report.kpis.total
    ? Math.round((report.kpis.verified / report.kpis.total) * 100)
    : 0;
  const kpiList = [
    { label: 'TOTAL PESERTA', val: String(report.kpis.total), sub: `${report.kpis.couples} pasangan` },
    { label: 'SERTIFIKAT', val: String(report.kpis.verified), sub: `${passRate}% lulus` },
    {
      label: 'BEFORE -> AFTER',
      val: `${report.kpis.avgPre}->${report.kpis.avgPost}`,
      sub: `Gain +${Math.max(0, report.kpis.avgPost - report.kpis.avgPre)}`,
    },
    {
      label: 'RISIKO GIZI / <19',
      val: `${report.kpis.riskGizi} / ${report.kpis.underage}`,
      sub: 'Atensi KUA',
    },
    { label: 'RATA-RATA IKM', val: `${report.kpis.avgIkm}/5`, sub: 'Kepuasan' },
  ];

  kpiList.forEach((k, idx) => {
    const bx = 16 + idx * (boxW + gap);
    doc.setFillColor(248, 250, 249);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.35);
    doc.roundedRect(bx, kpiY, boxW, 20, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.4);
    doc.setTextColor(100, 116, 139);
    doc.text(k.label, bx + boxW / 2, kpiY + 5.5, { align: 'center' });

    doc.setFont('courier', 'bold');
    doc.setFontSize(11.5);
    doc.setTextColor(15, 104, 78);
    doc.text(k.val, bx + boxW / 2, kpiY + 12.5, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.6);
    doc.setTextColor(100, 116, 139);
    doc.text(k.sub, bx + boxW / 2, kpiY + 17.5, { align: 'center' });
  });

  // Table Section
  let y = 66;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 104, 78);
  doc.text(`REKAPITULASI CAPAIAN PER ${report.unitColumnLabel.toUpperCase()}`, 16, y);
  y += 3.5;

  const drawTableHeader = (startY: number) => {
    doc.setFillColor(15, 104, 78);
    doc.rect(16, startY, W - 32, 7.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.2);
    doc.setTextColor(255, 255, 255);
    doc.text('No', 19, startY + 5.1);
    doc.text(report.unitColumnLabel, 29, startY + 5.1);
    doc.text('Peserta', 120, startY + 5.1, { align: 'right' });
    doc.text('Lulus / Sertifikat', 156, startY + 5.1, { align: 'right' });
    doc.text('Capaian (%)', W - 19, startY + 5.1, { align: 'right' });
    return startY + 7.5;
  };

  y = drawTableHeader(y);

  report.rows.forEach((row, idx) => {
    if (y > H - 62) {
      doc.addPage('a4', 'portrait');
      drawPageFrame();
      y = 18;
      y = drawTableHeader(y);
    }

    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 249);
      doc.rect(16, y, W - 32, 7.2, 'F');
    }
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.2);
    doc.line(16, y + 7.2, W - 16, y + 7.2);

    doc.setFont('courier', 'normal');
    doc.setFontSize(8.2);
    doc.setTextColor(100, 116, 139);
    doc.text(String(idx + 1), 19, y + 4.9);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(row.unit, 29, y + 4.9);

    doc.setFont('courier', 'bold');
    doc.text(String(row.peserta), 120, y + 4.9, { align: 'right' });
    doc.text(String(row.lulus), 156, y + 4.9, { align: 'right' });

    const rateColor: [number, number, number] =
      row.rate >= 80 ? [15, 104, 78] : row.rate >= 50 ? [180, 125, 14] : [185, 28, 28];
    doc.setTextColor(...rateColor);
    doc.text(`${row.rate}%`, W - 19, y + 4.9, { align: 'right' });
    y += 7.2;
  });

  // Education breakdown line
  if (report.educationSummary.length > 0) {
    y += 6;
    if (y > H - 56) {
      doc.addPage('a4', 'portrait');
      drawPageFrame();
      y = 20;
    }
    doc.setFillColor(248, 250, 249);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(16, y, W - 32, 14, 2, 2, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 104, 78);
    doc.text('DEMOGRAFI PENDIDIKAN PESERTA', 20, y + 5.5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.2);
    doc.setTextColor(51, 65, 85);
    const eduLine = report.educationSummary.map((e) => `${e.name}: ${e.value}`).join('  ·  ');
    doc.text(doc.splitTextToSize(eduLine, W - 40)[0] || '-', 20, y + 10.8);
    y += 18;
  }

  // Signature + QR Footer (ensure room)
  if (y > H - 50) {
    doc.addPage('a4', 'portrait');
    drawPageFrame();
    y = 24;
  }
  const sigY = Math.max(y + 6, H - 52);

  if (qrPng) {
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(16, sigY + 2, 24, 24, 1.5, 1.5);
    doc.addImage(qrPng, 'PNG', 17.2, sigY + 3.2, 21.6, 21.6);
  }
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.2);
  doc.setTextColor(15, 23, 42);
  doc.text('Validasi Laporan Digital', 44, sigY + 9);
  doc.setFont('courier', 'bold');
  doc.setFontSize(8.2);
  doc.setTextColor(15, 104, 78);
  doc.text(report.reportCode, 44, sigY + 14.2);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Cek keabsahan melalui Portal Verifikasi Kemenag Jepara.', 44, sigY + 19.2);

  const rightX = W - 18;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.8);
  doc.setTextColor(51, 65, 85);
  doc.text(`Jepara, ${report.printedDate}`, rightX, sigY + 4, { align: 'right' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 104, 78);
  doc.text(report.pejabat.jabatan, rightX, sigY + 9.2, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text(report.pejabat.nama, rightX, sigY + 31, { align: 'right' });
  const pw = doc.getTextWidth(report.pejabat.nama);
  doc.setDrawColor(15, 23, 42);
  doc.line(rightX - pw, sigY + 32.2, rightX, sigY + 32.2);
  doc.setFont('courier', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(report.pejabat.nip, rightX, sigY + 37, { align: 'right' });

  doc.save(`Laporan-Eksekutif-Bimwin-${sanitizeFilenameSegment(report.scopeLabel)}-A4.pdf`);
}

/**
 * 5. DAFTAR HADIR KELAS — A4 VERTIKAL (210mm × 297mm) SIAP CETAK
 */
export async function downloadAttendancePdfA4(schedule: BimwinClassSchedule): Promise<void> {
  const spec = DOCUMENT_A4_SPECS.daftar_hadir;
  const doc = new jsPDF({
    orientation: spec.orientation,
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const [kemenagImg, qrPng] = await Promise.all([
    loadImageAsPngDataUrl(KEMENAG_LOGO_SVG, 220),
    generateQrPng(schedule.kodeAbsen, 240),
  ]);

  const W = spec.widthMm;
  const H = spec.heightMm;

  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, W, H, 'F');

  if (kemenagImg) doc.addImage(kemenagImg.dataUrl, 'PNG', 16, 14, 15, 15);
  if (qrPng) {
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(W - 38, 12, 22, 22, 1.5, 1.5);
    doc.addImage(qrPng, 'PNG', W - 36.8, 13.2, 19.6, 19.6);
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 104, 78);
  doc.text(`KEMENTERIAN AGAMA KABUPATEN JEPARA · ${schedule.kua.toUpperCase()}`, 35, 18.5);

  doc.setFont('times', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(15, 23, 42);
  doc.text('DAFTAR HADIR SESI BIMBINGAN PERKAWINAN', 35, 25);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`${schedule.judul} (${schedule.kodeAbsen})`, 35, 30.5);
  doc.text(
    `${formatIndonesianDate(schedule.tanggal)} · ${schedule.waktu} · Narasumber: ${schedule.narasumber}`,
    35,
    35.5
  );

  doc.setDrawColor(15, 104, 78);
  doc.setLineWidth(0.75);
  doc.line(16, 39, W - 16, 39);

  let y = 45;
  const drawHead = (startY: number) => {
    doc.setFillColor(15, 104, 78);
    doc.rect(16, startY, W - 32, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.2);
    doc.setTextColor(255, 255, 255);
    doc.text('No', 19, startY + 5.4);
    doc.text('Nama Peserta', 28, startY + 5.4);
    doc.text('Username', 96, startY + 5.4);
    doc.text('Konfirmasi RSVP', 132, startY + 5.4);
    doc.text('Status Hadir', W - 19, startY + 5.4, { align: 'right' });
    return startY + 8;
  };
  y = drawHead(y);

  if (schedule.rsvps.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text('Belum ada peserta yang mendaftar pada sesi ini.', W / 2, y + 9, { align: 'center' });
  } else {
    schedule.rsvps.forEach((r, idx) => {
      if (y > H - 25) {
        doc.addPage('a4', 'portrait');
        doc.setFillColor(255, 255, 255);
        doc.rect(0, 0, W, H, 'F');
        y = drawHead(18);
      }
      if (idx % 2 === 1) {
        doc.setFillColor(248, 250, 249);
        doc.rect(16, y, W - 32, 8, 'F');
      }
      doc.setDrawColor(226, 232, 240);
      doc.line(16, y + 8, W - 16, y + 8);

      doc.setFont('courier', 'normal');
      doc.setFontSize(8.2);
      doc.setTextColor(71, 85, 105);
      doc.text(String(idx + 1), 19, y + 5.4);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(r.nama, 28, y + 5.4);
      doc.setFont('courier', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text(r.username, 96, y + 5.4);
      doc.setFont('helvetica', 'normal');
      doc.text(r.status, 132, y + 5.4);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(r.verifiedHadir ? 15 : 100, r.verifiedHadir ? 104 : 116, r.verifiedHadir ? 78 : 139);
      doc.text(r.verifiedHadir ? 'Terverifikasi Hadir' : 'Menunggu Presensi', W - 19, y + 5.4, {
        align: 'right',
      });
      y += 8;
    });
  }

  doc.save(`Daftar-Hadir-${sanitizeFilenameSegment(schedule.kodeAbsen)}-A4.pdf`);
}
