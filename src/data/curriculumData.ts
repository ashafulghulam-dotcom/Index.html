import { CompatibilityQuestion, ModuleDefinition, QuizQuestion } from '../types/bimwin';

export const DEFAULT_MODULES: ModuleDefinition[] = [
  {
    id: 1,
    shortTitle: 'Keluarga Sakinah',
    judul: "Modul 1: Membangun Keluarga Sakinah (Maqashid Syari'ah, Kulliyatul Khamsah, 3 Pondasi & 5 Pilar)",
    desc: "Landasan spiritual, Maqashid Syari'ah, 3 pondasi kesalingan, dan 5 pilar perkawinan.",
    durationMinutes: 15,
    driveUrl: 'https://drive.google.com/file/d/1wP49tGnw0R0T3X2QvubcfRajmHh1QvUS/view?usp=sharing',
    videoUrl: 'https://www.youtube.com/embed/NHBZKLBZjXg?rel=0',
    sections: [
      {
        heading: "1. Hakikat Perkawinan, QS. Ar-Rum: 21 & Tujuan Syariat (Maqashid Syari'ah)",
        paragraphs: [
          "Tujuan berkeluarga dalam Islam sejalan dengan tujuan diturunkannya syariat Islam yang disebut Maqashid Syari'ah (menghadirkan kemaslahatan dan mencegah kemudaratan). Berdasarkan QS. Ar-Rum ayat 21, Allah SWT menciptakan pasangan agar manusia merasa tenteram atau Sakinah (ketenangan jiwa), yang ditopang oleh Mawaddah (cinta yang menggelora dan menjaga) serta Rahmah (kasih sayang yang lembut, tulus, dan saling menerima kekurangan).",
          "Keluarga Islami wajib menjadi anugerah dan teladan kedamaian bagi lingkungan semesta (Rahmatan Lil Alamin), karena kedudukan mulia manusia di muka bumi adalah sebagai Hamba Allah ('Abdullah) sekaligus Pemimpin/Pengelola Bumi (Khalifah fil Ardh).",
        ],
      },
      {
        heading: '2. Lima Perlindungan Dasar (Kulliyatul Khamsah) & Tiga Tingkatan Kemaslahatan',
        paragraphs: [
          'Keluarga Sakinah wajib menjaga 5 perlindungan dasar manusia (Kulliyatul Khamsah): (1) Menjaga Agama (Hifdhud Din), (2) Menjaga Jiwa/Keselamatan Fisik & Mental (Hifdhun Nafs), (3) Menjaga Akal/Pendidikan (Hifdhul Aql), (4) Menjaga Keturunan/Kesehatan Reproduksi (Hifdhun Nasl), dan (5) Menjaga Harta/Ekonomi Halal (Hifdhul Mal).',
          'Dalam memenuhi kebutuhan, terdapat 3 skala prioritas kemaslahatan: Adl-Dlaruriyah (Kebutuhan Primer/Pokok) yang wajib didahulukan karena menyangkut kelangsungan hidup, Al-Hajiyah (Kebutuhan Sekunder) yang memudahkan hidup, serta At-Tahsiniyah (Kebutuhan Tersier/Pelengkap).',
        ],
      },
      {
        heading: '3. Tiga Pondasi & Lima Pilar Keluarga Sakinah',
        paragraphs: [
          "Rumah tangga yang kokoh dibangun di atas 3 Pondasi Utama: Mu'adalah (Keadilan) tanpa diskriminasi, Muwazanah (Keseimbangan) antara hak dan kewajiban, serta Mubadalah (Kesalingan) yaitu kerja sama timbal balik antara suami dan istri.",
        ],
        bullets: [
          'Zawaj (Berpasangan): Suami dan istri saling melengkapi laksana pakaian yang menutup aib dan menghangatkan (QS. Al-Baqarah: 187).',
          'Mitsaqan Ghalidlan (Janji Kokoh dengan Allah): Akad nikah adalah perjanjian suci yang sangat kuat di hadapan Allah SWT (QS. An-Nisa: 21).',
          "Mu'asyarah bil Ma'ruf (Pergaulan Bermartabat): Saling memperlakukan pasangan dengan santun, lembut, dan penuh penghormatan (QS. An-Nisa: 19).",
          'Musyawarah (Berdiskusi Bersama): Menyelesaikan persoalan dan mengambil keputusan rumah tangga secara bersama-sama (QS. Al-Baqarah: 233).',
          'Taradlin (Saling Ridha): Keikhlasan dan kerelaan timbal balik dalam menjalankan kesepakatan keluarga.',
        ],
      },
    ],
    keyTakeaway:
      "Tujuan syariat berkeluarga adalah Maqashid Syari'ah; tiga pondasi adalah Keadilan, Keseimbangan, dan Kesalingan (Mubadalah); Mitsaqan Ghalidlan berarti Janji kokoh dengan Allah; tujuan QS. Ar-Rum: 21 adalah Sakinah; dan penyelesaian masalah bersama adalah pilar Musyawarah.",
    translations: {
      jv: "Ringkesan Basa Jawi Krama: Tujuan mbangun bale wisma ing Islam jumbuh kaliyan Maqashid Syari'ah, ngreksa gangsal perkawis pokok (Agami, Jiwa, Akal, Keturunan, lan Bandha). Pondasi kulawarga sakinah wonten tiga: Adil (Mu'adalah), Seimbang (Muwazanah), lan Saling Nyengkuyung (Mubadalah) kanthi gangsal pilar: Zawaj, Mitsaqan Ghalidlan, Mu'asyarah bil Ma'ruf, Musyawarah, lan Taradlin.",
      en: "English Summary: Islamic marriage aligns with Maqashid Syari'ah to bring peace (Sakinah), love (Mawaddah), and mercy (Rahmah) while safeguarding faith, life, intellect, lineage, and wealth. It rests on 3 foundations — Justice, Balance, and Reciprocity (Mubadalah) — and 5 pillars: Zawaj, Mitsaqan Ghalidlan, Mu'asyarah bil Ma'ruf, Consultation (Musyawarah), and Mutual Consent (Taradlin).",
      ar: "ملخص الوحدة الأولى: يهدف الزواج في الإسلام إلى تحقيق مقاصد الشريعة وبناء أسرة قائمة على السكينة والمودة والرحمة (سورة الروم: ٢١)، وفق ثلاث ركائز: العدل والتوازن والمبادلة، وخمسة أركان: الزواج والميثاق الغليظ والمعاشرة بالمعروف والشورى والتراضي.",
    },
    quiz: [
      {
        id: 'm1_q1',
        q: 'Tujuan berkeluarga dalam Islam sejalan dengan tujuan syariat Islam yang disebut...',
        opt: ["Maqashid Syari'ah", 'Habluminallah', 'Rahmatan Lil Alamin', 'Fiqih Munakahat'],
        ans: 0,
      },
      {
        id: 'm1_q2',
        q: "Tiga pondasi keluarga sakinah adalah Keadilan (Mu'adalah), Keseimbangan (Muwazanah), dan...",
        opt: ['Kejujuran', 'Kesalingan (Mubadalah)', 'Kekuatan', 'Kekayaan'],
        ans: 1,
      },
      {
        id: 'm1_q3',
        q: 'Pilar Mitsaqan Ghalidlan dalam perkawinan bermakna...',
        opt: ['Pasangan', 'Janji kokoh dengan Allah', 'Bermartabat', 'Musyawarah'],
        ans: 1,
      },
      {
        id: 'm1_q4',
        q: 'Tujuan perkawinan di Surat Ar-Rum ayat 21 agar pasangan merasa tenteram disebut...',
        opt: ['Mawaddah', 'Rahmah', 'Sakinah', 'Barokah'],
        ans: 2,
      },
      {
        id: 'm1_q5',
        q: 'Menyelesaikan masalah rumah tangga bersama-sama disebut pilar...',
        opt: ['Taradlin', 'Musyawarah', 'Mubadalah', 'Muwazanah'],
        ans: 1,
      },
    ],
  },
  {
    id: 2,
    shortTitle: 'Psikologi Keluarga',
    judul: 'Modul 2: Psikologi Keluarga, Segitiga Cinta Sternberg, 4 Racun Komunikasi & 5 Bahasa Cinta',
    desc: 'Segitiga cinta, komunikasi pasangan empatik, rasio 5:1, dan 5 bahasa cinta.',
    durationMinutes: 15,
    driveUrl: 'https://drive.google.com/file/d/1a6xnsnFl8hNgoTHJNgd5hTjh7ZskAcr0/view?usp=sharing',
    videoUrl: 'https://www.youtube.com/embed/NHBZKLBZjXg?rel=0',
    sections: [
      {
        heading: '1. Teori Segitiga Cinta (Robert J. Sternberg) & Dinamika Relasi Keluarga',
        paragraphs: [
          'Cinta yang paripurna (Consummate Love) dalam perkawinan terdiri dari 3 komponen utuh: (1) Kedekatan Emosi (Intimacy) yaitu rasa nyaman, keterbukaan, dan persahabatan hangat; (2) Gairah (Passion) yaitu ketertarikan fisik dan romansa halal; serta (3) Komitmen (Commitment) yaitu tekad menjaga keutuhan janji suci pernikahan dalam suka maupun duka.',
          'Dalam psikologi keluarga, relasi antara suami dan istri disebut relasi Marital, sedangkan relasi orang tua dan anak disebut relasi Parental. Keharmonisan relasi marital menjadi fondasi kesehatan mental anak.',
        ],
      },
      {
        heading: '2. Empat Racun Komunikasi (John Gottman), Voice of Judgment & Rasio 5:1',
        paragraphs: [
          'Pasangan wajib menghindari 4 penghancur komunikasi rumah tangga: Kritik (Criticism) yang menyerang karakter pribadi, Merendahkan/Sinisme (Contempt), Membela Diri/Defensif (Defensiveness), dan Mendiamkan/Tembok Batu (Stonewalling).',
          'Dalam komunikasi empatik (Otto Scharmer), penghalang batin berupa Voice of Judgment (Suara Penghakiman) ditangkal dengan Buka Pikiran (Open Mind), Voice of Cynicism dengan Buka Hati (Open Heart), dan Voice of Fear dengan Buka Tekad (Open Will). Pasangan stabil menjaga rasio interaksi positif berbanding negatif sebesar 5 banding 1 serta menyelesaikan konflik menuju Win-win solution.',
        ],
      },
      {
        heading: '3. Lima Bahasa Cinta (The 5 Love Languages — Dr. Gary Chapman)',
        paragraphs: ['Setiap individu memiliki cara berbeda untuk merasa dicintai. Kenali 5 bahasa cinta pasangan Anda:'],
        bullets: [
          'Kata-Kata Pendukung (Words of Affirmation): Pujian tulus, apresiasi, kalimat lembut, dan doa.',
          'Waktu Berkualitas (Quality Time): Kebersamaan fokus berdua tanpa distraksi gawai.',
          'Menerima Hadiah (Receiving Gifts): Pemberian tanda cinta atau kejutan sederhana yang penuh perhatian.',
          'Pelayanan (Acts of Service): Bantuan nyata meringankan beban pasangan, seperti berbagi pekerjaan domestik.',
          'Sentuhan Fisik (Physical Touch): Menggenggam tangan, pelukan hangat, dan kemesraan fisik.',
        ],
      },
    ],
    keyTakeaway:
      'Segitiga cinta Sternberg terdiri dari Kedekatan Emosi, Gairah, dan Komitmen; rasio interaksi stabil adalah 5 banding 1; membantu pekerjaan domestik adalah bahasa cinta Pelayanan (Acts of Service); penawar Voice of Judgment adalah Buka Pikiran (Open Mind); dan penyelesaian konflik bertujuan Win-win solution.',
    translations: {
      jv: 'Ringkesan Basa Jawi Krama: Katresnan ingkang sampurna dumadi saking celak raos (Intimacy), greget (Passion), lan Komitmen. Tindak komunikasi ingkang sae kedah nebihi kritik lan sikap meneng-menengan, njagi perbandingan interaksi sae 5:1, saha mangertosi 5 Basa Katresnan garwa supados gesang rukun.',
      en: 'English Summary: Consummate love combines Intimacy, Passion, and Commitment. Healthy couples avoid Gottman’s four communication poisons, maintain a 5:1 positive-to-negative interaction ratio, counter Voice of Judgment with an Open Mind, seek win-win conflict solutions, and practice the 5 Love Languages.',
      ar: 'ملخص الوحدة الثانية: يقوم الحب الناضج على الألفة والشغف والالتزام، ويحافظ الزوجان على نسبة تفاعل إيجابي ٥ مقابل ١، وتجنب النقد والازدراء، واعتماد الحلول التوافقية وفهم لغات الحب الخمس.',
    },
    quiz: [
      {
        id: 'm2_q1',
        q: 'Segitiga cinta Sternberg terdiri dari Kedekatan Emosi, Gairah, dan...',
        opt: ['Kekayaan', 'Kecantikan', 'Komitmen', 'Kasih Sayang'],
        ans: 2,
      },
      {
        id: 'm2_q2',
        q: 'Pasangan stabil memiliki perbandingan sikap positif terhadap negatif sebesar...',
        opt: ['1 banding 1', '2 banding 1', '5 banding 1', '10 banding 1'],
        ans: 2,
      },
      {
        id: 'm2_q3',
        q: 'Membantu pasangan melakukan pekerjaan domestik rumah tangga termasuk bahasa cinta...',
        opt: ['Sentuhan Fisik', 'Hadiah', 'Waktu Berkualitas', 'Pelayanan (Acts of Service)'],
        ans: 3,
      },
      {
        id: 'm2_q4',
        q: "Penawar dari racun komunikasi 'Voice of Judgment' (suara penghakiman) adalah...",
        opt: ['Buka Pikiran (Open Mind)', 'Buka Hati', 'Buka Tekad', 'Tutup Mulut'],
        ans: 0,
      },
      {
        id: 'm2_q5',
        q: 'Salah satu tips mengelola konflik adalah memandang perbedaan secara positif untuk mencapai...',
        opt: ['Kemenangan sepihak', 'Perceraian', 'Win-win solution', 'Kekalahan pasangan'],
        ans: 2,
      },
    ],
  },
  {
    id: 3,
    shortTitle: 'Memenuhi Kebutuhan',
    judul: 'Modul 3: Memenuhi Kebutuhan Keluarga, Manajemen Keuangan, Cashflow & Hak Harta',
    desc: 'Prinsip ekonomi halal, rumus alokasi anggaran, dana darurat, dan kemitraan finansial.',
    durationMinutes: 15,
    driveUrl: 'https://drive.google.com/file/d/1TS1meQg_DtAMLbjY18SdE0j7Bo-oR6hY/view?usp=sharing',
    videoUrl: 'https://www.youtube.com/embed/NHBZKLBZjXg?rel=0',
    sections: [
      {
        heading: '1. Empat Prinsip Ekonomi Keluarga Sakinah & Larangan Tabdzir',
        paragraphs: [
          'Pemenuhan kebutuhan materi keluarga bernilai ibadah apabila dijalankan dengan 4 Prinsip Ekonomi Islam: (1) Halal baik zat maupun cara memperolehnya, (2) Kerja Keras (Ikhtiar Maksimal), (3) Produktif memberi manfaat jangka panjang, serta (4) Hidup Sederhana dan Hemat sesuai kemampuan.',
          "Islam melarang keras gaya hidup boros dan menghambur-hamburkan harta untuk hal yang tidak perlu, yang dalam QS. Al-Isra: 26–27 disamakan dengan sikap Tabdzir (Mubazir).",
        ],
      },
      {
        heading: '2. Rumus Alokasi Anggaran, Tabungan Awal Bulan & Dana Darurat',
        paragraphs: [
          'Prinsip menabung yang benar bukanlah menunggu sisa belanja di akhir bulan, melainkan menyisihkan uang segera di awal bulan saat menerima penghasilan, dikenal sebagai "Bayarlah diri sendiri terlebih dahulu" (Pay Yourself First).',
          'Keluarga wajib menyiapkan Dana Darurat (Emergency Fund) sebesar 3–6 kali pengeluaran bulanan untuk menghadapi kondisi tak terduga (sakit, kecelakaan, atau PHK) tanpa terjebak utang berbunga tinggi. Bedakan Pengeluaran Produktif dan Pengeluaran Konsumtif.',
        ],
      },
      {
        heading: '3. Kemitraan Finansial Suami-Istri & Kedudukan Harta dalam Islam',
        paragraphs: [
          'Merumuskan tujuan keuangan, mencatat arus kas (cashflow), dan menyusun anggaran bulanan wajib dilakukan secara terbuka oleh Suami dan Istri (Berdua) layaknya Satu Tim Kerja (Team Work).',
          'Dalam Fiqih Munakahat, suami memikul kewajiban utama memberi nafkah sesuai kemampuannya. Apabila istri bekerja atau memiliki usaha sendiri, penghasilan istri berstatus harta mutlak milik istri, dan penggunaannya untuk rumah tangga adalah sedekah atas dasar kerelaan bersama (Taradlin).',
        ],
      },
    ],
    keyTakeaway:
      'Mencari nafkah bernilai ibadah jika menggunakan prinsip Halal; menabung di awal bulan disebut Bayarlah diri sendiri terlebih dahulu; simpanan untuk kejadian tak terduga adalah Dana Darurat; perencanaan keuangan dirumuskan oleh Suami dan Istri (Berdua); dan sikap boros disebut Tabdzir (Mubazir).',
    translations: {
      jv: 'Ringkesan Basa Jawi Krama: Pados pangupajiwa dados ibadah menawi kanthi cara ingkang Halal, sregep, lan prasaja tanpa boros (Tabdzir). Nabung dipunlampahi ing wiwitan wulan, nyawisaken Dana Darurat, saha ngatur arta kulawarga kanthi rembugan sesarengan garwa.',
      en: 'English Summary: Family financial stewardship follows four Islamic principles: Halal income, diligence, productivity, and simplicity (avoiding Tabdzir/extravagance). Couples plan budgets together, pay themselves first by saving early in the month, and maintain an Emergency Fund of 3–6 months of expenses.',
      ar: 'ملخص الوحدة الثالثة: تقوم إدارة مالية الأسرة على الكسب الحلال والاجتهاد والاعتدال وتجنب التبذير، مع التخطيط المشترك بين الزوجين والادخار في بداية الشهر وتكوين صندوق للطوارئ.',
    },
    quiz: [
      {
        id: 'm3_q1',
        q: 'Pemenuhan kebutuhan keluarga bernilai ibadah jika dilakukan dengan prinsip...',
        opt: ['Korupsi', 'Halal', 'Menipu', 'Hutang'],
        ans: 1,
      },
      {
        id: 'm3_q2',
        q: 'Menyisihkan uang di awal bulan untuk ditabung sebelum belanja dikenal dengan istilah...',
        opt: [
          'Bayarlah diri sendiri terlebih dahulu',
          'Gali lubang tutup lubang',
          'Beli sekarang bayar nanti',
          'Sisa belanja ditabung',
        ],
        ans: 0,
      },
      {
        id: 'm3_q3',
        q: 'Dana yang wajib disiapkan untuk kejadian tak terduga (sakit/PHK) disebut...',
        opt: ['Dana Pendidikan', 'Dana Darurat', 'Dana Pensiun', 'Dana Liburan'],
        ans: 1,
      },
      {
        id: 'm3_q4',
        q: 'Merumuskan tujuan dan pengelolaan keuangan keluarga sebaiknya dilakukan oleh...',
        opt: ['Suami saja', 'Istri saja', 'Mertua', 'Suami dan Istri (Berdua)'],
        ans: 3,
      },
      {
        id: 'm3_q5',
        q: 'Dalam prinsip pengelolaan keluarga sakinah, sikap boros disamakan dengan sikap...',
        opt: ['Tabdzir (Mubazir)', 'Tawadhu', 'Tawakkal', 'Qanaah'],
        ans: 0,
      },
    ],
  },
  {
    id: 4,
    shortTitle: 'Kesehatan Reproduksi',
    judul: "Modul 4: Kesehatan Reproduksi Keluarga, Fiqih Haid, Kehamilan, ASI & Kontrasepsi ('Azl)",
    desc: "Fiqih haid, kesiapan gizi cegah stunting (LiLA & Hb), ASI 2 tahun, dan KB ('Azl).",
    durationMinutes: 15,
    driveUrl: 'https://drive.google.com/file/d/1WqYLn_qV26-Is72omU_OXeoJdC3RoL0j/view?usp=sharing',
    videoUrl: 'https://www.youtube.com/embed/NHBZKLBZjXg?rel=0',
    sections: [
      {
        heading: '1. Relasi Seksual Sehat (QS. Al-Baqarah: 187) & Fiqih Haid (QS. Al-Baqarah: 222)',
        paragraphs: [
          'Menurut QS. Al-Baqarah ayat 187, suami dan istri diibaratkan sebagai "Pakaian" (Libas) bagi pasangannya, bermakna saling melindungi, menjaga kehormatan, menutupi kekurangan, dan memperindah. Hubungan seksual dalam pernikahan adalah ibadah yang dilakukan dengan santun dan tanpa pemaksaan.',
          'Berdasarkan QS. Al-Baqarah ayat 222, haid adalah kondisi biologis yang menimbulkan rasa sakit dan kelelahan fisik/emosi (Adza). Suami wajib berempati, memberi kesempatan istri beristirahat, serta dilarang melakukan hubungan seksual melalui vagina selama haid hingga istri suci dan mandi wajib (Ghusl).',
        ],
      },
      {
        heading: '2. Kesiapan Gizi Pra-Nikah, Pencegahan Stunting, Kehamilan & ASI 2 Tahun',
        paragraphs: [
          'Pencegahan stunting dimulai sejak calon pengantin sebelum hamil. Standar medis sehat bagi calon ibu adalah Lingkar Lengan Atas (LiLA) minimal 23,5 cm (bebas KEK), kadar Hemoglobin (Hb) minimal 12 g/dL (bebas anemia), serta IMT ideal 18,5 – 24,9.',
          "QS. Luqman ayat 14 menggambarkan kehamilan sebagai kondisi lemah yang bertambah-tambah (wahnan 'ala wahnin), sehingga suami wajib memberi dukungan nutrisi dan pemeriksaan rutin minimal 6 kali. Setelah bayi lahir, QS. Al-Baqarah ayat 233 menganjurkan ASI Eksklusif 6 bulan dan penyempurnaan penyusuan hingga usia 2 tahun penuh.",
        ],
      },
      {
        heading: "3. Keluarga Berencana (KB), Pencegahan 4 Terlalu & Fiqih Metode 'Azl",
        paragraphs: [
          'Tindakan mengatur jarak kelahiran demi keselamatan ibu dan tumbuh kembang anak disebut Keluarga Berencana (KB), guna menghindari risiko "4 Terlalu": Terlalu Muda (<20 tahun), Terlalu Tua (>35 tahun), Terlalu Dekat (<2 tahun), dan Terlalu Banyak (>4 anak).',
          "Dalam Fiqih Madzhab Maliki dan Hambali, metode kontrasepsi alami 'Azl diperbolehkan namun tidak boleh dilakukan tanpa persetujuan/izin istri karena istri memiliki hak atas kepuasan seksual dan keturunan.",
        ],
      },
    ],
    keyTakeaway:
      "QS. Al-Baqarah: 222 menyebut haid menimbulkan rasa sakit (adza); suami-istri ibarat pakaian berarti saling melindungi dan memperindah; penyempurnaan ASI hingga usia 2 tahun penuh; mengatur jarak kelahiran disebut Keluarga Berencana (KB); dan metode 'Azl wajib atas persetujuan/izin istri.",
    translations: {
      jv: "Ringkesan Basa Jawi Krama: Garwa kakung lan putri kados pangangge ingkang saling ngayomi. Nalika haid (adza), garwa kakung kedah paring kawigatosan. Nyegah stunting dipunwiwiti saking kesiapan gizi calon ibu (LiLA ≥ 23,5 cm lan Hb ≥ 12 g/dL), paring ASI ngantos 2 taun, saha KB kanthi rembugan garwa.",
      en: "English Summary: Spouses are garments for each other—protecting and honoring one another. Menstruation is a state of physical discomfort (adza) requiring empathy. Stunting prevention begins before pregnancy (MUAC ≥ 23.5 cm, Hb ≥ 12 g/dL, BMI 18.5–24.9), followed by breastfeeding up to 2 full years and consensual family planning.",
      ar: "ملخص الوحدة الرابعة: الزوجان لباس لبعضهما في الستر والحماية، والحيض أذى يستدعي الرفق. تبدأ الوقاية من التقزم بتأهيل التغذية قبل الحمل، وإتمام الرضاعة حولين كاملين، وتنظيم الأسرة بالتشاور والرضا.",
    },
    quiz: [
      {
        id: 'm4_q1',
        q: "Ayat Al-Qur'an (Al-Baqarah: 222) menyebutkan bahwa haid adalah kondisi yang...",
        opt: ['Kotor dan najis', 'Menimbulkan rasa sakit (adza)', 'Membawa petaka', 'Biasa saja'],
        ans: 1,
      },
      {
        id: 'm4_q2',
        q: "Menurut Al-Baqarah 187, suami dan istri ibarat 'pakaian', yang berarti...",
        opt: ['Saling melindungi dan memperindah', 'Bisa diganti kapan saja', 'Hanya dipakai saat pesta', 'Barang jualan'],
        ans: 0,
      },
      {
        id: 'm4_q3',
        q: 'Saran pemberian ASI eksklusif dan penyempurnaan penyusuan anak adalah hingga usia...',
        opt: ['6 bulan', '1 tahun', '2 tahun penuh', '5 tahun'],
        ans: 2,
      },
      {
        id: 'm4_q4',
        q: 'Tindakan mengatur jarak kelahiran demi kesehatan ibu dan tumbuh kembang anak disebut...',
        opt: ['Keluarga Berencana (KB)', 'Menolak rezeki', 'Gagal nikah', 'Poligami'],
        ans: 0,
      },
      {
        id: 'm4_q5',
        q: "Menurut Madzhab Maliki dan Hambali, metode kontrasepsi 'Azl tidak boleh dilakukan tanpa...",
        opt: ['Persetujuan/izin istri', 'Izin mertua', 'Izin dokter', 'Izin penghulu'],
        ans: 0,
      },
    ],
  },
  {
    id: 5,
    shortTitle: 'Generasi Berkualitas',
    judul: 'Modul 5: Menyiapkan Generasi Berkualitas, Moderasi Beragama, 6 Aspek Perkembangan & Pola Asuh',
    desc: 'Moderasi beragama, 3 ukhuwah, 6 aspek perkembangan anak, dan disiplin positif.',
    durationMinutes: 15,
    driveUrl: 'https://drive.google.com/file/d/1pOo0RXMoUVmUHcvUKuwX4TV-wU-PliUY/view?usp=sharing',
    videoUrl: 'https://www.youtube.com/embed/NHBZKLBZjXg?rel=0',
    sections: [
      {
        heading: '1. Profil Anak Saleh/Salehah, Nilai Moderasi Beragama & Tiga Ukhuwah',
        paragraphs: [
          'Generasi berkualitas yang sadar Allah dan akhlaknya menjadi rahmat bagi semesta disebut generasi Saleh/Salehah, mencakup kesalehan ritual sekaligus kesalehan sosial.',
          "Orang tua menanamkan Moderasi Beragama sejak dini: At-Tawasuth (moderat/tengah-tengah), At-Tawazun (seimbang dunia-akhirat), I'tidal (tegak lurus dan adil), dan At-Tasamuh (toleran). Anak juga diajarkan menjaga 3 ikatan persaudaraan: Ukhuwah Islamiyah (sesama muslim), Ukhuwah Wathaniyah (sesama warga bangsa Indonesia), dan Ukhuwah Basyariyah (sesama umat manusia).",
        ],
      },
      {
        heading: '2. Enam Aspek Perkembangan Anak & Empat Peran Utama Orang Tua',
        paragraphs: [
          'Pengasuhan utuh menstimulasi 6 Aspek Perkembangan Anak: (1) Nilai Agama dan Moral, (2) Fisik-Motorik, (3) Kognitif/Daya Pikir, (4) Bahasa dan Komunikasi, (5) Sosial-Emosional, serta (6) Seni dan Kreativitas.',
          'Ayah dan ibu memikul bersama 4 Peran Utama Orang Tua: Perawatan (gizi, imunisasi, kebersihan), Pengasuhan (kasih sayang dan kelekatan aman), Perlindungan (aman dari kekerasan/perundungan), dan Pendidikan (karakter dan ilmu).',
        ],
      },
      {
        heading: '3. Empat Strategi Disiplin Positif Tanpa Kekerasan & Piagam "Kami Kompak"',
        paragraphs: [
          'Mendidik anak dilakukan tanpa kekerasan fisik maupun verbal, melainkan melalui 4 Strategi Kedisiplinan Positif: (1) Contohkan dengan keteladanan nyata, (2) aturan yang Jelas sesuai usia, (3) sikap Tegas penuh kasih sayang, serta (4) Konsisten satu suara antara ayah dan ibu.',
          'Calon pengantin menyusun Piagam Komitmen Pasangan "Kami Kompak" agar terhindar dari konflik perbedaan pola asuh di masa depan.',
        ],
      },
    ],
    keyTakeaway:
      "Karakter anak rahmat semesta disebut Saleh/Salehah; sikap moderat disebut At-Tawasuth; persaudaraan sebangsa disebut Ukhuwah Wathaniyah; 4 strategi disiplin positif adalah Contohkan, Jelas, Tegas, dan Konsisten; serta tujuan Piagam 'Kami Kompak' adalah menghindari konflik perbedaan pola asuh di masa depan.",
    translations: {
      jv: 'Ringkesan Basa Jawi Krama: Nyiapaken putra-putri ingkang saleh/salehah kanthi nilai Moderasi Beragama (At-Tawasuth, At-Tawazun, I’tidal, At-Tasamuh) lan Ukhuwah. Nggulawenthah lare tanpa kekerasan kanthi 4 strategi disiplin positif: Nyontoni, Cetha, Tegas, lan Konsisten lumantar Piagam Kami Kompak.',
      en: 'English Summary: Raising righteous (Saleh/Salehah) children integrates religious moderation (At-Tawasuth), national brotherhood (Ukhuwah Wathaniyah), six child-development domains, and four non-violent positive discipline principles: Modeling, Clarity, Firmness, and Consistency united in the "Kami Kompak" charter.',
      ar: 'ملخص الوحدة الخامسة: تربية جيل صالح متوازن على قيم الوسطية والتسامح والأخوة الوطنية والإنسانية، وتنمية الجوانب الستة للطفل عبر استراتيجيات الانضباط الإيجابي الأربع دون عنف.',
    },
    quiz: [
      {
        id: 'm5_q1',
        q: 'Ciri anak berkualitas yang karakternya menjadi rahmat bagi semesta dan sadar Allah disebut...',
        opt: ['Saleh/Salehah', 'Cerdas', 'Kaya', 'Tampan'],
        ans: 0,
      },
      {
        id: 'm5_q2',
        q: 'Sikap moderat, tengah-tengah, dan tidak ekstrem dalam beragama disebut...',
        opt: ['At-Tawasuth', 'At-Tawazun', "I'tidal", 'At-Tasamuh'],
        ans: 0,
      },
      {
        id: 'm5_q3',
        q: 'Persaudaraan sesama warga bangsa Indonesia disebut Ukhuwah...',
        opt: ['Wathaniyah', 'Basyariyah', 'Islamiyah', 'Nasabiyah'],
        ans: 0,
      },
      {
        id: 'm5_q4',
        q: 'Empat strategi menanamkan kedisiplinan positif pada anak: Contohkan, Jelas, Tegas, dan...',
        opt: ['Keras', 'Menghukum', 'Konsisten', 'Memanjakan'],
        ans: 2,
      },
      {
        id: 'm5_q5',
        q: "Tujuan membuat dokumen komitmen 'Kami Kompak' bagi calon pengantin adalah agar...",
        opt: [
          'Terhindar dari konflik perbedaan pola asuh di masa depan',
          'Bisa memarahi anak',
          'Menyerahkan pengasuhan ke orang lain',
          'Anak takut',
        ],
        ans: 0,
      },
    ],
  },
];

export const DEFAULT_PRETEST: QuizQuestion[] = DEFAULT_MODULES.map((m, idx) => ({
  ...m.quiz[0],
  id: `pre_${idx + 1}`,
}));

export const DEFAULT_POSTEST: QuizQuestion[] = DEFAULT_MODULES.map((m, idx) => ({
  ...m.quiz[0],
  id: `post_${idx + 1}`,
}));

export const DEFAULT_COMPATIBILITY_QUIZ: CompatibilityQuestion[] = [
  {
    id: 1,
    tanya: 'Bahasa Cinta (Love Language) utama yang paling membuat Anda merasa dicintai pasangan adalah...',
    opsi: [
      'A. Kata-kata pujian & apresiasi lembut',
      'B. Waktu berkualitas berdua tanpa gangguan gawai',
      'C. Bantuan nyata dalam pekerjaan rumah (Pelayanan)',
      'D. Sentuhan fisik hangat & hadiah perhatian',
    ],
  },
  {
    id: 2,
    tanya: 'Jika terjadi perselisihan pendapat di rumah, cara penyelesaian yang Anda harapkan adalah...',
    opsi: [
      'A. Menenangkan diri sejenak lalu dibicarakan empat mata hari itu juga',
      'B. Langsung berdiskusi terbuka saat itu juga sampai tuntas',
      'C. Menulis pesan/catatan hati agar tidak saling menyela pembicaraan',
      'D. Meminta nasihat penengah yang bijak jika belum ketemu solusi',
    ],
  },
  {
    id: 3,
    tanya: 'Bagaimana kesepakatan ideal dalam mengelola gaji dan pencatatan keuangan bulanan?',
    opsi: [
      'A. Digabung seluruhnya dalam satu pos anggaran bersama secara transparan',
      'B. Suami menanggung kebutuhan pokok, penghasilan istri untuk tabungan & pribadi',
      'C. Dibagi menurut persentase pos kebutuhan yang disepakati di awal bulan',
      'D. Dikelola oleh salah satu pasangan yang paling rapi mengatur pembukuan',
    ],
  },
  {
    id: 4,
    tanya: 'Bagaimana pembagian pekerjaan domestik rumah tangga (memasak, mencuci, merapikan rumah)?',
    opsi: [
      'A. Dikerjakan bersama-sama secara fleksibel sesuai prinsip kesalingan (Mubadalah)',
      'B. Dibagi jadwal/tugas spesifik sesuai keluangan waktu kerja masing-masing',
      'C. Bergantian saat akhir pekan dan saling membantu ketika pasangan lelah',
      'D. Menggunakan peralatan bantu rumah tangga agar waktu istirahat bersama lebih banyak',
    ],
  },
  {
    id: 5,
    tanya: 'Ketika mendidik kedisiplinan anak di masa depan, prinsip utama yang disepakati adalah...',
    opsi: [
      'A. Memberi teladan nyata (Contohkan) tanpa membentak atau memukul sama sekali',
      'B. Membuat aturan yang Jelas, Tegas, dan Konsisten antara ayah dan ibu',
      'C. Mengutamakan dialog dari hati ke hati dan apresiasi saat anak berbuat baik',
      'D. Kompak satu suara di depan anak (tidak saling menyalahkan pola asuh pasangan)',
    ],
  },
];
