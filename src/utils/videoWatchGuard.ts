import type { ModuleDefinition } from '../types/bimwin';

export type VideoSourceKind = 'youtube' | 'idb' | 'direct' | 'unknown';

export interface ParsedVideoSource {
  kind: VideoSourceKind;
  src: string;
  youtubeId?: string;
  idbKey?: string;
}

/**
 * Extracts an 11-character YouTube video ID from standard watch, short, shorts, or embed URLs.
 */
export function extractYouTubeVideoId(rawUrl: string): string | null {
  const url = String(rawUrl || '').trim();
  if (!url) return null;

  const patterns = [
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/watch\?.*v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ];

  for (const regex of patterns) {
    const match = url.match(regex);
    if (match && match[1]) return match[1];
  }
  return null;
}

/**
 * Normalizes any YouTube watch/short URL into a clean embed URL with locked controls params.
 */
export function buildLockedYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}?rel=0&controls=0&disablekb=1&fs=0&modestbranding=1&playsinline=1&enablejsapi=1`;
}

/**
 * Classifies a module video URL into YouTube, IndexedDB uploaded blob, or direct HTML5 video.
 */
export function parseVideoSource(rawUrl: string): ParsedVideoSource {
  const trimmed = String(rawUrl || '').trim();
  if (!trimmed) return { kind: 'unknown', src: '' };

  if (trimmed.startsWith('idb://')) {
    return {
      kind: 'idb',
      src: trimmed,
      idbKey: trimmed.slice('idb://'.length),
    };
  }

  const ytId = extractYouTubeVideoId(trimmed);
  if (ytId) {
    return {
      kind: 'youtube',
      src: buildLockedYouTubeEmbedUrl(ytId),
      youtubeId: ytId,
    };
  }

  if (
    trimmed.startsWith('blob:') ||
    trimmed.startsWith('data:video/') ||
    /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(trimmed)
  ) {
    return {
      kind: 'direct',
      src: trimmed,
    };
  }

  return { kind: 'unknown', src: trimmed };
}

/**
 * Determines the required minimum watch duration (in whole seconds) matching the uploaded/embedded video length.
 * Priority:
 * 1. Live detected duration from the loaded video element or YouTube Player API (`detectedDurationSeconds`)
 * 2. Stored exact duration detected at upload / configured in LMS (`module.videoDurationSeconds`)
 * 3. Fallback from module `durationMinutes * 60`
 */
export function resolveRequiredWatchSeconds(
  module: Pick<ModuleDefinition, 'durationMinutes' | 'videoDurationSeconds'>,
  detectedDurationSeconds?: number | null
): number {
  if (
    typeof detectedDurationSeconds === 'number' &&
    Number.isFinite(detectedDurationSeconds) &&
    detectedDurationSeconds >= 1
  ) {
    return Math.ceil(detectedDurationSeconds);
  }
  if (
    typeof module.videoDurationSeconds === 'number' &&
    Number.isFinite(module.videoDurationSeconds) &&
    module.videoDurationSeconds >= 1
  ) {
    return Math.ceil(module.videoDurationSeconds);
  }
  const fallbackMinutes =
    typeof module.durationMinutes === 'number' && module.durationMinutes > 0
      ? module.durationMinutes
      : 1;
  return Math.max(10, Math.round(fallbackMinutes * 60));
}

/**
 * Enforces anti-fast-forward lock: allows seeking backward (re-watching) up to maxWatchedSeconds,
 * but blocks jumping forward past maxWatchedSeconds + toleranceSeconds.
 */
export function clampVideoSeekPosition(
  requestedTime: number,
  maxWatchedSeconds: number,
  toleranceSeconds: number = 1.5
): { blocked: boolean; clampedTime: number } {
  const safeMax = Math.max(0, Number.isFinite(maxWatchedSeconds) ? maxWatchedSeconds : 0);
  const safeRequested = Math.max(0, Number.isFinite(requestedTime) ? requestedTime : 0);

  if (safeRequested > safeMax + toleranceSeconds) {
    return {
      blocked: true,
      clampedTime: safeMax,
    };
  }

  return {
    blocked: false,
    clampedTime: safeRequested,
  };
}

export interface VideoCompletionEvaluation {
  canComplete: boolean;
  remainingSeconds: number;
  progressPercent: number;
}

/**
 * Evaluates whether the learner has genuinely watched the full required video duration
 * without fast-forwarding.
 */
export function evaluateVideoCompletion(params: {
  alreadyWatched: boolean;
  watchedSeconds: number;
  maxPositionSeconds: number;
  requiredSeconds: number;
  hasEnded?: boolean;
}): VideoCompletionEvaluation {
  const required = Math.max(1, Math.ceil(params.requiredSeconds));
  if (params.alreadyWatched) {
    return { canComplete: true, remainingSeconds: 0, progressPercent: 100 };
  }

  const watched = Math.max(0, Number.isFinite(params.watchedSeconds) ? params.watchedSeconds : 0);
  const maxPos = Math.max(0, Number.isFinite(params.maxPositionSeconds) ? params.maxPositionSeconds : 0);

  // Allow up to 1.5s rounding tolerance when the media fires an authentic 'ended' event
  const endedThreshold = Math.max(1, required - 1.5);
  const reachedFullWatch =
    (watched >= required && maxPos >= endedThreshold) ||
    (Boolean(params.hasEnded) && watched >= endedThreshold);

  const effectiveWatched = reachedFullWatch ? required : Math.min(watched, required);
  const remainingSeconds = reachedFullWatch ? 0 : Math.max(1, Math.ceil(required - effectiveWatched));
  const progressPercent = reachedFullWatch
    ? 100
    : Math.min(99, Math.max(0, Math.floor((effectiveWatched / required) * 100)));

  return {
    canComplete: reachedFullWatch,
    remainingSeconds,
    progressPercent,
  };
}

/**
 * Formats seconds as mm:ss (or hh:mm:ss for videos >= 1 hour).
 */
export function formatDurationClock(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(Number.isFinite(totalSeconds) ? totalSeconds : 0));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
}

// ---------------------------------------------------------------------------
// Browser-only IndexedDB video storage & metadata inspection helpers
// ---------------------------------------------------------------------------

const IDB_NAME = 'samawa_bimwin_video_storage_v1';
const IDB_STORE = 'module_videos';

function openVideoDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB tidak tersedia pada browser ini.'));
      return;
    }
    const req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error || new Error('Gagal membuka penyimpanan video.'));
  });
}

export async function saveModuleVideoBlob(key: string, file: Blob): Promise<void> {
  const db = await openVideoDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readwrite');
    tx.objectStore(IDB_STORE).put(file, key);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error || new Error('Gagal menyimpan file video.'));
    };
  });
}

export async function loadModuleVideoBlob(key: string): Promise<Blob | null> {
  const db = await openVideoDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readonly');
    const req = tx.objectStore(IDB_STORE).get(key);
    req.onsuccess = () => {
      db.close();
      resolve((req.result as Blob | undefined) || null);
    };
    req.onerror = () => {
      db.close();
      reject(req.error || new Error('Gagal memuat file video.'));
    };
  });
}

export async function deleteModuleVideoBlob(key: string): Promise<void> {
  const db = await openVideoDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readwrite');
    tx.objectStore(IDB_STORE).delete(key);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error || new Error('Gagal menghapus file video.'));
    };
  });
}

/**
 * Inspects an uploaded File/Blob in the browser using an offscreen HTMLVideoElement
 * to obtain its exact duration in seconds.
 */
export function detectVideoFileDurationSeconds(file: File | Blob): Promise<number> {
  return new Promise((resolve, reject) => {
    if (typeof document === 'undefined' || typeof URL === 'undefined') {
      reject(new Error('Deteksi durasi video hanya tersedia di browser.'));
      return;
    }
    const video = document.createElement('video');
    const objectUrl = URL.createObjectURL(file);
    video.preload = 'metadata';

    const cleanup = () => {
      URL.revokeObjectURL(objectUrl);
      video.removeAttribute('src');
      video.load();
    };

    video.onloadedmetadata = () => {
      const duration = video.duration;
      cleanup();
      if (Number.isFinite(duration) && duration > 0) {
        resolve(Math.ceil(duration));
      } else {
        reject(new Error('Durasi video tidak terbaca.'));
      }
    };

    video.onerror = () => {
      cleanup();
      reject(new Error('Format video tidak didukung oleh browser. Gunakan MP4 atau WebM.'));
    };

    video.src = objectUrl;
  });
}
