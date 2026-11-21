import React from 'react';
import { CheckCircle2, Lock } from 'lucide-react';
import { BimwinUser } from '../types/bimwin';

interface AchievementBadgesProps {
  user: BimwinUser;
  moocFinished: boolean;
}

interface BadgeDefinition {
  id: 'pasangan' | 'sakinah' | 'kompak' | 'berkualitas';
  title: string;
  tier: string;
  desc: string;
  earned: boolean;
  requirementHint: string;
}

const BadgeMedallionSvg: React.FC<{
  kind: BadgeDefinition['id'];
  earned: boolean;
}> = ({ kind, earned }) => {
  const palettes: Record<
    BadgeDefinition['id'],
    { outerA: string; outerB: string; innerA: string; innerB: string; ribbon: string; star: string }
  > = {
    pasangan: {
      outerA: '#F5D061',
      outerB: '#B8830F',
      innerA: '#0F684E',
      innerB: '#07382A',
      ribbon: '#C69214',
      star: '#FDE68A',
    },
    sakinah: {
      outerA: '#34D399',
      outerB: '#065F46',
      innerA: '#0B523D',
      innerB: '#062C21',
      ribbon: '#0F684E',
      star: '#FDE68A',
    },
    kompak: {
      outerA: '#FBBF24',
      outerB: '#B45309',
      innerA: '#134E4A',
      innerB: '#082F2C',
      ribbon: '#D97706',
      star: '#FEF3C7',
    },
    berkualitas: {
      outerA: '#FDE047',
      outerB: '#A16207',
      innerA: '#094232',
      innerB: '#042219',
      ribbon: '#0F684E',
      star: '#FEF08A',
    },
  };

  const p = palettes[kind];
  const gradOuterId = `badge-outer-${kind}-${earned ? 'on' : 'off'}`;
  const gradInnerId = `badge-inner-${kind}-${earned ? 'on' : 'off'}`;

  return (
    <svg
      viewBox="0 0 88 96"
      className="w-16 h-[70px] shrink-0 drop-shadow-sm"
      role="img"
      aria-label={`Visualisasi lencana ${kind}`}
    >
      <defs>
        <linearGradient id={gradOuterId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={earned ? p.outerA : '#CBD5E1'} />
          <stop offset="100%" stopColor={earned ? p.outerB : '#64748B'} />
        </linearGradient>
        <linearGradient id={gradInnerId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={earned ? p.innerA : '#334155'} />
          <stop offset="100%" stopColor={earned ? p.innerB : '#1E293B'} />
        </linearGradient>
      </defs>

      {/* Bottom ceremonial ribbon tails */}
      <path
        d="M27 68 L22 92 L35 85 L44 92 L44 68 Z"
        fill={earned ? p.ribbon : '#94A3B8'}
        opacity={earned ? 0.92 : 0.45}
      />
      <path
        d="M61 68 L66 92 L53 85 L44 92 L44 68 Z"
        fill={earned ? p.outerB : '#64748B'}
        opacity={earned ? 0.92 : 0.45}
      />

      {/* Laurel wreath arcs */}
      <path
        d="M17 58 C10 47, 10 30, 19 18"
        fill="none"
        stroke={earned ? p.outerA : '#94A3B8'}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeDasharray="3 3.5"
      />
      <path
        d="M71 58 C78 47, 78 30, 69 18"
        fill="none"
        stroke={earned ? p.outerA : '#94A3B8'}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeDasharray="3 3.5"
      />

      {/* Outer octagonal shield / medallion */}
      <path
        d="M44 6 L70 16 L70 43 C70 59 58 70 44 77 C30 70 18 59 18 43 L18 16 Z"
        fill={`url(#${gradOuterId})`}
      />
      <path
        d="M44 10.5 L65.5 18.8 L65.5 42.2 C65.5 55.6 55.4 65.2 44 71.5 C32.6 65.2 22.5 55.6 22.5 42.2 L22.5 18.8 Z"
        fill={`url(#${gradInnerId})`}
        stroke={earned ? '#FEF3C7' : '#CBD5E1'}
        strokeWidth="0.9"
        strokeOpacity={earned ? 0.7 : 0.35}
      />

      {/* Center Emblem Symbol */}
      {kind === 'pasangan' && (
        <g stroke={earned ? p.star : '#CBD5E1'} strokeWidth="2.6" fill="none">
          <circle cx="37.5" cy="40" r="8.5" />
          <circle cx="50.5" cy="40" r="8.5" />
          <path
            d="M44 25 L45.4 28.4 L49 28.8 L46.2 31.1 L47.1 34.5 L44 32.6 L40.9 34.5 L41.8 31.1 L39 28.8 L42.6 28.4 Z"
            fill={earned ? p.star : '#CBD5E1'}
            stroke="none"
          />
        </g>
      )}

      {kind === 'sakinah' && (
        <g>
          {/* Open book + graduation star */}
          <path
            d="M29 47 C34 44, 40 44, 44 48 C48 44, 54 44, 59 47 L59 33 C54 30, 48 31, 44 35 C40 31, 34 30, 29 33 Z"
            fill="none"
            stroke={earned ? p.star : '#CBD5E1'}
            strokeWidth="2.3"
            strokeLinejoin="round"
          />
          <line
            x1="44"
            y1="35"
            x2="44"
            y2="48"
            stroke={earned ? p.star : '#CBD5E1'}
            strokeWidth="2"
          />
          <circle cx="44" cy="24" r="3" fill={earned ? p.star : '#CBD5E1'} />
        </g>
      )}

      {kind === 'kompak' && (
        <g>
          {/* Heart inside ceremonial ring */}
          <circle
            cx="44"
            cy="40"
            r="13.5"
            fill="none"
            stroke={earned ? p.star : '#CBD5E1'}
            strokeWidth="1.6"
            strokeDasharray="2.2 2.2"
          />
          <path
            d="M44 49 C44 49, 33 42.2, 33 35.8 C33 32.3, 35.8 30, 38.8 30 C41 30, 42.9 31.3, 44 33.1 C45.1 31.3, 47 30, 49.2 30 C52.2 30, 55 32.3, 55 35.8 C55 42.2, 44 49, 44 49 Z"
            fill={earned ? p.star : '#CBD5E1'}
          />
        </g>
      )}

      {kind === 'berkualitas' && (
        <g>
          {/* Crown / Premier Star with Checkmark */}
          <polygon
            points="44,21 48.2,30.5 58.5,31.6 50.8,38.4 53,48.5 44,43.3 35,48.5 37.2,38.4 29.5,31.6 39.8,30.5"
            fill={earned ? p.star : '#CBD5E1'}
          />
          <path
            d="M36 55 L42 60 L53 49"
            fill="none"
            stroke={earned ? '#34D399' : '#94A3B8'}
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      )}

      {/* Top 3 mini stars on earned badges */}
      {earned && (
        <g fill="#FEF08A">
          <circle cx="38" cy="14.5" r="1.2" />
          <circle cx="44" cy="12.8" r="1.6" />
          <circle cx="50" cy="14.5" r="1.2" />
        </g>
      )}
    </svg>
  );
};

export const AchievementBadges: React.FC<AchievementBadgesProps> = ({ user, moocFinished }) => {
  const badges: BadgeDefinition[] = [
    {
      id: 'pasangan',
      title: 'Pasangan Harmonis',
      tier: 'Tahap 1 · Sinkronisasi',
      desc: 'Berhasil menyinkronkan akun calon pengantin bersama pasangan.',
      earned: Boolean(user.pasanganUsername),
      requirementHint: 'Sinkronkan akun pasangan di Langkah 1',
    },
    {
      id: 'sakinah',
      title: 'Pembelajar Sakinah',
      tier: 'Tahap 2 · Kurikulum MOOC',
      desc: 'Menuntaskan seluruh 5 Modul Nasional Kemenag RI & Postest.',
      earned: moocFinished,
      requirementHint: 'Tuntaskan 5 Modul & Postest Bimwin',
    },
    {
      id: 'kompak',
      title: 'Komitmen Kami Kompak',
      tier: 'Tahap 3 · Kesepakatan Keluarga',
      desc: 'Menyusun visi keluarga & Piagam Komitmen "Kami Kompak".',
      earned: Boolean(user.kompak?.kodePiagam),
      requirementHint: 'Simpan komitmen di menu Piagam Kami Kompak',
    },
    {
      id: 'berkualitas',
      title: 'Siap Keluarga Berkualitas',
      tier: 'Tahap 4 · Predikat Utama',
      desc: 'Lulus terverifikasi Fasilitator KUA & tuntas skrining gizi pra-nikah.',
      earned: Boolean(user.progress?.verifikasiFasilitator && user.stunting),
      requirementHint: 'Lulus verifikasi Fasilitator & simpan skrining gizi',
    },
  ];

  const earnedCount = badges.filter((b) => b.earned).length;
  const percent = Math.round((earnedCount / badges.length) * 100);

  return (
    <div className="bg-white dark:bg-[#111C18] border border-slate-200 dark:border-emerald-950 rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            Lencana Prestasi Catin
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Penghargaan kompetensi resmi kesiapan keluarga sakinah
          </p>
        </div>
        <div className="text-right shrink-0">
          <span className="font-mono-num text-sm font-bold text-[#0F684E] dark:text-emerald-400">
            {earnedCount}/{badges.length}
          </span>
          <p className="text-[10px] text-slate-500">Diraih ({percent}%)</p>
        </div>
      </div>

      {/* Mastery progress bar */}
      <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-emerald-950 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#0F684E] to-[#C69214] transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Professional Badge List (Spacious horizontal medallion cards — zero text truncation) */}
      <div className="space-y-2.5">
        {badges.map((badge) => (
          <div
            key={badge.id}
            className={`relative rounded-xl border p-3.5 flex items-center gap-3.5 transition ${
              badge.earned
                ? 'border-emerald-300/90 dark:border-emerald-700/80 bg-gradient-to-br from-emerald-50/80 via-white to-amber-50/50 dark:from-emerald-950/50 dark:via-[#111C18] dark:to-amber-950/20 shadow-xs'
                : 'border-slate-200 dark:border-emerald-950 bg-slate-50/70 dark:bg-[#0D1613]/70'
            }`}
          >
            <div className={badge.earned ? 'shrink-0' : 'shrink-0 opacity-60 grayscale'}>
              <BadgeMedallionSvg kind={badge.id} earned={badge.earned} />
            </div>

            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider ${
                    badge.earned
                      ? 'text-amber-700 dark:text-amber-400'
                      : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {badge.tier}
                </span>
                {badge.earned ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#0F684E] dark:text-emerald-400 shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Diraih
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400 shrink-0">
                    <Lock className="w-3 h-3" />
                    Terkunci
                  </span>
                )}
              </div>

              <p
                className={`text-sm font-bold leading-snug ${
                  badge.earned
                    ? 'text-slate-900 dark:text-white'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {badge.title}
              </p>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {badge.earned ? badge.desc : badge.requirementHint}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
