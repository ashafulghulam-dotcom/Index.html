import React, { useEffect, useState } from 'react';
import {
  Check,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  Laptop,
  Smartphone,
  WifiOff,
} from 'lucide-react';
import { useOnlineStatus, usePWAInstall } from '../hooks/usePWAInstall';
import { getInstallSteps, InstallPlatform } from '../utils/pwaHelpers';
import { ModalDialog } from './UiPrimitives';

export const PWAInstallModal: React.FC<{
  open: boolean;
  onClose: () => void;
}> = ({ open, onClose }) => {
  const { isInstallable, isInstalled, platform, inIframe, installing, install } = usePWAInstall();
  const [selectedPlatform, setSelectedPlatform] = useState<InstallPlatform>(platform);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open) {
      setSelectedPlatform(platform);
      setCopied(false);
    }
  }, [open, platform]);

  const appUrl = typeof window !== 'undefined' ? window.location.origin + '/' : '/';
  const steps = getInstallSteps(selectedPlatform);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(appUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2400);
    } catch {
      setCopied(false);
    }
  };

  const handleDirectInstall = async () => {
    const outcome = await install();
    if (outcome === 'accepted') {
      onClose();
    }
  };

  return (
    <ModalDialog
      open={open}
      onClose={onClose}
      title="Download & Pasang Aplikasi SAMAWA"
      subtitle="Pasang langsung ke HP Android, iPhone, atau Laptop — berjalan penuh seperti APK tanpa Play Store"
      maxWidth="lg"
    >
      <div className="space-y-5">
        {/* App Identity Card */}
        <div className="flex items-center gap-4 p-4 rounded-xl bg-[#F8FAF9] dark:bg-[#0D1613] border border-slate-200 dark:border-emerald-950">
          <img
            src="/pwa-192x192.png"
            alt="Ikon Aplikasi SAMAWA"
            className="w-16 h-16 rounded-2xl border border-slate-200 dark:border-emerald-900 shadow-xs shrink-0 bg-white object-contain"
          />
          <div className="min-w-0 flex-1">
            <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
              SAMAWA — BIMWIN Kemenag Jepara
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Aplikasi Resmi • Ringan (&lt; 2 MB) • Siap Offline • Langsung Digunakan
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] font-semibold">
              <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/70 text-[#0F684E] dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-900">
                Android
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/70 text-[#0F684E] dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-900">
                iOS / iPhone
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/70 text-[#0F684E] dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-900">
                Windows / Mac
              </span>
            </div>
          </div>
        </div>

        {/* Status & Primary Direct Install Action */}
        {isInstalled ? (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#0F684E] dark:text-emerald-400 shrink-0" />
            <div>
              <p className="text-sm font-bold text-[#0F684E] dark:text-emerald-300">
                Aplikasi SAMAWA Sudah Terpasang
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                Anda saat ini sedang menggunakan aplikasi SAMAWA dalam mode aplikasi penuh.
              </p>
            </div>
          </div>
        ) : isInstallable ? (
          <div className="space-y-2.5">
            <button
              type="button"
              disabled={installing}
              onClick={handleDirectInstall}
              className="w-full py-3 px-4 rounded-xl bg-[#0F684E] hover:bg-[#0B523D] disabled:opacity-60 text-white text-sm font-semibold inline-flex items-center justify-center gap-2 shadow-xs transition"
            >
              <Download className="w-4 h-4" />
              {installing ? 'Memasang Aplikasi...' : 'Pasang Aplikasi SAMAWA Sekarang (1 Klik)'}
            </button>
            <p className="text-[11px] text-center text-slate-500 dark:text-slate-400">
              Konfirmasi pemasangan akan muncul otomatis dari browser perangkat Anda.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {inIframe && (
              <div className="p-3.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 space-y-2.5">
                <p className="text-xs text-amber-950 dark:text-amber-200 leading-relaxed">
                  Untuk mengaktifkan tombol <strong>Instal Otomatis 1 Klik</strong> di HP/Laptop, buka
                  halaman ini di tab browser penuh terlebih dahulu:
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href={appUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 rounded-lg bg-[#0F684E] hover:bg-[#0B523D] text-white text-xs font-semibold inline-flex items-center gap-1.5 transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Buka di Tab Baru untuk Instal
                  </a>
                  <button
                    type="button"
                    onClick={handleCopyUrl}
                    className="px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-white dark:bg-[#111C18] text-slate-700 dark:text-slate-200 text-xs font-semibold inline-flex items-center gap-1.5 hover:bg-slate-50 dark:hover:bg-emerald-950/60 transition"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#0F684E]" />
                        Tautan Disalin
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Salin Tautan
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Platform Selector Tabs */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Panduan Pasang Cepat Sesuai Perangkat
              </p>
              <div
                role="tablist"
                aria-label="Pilih perangkat pemasangan aplikasi"
                className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-emerald-950/50"
              >
                {(
                  [
                    { id: 'android', label: 'Android', icon: Smartphone },
                    { id: 'ios', label: 'iPhone / iOS', icon: Smartphone },
                    { id: 'desktop', label: 'Laptop / PC', icon: Laptop },
                  ] as const
                ).map((tab) => {
                  const Icon = tab.icon;
                  const active = selectedPlatform === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setSelectedPlatform(tab.id)}
                      className={`py-2 px-2.5 rounded-lg text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition ${
                        active
                          ? 'bg-white dark:bg-[#111C18] text-[#0F684E] dark:text-emerald-300 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3 Clear Steps */}
            <ol className="space-y-2.5">
              {steps.map((step, idx) => (
                <li
                  key={step.title}
                  className="flex items-start gap-3 p-3 rounded-xl bg-[#F8FAF9] dark:bg-[#0D1613] border border-slate-200/80 dark:border-emerald-950"
                >
                  <span className="w-6 h-6 rounded-full bg-[#0F684E] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 font-mono-num">
                    {idx + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-snug">
                      {step.title}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mt-0.5">
                      {step.detail}
                    </p>
                  </div>
                </li>
              ))}
            </ol>

            {!inIframe && (
              <div className="flex items-center justify-between gap-3 pt-1">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  Tautan aplikasi: <strong className="font-mono-num">{appUrl}</strong>
                </span>
                <button
                  type="button"
                  onClick={handleCopyUrl}
                  className="shrink-0 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-emerald-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-emerald-950/60 inline-flex items-center gap-1.5 transition"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#0F684E]" />
                      Disalin
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Salin Link
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </ModalDialog>
  );
};

export const PWAInstallHeaderButton: React.FC<{
  onOpenModal: () => void;
  compact?: boolean;
}> = ({ onOpenModal, compact = false }) => {
  const { isInstallable, isInstalled, installing, install } = usePWAInstall();

  // Hide automatically when already running as an installed standalone PWA
  if (isInstalled) {
    return null;
  }

  const handleClick = async () => {
    if (isInstallable) {
      const outcome = await install();
      if (outcome !== 'accepted') {
        onOpenModal();
      }
      return;
    }
    onOpenModal();
  };

  if (compact) {
    return (
      <button
        type="button"
        disabled={installing}
        onClick={handleClick}
        aria-label="Download Aplikasi SAMAWA"
        title="Download Aplikasi SAMAWA"
        className="px-2.5 py-2 rounded-lg border border-emerald-200 dark:border-emerald-900 bg-emerald-50/80 dark:bg-emerald-950/50 text-[#0F684E] dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-950 text-xs font-semibold inline-flex items-center gap-1.5 transition whitespace-nowrap"
      >
        <Download className="w-3.5 h-3.5 shrink-0" />
        <span className="hidden sm:inline">Download App</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      disabled={installing}
      onClick={handleClick}
      aria-label="Download Aplikasi SAMAWA"
      className="px-3 sm:px-3.5 py-2 rounded-lg border border-emerald-200 dark:border-emerald-900 bg-emerald-50/80 dark:bg-emerald-950/50 text-[#0F684E] dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-950 text-xs sm:text-sm font-semibold inline-flex items-center gap-1.5 transition whitespace-nowrap"
    >
      <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
      <span className="hidden sm:inline">Download App</span>
      <span className="sm:hidden">App</span>
    </button>
  );
};

export const PWAInstallDrawerItem: React.FC<{
  onOpenModal: () => void;
  onBeforeAction?: () => void;
  variant?: 'portal' | 'workspace';
}> = ({ onOpenModal, onBeforeAction, variant = 'portal' }) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();

  const handleClick = async () => {
    onBeforeAction?.();
    if (isInstallable && !isInstalled) {
      const outcome = await install();
      if (outcome !== 'accepted') {
        onOpenModal();
      }
      return;
    }
    onOpenModal();
  };

  if (variant === 'workspace') {
    return (
      <button
        type="button"
        onClick={handleClick}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg border border-emerald-200 dark:border-emerald-900 bg-emerald-50/70 dark:bg-emerald-950/40 text-xs font-semibold text-[#0F684E] dark:text-emerald-300 hover:bg-emerald-100/80 dark:hover:bg-emerald-950/70 transition"
      >
        <span className="flex items-center gap-2 min-w-0">
          {isInstalled ? (
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          ) : (
            <Download className="w-3.5 h-3.5 shrink-0" />
          )}
          <span className="truncate">
            {isInstalled ? 'Aplikasi Terpasang' : 'Download Aplikasi'}
          </span>
        </span>
        {!isInstalled && (
          <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#0F684E] text-white shrink-0">
            APK
          </span>
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="w-full text-left px-3 py-2.5 rounded-xl flex items-start gap-3 text-slate-700 dark:text-slate-200 hover:bg-emerald-50/80 dark:hover:bg-emerald-950/60 transition"
    >
      {isInstalled ? (
        <CheckCircle2 className="w-4 h-4 text-[#0F684E] dark:text-emerald-400 shrink-0 mt-0.5" />
      ) : (
        <Download className="w-4 h-4 text-[#0F684E] dark:text-emerald-400 shrink-0 mt-0.5" />
      )}
      <div className="min-w-0">
        <span className="block text-sm font-semibold leading-snug">
          {isInstalled ? 'Aplikasi SAMAWA Terpasang' : 'Download Aplikasi (APK / App)'}
        </span>
        <span className="block text-[11px] leading-snug mt-0.5 text-slate-500 dark:text-slate-400">
          {isInstalled
            ? 'Berjalan dalam mode aplikasi penuh'
            : 'Pasang langsung di HP Android, iOS, atau PC'}
        </span>
      </div>
    </button>
  );
};

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white shadow-lg no-print"
    >
      <WifiOff className="w-3.5 h-3.5 shrink-0" />
      <span>Mode Offline — Data tersimpan lokal</span>
    </div>
  );
};
