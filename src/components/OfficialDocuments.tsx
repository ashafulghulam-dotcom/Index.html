import React, { useEffect, useRef, useState } from 'react';
import { Download, Loader2, Printer } from 'lucide-react';
import QRCode from 'qrcode';
import {
  BimwinClassSchedule,
  BimwinUser,
  ModuleDefinition,
  PejabatConfig,
} from '../types/bimwin';
import {
  formatIndonesianDate,
  maskNik,
  normalizeVillageName,
} from '../utils/bimwinLogic';
import {
  downloadAttendancePdfA4,
  downloadCertificatePdfA4,
  downloadExecutiveReportPdfA4,
  downloadPiagamKompakPdfA4,
  downloadPortfolioPdfA4,
  ExecutiveReportData,
  printA4Document,
} from '../utils/pdfDocuments';
import { KEMENAG_LOGO_SVG } from '../data/jeparaData';
import { KemenagLogo, ModalDialog, QRCodeBox } from './UiPrimitives';

const SAMAWA_LOGO_URL = '/assets/aistudio/SAMAWA_transparent_HD_ac107033.png';

/**
 * 1. SERTIFIKAT BIMWIN MANDIRI — A4 HORIZONTAL (297mm × 210mm) SIAP CETAK
 */
export const CertificatePreviewModal: React.FC<{
  open: boolean;
  onClose: () => void;
  user: BimwinUser;
  pejabat: PejabatConfig;
}> = ({ open, onClose, user, pejabat }) => {
  const certCode = user.progress?.nomorSertifikat || 'JPR-PREVIEW-2026';
  const [downloading, setDownloading] = useState(false);

  const handleDownloadPdf = async () => {
    setDownloading(true);
    try {
      await downloadCertificatePdfA4(user, pejabat);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <ModalDialog
      open={open}
      onClose={onClose}
      title="Sertifikat Kelulusan Bimbingan Perkawinan"
      subtitle={`Format A4 Horizontal (297 × 210 mm) · Nomor Registrasi: ${certCode}`}
      maxWidth="5xl"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 text-xs font-semibold"
          >
            Tutup
          </button>
          <button
            type="button"
            onClick={() => printA4Document('landscape')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-emerald-950/60 text-xs font-semibold transition"
          >
            <Printer className="w-3.5 h-3.5" />
            Cetak A4 Horizontal
          </button>
          <button
            type="button"
            disabled={downloading}
            onClick={handleDownloadPdf}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-[#0F684E] hover:bg-[#0B523D] disabled:opacity-60 text-white text-xs font-semibold transition"
          >
            {downloading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            Unduh PDF A4 Horizontal
          </button>
        </>
      }
    >
      <div className="bg-slate-100 dark:bg-[#0A110F] p-2 sm:p-4 rounded-xl overflow-x-auto">
        <div className="print-only-sheet a4-landscape mx-auto w-full min-w-[680px] max-w-[920px] aspect-[297/210] bg-white text-slate-900 p-4 sm:p-6 shadow-md flex flex-col">
          {/* Outer Emerald + Inner Gold Double Border */}
          <div className="flex-1 border-[3px] border-[#0F684E] p-1.5 flex flex-col">
            <div className="flex-1 border border-[#C69214] px-6 sm:px-8 py-5 sm:py-6 flex flex-col justify-between relative">
              {/* Institutional Header */}
              <div className="flex items-start justify-between border-b-2 border-[#C69214]/70 pb-3.5 gap-4">
                <div className="flex items-center gap-3.5">
                  <KemenagLogo size="lg" />
                  <div>
                    <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-[#0F684E]">
                      Kementerian Agama Republik Indonesia
                    </p>
                    <h2 className="font-display text-lg sm:text-2xl font-bold text-slate-900 leading-tight">
                      Kantor Kementerian Agama Kabupaten Jepara
                    </h2>
                    <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                      Unit Penyelenggara: {user.kua} · Desa{' '}
                      {normalizeVillageName(user.desaTempatNikah, user.kua)}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0 flex flex-col items-end">
                  <img
                    src={SAMAWA_LOGO_URL}
                    alt="SAMAWA"
                    className="h-6 sm:h-7 w-auto object-contain mb-1.5"
                  />
                  <p className="text-[9px] uppercase tracking-wider text-slate-500">
                    Nomor Sertifikat
                  </p>
                  <p className="font-mono-num text-xs sm:text-sm font-bold text-[#0F684E]">
                    {certCode}
                  </p>
                </div>
              </div>

              {/* Main Recipient Body */}
              <div className="text-center space-y-2 py-2">
                <p className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.28em] text-[#B47D0E]">
                  Sertifikat Bimbingan Perkawinan Mandiri
                </p>
                <p className="text-xs text-slate-600">Diberikan kepada Calon Pengantin:</p>
                <h3 className="font-display text-2xl sm:text-4xl font-semibold text-[#094232] leading-tight">
                  {user.nama}
                </h3>
                <div className="w-48 h-px bg-[#C69214]/80 mx-auto" />
                <p className="text-xs text-slate-600 font-mono-num pt-0.5">
                  NIK: {maskNik(user.nik)} · TTL: {user.ttl || '-'} · Pasangan:{' '}
                  {user.pasanganNama || '-'}
                </p>
                <p className="text-xs sm:text-[13px] text-slate-700 max-w-2xl mx-auto pt-1.5 leading-relaxed">
                  Telah menyelesaikan seluruh rangkaian Bimbingan Perkawinan Mandiri (MOOC 5 Modul
                  Keluarga Sakinah, Pretest, Postest, Survei IKM, serta Sesi Bimbingan{' '}
                  {user.progress?.kehadiranKelas || 'KUA'}) dengan predikat{' '}
                  <strong>LULUS &amp; TERVERIFIKASI</strong>.
                </p>
              </div>

              {/* Footer: QR, Evaluation Summary, Official Signature */}
              <div className="grid grid-cols-3 gap-4 items-end pt-3.5 border-t border-slate-200">
                <div className="flex items-center gap-2.5">
                  <QRCodeBox value={certCode} size={78} />
                  <div className="text-[10px] text-slate-500 leading-snug">
                    <p className="font-bold text-slate-800">Terverifikasi Digital</p>
                    <p>Pindai QR atau cek kode pada portal resmi Kemenag Jepara.</p>
                  </div>
                </div>
                <div className="text-center text-xs text-slate-600 bg-[#F8FAF9] border border-slate-200 rounded-lg px-3 py-2.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#0F684E]">
                    Capaian Evaluasi
                  </p>
                  <p className="font-mono-num text-xs sm:text-sm font-bold text-slate-900 mt-0.5">
                    Pretest {user.progress?.pretestScore ?? 0} → Postest{' '}
                    {user.progress?.postestScore ?? 0}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5 truncate">
                    Fasilitator: {user.progress?.verifikasiOleh || `Fasilitator ${user.kua}`}
                  </p>
                </div>
                <div className="text-right text-[11px] sm:text-xs">
                  <p className="text-slate-600">
                    Jepara, {user.progress?.tanggalTerbitSertifikat || formatIndonesianDate()}
                  </p>
                  <p className="font-semibold text-[#0F684E] mt-0.5">{pejabat.jabatan}</p>
                  <div className="h-11" />
                  <p className="font-bold underline text-slate-900">{pejabat.nama}</p>
                  <p className="font-mono-num text-[10px] text-slate-600">{pejabat.nip}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModalDialog>
  );
};

/**
 * 2. PIAGAM KOMITMEN "KAMI KOMPAK" — A4 VERTIKAL (210mm × 297mm) SIAP CETAK
 */
export const PiagamKompakPreviewModal: React.FC<{
  open: boolean;
  onClose: () => void;
  user: BimwinUser;
}> = ({ open, onClose, user }) => {
  const code = user.kompak?.kodePiagam || 'KOMPAK-2026-0001';
  const [downloading, setDownloading] = useState(false);

  const handleDownloadPdf = async () => {
    setDownloading(true);
    try {
      await downloadPiagamKompakPdfA4(user);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <ModalDialog
      open={open}
      onClose={onClose}
      title='Piagam Komitmen Pasangan "Kami Kompak"'
      subtitle={`Format A4 Vertikal (210 × 297 mm) · Nomor Registrasi: ${code}`}
      maxWidth="4xl"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 text-xs font-semibold"
          >
            Tutup
          </button>
          <button
            type="button"
            onClick={() => printA4Document('portrait')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-emerald-950/60 text-xs font-semibold transition"
          >
            <Printer className="w-3.5 h-3.5" />
            Cetak A4 Vertikal
          </button>
          <button
            type="button"
            disabled={downloading}
            onClick={handleDownloadPdf}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-[#0F684E] hover:bg-[#0B523D] disabled:opacity-60 text-white text-xs font-semibold transition"
          >
            {downloading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            Unduh PDF A4 Vertikal
          </button>
        </>
      }
    >
      <div className="bg-slate-100 dark:bg-[#0A110F] p-2 sm:p-4 rounded-xl overflow-x-auto">
        <div className="print-only-sheet a4-portrait mx-auto w-full max-w-[700px] aspect-[210/297] bg-white text-slate-900 p-4 sm:p-6 shadow-md flex flex-col">
          <div className="flex-1 border-[3px] border-[#C69214] p-1.5 flex flex-col">
            <div className="flex-1 border border-[#0F684E] px-6 sm:px-9 py-6 sm:py-8 flex flex-col justify-between">
              {/* Top Header */}
              <div className="relative text-center space-y-1.5 border-b-2 border-[#C69214]/60 pb-5">
                <img
                  src={SAMAWA_LOGO_URL}
                  alt="SAMAWA"
                  className="h-5 w-auto object-contain hidden sm:block absolute right-0 top-0"
                />
                <div className="flex justify-center mb-2">
                  <KemenagLogo size="md" />
                </div>
                <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-[#0F684E]">
                  Bimbingan Perkawinan Kementerian Agama Kabupaten Jepara
                </p>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
                  PIAGAM KOMITMEN “KAMI KOMPAK”
                </h2>
                <p className="font-mono-num text-xs text-slate-500">No. Registrasi: {code}</p>
              </div>

              {/* Couple Details & 3 Commitments */}
              <div className="space-y-5 py-4 flex-1 flex flex-col justify-center">
                <div className="text-center">
                  <p className="text-xs text-slate-500">
                    Kami pasangan calon pengantin yang berikrar untuk membangun keluarga sakinah:
                  </p>
                  <p className="font-display text-xl sm:text-2xl font-semibold text-[#094232] mt-1.5">
                    {user.nama} &amp; {user.pasanganNama || 'Pasangan'}
                  </p>
                  <p className="text-xs text-[#0F684E] font-semibold mt-1">
                    {user.kua} · Desa {normalizeVillageName(user.desaTempatNikah, user.kua)},
                    Kabupaten Jepara
                  </p>
                </div>

                <div className="space-y-3.5 text-xs sm:text-sm leading-relaxed">
                  <div className="p-4 rounded-lg bg-[#F8FAF9] border border-slate-200 border-l-4 border-l-[#0F684E]">
                    <h4 className="font-bold text-[#0F684E] mb-1">
                      1. Komitmen Kesalingan Peran &amp; Kesehatan Keluarga
                    </h4>
                    <p className="text-slate-700">
                      {user.kompak?.peranKeluarga ||
                        'Saling berbagi peran domestik, menjaga kesehatan keluarga, dan mencegah stunting sejak masa pra-nikah.'}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-[#F8FAF9] border border-slate-200 border-l-4 border-l-[#0F684E]">
                    <h4 className="font-bold text-[#0F684E] mb-1">
                      2. Komitmen Moderasi Beragama &amp; Pendidikan Karakter Anak
                    </h4>
                    <p className="text-slate-700">
                      {user.kompak?.pendidikanKarakter ||
                        'Menanamkan nilai keagamaan yang ramah, moderat, toleran, serta keteladanan akhlak mulia dalam keluarga.'}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-[#F8FAF9] border border-slate-200 border-l-4 border-l-[#0F684E]">
                    <h4 className="font-bold text-[#0F684E] mb-1">
                      3. Komitmen Pengasuhan &amp; Disiplin Positif Tanpa Kekerasan
                    </h4>
                    <p className="text-slate-700">
                      {user.kompak?.disiplinPositif ||
                        'Menerapkan komunikasi penuh kasih sayang, musyawarah, serta pengasuhan positif bebas kekerasan.'}
                    </p>
                  </div>
                </div>

                <p className="text-center text-[11px] italic text-slate-500 pt-1">
                  Piagam komitmen ini disusun secara sadar dan bersama-sama sebagai pegangan
                  kehidupan rumah tangga.
                </p>
              </div>

              {/* Signatures & QR */}
              <div className="grid grid-cols-3 gap-4 items-end pt-4 border-t border-slate-200 text-center text-xs">
                <div>
                  <p className="text-slate-600">Calon Mempelai I</p>
                  <div className="h-14" />
                  <p className="font-bold underline text-slate-900">{user.nama}</p>
                </div>
                <div className="flex flex-col items-center">
                  <QRCodeBox value={code} size={76} />
                  <span className="text-[10px] text-slate-500 mt-1">Validasi QR Resmi</span>
                </div>
                <div>
                  <p className="text-slate-600">Jepara, {formatIndonesianDate()}</p>
                  <p className="text-slate-600">Calon Mempelai II</p>
                  <div className="h-10" />
                  <p className="font-bold underline text-slate-900">
                    {user.pasanganNama || 'Pasangan'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModalDialog>
  );
};

/**
 * 3. RAPOR PORTOFOLIO CALON PENGANTIN — A4 VERTIKAL (210mm × 297mm) SIAP CETAK
 */
export const PortfolioPreviewModal: React.FC<{
  open: boolean;
  onClose: () => void;
  user: BimwinUser;
  modules: ModuleDefinition[];
}> = ({ open, onClose, user, modules }) => {
  const pre = user.progress?.pretestScore ?? 0;
  const post = user.progress?.postestScore ?? 0;
  const gain = post - pre;
  const [downloading, setDownloading] = useState(false);

  const handleDownloadPdf = async () => {
    setDownloading(true);
    try {
      await downloadPortfolioPdfA4(user, modules);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <ModalDialog
      open={open}
      onClose={onClose}
      title="Rapor Portofolio Kesiapan Calon Pengantin"
      subtitle={`Format A4 Vertikal (210 × 297 mm) · ${user.nama} · ${user.kua}`}
      maxWidth="4xl"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 text-xs font-semibold"
          >
            Tutup
          </button>
          <button
            type="button"
            onClick={() => printA4Document('portrait')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-emerald-950/60 text-xs font-semibold transition"
          >
            <Printer className="w-3.5 h-3.5" />
            Cetak A4
          </button>
          <button
            type="button"
            disabled={downloading}
            onClick={handleDownloadPdf}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-[#0F684E] hover:bg-[#0B523D] disabled:opacity-60 text-white text-xs font-semibold transition"
          >
            {downloading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            Unduh PDF A4
          </button>
        </>
      }
    >
      <div className="bg-slate-100 dark:bg-[#0A110F] p-2 sm:p-4 rounded-xl overflow-x-auto">
        <div className="print-only-sheet a4-portrait mx-auto w-full max-w-[700px] min-h-[960px] bg-white text-slate-900 border border-slate-200 p-6 sm:p-8 shadow-md flex flex-col justify-between gap-6">
          <div className="space-y-5">
            {/* Kop Surat */}
            <div className="flex items-start justify-between border-b-2 border-[#0F684E] pb-4 gap-4">
              <div className="flex items-center gap-3">
                <KemenagLogo size="md" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#0F684E]">
                    Kementerian Agama Kabupaten Jepara · Seksi Bimas Islam
                  </p>
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-slate-900 leading-tight mt-0.5">
                    Rapor Portofolio Kesiapan Calon Pengantin
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Tanggal Cetak: {formatIndonesianDate()}
                  </p>
                </div>
              </div>
              <img
                src={SAMAWA_LOGO_URL}
                alt="SAMAWA"
                className="h-6 w-auto object-contain shrink-0 hidden sm:block"
              />
            </div>

            {/* Identity + QR */}
            <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-[#F8FAF9] border border-slate-200">
              <div className="space-y-1 text-xs min-w-0">
                <p className="font-display text-lg font-bold text-slate-900">{user.nama}</p>
                <p className="text-slate-600 font-mono-num">
                  NIK: {maskNik(user.nik)} · TTL: {user.ttl || '-'}
                </p>
                <p className="text-slate-600">
                  {user.kua} · Desa {normalizeVillageName(user.desaTempatNikah, user.kua)}
                </p>
                <p className="text-slate-600">
                  Pasangan: <strong className="text-slate-900">{user.pasanganNama || '-'}</strong> ·
                  No. Sertifikat:{' '}
                  <span className="font-mono-num font-semibold text-[#0F684E]">
                    {user.progress?.nomorSertifikat || 'Proses Verifikasi'}
                  </span>
                </p>
              </div>
              <QRCodeBox value={user.progress?.nomorSertifikat || user.username} size={76} />
            </div>

            {/* 3 KPI Boxes */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-lg bg-[#F8FAF9] border border-slate-200">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Skor Pretest
                </p>
                <p className="font-mono-num text-2xl font-bold text-slate-800 mt-1">{pre}</p>
              </div>
              <div className="p-3 rounded-lg bg-[#F8FAF9] border border-slate-200">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Skor Postest
                </p>
                <p className="font-mono-num text-2xl font-bold text-[#0F684E] mt-1">{post}</p>
              </div>
              <div className="p-3 rounded-lg bg-[#F8FAF9] border border-slate-200">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Peningkatan (Gain)
                </p>
                <p className="font-mono-num text-2xl font-bold text-[#B47D0E] mt-1">
                  {gain >= 0 ? `+${gain}` : gain}
                </p>
              </div>
            </div>

            {/* Curriculum Table */}
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-[#0F684E]">
                A. Capaian Kurikulum 5 Modul Keluarga Sakinah
              </p>
              <table className="w-full text-xs border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-[#0F684E] text-white">
                  <tr>
                    <th className="text-left px-3 py-2 font-semibold w-10">No</th>
                    <th className="text-left px-3 py-2 font-semibold">Modul Kurikulum</th>
                    <th className="text-right px-3 py-2 font-semibold">Nilai Kuis</th>
                    <th className="text-right px-3 py-2 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {modules.map((m, idx) => {
                    const score = user.progress?.moduleScores[m.id] ?? 0;
                    const passed = user.progress?.modulesCompleted.includes(m.id);
                    return (
                      <tr key={m.id} className={idx % 2 === 1 ? 'bg-[#F8FAF9]' : 'bg-white'}>
                        <td className="px-3 py-2 font-mono-num text-slate-500">{idx + 1}</td>
                        <td className="px-3 py-2 font-medium text-slate-900">{m.judul}</td>
                        <td className="px-3 py-2 text-right font-mono-num font-bold">{score}</td>
                        <td
                          className={`px-3 py-2 text-right font-semibold ${
                            passed ? 'text-[#0F684E]' : 'text-amber-700'
                          }`}
                        >
                          {passed ? 'Tuntas' : 'Belum'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Section B: Stunting & Facilitator Notes */}
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-[#0F684E]">
                B. Skrining Kesiapan Gizi &amp; Catatan Fasilitator
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-lg bg-[#F8FAF9] border border-slate-200 space-y-1">
                  <p className="font-bold text-slate-800">Skrining Kesiapan Gizi &amp; Stunting</p>
                  {user.stunting ? (
                    <p className="text-slate-600 font-mono-num leading-relaxed">
                      Status: {user.stunting.status} · IMT {user.stunting.imt} · LiLA{' '}
                      {user.stunting.lilaCm} cm · Hb {user.stunting.hbGdL} g/dL
                    </p>
                  ) : (
                    <p className="text-slate-500">Belum melakukan skrining gizi mandiri.</p>
                  )}
                </div>
                <div className="p-3.5 rounded-lg bg-[#F8FAF9] border border-slate-200 space-y-1">
                  <p className="font-bold text-slate-800">Catatan Fasilitator KUA</p>
                  <p className="text-slate-600 leading-relaxed">
                    {user.progress?.catatanFasilitator ||
                      'Terverifikasi memenuhi kompetensi dasar Bimbingan Perkawinan Mandiri.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Section C: Ringkasan Komitmen Kami Kompak */}
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-[#0F684E]">
                C. Ringkasan Piagam Komitmen “Kami Kompak”
              </p>
              <div className="p-4 rounded-lg bg-[#F8FAF9] border border-slate-200 space-y-1.5 text-xs text-slate-700">
                <p className="font-semibold text-slate-900">
                  Kode Piagam:{' '}
                  <span className="font-mono-num text-[#0F684E]">
                    {user.kompak?.kodePiagam || 'Belum disusun'}
                  </span>
                </p>
                <p>
                  <strong>1. Peran &amp; Kesehatan:</strong> {user.kompak?.peranKeluarga || '-'}
                </p>
                <p>
                  <strong>2. Karakter &amp; Moderasi:</strong>{' '}
                  {user.kompak?.pendidikanKarakter || '-'}
                </p>
                <p>
                  <strong>3. Pengasuhan Positif:</strong> {user.kompak?.disiplinPositif || '-'}
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
            <span>Sistem SAMAWA · Bimbingan Perkawinan Mandiri Kemenag Kabupaten Jepara</span>
            <span className="font-medium text-slate-700">
              Verifikator: {user.progress?.verifikasiOleh || `Fasilitator ${user.kua}`}
            </span>
          </div>
        </div>
      </div>
    </ModalDialog>
  );
};

/**
 * 4. LAPORAN EKSEKUTIF BIMWIN — A4 VERTIKAL (210mm × 297mm) SIAP CETAK
 */
export const ExecutiveReportPreviewModal: React.FC<{
  open: boolean;
  onClose: () => void;
  report: ExecutiveReportData;
}> = ({ open, onClose, report }) => {
  const [downloading, setDownloading] = useState(false);

  const handleDownloadPdf = async () => {
    setDownloading(true);
    try {
      await downloadExecutiveReportPdfA4(report);
    } finally {
      setDownloading(false);
    }
  };

  const passRate = report.kpis.total
    ? Math.round((report.kpis.verified / report.kpis.total) * 100)
    : 0;

  return (
    <ModalDialog
      open={open}
      onClose={onClose}
      title="Laporan Eksekutif Bimbingan Perkawinan"
      subtitle={`Format A4 Vertikal (210 × 297 mm) · ${report.scopeLabel}`}
      maxWidth="4xl"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 text-xs font-semibold"
          >
            Tutup
          </button>
          <button
            type="button"
            onClick={() => printA4Document('portrait')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-emerald-950/60 text-xs font-semibold transition"
          >
            <Printer className="w-3.5 h-3.5" />
            Cetak A4
          </button>
          <button
            type="button"
            disabled={downloading}
            onClick={handleDownloadPdf}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-[#0F684E] hover:bg-[#0B523D] disabled:opacity-60 text-white text-xs font-semibold transition"
          >
            {downloading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            Unduh PDF A4
          </button>
        </>
      }
    >
      <div className="bg-slate-100 dark:bg-[#0A110F] p-2 sm:p-4 rounded-xl overflow-x-auto">
        <div className="print-only-sheet a4-portrait mx-auto w-full max-w-[700px] min-h-[960px] bg-white text-slate-900 border border-slate-200 p-6 sm:p-8 shadow-md flex flex-col justify-between gap-6">
          <div className="space-y-5">
            {/* Kop Surat Resmi */}
            <div className="flex items-start justify-between border-b-2 border-[#0F684E] pb-4 gap-4">
              <div className="flex items-center gap-3">
                <KemenagLogo size="md" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#0F684E]">
                    Kementerian Agama Republik Indonesia · Kabupaten Jepara
                  </p>
                  <h2 className="font-display text-xl font-bold text-slate-900 leading-tight mt-0.5">
                    Laporan Eksekutif Bimbingan Perkawinan
                  </h2>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Cakupan: {report.scopeLabel} · Kode:{' '}
                    <span className="font-mono-num font-semibold text-[#0F684E]">
                      {report.reportCode}
                    </span>{' '}
                    · {report.printedDate}
                  </p>
                </div>
              </div>
              <img
                src={SAMAWA_LOGO_URL}
                alt="SAMAWA"
                className="h-6 w-auto object-contain shrink-0 hidden sm:block"
              />
            </div>

            {/* 5 KPI Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-center">
              {[
                {
                  label: 'Total Peserta',
                  val: String(report.kpis.total),
                  sub: `${report.kpis.couples} pasangan`,
                },
                {
                  label: 'Sertifikat',
                  val: String(report.kpis.verified),
                  sub: `${passRate}% lulus`,
                },
                {
                  label: 'Before → After',
                  val: `${report.kpis.avgPre} → ${report.kpis.avgPost}`,
                  sub: `Gain +${Math.max(0, report.kpis.avgPost - report.kpis.avgPre)}`,
                },
                {
                  label: 'Gizi / <19 Th',
                  val: `${report.kpis.riskGizi} / ${report.kpis.underage}`,
                  sub: 'Atensi KUA',
                },
                {
                  label: 'Rata-rata IKM',
                  val: `${report.kpis.avgIkm} / 5`,
                  sub: 'Kepuasan',
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="p-2.5 rounded-lg bg-[#F8FAF9] border border-slate-200"
                >
                  <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                    {item.label}
                  </p>
                  <p className="font-mono-num text-sm sm:text-base font-bold text-[#0F684E] mt-0.5">
                    {item.val}
                  </p>
                  <p className="text-[10px] text-slate-500">{item.sub}</p>
                </div>
              ))}
            </div>

            {/* Rekapitulasi Table */}
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-[#0F684E]">
                Rekapitulasi Capaian per {report.unitColumnLabel}
              </p>
              <table className="w-full text-xs border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-[#0F684E] text-white">
                  <tr>
                    <th className="text-left px-3 py-2 font-semibold w-10">No</th>
                    <th className="text-left px-3 py-2 font-semibold">{report.unitColumnLabel}</th>
                    <th className="text-right px-3 py-2 font-semibold">Peserta</th>
                    <th className="text-right px-3 py-2 font-semibold">Lulus / Sertifikat</th>
                    <th className="text-right px-3 py-2 font-semibold">Capaian</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {report.rows.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-3 py-4 text-center text-slate-500">
                        Belum ada data peserta pada cakupan ini.
                      </td>
                    </tr>
                  ) : (
                    report.rows.map((row, idx) => (
                      <tr key={row.unit} className={idx % 2 === 1 ? 'bg-[#F8FAF9]' : 'bg-white'}>
                        <td className="px-3 py-1.5 font-mono-num text-slate-500">{idx + 1}</td>
                        <td className="px-3 py-1.5 font-medium text-slate-900">{row.unit}</td>
                        <td className="px-3 py-1.5 text-right font-mono-num">{row.peserta}</td>
                        <td className="px-3 py-1.5 text-right font-mono-num font-semibold">
                          {row.lulus}
                        </td>
                        <td
                          className={`px-3 py-1.5 text-right font-mono-num font-bold ${
                            row.rate >= 80
                              ? 'text-[#0F684E]'
                              : row.rate >= 50
                                ? 'text-amber-700'
                                : 'text-red-700'
                          }`}
                        >
                          {row.rate}%
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Demografi Pendidikan */}
            {report.educationSummary.length > 0 && (
              <div className="p-3.5 rounded-lg bg-[#F8FAF9] border border-slate-200 text-xs">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#0F684E] mb-1">
                  Demografi Pendidikan Peserta
                </p>
                <p className="text-slate-700">
                  {report.educationSummary.map((e) => `${e.name}: ${e.value}`).join(' · ')}
                </p>
              </div>
            )}
          </div>

          {/* QR Validation + Official Signature */}
          <div className="grid grid-cols-2 gap-6 items-end pt-4 border-t border-slate-200 text-xs">
            <div className="flex items-center gap-3">
              <QRCodeBox value={report.reportCode} size={74} />
              <div className="text-[10px] text-slate-500 leading-snug">
                <p className="font-bold text-slate-800">Validasi Laporan Digital</p>
                <p className="font-mono-num font-semibold text-[#0F684E] mt-0.5">
                  {report.reportCode}
                </p>
                <p className="mt-0.5">Terverifikasi melalui Portal Kemenag Kabupaten Jepara.</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-slate-600">Jepara, {report.printedDate}</p>
              <p className="font-semibold text-[#0F684E] mt-0.5">{report.pejabat.jabatan}</p>
              <div className="h-12" />
              <p className="font-bold underline text-slate-900">{report.pejabat.nama}</p>
              <p className="font-mono-num text-[10px] text-slate-600">{report.pejabat.nip}</p>
            </div>
          </div>
        </div>
      </div>
    </ModalDialog>
  );
};

/**
 * 5. KARTU STORY KELULUSAN — BACKGROUND PUTIH BERSIH (1080×1920 HD PNG)
 */
export const StoryCardModal: React.FC<{
  open: boolean;
  onClose: () => void;
  user: BimwinUser;
}> = ({ open, onClose, user }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  useEffect(() => {
    if (!open) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let cancelled = false;
    canvas.width = 1080;
    canvas.height = 1920;

    const loadImg = (src: string): Promise<HTMLImageElement | null> =>
      new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = src;
      });

    const fitFontSize = (text: string, maxWidth: number, startSize: number, minSize = 34) => {
      let size = startSize;
      while (size > minSize) {
        ctx.font = `bold ${size}px Georgia, serif`;
        if (ctx.measureText(text).width <= maxWidth) break;
        size -= 2;
      }
      return size;
    };

    const renderStory = async () => {
      const certCode = user.progress?.nomorSertifikat || user.username || 'BIMWIN-JEPARA';
      const [kemenagImg, samawaImg, qrDataUrl] = await Promise.all([
        loadImg(KEMENAG_LOGO_SVG),
        loadImg(SAMAWA_LOGO_URL),
        QRCode.toDataURL(certCode, {
          width: 220,
          margin: 1,
          color: { dark: '#094232', light: '#FFFFFF' },
        }).catch(() => ''),
      ]);
      const qrImg = qrDataUrl ? await loadImg(qrDataUrl) : null;
      if (cancelled) return;

      // Pure crisp white background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, 1080, 1920);

      // Clean institutional double frame (emerald outer + gold inner)
      ctx.strokeStyle = '#0F684E';
      ctx.lineWidth = 6;
      ctx.strokeRect(56, 56, 968, 1808);

      ctx.strokeStyle = '#C69214';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(74, 74, 932, 1772);

      // Top Kemenag Emblem + SAMAWA logo centered cleanly
      if (kemenagImg && kemenagImg.naturalWidth > 0) {
        ctx.drawImage(kemenagImg, 476, 132, 128, 128);
      }

      if (samawaImg && samawaImg.naturalWidth > 0) {
        const sh = 64;
        const sw = (samawaImg.naturalWidth / samawaImg.naturalHeight) * sh;
        ctx.drawImage(samawaImg, (1080 - sw) / 2, 286, sw, sh);
      }

      ctx.textAlign = 'center';
      ctx.fillStyle = '#0F684E';
      ctx.font = 'bold 26px sans-serif';
      ctx.fillText('KEMENTERIAN AGAMA KABUPATEN JEPARA', 540, 392);

      // Subtle gold divider
      ctx.strokeStyle = '#C69214';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(390, 424);
      ctx.lineTo(690, 424);
      ctx.stroke();

      // Main Title
      ctx.fillStyle = '#094232';
      ctx.font = 'bold 60px Georgia, serif';
      ctx.fillText('LULUS BIMWIN MANDIRI', 540, 512);

      ctx.fillStyle = '#475569';
      ctx.font = '29px sans-serif';
      ctx.fillText('“Kenali Diri, Pahami Pasangan, Siapkan Pernikahan.”', 540, 574);

      // Clean white/soft-tint bordered center panel
      ctx.fillStyle = '#F8FAF9';
      ctx.strokeStyle = '#D8E3DE';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(116, 650, 848, 690, 32);
      ctx.fill();
      ctx.stroke();

      // Subtle emerald top accent bar inside card
      ctx.fillStyle = '#0F684E';
      ctx.beginPath();
      ctx.roundRect(450, 694, 180, 8, 4);
      ctx.fill();

      ctx.fillStyle = '#0F684E';
      ctx.font = 'bold 26px sans-serif';
      ctx.fillText('PASANGAN CALON PENGANTIN', 540, 756);

      const nama1 = user.nama;
      const nama2 = user.pasanganNama || 'Pasangan Sakinah';
      const font1 = fitFontSize(nama1, 760, 54);
      const font2 = fitFontSize(nama2, 760, 54);

      ctx.fillStyle = '#0F172A';
      ctx.font = `bold ${font1}px Georgia, serif`;
      ctx.fillText(nama1, 540, 868);

      ctx.fillStyle = '#C69214';
      ctx.font = 'bold 46px Georgia, serif';
      ctx.fillText('&', 540, 940);

      ctx.fillStyle = '#0F172A';
      ctx.font = `bold ${font2}px Georgia, serif`;
      ctx.fillText(nama2, 540, 1020);

      ctx.fillStyle = '#475569';
      ctx.font = '30px sans-serif';
      ctx.fillText(`${user.kua} · Kabupaten Jepara`, 540, 1112);

      // Divider inside card
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(220, 1164);
      ctx.lineTo(860, 1164);
      ctx.stroke();

      ctx.fillStyle = '#0F684E';
      ctx.font = 'bold 34px monospace';
      ctx.fillText(user.progress?.nomorSertifikat || 'TERVERIFIKASI DIGITAL', 540, 1228);

      ctx.fillStyle = '#475569';
      ctx.font = '27px sans-serif';
      ctx.fillText(
        `Skor Evaluasi: ${user.progress?.postestScore ?? 100}/100 · 5 Modul Sakinah Tuntas`,
        540,
        1288
      );

      // QR Verification Section on pure white
      if (qrImg) {
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#CBD5E1';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.roundRect(450, 1396, 180, 180, 18);
        ctx.fill();
        ctx.stroke();
        ctx.drawImage(qrImg, 464, 1410, 152, 152);
      }

      ctx.fillStyle = '#0F684E';
      ctx.font = 'bold 30px sans-serif';
      ctx.fillText('#KeluargaSakinah  #BimwinKemenagJepara', 540, 1662);

      ctx.fillStyle = '#64748B';
      ctx.font = '25px sans-serif';
      ctx.fillText('Terverifikasi Digital · Seksi Bimas Islam Kemenag Kabupaten Jepara', 540, 1722);

      setPreviewUrl(canvas.toDataURL('image/png'));
    };

    void renderStory();
    return () => {
      cancelled = true;
    };
  }, [open, user]);

  const handleDownload = () => {
    if (!previewUrl) return;
    const link = document.createElement('a');
    link.download = `Kartu-Story-Bimwin-${user.username}.png`;
    link.href = previewUrl;
    link.click();
  };

  return (
    <ModalDialog
      open={open}
      onClose={onClose}
      title="Kartu Story Kelulusan (WA / IG / TikTok)"
      subtitle="Desain latar putih bersih · Resolusi HD 1080×1920 PNG siap dibagikan."
      maxWidth="md"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 text-xs font-semibold"
          >
            Tutup
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-[#0F684E] hover:bg-[#0B523D] text-white text-xs font-semibold"
          >
            <Download className="w-3.5 h-3.5" />
            Unduh PNG (1080×1920)
          </button>
        </>
      }
    >
      <div className="flex flex-col items-center bg-slate-100 dark:bg-[#0A110F] p-4 rounded-xl">
        <canvas ref={canvasRef} className="hidden" />
        {previewUrl && (
          <img
            src={previewUrl}
            alt="Preview Kartu Story Bimwin latar putih bersih"
            className="w-64 sm:w-72 rounded-xl border border-slate-200 dark:border-emerald-900 shadow-lg bg-white"
          />
        )}
      </div>
    </ModalDialog>
  );
};

/**
 * 6. DAFTAR HADIR KELAS — A4 VERTIKAL (210mm × 297mm) SIAP CETAK
 */
export const AttendanceSheetModal: React.FC<{
  open: boolean;
  onClose: () => void;
  schedule: BimwinClassSchedule | null;
}> = ({ open, onClose, schedule }) => {
  const [downloading, setDownloading] = useState(false);

  if (!schedule) return null;

  const handleDownloadPdf = async () => {
    setDownloading(true);
    try {
      await downloadAttendancePdfA4(schedule);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <ModalDialog
      open={open}
      onClose={onClose}
      title={`Daftar Hadir Kelas — ${schedule.kodeAbsen}`}
      subtitle={`Format A4 Vertikal (210 × 297 mm) · ${schedule.kua} · ${formatIndonesianDate(schedule.tanggal)}`}
      maxWidth="4xl"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 text-xs font-semibold"
          >
            Tutup
          </button>
          <button
            type="button"
            onClick={() => printA4Document('portrait')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-emerald-950/60 text-xs font-semibold transition"
          >
            <Printer className="w-3.5 h-3.5" />
            Cetak A4
          </button>
          <button
            type="button"
            disabled={downloading}
            onClick={handleDownloadPdf}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-[#0F684E] hover:bg-[#0B523D] disabled:opacity-60 text-white text-xs font-semibold transition"
          >
            {downloading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            Unduh PDF A4
          </button>
        </>
      }
    >
      <div className="bg-slate-100 dark:bg-[#0A110F] p-2 sm:p-4 rounded-xl overflow-x-auto">
        <div className="print-only-sheet a4-portrait mx-auto w-full max-w-[700px] min-h-[900px] bg-white text-slate-900 border border-slate-200 p-6 sm:p-8 shadow-md space-y-5">
          <div className="flex items-start justify-between border-b-2 border-[#0F684E] pb-4 gap-4">
            <div className="flex items-center gap-3">
              <KemenagLogo size="md" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#0F684E]">
                  Kementerian Agama Kabupaten Jepara · {schedule.kua}
                </p>
                <h3 className="font-display text-xl font-bold mt-0.5">{schedule.judul}</h3>
                <p className="text-xs text-slate-600 mt-1">
                  {formatIndonesianDate(schedule.tanggal)} · {schedule.waktu} · Narasumber:{' '}
                  {schedule.narasumber}
                </p>
                <p className="text-xs text-slate-500">Lokasi / Tautan: {schedule.lokasiAtauLink}</p>
              </div>
            </div>
            <QRCodeBox value={schedule.kodeAbsen} size={74} />
          </div>

          <table className="w-full text-xs border border-slate-200 rounded-lg overflow-hidden">
            <thead className="bg-[#0F684E] text-white">
              <tr>
                <th className="px-3 py-2 text-left">No</th>
                <th className="px-3 py-2 text-left">Nama Peserta</th>
                <th className="px-3 py-2 text-left">Username</th>
                <th className="px-3 py-2 text-left">Konfirmasi RSVP</th>
                <th className="px-3 py-2 text-left">Verifikasi Hadir</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {schedule.rsvps.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-4 text-center text-slate-500">
                    Belum ada peserta yang mendaftar pada sesi ini.
                  </td>
                </tr>
              ) : (
                schedule.rsvps.map((r, i) => (
                  <tr key={r.username} className={i % 2 === 1 ? 'bg-[#F8FAF9]' : 'bg-white'}>
                    <td className="px-3 py-2 font-mono-num">{i + 1}</td>
                    <td className="px-3 py-2 font-semibold">{r.nama}</td>
                    <td className="px-3 py-2 font-mono-num">{r.username}</td>
                    <td className="px-3 py-2">{r.status}</td>
                    <td className="px-3 py-2 font-semibold text-[#0F684E]">
                      {r.verifiedHadir ? 'Terverifikasi Hadir' : 'Menunggu Presensi'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </ModalDialog>
  );
};
