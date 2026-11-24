import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    let friendly = error?.message || 'Terjadi kendala tak terduga pada aplikasi.';
    try {
      const parsed = JSON.parse(friendly) as { error?: string; operationType?: string; path?: string };
      if (parsed && parsed.error && parsed.operationType) {
        friendly = `Akses database (${parsed.operationType} · ${parsed.path || '-'}): ${parsed.error}`;
      }
    } catch {
      // Plain error message
    }
    return { hasError: true, message: friendly };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error('SAMAWA ErrorBoundary caught:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8FAF9] dark:bg-[#0A110F] p-6">
          <div className="max-w-md w-full rounded-2xl bg-white dark:bg-[#111C18] border border-slate-200 dark:border-emerald-950 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h1 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                Gangguan Sementara Terdeteksi
              </h1>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Aplikasi SAMAWA menangkap kendala sistem agar data Anda tetap aman. Silakan muat ulang halaman untuk melanjutkan.
            </p>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#0D1613] border border-slate-200 dark:border-emerald-950 text-[11px] font-mono-num text-slate-600 dark:text-slate-300 break-words">
              {this.state.message}
            </div>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#0F684E] hover:bg-[#0B523D] text-white text-xs font-semibold transition"
            >
              <RefreshCw className="w-4 h-4" />
              Muat Ulang Aplikasi SAMAWA
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
