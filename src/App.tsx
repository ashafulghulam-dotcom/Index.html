import React, { useEffect, useState } from 'react';
import { AdminDashboard } from './components/AdminDashboard';
import { ErrorBoundary } from './components/ErrorBoundary';
import { FasilitatorDashboard } from './components/FasilitatorDashboard';
import { OfficerInactivityGuard, PWAUpdatePrompt } from './components/OperationalPanels';
import { PesertaDashboard } from './components/PesertaDashboard';
import { PublicPortal } from './components/PublicPortal';
import { OfflineIndicator, PWAInstallModal } from './components/PWAInstallControls';
import { ConfirmModal, ToastStack } from './components/UiPrimitives';
import { VerificationModal } from './components/VerificationModal';
import { verifyCertificateFromCloud } from './firebase';
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
    if (!urlVerifyCode || urlVerifyCode === 'verifikasi') {
      setGlobalVerifyResult(null);
      return;
    }
    const localResult = verifyDocumentQuery(urlVerifyCode, data.users, data.classes);
    if (localResult.found) {
      setGlobalVerifyResult(localResult);
      return;
    }
    let cancelled = false;
    verifyCertificateFromCloud(urlVerifyCode)
      .then((cloudCert) => {
        if (cancelled) return;
        if (cloudCert) {
          setGlobalVerifyResult({
            found: true,
            type: 'Sertifikat Bimwin',
            code: cloudCert.certCode,
            title: `Sertifikat ${cloudCert.documentType} Terverifikasi Cloud`,
            statusLabel: cloudCert.status === 'valid' ? 'SAH · TERVERIFIKASI CLOUD' : 'DICABUT',
            valid: cloudCert.status === 'valid',
            details: [
              { label: 'Nomor Sertifikat', value: cloudCert.certificateNumber },
              { label: 'Nama Peserta', value: cloudCert.participantName },
              ...(cloudCert.partnerName
                ? [{ label: 'Nama Pasangan', value: cloudCert.partnerName }]
                : []),
              { label: 'KUA Kecamatan', value: cloudCert.kua },
              { label: 'Tanggal Terbit', value: cloudCert.issuedAt },
            ],
            note: 'Data keabsahan ditarik langsung dari basis data Cloud Firestore Kemenag Kab. Jepara.',
          });
        } else {
          setGlobalVerifyResult(localResult);
        }
      })
      .catch(() => {
        if (!cancelled) setGlobalVerifyResult(localResult);
      });
    return () => {
      cancelled = true;
    };
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
      <OfficerInactivityGuard />
      <PWAUpdatePrompt />
      <OfflineIndicator />
    </>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <BimwinProvider>
        <BimwinRouter />
      </BimwinProvider>
    </ErrorBoundary>
  );
}
