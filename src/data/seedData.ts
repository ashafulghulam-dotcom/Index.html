import {
  DEFAULT_ANNOUNCEMENT,
  DEFAULT_DOKUMEN,
  DEFAULT_FAQ,
  DEFAULT_GALLERY,
  DEFAULT_KOMPAK_COMMITMENTS,
  DEFAULT_PEJABAT,
  DESA_PER_KUA_JEPARA,
  LIST_16_KUA,
} from './jeparaData';
import {
  DEFAULT_COMPATIBILITY_QUIZ,
  DEFAULT_MODULES,
  DEFAULT_POSTEST,
  DEFAULT_PRETEST,
} from './curriculumData';
import {
  AuditLogItem,
  BimwinClassSchedule,
  BimwinUser,
  CompatibilityQuestion,
  ConsultationMessage,
  DocumentDownloadItem,
  FaqItem,
  GalleryItem,
  IkmSurveyRecord,
  KritikSaranItem,
  ModuleDefinition,
  NotificationItem,
  PostMarriageJournal,
  QuizQuestion,
  ReminderLogItem,
  SystemSettings,
} from '../types/bimwin';

export interface BimwinStoreSnapshot {
  users: BimwinUser[];
  modules: ModuleDefinition[];
  pretest: QuizQuestion[];
  postest: QuizQuestion[];
  compatibilityQuiz: CompatibilityQuestion[];
  classes: BimwinClassSchedule[];
  consultations: ConsultationMessage[];
  journals: PostMarriageJournal[];
  ikmSurveys: IkmSurveyRecord[];
  notifications: NotificationItem[];
  reminderLogs?: ReminderLogItem[];
  kritikSaran: KritikSaranItem[];
  faqs: FaqItem[];
  documents: DocumentDownloadItem[];
  gallery: GalleryItem[];
  auditLogs: AuditLogItem[];
  settings: SystemSettings;
}

function slugKua(kua: string): string {
  return kua
    .replace(/^KUA\s+/i, '')
    .toLowerCase()
    .replace(/\s+/g, '');
}

export function createInitialSeedData(): BimwinStoreSnapshot {
  const users: BimwinUser[] = [
    {
      id: 'u_superadmin',
      username: 'admin',
      password: 'admin2026',
      role: 'SuperAdmin',
      nama: 'Drs. H. Ahmad Munif, M.Ag.',
      jabatan: 'Kasi Bimbingan Masyarakat Islam Kemenag Jepara',
      nip: '197103121998031002',
      kua: 'Kemenag Kab. Jepara',
      createdAt: '2026-01-05T08:00:00.000Z',
    },
  ];

  // Generate 16 Admin KUA & 16 Fasilitator accounts
  LIST_16_KUA.forEach((kua, idx) => {
    const slug = slugKua(kua);
    users.push({
      id: `u_admin_${slug}`,
      username: `admin_${slug}`,
      password: 'kua2026',
      role: 'AdminKUA',
      nama: `Operator ${kua}`,
      jabatan: `Admin Layanan ${kua}`,
      nip: `19840${(idx % 9) + 1}1520100110${String(idx + 10).slice(-2)}`,
      kua,
      createdAt: '2026-01-10T08:00:00.000Z',
    });
    users.push({
      id: `u_fas_${slug}`,
      username: `fasilitator_${slug}`,
      password: 'fasilitator2026',
      role: 'Fasilitator',
      nama: `Ust. H. Miftahul Huda, S.Ag. (${kua.replace('KUA ', '')})`,
      jabatan: `Penyuluh Agama Islam Ahli Muda ${kua}`,
      nip: `19810${(idx % 9) + 1}2020090110${String(idx + 20).slice(-2)}`,
      noHp: `0813250010${String(idx + 10).slice(-2)}`,
      kua,
      createdAt: '2026-01-10T08:30:00.000Z',
    });
  });

  // Featured Verified Graduate Couple (KUA Jepara)
  users.push(
    {
      id: 'u_peserta_ahmad',
      username: 'ahmad_jepara',
      password: 'bimwin2026',
      role: 'Peserta',
      nama: 'Ahmad Rifai',
      nik: '3320061205980001',
      jenisKelamin: 'Laki-laki',
      tempatLahir: 'Jepara',
      tanggalLahir: '1998-05-12',
      ttl: 'Jepara, 12 Mei 1998',
      usia: 27,
      pendidikan: 'S1 / D4',
      pekerjaan: 'Desainer Mebel Ekspor',
      noHp: '085727112201',
      email: 'ahmad.rifai@catinjepara.id',
      kua: 'KUA Jepara',
      desaTempatNikah: 'Kauman',
      alamat: 'Jl. Kartini RT 02/RW 03, Kauman, Jepara',
      tanggalRencanaNikah: '2026-05-17',
      pasanganUsername: 'siti_jepara',
      pasanganNama: 'Siti Nurhaliza',
      createdAt: '2026-02-14T09:00:00.000Z',
      progress: {
        pretestDone: true,
        pretestScore: 60,
        postestDone: true,
        postestScore: 100,
        videosWatched: [1, 2, 3, 4, 5],
        modulesRead: [1, 2, 3, 4, 5],
        modulesCompleted: [1, 2, 3, 4, 5],
        moduleScores: { 1: 100, 2: 80, 3: 100, 4: 100, 5: 100 },
        selesaiClicked: true,
        ikmDone: true,
        verifikasiFasilitator: true,
        verifikasiOleh: 'Ust. H. Miftahul Huda, S.Ag. (Jepara)',
        verifikasiTanggal: '12 Maret 2026',
        kehadiranKelas: 'Hadir Kelas Offline',
        catatanFasilitator:
          'Aktif berdiskusi, memahami 5 pilar keluarga sakinah, dan siap membina rumah tangga.',
        nomorSertifikat: 'JPR-JEP-2026-0001',
        tanggalTerbitSertifikat: '12 Maret 2026',
      },
      stunting: {
        tinggiCm: 171,
        beratKg: 66,
        lilaCm: 28.5,
        hbGdL: 14.2,
        imt: 22.6,
        imtCategory: 'Normal / Ideal',
        kekRisk: false,
        anemiaRisk: false,
        status: 'Siap Hamil / Ideal',
        checkedAt: '2026-03-08T10:15:00.000Z',
      },
      kompak: {
        kodePiagam: 'KOMPAK-2026-0001',
        ...DEFAULT_KOMPAK_COMMITMENTS,
        jawabanKuis: { 1: 1, 2: 0, 3: 0, 4: 0, 5: 1 },
        updatedAt: '2026-03-11T14:20:00.000Z',
      },
    },
    {
      id: 'u_peserta_siti',
      username: 'siti_jepara',
      password: 'bimwin2026',
      role: 'Peserta',
      nama: 'Siti Nurhaliza',
      nik: '3320064809000002',
      jenisKelamin: 'Perempuan',
      tempatLahir: 'Jepara',
      tanggalLahir: '2000-09-08',
      ttl: 'Jepara, 8 September 2000',
      usia: 25,
      pendidikan: 'S1 / D4',
      pekerjaan: 'Guru Madrasah',
      noHp: '085727112202',
      email: 'siti.nurhaliza@catinjepara.id',
      kua: 'KUA Jepara',
      desaTempatNikah: 'Kauman',
      alamat: 'Jl. Pemuda RT 01/RW 02, Potroyudan, Jepara',
      tanggalRencanaNikah: '2026-05-17',
      pasanganUsername: 'ahmad_jepara',
      pasanganNama: 'Ahmad Rifai',
      createdAt: '2026-02-14T09:10:00.000Z',
      progress: {
        pretestDone: true,
        pretestScore: 80,
        postestDone: true,
        postestScore: 100,
        videosWatched: [1, 2, 3, 4, 5],
        modulesRead: [1, 2, 3, 4, 5],
        modulesCompleted: [1, 2, 3, 4, 5],
        moduleScores: { 1: 100, 2: 100, 3: 100, 4: 100, 5: 100 },
        selesaiClicked: true,
        ikmDone: true,
        verifikasiFasilitator: true,
        verifikasiOleh: 'Ust. H. Miftahul Huda, S.Ag. (Jepara)',
        verifikasiTanggal: '12 Maret 2026',
        kehadiranKelas: 'Hadir Kelas Offline',
        catatanFasilitator:
          'Pasangan menunjukkan komunikasi positif dan telah menyepakati komitmen Kami Kompak.',
        nomorSertifikat: 'JPR-JEP-2026-0002',
        tanggalTerbitSertifikat: '12 Maret 2026',
      },
      stunting: {
        tinggiCm: 159,
        beratKg: 53,
        lilaCm: 25.2,
        hbGdL: 12.9,
        imt: 21.0,
        imtCategory: 'Normal / Ideal',
        kekRisk: false,
        anemiaRisk: false,
        status: 'Siap Hamil / Ideal',
        checkedAt: '2026-03-08T10:25:00.000Z',
      },
      kompak: {
        kodePiagam: 'KOMPAK-2026-0001',
        ...DEFAULT_KOMPAK_COMMITMENTS,
        jawabanKuis: { 1: 1, 2: 0, 3: 0, 4: 0, 5: 0 },
        updatedAt: '2026-03-11T14:25:00.000Z',
      },
    },
    // In-progress participant (ready to test 8-step progression from Step 1 / 2)
    {
      id: 'u_peserta_rizky',
      username: 'rizky_tahunan',
      password: 'bimwin2026',
      role: 'Peserta',
      nama: 'Muhammad Rizky Pratama',
      nik: '3320111402010003',
      jenisKelamin: 'Laki-laki',
      tempatLahir: 'Jepara',
      tanggalLahir: '2001-02-14',
      ttl: 'Jepara, 14 Februari 2001',
      usia: 25,
      pendidikan: 'SMA / MA / SMK',
      pekerjaan: 'Wirausaha Ukiran',
      noHp: '082136778801',
      email: 'rizky.pratama@catinjepara.id',
      kua: 'KUA Tahunan',
      desaTempatNikah: 'Tahunan',
      alamat: 'Desa Tahunan RT 04/RW 02, Kec. Tahunan',
      tanggalRencanaNikah: '2026-06-21',
      createdAt: '2026-03-20T10:00:00.000Z',
      progress: {
        pretestDone: false,
        pretestScore: 0,
        postestDone: false,
        postestScore: 0,
        videosWatched: [],
        modulesRead: [],
        modulesCompleted: [],
        moduleScores: {},
        selesaiClicked: false,
        ikmDone: false,
        verifikasiFasilitator: false,
        kehadiranKelas: 'Belum Hadir',
      },
    },
    {
      id: 'u_peserta_nadia',
      username: 'nadia_tahunan',
      password: 'bimwin2026',
      role: 'Peserta',
      nama: 'Nadia Putri Rahmawati',
      nik: '3320115507020004',
      jenisKelamin: 'Perempuan',
      tempatLahir: 'Jepara',
      tanggalLahir: '2002-07-15',
      ttl: 'Jepara, 15 Juli 2002',
      usia: 23,
      pendidikan: 'D1 / D2 / D3',
      pekerjaan: 'Perawat Klinik',
      noHp: '082136778802',
      email: 'nadia.putri@catinjepara.id',
      kua: 'KUA Tahunan',
      desaTempatNikah: 'Tahunan',
      alamat: 'Desa Kecapi RT 02/RW 05, Kec. Tahunan',
      tanggalRencanaNikah: '2026-06-21',
      createdAt: '2026-03-20T10:15:00.000Z',
      progress: {
        pretestDone: false,
        pretestScore: 0,
        postestDone: false,
        postestScore: 0,
        videosWatched: [],
        modulesRead: [],
        modulesCompleted: [],
        moduleScores: {},
        selesaiClicked: false,
        ikmDone: false,
        verifikasiFasilitator: false,
        kehadiranKelas: 'Belum Hadir',
      },
    }
  );

  // Representative distributed couples across all remaining 16 KUAs for rich heatmap & analytics
  const sampleSeedProfiles: Array<{
    kua: string;
    male: string;
    female: string;
    graduated: boolean;
    moocDone: boolean;
    pre: number;
    post: number;
    month: string;
    stuntingRisk?: boolean;
    underage?: boolean;
  }> = [
    { kua: 'KUA Bangsri', male: 'Bagus Santoso', female: 'Dewi Lestari', graduated: true, moocDone: true, pre: 60, post: 100, month: '2026-01-18' },
    { kua: 'KUA Bangsri', male: 'Fajar Hidayat', female: 'Laila Sari', graduated: true, moocDone: true, pre: 40, post: 80, month: '2026-02-11' },
    { kua: 'KUA Batealit', male: 'Arif Rahman', female: 'Naila Fitri', graduated: true, moocDone: true, pre: 60, post: 100, month: '2026-02-22' },
    { kua: 'KUA Donorojo', male: 'Dimas Wijaya', female: 'Rina Marlina', graduated: false, moocDone: true, pre: 60, post: 80, month: '2026-03-04', stuntingRisk: true },
    { kua: 'KUA Kalinyamatan', male: 'Hendra Saputra', female: 'Ayu Kartika', graduated: true, moocDone: true, pre: 60, post: 100, month: '2026-01-25' },
    { kua: 'KUA Karimunjawa', male: 'Wahyu Pratama', female: 'Intan Permata', graduated: true, moocDone: true, pre: 40, post: 100, month: '2026-02-09' },
    { kua: 'KUA Kedung', male: 'Ilham Maulana', female: 'Fitri Handayani', graduated: true, moocDone: true, pre: 60, post: 80, month: '2026-03-02' },
    { kua: 'KUA Keling', male: 'Bayu Nugroho', female: 'Wulan Dari', graduated: false, moocDone: false, pre: 40, post: 0, month: '2026-03-14', stuntingRisk: true },
    { kua: 'KUA Kembang', male: 'Eko Susilo', female: 'Ratna Dewi', graduated: true, moocDone: true, pre: 60, post: 100, month: '2026-02-19' },
    { kua: 'KUA Mayong', male: 'Yusuf Kurniawan', female: 'Anisa Rahma', graduated: true, moocDone: true, pre: 80, post: 100, month: '2026-01-30' },
    { kua: 'KUA Mlonggo', male: 'Rudi Hartono', female: 'Maya Puspita', graduated: false, moocDone: true, pre: 60, post: 100, month: '2026-03-15' },
    { kua: 'KUA Nalumsari', male: 'Galih Permadi', female: 'Salsa Bila', graduated: true, moocDone: true, pre: 60, post: 80, month: '2026-02-27' },
    { kua: 'KUA Pakis Aji', male: 'Agus Setiawan', female: 'Putri Amelia', graduated: false, moocDone: false, pre: 40, post: 0, month: '2026-03-18', underage: true },
    { kua: 'KUA Pecangaan', male: 'Teguh Prasetyo', female: 'Zahra Aulia', graduated: true, moocDone: true, pre: 60, post: 100, month: '2026-01-12' },
    { kua: 'KUA Tahunan', male: 'Naufal Hakim', female: 'Khansa Nabila', graduated: true, moocDone: true, pre: 60, post: 100, month: '2026-02-05' },
    { kua: 'KUA Welahan', male: 'Surya Ramadhan', female: 'Dina Safitri', graduated: true, moocDone: true, pre: 60, post: 80, month: '2026-03-06' },
  ];

  let certCounter = 3;
  sampleSeedProfiles.forEach((item, index) => {
    const slug = slugKua(item.kua);
    const desaList = DESA_PER_KUA_JEPARA[item.kua] || ['Kota'];
    const desa = desaList[index % desaList.length];
    const maleUser = `${item.male.split(' ')[0].toLowerCase()}_${slug}${index}`;
    const femaleUser = `${item.female.split(' ')[0].toLowerCase()}_${slug}${index}`;
    const certPrefix = item.kua.replace(/^KUA\s+/i, '').slice(0, 3).toUpperCase();
    const kompakCode = `KOMPAK-2026-${String(index + 2).padStart(4, '0')}`;

    const makeProgress = (isMale: boolean) => {
      const certNum = item.graduated ? `JPR-${certPrefix}-2026-${String(certCounter++).padStart(4, '0')}` : undefined;
      return {
        pretestDone: true,
        pretestScore: item.pre,
        postestDone: item.moocDone,
        postestScore: item.post,
        videosWatched: item.moocDone ? [1, 2, 3, 4, 5] : [1, 2],
        modulesRead: item.moocDone ? [1, 2, 3, 4, 5] : [1, 2],
        modulesCompleted: item.moocDone ? [1, 2, 3, 4, 5] : [1, 2],
        moduleScores: (item.moocDone
          ? { 1: 100, 2: 80, 3: 100, 4: 80, 5: 100 }
          : { 1: 80, 2: 80 }) as Record<number, number>,
        selesaiClicked: item.moocDone,
        ikmDone: item.graduated,
        verifikasiFasilitator: item.graduated,
        verifikasiOleh: item.graduated ? `Fasilitator ${item.kua}` : undefined,
        verifikasiTanggal: item.graduated ? '15 Maret 2026' : undefined,
        kehadiranKelas: item.graduated
          ? isMale
            ? ('Hadir Kelas Offline' as const)
            : ('Hadir Kelas Offline' as const)
          : ('Belum Hadir' as const),
        nomorSertifikat: certNum,
        tanggalTerbitSertifikat: item.graduated ? '15 Maret 2026' : undefined,
      };
    };

    users.push(
      {
        id: `u_seed_m_${index}`,
        username: maleUser,
        password: 'bimwin2026',
        role: 'Peserta',
        nama: item.male,
        nik: `3320${String(10 + (index % 16)).padStart(2, '0')}110499${String(1000 + index * 2)}`,
        jenisKelamin: 'Laki-laki',
        tempatLahir: 'Jepara',
        tanggalLahir: '1999-04-11',
        ttl: 'Jepara, 11 April 1999',
        usia: 26,
        pendidikan: index % 2 === 0 ? 'S1 / D4' : 'SMA / MA / SMK',
        pekerjaan: 'Karyawan Swasta',
        noHp: `08522500${String(1000 + index * 2)}`,
        email: `${maleUser}@catinjepara.id`,
        kua: item.kua,
        desaTempatNikah: desa,
        alamat: `Desa ${desa}, Kec. ${item.kua.replace('KUA ', '')}`,
        tanggalRencanaNikah: '2026-06-14',
        pasanganUsername: femaleUser,
        pasanganNama: item.female,
        createdAt: `${item.month}T08:30:00.000Z`,
        progress: makeProgress(true),
        stunting: {
          tinggiCm: 169,
          beratKg: 64,
          lilaCm: 27.5,
          hbGdL: 14.0,
          imt: 22.4,
          imtCategory: 'Normal / Ideal',
          kekRisk: false,
          anemiaRisk: false,
          status: 'Siap Hamil / Ideal',
          checkedAt: `${item.month}T09:00:00.000Z`,
        },
        kompak: {
          kodePiagam: kompakCode,
          ...DEFAULT_KOMPAK_COMMITMENTS,
          jawabanKuis: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 1 },
          updatedAt: `${item.month}T10:00:00.000Z`,
        },
      },
      {
        id: `u_seed_f_${index}`,
        username: femaleUser,
        password: 'bimwin2026',
        role: 'Peserta',
        nama: item.female,
        nik: `3320${String(10 + (index % 16)).padStart(2, '0')}520801${String(1001 + index * 2)}`,
        jenisKelamin: 'Perempuan',
        tempatLahir: 'Jepara',
        tanggalLahir: item.underage ? '2008-08-12' : '2001-08-12',
        ttl: item.underage ? 'Jepara, 12 Agustus 2008' : 'Jepara, 12 Agustus 2001',
        usia: item.underage ? 17 : 24,
        pendidikan: index % 3 === 0 ? 'S1 / D4' : index % 3 === 1 ? 'D1 / D2 / D3' : 'SMA / MA / SMK',
        pekerjaan: 'Wiraswasta',
        noHp: `08522500${String(1001 + index * 2)}`,
        email: `${femaleUser}@catinjepara.id`,
        kua: item.kua,
        desaTempatNikah: desa,
        alamat: `Desa ${desa}, Kec. ${item.kua.replace('KUA ', '')}`,
        tanggalRencanaNikah: '2026-06-14',
        pasanganUsername: maleUser,
        pasanganNama: item.male,
        createdAt: `${item.month}T08:40:00.000Z`,
        progress: makeProgress(false),
        stunting: item.stuntingRisk
          ? {
              tinggiCm: 156,
              beratKg: 42,
              lilaCm: 22.0,
              hbGdL: 10.9,
              imt: 17.3,
              imtCategory: 'Kurus (Underweight)',
              kekRisk: true,
              anemiaRisk: true,
              status: 'Perlu Perhatian Gizi',
              checkedAt: `${item.month}T09:15:00.000Z`,
            }
          : {
              tinggiCm: 158,
              beratKg: 52,
              lilaCm: 25.0,
              hbGdL: 12.6,
              imt: 20.8,
              imtCategory: 'Normal / Ideal',
              kekRisk: false,
              anemiaRisk: false,
              status: 'Siap Hamil / Ideal',
              checkedAt: `${item.month}T09:15:00.000Z`,
            },
        kompak: {
          kodePiagam: kompakCode,
          ...DEFAULT_KOMPAK_COMMITMENTS,
          jawabanKuis: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 1 },
          updatedAt: `${item.month}T10:05:00.000Z`,
        },
      }
    );
  });

  const classes: BimwinClassSchedule[] = [
    {
      id: 'cls_jepara_off_1',
      kodeAbsen: 'ABSEN-JEP-2026-01',
      tipe: 'Offline',
      judul: 'Bimbingan Perkawinan Tatap Muka Angkatan IV — KUA Jepara',
      kua: 'KUA Jepara',
      tanggal: '2026-04-15',
      waktu: '08.30 – 11.30 WIB',
      lokasiAtauLink: 'Balai Nikah & Manasik Haji KUA Kecamatan Jepara',
      narasumber: 'Ust. H. Miftahul Huda, S.Ag. & Bidan Puskesmas Jepara',
      kuota: 30,
      rsvps: [
        {
          username: 'ahmad_jepara',
          nama: 'Ahmad Rifai',
          kua: 'KUA Jepara',
          status: 'InsyaAllah Hadir',
          verifiedHadir: true,
          rsvpAt: '2026-03-10T08:00:00.000Z',
        },
        {
          username: 'siti_jepara',
          nama: 'Siti Nurhaliza',
          kua: 'KUA Jepara',
          status: 'InsyaAllah Hadir',
          verifiedHadir: true,
          rsvpAt: '2026-03-10T08:05:00.000Z',
        },
      ],
      createdBy: 'fasilitator_jepara',
    },
    {
      id: 'cls_jepara_on_1',
      kodeAbsen: 'ABSEN-JEP-2026-02',
      tipe: 'Online',
      judul: 'Kelas Pendalaman Komunikasi & Finansial Sakinah (Zoom)',
      kua: 'KUA Jepara',
      tanggal: '2026-04-22',
      waktu: '19.30 – 21.00 WIB',
      lokasiAtauLink: 'https://meet.google.com/bimwin-kemenag-jepara',
      narasumber: 'Ust. H. Miftahul Huda, S.Ag.',
      kuota: 50,
      rsvps: [],
      createdBy: 'fasilitator_jepara',
    },
    {
      id: 'cls_tahunan_off_1',
      kodeAbsen: 'ABSEN-TAH-2026-01',
      tipe: 'Offline',
      judul: 'Bimbingan Perkawinan Mandiri & Cegah Stunting — KUA Tahunan',
      kua: 'KUA Tahunan',
      tanggal: '2026-04-18',
      waktu: '09.00 – 12.00 WIB',
      lokasiAtauLink: 'Aula Balai Nikah KUA Kecamatan Tahunan',
      narasumber: 'Penyuluh Agama Islam KUA Tahunan',
      kuota: 25,
      rsvps: [],
      createdBy: 'fasilitator_tahunan',
    },
    {
      id: 'cls_tahunan_on_1',
      kodeAbsen: 'ABSEN-TAH-2026-02',
      tipe: 'Online',
      judul: 'Kelas Virtual Persiapan Keluarga Sakinah & Pola Asuh',
      kua: 'KUA Tahunan',
      tanggal: '2026-04-25',
      waktu: '19.30 – 21.00 WIB',
      lokasiAtauLink: 'https://zoom.us/j/bimwin-tahunan-jepara',
      narasumber: 'Tim Fasilitator KUA Tahunan',
      kuota: 40,
      rsvps: [],
      createdBy: 'fasilitator_tahunan',
    },
  ];

  const consultations: ConsultationMessage[] = [
    {
      id: 'kon_1',
      pesertaUsername: 'ahmad_jepara',
      pesertaNama: 'Ahmad Rifai',
      kua: 'KUA Jepara',
      topik: 'Berkas Nikah & Sertifikat',
      pertanyaan: 'Assalamualaikum Ustadz, apakah sertifikat Bimwin digital ini cukup dicetak untuk dilampirkan di berkas SIMKAH KUA Jepara?',
      smartFaqReply:
        'Panduan Cepat SIMKAH: Siapkan Model N1, N2, N4 dari Desa/Kelurahan, KTP, KK, Akta/Ijazah, pasfoto biru 2×3 (4) & 4×6 (2), bukti imunisasi TT, serta Sertifikat Bimwin Mandiri terverifikasi.',
      balasanFasilitator:
        'Waalaikumsalam Mas Ahmad. Betul, silakan cetak Sertifikat PDF yang memiliki QR Code verifikasi lalu serahkan bersama berkas N1-N4 saat pemeriksaan nikah di KUA Jepara.',
      dibalasOleh: 'Ust. H. Miftahul Huda, S.Ag. (Jepara)',
      dibalasPada: '13 Maret 2026',
      status: 'Dijawab',
      createdAt: '2026-03-12T10:20:00.000Z',
    },
    {
      id: 'kon_2',
      pesertaUsername: 'rizky_tahunan',
      pesertaNama: 'Muhammad Rizky Pratama',
      kua: 'KUA Tahunan',
      topik: 'Sinkronisasi Pasangan',
      pertanyaan: 'Bagaimana cara menyinkronkan akun saya dengan calon istri yang juga terdaftar di KUA Tahunan?',
      smartFaqReply:
        'Sinkronisasi Pasangan: Masukkan username akun pasangan pada panel Langkah 1, atau gunakan tombol "Buat & Hubungkan Akun Pasangan" agar pasangan langsung memiliki akun yang tersinkron di KUA yang sama.',
      status: 'Menunggu',
      createdAt: '2026-03-21T09:10:00.000Z',
    },
  ];

  const ikmSurveys: IkmSurveyRecord[] = [
    {
      id: 'ikm_1',
      username: 'ahmad_jepara',
      nama: 'Ahmad Rifai',
      kua: 'KUA Jepara',
      rating: 5,
      aspek: 'Kualitas Materi & Kemudahan Aplikasi',
      ulasan: 'Materinya sangat aplikatif, terutama kalkulator keuangan dan piagam Kami Kompak bersama pasangan.',
      createdAt: '2026-03-11T16:00:00.000Z',
    },
    {
      id: 'ikm_2',
      username: 'siti_jepara',
      nama: 'Siti Nurhaliza',
      kua: 'KUA Jepara',
      rating: 5,
      aspek: 'Pelayanan Fasilitator KUA',
      ulasan: 'Fasilitator sangat ramah, responsif saat konsultasi, dan proses verifikasi sertifikat sangat cepat.',
      createdAt: '2026-03-11T16:10:00.000Z',
    },
    {
      id: 'ikm_3',
      username: 'bagus_bangsri0',
      nama: 'Bagus Santoso',
      kua: 'KUA Bangsri',
      rating: 4,
      aspek: 'Kemudahan Akses MOOC',
      ulasan: 'Sangat terbantu karena bisa belajar mandiri malam hari sepulang kerja sebelum kelas tatap muka.',
      createdAt: '2026-02-20T14:00:00.000Z',
    },
  ];

  const notifications: NotificationItem[] = [
    {
      id: 'notif_1',
      targetKua: 'ALL',
      judul: 'Pengingat Alur 8 Langkah Bimwin Mandiri',
      pesan:
        'Pastikan Anda telah menyinkronkan akun pasangan, menuntaskan 5 modul & postest, serta mengisi Survei IKM sebelum mengikuti kelas tatap muka/daring di KUA.',
      pengirim: 'Kemenag Kab. Jepara',
      readBy: ['ahmad_jepara', 'siti_jepara'],
      createdAt: '2026-03-15T08:00:00.000Z',
    },
    {
      id: 'notif_2',
      targetKua: 'KUA Tahunan',
      judul: 'Jadwal Kelas Bimwin April 2026 KUA Tahunan',
      pesan:
        'Kelas Tatap Muka KUA Tahunan dibuka tanggal 18 April 2026 pukul 09.00 WIB. Silakan lakukan konfirmasi kehadiran melalui menu Kelas Online/Offline.',
      pengirim: 'Fasilitator KUA Tahunan',
      readBy: [],
      createdAt: '2026-03-21T07:30:00.000Z',
    },
  ];

  const kritikSaran: KritikSaranItem[] = [
    {
      id: 'ks_1',
      nama: 'Hendra Saputra',
      kua: 'KUA Kalinyamatan',
      pesan: 'Tampilan verifikasi QR dan materi kesehatan reproduksi sangat jelas. Semoga tersedia pula jadwal kelas akhir pekan bagi pekerja pabrik.',
      balasanAdmin: 'Terima kasih atas masukannya. Kami telah mengoordinasikan jadwal kelas daring malam hari dan akhir pekan bersama KUA Kecamatan.',
      createdAt: '2026-03-10T11:45:00.000Z',
    },
  ];

  const auditLogs: AuditLogItem[] = [
    {
      id: 'log_1',
      actor: 'Ust. H. Miftahul Huda, S.Ag. (Jepara)',
      role: 'Fasilitator',
      action: 'Mengesahkan kelulusan & menerbitkan sertifikat JPR-JEP-2026-0001 (Ahmad Rifai)',
      timestamp: '2026-03-12T11:30:00.000Z',
    },
    {
      id: 'log_2',
      actor: 'Drs. H. Ahmad Munif, M.Ag.',
      role: 'SuperAdmin',
      action: 'Memperbarui konfigurasi Pejabat Penandatangan Sertifikat 2026',
      timestamp: '2026-03-01T09:00:00.000Z',
    },
  ];

  return {
    users,
    modules: DEFAULT_MODULES,
    pretest: DEFAULT_PRETEST,
    postest: DEFAULT_POSTEST,
    compatibilityQuiz: DEFAULT_COMPATIBILITY_QUIZ,
    classes,
    consultations,
    journals: [],
    ikmSurveys,
    notifications,
    reminderLogs: [],
    kritikSaran,
    faqs: DEFAULT_FAQ,
    documents: DEFAULT_DOKUMEN,
    gallery: DEFAULT_GALLERY,
    auditLogs,
    settings: {
      announcement: DEFAULT_ANNOUNCEMENT,
      pejabat: DEFAULT_PEJABAT,
      maintenanceMode: false,
    },
  };
}
