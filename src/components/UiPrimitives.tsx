import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { ConfirmOptions, ToastMessage } from '../store/useBimwinStore';
import { KEMENAG_LOGO_SVG } from '../data/jeparaData';
import { buildVerificationQrUrl, QrDocumentKind } from '../utils/qrVerification';

export const KemenagLogo: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const dim = size === 'sm' ? 'w-9 h-9' : size === 'lg' ? 'w-16 h-16' : 'w-11 h-11';
  return (
    <div className={`${dim} flex items-center justify-center shrink-0`}>
      <img
        src={KEMENAG_LOGO_SVG}
        alt="Logo Kementerian Agama"
        className="w-full h-full object-contain drop-shadow-[0_1px_1px_rgba(0,0,0,0.08)]"
      />
    </div>
  );
};

export const SamawaBrandHeader: React.FC<{
  subtitle?: string;
  hideSubtitleOnMobile?: boolean;
  subtitleTone?: 'muted' | 'emerald';
}> = ({ subtitle, hideSubtitleOnMobile = false, subtitleTone = 'muted' }) => (
  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
    <KemenagLogo size="sm" />
    <div className="min-w-0 flex flex-col justify-center">
      <img
        src="/assets/aistudio/samawa-logo-clean.png"
        alt="SAMAWA — Sarana Membangun Wawasan Keluarga"
        className="h-[16px] sm:h-[18px] w-auto self-start object-contain block"
      />
      {subtitle && (
        <span
          className={`mt-[4px] font-semibold text-[9px] leading-none uppercase tracking-[0.04em] truncate ${
            subtitleTone === 'emerald'
              ? 'text-[#0F684E] dark:text-emerald-400'
              : 'text-slate-600 dark:text-slate-300'
          } ${hideSubtitleOnMobile ? 'hidden sm:block' : 'block'}`}
        >
          {subtitle}
        </span>
      )}
    </div>
  </div>
);

export const QRCodeBox: React.FC<{
  value: string;
  kind?: QrDocumentKind;
  rawValue?: boolean;
  size?: number;
  className?: string;
  clickable?: boolean;
}> = ({ value, kind, rawValue = false, size = 96, className = '', clickable = true }) => {
  const [dataUrl, setDataUrl] = useState<string>('');
  const encodedPayload = rawValue
    ? value || 'BIMWIN-KEMENAG-JEPARA'
    : buildVerificationQrUrl(value || 'BIMWIN-KEMENAG-JEPARA', kind);

  useEffect(() => {
    let active = true;
    QRCode.toDataURL(encodedPayload, {
      width: Math.max(size * 3, 240),
      margin: 2,
      errorCorrectionLevel: 'M',
      color: { dark: '#094232', light: '#FFFFFF' },
    })
      .then((url) => {
        if (active) setDataUrl(url);
      })
      .catch(() => {
        if (active) setDataUrl('');
      });
    return () => {
      active = false;
    };
  }, [encodedPayload, size]);

  if (!dataUrl) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center text-[10px] text-slate-400 ${className}`}
      >
        QR
      </div>
    );
  }

  const imgEl = (
    <img
      src={dataUrl}
      alt={`QR Verifikasi ${value}`}
      width={size}
      height={size}
      className={`rounded-lg border border-slate-200 bg-white p-1 block ${className}`}
    />
  );

  if (clickable && /^https?:\/\//i.test(encodedPayload)) {
    return (
      <a
        href={encodedPayload}
        target="_blank"
        rel="noopener noreferrer"
        title={`Pindai atau klik untuk verifikasi: ${value}`}
        aria-label={`Verifikasi QR ${value}`}
        className="inline-block rounded-lg hover:ring-2 hover:ring-[#0F684E]/40 transition"
      >
        {imgEl}
      </a>
    );
  }

  return imgEl;
};

export const ModalDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  maxWidth?: 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '5xl';
  children: React.ReactNode;
  footer?: React.ReactNode;
}> = ({ open, onClose, title, subtitle, maxWidth = '2xl', children, footer }) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const widthMap: Record<NonNullable<typeof maxWidth>, string> = {
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/65 backdrop-blur-[2px] print-modal-root"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`w-full ${widthMap[maxWidth]} bg-white dark:bg-[#111C18] border border-slate-200 dark:border-emerald-950 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] print-modal-card`}
      >
        <div className="px-5 py-4 border-b border-slate-200 dark:border-emerald-950/80 flex items-start justify-between gap-4 bg-[#F8FAF9] dark:bg-[#0D1613] no-print">
          <div className="min-w-0">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 leading-snug">
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup dialog"
            className="w-8 h-8 rounded-lg border border-slate-200 dark:border-emerald-900 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-emerald-950/60 flex items-center justify-center shrink-0 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 print-modal-body">{children}</div>
        {footer && (
          <div className="px-4 sm:px-5 py-3.5 border-t border-slate-200 dark:border-emerald-950/80 bg-[#F8FAF9] dark:bg-[#0D1613] flex flex-wrap items-center justify-end gap-2.5 no-print">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export const ConfirmModal: React.FC<{
  options: ConfirmOptions | null;
  onClose: () => void;
}> = ({ options, onClose }) => {
  if (!options) return null;
  return (
    <ModalDialog
      open={Boolean(options)}
      onClose={onClose}
      title={options.title}
      maxWidth="md"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold border border-slate-300 dark:border-emerald-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-emerald-950 transition"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => {
              options.onConfirm();
              onClose();
            }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold text-white transition ${
              options.danger
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-[#0F684E] hover:bg-[#0B523D]'
            }`}
          >
            {options.confirmLabel || 'Konfirmasi'}
          </button>
        </>
      }
    >
      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{options.message}</p>
    </ModalDialog>
  );
};

export const ToastStack: React.FC<{
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;
  return (
    <div
      className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2 w-[calc(100vw-2rem)] sm:w-96 pointer-events-none no-print"
      aria-live="polite"
    >
      {toasts.map((toast) => {
        const Icon =
          toast.type === 'success'
            ? CheckCircle2
            : toast.type === 'error'
              ? AlertCircle
              : Info;
        const accent =
          toast.type === 'success'
            ? 'text-emerald-700 dark:text-emerald-400'
            : toast.type === 'error'
              ? 'text-red-600 dark:text-red-400'
              : 'text-amber-700 dark:text-amber-400';

        return (
          <div
            key={toast.id}
            className="pointer-events-auto bg-white dark:bg-[#111C18] border border-slate-200 dark:border-emerald-900 rounded-xl shadow-lg px-4 py-3 flex items-start gap-3"
          >
            <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${accent}`} />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{toast.title}</p>
              {toast.description && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                  {toast.description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              aria-label="Tutup notifikasi"
              className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
