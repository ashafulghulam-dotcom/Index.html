export type InstallPlatform = 'android' | 'ios' | 'desktop';

export interface InstallStep {
  title: string;
  detail: string;
}

export function detectInstallPlatform(userAgent: string): InstallPlatform {
  const ua = (userAgent || '').toLowerCase();
  if (/iphone|ipad|ipod/.test(ua)) {
    return 'ios';
  }
  if (/android/.test(ua)) {
    return 'android';
  }
  return 'desktop';
}

export function isEmbeddedIframe(win?: { self?: unknown; top?: unknown }): boolean {
  if (!win) return false;
  try {
    return win.self !== win.top;
  } catch {
    return true;
  }
}

export function getInstallSteps(platform: InstallPlatform): InstallStep[] {
  if (platform === 'android') {
    return [
      {
        title: 'Buka di Google Chrome / Samsung Internet',
        detail: 'Pastikan tautan SAMAWA dibuka langsung di browser Android (bukan browser dalam aplikasi).',
      },
      {
        title: 'Ketuk Menu Titik Tiga (⋮) di Pojok Kanan Atas',
        detail: 'Pilih menu "Instal aplikasi" atau "Tambahkan ke layar utama" (Add to Home screen).',
      },
      {
        title: 'Ketuk "Instal" — Langsung Siap Digunakan',
        detail: 'Ikon SAMAWA otomatis muncul di layar utama HP Anda dan berjalan layar penuh seperti APK.',
      },
    ];
  }

  if (platform === 'ios') {
    return [
      {
        title: 'Buka Tautan di Browser Safari',
        detail: 'Pastikan halaman SAMAWA dibuka menggunakan aplikasi Safari di iPhone atau iPad.',
      },
      {
        title: 'Ketuk Ikon Bagikan (Share)',
        detail: 'Ketuk tombol kotak dengan panah ke atas di bilah bawah Safari.',
      },
      {
        title: 'Pilih "Tambah ke Layar Utama" (Add to Home Screen)',
        detail: 'Ketuk "Tambah" di pojok kanan atas — ikon SAMAWA langsung terpasang di layar utama.',
      },
    ];
  }

  return [
    {
      title: 'Buka di Google Chrome atau Microsoft Edge',
      detail: 'Pastikan halaman SAMAWA terbuka di jendela utama browser pada laptop atau komputer Anda.',
    },
    {
      title: 'Klik Ikon Instal di Bilah Alamat (Pojok Kanan)',
      detail: 'Atau buka menu browser (⋮) lalu pilih "Simpan dan bagikan" → "Instal SAMAWA".',
    },
    {
      title: 'Klik "Instal" untuk Memasang Aplikasi',
      detail: 'Aplikasi SAMAWA langsung terpasang di Desktop / Start Menu dan dapat dibuka kapan saja.',
    },
  ];
}
