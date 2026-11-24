import React from 'react';
import { Lock, ShieldCheck } from 'lucide-react';
import { ModalDialog } from './UiPrimitives';

interface PrivacyPolicyModalProps {
  open: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ open, onClose }) => {
  return (
    <ModalDialog
      open={open}
      onClose={onClose}
      title="Kebijakan Privasi & Ketentuan Layanan SAMAWA"
      subtitle="Kantor Kementerian Agama Kabupaten Jepara · Kepatuhan UU PDP No. 27 Tahun 2022"
      maxWidth="2xl"
      footer={
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-lg bg-[#0F684E] hover:bg-[#0B523D] text-white text-xs font-semibold"
        >
          Saya Mengerti
        </button>
      }
    >
      <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
        <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 flex items-start gap-2.5">
          <ShieldCheck className="w-5 h-5 text-[#0F684E] shrink-0 mt-0.5" />
          <p>
            <strong>SAMAWA (Sarana Membangun Wawasan Keluarga)</strong> adalah aplikasi resmi layanan Bimbingan Perkawinan (BIMWIN) Kementerian Agama Kabupaten Jepara. Seluruh pengelolaan data pribadi Calon Pengantin tunduk pada prinsip perlindungan data pribadi (UU No. 27 Tahun 2022).
          </p>
        </div>

        <section className="space-y-1.5">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            1. Data yang Dikumpulkan &amp; Tujuan Penggunaan
          </h3>
          <p>
            Data identitas (Nama Lengkap, NIK, TTL, Pendidikan, Desa/KUA Tujuan, Nomor HP/Email, dan Rencana Tanggal Akad) hanya digunakan untuk penyelenggaraan pembelajaran MOOC BIMWIN, kehadiran kelas tatap muka/daring, penerbitan 4 dokumen resmi ber-QR Code, serta pelaporan statistik pelayanan Bimas Islam Kemenag Jepara.
          </p>
        </section>

        <section className="space-y-1.5">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            2. Isolasi Data Pribadi &amp; Keamanan Cloud
          </h3>
          <p>
            NIK peserta disamarkan pada tampilan verifikasi publik. Data profil dan dokumen pribadi hanya dapat diakses oleh pemilik akun yang sah, Fasilitator/Admin KUA wilayah kecamatan terdaftar, serta SuperAdmin Kemenag Kabupaten Jepara dengan pencatatan Audit Trail.
          </p>
        </section>

        <section className="space-y-1.5">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            3. Penguncian Identitas Pasca-Sertifikat &amp; Hak Koreksi Data
          </h3>
          <p>
            Setelah Sertifikat Kelulusan BIMWIN resmi disahkan, data inti identitas peserta (Nama, NIK, TTL) otomatis dikunci demi menjaga keabsahan dokumen resmi. Apabila terdapat kekeliruan penulisan, peserta dapat mengajukan perbaikan resmi melalui fitur <strong>Tiket Perubahan Data</strong> kepada Admin KUA setempat.
          </p>
        </section>

        <section className="space-y-1.5">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            4. Izin Kamera &amp; Notifikasi Perangkat (Web APK)
          </h3>
          <p>
            Akses kamera hanya digunakan saat peserta atau petugas memindai QR Code Sertifikat atau QR Absensi Kelas—tidak pernah direkam atau dikirim ke pihak ketiga. Izin notifikasi HP bersifat opsional dan dapat dijeda kapan saja melalui menu Kotak Masuk Pengingat.
          </p>
        </section>

        <div className="pt-2 border-t border-slate-200 dark:border-emerald-950 flex items-center gap-2 text-[11px] text-slate-500">
          <Lock className="w-3.5 h-3.5 text-[#0F684E]" />
          <span>
            Kontak Pengelola Data: Seksi Bimas Islam Kantor Kemenag Kab. Jepara · Jl. Ratu Kalinyamat No. 1, Jepara.
          </span>
        </div>
      </div>
    </ModalDialog>
  );
};
