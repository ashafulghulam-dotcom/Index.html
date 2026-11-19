import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { DESA_PER_KUA_JEPARA, LIST_16_KUA } from '../data/jeparaData';
import { BimwinUser, EducationLevel, Gender } from '../types/bimwin';
import { RegisterPayload, useBimwin } from '../store/useBimwinStore';
import {
  calculateAgeFromDob,
  isUnderageMarriage,
  normalizeVillageName,
} from '../utils/bimwinLogic';
import { ModalDialog } from './UiPrimitives';

const EDUCATION_OPTIONS: EducationLevel[] = [
  'SD / MI',
  'SMP / MTs',
  'SMA / MA / SMK',
  'D1 / D2 / D3',
  'S1 / D4',
  'S2 / S3',
];

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
    pendidikan: overrides?.pendidikan || 'S1 / D4',
    pekerjaan: '',
    noHp: '',
    kua: defaultKua,
    desaTempatNikah: defaultDesa,
    alamat: '',
    tanggalRencanaNikah: overrides?.tanggalRencanaNikah || '2026-06-20',
  };
}

interface PesertaRegistrationFormProps {
  form: RegisterPayload;
  setForm: React.Dispatch<React.SetStateAction<RegisterPayload>>;
  error: string;
  submitLabel: string;
  namePlaceholder?: string;
  onCancel: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

const PesertaRegistrationForm: React.FC<PesertaRegistrationFormProps> = ({
  form,
  setForm,
  error,
  submitLabel,
  namePlaceholder = 'Contoh: Muhammad Arfan',
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
            Jenis Kelamin *
          </label>
          <select
            value={form.jenisKelamin}
            onChange={(e) => setForm({ ...form, jenisKelamin: e.target.value as Gender })}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-white dark:bg-[#0D1613] outline-none focus:border-[#0F684E]"
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
            KUA Kecamatan Tujuan Nikah *
          </label>
          <select
            value={form.kua}
            onChange={(e) => handleKuaChange(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-white dark:bg-[#0D1613] outline-none focus:border-[#0F684E]"
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
            Desa / Kelurahan Tempat Nikah *
          </label>
          <select
            value={form.desaTempatNikah}
            onChange={(e) => setForm({ ...form, desaTempatNikah: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-white dark:bg-[#0D1613] outline-none focus:border-[#0F684E]"
          >
            {desaOptions.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
            Pendidikan Terakhir
          </label>
          <select
            value={form.pendidikan}
            onChange={(e) => setForm({ ...form, pendidikan: e.target.value as EducationLevel })}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-white dark:bg-[#0D1613] outline-none focus:border-[#0F684E]"
          >
            {EDUCATION_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
            Rencana Tanggal Akad Nikah
          </label>
          <input
            type="date"
            value={form.tanggalRencanaNikah}
            onChange={(e) => setForm({ ...form, tanggalRencanaNikah: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-white dark:bg-[#0D1613] font-mono-num outline-none focus:border-[#0F684E]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
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
      subtitle={`Lengkapi identitas pasangan sesuai KTP agar langsung terdaftar di ${form.kua} dan tersinkron dengan akun Anda.`}
      maxWidth="2xl"
    >
      <PesertaRegistrationForm
        form={form}
        setForm={setForm}
        error={error}
        submitLabel="Buat & Sinkronkan"
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
    { no: '01', title: 'Wajib Sinkron Pasangan', desc: 'Tautkan username akun pasangan (atau buat otomatis) untuk membuka gembok Pretest.' },
    { no: '02', title: 'Pretest Awal (5 Soal)', desc: 'Ukur pemahaman awal calon pengantin sebelum mempelajari kurikulum.' },
    { no: '03', title: '5 Modul & Kuis (≥80%)', desc: 'Baca ringkasan, tonton video pembelajaran, dan selesaikan 5 kuis modul.' },
    { no: '04', title: 'Postest Akhir (5 Soal)', desc: 'Evaluasi peningkatan pemahaman (Before-After Gain) pasca belajar.' },
    { no: '05', title: 'Buka Menu SELESAI', desc: 'Tinjau rekap kelulusan MOOC dan persyaratan tahap akhir.' },
    { no: '06', title: 'Survei Kepuasan (IKM)', desc: 'Berikan penilaian 1–5 bintang terhadap mutu layanan Bimbingan Perkawinan.' },
    { no: '07', title: 'Kelas & Verifikasi Fasilitator', desc: 'Ikuti kelas Online/Offline KUA hingga Fasilitator mengesahkan kelulusan.' },
    { no: '08', title: 'Unduh 4 Dokumen Resmi', desc: 'Sertifikat Bimwin, Piagam Kami Kompak, Portofolio Catin, & Kartu Story.' },
  ];

  return (
    <ModalDialog
      open={open}
      onClose={onClose}
      title="Buku Saku & Panduan Visual BIMWIN Kemenag Jepara"
      subtitle="Standar operasional 8 langkah wajib calon pengantin serta panduan peran petugas."
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

        {tab === 'peserta' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {steps.map((s) => (
              <div
                key={s.no}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-emerald-950 bg-[#F8FAF9] dark:bg-[#0D1613] space-y-1.5"
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

        {tab === 'fasilitator' && (
          <ul className="space-y-2.5 text-sm text-slate-700 dark:text-slate-300">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#0F684E] shrink-0 mt-0.5" />
              <span>Memantau progres MOOC peserta binaan di wilayah KUA masing-masing dan memverifikasi kehadiran kelas Online/Offline.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#0F684E] shrink-0 mt-0.5" />
              <span>Pengesahan kelulusan otomatis terkunci bagi peserta yang belum menyelesaikan 5 modul + postest, serta mendukung fitur 1-klik "Sahkan Semua yang Tuntas MOOC".</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#0F684E] shrink-0 mt-0.5" />
              <span>Mengelola jadwal kelas Online/Offline, mencetak Daftar Hadir ber-QR, menjawab Konsultasi & eskalasi Mediasi Pasca Nikah, serta mengirim pengingat ke peserta.</span>
            </li>
          </ul>
        )}

        {tab === 'adminkua' && (
          <ul className="space-y-2.5 text-sm text-slate-700 dark:text-slate-300">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#0F684E] shrink-0 mt-0.5" />
              <span>Memantau analitik partisipasi per Desa/Kelurahan di kecamatan KUA masing-masing, data pasangan tersinkronisasi, dan skrining gizi/stunting.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#0F684E] shrink-0 mt-0.5" />
              <span>Melakukan pembaruan biodata peserta, mengekspor laporan CSV (dengan NIK tersamar), dan mencetak Laporan Eksekutif KUA.</span>
            </li>
          </ul>
        )}

        {tab === 'superadmin' && (
          <ul className="space-y-2.5 text-sm text-slate-700 dark:text-slate-300">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#0F684E] shrink-0 mt-0.5" />
              <span>Memantau Peta Kepatuhan (Heatmap) 16 KUA se-Kabupaten Jepara dan drill-down capaian hingga tingkat Desa/Kelurahan.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#0F684E] shrink-0 mt-0.5" />
              <span>Mengelola kurikulum LMS (5 Modul, Pretest, Postest, Kuis Kecocokan), akun Admin KUA & Fasilitator, Pejabat Penandatangan, Mode Pemeliharaan, Galeri, FAQ, Dokumen, serta Audit Trail.</span>
            </li>
          </ul>
        )}
      </div>
    </ModalDialog>
  );
};
