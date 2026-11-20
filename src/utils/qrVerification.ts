export type QrDocumentKind = 'sertifikat' | 'kompak' | 'laporan' | 'absen' | 'peserta';

const PARAM_BY_KIND: Record<QrDocumentKind, string> = {
  sertifikat: 'cek',
  kompak: 'cek_kompak',
  laporan: 'cek_laporan',
  absen: 'cek_absen',
  peserta: 'cek',
};

const ALL_VERIFY_PARAMS = ['cek', 'cek_kompak', 'cek_laporan', 'cek_absen'] as const;

export function getAppBaseOrigin(): string {
  if (typeof window !== 'undefined' && window.location?.origin && window.location.origin !== 'null') {
    return window.location.origin;
  }
  return 'https://samawa.kemenagjepara.go.id';
}

export function inferQrKindFromCode(code: string): QrDocumentKind {
  const upper = (code || '').trim().toUpperCase();
  if (upper.startsWith('KOMPAK-')) return 'kompak';
  if (upper.startsWith('ABSEN-')) return 'absen';
  if (upper.startsWith('LAP-BIMWIN-')) return 'laporan';
  if (upper.startsWith('JPR-')) return 'sertifikat';
  return 'peserta';
}

/**
 * Builds a clickable HTTPS verification URL suitable for encoding inside QR codes.
 * When scanned by any smartphone camera, it opens SAMAWA directly on the official
 * document verification screen.
 */
export function buildVerificationQrUrl(
  code: string,
  kind?: QrDocumentKind,
  originOverride?: string
): string {
  const cleanCode = (code || '').trim();
  const origin = (originOverride || getAppBaseOrigin()).replace(/\/+$/, '');
  if (!cleanCode) return `${origin}/`;
  // Avoid double-wrapping if already a full verification URL
  if (/^https?:\/\//i.test(cleanCode)) {
    return cleanCode;
  }
  const resolvedKind = kind || inferQrKindFromCode(cleanCode);
  const param = PARAM_BY_KIND[resolvedKind];
  return `${origin}/?${param}=${encodeURIComponent(cleanCode)}`;
}

/**
 * Extracts a clean document code, NIK, or username from either a raw text input
 * or a full SAMAWA verification QR URL (e.g. https://.../?cek=JPR-JEP-2026-0001).
 */
export function extractVerificationCode(rawInput: string): string {
  const trimmed = (rawInput || '').trim();
  if (!trimmed) return '';

  // Handle full URLs or query-only strings from QR scans
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('?') || trimmed.includes('?cek')) {
    try {
      const url = new URL(
        trimmed.startsWith('http') ? trimmed : `https://samawa.local/${trimmed.replace(/^\/+/, '')}`
      );
      for (const param of ALL_VERIFY_PARAMS) {
        const val = url.searchParams.get(param);
        if (val && val.trim()) {
          return val.trim();
        }
      }
    } catch {
      // Fall through to raw regex extraction
      const match = trimmed.match(/[?&](?:cek|cek_kompak|cek_laporan|cek_absen)=([^&#]+)/i);
      if (match?.[1]) {
        return decodeURIComponent(match[1]).trim();
      }
    }
  }

  return trimmed.replace(/^@/, '');
}

/**
 * Reads any active QR verification query parameter from window.location.search.
 */
export function readVerificationCodeFromSearch(search: string): string {
  if (!search) return '';
  const params = new URLSearchParams(search);
  for (const param of ALL_VERIFY_PARAMS) {
    const val = params.get(param);
    if (val && val.trim()) {
      return val.trim();
    }
  }
  return '';
}
