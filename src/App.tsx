import React, { useEffect, useState } from 'react';
import { AdminDashboard } from './components/AdminDashboard';
import { FasilitatorDashboard } from './components/FasilitatorDashboard';
import { PesertaDashboard } from './components/PesertaDashboard';
import { PublicPortal } from './components/PublicPortal';
import { OfflineIndicator, PWAInstallModal } from './components/PWAInstallControls';
import { ConfirmModal, ToastStack } from './components/UiPrimitives';
import { VerificationModal } from './components/VerificationModal';
import { BimwinProvider, useBimwin } from './store/useBimwinStore';
import { VerificationResult } from './types/bimwin';
import { verifyDocumentQuery } from './utils/bimwinLogic';
import { readVerificationCodeFromSearch } from './utils/qrVerification';

const BimwinRouter: React.FC = () => {
  const { data, currentUser, toasts, dismissToast, confirmDialog, closeConfirm } = useBimwin();

  const [urlVerifyCode, setUrlVerifyCode] = useState<string>(() =>
    typeof window !== 'undefined' ? readVerificationCodeFromSearch(window.location.search) : ''
  );
  const [globalVerifyResult, setGlobalVerifyResult] = useState<VerificationResult | null>(null);
  const [autoInstallOpen, setAutoInstallOpen] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return new URLSearchParams(window.location.search).get('install') === '1';
  });

  useEffect(() => {
    if (!urlVerifyCode) {
      setGlobalVerifyResult(null);
      return;
    }
    setGlobalVerifyResult(verifyDocumentQuery(urlVerifyCode, data.users, data.classes));
  }, [urlVerifyCode, data.users, data.classes]);

  const handleCloseGlobalVerify = () => {
    setUrlVerifyCode('');
    setGlobalVerifyResult(null);
    if (typeof window !== 'undefined' && window.location.search) {
      const url = new URL(window.location.href);
      url.searchParams.delete('cek');
      url.searchParams.delete('cek_kompak');
      url.searchParams.delete('cek_laporan');
      url.searchParams.delete('cek_absen');
      window.history.replaceState({}, '', url.pathname + url.search + url.hash);
    }
  };

  const handleCloseAutoInstall = () => {
    setAutoInstallOpen(false);
    if (typeof window !== 'undefined' && window.location.search.includes('install=')) {
      const url = new URL(window.location.href);
      url.searchParams.delete('install');
      window.history.replaceState({}, '', url.pathname + url.search + url.hash);
    }
  };

  let content: React.ReactNode;
  if (!currentUser) {
    content = <PublicPortal initialVerifyCode={urlVerifyCode} />;
  } else if (currentUser.role === 'Peserta') {
    content = <PesertaDashboard />;
  } else if (currentUser.role === 'Fasilitator') {
    content = <FasilitatorDashboard />;
  } else {
    content = <AdminDashboard />;
  }

  return (
    <>
      {content}
      <VerificationModal result={globalVerifyResult} onClose={handleCloseGlobalVerify} />
      <PWAInstallModal open={autoInstallOpen} onClose={handleCloseAutoInstall} />
      <ConfirmModal options={confirmDialog} onClose={closeConfirm} />
      <ToastStack toasts={toasts} onDismiss={dismissToast} />
      <OfflineIndicator />
    </>
  );
};

export default function App() {
  return (
    <BimwinProvider>
      <BimwinRouter />
    </BimwinProvider>
  );
}
