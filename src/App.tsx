import React, { useMemo } from 'react';
import { AdminDashboard } from './components/AdminDashboard';
import { FasilitatorDashboard } from './components/FasilitatorDashboard';
import { PesertaDashboard } from './components/PesertaDashboard';
import { PublicPortal } from './components/PublicPortal';
import { ConfirmModal, ToastStack } from './components/UiPrimitives';
import { BimwinProvider, useBimwin } from './store/useBimwinStore';

const BimwinRouter: React.FC = () => {
  const { currentUser, toasts, dismissToast, confirmDialog, closeConfirm } = useBimwin();

  const initialVerifyCode = useMemo(() => {
    if (typeof window === 'undefined') return '';
    const params = new URLSearchParams(window.location.search);
    return params.get('cek') || params.get('cek_kompak') || params.get('cek_laporan') || '';
  }, []);

  let content: React.ReactNode;
  if (!currentUser) {
    content = <PublicPortal initialVerifyCode={initialVerifyCode} />;
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
      <ConfirmModal options={confirmDialog} onClose={closeConfirm} />
      <ToastStack toasts={toasts} onDismiss={dismissToast} />
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
