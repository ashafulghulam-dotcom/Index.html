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
      jv: "Modul 1: Mbangun Kulawarga Sakinah (Maqashid Syari'ah, Kulliyatul Khamsah, 3 Pondasi & 5 Pilar). Tujuan mbangun bale wisma ing Islam jumbuh kaliyan Maqashid Syari'ah, ngreksa gangsal perkawis pokok (Agami, Jiwa, Akal, Keturunan, lan Bandha), tiga tataran kemaslahatan (Adl-Dlaruriyah, Al-Hajiyah, At-Tahsiniyah), tiga pondasi (Mu'adalah, Muwazanah, Mubadalah), saha gangsal pilar: Zawaj, Mitsaqan Ghalidlan, Mu'asyarah bil Ma'ruf, Musyawarah, lan Taradlin.",
      en: "Module 1: Building a Sakinah Family (Maqashid Syari'ah, Kulliyatul Khamsah, 3 Foundations & 5 Pillars). Islamic marriage aligns with Maqashid Syari'ah to bring Sakinah, Mawaddah, and Rahmah while safeguarding five essentials (religion, life, intellect, lineage, wealth), three priority levels, three foundations (Justice, Balance, Reciprocity), and five pillars (Zawaj, Mitsaqan Ghalidlan, Mu'asyarah bil Ma'ruf, Consultation, Mutual Consent).",
      ar: "الوحدة الأولى: بناء الأسرة السكينة (مقاصد الشريعة، الكليات الخمس، الركائز الثلاث والأركان الخمسة). يهدف الزواج في الإسلام إلى تحقيق مقاصد الشريعة وحفظ الكليات الخمس والسكينة والمودة والرحمة وفق الركائز الثلاث (العدل والتوازن والمبادلة) والأركان الخمسة (الزواج، الميثاق الغليظ، المعاشرة بالمعروف، الشورى، التراضي).",
    },
    localizedContent: {
      jv: {
        judul: "Modul 1: Mbangun Kulawarga Sakinah (Maqashid Syari'ah, Kulliyatul Khamsah, 3 Pondasi & 5 Pilar)",
        keyTakeawayLabel: 'Intisari Kunci Evaluasi',
        sections: [
          {
            heading: "1. Hakikat Perkawinan, QS. Ar-Rum: 21 & Tujuan Syariat (Maqashid Syari'ah)",
            paragraphs: [
              "Tujuan mbangun kulawarga wonten ing agami Islam jumbuh kaliyan tujuan dipunturunaken syariat Islam ingkang kawastanan Maqashid Syari'ah (ngawujudaken kemaslahatan saha nyegah kemudaratan). Adhedhasar QS. Ar-Rum ayat 21, Gusti Allah SWT nitahaken pasangan supados manungsa rumaos tentrem utawi Sakinah (katentremaning batos), ingkang dipunsengkuyung dening Mawaddah (katresnan ingkang makantar-kantar saha njagi) sarta Rahmah (welas asih ingkang alus, tulus, lan sami nampi kekiranganipun).",
              "Kulawarga Islami wajib dados kanugrahan saha tuladha katentreman tumrap lingkungan alam semesta (Rahmatan Lil Alamin), awit kalenggahan mulya manungsa wonten ing salumahing bumi inggih punika minangka Kawulaning Gusti Allah ('Abdullah) sisan dados Pamimpin utawi Pangreksa Bumi (Khalifah fil Ardh).",
            ],
          },
          {
            heading: '2. Gangsal Pangayoman Dhasar (Kulliyatul Khamsah) & Tiga Tataran Kemaslahatan',
            paragraphs: [
              'Kulawarga Sakinah wajib njagi 5 pangayoman dhasar manungsa (Kulliyatul Khamsah): (1) Njagi Agami (Hifdhud Din), (2) Njagi Jiwa utawi Kaslametan Fisik lan Mental (Hifdhun Nafs), (3) Njagi Akal lan Pendhidhikan (Hifdhul Aql), (4) Njagi Keturunan lan Kasarasan Reproduksi (Hifdhun Nasl), saha (5) Njagi Bandha lan Ekonomi Halal (Hifdhul Mal).',
              'Wonten ing nyekapi kabetahan, wonten 3 skala prioritas kemaslahatan: Adl-Dlaruriyah (Kabetahan Primer/Pokok) ingkang wajib dipunrumiyinaken awit magepokan kaliyan kalangsungan gesang, Al-Hajiyah (Kabetahan Sekunder) ingkang nggampilaken gesang, sarta At-Tahsiniyah (Kabetahan Tersier/Pelengkap).',
            ],
          },
          {
            heading: '3. Tiga Pondasi & Gangsal Pilar Kulawarga Sakinah',
            paragraphs: [
              "Bale wisma ingkang santosa dipunbangun wonten ing sanginggilipun 3 Pondasi Utama: Mu'adalah (Keadilan) tanpa diskriminasi, Muwazanah (Kaseimbangan) antawisipun hak lan kuwajiban, sarta Mubadalah (Kasalingan) inggih punika makarya sesarengan kanthi timbal balik antawisipun garwa kakung lan garwa putri.",
            ],
            bullets: [
              'Zawaj (Pasangan): Garwa kakung lan garwa putri sami njangkepi kados dene pangangge ingkang nutupi aib saha ngangetaken (QS. Al-Baqarah: 187).',
              'Mitsaqan Ghalidlan (Prajanjian Santosa kaliyan Gusti Allah): Akad nikah punika prajanjian suci ingkang sanget kiyat wonten ing ngarsanipun Gusti Allah SWT (QS. An-Nisa: 21).',
              "Mu'asyarah bil Ma'ruf (Sesrawungan ingkang Bermartabat): Sami ngajeni lan ngrencangi pasangan kanthi santun, alus, saha kebak pakurmatan (QS. An-Nisa: 19).",
              'Musyawarah (Rembugan Sesarengan): ngrampungaken perkawis saha mendhet kaputusan bale wisma kanthi sesarengan (QS. Al-Baqarah: 233).',
              'Taradlin (Sami Ridha): Kaikhlasan saha karilan timbal balik wonten ing nindakaken kasaguhan kulawarga.',
            ],
          },
        ],
        keyTakeaway:
          "Tujuan syariat mbangun kulawarga inggih punika Maqashid Syari'ah; tiga pondasinipun inggih punika Keadilan, Kaseimbangan, lan Kasalingan (Mubadalah); Mitsaqan Ghalidlan tegesipun prajanjian santosa kaliyan Gusti Allah; tujuan QS. Ar-Rum: 21 inggih punika Sakinah; saha ngrampungaken perkawis sesarengan kalebet pilar Musyawarah.",
      },
      en: {
        judul: "Module 1: Building a Sakinah Family (Maqashid Syari'ah, Kulliyatul Khamsah, 3 Foundations & 5 Pillars)",
        keyTakeawayLabel: 'Key Evaluation Takeaways',
        sections: [
          {
            heading: "1. The Essence of Marriage, QS. Ar-Rum: 21 & Objectives of Islamic Law (Maqashid Syari'ah)",
            paragraphs: [
              "The purpose of building a family in Islam aligns with the overarching objectives of Islamic law known as Maqashid Syari'ah (bringing universal benefit and preventing harm). Based on QS. Ar-Rum verse 21, Allah SWT created spouses so that human beings may find tranquility or Sakinah (inner peace), supported by Mawaddah (deep, protective love) and Rahmah (gentle, sincere mercy and mutual acceptance of imperfections).",
              "An Islamic family must become a blessing and an example of peace for the surrounding world (Rahmatan Lil Alamin), because humanity's noble station on earth is both as a Servant of Allah ('Abdullah) and as a Steward/Leader on Earth (Khalifah fil Ardh).",
            ],
          },
          {
            heading: '2. Five Fundamental Protections (Kulliyatul Khamsah) & Three Tiers of Welfare',
            paragraphs: [
              'A Sakinah family is obliged to safeguard 5 fundamental human protections (Kulliyatul Khamsah): (1) Safeguarding Religion (Hifdhud Din), (2) Safeguarding Life / Physical & Mental Safety (Hifdhun Nafs), (3) Safeguarding Intellect / Education (Hifdhul Aql), (4) Safeguarding Lineage / Reproductive Health (Hifdhun Nasl), and (5) Safeguarding Wealth / Halal Economy (Hifdhul Mal).',
              'In fulfilling family needs, there are 3 priority tiers of welfare: Adl-Dlaruriyah (Primary/Essential Needs) which must be prioritized as they concern survival, Al-Hajiyah (Secondary Needs) which ease daily life, and At-Tahsiniyah (Tertiary/Complementary Needs).',
            ],
          },
          {
            heading: '3. Three Foundations & Five Pillars of a Sakinah Family',
            paragraphs: [
              "A resilient household is built upon 3 Core Foundations: Mu'adalah (Justice) without discrimination, Muwazanah (Balance) between rights and obligations, and Mubadalah (Reciprocity), meaning mutual cooperation between husband and wife.",
            ],
            bullets: [
              'Zawaj (Partnership): Husband and wife complement each other like garments that cover flaws and provide warmth (QS. Al-Baqarah: 187).',
              'Mitsaqan Ghalidlan (A Firm Covenant with Allah): The marriage contract is a deeply sacred and binding covenant before Allah SWT (QS. An-Nisa: 21).',
              "Mu'asyarah bil Ma'ruf (Dignified Conduct): Treating one's spouse with courtesy, gentleness, and full respect (QS. An-Nisa: 19).",
              'Musyawarah (Mutual Consultation): Resolving challenges and making household decisions together (QS. Al-Baqarah: 233).',
              'Taradlin (Mutual Consent): Sincerity and reciprocal willingness in honoring family agreements.',
            ],
          },
        ],
        keyTakeaway:
          "The objective of Islamic law in family life is Maqashid Syari'ah; the three foundations are Justice, Balance, and Reciprocity (Mubadalah); Mitsaqan Ghalidlan means a firm covenant with Allah; the goal in QS. Ar-Rum: 21 is Sakinah; and solving household problems together represents the pillar of Consultation (Musyawarah).",
      },
      ar: {
        judul: 'الوحدة الأولى: بناء الأسرة السكينة (مقاصد الشريعة، الكليات الخمس، الركائز الثلاث والأركان الخمسة)',
        keyTakeawayLabel: 'الخلاصة الأساسية للتقييم',
        sections: [
          {
            heading: '١. حقيقة الزواج، سورة الروم: ٢١، ومقاصد الشريعة الإسلامية',
            paragraphs: [
              'يتوافق هدف تكوين الأسرة في الإسلام مع مقاصد الشريعة الإسلامية المتمثلة في جلب المصالح ودرء المفاسد. واستناداً إلى قوله تعالى في سورة الروم الآية ٢١، خلق الله سبحانه وتعالى الأزواج ليجد الإنسان الطمأنينة والسكينة (هدوء النفس)، المدعومة بالمودة (المحبة العميقة الصادقة التي تحفظ العلاقة) والرحمة (الرأفة اللطيفة الخالصة وقبول نقائص كل طرف للآخر).',
              'ويجب أن تكون الأسرة المسلمة نعمةً وقدوةً للسلام في محيطها والعالم أجمع (رحمة للعالمين)، لأن مكانة الإنسان الكريمة في هذه الأرض تقوم على كونه عبداً لله (عبد الله) وخليفةً له في عمارة الأرض وإصلاحها (خليفة في الأرض).',
            ],
          },
          {
            heading: '٢. الضروريات الخمس (الكليات الخمس) ومراتب المصالح الثلاث',
            paragraphs: [
              'تلتزم الأسرة السكينة بحفظ الضروريات الخمس للإنسان (الكليات الخمس): (١) حفظ الدين، (٢) حفظ النفس والسلامة الجسدية والنفسية، (٣) حفظ العقل والتعليم، (٤) حفظ النسل والصحة الإنجابية، و(٥) حفظ المال والاقتصاد الحلال.',
              'وفي تلبية احتياجات الأسرة، توجد ثلاث مراتب لأولويات المصلحة: الضروريات (الاحتياجات الأساسية) التي يجب تقديمها لتعلقها ببقاء الحياة، والحاجيات (الاحتياجات الثانوية) التي ترفع الحرج وتيسر الحياة، والتحسينيات (الاحتياجات التكميلية).',
            ],
          },
          {
            heading: '٣. الركائز الثلاث والأركان الخمسة للأسرة السكينة',
            paragraphs: [
              'يقوم البيت الزوجي المتين على ثلاث ركائز رئيسية: المعادلة (العدل) بلا تمييز، والموازنة (التوازن) بين الحقوق والواجبات، والمبادلة (التشاركية والتكافؤ) أي التعاون المتبادل بين الزوج والزوجة.',
            ],
            bullets: [
              'الزواج (الاقتران والتكامل): يكمل الزوج والزوجة بعضهما كاللباس الذي يستر العيوب ويمنح الدفء والحماية (سورة البقرة: ١٨٧).',
              'الميثاق الغليظ (العهد الوثيق مع الله): عقد النكاح عهد مقدس ووثيق جداً أمام الله سبحانه وتعالى (سورة النساء: ٢١).',
              'المعاشرة بالمعروف (التعامل الكريم): أن يعامل كل زوج شريكه بأدب ولطف واحترام كامل (سورة النساء: ١٩).',
              'الشورى (التشاور المشترك): معالجة المشكلات واتخاذ القرارات الأسرية بالتشاور والتفاهم معاً (سورة البقرة: ٢٣٣).',
              'التراضي (الرضا المتبادل): الإخلاص والقبول النفسي المتبادل في تنفيذ اتفاقات الأسرة.',
            ],
          },
        ],
        keyTakeaway:
          'مقصد الشريعة من تكوين الأسرة هو مقاصد الشريعة؛ والركائز الثلاث هي العدل والتوازن والمبادلة؛ والميثاق الغليظ يعني العهد الوثيق مع الله؛ وغاية الزواج في سورة الروم: ٢١ هي السكينة؛ وحل مشكلات الأسرة معاً يمثل ركن الشورى.',
      },
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
      jv: 'Modul 2: Psikologi Kulawarga, Segitiga Katresnan Sternberg, 4 Racun Komunikasi & 5 Basa Katresnan. Katresnan ingkang sampurna dumadi saking celak raos (Intimacy), greget (Passion), lan Komitmen. Tindak komunikasi ingkang sae kedah nebihi 4 racun komunikasi, nangkal Voice of Judgment kanthi Buka Pikiran, njagi perbandingan interaksi 5:1, ngupadi Win-win solution, saha mangertosi 5 Basa Katresnan garwa.',
      en: 'Module 2: Family Psychology, Sternberg’s Triangular Theory of Love, 4 Communication Poisons & 5 Love Languages. Consummate love combines Intimacy, Passion, and Commitment. Healthy couples avoid Gottman’s four communication poisons, maintain a 5:1 positive-to-negative interaction ratio, counter Voice of Judgment with an Open Mind, seek win-win conflict solutions, and practice all 5 Love Languages.',
      ar: 'الوحدة الثانية: علم نفس الأسرة، مثلث الحب لستيرنبرغ، سموم التواصل الأربعة، ولغات الحب الخمس. يقوم الحب الناضج على الألفة والشغف والالتزام، مع تجنب سموم التواصل الأربعة، والحفاظ على نسبة تفاعل إيجابي ٥ مقابل ١، ومعالجة صوت الحكم بالعقل المنفتح، والسعي إلى حلول توافقية، وإتقان لغات الحب الخمس.',
    },
    localizedContent: {
      jv: {
        judul: 'Modul 2: Psikologi Kulawarga, Segitiga Katresnan Sternberg, 4 Racun Komunikasi & 5 Basa Katresnan',
        keyTakeawayLabel: 'Intisari Kunci Evaluasi',
        sections: [
          {
            heading: '1. Teori Segitiga Katresnan (Robert J. Sternberg) & Dinamika Sesambetan Kulawarga',
            paragraphs: [
              'Katresnan ingkang paripurna (Consummate Love) wonten ing perkawinan dumadi saking 3 komponen wutuh: (1) Celak Raos Emosi (Intimacy) inggih punika raos sekeca, keterbukaan, lan kekancan ingkang anget; (2) Greget (Passion) inggih punika daya tarik fisik saha romansa halal; sarta (3) Komitmen (Commitment) inggih punika tekad njagi kawutuhan prajanjian suci palakrama ing salebeting suka miwah duka.',
              'Wonten ing psikologi kulawarga, sesambetan antawisipun garwa kakung lan garwa putri kawastanan relasi Marital, dene sesambetan tiyang sepuh lan putra kawastanan relasi Parental. Karukunan relasi marital dados pondasi kasarasan mental putra.',
            ],
          },
          {
            heading: '2. Sekawan Racun Komunikasi (John Gottman), Voice of Judgment & Rasio 5:1',
            paragraphs: [
              'Pasangan wajib nebihi 4 pangrusak komunikasi bale wisma: Kritik (Criticism) ingkang nyerang karakter pribadi, Ngremehaken/Sinisme (Contempt), Mbela Dhiri/Defensif (Defensiveness), lan Ngenengaken/Tembok Watu (Stonewalling).',
              'Wonten ing komunikasi empatik (Otto Scharmer), pepalang batos awujud Voice of Judgment (Swanten Panghakiman) dipuntangkal kanthi Mbukak Pikiran (Open Mind), Voice of Cynicism kanthi Mbukak Ati (Open Heart), lan Voice of Fear kanthi Mbukak Tekad (Open Will). Pasangan ingkang stabil njagi perbandingan interaksi positif tumrap negatif gunggungipun 5 banding 1 sarta ngrampungaken pasulayan tumuju Win-win solution.',
            ],
          },
          {
            heading: '3. Gangsal Basa Katresnan (The 5 Love Languages — Dr. Gary Chapman)',
            paragraphs: ['Saben pribadi gadhah cara ingkang beda-beda supados rumaos dipuntresnani. Mangertosi 5 basa katresnan pasangan panjenengan:'],
            bullets: [
              'Tembung Pangalem/Panyengkuyung (Words of Affirmation): Pangalem tulus, apresiasi, ukara ingkang alus, lan pandonga.',
              'Wekdal ingkang Berkualitas (Quality Time): Sesarengan kanthi fokus kekalih tanpa kagodha piranti gawai.',
              'Nampi Bebungah/Hadiah (Receiving Gifts): Paring pratandha katresnan utawi kejutan prasaja ingkang kebak kawigatosan.',
              'Pelayanan (Acts of Service): Pambiyantu nyata ngenthengaken tanggelan pasangan, kados dene andum pedamelan bale wisma.',
              'Gegem/Sentuhan Fisik (Physical Touch): Nyepeng asta, ngrangkul anget, lan katresnan fisik ingkang halal.',
            ],
          },
        ],
        keyTakeaway:
          'Segitiga katresnan Sternberg dumadi saking Celak Raos Emosi, Greget, lan Komitmen; rasio interaksi stabil inggih punika 5 banding 1; mbiyantu pedamelan bale wisma kalebet basa katresnan Pelayanan (Acts of Service); penawar Voice of Judgment inggih punika Mbukak Pikiran (Open Mind); saha ngrampungaken pasulayan gadhah tujuan Win-win solution.',
      },
      en: {
        judul: 'Module 2: Family Psychology, Sternberg’s Triangular Theory of Love, 4 Communication Poisons & 5 Love Languages',
        keyTakeawayLabel: 'Key Evaluation Takeaways',
        sections: [
          {
            heading: '1. Triangular Theory of Love (Robert J. Sternberg) & Family Relationship Dynamics',
            paragraphs: [
              'Complete, consummate love in marriage consists of 3 integral components: (1) Emotional Intimacy—feelings of comfort, openness, and warm friendship; (2) Passion—physical attraction and lawful romance; and (3) Commitment—the steadfast resolve to preserve the sacred bond of marriage through joy and hardship.',
              'In family psychology, the relationship between husband and wife is called the Marital relationship, whereas the relationship between parents and children is called the Parental relationship. Harmony in the marital relationship forms the foundation of children’s mental well-being.',
            ],
          },
          {
            heading: '2. The Four Communication Poisons (John Gottman), Voice of Judgment & the 5:1 Ratio',
            paragraphs: [
              'Couples must avoid 4 destroyers of household communication: Criticism that attacks personal character, Contempt/cynical belittling, Defensiveness, and Stonewalling (shutting down or giving the silent treatment).',
              'In empathic communication (Otto Scharmer), inner barriers such as the Voice of Judgment are countered with an Open Mind, the Voice of Cynicism with an Open Heart, and the Voice of Fear with an Open Will. Stable couples maintain a 5-to-1 ratio of positive to negative interactions and resolve conflicts toward a Win-win solution.',
            ],
          },
          {
            heading: '3. The Five Love Languages (Dr. Gary Chapman)',
            paragraphs: ['Every individual has a distinct way of feeling loved. Recognize your spouse’s 5 love languages:'],
            bullets: [
              'Words of Affirmation: Sincere praise, appreciation, gentle words, and prayers.',
              'Quality Time: Undivided, focused togetherness without gadget distractions.',
              'Receiving Gifts: Thoughtful tokens of affection or simple, meaningful surprises.',
              'Acts of Service: Practical help that lightens your partner’s load, such as sharing household chores.',
              'Physical Touch: Holding hands, warm embraces, and affectionate physical closeness.',
            ],
          },
        ],
        keyTakeaway:
          'Sternberg’s triangular theory of love consists of Emotional Intimacy, Passion, and Commitment; the stable interaction ratio is 5 to 1; helping with household chores is the love language of Acts of Service; the antidote to Voice of Judgment is Open Mind; and conflict resolution aims for a Win-win solution.',
      },
      ar: {
        judul: 'الوحدة الثانية: علم نفس الأسرة، مثلث الحب لستيرنبرغ، سموم التواصل الأربعة، ولغات الحب الخمس',
        keyTakeawayLabel: 'الخلاصة الأساسية للتقييم',
        sections: [
          {
            heading: '١. نظرية مثلث الحب (روبرت ستيرنبرغ) وديناميكية العلاقات الأسرية',
            paragraphs: [
              'يتكون الحب المتكامل الناضج (الحب الكامل) في الزواج من ثلاثة عناصر متكاملة: (١) القرب العاطفي والألفة (Intimacy) وهو الشعور بالراحة والانفتاح والصداقة الدافئة؛ (٢) الشغف (Passion) وهو الانجذاب الجسدي والرومانسية الحلال؛ و(٣) الالتزام (Commitment) وهو العزم الصادق على صون ميثاق الزواج المقدس في السراء والضراء.',
              'وفي علم نفس الأسرة، تُسمى العلاقة بين الزوج والزوجة بالعلاقة الزوجية (Marital)، بينما تُسمى العلاقة بين الوالدين والأبناء بالعلاقة الوالدية (Parental). ويمثل انسجام العلاقة الزوجية الأساس المتين للصحة النفسية للأبناء.',
            ],
          },
          {
            heading: '٢. سموم التواصل الأربعة (جون غوتمان)، صوت الحكم، ونسبة ٥ إلى ١',
            paragraphs: [
              'يجب على الزوجين تجنب أربعة مدمرات للتواصل الأسري: النقد الجارح الذي يهاجم الشخصية (Criticism)، والازدراء أو السخرية (Contempt)، والموقف الدفاعي المستمر (Defensiveness)، والانسحاب الصامت أو الجدار الحجري (Stonewalling).',
              'وفي التواصل التعاطفي (أوتو شارمر)، يُعالَج العائق الداخلي المسمى صوت الحكم (Voice of Judgment) بفتح العقل (Open Mind)، وصوت السخرية (Voice of Cynicism) بفتح القلب (Open Heart)، وصوت الخوف (Voice of Fear) بفتح الإرادة (Open Will). ويحافظ الزوجان المستقران على نسبة تفاعل إيجابي مقابل السلبي تبلغ ٥ إلى ١، كما يعالجان الخلافات للوصول إلى حل يرضي الطرفين (Win-win solution).',
            ],
          },
          {
            heading: '٣. لغات الحب الخمس (الدكتور غاري تشابمان)',
            paragraphs: ['لكل إنسان طريقته الخاصة التي يشعر من خلالها بالمحبة. تعرّف على لغات الحب الخمس لدى شريك حياتك:'],
            bullets: [
              'كلمات التشجيع والتقدير (Words of Affirmation): الثناء الصادق، والتقدير، والكلام اللطيف، والدعاء.',
              'الوقت النوعي (Quality Time): قضاء وقت مشترك بتركيز كامل دون انشغال بالأجهزة الإلكترونية.',
              'تقديم الهدايا (Receiving Gifts): إهداء رموز المودة أو مفاجآت بسيطة تحمل عناية واهتماماً.',
              'أعمال الخدمة (Acts of Service): المساعدة العملية التي تخفف العبء عن الشريك، مثل المشاركة في الأعمال المنزلية.',
              'التلامس الجسدي (Physical Touch): إمساك اليد، والعناق الدافئ، والمودة الجسدية الحلال.',
            ],
          },
        ],
        keyTakeaway:
          'يتكون مثلث الحب لستيرنبرغ من القرب العاطفي والشغف والالتزام؛ ونسبة التفاعل المستقر هي ٥ إلى ١؛ ومساعدة الشريك في الأعمال المنزلية تعد من لغة الحب أعمال الخدمة (Acts of Service)؛ وعلاج صوت الحكم (Voice of Judgment) هو فتح العقل (Open Mind)؛ ويهدف حل النزاعات إلى الوصول إلى حل توافقي يرضي الطرفين (Win-win solution).',
      },
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
      jv: 'Modul 3: Nyekapi Kabetahan Kulawarga, Manajemen Kauangan, Cashflow & Hak Bandha. Pados pangupajiwa dados ibadah menawi kanthi 4 prinsip ekonomi Islam (Halal, Makarya Sregep, Produktif, Prasaja tanpa Tabdzir), nabung ing wiwitan wulan (Pay Yourself First), nyawisaken Dana Darurat 3–6 wulan, saha kemitraan finansial garwa kakung lan garwa putri.',
      en: 'Module 3: Fulfilling Family Needs, Financial Management, Cashflow & Property Rights. Earning a living is worship when guided by four Islamic economic principles (Halal, hard work, productivity, simplicity without Tabdzir), saving at the start of the month (Pay Yourself First), building a 3–6 month Emergency Fund, and practicing transparent spousal financial partnership.',
      ar: 'الوحدة الثالثة: تلبية احتياجات الأسرة، الإدارة المالية، التدفق النقدي، وحقوق المال. يُعد كسب الرزق عبادةً عند الالتزام بالمبادئ الاقتصادية الإسلامية الأربعة (الحلال، الاجتهاد، الإنتاجية، الاعتدال واجتناب التبذير)، والادخار في بداية الشهر، وتكوين صندوق طوارئ يكفي ٣–٦ أشهر، والشراكة المالية بين الزوجين.',
    },
    localizedContent: {
      jv: {
        judul: 'Modul 3: Nyekapi Kabetahan Kulawarga, Manajemen Kauangan, Cashflow & Hak Bandha',
        keyTakeawayLabel: 'Intisari Kunci Evaluasi',
        sections: [
          {
            heading: '1. Sekawan Prinsip Ekonomi Kulawarga Sakinah & Larangan Tabdzir',
            paragraphs: [
              'Nyekapi kabetahan materi kulawarga gadhah nilai ibadah menawi dipunlampahi kanthi 4 Prinsip Ekonomi Islam: (1) Halal sae zatipun menapa dene cara anggenipun pikantuk, (2) Makarya Sregep (Ikhtiar Maksimal), (3) Produktif paring paedah jangka panjang, sarta (4) Gesang Prasaja lan Irit jumbuh kaliyan kemampuan.',
              'Agami Islam nglarang sanget gaya gesang boros saha ngawur-awur bandha kangge perkawis ingkang boten perlu, ingkang wonten ing QS. Al-Isra: 26–27 dipunsamekaken kaliyan sikap Tabdzir (Mubazir).',
            ],
          },
          {
            heading: '2. Rumus Alokasi Anggaran, Tabungan Wiwitan Wulan & Dana Darurat',
            paragraphs: [
              'Prinsip nabung ingkang leres sanes nengga turahan blanja ing pungkasan wulan, nanging nyisihaken arta langsung ing wiwitan wulan nalika nampi penghasilan, ingkang kawastanan "Mbajur dhiri pribadi langkung rumiyin" (Pay Yourself First).',
              'Kulawarga wajib nyawisaken Dana Darurat (Emergency Fund) gunggungipun 3–6 tikelipun pangeluaran saben wulan kangge ngadhepi kahanan ingkang boten kanyana-nyana (gerah, kacilakan, utawi PHK) tanpa kajiret utang mawi bunga inggil. Bedakaken Pangeluaran Produktif lan Pangeluaran Konsumtif.',
            ],
          },
          {
            heading: '3. Kemitraan Finansial Garwa Kakung-Putri & Kalenggahan Bandha ing Islam',
            paragraphs: [
              'Ngrumusaken tujuan kauangan, nyathet arus kas (cashflow), lan nyusun anggaran saben wulan wajib dipunlampahi kanthi terbuka dening Garwa Kakung lan Garwa Putri (Kekalih) kados dene Satunggal Tim Kerja (Team Work).',
              'Wonten ing Fiqih Munakahat, garwa kakung nanggung kuwajiban utama paring nafkah jumbuh kaliyan kemampuanipun. Menawi garwa putri makarya utawi gadhah usaha piyambak, penghasilan garwa putri punika statusipun bandha mutlak kagunganipun garwa putri, lan pangginaanipun kangge bale wisma dados sedekah adhedhasar karilan sesarengan (Taradlin).',
            ],
          },
        ],
        keyTakeaway:
          'Pados nafkah gadhah nilai ibadah menawi ngginakaken prinsip Halal; nabung ing wiwitan wulan kawastanan Mbajur dhiri pribadi langkung rumiyin; simpenan kangge kahanan boten kanyana-nyana inggih punika Dana Darurat; pangrencanan kauangan dipunrumusaken dening Garwa Kakung lan Garwa Putri (Kekalih); saha sikap boros kawastanan Tabdzir (Mubazir).',
      },
      en: {
        judul: 'Module 3: Fulfilling Family Needs, Financial Management, Cashflow & Property Rights',
        keyTakeawayLabel: 'Key Evaluation Takeaways',
        sections: [
          {
            heading: '1. Four Economic Principles of a Sakinah Family & Prohibition of Tabdzir',
            paragraphs: [
              'Fulfilling the family’s material needs carries the value of worship when practiced through 4 Islamic Economic Principles: (1) Halal in both substance and means of acquisition, (2) Hard Work (maximum effort), (3) Productive in generating long-term benefit, and (4) Living Simply and Frugally within one’s means.',
              'Islam strictly forbids an extravagant lifestyle and squandering wealth on unnecessary things, which in QS. Al-Isra: 26–27 is equated with Tabdzir (wasteful extravagance).',
            ],
          },
          {
            heading: '2. Budget Allocation Formula, Early-Month Savings & Emergency Fund',
            paragraphs: [
              'The proper principle of saving is not waiting for leftover shopping money at the end of the month, but setting funds aside immediately at the beginning of the month upon receiving income—known as "Pay Yourself First."',
              'Families must prepare an Emergency Fund equal to 3–6 times monthly expenses to face unexpected situations (illness, accidents, or job loss) without falling into high-interest debt. Always distinguish between Productive Expenses and Consumptive Expenses.',
            ],
          },
          {
            heading: '3. Spousal Financial Partnership & Property Status in Islam',
            paragraphs: [
              'Defining financial goals, recording cashflow, and planning the monthly budget must be carried out transparently by both Husband and Wife together as One Team (Team Work).',
              'In Islamic marriage jurisprudence (Fiqih Munakahat), the husband holds the primary duty to provide financial maintenance according to his means. If the wife works or runs her own business, her income belongs solely to her, and any contribution she makes toward household expenses counts as charity based on mutual willingness (Taradlin).',
            ],
          },
        ],
        keyTakeaway:
          'Earning a livelihood counts as worship when grounded in Halal principles; saving at the start of the month is called Pay Yourself First; reserves for unexpected events are the Emergency Fund; financial planning is formulated by Husband and Wife together; and wasteful spending is called Tabdzir (extravagance).',
      },
      ar: {
        judul: 'الوحدة الثالثة: تلبية احتياجات الأسرة، الإدارة المالية، التدفق النقدي، وحقوق المال',
        keyTakeawayLabel: 'الخلاصة الأساسية للتقييم',
        sections: [
          {
            heading: '١. المبادئ الاقتصادية الأربعة للأسرة السكينة وتحريم التبذير',
            paragraphs: [
              'تحمل تلبية الاحتياجات المادية للأسرة قيمة العبادة إذا نُفذت وفق أربعة مبادئ للاقتصاد الإسلامي: (١) الكسب الحلال ذاتاً ووسيلةً، (٢) العمل الجاد وبذل أقصى الجهد، (٣) الإنتاجية التي تحقق نفعاً طويل الأمد، و(٤) العيش ببساطة واعتدال وفق الاستطاعة.',
              'ويحرم الإسلام بشدة نمط الحياة المسرف وإهدار المال في غير حاجة، وهو ما شبّهته سورة الإسراء الآيتان ٢٦–٢٧ بصفة التبذير.',
            ],
          },
          {
            heading: '٢. معادلة توزيع الميزانية، الادخار في بداية الشهر، وصندوق الطوارئ',
            paragraphs: [
              'المبدأ الصحيح للادخار ليس انتظار ما يتبقى من المصروف في نهاية الشهر، بل استقطاع مبلغ الادخار فوراً في بداية الشهر عند استلام الدخل، وهو ما يُعرف بمبدأ "ادفع لنفسك أولاً" (Pay Yourself First).',
              'ويجب على الأسرة تكوين صندوق للطوارئ (Emergency Fund) يعادل ٣ إلى ٦ أضعاف المصروف الشهري لمواجهة الظروف غير المتوقعة (المرض، أو الحوادث، أو فقدان العمل) دون الوقوع في الديون عالية الفائدة، مع التمييز دائماً بين النفقات الإنتاجية والنفقات الاستهلاكية.',
            ],
          },
          {
            heading: '٣. الشراكة المالية بين الزوجين ومكانة المال في الإسلام',
            paragraphs: [
              'ينبغي صياغة الأهداف المالية، وتدوين التدفق النقدي (Cashflow)، وإعداد الميزانية الشهرية بشفافية تامة من قِبل الزوج والزوجة معاً كفريق عمل واحد (Team Work).',
              'وفي فقه النكاح، يتحمل الزوج الواجب الأساسي في الإنفاق وفق قدرته. وإذا كانت الزوجة تعمل أو تمتلك مشروعاً خاصاً، فإن دخلها يعد مالاً خالصاً لها وحدها، وما تنفقه منه على البيت يُحتسب صدقةً قائمة على الرضا المتبادل (التراضي).',
            ],
          },
        ],
        keyTakeaway:
          'يُعد كسب الرزق عبادةً إذا قام على مبدأ الحلال؛ والادخار في بداية الشهر يُعرف بمبدأ ادفع لنفسك أولاً؛ والمبلغ المدخر للحالات الطارئة يُسمى صندوق الطوارئ؛ ويُعد التخطيط المالي من قِبل الزوج والزوجة معاً؛ ويُسمى الإسراف وإهدار المال بالتبذير.',
      },
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
      jv: "Modul 4: Kasarasan Reproduksi Kulawarga, Fiqih Haid, Bobotan, ASI & Kontrasepsi ('Azl). Garwa kakung lan putri kados pangangge (Libas) ingkang saling ngayomi. Nalika haid (adza), garwa kakung kedah paring empati. Nyegah stunting dipunwiwiti saking gizi calon ibu (LiLA ≥ 23,5 cm, Hb ≥ 12 g/dL, IMT 18,5–24,9), pemeriksaan bobotan minimal 6 kaping, ASI ngantos 2 taun, KB nyegah 4 Terlalu, saha 'Azl kanthi idin garwa putri.",
      en: "Module 4: Family Reproductive Health, Jurisprudence of Menstruation, Pregnancy, Breastfeeding & Contraception ('Azl). Spouses are garments (Libas) protecting and honoring each other; menstruation is physical discomfort (adza) requiring empathy; stunting prevention begins pre-pregnancy (MUAC ≥ 23.5 cm, Hb ≥ 12 g/dL, BMI 18.5–24.9), with at least 6 prenatal visits, breastfeeding up to 2 full years, family planning to avoid the 4 Too's, and 'Azl requiring the wife's consent.",
      ar: "الوحدة الرابعة: الصحة الإنجابية للأسرة، فقه الحيض، الحمل، الرضاعة، وتنظيم النسل (العزل). الزوجان لباس لبعضهما في الحماية والستر، والحيض أذى يستدعي الرفق، وتبدأ الوقاية من التقزم بتأهيل التغذية قبل الحمل (محيط العضد ≥ ٢٣.٥ سم، الهيموغلوبين ≥ ١٢ غ/دل، ومؤشر كتلة الجسم ١٨.٥–٢٤.٩)، مع ٦ زيارات متابعة للحمل على الأقل، والرضاعة حولين كاملين، وتنظيم الأسرة، واشتراط إذن الزوجة في العزل.",
    },
    localizedContent: {
      jv: {
        judul: "Modul 4: Kasarasan Reproduksi Kulawarga, Fiqih Haid, Bobotan, ASI & Kontrasepsi ('Azl)",
        keyTakeawayLabel: 'Intisari Kunci Evaluasi',
        sections: [
          {
            heading: '1. Relasi Seksual Sehat (QS. Al-Baqarah: 187) & Fiqih Haid (QS. Al-Baqarah: 222)',
            paragraphs: [
              'Miturut QS. Al-Baqarah ayat 187, garwa kakung lan garwa putri dipunibarataken kados dene "Pangangge" (Libas) tumrap pasanganipun, tegesipun sami ngayomi, njagi kaluhuran, nutupi kekirangan, lan ngendahaken. Sesambetan seksual wonten ing palakrama punika ibadah ingkang dipuntindakaken kanthi santun saha tanpa peksan.',
              'Adhedhasar QS. Al-Baqarah ayat 222, haid punika kahanan biologis ingkang nuwuhaken raos sakit saha kesel fisik utawi emosi (Adza). Garwa kakung wajib paring empati, maringi wekdal garwa putri ngaso, sarta dipunlarang nindakaken sesambetan seksual lumantar vagina nalika haid ngantos garwa putri suci lan adus wajib (Ghusl).',
            ],
          },
          {
            heading: '2. Kesiapan Gizi Pra-Nikah, Nyegah Stunting, Bobotan & ASI 2 Taun',
            paragraphs: [
              'Nyegah stunting dipunwiwiti wiwit calon pengantin saderengipun bobot. Standar medis sehat tumrap calon ibu inggih punika Lingkar Lengan Atas (LiLA) paling sakedhik 23,5 cm (bebas KEK), kadar Hemoglobin (Hb) paling sakedhik 12 g/dL (bebas anemia), sarta IMT ideal 18,5 – 24,9.',
              "QS. Luqman ayat 14 nggambaraken bobotan minangka kahanan ringkih ingkang saya tambah (wahnan 'ala wahnin), saengga garwa kakung wajib paring panyengkuyung nutrisi lan pemeriksaan rutin paling sakedhik 6 kaping. Sasampunipun jabang bayi miyos, QS. Al-Baqarah ayat 233 nganjuraken ASI Eksklusif 6 wulan lan nyampurnakaken nyusoni ngantos yuswa 2 taun jangkep.",
            ],
          },
          {
            heading: "3. Kulawarga Berencana (KB), Nyegah 4 Terlalu & Fiqih Metode 'Azl",
            paragraphs: [
              'Tindakan ngatur jarak kelairan demi kaslametan ibu lan tuwuh kembangipun putra kawastanan Kulawarga Berencana (KB), kangge nebihi risiko "4 Terlalu": Kaanomen (<20 taun), Kasepuhen (>35 taun), Kacelaken (<2 taun), lan Kakathahen (>4 putra).',
              "Wonten ing Fiqih Madzhab Maliki lan Hambali, metode kontrasepsi alami 'Azl kaparengaken nanging boten kenging dipuntindakaken tanpa persetujuan/idin garwa putri awit garwa putri gadhah hak tumrap kapuasan seksual saha keturunan.",
            ],
          },
        ],
        keyTakeaway:
          "QS. Al-Baqarah: 222 nyebataken bilih haid nuwuhaken raos sakit (adza); garwa kakung-putri kados pangangge tegesipun sami ngayomi lan ngendahaken; nyampurnakaken ASI ngantos yuswa 2 taun jangkep; ngatur jarak kelairan kawastanan Kulawarga Berencana (KB); saha metode 'Azl wajib adhedhasar persetujuan/idin garwa putri.",
      },
      en: {
        judul: "Module 4: Family Reproductive Health, Jurisprudence of Menstruation, Pregnancy, Breastfeeding & Contraception ('Azl)",
        keyTakeawayLabel: 'Key Evaluation Takeaways',
        sections: [
          {
            heading: '1. Healthy Sexual Relations (QS. Al-Baqarah: 187) & Jurisprudence of Menstruation (QS. Al-Baqarah: 222)',
            paragraphs: [
              'According to QS. Al-Baqarah verse 187, husband and wife are likened to "Garments" (Libas) for one another—meaning they protect each other, guard honor, cover flaws, and adorn one another. Sexual intimacy in marriage is an act of worship carried out with courtesy and without coercion.',
              'Based on QS. Al-Baqarah verse 222, menstruation is a biological condition causing physical pain and physical or emotional fatigue (Adza). The husband must show empathy, give his wife time to rest, and refrain from vaginal intercourse during menstruation until she becomes pure and completes the ritual bath (Ghusl).',
            ],
          },
          {
            heading: '2. Pre-Marital Nutritional Readiness, Stunting Prevention, Pregnancy & 2-Year Breastfeeding',
            paragraphs: [
              'Stunting prevention begins with prospective brides and grooms before pregnancy. Healthy medical standards for a prospective mother include a Mid-Upper Arm Circumference (MUAC/LiLA) of at least 23.5 cm (free from chronic energy deficiency), Hemoglobin (Hb) level of at least 12 g/dL (free from anemia), and an ideal BMI of 18.5 – 24.9.',
              "QS. Luqman verse 14 describes pregnancy as weakness upon weakness (wahnan 'ala wahnin), so the husband must provide nutritional support and ensure at least 6 routine prenatal checkups. After childbirth, QS. Al-Baqarah verse 233 recommends 6 months of Exclusive Breastfeeding and completing breastfeeding up to 2 full years.",
            ],
          },
          {
            heading: "3. Family Planning (KB), Avoiding the 4 Too's & Jurisprudence of 'Azl",
            paragraphs: [
              'Spacing births for the safety of the mother and optimal child development is called Family Planning (KB), aimed at avoiding the risks of the "4 Too’s": Too Young (<20 years), Too Old (>35 years), Too Close (<2 years apart), and Too Many (>4 children).',
              "In Maliki and Hanbali jurisprudence, the natural contraceptive method of 'Azl (coitus interruptus) is permissible but may not be practiced without the wife’s consent/permission, because the wife holds rights to sexual fulfillment and offspring.",
            ],
          },
        ],
        keyTakeaway:
          "QS. Al-Baqarah: 222 states that menstruation causes physical pain/discomfort (adza); spouses being like garments means protecting and adorning each other; completing breastfeeding extends to 2 full years; spacing births is called Family Planning (KB); and the 'Azl method requires the wife's consent/permission.",
      },
      ar: {
        judul: 'الوحدة الرابعة: الصحة الإنجابية للأسرة، فقه الحيض، الحمل، الرضاعة، وتنظيم النسل (العزل)',
        keyTakeawayLabel: 'الخلاصة الأساسية للتقييم',
        sections: [
          {
            heading: '١. العلاقة الزوجية الصحية (سورة البقرة: ١٨٧) وفقه الحيض (سورة البقرة: ٢٢٢)',
            paragraphs: [
              'وفقاً لقوله تعالى في سورة البقرة الآية ١٨٧، شُبّه الزوج والزوجة باللباس لكل منهما، مما يعني الحماية المتبادلة، وحفظ الكرامة، وستر العيوب، وتجميل كل طرف للآخر. وتُعد العلاقة الزوجية في النكاح عبادةً تُمارَس بلطف واحترام ودون إكراه.',
              'وبناءً على سورة البقرة الآية ٢٢٢، فإن الحيض حالة بيولوجية تسبب الألم والإرهاق الجسدي والعاطفي (أذى). وعلى الزوج أن يتحلى بالتعاطف، ويمنح زوجته فرصة للراحة، ويحرم الجماع في الفرج أثناء الحيض حتى تطهر الزوجة وتغتسل غسل الطهارة.',
            ],
          },
          {
            heading: '٢. الجاهزية الغذائية قبل الزواج، الوقاية من التقزم، الحمل، والرضاعة لعامين',
            paragraphs: [
              'تبدأ الوقاية من التقزم منذ مرحلة المقبلين على الزواج قبل حدوث الحمل. وتشمل المعايير الطبية الصحية للأم المستقبليّة ألا يقل محيط منتصف العضد (LiLA) عن ٢٣.٥ سم (للسلامة من نقص الطاقة المزمن)، وألا يقل مستوى الهيموغلوبين (Hb) عن ١٢ غ/دل (للسلامة من فقر الدم)، وأن يكون مؤشر كتلة الجسم المثالي بين ١٨.٥ و٢٤.٩.',
              'وتصف سورة لقمان الآية ١٤ الحمل بأنه وهن على وهن، ولذلك يجب على الزوج تقديم الدعم الغذائي والحرص على إجراء الفحوصات الدورية ست مرات على الأقل. وبعد الولادة، توصي سورة البقرة الآية ٢٣٣ بالرضاعة الطبيعية الحصرية لمدة ٦ أشهر وإتمام الرضاعة حتى حولين كاملين.',
            ],
          },
          {
            heading: '٣. تنظيم الأسرة، الوقاية من مخاطر "الأربعة الزائدة"، وفقه العزل',
            paragraphs: [
              'يُسمى تنظيم المباعدة بين الولادات حفاظاً على سلامة الأم ونمو الطفل بتنظيم الأسرة (KB)، وذلك لتجنب مخاطر "الأربعة الزائدة": الحمل في سن مبكرة جداً (أقل من ٢٠ سنة)، أو متأخرة جداً (أكثر من ٣٥ سنة)، أو فترات متقاربة جداً (أقل من سنتين)، أو عدد أبناء كثير جداً (أكثر من ٤ أطفال).',
              'وفي الفقه المالكي والحنبلي، يجوز استخدام وسيلة العزل الطبيعية لمنع الحمل، غير أنه لا يجوز الإقدام عليها دون إذن الزوجة وموافقتها لأن للزوجة حقاً أصيلاً في الاستمتاع والنسل.',
            ],
          },
        ],
        keyTakeaway:
          'تذكر سورة البقرة: ٢٢٢ أن الحيض حالة تسبب الألم والأذى؛ وتشبيه الزوجين باللباس يعني الحماية المتبادلة والتجميل؛ وإتمام الرضاعة يستمر حتى حولين كاملين؛ وتنظيم المباعدة بين الولادات يُسمى تنظيم الأسرة؛ ولا يجوز العزل إلا بموافقة الزوجة وإذنها.',
      },
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
      jv: 'Modul 5: Nyiapaken Generasi Berkualitas, Moderasi Beragama, 6 Aspek Perkembangan & Pola Asuh. Nyiapaken putra-putri ingkang saleh/salehah kanthi nilai Moderasi Beragama (At-Tawasuth, At-Tawazun, I’tidal, At-Tasamuh), 3 Ukhuwah (Islamiyah, Wathaniyah, Basyariyah), 6 aspek perkembangan anak, 4 peran utama tiyang sepuh, 4 strategi disiplin positif tanpa kekerasan, lan Piagam Kami Kompak.',
      en: 'Module 5: Preparing a Quality Generation, Religious Moderation, 6 Developmental Domains & Parenting. Raising righteous (Saleh/Salehah) children integrates Religious Moderation (At-Tawasuth, At-Tawazun, I’tidal, At-Tasamuh), 3 Brotherhoods (Islamiyah, Wathaniyah, Basyariyah), 6 child-development domains, 4 parental roles, 4 non-violent positive discipline strategies, and the "Kami Kompak" charter.',
      ar: 'الوحدة الخامسة: إعداد جيل متميز، الوسطية الدينية، مجالات نمو الطفل الستة، وأساليب التربية. تشمل تربية جيل صالح متوازن على قيم الوسطية الدينية (التوسط والتوازن والاعتدال والتسامح)، والأخوة الثلاث (الإسلامية والوطنية والإنسانية)، وتنمية مجالات الطفل الستة، وأدوار الوالدين الأربعة، واستراتيجيات الانضباط الإيجابي الأربع بلا عنف، وميثاق التوافق الأسري.',
    },
    localizedContent: {
      jv: {
        judul: 'Modul 5: Nyiapaken Generasi Berkualitas, Moderasi Beragama, 6 Aspek Perkembangan & Pola Asuh',
        keyTakeawayLabel: 'Intisari Kunci Evaluasi',
        sections: [
          {
            heading: '1. Profil Putra Saleh/Salehah, Nilai Moderasi Beragama & Tiga Ukhuwah',
            paragraphs: [
              'Generasi berkualitas ingkang sadar dhumateng Gusti Allah lan akhlakipun dados rahmat tumrap alam semesta kawastanan generasi Saleh/Salehah, ingkang nyakup kasalehan ritual sisan kasalehan sosial.',
              "Tiyang sepuh nanemaken Moderasi Beragama wiwit alit: At-Tawasuth (moderat/tengah-tengah), At-Tawazun (seimbang donya-akhirat), I'tidal (jejering adil), lan At-Tasamuh (toleran). Putra ugi dipunwulang njagi 3 tali paseduluran: Ukhuwah Islamiyah (sesami muslim), Ukhuwah Wathaniyah (sesami warga bangsa Indonesia), lan Ukhuwah Basyariyah (sesami umat manungsa).",
            ],
          },
          {
            heading: '2. Enem Aspek Perkembangan Putra & Sekawan Peran Utama Tiyang Sepuh',
            paragraphs: [
              'Panggulawenthah ingkang wutuh ngrangsang 6 Aspek Perkembangan Putra: (1) Nilai Agami lan Moral, (2) Fisik-Motorik, (3) Kognitif/Daya Pikir, (4) Basa lan Komunikasi, (5) Sosial-Emosional, sarta (6) Seni lan Kreativitas.',
              'Rama lan ibu nanggung sesarengan 4 Peran Utama Tiyang Sepuh: Pangrumatan/Perawatan (gizi, imunisasi, karesikan), Pangasuhan (katresnan lan raketing raos aman), Pangayoman/Perlindungan (aman saking kekerasan/perundungan), lan Pendhidhikan (karakter lan kawruh).',
            ],
          },
          {
            heading: '3. Sekawan Strategi Disiplin Positif Tanpa Kekerasan & Piagam "Kami Kompak"',
            paragraphs: [
              'Nggulawenthah putra dipuntindakaken tanpa kekerasan fisik menapa dene verbal, nanging lumantar 4 Strategi Kadisiplinan Positif: (1) Nyontoni kanthi tuladha nyata, (2) pranatan ingkang Cetha jumbuh kaliyan yuswa, (3) sikap Tegas kebak welas asih, sarta (4) Konsisten satunggal swanten antawisipun rama lan ibu.',
              'Calon pengantin nyusun Piagam Komitmen Pasangan "Kami Kompak" supados kasingkir saking pasulayan beda pola asuh ing tembe wingking.',
            ],
          },
        ],
        keyTakeaway:
          "Karakter putra rahmat semesta kawastanan Saleh/Salehah; sikap moderat kawastanan At-Tawasuth; paseduluran sabangsa kawastanan Ukhuwah Wathaniyah; 4 strategi disiplin positif inggih punika Nyontoni, Cetha, Tegas, lan Konsisten; sarta tujuan Piagam 'Kami Kompak' inggih punika nebihi pasulayan beda pola asuh ing tembe wingking.",
      },
      en: {
        judul: 'Module 5: Preparing a Quality Generation, Religious Moderation, 6 Developmental Domains & Parenting',
        keyTakeawayLabel: 'Key Evaluation Takeaways',
        sections: [
          {
            heading: '1. Profile of Righteous Children (Saleh/Salehah), Religious Moderation & Three Brotherhoods',
            paragraphs: [
              'A quality generation who are conscious of Allah and whose character brings mercy to the universe are called a Righteous (Saleh/Salehah) generation, encompassing both spiritual devotion and social piety.',
              "Parents instill Religious Moderation from an early age: At-Tawasuth (moderate/balanced middle path), At-Tawazun (harmony between worldly life and the hereafter), I'tidal (uprightness and fairness), and At-Tasamuh (tolerance). Children are also taught to uphold 3 bonds of brotherhood: Ukhuwah Islamiyah (among fellow Muslims), Ukhuwah Wathaniyah (among fellow citizens of Indonesia), and Ukhuwah Basyariyah (among all humankind).",
            ],
          },
          {
            heading: '2. Six Domains of Child Development & Four Primary Parental Roles',
            paragraphs: [
              'Holistic parenting nurtures 6 Child Development Domains: (1) Religious and Moral Values, (2) Physical-Motor, (3) Cognitive/Thinking Skills, (4) Language and Communication, (5) Social-Emotional, and (6) Arts and Creativity.',
              'Father and mother share 4 Primary Parental Roles: Care (nutrition, immunization, hygiene), Nurturing (affection and secure attachment), Protection (safety from abuse and bullying), and Education (character and knowledge).',
            ],
          },
          {
            heading: '3. Four Non-Violent Positive Discipline Strategies & the "Kami Kompak" Charter',
            paragraphs: [
              'Educating children is practiced without physical or verbal violence, instead using 4 Positive Discipline Strategies: (1) Modeling through real example, (2) Clear age-appropriate rules, (3) Firmness filled with compassion, and (4) Consistency with one unified voice between father and mother.',
              'Prospective couples draft the "Kami Kompak" Joint Commitment Charter to prevent future conflicts arising from differing parenting styles.',
            ],
          },
        ],
        keyTakeaway:
          "Children whose character is a mercy to the world are called Saleh/Salehah; a moderate religious stance is called At-Tawasuth; national fellowship is called Ukhuwah Wathaniyah; the 4 positive discipline strategies are Modeling, Clarity, Firmness, and Consistency; and the purpose of the 'Kami Kompak' Charter is to avoid conflicts over differing parenting styles in the future.",
      },
      ar: {
        judul: 'الوحدة الخامسة: إعداد جيل متميز، الوسطية الدينية، مجالات نمو الطفل الستة، وأساليب التربية',
        keyTakeawayLabel: 'الخلاصة الأساسية للتقييم',
        sections: [
          {
            heading: '١. صفات الولد الصالح، قيم الوسطية الدينية، والأخوّات الثلاث',
            paragraphs: [
              'يُطلق على الجيل المتميز الواعي بالله والذي تكون أخلاقه رحمةً للعالمين اسم الجيل الصالح (صالح/صالحة)، وهو يشمل الصلاح التعبدي والصلاح الاجتماعي معاً.',
              'ويغرس الوالدان قيم الوسطية الدينية منذ الصغر: التوسط (الاعتدال وعدم الغلو)، والتوازن (الموازنة بين الدنيا والآخرة)، والاعتدال (الاستقامة والعدل)، والتسامح. كما يُعلَّم الطفل صون ثلاث روابط للأخوة: الأخوة الإسلامية (بين المسلمين)، والأخوة الوطنية (بين أبناء الوطن الإندونيسي)، والأخوة الإنسانية (بين بني البشر جميعاً).',
            ],
          },
          {
            heading: '٢. مجالات نمو الطفل الستة وأدوار الوالدين الأربعة الرئيسية',
            paragraphs: [
              'تحفز التربية المتكاملة ستة مجالات لنمو الطفل: (١) القيم الدينية والأخلاقية، (٢) النمو الجسدي والحركي، (٣) النمو المعرفي والقدرة على التفكير، (٤) اللغة والتواصل، (٥) النمو الاجتماعي والعاطفي، و(٦) الفنون والإبداع.',
              'ويتحمل الأب والأم معاً أربعة أدوار رئيسية: الرعاية الصحية (التغذية والتطعيم والنظافة)، والحضانة والعطف (المودة والارتباط الآمن)، والحماية (الأمان من العنف والتنمر)، والتعليم (بناء الشخصية والعلم).',
            ],
          },
          {
            heading: '٣. استراتيجيات الانضباط الإيجابي الأربع دون عنف وميثاق "نحن متفقون" (Kami Kompak)',
            paragraphs: [
              'تُمارَس تربية الأبناء بعيداً عن العنف الجسدي أو اللفظي، وذلك عبر أربع استراتيجيات للانضباط الإيجابي: (١) القدوة العملية، (٢) قواعد واضحة تناسب العمر، (٣) الحزم المقرون بالرحمة والمودة، و(٤) الاستمرارية والثبات بصوت واحد متفق بين الأب والأم.',
              'ويصوغ المقبلان على الزواج ميثاق الالتزام المشترك "نحن متفقون" (Kami Kompak) لتجنب الخلافات الناتجة عن تباين أساليب التربية في المستقبل.',
            ],
          },
        ],
        keyTakeaway:
          'تُسمى شخصية الطفل الذي يكون رحمة للعالمين بالصالح/الصالحة؛ ويُسمى المنهج المعتدل بالتوسط؛ وتُسمى أخوة أبناء الوطن بالأخوة الوطنية؛ واستراتيجيات الانضباط الإيجابي الأربع هي القدوة والوضوح والحزم والاستمرارية؛ ويهدف ميثاق "نحن متفقون" (Kami Kompak) إلى تجنب الخلافات حول اختلاف أساليب التربية مستقبلاً.',
      },
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
