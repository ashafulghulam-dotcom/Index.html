import { DocumentDownloadItem, FaqItem, GalleryItem, PejabatConfig } from '../types/bimwin';

export const KEMENAG_LOGO_SVG = '/assets/aistudio/logo-kemenag-png-1png__2__8f43a1de.png';

export const LIST_16_KUA: string[] = [
  'KUA Bangsri',
  'KUA Batealit',
  'KUA Donorojo',
  'KUA Jepara',
  'KUA Kalinyamatan',
  'KUA Karimunjawa',
  'KUA Kedung',
  'KUA Keling',
  'KUA Kembang',
  'KUA Mayong',
  'KUA Mlonggo',
  'KUA Nalumsari',
  'KUA Pakis Aji',
  'KUA Pecangaan',
  'KUA Tahunan',
  'KUA Welahan',
];

export const DESA_PER_KUA_JEPARA: Record<string, string[]> = {
  'KUA Bangsri': [
    'Bangsri', 'Banjaragung', 'Banjaran', 'Bondo', 'Guyangan', 'Jerukwangi',
    'Kedungleper', 'Kepuk', 'Papasan', 'Srikandang', 'Tengguli', 'Wedelan',
  ],
  'KUA Batealit': [
    'Bantrung', 'Batealit', 'Bawu', 'Bringin', 'Geneng', 'Mindahan',
    'Mindahan Kidul', 'Ngasem', 'Pekalongan', 'Raguklampitan', 'Somosari',
  ],
  'KUA Donorojo': [
    'Bandungharjo', 'Banyumanis', 'Blingoh', 'Clering', 'Jugo', 'Sumberrejo',
    'Tulakan', 'Ujungwatu',
  ],
  'KUA Jepara': [
    'Bandengan', 'Bapangan', 'Bulu', 'Demaan', 'Jobokuto', 'Karangkebagusan',
    'Kauman', 'Kedungcino', 'Kuwasen', 'Mulyoharjo', 'Panggang', 'Pengkol',
    'Potroyudan', 'Saripan', 'Ujungbatu', 'Wonorejo',
  ],
  'KUA Kalinyamatan': [
    'Bakalan', 'Bandungrejo', 'Banyuputih', 'Batukali', 'Damarjati', 'Kriyan',
    'Manyargading', 'Margoyoso', 'Pendosawalan', 'Purwogondo', 'Robayan', 'Sendang',
  ],
  'KUA Karimunjawa': ['Karimunjawa', 'Kemujan', 'Nyamuk', 'Parang'],
  'KUA Kedung': [
    'Bugel', 'Bulakbaru', 'Dongos', 'Jondang', 'Kalianyar', 'Karangaji',
    'Kedungmalang', 'Kerso', 'Menganti', 'Panggung', 'Rau', 'Sowan Kidul',
    'Sowan Lor', 'Sukosono', 'Surodadi', 'Tanggultlare', 'Tedunan', 'Wanusobo',
  ],
  'KUA Keling': [
    'Bumiharjo', 'Damarwulan', 'Gelang', 'Jlegong', 'Kaligarang', 'Kelet',
    'Keling', 'Klepu', 'Kunir', 'Tempur', 'Tunahan', 'Watuaji',
  ],
  'KUA Kembang': [
    'Balong', 'Bucu', 'Cepogo', 'Dermolo', 'Dudakawu', 'Jinggotan',
    'Kaliaman', 'Kancilan', 'Pendem', 'Sumanding', 'Tubanan',
  ],
  'KUA Mayong': [
    'Bandung', 'Buaran', 'Bungu', 'Datar', 'Jebol', 'Kuanyar',
    'Mayong Kidul', 'Mayong Lor', 'Ngroto', 'Pancur', 'Paren', 'Pelang',
    'Pelemkerep', 'Pule', 'Rajekwesi', 'Sengonbugel', 'Singorojo', 'Tigajuru',
  ],
  'KUA Mlonggo': [
    'Jambu', 'Jambu Timur', 'Karanggondang', 'Mororejo', 'Sekuro',
    'Sinanggul', 'Srobyong', 'Suwawal',
  ],
  'KUA Nalumsari': [
    'Bategede', 'Bendanpete', 'Blimbingrejo', 'Daren', 'Dorolegi', 'Gemiring Kidul',
    'Gemiring Lor', 'Jatisari', 'Karangnongko', 'Muryolobo', 'Nalumsari',
    'Ngetuk', 'Pringtulis', 'Tritis', 'Tunggulpandean',
  ],
  'KUA Pakis Aji': [
    'Bulungan', 'Kawak', 'Lebak', 'Mambak', 'Plajan', 'Slagi',
    'Suwawal Timur', 'Tanjung',
  ],
  'KUA Pecangaan': [
    'Gemulung', 'Gerdu', 'Kaliombo', 'Karangrandu', 'Krasak', 'Lebuawu',
    'Ngeling', 'Pecangaan Kulon', 'Pecangaan Wetan', 'Pulodarat', 'Rengging', 'Troso',
  ],
  'KUA Tahunan': [
    'Demangan', 'Kecapi', 'Krapyak', 'Langon', 'Mangunan', 'Mantingan',
    'Ngabul', 'Petekeyan', 'Platar', 'Semat', 'Senenan', 'Sukodono',
    'Tahunan', 'Tegalsambi', 'Telukawur',
  ],
  'KUA Welahan': [
    'Brantaksekarjati', 'Bugo', 'Gedangan', 'Gidangelo', 'Guwosobokerto',
    'Kalipucang Kulon', 'Kalipucang Wetan', 'Karanganyar', 'Kedungsarimulyo',
    'Kendengsidialit', 'Ketilengsingolelo', 'Sidigede', 'Telukwetan',
    'Ujungpandan', 'Welahan',
  ],
};

export const ALIAS_DESA_LAMA_JEPARA: Record<string, string> = {
  banjarsari: 'Banjaran',
  nagasem: 'Ngasem',
  sumberejo: 'Sumberrejo',
  wanakerto: 'Wanusobo',
  bungasrejo: 'Bungu',
  ngabeyan: 'Ngroto',
  tigojuru: 'Tigajuru',
  kawangan: 'Kawak',
  senantul: 'Senenan',
};

export interface KuaDirectoryEntry {
  kua: string;
  alamat: string;
  telp: string;
  whatsapp?: string;
  email?: string;
  kepalaKua?: string;
  jamLayanan: string;
  mapsUrl?: string;
  mapsQuery?: string;
  catatan?: string;
  updatedAt?: string;
}

export function buildKuaGoogleMapsUrl(
  entry: Pick<KuaDirectoryEntry, 'kua' | 'alamat' | 'mapsUrl' | 'mapsQuery'>
): string {
  const customUrl = entry.mapsUrl?.trim();
  if (customUrl && /^https?:\/\//i.test(customUrl)) {
    return customUrl;
  }
  const query = entry.mapsQuery || `${entry.kua}, ${entry.alamat}, Kabupaten Jepara, Jawa Tengah`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export const DEFAULT_KUA_JAM_LAYANAN =
  "Senin–Kamis, 07.30–16.00 WIB\nJum'at, 07.30–16.30 WIB";

export const DATA_DIREKTORI_16_KUA: KuaDirectoryEntry[] = [
  { kua: 'KUA Jepara', alamat: 'Jl. KH. Wahid Hasyim, Potroyudan, Kec. Jepara', telp: '0291-591014', jamLayanan: DEFAULT_KUA_JAM_LAYANAN },
  { kua: 'KUA Tahunan', alamat: 'Jl. Raya Jepara-Kudus KM 7, Kec. Tahunan', telp: '0291-593112', jamLayanan: DEFAULT_KUA_JAM_LAYANAN },
  { kua: 'KUA Pecangaan', alamat: 'Jl. Raya Pecangaan Kulon, Kec. Pecangaan', telp: '0291-755110', jamLayanan: DEFAULT_KUA_JAM_LAYANAN },
  { kua: 'KUA Kalinyamatan', alamat: 'Jl. Raya Gotri-Welahan, Purwogondo, Kalinyamatan', telp: '0291-755221', jamLayanan: DEFAULT_KUA_JAM_LAYANAN },
  { kua: 'KUA Welahan', alamat: 'Jl. Raya Welahan, Kec. Welahan', telp: '0291-425611', jamLayanan: DEFAULT_KUA_JAM_LAYANAN },
  { kua: 'KUA Mayong', alamat: 'Jl. Raya Mayong-Kudus, Pelemkerep, Kec. Mayong', telp: '0291-425109', jamLayanan: DEFAULT_KUA_JAM_LAYANAN },
  { kua: 'KUA Nalumsari', alamat: 'Jl. Raya Nalumsari, Gemiring Lor, Kec. Nalumsari', telp: '0291-425301', jamLayanan: DEFAULT_KUA_JAM_LAYANAN },
  { kua: 'KUA Batealit', alamat: 'Jl. Raya Batealit, Mindahan, Kec. Batealit', telp: '0291-595218', jamLayanan: DEFAULT_KUA_JAM_LAYANAN },
  { kua: 'KUA Kedung', alamat: 'Jl. Raya Bugel-Pecangaan, Sukosono, Kec. Kedung', telp: '0291-594320', jamLayanan: DEFAULT_KUA_JAM_LAYANAN },
  { kua: 'KUA Mlonggo', alamat: 'Jl. Raya Jepara-Bangsri KM 9, Suwawal, Kec. Mlonggo', telp: '0291-597104', jamLayanan: DEFAULT_KUA_JAM_LAYANAN },
  { kua: 'KUA Pakis Aji', alamat: 'Jl. Raya Lebak-Suwawal Timur, Kec. Pakis Aji', telp: '0291-597412', jamLayanan: DEFAULT_KUA_JAM_LAYANAN },
  { kua: 'KUA Bangsri', alamat: 'Jl. Raya Bangsri, Kec. Bangsri', telp: '0291-771018', jamLayanan: DEFAULT_KUA_JAM_LAYANAN },
  { kua: 'KUA Kembang', alamat: 'Jl. Raya Bangsri-Keling, Jinggotan, Kec. Kembang', telp: '0291-771520', jamLayanan: DEFAULT_KUA_JAM_LAYANAN },
  { kua: 'KUA Keling', alamat: 'Jl. Raya Kelet-Keling, Kec. Keling', telp: '0291-579112', jamLayanan: DEFAULT_KUA_JAM_LAYANAN },
  { kua: 'KUA Donorojo', alamat: 'Jl. Raya Tulakan-Clering, Kec. Donorojo', telp: '0291-579310', jamLayanan: DEFAULT_KUA_JAM_LAYANAN },
  { kua: 'KUA Karimunjawa', alamat: 'Jl. Pemuda Kepulauan Karimunjawa, Kec. Karimunjawa', telp: '0291-591001', jamLayanan: DEFAULT_KUA_JAM_LAYANAN },
];

export const DEFAULT_PEJABAT: PejabatConfig = {
  jabatan: 'Kepala Kantor Kementerian Agama Kabupaten Jepara',
  nama: 'H. Akhsan Muhyiddin, S.E., M.M.',
  nip: 'NIP. 196805141994031004',
};

export const DEFAULT_ANNOUNCEMENT =
  'Selamat datang di Platform Bimwin Mandiri Kemenag Kab. Jepara. Alur Wajib 8 Langkah: 1. Sinkron Pasangan → 2. Pretest → 3. 5 Modul & Kuis → 4. Postest → 5. Menu Selesai → 6. Survei IKM → 7. Kelas Online/Offline & Verifikasi Fasilitator → 8. Unduh 4 Dokumen Resmi.';

export const DEFAULT_FAQ: FaqItem[] = [
  {
    id: 'faq_1',
    t: 'Apa saja syarat berkas administrasi pendaftaran nikah di KUA / SIMKAH?',
    j: 'Siapkan Surat Pengantar Nikah dari Desa/Kelurahan (Model N1, N2, N4), Fotokopi KTP, Kartu Keluarga, Akta Kelahiran/Ijazah, Pasfoto berlatar biru ukuran 2×3 (4 lembar) & 4×6 (2 lembar), Imunisasi TT Catin, serta Sertifikat Lulus Bimwin Mandiri ini.',
  },
  {
    id: 'faq_2',
    t: 'Bagaimana urutan 8 langkah wajib untuk membuka 4 dokumen kelulusan?',
    j: '1. Wajib Sinkron Pasangan → 2. Pretest (5 Soal) → 3. 5 Modul & Kuis (minimal 80%) → 4. Postest (5 Soal) → 5. Klik Menu SELESAI → 6. Survei Kepuasan Masyarakat (IKM) → 7. Memilih salah satu kelas (Online/Offline) untuk mendapat verifikasi Fasilitator → 8. Unduh Sertifikat, Piagam Kami Kompak, Rapor Portofolio Catin, & Kartu Story WA/IG/TikTok.',
  },
  {
    id: 'faq_3',
    t: 'Bagaimana jika usia calon pengantin masih di bawah 19 tahun?',
    j: 'Sesuai UU Nomor 16 Tahun 2019, batas minimal usia menikah bagi pria dan wanita adalah 19 tahun. Jika di bawah 19 tahun, wajib melampirkan Surat Penetapan Dispensasi Kawin dari Pengadilan Agama.',
  },
  {
    id: 'faq_4',
    t: 'Apakah Sertifikat Bimwin Mandiri dapat diverifikasi keasliannya oleh KUA?',
    j: 'Ya. Setiap Sertifikat, Piagam Kami Kompak, Rapor Portofolio, dan Daftar Hadir dilengkapi Kode Registrasi unik dan QR Code yang dapat dicek langsung melalui panel Verifikasi Keabsahan Dokumen di halaman utama.',
  },
];

export const DEFAULT_DOKUMEN: DocumentDownloadItem[] = [
  { id: 'dok_1', judul: 'Formulir Model N1 — Pengantar Nikah', kat: 'Dokumen Nikah', url: 'https://drive.google.com/file/d/1wP49tGnw0R0T3X2QvubcfRajmHh1QvUS/view?usp=sharing' },
  { id: 'dok_2', judul: 'Formulir Model N2 — Permohonan Kehendak Nikah', kat: 'Dokumen Nikah', url: 'https://drive.google.com/file/d/1a6xnsnFl8hNgoTHJNgd5hTjh7ZskAcr0/view?usp=sharing' },
  { id: 'dok_3', judul: 'Formulir Model N4 — Persetujuan Calon Pengantin', kat: 'Dokumen Nikah', url: 'https://drive.google.com/file/d/1TS1meQg_DtAMLbjY18SdE0j7Bo-oR6hY/view?usp=sharing' },
  { id: 'dok_4', judul: 'Buku Saku Fondasi Keluarga Sakinah Kemenag RI', kat: 'Panduan Resmi', url: 'https://drive.google.com/file/d/1wP49tGnw0R0T3X2QvubcfRajmHh1QvUS/view?usp=sharing' },
  { id: 'dok_5', judul: 'Panduan Kesehatan Reproduksi & Pencegahan Stunting', kat: 'Modul Kemenkes', url: 'https://drive.google.com/file/d/1WqYLn_qV26-Is72omU_OXeoJdC3RoL0j/view?usp=sharing' },
  { id: 'dok_6', judul: 'Kompilasi Hukum Islam (KHI) & UU Perkawinan No. 16/2019', kat: 'Regulasi', url: 'https://drive.google.com/file/d/1pOo0RXMoUVmUHcvUKuwX4TV-wU-PliUY/view?usp=sharing' },
];

export const DEFAULT_GALLERY: GalleryItem[] = [
  {
    id: 'gal_1',
    judul: 'Bimbingan Perkawinan Angkatan I — KUA Jepara',
    kua: 'KUA Jepara',
    tanggal: '18 Februari 2026',
    deskripsi: 'Sesi kolaborasi pasangan calon pengantin menyusun Piagam Komitmen "Kami Kompak" dan simulasi cashflow keluarga.',
  },
  {
    id: 'gal_2',
    judul: 'Edukasi Gizi Pra-Nikah & Cegah Stunting',
    kua: 'KUA Tahunan',
    tanggal: '04 Maret 2026',
    deskripsi: 'Sinergi Penyuluh Agama Islam KUA Tahunan bersama Puskesmas dalam pengukuran LiLA, Hb, dan kesiapan 1.000 HPK.',
  },
  {
    id: 'gal_3',
    judul: 'Kelas Bimwin Daring Kepulauan Karimunjawa',
    kua: 'KUA Karimunjawa',
    tanggal: '12 Maret 2026',
    deskripsi: 'Fasilitasi Bimbingan Perkawinan Mandiri berbasis MOOC bagi calon pengantin kepulauan secara inklusif.',
  },
  {
    id: 'gal_4',
    judul: 'Penyerahan Sertifikat Bimwin Terverifikasi QR',
    kua: 'KUA Bangsri',
    tanggal: '20 Maret 2026',
    deskripsi: 'Lulusan Bimwin Mandiri menerima sertifikat resmi Kemenag Jepara terintegrasi verifikasi digital SIMKAH.',
  },
];

export interface DoaEntry {
  id: string;
  judul: string;
  subjudul: string;
  arab: string;
  latin: string;
  translations: {
    id: string;
    jv: string;
    en: string;
    ar: string;
  };
}

export const DOA_PENGANTIN: DoaEntry[] = [
  {
    id: 'doa_1',
    judul: 'Doa Keberkahan untuk Pengantin Baru',
    subjudul: 'HR. Abu Dawud, Tirmidzi & Ibnu Majah',
    arab: 'بَارَكَ اللَّهُ لَكَ وَبَارَكَ عَلَيْكَ وَجَمَعَ بَيْنَكُمَا فِي خَيْرٍ',
    latin: 'Bārakallāhu laka wa bāraka ‘alaika wa jama‘a bainakumā fī khair.',
    translations: {
      id: 'Semoga Allah memberkahimu di waktu bahagia dan memberkahimu di waktu susah, serta menghimpun kalian berdua dalam kebaikan.',
      jv: 'Mugi-mugi Gusti Allah paring berkah dhumateng panjenengan ing salebeting kabingahan lan kasusahan, saha ngempalaken panjenengan kekalih wonten ing kesaenan.',
      en: 'May Allah bless you in times of happiness and bless you in times of difficulty, and unite both of you in goodness.',
      ar: 'اللهم بارك للعروسين واجمع بينهما في خير ومودة ورحمة وسكينة دائمة.',
    },
  },
  {
    id: 'doa_2',
    judul: 'Doa Suami Saat Memegang Ubun-Ubun Istri',
    subjudul: 'HR. Abu Dawud & Ibnu Majah',
    arab: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَهَا وَخَيْرَ مَا جَبَلْتَهَا عَلَيْهِ، وَأَعُوذُ بِكَ مِنْ شَرِّهَا وَمِنْ شَرِّ مَا جَبَلْتَهَا عَلَيْهِ',
    latin: 'Allāhumma innī as’aluka khairahā wa khaira mā jabaltahā ‘alaihi, wa a‘ūdzu bika min syarrihā wa min syarri mā jabaltahā ‘alaih.',
    translations: {
      id: 'Ya Allah, sesungguhnya aku memohon kepada-Mu kebaikannya dan kebaikan tabiat yang Engkau ciptakan padanya, dan aku berlindung kepada-Mu dari keburukannya dan keburukan tabiatnya.',
      jv: 'Duh Gusti Allah, saestu kawula nyuwun dhumateng Paduka kesaenanipun garwa kawula saha kesaenan watakipun, lan kawula nyuwun pangayoman saking awonipun.',
      en: 'O Allah, I ask You for her goodness and the goodness of the nature You created in her, and I seek refuge in You from any evil in her nature.',
      ar: 'دعاء الزوج عند الزفاف طلباً للبركة والخير والوقاية من كل شر وسوء.',
    },
  },
];

export const DEFAULT_KOMPAK_COMMITMENTS = {
  peranKeluarga:
    'Bekerja sama secara adil dan seimbang (Mubadalah) dalam merawat kebersihan dan imunisasi anak, memenuhi gizi sehat (ASI eksklusif 2 tahun), memberi perlindungan aman, serta menjadi teladan pendidikan karakter di rumah.',
  pendidikanKarakter:
    'Membimbing anak agar taat beribadah (saleh personal) sekaligus peduli sesama (saleh sosial) dengan menanamkan sikap moderat (At-Tawasuth), seimbang (At-Tawazun), toleran (At-Tasamuh), serta menjaga Ukhuwah Islamiyah, Wathaniyah, dan Basyariyah.',
  disiplinPositif:
    'Mengoptimalkan 6 aspek perkembangan anak (agama, fisik, kognitif, bahasa, sosial-emosional, dan seni) serta menerapkan 4 strategi disiplin positif (Contohkan, Jelas, Tegas, dan Konsisten) tanpa membentak, mencubit, atau melakukan kekerasan fisik maupun verbal.',
};

export const SMART_FAQ_RULES: Array<{ keywords: string[]; reply: string }> = [
  {
    keywords: ['berkas', 'syarat', 'n1', 'n2', 'n4', 'simkah', 'daftar nikah'],
    reply:
      'Panduan Cepat SIMKAH: Siapkan Model N1, N2, N4 dari Desa/Kelurahan, KTP, KK, Akta/Ijazah, pasfoto biru 2×3 (4) & 4×6 (2), bukti imunisasi TT, serta Sertifikat Bimwin Mandiri terverifikasi.',
  },
  {
    keywords: ['sertifikat', 'terkunci', 'gembok', 'download', 'unduh', 'piagam'],
    reply:
      'Panduan Sertifikat: Pastikan seluruh 8 langkah tuntas — Sinkron Pasangan, Pretest, 5 Modul & Kuis (≥80%), Postest, Survei IKM, serta kehadiran kelas & Verifikasi Fasilitator KUA.',
  },
  {
    keywords: ['stunting', 'lila', 'hb', 'anemia', 'gizi', 'hamil'],
    reply:
      'Panduan Kesiapan Gizi: Calon ibu idealnya memiliki LiLA ≥ 23,5 cm (bebas KEK), Hb ≥ 12 g/dL (bebas anemia), dan IMT 18,5–24,9. Gunakan menu Kalkulator Stunting dan konsultasikan ke Puskesmas setempat jika ada faktor risiko.',
  },
  {
    keywords: ['dispensasi', '19', 'usia', 'umur', 'muda'],
    reply:
      'Regulasi Usia Nikah: Berdasarkan UU No. 16 Tahun 2019, usia minimal menikah pria & wanita adalah 19 tahun. Apabila di bawah 19 tahun, diperlukan Penetapan Dispensasi Kawin dari Pengadilan Agama.',
  },
  {
    keywords: ['pasangan', 'sinkron', 'kode', 'username'],
    reply:
      'Sinkronisasi Pasangan: Masukkan username akun pasangan pada panel Langkah 1, atau gunakan tombol "Buat & Hubungkan Akun Pasangan" agar pasangan langsung memiliki akun yang tersinkron di KUA yang sama.',
  },
];

export const FASILITATOR_QUICK_NOTES: string[] = [
  'Aktif berdiskusi, memahami 5 pilar keluarga sakinah, dan siap membina rumah tangga.',
  'Menyelesaikan MOOC tepat waktu dan hadir penuh pada sesi bimbingan kelas KUA.',
  'Disarankan mendalami kembali materi perencanaan keuangan dan kesiapan gizi pra-nikah.',
  'Pasangan menunjukkan komunikasi positif dan telah menyepakati komitmen Kami Kompak.',
];
