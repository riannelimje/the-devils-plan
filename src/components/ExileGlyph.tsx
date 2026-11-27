'use client'

import React from 'react'
import { cn } from '@/lib/utils'

/**
 * Exact SVG stroke paths (viewBox 0 0 100 100) for Exile numerals 1-9.
 * Digit 0 is intentionally blank.
 */
export const EXILE_DIGIT_PATHS: Record<number, string> = {
  0: '',
  // 1: horizontal top bar, vertical right stem, diagonal return up-left
  1: 'M 20 26 L 76 26 L 76 76 L 44 46',
  // 2: top-right slant down-left, horizontal right, slant down-left
  2: 'M 74 26 L 24 52 L 76 52 L 50 78',
  // 3: stacked X over X without crossing (爻)
  3: 'M 30 18 L 70 44 M 70 18 L 30 44 M 30 54 L 70 80 M 70 54 L 30 80',
  // 4: two X glyphs side by side (XX)
  4: 'M 18 26 L 46 74 M 46 26 L 18 74 M 54 26 L 82 74 M 82 26 L 54 74',
  // 5: horizontal top bar, center vertical stem, short right drop
  5: 'M 20 26 L 80 26 M 50 26 L 50 78 M 80 26 L 80 46',
  // 6: center spine, left rising hook, right dropping hook
  6: 'M 50 18 L 50 78 M 24 24 L 24 50 L 50 50 M 50 50 L 76 50 L 76 76',
  // 7: Pi arch with taller central vertical stem
  7: 'M 24 76 L 24 42 L 76 42 L 76 76 M 50 20 L 50 76',
  // 8: open-top-right squared C with right-bottom upward hook
  8: 'M 66 24 L 24 24 L 24 76 L 76 76 L 76 48',
  // 9: vertical stem, horizontal top bar, diagonal down-left from right end of top bar
  9: 'M 54 18 L 54 78 M 28 30 L 78 30 M 78 30 L 26 64',
}

interface ExileDigitProps {
  digit: number
  className?: string
  strokeWidth?: number
}

/**
 * Renders a single Exile numeral digit (0-9). Digit 0 renders as an empty spacer.
 */
export function ExileDigit({
  digit,
  className = 'w-6 h-6',
  strokeWidth = 7.5,
}: ExileDigitProps) {
  if (digit === 0) {
    return <span className={cn('inline-block shrink-0', className)} aria-hidden="true" />
  }

  const path = EXILE_DIGIT_PATHS[digit]
  if (!path) return null

  return (
    <svg
      viewBox="0 0 100 100"
      className={cn('shrink-0', className)}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  )
}

type GlyphSize = 'xs' | 'sm' | 'md' | 'lg'

const SIZE_CLASSES: Record<GlyphSize, { single: string; double: string; text: string }> = {
  xs: { single: 'w-4 h-4', double: 'w-3.5 h-3.5', text: 'text-[9px]' },
  sm: { single: 'w-5 h-5', double: 'w-4 h-4', text: 'text-[10px]' },
  md: { single: 'w-6 h-6', double: 'w-5 h-5', text: 'text-[11px]' },
  lg: { single: 'w-8 h-8', double: 'w-6 h-6', text: 'text-xs' },
}

interface ExileNumberProps {
  value: number
  size?: GlyphSize
  showNumberHint?: boolean
  className?: string
  hintClassName?: string
}

/**
 * Renders a 1- or 2-digit number in Exile hieroglyphs.
 * Two-digit numbers render side by side (with 0 as a blank right-hand slot).
 */
export function ExileNumber({
  value,
  size = 'md',
  showNumberHint = false,
  className,
  hintClassName,
}: ExileNumberProps) {
  const digits = String(value).split('').map(Number)
  const isDouble = digits.length === 2
  const dims = SIZE_CLASSES[size]

  return (
    <div className={cn('inline-flex flex-col items-center justify-center leading-none', className)}>
      <div className="inline-flex items-center justify-center gap-0.5">
        {digits.map((digit, index) => (
          <ExileDigit
            key={`${value}-${index}`}
            digit={digit}
            className={isDouble ? dims.double : dims.single}
          />
        ))}
      </div>
      {showNumberHint && (
        <span className={cn('font-mono text-gray-400 mt-0.5 leading-none', dims.text, hintClassName)}>
          {value}
        </span>
      )}
    </div>
  )
}
