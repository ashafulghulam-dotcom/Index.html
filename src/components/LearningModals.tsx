import React, { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  ExternalLink,
  Minus,
  Plus,
  Star,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { ModuleDefinition, QuizQuestion } from '../types/bimwin';
import { shuffleQuizQuestions } from '../utils/bimwinLogic';
import { ModalDialog } from './UiPrimitives';

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
  onClose: () => void;
  onOpenQuiz: (moduleId: number) => void;
}> = ({ module, onClose, onOpenQuiz }) => {
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
          <button
            type="button"
            onClick={() => {
              window.speechSynthesis?.cancel();
              setSpeaking(false);
              onOpenQuiz(module.id);
            }}
            className="px-4 py-2 rounded-lg bg-[#0F684E] hover:bg-[#0B523D] text-white text-xs font-semibold"
          >
            Lanjut Kerjakan Kuis Modul {module.id}
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
  const [secondsLeft, setSecondsLeft] = useState(5);

  useEffect(() => {
    if (!module || alreadyWatched) return;
    setSecondsLeft(5);
    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [module, alreadyWatched]);

  if (!module) return null;

  const canConfirm = alreadyWatched || secondsLeft === 0;

  return (
    <ModalDialog
      open={Boolean(module)}
      onClose={onClose}
      title={`Video Pembelajaran — Modul ${module.id}`}
      subtitle={module.shortTitle}
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
            disabled={!canConfirm}
            onClick={() => {
              onConfirmWatched(module.id);
              onClose();
            }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
              canConfirm
                ? 'bg-[#0F684E] hover:bg-[#0B523D] text-white'
                : 'bg-slate-200 dark:bg-emerald-950 text-slate-400 cursor-not-allowed'
            }`}
          >
            {alreadyWatched
              ? 'Video Sudah Dituntaskan'
              : secondsLeft > 0
                ? `Verifikasi Menonton (${secondsLeft} dtk)...`
                : 'Tandai Video Selesai Ditonton'}
          </button>
        </>
      }
    >
      <div className="space-y-3">
        <div className="relative w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-emerald-950 aspect-video">
          <iframe
            className="absolute inset-0 w-full h-full"
            src={module.videoUrl}
            title={module.judul}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Simak paparan fasilitator di atas sebelum menandai video selesai dan mengerjakan kuis evaluasi modul.
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
  onClose: () => void;
  onComplete: (score: number) => void;
}> = ({ open, title, subtitle, questions, passingScore = 80, onClose, onComplete }) => {
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
          <span>
            Jawab seluruh {shuffled.length} pertanyaan · Standar kelulusan modul:{' '}
            <strong className="font-mono-num">{passingScore}%</strong>
          </span>
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
              submittedScore >= passingScore
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
                  {submittedScore >= passingScore
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
