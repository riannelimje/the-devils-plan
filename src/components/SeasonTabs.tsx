'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Flame, Lock, Skull } from 'lucide-react'
import { SEASONS, SeasonNumber } from '@/data/games'
import { ExileDigit, ExileNumber } from '@/components/ExileGlyph'

interface SeasonTabsProps {
  activeSeason: SeasonNumber
  onSelectSeason: (season: SeasonNumber) => void
  gameCounts: Record<SeasonNumber, number>
}

export function SeasonTabs({
  activeSeason,
  onSelectSeason,
  gameCounts,
}: SeasonTabsProps) {
  return (
    <div className="flex flex-col items-center gap-3 mb-8">
      <div
        role="tablist"
        aria-label="Select Devil's Plan Season"
        className="relative inline-grid grid-cols-2 p-1.5 rounded-xl bg-black/80 border border-red-900/40 backdrop-blur-md shadow-[0_0_30px_rgba(220,38,38,0.12)]"
      >
        {SEASONS.map((s) => {
          const isActive = activeSeason === s.season
          const count = gameCounts[s.season] ?? 0

          return (
            <button
              key={s.season}
              role="tab"
              type="button"
              aria-selected={isActive}
              onClick={() => onSelectSeason(s.season)}
              className={`relative px-4 sm:px-7 py-3 rounded-lg text-left transition-colors cursor-pointer select-none ${
                isActive ? 'text-white' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="active-season-pill"
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  className={`absolute inset-0 rounded-lg border ${
                    s.season === 3
                      ? 'bg-gradient-to-br from-red-950/80 via-black to-amber-950/50 border-amber-500/50 shadow-[0_0_24px_rgba(245,158,11,0.22)]'
                      : 'bg-gradient-to-br from-red-950/70 via-black to-purple-950/60 border-red-500/50 shadow-[0_0_24px_rgba(220,38,38,0.22)]'
                  }`}
                />
              )}

              <div className="relative z-10 flex items-center gap-2.5 sm:gap-3">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-md border font-mono text-xs font-bold shrink-0 ${
                    s.season === 3
                      ? isActive
                        ? 'border-amber-500/60 bg-amber-500/15 text-amber-400'
                        : 'border-gray-800 bg-gray-900/70 text-gray-500'
                      : isActive
                        ? 'border-red-500/60 bg-red-500/15 text-red-400'
                        : 'border-gray-800 bg-gray-900/70 text-gray-500'
                  }`}
                >
                  {s.season === 3 ? (
                    <Flame className="w-4 h-4" />
                  ) : (
                    <Skull className="w-4 h-4" />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] tracking-widest uppercase text-gray-400">
                      {s.code}
                    </span>
                    {s.isNew && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-600/20 border border-red-500/50 text-[10px] font-mono font-semibold text-red-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                        NEW
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-bold text-sm sm:text-base whitespace-nowrap">
                      {s.label}
                    </span>
                    <span className="hidden sm:inline text-xs text-gray-400">
                      • {s.subtitle}
                    </span>
                  </div>
                </div>

                <span className="ml-1 hidden md:inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[11px] font-mono bg-white/5 border border-white/10 text-gray-300">
                  {count}
                </span>
              </div>
            </button>
          )
        })}
      </div>

      {/* Active season tagline */}
      <p className="text-xs sm:text-sm font-mono text-gray-400 text-center">
        {SEASONS.find((s) => s.season === activeSeason)?.tagline}
      </p>
    </div>
  )
}

/**
 * Custom artwork banner for the 49 Magic Square GameCard.
 */
export function MagicSquareCardVisual() {
  const sampleGrid = Array.from({ length: 49 })

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-black via-red-950/30 to-amber-950/30 flex items-center justify-center overflow-hidden p-4 border-b border-red-900/30">
      {/* Decorative side Exile glyphs */}
      <div className="absolute left-3 top-3 text-amber-500/20">
        <ExileNumber value={49} size="md" />
      </div>
      <div className="absolute right-3 bottom-3 text-red-500/20">
        <ExileNumber value={25} size="md" />
      </div>

      {/* Mini 7x7 Exile stone tablet */}
      <div className="relative p-2 rounded-lg border border-amber-500/40 bg-black/80 shadow-[0_0_25px_rgba(245,158,11,0.18)]">
        <div className="grid grid-cols-7 gap-1">
          {sampleGrid.map((_, idx) => {
            const isTopCenter = idx === 3
            const isCenter = idx === 24
            return (
              <div
                key={idx}
                className={`w-4 h-4 rounded-[2px] flex items-center justify-center border ${
                  isTopCenter
                    ? 'border-amber-400 bg-amber-500/25 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                    : isCenter
                      ? 'border-red-500/50 bg-red-950/40 text-red-400/80'
                      : 'border-amber-900/40 bg-zinc-950/80'
                }`}
              >
                {isTopCenter && <ExileDigit digit={1} className="w-3 h-3" strokeWidth={9} />}
                {isCenter && <ExileDigit digit={5} className="w-2.5 h-2.5" strokeWidth={9} />}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/**
 * Classified placeholder banner for upcoming Season 3 games.
 */
export function ClassifiedTrialVisual() {
  return (
    <div className="relative w-full h-full bg-gradient-to-br from-black via-zinc-950 to-red-950/25 flex flex-col items-center justify-center gap-2 overflow-hidden border-b border-red-900/30">
      <div className="flex items-center gap-3 text-red-500/25">
        <ExileDigit digit={3} className="w-6 h-6" />
        <ExileDigit digit={7} className="w-6 h-6" />
        <ExileDigit digit={9} className="w-6 h-6" />
      </div>
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-red-900/50 bg-black/70 text-red-400/80 font-mono text-xs tracking-widest">
        <Lock className="w-3.5 h-3.5 animate-pulse" />
        <span>SEASON 03 // SEALED</span>
      </div>
    </div>
  )
}
