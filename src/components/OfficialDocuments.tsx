import React, { useEffect, useRef, useState } from 'react';
import { Download, Printer } from 'lucide-react';
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
import { KemenagLogo, ModalDialog, QRCodeBox } from './UiPrimitives';

export const CertificatePreviewModal: React.FC<{
  open: boolean;
  onClose: () => void;
  user: BimwinUser;
  pejabat: PejabatConfig;
}> = ({ open, onClose, user, pejabat }) => {
  const certCode = user.progress?.nomorSertifikat || 'JPR-PREVIEW-2026';

  return (
    <ModalDialog
      open={open}
      onClose={onClose}
      title="Sertifikat Kelulusan Bimbingan Perkawinan"
      subtitle={`Nomor Registrasi: ${certCode}`}
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
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-[#0F684E] hover:bg-[#0B523D] text-white text-xs font-semibold"
          >
            <Printer className="w-3.5 h-3.5" />
            Cetak / Simpan PDF
          </button>
        </>
      }
    >
      <div className="print-only-sheet bg-white text-slate-900 border-[6px] border-double border-[#0F684E] rounded-xl p-6 sm:p-10 space-y-6 relative overflow-hidden">
        <div className="flex items-center justify-between border-b-2 border-amber-500/70 pb-4 gap-4">
          <div className="flex items-center gap-4">
            <KemenagLogo size="lg" />
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#0F684E]">
                Kementerian Agama Republik Indonesia
              </p>
              <h2 className="font-display text-lg sm:text-2xl font-bold text-slate-900">
                Kantor Kementerian Agama Kabupaten Jepara
              </h2>
              <p className="text-xs text-slate-500">
                Unit Penyelenggara: {user.kua} · Desa {normalizeVillageName(user.desaTempatNikah, user.kua)}
              </p>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-[10px] uppercase tracking-wider text-slate-500">Nomor Sertifikat</p>
            <p className="font-mono-num text-sm font-bold text-[#0F684E]">{certCode}</p>
          </div>
        </div>

        <div className="text-center space-y-2 py-2">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-amber-700">
            Sertifikat Bimbingan Perkawinan Mandiri
          </p>
          <p className="text-xs text-slate-600">Diberikan kepada Calon Pengantin:</p>
          <h3 className="font-display text-2xl sm:text-4xl font-semibold text-[#094232]">
            {user.nama}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 font-mono-num">
            NIK: {maskNik(user.nik)} · TTL: {user.ttl || '-'} · Pasangan: {user.pasanganNama || '-'}
          </p>
          <p className="text-xs sm:text-sm text-slate-700 max-w-2xl mx-auto pt-2 leading-relaxed">
            Telah menyelesaikan seluruh rangkaian Bimbingan Perkawinan Mandiri (MOOC 5 Modul Keluarga
            Sakinah, Pretest, Postest, Survei IKM, serta Sesi Bimbingan {user.progress?.kehadiranKelas || 'KUA'})
            dengan predikat <strong>LULUS &amp; TERVERIFIKASI</strong>.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-end pt-4 border-t border-slate-200">
          <div className="flex items-center gap-3">
            <QRCodeBox value={certCode} size={84} />
            <div className="text-[11px] text-slate-500 leading-snug">
              <p className="font-bold text-slate-800">Terverifikasi Digital</p>
              <p>Pindai QR atau masukkan kode pada portal verifikasi Kemenag Jepara.</p>
            </div>
          </div>
          <div className="text-center text-xs text-slate-600">
            <p className="font-semibold text-slate-800">Capaian Evaluasi</p>
            <p className="font-mono-num mt-1">
              Pretest: {user.progress?.pretestScore ?? 0} → Postest: {user.progress?.postestScore ?? 0}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Fasilitator: {user.progress?.verifikasiOleh || `Fasilitator ${user.kua}`}
            </p>
          </div>
          <div className="text-center sm:text-right text-xs">
            <p className="text-slate-600">
              Jepara, {user.progress?.tanggalTerbitSertifikat || formatIndonesianDate()}
            </p>
            <p className="font-semibold text-[#0F684E] mt-0.5">{pejabat.jabatan}</p>
            <div className="h-12" />
            <p className="font-bold underline text-slate-900">{pejabat.nama}</p>
            <p className="font-mono-num text-[11px] text-slate-600">{pejabat.nip}</p>
          </div>
        </div>
      </div>
    </ModalDialog>
  );
};

export const PiagamKompakPreviewModal: React.FC<{
  open: boolean;
  onClose: () => void;
  user: BimwinUser;
}> = ({ open, onClose, user }) => {
  const code = user.kompak?.kodePiagam || 'KOMPAK-2026-0001';
  return (
    <ModalDialog
      open={open}
      onClose={onClose}
      title='Piagam Komitmen Pasangan "Kami Kompak"'
      subtitle={`Nomor Registrasi: ${code}`}
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
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-[#0F684E] hover:bg-[#0B523D] text-white text-xs font-semibold"
          >
            <Printer className="w-3.5 h-3.5" />
            Cetak Piagam
          </button>
        </>
      }
    >
      <div className="print-only-sheet bg-white text-slate-900 border-4 border-double border-amber-600 rounded-xl p-6 sm:p-8 space-y-5">
        <div className="text-center space-y-1 border-b border-slate-200 pb-4">
          <div className="flex justify-center mb-2">
            <KemenagLogo size="md" />
          </div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#0F684E]">
            Bimbingan Perkawinan Kemenag Kabupaten Jepara
          </p>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
            PIAGAM KOMITMEN “KAMI KOMPAK”
          </h2>
          <p className="font-mono-num text-xs text-slate-500">No. Registrasi: {code}</p>
        </div>

        <div className="text-center py-1">
          <p className="text-xs text-slate-500">Kami pasangan calon pengantin:</p>
          <p className="font-display text-xl sm:text-2xl font-semibold text-[#094232] mt-1">
            {user.nama} &amp; {user.pasanganNama || 'Pasangan'}
          </p>
          <p className="text-xs text-[#0F684E] font-semibold mt-0.5">{user.kua}</p>
        </div>

        <div className="space-y-3 text-xs sm:text-sm leading-relaxed">
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
            <h4 className="font-bold text-[#0F684E] mb-1">
              1. Komitmen Kesalingan Peran &amp; Kesehatan Keluarga
            </h4>
            <p className="text-slate-700">{user.kompak?.peranKeluarga}</p>
          </div>
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
            <h4 className="font-bold text-[#0F684E] mb-1">
              2. Komitmen Moderasi Beragama &amp; Pendidikan Karakter Anak
            </h4>
            <p className="text-slate-700">{user.kompak?.pendidikanKarakter}</p>
          </div>
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
            <h4 className="font-bold text-[#0F684E] mb-1">
              3. Komitmen Pengasuhan &amp; Disiplin Positif Tanpa Kekerasan
            </h4>
            <p className="text-slate-700">{user.kompak?.disiplinPositif}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 items-end pt-5 text-center text-xs">
          <div>
            <p className="text-slate-600">Calon Mempelai I</p>
            <div className="h-12" />
            <p className="font-bold underline">{user.nama}</p>
          </div>
          <div className="flex flex-col items-center">
            <QRCodeBox value={code} size={74} />
            <span className="text-[10px] text-slate-500 mt-1">Validasi QR</span>
          </div>
          <div>
            <p className="text-slate-600">Jepara, {formatIndonesianDate()}</p>
            <p className="text-slate-600">Calon Mempelai II</p>
            <div className="h-9" />
            <p className="font-bold underline">{user.pasanganNama || 'Pasangan'}</p>
          </div>
        </div>
      </div>
    </ModalDialog>
  );
};

export const PortfolioPreviewModal: React.FC<{
  open: boolean;
  onClose: () => void;
  user: BimwinUser;
  modules: ModuleDefinition[];
}> = ({ open, onClose, user, modules }) => {
  const pre = user.progress?.pretestScore ?? 0;
  const post = user.progress?.postestScore ?? 0;
  const gain = post - pre;

  return (
    <ModalDialog
      open={open}
      onClose={onClose}
      title="Rapor Portofolio Kesiapan Calon Pengantin"
      subtitle={`${user.nama} · ${user.kua}`}
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
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-[#0F684E] hover:bg-[#0B523D] text-white text-xs font-semibold"
          >
            <Printer className="w-3.5 h-3.5" />
            Cetak Portofolio
          </button>
        </>
      }
    >
      <div className="print-only-sheet bg-white text-slate-900 border border-slate-200 rounded-xl p-6 space-y-5">
        <div className="flex items-start justify-between border-b border-slate-200 pb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#0F684E]">
              Rapor Portofolio Catin · Kemenag Jepara
            </p>
            <h3 className="font-display text-2xl font-bold mt-0.5">{user.nama}</h3>
            <p className="text-xs text-slate-500 font-mono-num">
              {user.kua} · Desa {normalizeVillageName(user.desaTempatNikah, user.kua)} · Pasangan:{' '}
              {user.pasanganNama || '-'}
            </p>
          </div>
          <QRCodeBox value={user.progress?.nomorSertifikat || user.username} size={74} />
        </div>

        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <p className="text-[11px] text-slate-500">Skor Pretest</p>
            <p className="font-mono-num text-xl font-bold text-slate-800">{pre}</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <p className="text-[11px] text-slate-500">Skor Postest</p>
            <p className="font-mono-num text-xl font-bold text-[#0F684E]">{post}</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <p className="text-[11px] text-slate-500">Peningkatan (Gain)</p>
            <p className="font-mono-num text-xl font-bold text-amber-600">
              {gain >= 0 ? `+${gain}` : gain}
            </p>
          </div>
        </div>

        <table className="w-full text-xs border border-slate-200 rounded-lg overflow-hidden">
          <thead className="bg-slate-100 text-slate-700">
            <tr>
              <th className="text-left px-3 py-2 font-semibold">Modul Kurikulum</th>
              <th className="text-right px-3 py-2 font-semibold">Nilai Kuis</th>
              <th className="text-right px-3 py-2 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {modules.map((m) => {
              const score = user.progress?.moduleScores[m.id] ?? 0;
              const passed = user.progress?.modulesCompleted.includes(m.id);
              return (
                <tr key={m.id}>
                  <td className="px-3 py-2 font-medium">{m.judul}</td>
                  <td className="px-3 py-2 text-right font-mono-num font-bold">{score}</td>
                  <td className="px-3 py-2 text-right font-semibold text-[#0F684E]">
                    {passed ? 'Tuntas' : 'Belum'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
            <p className="font-bold text-slate-800">Skrining Kesiapan Gizi &amp; Stunting</p>
            {user.stunting ? (
              <p className="text-slate-600 font-mono-num">
                Status: {user.stunting.status} · IMT {user.stunting.imt} · LiLA {user.stunting.lilaCm} cm · Hb{' '}
                {user.stunting.hbGdL} g/dL
              </p>
            ) : (
              <p className="text-slate-500">Belum melakukan skrining gizi mandiri.</p>
            )}
          </div>
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
            <p className="font-bold text-slate-800">Catatan Fasilitator KUA</p>
            <p className="text-slate-600">
              {user.progress?.catatanFasilitator || 'Terverifikasi memenuhi kompetensi dasar Bimwin Mandiri.'}
            </p>
          </div>
        </div>
      </div>
    </ModalDialog>
  );
};

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

    canvas.width = 1080;
    canvas.height = 1920;

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, 1080, 1920);
    grad.addColorStop(0, '#073326');
    grad.addColorStop(0.55, '#0F684E');
    grad.addColorStop(1, '#094232');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1080, 1920);

    // Subtle geometric frame
    ctx.strokeStyle = 'rgba(212, 155, 22, 0.65)';
    ctx.lineWidth = 8;
    ctx.strokeRect(64, 64, 952, 1792);

    ctx.fillStyle = '#F3D06B';
    ctx.font = 'bold 34px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('KEMENTERIAN AGAMA KABUPATEN JEPARA', 540, 220);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 64px Georgia, serif';
    ctx.fillText('LULUS BIMWIN MANDIRI', 540, 350);

    ctx.fillStyle = '#D1FAE5';
    ctx.font = '32px sans-serif';
    ctx.fillText('“Kenali Diri, Pahami Pasangan, Siapkan Pernikahan.”', 540, 420);

    // Center card
    ctx.fillStyle = 'rgba(255,255,255,0.96)';
    ctx.beginPath();
    ctx.roundRect(110, 560, 860, 760, 36);
    ctx.fill();

    ctx.fillStyle = '#0F684E';
    ctx.font = 'bold 30px sans-serif';
    ctx.fillText('PASANGAN CALON PENGANTIN', 540, 660);

    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 54px Georgia, serif';
    ctx.fillText(user.nama, 540, 770);

    ctx.fillStyle = '#C69214';
    ctx.font = 'bold 48px Georgia, serif';
    ctx.fillText('&', 540, 845);

    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 54px Georgia, serif';
    ctx.fillText(user.pasanganNama || 'Pasangan Sakinah', 540, 925);

    ctx.fillStyle = '#334155';
    ctx.font = '32px sans-serif';
    ctx.fillText(`${user.kua} · Kabupaten Jepara`, 540, 1020);

    ctx.fillStyle = '#0F684E';
    ctx.font = 'bold 34px monospace';
    ctx.fillText(user.progress?.nomorSertifikat || 'TERVERIFIKASI DIGITAL', 540, 1130);

    ctx.fillStyle = '#475569';
    ctx.font = '28px sans-serif';
    ctx.fillText(
      `Skor Evaluasi: ${user.progress?.postestScore ?? 100}/100 · 5 Modul Sakinah Tuntas`,
      540,
      1210
    );

    ctx.fillStyle = '#F3D06B';
    ctx.font = 'bold 32px sans-serif';
    ctx.fillText('#KeluargaSakinah #BimwinKemenagJepara', 540, 1650);

    ctx.fillStyle = '#A7F3D0';
    ctx.font = '26px sans-serif';
    ctx.fillText('Terverifikasi Digital oleh Seksi Bimas Islam Kemenag Jepara', 540, 1720);

    setPreviewUrl(canvas.toDataURL('image/png'));
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
      subtitle="Resolusi HD 1080×1920 PNG siap dibagikan ke media sosial."
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
      <div className="flex flex-col items-center">
        <canvas ref={canvasRef} className="hidden" />
        {previewUrl && (
          <img
            src={previewUrl}
            alt="Preview Kartu Story Bimwin"
            className="w-64 sm:w-72 rounded-xl border border-slate-200 dark:border-emerald-900 shadow-lg"
          />
        )}
      </div>
    </ModalDialog>
  );
};

export const AttendanceSheetModal: React.FC<{
  open: boolean;
  onClose: () => void;
  schedule: BimwinClassSchedule | null;
}> = ({ open, onClose, schedule }) => {
  if (!schedule) return null;
  return (
    <ModalDialog
      open={open}
      onClose={onClose}
      title={`Daftar Hadir Kelas — ${schedule.kodeAbsen}`}
      subtitle={`${schedule.kua} · ${formatIndonesianDate(schedule.tanggal)}`}
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
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-[#0F684E] hover:bg-[#0B523D] text-white text-xs font-semibold"
          >
            <Printer className="w-3.5 h-3.5" />
            Cetak Daftar Hadir
          </button>
        </>
      }
    >
      <div className="print-only-sheet bg-white text-slate-900 border border-slate-200 rounded-xl p-6 space-y-4">
        <div className="flex items-start justify-between border-b border-slate-200 pb-4">
          <div>
            <p className="text-xs font-bold uppercase text-[#0F684E]">
              Kementerian Agama Kabupaten Jepara · {schedule.kua}
            </p>
            <h3 className="font-display text-xl font-bold mt-0.5">{schedule.judul}</h3>
            <p className="text-xs text-slate-600 mt-1">
              {formatIndonesianDate(schedule.tanggal)} · {schedule.waktu} · Narasumber:{' '}
              {schedule.narasumber}
            </p>
            <p className="text-xs text-slate-500">Lokasi / Tautan: {schedule.lokasiAtauLink}</p>
          </div>
          <QRCodeBox value={schedule.kodeAbsen} size={74} />
        </div>

        <table className="w-full text-xs border border-slate-200">
          <thead className="bg-slate-100">
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
                <tr key={r.username}>
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
    </ModalDialog>
  );
};
