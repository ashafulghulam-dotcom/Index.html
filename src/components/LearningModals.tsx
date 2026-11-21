import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Lock,
  Maximize2,
  Minimize2,
  Minus,
  Pause,
  Play,
  PlayCircle,
  Plus,
  RotateCcw,
  ShieldCheck,
  Star,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { ModuleDefinition, QuizQuestion } from '../types/bimwin';
import { shuffleQuizQuestions } from '../utils/bimwinLogic';
import {
  clampVideoSeekPosition,
  evaluateVideoCompletion,
  formatDurationClock,
  loadModuleVideoBlob,
  parseVideoSource,
  resolveRequiredWatchSeconds,
} from '../utils/videoWatchGuard';
import { ModalDialog } from './UiPrimitives';

interface YouTubePlayerInstance {
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  getPlayerState: () => number;
  getPlaybackRate: () => number;
  setPlaybackRate: (rate: number) => void;
  mute: () => void;
  unMute: () => void;
  isMuted: () => boolean;
  destroy: () => void;
}

interface YouTubeNamespace {
  Player: new (
    element: HTMLElement | string,
    config: {
      videoId: string;
      width?: string | number;
      height?: string | number;
      playerVars?: Record<string, string | number>;
      events?: {
        onReady?: (event: { target: YouTubePlayerInstance }) => void;
        onStateChange?: (event: { data: number; target: YouTubePlayerInstance }) => void;
        onPlaybackRateChange?: (event: { data: number; target: YouTubePlayerInstance }) => void;
        onError?: () => void;
      };
    }
  ) => YouTubePlayerInstance;
  PlayerState?: {
    ENDED: number;
    PLAYING: number;
    PAUSED: number;
  };
}

declare global {
  interface Window {
    YT?: YouTubeNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let ytApiPromise: Promise<YouTubeNamespace> | null = null;

function loadYouTubeIframeApi(): Promise<YouTubeNamespace> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Window unavailable'));
  }
  if (window.YT && window.YT.Player) {
    return Promise.resolve(window.YT);
  }
  if (ytApiPromise) return ytApiPromise;

  ytApiPromise = new Promise<YouTubeNamespace>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      reject(new Error('YouTube IFrame API timeout'));
    }, 8000);

    const prevReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      window.clearTimeout(timeoutId);
      if (typeof prevReady === 'function') prevReady();
      if (window.YT && window.YT.Player) resolve(window.YT);
      else reject(new Error('YouTube API failed to initialize'));
    };

    const existing = document.querySelector('script[src*="youtube.com/iframe_api"]');
    if (!existing) {
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      script.async = true;
      script.onerror = () => {
        window.clearTimeout(timeoutId);
        reject(new Error('Failed to load YouTube IFrame API'));
      };
      document.head.appendChild(script);
    }
  }).catch((err) => {
    ytApiPromise = null;
    throw err;
  });

  return ytApiPromise;
}

function speakText(text: string, lang: string, onEnd: () => void) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    onEnd();
    return;
  }
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = lang;
  utter.rate = 0.96;
  utter.onend = onEnd;
  utter.onerror = onEnd;
  window.speechSynthesis.speak(utter);
}

export const ModuleReaderModal: React.FC<{
  module: ModuleDefinition | null;
  videoWatched?: boolean;
  onClose: () => void;
  onOpenVideo?: (moduleId: number) => void;
  onOpenQuiz: (moduleId: number) => void;
}> = ({ module, videoWatched = false, onClose, onOpenVideo, onOpenQuiz }) => {
  const [fontSize, setFontSize] = useState(15);
  const [lang, setLang] = useState<'id' | 'jv' | 'en' | 'ar'>('id');
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [module]);

  if (!module) return null;

  const handleToggleSpeech = () => {
    if (speaking) {
      window.speechSynthesis?.cancel();
      setSpeaking(false);
      return;
    }
    const contentToRead =
      lang === 'id'
        ? `${module.judul}. ${module.sections.map((s) => `${s.heading}. ${s.paragraphs.join(' ')}`).join(' ')}`
        : module.translations[lang];
    const langCode = lang === 'en' ? 'en-US' : lang === 'ar' ? 'ar-SA' : 'id-ID';
    setSpeaking(true);
    speakText(contentToRead, langCode, () => setSpeaking(false));
  };

  return (
    <ModalDialog
      open={Boolean(module)}
      onClose={() => {
        window.speechSynthesis?.cancel();
        setSpeaking(false);
        onClose();
      }}
      title={module.judul}
      subtitle={`Ringkasan Materi Resmi · Estimasi baca ${module.durationMinutes} menit`}
      maxWidth="4xl"
      footer={
        <>
          <a
            href={module.driveUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-emerald-950"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Buka Modul PDF Resmi
          </a>
          {!videoWatched && onOpenVideo && (
            <button
              type="button"
              onClick={() => {
                window.speechSynthesis?.cancel();
                setSpeaking(false);
                onOpenVideo(module.id);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0F684E] hover:bg-[#0B523D] text-white text-xs font-semibold"
            >
              <PlayCircle className="w-3.5 h-3.5" />
              Tonton Video Modul {module.id}
            </button>
          )}
          <button
            type="button"
            disabled={!videoWatched}
            title={
              videoWatched
                ? `Kerjakan kuis evaluasi Modul ${module.id}`
                : 'Tonton video pembelajaran hingga selesai untuk membuka kuis'
            }
            onClick={() => {
              if (!videoWatched) return;
              window.speechSynthesis?.cancel();
              setSpeaking(false);
              onOpenQuiz(module.id);
            }}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition ${
              videoWatched
                ? 'bg-[#0F684E] hover:bg-[#0B523D] text-white'
                : 'bg-slate-200 dark:bg-emerald-950 text-slate-400 cursor-not-allowed'
            }`}
          >
            {!videoWatched && <Lock className="w-3.5 h-3.5" />}
            {videoWatched
              ? `Lanjut Kerjakan Kuis Modul ${module.id}`
              : 'Kuis Terkunci (Tonton Video Dulu)'}
          </button>
        </>
      }
    >
      <div className="space-y-5">
        {/* Reading Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-emerald-950">
          <div className="flex items-center gap-1.5">
            {(['id', 'jv', 'en', 'ar'] as const).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setLang(code)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition ${
                  lang === code
                    ? 'bg-[#0F684E] text-white'
                    : 'bg-slate-100 dark:bg-emerald-950/60 text-slate-700 dark:text-slate-300'
                }`}
              >
                {code === 'id'
                  ? 'Indonesia'
                  : code === 'jv'
                    ? 'Jawa Krama'
                    : code === 'en'
                      ? 'English'
                      : 'العربية'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFontSize((s) => Math.max(12, s - 1))}
              className="w-8 h-8 rounded-lg border border-slate-200 dark:border-emerald-900 flex items-center justify-center text-xs font-bold"
              title="Perkecil huruf"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono-num text-xs text-slate-500">{fontSize}px</span>
            <button
              type="button"
              onClick={() => setFontSize((s) => Math.min(22, s + 1))}
              className="w-8 h-8 rounded-lg border border-slate-200 dark:border-emerald-900 flex items-center justify-center text-xs font-bold"
              title="Perbesar huruf"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleToggleSpeech}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-emerald-900 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-emerald-950/60"
            >
              {speaking ? (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-red-500" />
                  Hentikan Suara
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-[#0F684E] dark:text-emerald-400" />
                  Bacakan Materi
                </>
              )}
            </button>
          </div>
        </div>

        {/* Reading Canvas */}
        <div
          style={{ fontSize: `${fontSize}px` }}
          dir={lang === 'ar' ? 'rtl' : 'ltr'}
          className="space-y-5 leading-relaxed text-slate-700 dark:text-slate-200 max-w-3xl"
        >
          {lang === 'id' ? (
            <>
              {module.sections.map((sec) => (
                <section key={sec.heading} className="space-y-2">
                  <h4 className="font-bold text-[#0F684E] dark:text-emerald-400">{sec.heading}</h4>
                  {sec.paragraphs.map((p, idx) => (
                    <p key={idx}>{p}</p>
                  ))}
                  {sec.bullets && (
                    <ul className="list-disc pl-5 space-y-1.5 pt-1">
                      {sec.bullets.map((b, idx) => (
                        <li key={idx}>{b}</li>
                      ))}
                    </ul>
                  )}
                </section>
              ))}
              <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 space-y-1">
                <h5 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400">
                  Intisari Kunci Evaluasi
                </h5>
                <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                  {module.keyTakeaway}
                </p>
              </div>
            </>
          ) : (
            <div className="p-5 rounded-xl bg-[#F8FAF9] dark:bg-[#0D1613] border border-slate-200 dark:border-emerald-950">
              <p>{module.translations[lang]}</p>
            </div>
          )}
        </div>
      </div>
    </ModalDialog>
  );
};

export const VideoPlayerModal: React.FC<{
  module: ModuleDefinition | null;
  alreadyWatched: boolean;
  onClose: () => void;
  onConfirmWatched: (moduleId: number) => void;
}> = ({ module, alreadyWatched, onClose, onConfirmWatched }) => {
  const parsedSource = useMemo(
    () => (module ? parseVideoSource(module.videoUrl) : { kind: 'unknown' as const, src: '' }),
    [module]
  );

  // Resolved blob URL for IndexedDB uploaded videos
  const [resolvedBlobUrl, setResolvedBlobUrl] = useState<string | null>(null);
  const [blobError, setBlobError] = useState<string>('');

  // Live playback & strict anti-fast-forward watch states
  const [detectedDuration, setDetectedDuration] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [watchedSeconds, setWatchedSeconds] = useState(0);
  const [maxPositionSeconds, setMaxPositionSeconds] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [hasEnded, setHasEnded] = useState(false);
  const [seekWarning, setSeekWarning] = useState('');
  const [ytApiFallback, setYtApiFallback] = useState(false);
  const [ytReady, setYtReady] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const playerWrapperRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const ytContainerRef = useRef<HTMLDivElement | null>(null);
  const ytPlayerRef = useRef<YouTubePlayerInstance | null>(null);
  const maxWatchedRef = useRef(0);
  const watchedSecondsRef = useRef(0);
  const lastTickTsRef = useRef<number | null>(null);
  const warningTimerRef = useRef<number | null>(null);

  const showLockedWarning = (message: string) => {
    setSeekWarning(message);
    if (warningTimerRef.current) window.clearTimeout(warningTimerRef.current);
    warningTimerRef.current = window.setTimeout(() => setSeekWarning(''), 4000);
  };

  // Sync native fullscreen changes & allow Escape key to exit CSS full-viewport fallback
  useEffect(() => {
    const onFsChange = () => {
      const activeEl =
        document.fullscreenElement ||
        (document as Document & { webkitFullscreenElement?: Element }).webkitFullscreenElement;
      if (!activeEl) {
        setIsFullscreen(false);
      } else if (playerWrapperRef.current && activeEl === playerWrapperRef.current) {
        setIsFullscreen(true);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    document.addEventListener('fullscreenchange', onFsChange);
    document.addEventListener('webkitfullscreenchange', onFsChange as EventListener);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('fullscreenchange', onFsChange);
      document.removeEventListener('webkitfullscreenchange', onFsChange as EventListener);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isFullscreen]);

  // Reset all watch state whenever modal opens for a module
  useEffect(() => {
    setDetectedDuration(null);
    setCurrentTime(0);
    setWatchedSeconds(0);
    setMaxPositionSeconds(0);
    setIsPlaying(false);
    setIsMuted(false);
    setHasEnded(false);
    setSeekWarning('');
    setYtApiFallback(false);
    setYtReady(false);
    setBlobError('');
    setIsFullscreen(false);
    maxWatchedRef.current = 0;
    watchedSecondsRef.current = 0;
    lastTickTsRef.current = null;

    return () => {
      if (warningTimerRef.current) window.clearTimeout(warningTimerRef.current);
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, [module?.id, module?.videoUrl]);

  // Load IndexedDB uploaded video Blob when source is idb://
  useEffect(() => {
    if (!module || parsedSource.kind !== 'idb' || !parsedSource.idbKey) {
      setResolvedBlobUrl(null);
      return;
    }

    let cancelled = false;
    let createdUrl: string | null = null;

    loadModuleVideoBlob(parsedSource.idbKey)
      .then((blob) => {
        if (cancelled) return;
        if (!blob) {
          setBlobError('File video yang diunggah tidak ditemukan di penyimpanan perangkat ini.');
          return;
        }
        createdUrl = URL.createObjectURL(blob);
        setResolvedBlobUrl(createdUrl);
      })
      .catch(() => {
        if (!cancelled) {
          setBlobError('Gagal memuat video yang diunggah. Silakan coba muat ulang halaman.');
        }
      });

    return () => {
      cancelled = true;
      if (createdUrl) URL.revokeObjectURL(createdUrl);
    };
  }, [module, parsedSource.kind, parsedSource.idbKey]);

  // Initialize locked YouTube IFrame Player API when video is YouTube
  useEffect(() => {
    if (!module || parsedSource.kind !== 'youtube' || !parsedSource.youtubeId) return;

    let cancelled = false;
    let pollId: number | null = null;

    loadYouTubeIframeApi()
      .then((YT) => {
        if (cancelled || !ytContainerRef.current) return;
        ytContainerRef.current.innerHTML = '';
        const hostEl = document.createElement('div');
        hostEl.className = 'w-full h-full';
        ytContainerRef.current.appendChild(hostEl);

        const player = new YT.Player(hostEl, {
          videoId: parsedSource.youtubeId!,
          width: '100%',
          height: '100%',
          playerVars: {
            controls: 0,
            disablekb: 1,
            rel: 0,
            modestbranding: 1,
            fs: 0,
            playsinline: 1,
            iv_load_policy: 3,
          },
          events: {
            onReady: (ev) => {
              if (cancelled) return;
              setYtReady(true);
              const dur = ev.target.getDuration();
              if (Number.isFinite(dur) && dur >= 1) {
                setDetectedDuration(Math.ceil(dur));
              }
              try {
                ev.target.setPlaybackRate(1);
              } catch {
                // ignore if rate locked
              }
            },
            onPlaybackRateChange: (ev) => {
              if (ev.data !== 1) {
                try {
                  ev.target.setPlaybackRate(1);
                } catch {
                  // ignore
                }
                showLockedWarning(
                  'Kecepatan putar video dikunci pada 1x (normal) dan tidak dapat dipercepat.'
                );
              }
            },
            onStateChange: (ev) => {
              if (cancelled) return;
              const playingState = YT.PlayerState?.PLAYING ?? 1;
              const endedState = YT.PlayerState?.ENDED ?? 0;

              if (ev.data === playingState) {
                setIsPlaying(true);
                lastTickTsRef.current = Date.now();
                const dur = ev.target.getDuration();
                if (Number.isFinite(dur) && dur >= 1) {
                  setDetectedDuration(Math.ceil(dur));
                }
              } else if (ev.data === endedState) {
                setIsPlaying(false);
                lastTickTsRef.current = null;
                setHasEnded(true);
                const dur = ev.target.getDuration();
                if (Number.isFinite(dur) && dur >= 1) {
                  setDetectedDuration(Math.ceil(dur));
                  maxWatchedRef.current = Math.max(maxWatchedRef.current, dur);
                  setMaxPositionSeconds(maxWatchedRef.current);
                  setCurrentTime(dur);
                }
              } else {
                setIsPlaying(false);
                lastTickTsRef.current = null;
              }
            },
            onError: () => {
              if (!cancelled) setYtApiFallback(true);
            },
          },
        });

        ytPlayerRef.current = player;

        pollId = window.setInterval(() => {
          const p = ytPlayerRef.current;
          if (!p) return;
          try {
            const state = p.getPlayerState();
            const playingState = YT.PlayerState?.PLAYING ?? 1;
            const dur = p.getDuration();
            if (Number.isFinite(dur) && dur >= 1) {
              setDetectedDuration((prev) => (prev === Math.ceil(dur) ? prev : Math.ceil(dur)));
            }

            if (p.getPlaybackRate() !== 1) {
              p.setPlaybackRate(1);
              showLockedWarning(
                'Kecepatan putar video dikunci pada 1x (normal) dan tidak dapat dipercepat.'
              );
            }

            const pos = p.getCurrentTime();
            if (Number.isFinite(pos)) {
              const check = clampVideoSeekPosition(pos, maxWatchedRef.current, 1.5);
              if (check.blocked) {
                p.seekTo(check.clampedTime, true);
                setCurrentTime(check.clampedTime);
                showLockedWarning(
                  'Video pembelajaran terkunci dan tidak dapat dipercepat atau dilompati.'
                );
                lastTickTsRef.current = Date.now();
                return;
              }

              setCurrentTime(pos);
              if (state === playingState && document.visibilityState === 'visible') {
                const now = Date.now();
                const deltaSec =
                  lastTickTsRef.current !== null
                    ? Math.min(1.0, Math.max(0, (now - lastTickTsRef.current) / 1000))
                    : 0;
                lastTickTsRef.current = now;

                if (pos > maxWatchedRef.current) {
                  maxWatchedRef.current = pos;
                  setMaxPositionSeconds(pos);
                }
                if (deltaSec > 0) {
                  watchedSecondsRef.current += deltaSec;
                  setWatchedSeconds(watchedSecondsRef.current);
                }
              } else {
                lastTickTsRef.current = null;
              }
            }
          } catch {
            // Player might still be initializing
          }
        }, 300);
      })
      .catch(() => {
        if (!cancelled) setYtApiFallback(true);
      });

    return () => {
      cancelled = true;
      if (pollId) window.clearInterval(pollId);
      if (ytPlayerRef.current) {
        try {
          ytPlayerRef.current.destroy();
        } catch {
          // ignore
        }
        ytPlayerRef.current = null;
      }
    };
  }, [module, parsedSource.kind, parsedSource.youtubeId]);

  // Fallback timer ONLY if YouTube IFrame API could not load (e.g., restricted/offline network)
  useEffect(() => {
    if (!module || !ytApiFallback || alreadyWatched || !isPlaying) return;
    const id = window.setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      watchedSecondsRef.current += 1;
      maxWatchedRef.current += 1;
      setWatchedSeconds(watchedSecondsRef.current);
      setMaxPositionSeconds(maxWatchedRef.current);
      setCurrentTime(maxWatchedRef.current);
    }, 1000);
    return () => window.clearInterval(id);
  }, [module, ytApiFallback, alreadyWatched, isPlaying]);

  if (!module) return null;

  const requiredSeconds = resolveRequiredWatchSeconds(module, detectedDuration);
  const completion = evaluateVideoCompletion({
    alreadyWatched,
    watchedSeconds,
    maxPositionSeconds,
    requiredSeconds,
    hasEnded,
  });

  const isHtml5Video =
    parsedSource.kind === 'direct' || (parsedSource.kind === 'idb' && Boolean(resolvedBlobUrl));
  const html5Src = parsedSource.kind === 'idb' ? resolvedBlobUrl || '' : parsedSource.src;

  const handleHtml5TogglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.playbackRate = 1;
      v.play().catch(() => {});
    } else {
      v.pause();
    }
  };

  const handleHtml5Rewind = () => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.max(0, v.currentTime - 10);
    setCurrentTime(v.currentTime);
  };

  const handleHtml5ToggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setIsMuted(v.muted);
  };

  const handleYtTogglePlay = () => {
    if (ytApiFallback) {
      setIsPlaying((prev) => !prev);
      return;
    }
    const p = ytPlayerRef.current;
    if (!p || !ytReady) return;
    if (isPlaying) p.pauseVideo();
    else {
      try {
        p.setPlaybackRate(1);
      } catch {
        // ignore
      }
      p.playVideo();
    }
  };

  const handleYtRewind = () => {
    const p = ytPlayerRef.current;
    if (!p || !ytReady) return;
    const nextPos = Math.max(0, p.getCurrentTime() - 10);
    p.seekTo(nextPos, true);
    setCurrentTime(nextPos);
  };

  const handleYtToggleMute = () => {
    const p = ytPlayerRef.current;
    if (!p || !ytReady) return;
    if (p.isMuted()) {
      p.unMute();
      setIsMuted(false);
    } else {
      p.mute();
      setIsMuted(true);
    }
  };

  const handleToggleFullscreen = async () => {
    const wrapper = playerWrapperRef.current as
      | (HTMLDivElement & { webkitRequestFullscreen?: () => Promise<void> | void })
      | null;
    const docWithWebkit = document as Document & {
      webkitFullscreenElement?: Element;
      webkitExitFullscreen?: () => Promise<void> | void;
    };

    if (isFullscreen) {
      if (document.fullscreenElement) {
        try {
          await document.exitFullscreen();
        } catch {
          // ignore
        }
      } else if (docWithWebkit.webkitFullscreenElement && docWithWebkit.webkitExitFullscreen) {
        try {
          await docWithWebkit.webkitExitFullscreen();
        } catch {
          // ignore
        }
      }
      setIsFullscreen(false);
      return;
    }

    // Activate full-viewport mode immediately and also attempt native browser Fullscreen API
    setIsFullscreen(true);
    if (wrapper) {
      try {
        if (wrapper.requestFullscreen) {
          await wrapper.requestFullscreen();
        } else if (wrapper.webkitRequestFullscreen) {
          await wrapper.webkitRequestFullscreen();
        }
      } catch {
        // Iframe / browser policy fallback: CSS full-viewport mode remains active
      }
    }
  };

  return (
    <ModalDialog
      open={Boolean(module)}
      onClose={onClose}
      title={`Video Pembelajaran — Modul ${module.id}`}
      subtitle={`${module.shortTitle} · Durasi minimal tonton ${formatDurationClock(requiredSeconds)}`}
      maxWidth="4xl"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 text-xs font-semibold"
          >
            Tutup
          </button>
          <button
            type="button"
            disabled={!completion.canComplete}
            onClick={() => {
              if (!completion.canComplete) return;
              onConfirmWatched(module.id);
              onClose();
            }}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition ${
              completion.canComplete
                ? 'bg-[#0F684E] hover:bg-[#0B523D] text-white'
                : 'bg-slate-200 dark:bg-emerald-950 text-slate-400 cursor-not-allowed'
            }`}
          >
            {completion.canComplete ? (
              <CheckCircle2 className="w-3.5 h-3.5" />
            ) : (
              <Lock className="w-3.5 h-3.5" />
            )}
            {alreadyWatched
              ? 'Video Sudah Dituntaskan'
              : completion.canComplete
                ? 'Tandai Video Selesai Ditonton'
                : `Tonton Hingga Selesai (sisa ${formatDurationClock(completion.remainingSeconds)})`}
          </button>
        </>
      }
    >
      <div className="space-y-3.5">
        {/* Lock Status Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-xs">
          <div className="inline-flex items-center gap-2 font-semibold text-[#0F684E] dark:text-emerald-300">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Video Terkunci · Kecepatan 1x Normal · Tidak Dapat Dipercepat</span>
          </div>
          <span className="font-mono-num font-bold text-slate-700 dark:text-slate-200">
            {alreadyWatched
              ? '100% Tuntas'
              : `${formatDurationClock(watchedSeconds)} / ${formatDurationClock(requiredSeconds)} (${completion.progressPercent}%)`}
          </span>
        </div>

        {/* Fullscreen-Capable Video + Custom Locked Control Container */}
        <div
          ref={playerWrapperRef}
          className={
            isFullscreen
              ? 'fixed inset-0 z-[100] bg-slate-950 flex flex-col justify-between p-3 sm:p-5 gap-3'
              : 'space-y-3.5'
          }
        >
          {isFullscreen && (
            <div className="flex items-center justify-between gap-3 text-white text-xs shrink-0">
              <div className="min-w-0">
                <p className="font-bold truncate">
                  Modul {module.id} — {module.shortTitle}
                </p>
                <p className="text-[11px] text-emerald-300 font-mono-num">
                  Progres: {formatDurationClock(watchedSeconds)} / {formatDurationClock(requiredSeconds)} ({completion.progressPercent}%)
                </p>
              </div>
              <button
                type="button"
                onClick={handleToggleFullscreen}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white font-semibold shrink-0"
              >
                <Minimize2 className="w-3.5 h-3.5" />
                Keluar Layar Penuh
              </button>
            </div>
          )}

          {/* Video Viewport */}
          <div
            className={
              isFullscreen
                ? 'relative flex-1 w-full rounded-xl overflow-hidden bg-black select-none min-h-0'
                : 'relative w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-emerald-950 aspect-video select-none'
            }
            onContextMenu={(e) => e.preventDefault()}
          >
          {blobError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-xs text-red-200 gap-2">
              <AlertTriangle className="w-6 h-6 text-amber-400" />
              <p>{blobError}</p>
            </div>
          ) : isHtml5Video ? (
            <>
              <video
                ref={videoRef}
                src={html5Src}
                playsInline
                controlsList="nodownload noplaybackrate nofullscreen"
                disablePictureInPicture
                onLoadedMetadata={(e) => {
                  const dur = e.currentTarget.duration;
                  if (Number.isFinite(dur) && dur >= 1) {
                    setDetectedDuration(Math.ceil(dur));
                  }
                  e.currentTarget.playbackRate = 1;
                }}
                onPlay={() => {
                  setIsPlaying(true);
                  lastTickTsRef.current = Date.now();
                }}
                onPause={() => {
                  setIsPlaying(false);
                  lastTickTsRef.current = null;
                }}
                onRateChange={(e) => {
                  if (e.currentTarget.playbackRate !== 1) {
                    e.currentTarget.playbackRate = 1;
                    showLockedWarning(
                      'Kecepatan putar video dikunci pada 1x (normal) dan tidak dapat dipercepat.'
                    );
                  }
                }}
                onSeeking={(e) => {
                  const check = clampVideoSeekPosition(
                    e.currentTarget.currentTime,
                    maxWatchedRef.current,
                    1.5
                  );
                  if (check.blocked) {
                    e.currentTarget.currentTime = check.clampedTime;
                    setCurrentTime(check.clampedTime);
                    showLockedWarning(
                      'Video pembelajaran terkunci dan tidak dapat dipercepat atau dilompati.'
                    );
                  }
                }}
                onTimeUpdate={(e) => {
                  const v = e.currentTarget;
                  if (v.playbackRate !== 1) v.playbackRate = 1;
                  const pos = v.currentTime;
                  const check = clampVideoSeekPosition(pos, maxWatchedRef.current, 1.5);
                  if (check.blocked) {
                    v.currentTime = check.clampedTime;
                    setCurrentTime(check.clampedTime);
                    showLockedWarning(
                      'Video pembelajaran terkunci dan tidak dapat dipercepat atau dilompati.'
                    );
                    lastTickTsRef.current = Date.now();
                    return;
                  }
                  setCurrentTime(pos);
                  if (!v.paused && document.visibilityState === 'visible') {
                    const now = Date.now();
                    const deltaSec =
                      lastTickTsRef.current !== null
                        ? Math.min(1.0, Math.max(0, (now - lastTickTsRef.current) / 1000))
                        : 0;
                    lastTickTsRef.current = now;
                    if (pos > maxWatchedRef.current) {
                      maxWatchedRef.current = pos;
                      setMaxPositionSeconds(pos);
                    }
                    if (deltaSec > 0) {
                      watchedSecondsRef.current += deltaSec;
                      setWatchedSeconds(watchedSecondsRef.current);
                    }
                  }
                }}
                onEnded={(e) => {
                  setIsPlaying(false);
                  lastTickTsRef.current = null;
                  setHasEnded(true);
                  const dur = e.currentTarget.duration;
                  if (Number.isFinite(dur) && dur >= 1) {
                    maxWatchedRef.current = Math.max(maxWatchedRef.current, dur);
                    setMaxPositionSeconds(maxWatchedRef.current);
                    setCurrentTime(dur);
                  }
                }}
                onClick={handleHtml5TogglePlay}
                className="absolute inset-0 w-full h-full object-contain bg-black cursor-pointer"
              />
              {!isPlaying && (
                <button
                  type="button"
                  onClick={handleHtml5TogglePlay}
                  aria-label="Putar video pembelajaran"
                  className="absolute inset-0 flex items-center justify-center bg-black/35 hover:bg-black/25 transition"
                >
                  <span className="w-16 h-16 rounded-full bg-[#0F684E] text-white flex items-center justify-center shadow-lg">
                    <Play className="w-7 h-7 fill-current ml-0.5" />
                  </span>
                </button>
              )}
            </>
          ) : parsedSource.kind === 'youtube' ? (
            <>
              {ytApiFallback ? (
                <iframe
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  src={parsedSource.src}
                  title={module.judul}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              ) : (
                <div ref={ytContainerRef} className="absolute inset-0 w-full h-full" />
              )}
              {/* Transparent anti-scrub overlay prevents direct seek/speed gestures on the iframe */}
              <button
                type="button"
                onClick={handleYtTogglePlay}
                aria-label={isPlaying ? 'Jeda video' : 'Putar video'}
                className="absolute inset-0 z-10 w-full h-full bg-transparent cursor-pointer flex items-center justify-center"
              >
                {!isPlaying && (
                  <span className="w-16 h-16 rounded-full bg-[#0F684E]/95 text-white flex items-center justify-center shadow-lg border-2 border-white/80">
                    <Play className="w-7 h-7 fill-current ml-0.5" />
                  </span>
                )}
              </button>
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-xs text-slate-300">
              Tautan video modul belum dikonfigurasi. Hubungi Admin Kemenag untuk mengunggah video.
            </div>
          )}
        </div>

        {/* Custom Locked Control Bar (No Fast-Forward, No Speed Selector, With Fullscreen) */}
        <div
          className={`p-3 rounded-xl border space-y-2.5 shrink-0 ${
            isFullscreen
              ? 'bg-slate-900/95 border-emerald-900/70 text-white'
              : 'bg-[#F8FAF9] dark:bg-[#0D1613] border-slate-200 dark:border-emerald-950'
          }`}
        >
          {/* Read-only watch progress bar */}
          <div className="space-y-1">
            <div
              className="h-2 w-full rounded-full bg-slate-200 dark:bg-emerald-950 overflow-hidden"
              role="progressbar"
              aria-label="Progres menonton video"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={completion.progressPercent}
            >
              <div
                className="h-full bg-[#0F684E] transition-all duration-300"
                style={{ width: `${completion.progressPercent}%` }}
              />
            </div>
            <div
              className={`flex items-center justify-between text-[11px] font-mono-num ${
                isFullscreen ? 'text-slate-300' : 'text-slate-500'
              }`}
            >
              <span>Posisi: {formatDurationClock(currentTime)}</span>
              <span>Minimal Tonton: {formatDurationClock(requiredSeconds)}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={isHtml5Video ? handleHtml5TogglePlay : handleYtTogglePlay}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0F684E] hover:bg-[#0B523D] text-white text-xs font-semibold"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                {isPlaying ? 'Jeda' : 'Putar Video'}
              </button>

              {!ytApiFallback && (
                <button
                  type="button"
                  onClick={isHtml5Video ? handleHtml5Rewind : handleYtRewind}
                  className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-semibold ${
                    isFullscreen
                      ? 'border-white/25 text-white hover:bg-white/10'
                      : 'border-slate-300 dark:border-emerald-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-emerald-950'
                  }`}
                  title="Putar ulang 10 detik sebelumnya"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  -10 dtk
                </button>
              )}

              {!ytApiFallback && (
                <button
                  type="button"
                  onClick={isHtml5Video ? handleHtml5ToggleMute : handleYtToggleMute}
                  className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-semibold ${
                    isFullscreen
                      ? 'border-white/25 text-white hover:bg-white/10'
                      : 'border-slate-300 dark:border-emerald-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-emerald-950'
                  }`}
                  aria-label={isMuted ? 'Nyalakan suara' : 'Bisukan suara'}
                >
                  {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  {isMuted ? 'Suara Mati' : 'Suara'}
                </button>
              )}

              <button
                type="button"
                onClick={handleToggleFullscreen}
                aria-label={isFullscreen ? 'Keluar Layar Penuh' : 'Layar Penuh (1 Layar)'}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition ${
                  isFullscreen
                    ? 'border-amber-400/60 bg-amber-500/20 text-amber-200 hover:bg-amber-500/30'
                    : 'border-[#0F684E]/40 dark:border-emerald-800 text-[#0F684E] dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/60'
                }`}
              >
                {isFullscreen ? (
                  <>
                    <Minimize2 className="w-3.5 h-3.5" />
                    Keluar Layar Penuh
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-3.5 h-3.5" />
                    Layar Penuh
                  </>
                )}
              </button>
            </div>

            <span
              className={`text-[11px] font-semibold inline-flex items-center gap-1 ${
                isFullscreen ? 'text-slate-300' : 'text-slate-500'
              }`}
            >
              <Lock className="w-3 h-3 text-amber-500" />
              Kecepatan 1x (Terkunci)
            </span>
          </div>
        </div>
        </div>

        {seekWarning && (
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>{seekWarning}</span>
          </div>
        )}

        <p className="text-xs text-slate-500 dark:text-slate-400">
          Tonton video materi modul ini secara penuh (minimal{' '}
          <strong className="font-mono-num text-slate-700 dark:text-slate-200">
            {formatDurationClock(requiredSeconds)}
          </strong>
          ) tanpa mempercepat agar tombol selesai menonton aktif dan kuis Modul {module.id} terbuka.
        </p>
      </div>
    </ModalDialog>
  );
};

export const QuizModal: React.FC<{
  open: boolean;
  title: string;
  subtitle: string;
  questions: QuizQuestion[];
  passingScore?: number;
  oneTimeOnly?: boolean;
  onClose: () => void;
  onComplete: (score: number) => void;
}> = ({
  open,
  title,
  subtitle,
  questions,
  passingScore = 80,
  oneTimeOnly = false,
  onClose,
  onComplete,
}) => {
  const shuffled = useMemo(() => (open ? shuffleQuizQuestions(questions) : []), [open, questions]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [fontSize, setFontSize] = useState(14);
  const [submittedScore, setSubmittedScore] = useState<number | null>(null);

  useEffect(() => {
    if (open) {
      setAnswers({});
      setSubmittedScore(null);
    }
  }, [open, title]);

  const handleSubmit = () => {
    if (shuffled.length === 0) return;
    let correct = 0;
    shuffled.forEach((q, idx) => {
      if (answers[idx] === q.ans) correct += 1;
    });
    const score = Math.round((correct / shuffled.length) * 100);
    setSubmittedScore(score);
    onComplete(score);
  };

  const allAnswered = shuffled.length > 0 && Object.keys(answers).length === shuffled.length;

  return (
    <ModalDialog
      open={open}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      maxWidth="2xl"
      footer={
        submittedScore === null ? (
          <>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 text-xs font-semibold"
            >
              Batal
            </button>
            <button
              type="button"
              disabled={!allAnswered}
              onClick={handleSubmit}
              className={`px-5 py-2 rounded-lg text-xs font-semibold transition ${
                allAnswered
                  ? 'bg-[#0F684E] hover:bg-[#0B523D] text-white'
                  : 'bg-slate-200 dark:bg-emerald-950 text-slate-400 cursor-not-allowed'
              }`}
            >
              Kirim Jawaban ({Object.keys(answers).length}/{shuffled.length})
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-[#0F684E] hover:bg-[#0B523D] text-white text-xs font-semibold"
          >
            Selesai &amp; Kembali
          </button>
        )
      }
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-500">
          {oneTimeOnly ? (
            <span>
              Jawab seluruh {shuffled.length} pertanyaan ·{' '}
              <strong className="text-amber-700 dark:text-amber-400">
                Hanya 1 kali pengerjaan (tidak dapat diulangi)
              </strong>
            </span>
          ) : (
            <span>
              Jawab seluruh {shuffled.length} pertanyaan · Standar kelulusan modul:{' '}
              <strong className="font-mono-num">{passingScore}%</strong>
            </span>
          )}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setFontSize((s) => Math.max(12, s - 1))}
              className="px-2 py-1 rounded border border-slate-200 dark:border-emerald-900"
            >
              A-
            </button>
            <button
              type="button"
              onClick={() => setFontSize((s) => Math.min(20, s + 1))}
              className="px-2 py-1 rounded border border-slate-200 dark:border-emerald-900"
            >
              A+
            </button>
          </div>
        </div>

        {submittedScore !== null && (
          <div
            className={`p-4 rounded-xl border flex items-center justify-between gap-3 ${
              oneTimeOnly || submittedScore >= passingScore
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800'
                : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-[#0F684E] dark:text-emerald-400 shrink-0" />
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  Skor Anda: <span className="font-mono-num">{submittedScore} / 100</span>
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  {oneTimeOnly
                    ? 'Hasil evaluasi Anda telah tersimpan permanen dan tidak dapat diulangi.'
                    : submittedScore >= passingScore
                      ? 'Selamat, Anda memenuhi standar kompetensi evaluasi.'
                      : 'Anda dapat mengulang kembali setelah mempelajari ringkasan materi.'}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4" style={{ fontSize: `${fontSize}px` }}>
          {shuffled.map((item, qIdx) => (
            <div
              key={`${item.id}_${qIdx}`}
              className="p-4 rounded-xl border border-slate-200 dark:border-emerald-950 bg-[#F8FAF9] dark:bg-[#0D1613] space-y-2.5"
            >
              <p className="font-semibold text-slate-900 dark:text-slate-100">
                <span className="font-mono-num text-[#0F684E] dark:text-emerald-400 mr-1.5">
                  {qIdx + 1}.
                </span>
                {item.q}
              </p>
              <div className="grid grid-cols-1 gap-2">
                {item.opt.map((optText, optIdx) => {
                  const selected = answers[qIdx] === optIdx;
                  const showCorrect = submittedScore !== null && optIdx === item.ans;
                  const showWrong = submittedScore !== null && selected && optIdx !== item.ans;

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      disabled={submittedScore !== null}
                      onClick={() => setAnswers((prev) => ({ ...prev, [qIdx]: optIdx }))}
                      className={`text-left px-3.5 py-2.5 rounded-lg border text-xs sm:text-sm transition ${
                        showCorrect
                          ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 font-semibold text-emerald-900 dark:text-emerald-200'
                          : showWrong
                            ? 'border-red-500 bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-200'
                            : selected
                              ? 'border-[#0F684E] bg-emerald-50/70 dark:bg-emerald-950/40 font-semibold'
                              : 'border-slate-200 dark:border-emerald-900 bg-white dark:bg-[#111C18] hover:border-slate-400'
                      }`}
                    >
                      <span className="font-mono-num font-bold mr-2">
                        {String.fromCharCode(65 + optIdx)}.
                      </span>
                      {optText}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </ModalDialog>
  );
};

export const IkmSurveyModal: React.FC<{
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: { rating: number; aspek: string; ulasan: string }) => void;
}> = ({ open, onClose, onSubmit }) => {
  const [rating, setRating] = useState(5);
  const [aspek, setAspek] = useState('Kualitas Materi & Kemudahan Aplikasi');
  const [ulasan, setUlasan] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ rating, aspek, ulasan: ulasan || 'Layanan Bimbingan Perkawinan sangat membantu.' });
    setUlasan('');
    onClose();
  };

  return (
    <ModalDialog
      open={open}
      onClose={onClose}
      title="Survei Indeks Kepuasan Masyarakat (IKM)"
      subtitle="Langkah 6 Wajib — Penilaian layanan Bimbingan Perkawinan Mandiri Kemenag Jepara."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
        <div>
          <label className="block font-semibold mb-2">Tingkat Kepuasan Keseluruhan</label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setRating(num)}
                className={`p-2 rounded-lg border transition ${
                  num <= rating
                    ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/30 text-amber-500'
                    : 'border-slate-200 dark:border-emerald-900 text-slate-300'
                }`}
                aria-label={`${num} bintang`}
              >
                <Star className="w-5 h-5 fill-current" />
              </button>
            ))}
            <span className="font-mono-num font-bold text-slate-700 dark:text-slate-200 ml-2">
              {rating} / 5
            </span>
          </div>
        </div>

        <div>
          <label className="block font-semibold mb-1">Aspek Layanan Terbaik</label>
          <select
            value={aspek}
            onChange={(e) => setAspek(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-white dark:bg-[#0D1613]"
          >
            <option>Kualitas Materi &amp; Kemudahan Aplikasi</option>
            <option>Pelayanan Fasilitator KUA</option>
            <option>Kecepatan Verifikasi &amp; Sertifikat QR</option>
            <option>Fitur Kalkulator Gizi &amp; Keuangan</option>
          </select>
        </div>

        <div>
          <label className="block font-semibold mb-1">Kesan &amp; Masukan Layanan *</label>
          <textarea
            rows={3}
            required
            value={ulasan}
            onChange={(e) => setUlasan(e.target.value)}
            placeholder="Tuliskan pengalaman belajar Anda di Bimwin Mandiri Kemenag Jepara..."
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-emerald-900 bg-white dark:bg-[#0D1613]"
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
            className="px-5 py-2 rounded-lg bg-[#0F684E] hover:bg-[#0B523D] text-white text-xs font-semibold"
          >
            Kirim Survei IKM
          </button>
        </div>
      </form>
    </ModalDialog>
  );
};
