import { ModuleLanguage } from '../types/bimwin';

export interface SpeechVoiceLike {
  name: string;
  lang: string;
  localService?: boolean;
  default?: boolean;
}

export type SpeechEngineKind = 'native' | 'cloud';

export interface SpeechPlaybackState {
  status: 'idle' | 'loading' | 'playing' | 'error';
  engine: SpeechEngineKind | null;
  currentChunk: number;
  totalChunks: number;
  message?: string;
}

const ARABIC_VOICE_NAME_HINTS = [
  'arabic',
  'العربية',
  'majed',
  'maged',
  'tarik',
  'laila',
  'mariam',
  'hoda',
  'naayf',
  'shakir',
  'salma',
  'zariyah',
  'hamed',
  'amira',
  'mehdi',
];

const PREFERRED_VOICE_BRAND_HINTS = [
  'google',
  'natural',
  'neural',
  'microsoft',
  'apple',
  'siri',
  'wavenet',
];

/**
 * Normalizes module or prayer text for natural spoken narration across Indonesian,
 * Javanese (Krama), English, and Arabic (preserving authentic Arabic harakat/diacritics).
 */
export function normalizeTextForSpeech(rawText: string, lang: ModuleLanguage): string {
  let text = String(rawText || '')
    .replace(/[\u200B-\u200F\uFEFF]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!text) return '';

  if (lang === 'ar') {
    // Convert ASCII separators into natural Arabic pauses while keeping diacritics intact
    text = text
      .replace(/(\d+|[٠-٩]+)\s*[:\-]\s*(\d+|[٠-٩]+)/g, '$1، $2')
      .replace(/\s*:\s*/g, '، ')
      .replace(/[()[\]«»"“”]/g, ' ')
      .replace(/\s*؛\s*/g, '؛ ')
      .replace(/\s*،\s*/g, '، ')
      .replace(/\.{2,}/g, '.')
      .replace(/\.\s*\./g, '.')
      .replace(/\s+/g, ' ')
      .trim();
    return text;
  }

  return text
    .replace(/[•·]/g, ', ')
    .replace(/\s*\/\s*/g, ' atau ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Splits narration text into short, natural sentence/clause chunks so neither
 * Chromium's Web Speech API (~200 char / 15s cutoff) nor online TTS endpoints truncate audio.
 */
export function splitSpeechChunks(
  rawText: string,
  lang: ModuleLanguage,
  maxChars = 155
): string[] {
  const normalized = normalizeTextForSpeech(rawText, lang);
  if (!normalized) return [];

  const limit = Math.max(40, Math.min(200, maxChars));

  // Primary split on sentence terminators (including Arabic question mark \u061F and semicolon \u061B)
  const rawSentences = normalized
    .split(/(?<=[\.\!\?\u061F\u061B\n])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const chunks: string[] = [];

  const pushClauseSafely = (segment: string) => {
    const trimmed = segment.trim();
    if (!trimmed) return;
    if (trimmed.length <= limit) {
      chunks.push(trimmed);
      return;
    }

    // Secondary split on commas / Arabic comma (\u060C) / colons / dashes
    const clauses = trimmed
      .split(/(?<=[\u060C,:\-–—])\s+/)
      .map((c) => c.trim())
      .filter(Boolean);

    if (clauses.length > 1) {
      let buffer = '';
      for (const clause of clauses) {
        if (clause.length > limit) {
          if (buffer) {
            chunks.push(buffer);
            buffer = '';
          }
          splitByWords(clause, limit, chunks);
        } else if (!buffer) {
          buffer = clause;
        } else if (buffer.length + 1 + clause.length <= limit) {
          buffer = `${buffer} ${clause}`;
        } else {
          chunks.push(buffer);
          buffer = clause;
        }
      }
      if (buffer) chunks.push(buffer);
      return;
    }

    splitByWords(trimmed, limit, chunks);
  };

  let acc = '';
  for (const sentence of rawSentences) {
    if (sentence.length > limit) {
      if (acc) {
        chunks.push(acc);
        acc = '';
      }
      pushClauseSafely(sentence);
    } else if (!acc) {
      acc = sentence;
    } else if (acc.length + 1 + sentence.length <= limit) {
      acc = `${acc} ${sentence}`;
    } else {
      chunks.push(acc);
      acc = sentence;
    }
  }
  if (acc) chunks.push(acc);

  return chunks;
}

function splitByWords(text: string, limit: number, out: string[]): void {
  const words = text.split(/\s+/).filter(Boolean);
  let line = '';
  for (const word of words) {
    if (!line) {
      if (word.length <= limit) {
        line = word;
      } else {
        for (let i = 0; i < word.length; i += limit) {
          out.push(word.slice(i, i + limit));
        }
      }
    } else if (line.length + 1 + word.length <= limit) {
      line = `${line} ${word}`;
    } else {
      out.push(line);
      line = word.length <= limit ? word : word.slice(0, limit);
      if (word.length > limit) {
        for (let i = limit; i < word.length; i += limit) {
          out.push(word.slice(i, i + limit));
        }
        line = '';
      }
    }
  }
  if (line) out.push(line);
}

export function resolveSpeechLangCode(lang: ModuleLanguage): string {
  if (lang === 'ar') return 'ar-SA';
  if (lang === 'en') return 'en-US';
  if (lang === 'jv') return 'jv-ID';
  return 'id-ID';
}

export function resolveOnlineTtsLangCode(lang: ModuleLanguage): string {
  if (lang === 'ar') return 'ar';
  if (lang === 'en') return 'en';
  if (lang === 'jv') return 'jw';
  return 'id';
}

export function buildOnlineTtsUrl(
  chunk: string,
  lang: ModuleLanguage,
  mirrorIndex = 0
): string {
  const tl = resolveOnlineTtsLangCode(lang);
  const encoded = encodeURIComponent(chunk.trim());
  if (mirrorIndex === 1) {
    return `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${tl}&q=${encoded}`;
  }
  return `https://translate.googleapis.com/translate_tts?ie=UTF-8&client=gtx&tl=${tl}&q=${encoded}`;
}

function scoreVoiceQuality(voice: SpeechVoiceLike): number {
  const nameLower = (voice.name || '').toLowerCase();
  let bonus = 0;
  for (let i = 0; i < PREFERRED_VOICE_BRAND_HINTS.length; i += 1) {
    if (nameLower.includes(PREFERRED_VOICE_BRAND_HINTS[i])) {
      bonus += 20 - i;
    }
  }
  if (voice.localService) bonus += 4;
  return bonus;
}

/**
 * Selects the best matching SpeechSynthesis voice for a given module language.
 * Critically, for Arabic ('ar'), ONLY authentic Arabic voices are accepted—if the device
 * lacks an Arabic voice, returns null so playback immediately switches to cloud Arabic audio
 * instead of silently failing under an Indonesian or English voice.
 */
export function pickBestSpeechVoice<T extends SpeechVoiceLike>(
  voices: T[],
  lang: ModuleLanguage
): T | null {
  if (!voices || voices.length === 0) return null;

  const scored: Array<{ voice: T; score: number }> = [];

  for (const voice of voices) {
    const tag = (voice.lang || '').toLowerCase().replace('_', '-');
    const nameLower = (voice.name || '').toLowerCase();
    let score = -1;

    if (lang === 'ar') {
      const isArabicTag = tag === 'ar' || tag.startsWith('ar-');
      const isArabicName = ARABIC_VOICE_NAME_HINTS.some((hint) => nameLower.includes(hint));
      if (!isArabicTag && !isArabicName) continue;

      if (tag === 'ar-sa') score = 120;
      else if (tag === 'ar-xa' || tag === 'ar-001') score = 115;
      else if (tag === 'ar-eg' || tag === 'ar-ae') score = 110;
      else if (isArabicTag) score = 100;
      else score = 90;
    } else if (lang === 'en') {
      if (tag === 'en-us') score = 120;
      else if (tag === 'en-gb') score = 115;
      else if (tag.startsWith('en-')) score = 105;
      else if (tag === 'en') score = 100;
      else continue;
    } else if (lang === 'jv') {
      if (tag === 'jv-id' || tag === 'jv' || tag === 'jw' || nameLower.includes('javanese')) {
        score = 130;
      } else if (tag === 'id-id' || tag === 'id' || nameLower.includes('indonesian')) {
        score = 100;
      } else {
        continue;
      }
    } else {
      if (tag === 'id-id') score = 120;
      else if (tag === 'id' || nameLower.includes('indonesian') || nameLower.includes('bahasa indonesia')) {
        score = 110;
      } else {
        continue;
      }
    }

    scored.push({ voice, score: score + scoreVoiceQuality(voice) });
  }

  if (scored.length === 0) return null;
  scored.sort((a, b) => b.score - a.score);
  return scored[0].voice;
}

/**
 * Triggers voice list population in Chromium/Android/Safari browsers where
 * speechSynthesis.getVoices() initially returns an empty array.
 */
export function prewarmSpeechVoices(): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.getVoices();
  } catch {
    // Ignore restricted environments
  }
}

function getVoicesWithWait(timeoutMs = 350): Promise<SpeechSynthesisVoice[]> {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return Promise.resolve([]);
  }
  const immediate = window.speechSynthesis.getVoices();
  if (immediate && immediate.length > 0) {
    return Promise.resolve(immediate);
  }
  return new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      window.speechSynthesis.removeEventListener?.('voiceschanged', onVoicesChanged);
      resolve(window.speechSynthesis.getVoices() || []);
    };
    const onVoicesChanged = () => finish();
    window.speechSynthesis.addEventListener?.('voiceschanged', onVoicesChanged);
    window.setTimeout(finish, timeoutMs);
  });
}

// Reference-counted temporary no-referrer guard so online TTS <audio> requests
// never leak a Referer header (which causes 404) while preserving page referrer
// policy for YouTube embeds and Firebase SDK calls.
let activeNoReferrerLoads = 0;
let savedReferrerExisted = false;
let savedReferrerContent: string | null = null;

function acquireNoReferrerGuard(): () => void {
  if (typeof document === 'undefined') return () => {};
  let released = false;

  if (activeNoReferrerLoads === 0) {
    let meta = document.querySelector('meta[name="referrer"]');
    savedReferrerExisted = Boolean(meta);
    savedReferrerContent = meta ? meta.getAttribute('content') : null;
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'referrer');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', 'no-referrer');
  }
  activeNoReferrerLoads += 1;

  return () => {
    if (released) return;
    released = true;
    activeNoReferrerLoads = Math.max(0, activeNoReferrerLoads - 1);
    if (activeNoReferrerLoads === 0) {
      const meta = document.querySelector('meta[name="referrer"]');
      if (savedReferrerExisted && meta && savedReferrerContent !== null) {
        meta.setAttribute('content', savedReferrerContent);
      } else if (!savedReferrerExisted && meta) {
        meta.remove();
      }
    }
  };
}

export class SpeechReaderController {
  private sessionId = 0;
  private audioEl: HTMLAudioElement | null = null;
  private keepAliveTimer: number | null = null;
  private watchdogTimer: number | null = null;
  private releaseReferrer: (() => void) | null = null;

  public stop(): void {
    this.sessionId += 1;
    this.clearTimers();
    this.releaseCurrentReferrer();

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // Ignore browser quirk
      }
    }

    if (this.audioEl) {
      try {
        this.audioEl.pause();
        this.audioEl.onended = null;
        this.audioEl.onerror = null;
        this.audioEl.oncanplay = null;
        this.audioEl.onloadeddata = null;
        this.audioEl.removeAttribute('src');
        this.audioEl.load();
      } catch {
        // Ignore cleanup errors
      }
    }
  }

  public async speak(
    text: string,
    lang: ModuleLanguage,
    onStateChange: (state: SpeechPlaybackState) => void
  ): Promise<void> {
    this.stop();
    const mySession = this.sessionId;
    const chunks = splitSpeechChunks(text, lang, 155);

    if (chunks.length === 0) {
      onStateChange({ status: 'idle', engine: null, currentChunk: 0, totalChunks: 0 });
      return;
    }

    // Create/reuse audio element synchronously inside user click gesture for mobile Safari/Chrome
    if (typeof Audio !== 'undefined' && !this.audioEl) {
      this.audioEl = new Audio();
      this.audioEl.preload = 'auto';
    }

    onStateChange({
      status: 'loading',
      engine: null,
      currentChunk: 1,
      totalChunks: chunks.length,
    });

    const hasSpeechApi = typeof window !== 'undefined' && 'speechSynthesis' in window;
    const voices = hasSpeechApi ? await getVoicesWithWait(320) : [];
    if (mySession !== this.sessionId) return;

    const matchedVoice = pickBestSpeechVoice(voices, lang);

    if (hasSpeechApi && matchedVoice) {
      this.playNativeQueue(chunks, lang, matchedVoice, mySession, onStateChange);
      return;
    }

    // No native voice for this language (very common for Arabic on Indonesian Android/Windows):
    // Immediately switch to Cloud Audio TTS fallback.
    this.playCloudQueue(chunks, lang, 0, mySession, onStateChange);
  }

  private playNativeQueue(
    chunks: string[],
    lang: ModuleLanguage,
    voice: SpeechSynthesisVoice,
    session: number,
    onStateChange: (state: SpeechPlaybackState) => void
  ): void {
    let idx = 0;

    // Chrome/Android 15s stall keep-alive
    this.keepAliveTimer = window.setInterval(() => {
      if (session !== this.sessionId) {
        this.clearTimers();
        return;
      }
      if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
        try {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        } catch {
          // Ignore browsers that disallow rapid pause/resume
        }
      }
    }, 11000);

    const speakNext = () => {
      if (session !== this.sessionId) return;
      if (idx >= chunks.length) {
        this.clearTimers();
        onStateChange({
          status: 'idle',
          engine: null,
          currentChunk: 0,
          totalChunks: chunks.length,
        });
        return;
      }

      const chunkText = chunks[idx];
      const utter = new SpeechSynthesisUtterance(chunkText);
      utter.voice = voice;
      utter.lang = voice.lang || resolveSpeechLangCode(lang);
      utter.rate = lang === 'ar' ? 0.92 : 0.96;

      let started = false;
      this.clearWatchdog();

      // If first chunk fails to start within 2.2s, seamlessly fall back to cloud audio
      if (idx === 0) {
        this.watchdogTimer = window.setTimeout(() => {
          if (session !== this.sessionId || started) return;
          try {
            window.speechSynthesis.cancel();
          } catch {
            // ignore
          }
          this.clearTimers();
          this.playCloudQueue(chunks, lang, idx, session, onStateChange);
        }, 2200);
      }

      utter.onstart = () => {
        if (session !== this.sessionId) return;
        started = true;
        this.clearWatchdog();
        onStateChange({
          status: 'playing',
          engine: 'native',
          currentChunk: idx + 1,
          totalChunks: chunks.length,
        });
      };

      utter.onend = () => {
        if (session !== this.sessionId) return;
        this.clearWatchdog();
        idx += 1;
        speakNext();
      };

      utter.onerror = (ev) => {
        if (session !== this.sessionId) return;
        this.clearWatchdog();
        if (ev.error === 'canceled' || ev.error === 'interrupted') return;
        // Seamless fallback to Cloud Audio from current chunk
        this.clearTimers();
        this.playCloudQueue(chunks, lang, idx, session, onStateChange);
      };

      try {
        window.speechSynthesis.speak(utter);
      } catch {
        this.clearTimers();
        this.playCloudQueue(chunks, lang, idx, session, onStateChange);
      }
    };

    speakNext();
  }

  private playCloudQueue(
    chunks: string[],
    lang: ModuleLanguage,
    startIdx: number,
    session: number,
    onStateChange: (state: SpeechPlaybackState) => void
  ): void {
    if (!this.audioEl) {
      if (typeof Audio === 'undefined') {
        onStateChange({
          status: 'error',
          engine: null,
          currentChunk: 0,
          totalChunks: chunks.length,
          message: 'Perangkat tidak mendukung pemutar audio.',
        });
        return;
      }
      this.audioEl = new Audio();
    }

    const audio = this.audioEl;
    let idx = startIdx;
    let mirrorIndex = 0;

    const playChunk = () => {
      if (session !== this.sessionId) return;
      if (idx >= chunks.length) {
        this.releaseCurrentReferrer();
        onStateChange({
          status: 'idle',
          engine: null,
          currentChunk: 0,
          totalChunks: chunks.length,
        });
        return;
      }

      const chunk = chunks[idx];
      const url = buildOnlineTtsUrl(chunk, lang, mirrorIndex);

      onStateChange({
        status: idx === startIdx ? 'loading' : 'playing',
        engine: 'cloud',
        currentChunk: idx + 1,
        totalChunks: chunks.length,
      });

      this.releaseCurrentReferrer();
      this.releaseReferrer = acquireNoReferrerGuard();

      audio.onloadeddata = () => {
        if (session !== this.sessionId) return;
        this.releaseCurrentReferrer();
      };

      audio.onplaying = () => {
        if (session !== this.sessionId) return;
        this.releaseCurrentReferrer();
        onStateChange({
          status: 'playing',
          engine: 'cloud',
          currentChunk: idx + 1,
          totalChunks: chunks.length,
        });
      };

      audio.onended = () => {
        if (session !== this.sessionId) return;
        this.releaseCurrentReferrer();
        mirrorIndex = 0;
        idx += 1;
        playChunk();
      };

      audio.onerror = () => {
        if (session !== this.sessionId) return;
        this.releaseCurrentReferrer();
        if (mirrorIndex === 0) {
          mirrorIndex = 1;
          playChunk();
          return;
        }
        onStateChange({
          status: 'error',
          engine: 'cloud',
          currentChunk: idx + 1,
          totalChunks: chunks.length,
          message:
            lang === 'ar'
              ? 'Suara bahasa Arab memerlukan koneksi internet aktif atau paket suara Arab di perangkat Anda.'
              : 'Gagal memuat audio pembaca materi. Periksa koneksi internet Anda.',
        });
      };

      audio.playbackRate = lang === 'ar' ? 0.94 : 0.98;
      audio.src = url;
      const playPromise = audio.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {
          if (session !== this.sessionId) return;
          this.releaseCurrentReferrer();
          if (mirrorIndex === 0) {
            mirrorIndex = 1;
            playChunk();
            return;
          }
          onStateChange({
            status: 'error',
            engine: 'cloud',
            currentChunk: idx + 1,
            totalChunks: chunks.length,
            message:
              'Pemutaran audio diblokir oleh browser atau koneksi terputus. Silakan ketuk ulang tombol Bacakan Materi.',
          });
        });
      }
    };

    playChunk();
  }

  private clearWatchdog(): void {
    if (this.watchdogTimer !== null) {
      window.clearTimeout(this.watchdogTimer);
      this.watchdogTimer = null;
    }
  }

  private clearTimers(): void {
    this.clearWatchdog();
    if (this.keepAliveTimer !== null) {
      window.clearInterval(this.keepAliveTimer);
      this.keepAliveTimer = null;
    }
  }

  private releaseCurrentReferrer(): void {
    if (this.releaseReferrer) {
      this.releaseReferrer();
      this.releaseReferrer = null;
    }
  }
}
