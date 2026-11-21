import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { DESA_PER_KUA_JEPARA, LIST_16_KUA } from '../data/jeparaData';
import { BimwinUser, EDUCATION_LEVEL_OPTIONS, EducationLevel, Gender } from '../types/bimwin';
import { RegisterPayload, useBimwin } from '../store/useBimwinStore';
import {
  addDaysToIsoDate,
  calculateAgeFromDob,
  getMinAkadDate,
  isUnderageMarriage,
  normalizeVillageName,
  validateRencanaAkadDate,
} from '../utils/bimwinLogic';
import { ModalDialog } from './UiPrimitives';

function getSortedDesaForKua(kua: string): string[] {
  return [...(DESA_PER_KUA_JEPARA[kua] || [])].sort((a, b) => a.localeCompare(b));
}

function buildInitialRegistrationForm(overrides?: Partial<RegisterPayload>): RegisterPayload {
  const defaultKua =
    overrides?.kua && LIST_16_KUA.includes(overrides.kua) ? overrides.kua : 'KUA Jepara';
  const sortedDesa = getSortedDesaForKua(defaultKua);
  const normalizedDesa = overrides?.desaTempatNikah
    ? normalizeVillageName(overrides.desaTempatNikah, defaultKua)
    : '';
  const defaultDesa = sortedDesa.includes(normalizedDesa)
    ? normalizedDesa
    : sortedDesa.includes('Kauman') && defaultKua === 'KUA Jepara'
      ? 'Kauman'
      : sortedDesa[0] || '';

  return {
    username: '',
    password: '',
    nama: '',
    nik: '',
    jenisKelamin: overrides?.jenisKelamin || 'Laki-laki',
    tempatLahir: overrides?.tempatLahir || 'Jepara',
    tanggalLahir: overrides?.tanggalLahir || '1999-05-15',
    pendidikan: overrides?.pendidikan || 'SLTA/SEDERAJAT',
    pekerjaan: '',
    noHp: '',
    email: '',
    kua: defaultKua,
    desaTempatNikah: defaultDesa,
    alamat: '',
    tanggalRencanaNikah:
      overrides?.tanggalRencanaNikah || addDaysToIsoDate(getMinAkadDate(), 30),
  };
}

interface PesertaRegistrationFormProps {
  form: RegisterPayload;
  setForm: React.Dispatch<React.SetStateAction<RegisterPayload>>;
  error: string;
  submitLabel: string;
  namePlaceholder?: string;
  lockPartnerConstraints?: boolean;
  onCancel: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

const PesertaRegistrationForm: React.FC<PesertaRegistrationFormProps> = ({
  form,
  setForm,
  error,
  submitLabel,
  namePlaceholder = 'Contoh: Muhammad Arfan',
  lockPartnerConstraints = false,
  onCancel,
  onSubmit,
}) => {
  const [showPass, setShowPass] = useState(false);

  const desaOptions = useMemo(() => getSortedDesaForKua(form.kua), [form.kua]);

  const computedAge = useMemo(
    () => calculateAgeFromDob(form.tanggalLahir),
    [form.tanggalLahir]
  );
  const underage = isUnderageMarriage(computedAge);
  const minAkadDate = useMemo(() => getMinAkadDate(), []);

  const handleKuaChange = (newKua: string) => {
    const firstDesa = getSortedDesaForKua(newKua)[0];
    setForm((prev) => ({ ...prev, kua: newKua, desaTempatNikah: firstDesa || '' }));
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4 text-xs sm:text-sm">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
            Nama Lengkap (Sesuai KTP) *
          </label>
          <input
            type="text"
            required
            value={form.nama}
            onChange={(e) => setForm({ ...form, nama: e.target.value })}
            placeholder={namePlaceholder}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-white dark:bg-[#0D1613] outline-none focus:border-[#0F684E]"
          />
        </div>
        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
            NIK (16 Digit Angka) *
          </label>
          <input
            type="text"
            required
            maxLength={16}
            value={form.nik}
            onChange={(e) => setForm({ ...form, nik: e.target.value.replace(/\D/g, '') })}
            placeholder="3320xxxxxxxxxxxx"
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-white dark:bg-[#0D1613] font-mono-num outline-none focus:border-[#0F684E]"
          />
        </div>
        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
            Username Akun *
          </label>
          <input
            type="text"
            required
            value={form.username}
            onChange={(e) =>
              setForm({ ...form, username: e.target.value.replace(/\s+/g, '').toLowerCase() })
            }
            placeholder="tanpa_spasi"
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-white dark:bg-[#0D1613] outline-none focus:border-[#0F684E]"
          />
        </div>
        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
            Kata Sandi (Min. 6 Karakter) *
          </label>
          <div className="relative">
            <input
              type={showPass ? 'text' : 'password'}
              required
              minLength={6}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Buat kata sandi"
              className="w-full pl-3 pr-9 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-white dark:bg-[#0D1613] outline-none focus:border-[#0F684E]"
            />
            <button
              type="button"
              onClick={() => setShowPass((v) => !v)}
              aria-label={showPass ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
            >
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
            Jenis Kelamin *{' '}
            {lockPartnerConstraints && (
              <span className="font-normal text-[11px] text-[#0F684E] dark:text-emerald-400">
                (Terkunci lawan jenis)
              </span>
            )}
          </label>
          <select
            value={form.jenisKelamin}
            disabled={lockPartnerConstraints}
            onChange={(e) => setForm({ ...form, jenisKelamin: e.target.value as Gender })}
            className={`w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 outline-none focus:border-[#0F684E] ${
              lockPartnerConstraints
                ? 'bg-slate-100 dark:bg-emerald-950/60 text-slate-600 dark:text-slate-300 cursor-not-allowed'
                : 'bg-white dark:bg-[#0D1613]'
            }`}
          >
            <option value="Laki-laki">Laki-laki (Calon Suami)</option>
            <option value="Perempuan">Perempuan (Calon Istri)</option>
          </select>
        </div>
        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
            No. WhatsApp Aktif *
          </label>
          <input
            type="tel"
            required
            value={form.noHp}
            onChange={(e) => setForm({ ...form, noHp: e.target.value })}
            placeholder="08xxxxxxxxxx"
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-white dark:bg-[#0D1613] font-mono-num outline-none focus:border-[#0F684E]"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
            Tempat Lahir *
          </label>
          <input
            type="text"
            required
            value={form.tempatLahir}
            onChange={(e) => setForm({ ...form, tempatLahir: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-white dark:bg-[#0D1613] outline-none focus:border-[#0F684E]"
          />
        </div>
        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
            Tanggal Lahir *{' '}
            {computedAge !== null && (
              <span className="font-mono-num text-slate-500">({computedAge} thn)</span>
            )}
          </label>
          <input
            type="date"
            required
            value={form.tanggalLahir}
            onChange={(e) => setForm({ ...form, tanggalLahir: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-white dark:bg-[#0D1613] font-mono-num outline-none focus:border-[#0F684E]"
          />
        </div>
      </div>

      {underage && (
        <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
          <div>
            <strong>Peringatan UU No. 16 Tahun 2019:</strong> Usia terdeteksi di bawah 19 tahun.
            Pendaftaran nikah di KUA wajib melampirkan Surat Penetapan Dispensasi Kawin dari
            Pengadilan Agama.
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
            KUA Kecamatan Tujuan Nikah *{' '}
            {lockPartnerConstraints && (
              <span className="font-normal text-[11px] text-[#0F684E] dark:text-emerald-400">
                (Harus sama)
              </span>
            )}
          </label>
          <select
            value={form.kua}
            disabled={lockPartnerConstraints}
            onChange={(e) => handleKuaChange(e.target.value)}
            className={`w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 outline-none focus:border-[#0F684E] ${
              lockPartnerConstraints
                ? 'bg-slate-100 dark:bg-emerald-950/60 text-slate-600 dark:text-slate-300 cursor-not-allowed'
                : 'bg-white dark:bg-[#0D1613]'
            }`}
          >
            {LIST_16_KUA.map((kua) => (
              <option key={kua} value={kua}>
                {kua}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
            Desa / Kelurahan Tempat Nikah *{' '}
            {lockPartnerConstraints && (
              <span className="font-normal text-[11px] text-[#0F684E] dark:text-emerald-400">
                (Harus sama)
              </span>
            )}
          </label>
          <select
            value={form.desaTempatNikah}
            disabled={lockPartnerConstraints}
            onChange={(e) => setForm({ ...form, desaTempatNikah: e.target.value })}
            className={`w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 outline-none focus:border-[#0F684E] ${
              lockPartnerConstraints
                ? 'bg-slate-100 dark:bg-emerald-950/60 text-slate-600 dark:text-slate-300 cursor-not-allowed'
                : 'bg-white dark:bg-[#0D1613]'
            }`}
          >
            {desaOptions.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="reg-pendidikan"
            className="block font-semibold text-slate-700 dark:text-slate-200 mb-1"
          >
            Pendidikan Terakhir
          </label>
          <select
            id="reg-pendidikan"
            aria-label="Pendidikan Terakhir"
            value={form.pendidikan}
            onChange={(e) => setForm({ ...form, pendidikan: e.target.value as EducationLevel })}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-white dark:bg-[#0D1613] outline-none focus:border-[#0F684E]"
          >
            {EDUCATION_LEVEL_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="reg-tanggal-akad"
            className="block font-semibold text-slate-700 dark:text-slate-200 mb-1"
          >
            Rencana Tanggal Akad Nikah *{' '}
            {lockPartnerConstraints && (
              <span className="font-normal text-[11px] text-[#0F684E] dark:text-emerald-400">
                (Harus sama)
              </span>
            )}
          </label>
          <input
            id="reg-tanggal-akad"
            type="date"
            required
            min={lockPartnerConstraints ? undefined : minAkadDate}
            disabled={lockPartnerConstraints}
            value={form.tanggalRencanaNikah}
            onChange={(e) => setForm({ ...form, tanggalRencanaNikah: e.target.value })}
            className={`w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 font-mono-num outline-none focus:border-[#0F684E] ${
              lockPartnerConstraints
                ? 'bg-slate-100 dark:bg-emerald-950/60 text-slate-600 dark:text-slate-300 cursor-not-allowed'
                : 'bg-white dark:bg-[#0D1613]'
            }`}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
            Email Aktif <span className="font-normal text-slate-500">(Untuk Pengingat)</span>
          </label>
          <input
            type="email"
            value={form.email || ''}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="nama@email.com"
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-white dark:bg-[#0D1613] outline-none focus:border-[#0F684E]"
          />
        </div>
        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
            Pekerjaan
          </label>
          <input
            type="text"
            value={form.pekerjaan}
            onChange={(e) => setForm({ ...form, pekerjaan: e.target.value })}
            placeholder="Contoh: Karyawan / Wirausaha"
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-white dark:bg-[#0D1613] outline-none focus:border-[#0F684E]"
          />
        </div>
        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
            Alamat Lengkap
          </label>
          <input
            type="text"
            value={form.alamat}
            onChange={(e) => setForm({ ...form, alamat: e.target.value })}
            placeholder="RT/RW, Desa, Kecamatan"
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-white dark:bg-[#0D1613] outline-none focus:border-[#0F684E]"
          />
        </div>
      </div>

      {error && (
        <p className="text-xs text-red-600 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-2.5 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 text-xs font-semibold text-slate-700 dark:text-slate-300"
        >
          Batal
        </button>
        <button
          type="submit"
          className="px-5 py-2 rounded-lg bg-[#0F684E] hover:bg-[#0B523D] text-white text-xs font-semibold transition"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
};

export const RegisterModal: React.FC<{ open: boolean; onClose: () => void }> = ({
  open,
  onClose,
}) => {
  const { registerPeserta } = useBimwin();
  const [form, setForm] = useState<RegisterPayload>(() => buildInitialRegistrationForm());
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const akadCheck = validateRencanaAkadDate(form.tanggalRencanaNikah);
    if (!akadCheck.ok) {
      setError(akadCheck.error || 'Rencana tanggal akad nikah tidak valid.');
      return;
    }
    const res = registerPeserta(form);
    if (!res.ok) {
      setError(res.error || 'Gagal mendaftar.');
      return;
    }
    onClose();
  };

  return (
    <ModalDialog
      open={open}
      onClose={onClose}
      title="Pendaftaran Calon Pengantin Baru"
      subtitle="Lengkapi identitas diri sesuai KTP dan pilih KUA Kecamatan tujuan nikah."
      maxWidth="2xl"
    >
      <PesertaRegistrationForm
        form={form}
        setForm={setForm}
        error={error}
        submitLabel="Daftar & Masuk Sekarang"
        onCancel={onClose}
        onSubmit={handleSubmit}
      />
    </ModalDialog>
  );
};

export const CreatePartnerModal: React.FC<{
  open: boolean;
  onClose: () => void;
  currentUser: BimwinUser;
}> = ({ open, onClose, currentUser }) => {
  const { createAndLinkPartner } = useBimwin();
  const buildPartnerDefaults = () =>
    buildInitialRegistrationForm({
      jenisKelamin: currentUser.jenisKelamin === 'Laki-laki' ? 'Perempuan' : 'Laki-laki',
      kua: currentUser.kua,
      desaTempatNikah: currentUser.desaTempatNikah,
      tanggalRencanaNikah: currentUser.tanggalRencanaNikah,
    });

  const [form, setForm] = useState<RegisterPayload>(buildPartnerDefaults);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setForm(buildPartnerDefaults());
      setError('');
    }
  }, [open, currentUser.id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const res = createAndLinkPartner(form);
    if (!res.ok) {
      setError(res.error || 'Gagal membuat akun pasangan.');
      return;
    }
    onClose();
  };

  return (
    <ModalDialog
      open={open}
      onClose={onClose}
      title="Buat & Hubungkan Akun Pasangan"
      subtitle={`Pasangan otomatis didaftarkan pada ${form.kua}, Desa ${form.desaTempatNikah}, rencana akad ${form.tanggalRencanaNikah || '-'}, dengan jenis kelamin ${form.jenisKelamin} agar langsung tersinkron.`}
      maxWidth="2xl"
    >
      <PesertaRegistrationForm
        form={form}
        setForm={setForm}
        error={error}
        submitLabel="Buat & Sinkronkan"
        lockPartnerConstraints
        namePlaceholder={
          form.jenisKelamin === 'Perempuan'
            ? 'Contoh: Siti Rahmawati'
            : 'Contoh: Muhammad Arfan'
        }
        onCancel={onClose}
        onSubmit={handleSubmit}
      />
    </ModalDialog>
  );
};

export const ForgotPasswordModal: React.FC<{ open: boolean; onClose: () => void }> = ({
  open,
  onClose,
}) => {
  const { resetPasswordRequest } = useBimwin();
  const [username, setUsername] = useState('');
  const [nikOrPhone, setNikOrPhone] = useState('');
  const [newPass, setNewPass] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const res = resetPasswordRequest(username, nikOrPhone, newPass);
    if (!res.ok) {
      setError(res.error || 'Gagal memperbarui kata sandi.');
      return;
    }
    setUsername('');
    setNikOrPhone('');
    setNewPass('');
    onClose();
  };

  return (
    <ModalDialog
      open={open}
      onClose={onClose}
      title="Pemulihan Kata Sandi Peserta"
      subtitle="Verifikasi menggunakan Username serta NIK 16 digit atau No. WhatsApp terdaftar."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-3.5 text-xs sm:text-sm">
        <div>
          <label className="block font-semibold mb-1">Username Terdaftar</label>
          <input
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value.replace(/\s+/g, ''))}
            placeholder="Contoh: ahmad_jepara"
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-white dark:bg-[#0D1613] outline-none focus:border-[#0F684E]"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">NIK (16 Digit) atau No. WhatsApp</label>
          <input
            type="text"
            required
            value={nikOrPhone}
            onChange={(e) => setNikOrPhone(e.target.value)}
            placeholder="3320... atau 08..."
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-white dark:bg-[#0D1613] font-mono-num outline-none focus:border-[#0F684E]"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Kata Sandi Baru (Min. 6 Karakter)</label>
          <input
            type="password"
            required
            minLength={6}
            value={newPass}
            onChange={(e) => setNewPass(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-white dark:bg-[#0D1613] outline-none focus:border-[#0F684E]"
          />
        </div>
        {error && (
          <p className="text-xs text-red-600 bg-red-50 dark:bg-red-950/30 rounded-lg px-3 py-2">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 text-xs font-semibold"
          >
            Batal
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-[#0F684E] hover:bg-[#0B523D] text-white text-xs font-semibold"
          >
            Simpan Kata Sandi Baru
          </button>
        </div>
      </form>
    </ModalDialog>
  );
};

export const KritikSaranModal: React.FC<{ open: boolean; onClose: () => void }> = ({
  open,
  onClose,
}) => {
  const { submitKritikSaran } = useBimwin();
  const [nama, setNama] = useState('');
  const [kua, setKua] = useState('KUA Jepara');
  const [pesan, setPesan] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim() || !pesan.trim()) return;
    submitKritikSaran(nama, kua, pesan);
    setNama('');
    setPesan('');
    onClose();
  };

  return (
    <ModalDialog
      open={open}
      onClose={onClose}
      title="Kotak Kritik, Saran & Aspirasi Publik"
      subtitle="Masukan Anda membantu peningkatan kualitas layanan Bimbingan Perkawinan 16 KUA Jepara."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-3.5 text-xs sm:text-sm">
        <div>
          <label className="block font-semibold mb-1">Nama Lengkap *</label>
          <input
            type="text"
            required
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            placeholder="Nama Anda"
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-white dark:bg-[#0D1613] outline-none focus:border-[#0F684E]"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Unit KUA Terkait</label>
          <select
            value={kua}
            onChange={(e) => setKua(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-white dark:bg-[#0D1613] outline-none focus:border-[#0F684E]"
          >
            {LIST_16_KUA.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-semibold mb-1">Uraian Kritik / Saran *</label>
          <textarea
            rows={4}
            required
            value={pesan}
            onChange={(e) => setPesan(e.target.value)}
            placeholder="Tuliskan saran perbaikan layanan, jadwal kelas, atau materi Bimwin..."
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-white dark:bg-[#0D1613] outline-none focus:border-[#0F684E]"
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 text-xs font-semibold"
          >
            Batal
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-[#0F684E] hover:bg-[#0B523D] text-white text-xs font-semibold"
          >
            Kirim Masukan
          </button>
        </div>
      </form>
    </ModalDialog>
  );
};

export const PanduanModal: React.FC<{ open: boolean; onClose: () => void }> = ({
  open,
  onClose,
}) => {
  const [tab, setTab] = useState<'peserta' | 'fasilitator' | 'adminkua' | 'superadmin'>('peserta');

  const steps = [
    {
      no: '01',
      title: 'Registrasi & Sinkron Pasangan',
      desc: 'Daftar memakai NIK 16 digit & KUA tujuan, lalu tautkan username pasangan (atau buat akun pasangan otomatis) untuk membuka akses Pretest.',
    },
    {
      no: '02',
      title: 'Pretest Awal (5 Soal)',
      desc: 'Kerjakan evaluasi pemahaman awal calon pengantin sebagai tolok ukur sebelum memasuki materi kurikulum nasional.',
    },
    {
      no: '03',
      title: '5 Modul Nasional & Kuis (≥80%)',
      desc: 'Pelajari ringkasan modul, tonton video materi resmi, dan tuntaskan seluruh kuis evaluasi tiap modul hingga minimal skor 80%.',
    },
    {
      no: '04',
      title: 'Postest Akhir (Before-After)',
      desc: 'Selesaikan 5 soal Postest untuk mengukur peningkatan pemahaman (Before-After Gain) pasca pembelajaran mandiri.',
    },
    {
      no: '05',
      title: 'Skrining Gizi & Piagam Kompak',
      desc: 'Isi cek kesiapan gizi/stunting (IMT, LiLA, Hb) serta susun Komitmen Bersama pasangan pada fitur Piagam Kami Kompak.',
    },
    {
      no: '06',
      title: 'Survei Kepuasan (IKM)',
      desc: 'Berikan penilaian mutu layanan Bimbingan Perkawinan (1–5 bintang) dan masukan konstruktif di menu SELESAI.',
    },
    {
      no: '07',
      title: 'Kelas Tatap Muka & Verifikasi',
      desc: 'Pilih jadwal kelas Online/Offline KUA, tunjukkan QR Kartu Peserta saat absensi, dan tunggu pengesahan Fasilitator.',
    },
    {
      no: '08',
      title: 'Unduh 4 Dokumen Resmi Ber-QR',
      desc: 'Unduh Sertifikat Bimwin A4, Piagam Kami Kompak A4, Rapor Portofolio Catin, serta Kartu Story siap dibagikan.',
    },
  ];

  const roleVisuals: Record<
    typeof tab,
    {
      image: string;
      alt: string;
      kicker: string;
      heading: string;
      summary: string;
      highlights: Array<{ title: string; detail: string }>;
      proTip: string;
    }
  > = {
    peserta: {
      image: '/src/assets/images/buku_saku_peserta_1795196493180.webp',
      alt: 'Ilustrasi Buku Saku Peserta Calon Pengantin SAMAWA Kemenag Jepara',
      kicker: 'ALUR CALON PENGANTIN (CATIN)',
      heading: '8 Langkah Wajib Menuju Sertifikat BIMWIN Resmi',
      summary:
        'Seluruh calon pengantin yang mendaftar nikah di 16 KUA Kabupaten Jepara menempuh pembelajaran mandiri MOOC secara berurutan, dilanjutkan sesi pendampingan kelas KUA sebelum penerbitan Sertifikat ber-QR Code.',
      highlights: [
        {
          title: 'Keamanan Identitas & Penguncian Biodata',
          detail:
            'Pastikan nama lengkap, TTL, dan desa tempat nikah sudah benar sebelum Fasilitator mengesahkan kelulusan. Setelah terverifikasi, identitas sertifikat dikunci demi keabsahan dokumen.',
        },
        {
          title: 'Verifikasi QR Code Resmi',
          detail:
            'Setiap Sertifikat, Piagam Kami Kompak, dan Kartu Peserta memuat QR Code aktif yang dapat dipindai kamera HP atau menu Verifikasi Dokumen untuk membuktikan keasliannya.',
        },
        {
          title: 'Pasang sebagai Aplikasi HP',
          detail:
            'Gunakan tombol "Download App" di bagian atas agar portal SAMAWA dapat dibuka langsung dari layar utama ponsel Android/iPhone maupun laptop.',
        },
      ],
      proTip:
        'Tip Cepat: Kedua calon mempelai wajib menautkan akun pasangan terlebih dahulu di langkah 01 agar Piagam Kami Kompak dapat diterbitkan bersama secara otomatis.',
    },
    fasilitator: {
      image: '/src/assets/images/buku_saku_fasilitator_1795196488524.webp',
      alt: 'Ilustrasi Buku Saku Fasilitator KUA BIMWIN Jepara',
      kicker: 'PANDUAN FASILITATOR & PENGHULU KUA',
      heading: 'Pendampingan Kelas, Scan QR Absensi, dan Pengesahan Kelulusan',
      summary:
        'Fasilitator bertugas memantau capaian belajar calon pengantin di wilayah KUA masing-masing, menyelenggarakan kelas tatap muka/daring, memverifikasi kehadiran berbasis QR Code, serta menerbitkan pengesahan kelulusan.',
      highlights: [
        {
          title: '1. Verifikasi Progres MOOC & Pengesahan',
          detail:
            'Pantau status Pretest, 5 Modul, dan Postest pada tabel peserta binaan. Sistem mengunci tombol pengesahan bagi peserta yang belum tuntas, dan menyediakan tombol 1-klik "Sahkan Semua yang Tuntas MOOC".',
        },
        {
          title: '2. Jadwal Kelas & Scan QR Kehadiran',
          detail:
            'Buat jadwal kelas Online/Offline, cetak Daftar Hadir A4 ber-QR Code, lalu gunakan fitur "Verifikasi Kode / Pindai QR Kelas" dengan kamera atau unggah foto QR untuk mencatat kehadiran peserta secara akurat.',
        },
        {
          title: '3. Konsultasi & Mediasi Pasca Nikah',
          detail:
            'Tanggapi pertanyaan calon pengantin secara langsung menggunakan balasan cepat atau catatan personal, serta tangani eskalasi konseling/mediasi keluarga sakinah.',
        },
        {
          title: '4. Profil Petugas & Keamanan Akun',
          detail:
            'Perbarui nama lengkap beserta gelar, NIP, jabatan, dan nomor WhatsApp di tab Profil Fasilitator, serta kelola username dan kata sandi mandiri di tab Ubah Username & Sandi.',
        },
      ],
      proTip:
        'Tip Operasional: Cetak Daftar Hadir A4 sebelum kelas dimulai agar QR Code absensi dapat langsung dipindai oleh petugas maupun peserta saat sesi berlangsung.',
    },
    adminkua: {
      image: '/src/assets/images/buku_saku_admin_kua_1795196486395.webp',
      alt: 'Ilustrasi Buku Saku Admin KUA Kecamatan Jepara',
      kicker: 'PANDUAN OPERATOR & ADMIN KUA',
      heading: 'Kendali Mutu Kecamatan, Data Catin, & Laporan Eksekutif',
      summary:
        'Admin KUA mengelola tata kelola data Bimbingan Perkawinan di tingkat kecamatan, memastikan kelengkapan biodata peserta, memantau skrining gizi/stunting, dan menyusun laporan berkala untuk Kepala KUA.',
      highlights: [
        {
          title: '1. Analitik Kecamatan & Sebaran Desa',
          detail:
            'Pantau persentase kelulusan, jumlah pasangan tersinkronisasi, capaian Before-After Gain, skor Survei IKM, serta klasifikasi kesiapan gizi calon pengantin per desa/kelurahan.',
        },
        {
          title: '2. Validasi Biodata & Pratinjau Sertifikat',
          detail:
            'Bantu pembaruan data calon pengantin bila terdapat kekeliruan penulisan, tinjau pratinjau Sertifikat resmi peserta lulus, serta ekspor rekap CSV dengan NIK tersamar demi perlindungan data pribadi.',
        },
        {
          title: '3. Broadcast Pengingat & Cetak Laporan A4',
          detail:
            'Kirim notifikasi pengingat jadwal kelas atau penyelesaian modul secara massal ke peserta KUA, serta unduh Laporan Eksekutif A4 ber-QR Code untuk dokumentasi arsip.',
        },
        {
          title: '4. Profil Operator & Keamanan Akun',
          detail:
            'Lengkapi identitas petugas (nama & gelar, jabatan, NIP, WhatsApp, alamat KUA) sekaligus ubah username & kata sandi pribadi di menu "Profil & Keamanan Akun".',
        },
      ],
      proTip:
        'Tip Pelaporan: Gunakan filter KUA/desa sebelum mengekspor CSV atau mencetak Laporan Eksekutif A4 agar rekap sesuai periode evaluasi bulanan KUA.',
    },
    superadmin: {
      image: '/src/assets/images/buku_saku_superadmin_1795196493897.webp',
      alt: 'Ilustrasi Buku Saku SuperAdmin Seksi Bimas Islam Kemenag Jepara',
      kicker: 'PANDUAN SUPERADMIN BIMAS ISLAM KEMENAG JEPARA',
      heading: 'Supervisi 16 KUA, Kurikulum LMS, & Tata Kelola Sistem',
      summary:
        'SuperAdmin Seksi Bimbingan Masyarakat Islam mengendalikan ekosistem SAMAWA lintas 16 KUA se-Kabupaten Jepara, mulai dari pemantauan peta kepatuhan hingga manajemen kurikulum, pejabat penandatangan, dan cadangan data.',
      highlights: [
        {
          title: '1. Peta Kepatuhan (Heatmap) 16 KUA',
          detail:
            'Monitor performa seluruh 16 KUA secara real-time, lakukan drill-down hingga tingkat desa/kelurahan, dan cetak Laporan Eksekutif Kabupaten ber-QR verifikasi resmi.',
        },
        {
          title: '2. Manajemen Kurikulum LMS & Kuis',
          detail:
            'Kelola 5 Modul Nasional (judul, tautan video YouTube, ringkasan, dan bank soal kuis), bank soal Pretest/Postest, serta kuis kecocokan pasangan tanpa memerlukan perubahan kode.',
        },
        {
          title: '3. Manajemen Akun Petugas & Pengaturan Resmi',
          detail:
            'Tambah atau kelola akun Admin KUA dan Fasilitator, atur nama/NIP Kepala Kantor penandatangan sertifikat, kelola Galeri, FAQ, Dokumen Unduhan, serta mode pemeliharaan sistem.',
        },
        {
          title: '4. Audit Trail, Backup JSON & Profil Pimpinan',
          detail:
            'Pantau seluruh riwayat aktivitas petugas di Audit Trail, lakukan Backup/Restore cadangan data JSON secara berkala, serta perbarui profil dan kredensial Anda di menu "Profil & Keamanan Akun".',
        },
      ],
      proTip:
        'Tip Keamanan: Lakukan ekspor Backup Data JSON secara rutin di tab Pengaturan dan segera ganti kata sandi bawaan seluruh akun petugas melalui menu Profil & Keamanan Akun.',
    },
  };

  const activeGuide = roleVisuals[tab];

  return (
    <ModalDialog
      open={open}
      onClose={onClose}
      title="Panduan Aplikasi SAMAWA Kemenag Jepara"
      subtitle="Panduan operasional lengkap dengan ilustrasi alur kerja untuk Peserta, Fasilitator, Admin KUA, dan SuperAdmin Kemenag."
      maxWidth="4xl"
    >
      <div className="space-y-5">
        <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-emerald-950 pb-3">
          {(
            [
              { id: 'peserta', label: '1. Peserta (8 Langkah)' },
              { id: 'fasilitator', label: '2. Fasilitator KUA' },
              { id: 'adminkua', label: '3. Admin KUA' },
              { id: 'superadmin', label: '4. Admin Kemenag' },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
                tab === item.id
                  ? 'bg-[#0F684E] text-white'
                  : 'bg-slate-100 dark:bg-emerald-950/50 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-emerald-900/50'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Visual Editorial Header Card */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center rounded-2xl border border-slate-200 dark:border-emerald-950 bg-[#F8FAF9] dark:bg-[#0D1613] overflow-hidden p-3 sm:p-4">
          <div className="md:col-span-5">
            <div className="aspect-[16/10] w-full overflow-hidden rounded-xl border border-slate-200 dark:border-emerald-900/80 bg-emerald-950/10">
              <img
                src={activeGuide.image}
                alt={activeGuide.alt}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="md:col-span-7 space-y-2 px-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#0F684E] dark:text-emerald-400">
              {activeGuide.kicker}
            </p>
            <h3 className="font-display text-lg sm:text-xl font-semibold text-slate-900 dark:text-white leading-snug">
              {activeGuide.heading}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {activeGuide.summary}
            </p>
          </div>
        </div>

        {tab === 'peserta' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {steps.map((s) => (
              <div
                key={s.no}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-emerald-950 bg-white dark:bg-[#111C18] space-y-1.5"
              >
                <span className="font-mono-num text-xs font-bold text-[#0F684E] dark:text-emerald-400">
                  LANGKAH {s.no}
                </span>
                <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                  {s.title}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {activeGuide.highlights.map((item) => (
            <div
              key={item.title}
              className="p-3.5 rounded-xl border border-slate-200 dark:border-emerald-950 bg-white dark:bg-[#111C18] flex items-start gap-2.5"
            >
              <CheckCircle2 className="w-4 h-4 text-[#0F684E] dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                  {item.title}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {item.detail}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="p-3.5 rounded-xl bg-[#0F684E]/8 dark:bg-emerald-950/50 border border-[#0F684E]/25 dark:border-emerald-800/60 text-xs text-slate-700 dark:text-emerald-100 leading-relaxed">
          {activeGuide.proTip}
        </div>
      </div>
    </ModalDialog>
  );
};
