import React, { useEffect, useState } from 'react';
import { CheckCircle2, Eye, EyeOff, KeyRound, ShieldCheck, UserCheck } from 'lucide-react';
import { useBimwin } from '../store/useBimwinStore';

export const AccountSecurityCard: React.FC<{
  roleDisplay: string;
}> = ({ roleDisplay }) => {
  const { currentUser, updateOwnCredentials } = useBimwin();
  const [newUsername, setNewUsername] = useState(currentUser?.username || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (currentUser?.username) {
      setNewUsername(currentUser.username);
    }
  }, [currentUser?.username]);

  if (!currentUser) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const res = updateOwnCredentials({
      currentPassword,
      newUsername,
      newPassword,
      confirmPassword,
    });

    if (!res.ok) {
      setErrorMsg(res.error || 'Gagal menyimpan perubahan kredensial.');
      return;
    }

    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setSuccessMsg(
      'Username dan/atau kata sandi berhasil diperbarui. Gunakan kredensial terbaru saat masuk berikutnya.'
    );
  };

  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <h2 className="font-display text-2xl font-semibold text-slate-900 dark:text-white">
          Ubah Username &amp; Kata Sandi
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Perbarui username login dan kata sandi akun Anda secara mandiri dengan verifikasi keamanan.
        </p>
      </div>

      {/* Active Account Identity Summary */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#111C18] border border-slate-200 dark:border-emerald-950 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-900 flex items-center justify-center text-[#0F684E] dark:text-emerald-400 shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
              {currentUser.nama}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              {roleDisplay} · {currentUser.kua}
            </p>
          </div>
        </div>
        <div className="px-3 py-1.5 rounded-lg bg-[#F8FAF9] dark:bg-[#0D1613] border border-slate-200 dark:border-emerald-950 text-xs">
          <span className="text-slate-500 dark:text-slate-400">Username aktif: </span>
          <strong className="font-mono-num text-[#0F684E] dark:text-emerald-300">
            @{currentUser.username}
          </strong>
        </div>
      </div>

      {/* Credential Change Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-[#111C18] border border-slate-200 dark:border-emerald-950 rounded-2xl p-5 sm:p-6 space-y-4 text-xs sm:text-sm"
      >
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-emerald-950">
          <KeyRound className="w-4 h-4 text-[#0F684E] dark:text-emerald-400 shrink-0" />
          <h3 className="font-bold text-slate-900 dark:text-white">
            Pengaturan Kredensial Login
          </h3>
        </div>

        <div>
          <label
            htmlFor="cred-new-username"
            className="block font-semibold text-slate-700 dark:text-slate-200 mb-1"
          >
            Username Login
          </label>
          <input
            id="cred-new-username"
            type="text"
            required
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value.replace(/\s+/g, '').toLowerCase())}
            placeholder="Masukkan username baru"
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-emerald-900 bg-[#F8FAF9] dark:bg-[#0D1613] font-mono-num outline-none focus:border-[#0F684E]"
          />
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Minimal 4 karakter tanpa spasi (huruf kecil, angka, titik, atau garis bawah).
          </p>
        </div>

        <div>
          <label
            htmlFor="cred-current-password"
            className="block font-semibold text-slate-700 dark:text-slate-200 mb-1"
          >
            Kata Sandi Saat Ini <span className="text-red-600">*</span>
          </label>
          <div className="relative">
            <input
              id="cred-current-password"
              type={showCurrent ? 'text' : 'password'}
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Masukkan kata sandi Anda saat ini"
              className="w-full pl-3.5 pr-10 py-2.5 rounded-lg border border-slate-300 dark:border-emerald-900 bg-[#F8FAF9] dark:bg-[#0D1613] outline-none focus:border-[#0F684E]"
            />
            <button
              type="button"
              onClick={() => setShowCurrent((v) => !v)}
              aria-label="Tampilkan kata sandi saat ini"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            >
              {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
          <div>
            <label
              htmlFor="cred-new-password"
              className="block font-semibold text-slate-700 dark:text-slate-200 mb-1"
            >
              Kata Sandi Baru
            </label>
            <div className="relative">
              <input
                id="cred-new-password"
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Kosongkan jika tidak diganti"
                className="w-full pl-3.5 pr-10 py-2.5 rounded-lg border border-slate-300 dark:border-emerald-900 bg-[#F8FAF9] dark:bg-[#0D1613] outline-none focus:border-[#0F684E]"
              />
              <button
                type="button"
                onClick={() => setShowNew((v) => !v)}
                aria-label="Tampilkan kata sandi baru"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Minimal 6 karakter. Kosongkan jika hanya mengganti username.
            </p>
          </div>

          <div>
            <label
              htmlFor="cred-confirm-password"
              className="block font-semibold text-slate-700 dark:text-slate-200 mb-1"
            >
              Konfirmasi Kata Sandi Baru
            </label>
            <div className="relative">
              <input
                id="cred-confirm-password"
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ulangi kata sandi baru"
                className="w-full pl-3.5 pr-10 py-2.5 rounded-lg border border-slate-300 dark:border-emerald-900 bg-[#F8FAF9] dark:bg-[#0D1613] outline-none focus:border-[#0F684E]"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                aria-label="Tampilkan konfirmasi kata sandi baru"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {errorMsg && (
          <div
            role="alert"
            className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs font-medium text-red-700 dark:text-red-300"
          >
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div
            role="status"
            className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 text-xs font-medium text-[#0F684E] dark:text-emerald-300 flex items-start gap-2"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-[#0F684E] dark:text-emerald-400 shrink-0" />
            <span>Perubahan langsung tersimpan &amp; tercatat pada log keamanan.</span>
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-[#0F684E] hover:bg-[#0B523D] text-white text-xs sm:text-sm font-semibold inline-flex items-center gap-2 transition"
          >
            <KeyRound className="w-4 h-4" />
            Simpan Perubahan Akun
          </button>
        </div>
      </form>
    </div>
  );
};
