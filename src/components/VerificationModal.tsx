import React from 'react';
import { ShieldCheck, ShieldAlert } from 'lucide-react';
import { VerificationResult } from '../types/bimwin';
import { KemenagLogo, ModalDialog, QRCodeBox } from './UiPrimitives';

export const VerificationModal: React.FC<{
  result: VerificationResult | null;
  onClose: () => void;
}> = ({ result, onClose }) => {
  if (!result) return null;

  return (
    <ModalDialog
      open={Boolean(result)}
      onClose={onClose}
      title="Hasil Pemeriksaan Keabsahan Dokumen"
      subtitle="Sistem Verifikasi Resmi Kantor Kementerian Agama Kabupaten Jepara"
      maxWidth="xl"
      footer={
        <button
          type="button"
          onClick={onClose}
          className="px-5 py-2 rounded-lg bg-[#0F684E] hover:bg-[#0B523D] text-white text-xs font-semibold transition"
        >
          Tutup Hasil Pemeriksaan
        </button>
      }
    >
      <div className="space-y-5">
        <div
          className={`rounded-xl p-4 border flex items-start justify-between gap-4 ${
            result.valid
              ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900'
              : 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/60'
          }`}
        >
          <div className="flex items-start gap-3">
            {result.valid ? (
              <ShieldCheck className="w-6 h-6 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <ShieldAlert className="w-6 h-6 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {result.type}
              </p>
              <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                {result.title}
              </h4>
              <p
                className={`text-xs font-bold mt-1 ${
                  result.valid
                    ? 'text-emerald-700 dark:text-emerald-400'
                    : 'text-amber-700 dark:text-amber-400'
                }`}
              >
                {result.statusLabel}
              </p>
            </div>
          </div>
          <KemenagLogo size="md" />
        </div>

        {result.details.length > 0 && (
          <dl className="divide-y divide-slate-200 dark:divide-emerald-950 border border-slate-200 dark:border-emerald-950 rounded-xl overflow-hidden">
            {result.details.map((row) => (
              <div
                key={row.label}
                className="px-4 py-2.5 grid grid-cols-1 sm:grid-cols-3 gap-1 bg-white dark:bg-[#0E1714]"
              >
                <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">{row.label}</dt>
                <dd className="text-xs font-semibold text-slate-900 dark:text-slate-100 sm:col-span-2 font-mono-num">
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        )}

        {result.found && (
          <div className="flex items-center justify-between gap-4 pt-2 border-t border-slate-200 dark:border-emerald-950">
            <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Dokumen ini tercatat pada arsip digital Bimbingan Perkawinan Mandiri Kemenag Kabupaten Jepara. Data NIK ditampilkan secara tersamar demi keamanan privasi.
            </div>
            <QRCodeBox value={result.code} size={74} className="shrink-0" />
          </div>
        )}

        {result.note && (
          <p className="text-xs text-slate-500 dark:text-slate-400">{result.note}</p>
        )}
      </div>
    </ModalDialog>
  );
};
