import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Check, Copy, QrCode, Users } from 'lucide-react';
import { BimwinClassSchedule } from '../types/bimwin';
import { buildAttendanceQrPayload } from '../utils/operationalTools';
import { ModalDialog } from './UiPrimitives';

interface ClassAttendanceQrModalProps {
  schedule: BimwinClassSchedule | null;
  onClose: () => void;
}

export const ClassAttendanceQrModal: React.FC<ClassAttendanceQrModalProps> = ({
  schedule,
  onClose,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const qrPayload = schedule
    ? buildAttendanceQrPayload({
        classId: schedule.id,
        kua: schedule.kua,
        tanggal: schedule.tanggal,
      })
    : '';

  useEffect(() => {
    if (!qrPayload) {
      setQrDataUrl('');
      return;
    }
    let active = true;
    QRCode.toDataURL(qrPayload, {
      width: 320,
      margin: 2,
      color: { dark: '#0A3D2E', light: '#FFFFFF' },
    })
      .then((url) => {
        if (active) setQrDataUrl(url);
      })
      .catch(() => {
        if (active) setQrDataUrl('');
      });
    return () => {
      active = false;
    };
  }, [qrPayload]);

  const handleCopy = async () => {
    if (!qrPayload || typeof navigator === 'undefined') return;
    try {
      await navigator.clipboard.writeText(qrPayload);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore clipboard restriction
    }
  };

  return (
    <ModalDialog
      open={Boolean(schedule)}
      onClose={onClose}
      title="QR Code Absensi Kelas Tatap Muka"
      subtitle={schedule ? `${schedule.judul} · ${schedule.kua}` : undefined}
      maxWidth="md"
      footer={
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-lg bg-[#0F684E] hover:bg-[#0B523D] text-white text-xs font-semibold"
        >
          Tutup Layar QR
        </button>
      }
    >
      {schedule && (
        <div className="space-y-4 text-center">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 inline-flex flex-col items-center gap-3 mx-auto shadow-xs">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt={`QR Absensi ${schedule.judul}`}
                className="w-64 h-64 rounded-lg"
              />
            ) : (
              <div className="w-64 h-64 flex items-center justify-center bg-slate-50 rounded-lg text-slate-400">
                <QrCode className="w-10 h-10" />
              </div>
            )}
            <div className="text-xs text-slate-600 space-y-0.5">
              <p className="font-bold text-slate-900">{schedule.kua}</p>
              <p>
                {schedule.tanggal} · {schedule.waktu}
              </p>
              <p className="inline-flex items-center gap-1 text-[#0F684E] font-semibold">
                <Users className="w-3.5 h-3.5" />
                {schedule.rsvps.filter((r) => r.verifiedHadir).length} / {schedule.kuota} Hadir Terverifikasi
              </p>
            </div>
          </div>

          <div className="text-left p-3 rounded-xl bg-slate-50 dark:bg-[#0D1613] border border-slate-200 dark:border-emerald-950 space-y-1.5">
            <p className="text-[11px] font-semibold text-slate-500">
              Kode Absensi Alternatif (bila kamera peserta bermasalah):
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-[11px] font-mono-num text-slate-800 dark:text-slate-200 truncate">
                {qrPayload}
              </code>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-emerald-900 bg-white dark:bg-[#111C18] text-[11px] font-semibold text-slate-700 dark:text-slate-200"
              >
                {copied ? <Check className="w-3 h-3 text-[#0F684E]" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Disalin' : 'Salin'}
              </button>
            </div>
          </div>

          <p className="text-xs text-slate-500">
            Tampilkan layar ini di proyektor/monitor ruang bimbingan. Peserta cukup membuka tombol{' '}
            <strong>Scan QR Absensi Kelas</strong> di aplikasi SAMAWA pada HP mereka.
          </p>
        </div>
      )}
    </ModalDialog>
  );
};
