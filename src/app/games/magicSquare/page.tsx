'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  BookOpen,
  Clock,
  Eye,
  EyeOff,
  HelpCircle,
  Lock,
  Pause,
  Play,
  RotateCcw,
  Shuffle,
  Sparkles,
  Trophy,
  X,
  Sigma,
  ArrowUpDown,
} from 'lucide-react'

import Header from '@/components/header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ExileDigit, ExileNumber } from '@/components/ExileGlyph'
import {
  BOARD_CONFIGS,
  BoardMode,
  MagicBoard,
  createInitialBoard,
  isAnchorCell,
  shuffleNumbers,
  validateMagicSquare,
} from '@/lib/magicSquare'

type DragPayload =
  | { source: 'bank'; value: number }
  | { source: 'cell'; value: number; row: number; col: number }

type SelectionState =
  | { source: 'bank'; value: number }
  | { source: 'cell'; value: number; row: number; col: number }
  | null

type BestTimesMap = Record<string, number>

function formatDuration(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60)
  const secs = totalSeconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export default function MagicSquareGame() {
  const [mode, setMode] = useState<BoardMode>('3x3')
  const [board, setBoard] = useState<MagicBoard>(() => createInitialBoard('3x3'))
  const [selection, setSelection] = useState<SelectionState>(null)
  const [dragOverCell, setDragOverCell] = useState<string | null>(null)
  const [dragOverBank, setDragOverBank] = useState(false)

  // Assists & hint state
  const [showCodex, setShowCodex] = useState(false)
  const [showTileNumbers, setShowTileNumbers] = useState(false)
  const [showLineSums, setShowLineSums] = useState(false)
  const [isBankShuffled, setIsBankShuffled] = useState(false)
  const [shuffledOrder, setShuffledOrder] = useState<number[]>([])
  const [usedAssistThisRun, setUsedAssistThisRun] = useState(false)

  // Timer & completion state
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [timerRunning, setTimerRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [hasWon, setHasWon] = useState(false)
  const [showRulesModal, setShowRulesModal] = useState(false)
  const [bestTimes, setBestTimes] = useState<BestTimesMap>({})

  const config = BOARD_CONFIGS[mode]

  // Load saved best times
  useEffect(() => {
    try {
      const saved = localStorage.getItem('magicSquareBestTimes')
      if (saved) {
        setBestTimes(JSON.parse(saved))
      }
    } catch {
      // Ignore storage errors
    }
  }, [])

  // Timer tick
  useEffect(() => {
    if (!timerRunning || isPaused || hasWon) return
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [timerRunning, isPaused, hasWon])

  // Compute placed numbers & validation
  const placedNumbers = useMemo(() => {
    const set = new Set<number>()
    for (const row of board) {
      for (const cell of row) {
        if (cell !== null) set.add(cell)
      }
    }
    return set
  }, [board])

  const validation = useMemo(
    () => validateMagicSquare(board, mode),
    [board, mode]
  )

  // Remaining tiles in bank
  const bankNumbers = useMemo(() => {
    const all = Array.from({ length: config.maxNumber - 1 }, (_, i) => i + 2)
    if (!isBankShuffled || shuffledOrder.length !== all.length) {
      return all.filter((n) => !placedNumbers.has(n))
    }
    return shuffledOrder.filter((n) => !placedNumbers.has(n))
  }, [config.maxNumber, isBankShuffled, shuffledOrder, placedNumbers])

  // Track if assists were turned on during a run
  const markAssistIfActive = useCallback(
    (codex: boolean, numbers: boolean, sums: boolean) => {
      if (codex || numbers || sums) {
        setUsedAssistThisRun(true)
      }
    },
    []
  )

  // Handle win detection
  useEffect(() => {
    if (validation.isSolved && !hasWon) {
      setHasWon(true)
      setTimerRunning(false)

      const assistKey = usedAssistThisRun ? 'assisted' : 'pure'
      const recordKey = `${mode}-${assistKey}`
      setBestTimes((prev) => {
        const currentBest = prev[recordKey]
        if (currentBest === undefined || elapsedSeconds < currentBest) {
          const next = { ...prev, [recordKey]: elapsedSeconds }
          try {
            localStorage.setItem('magicSquareBestTimes', JSON.stringify(next))
          } catch {
            // Ignore storage errors
          }
          return next
        }
        return prev
      })
    }
  }, [validation.isSolved, hasWon, mode, usedAssistThisRun, elapsedSeconds])

  const resetGame = useCallback(
    (nextMode: BoardMode = mode, keepShuffled = isBankShuffled) => {
      const nextConfig = BOARD_CONFIGS[nextMode]
      setMode(nextMode)
      setBoard(createInitialBoard(nextMode))
      setSelection(null)
      setElapsedSeconds(0)
      setTimerRunning(false)
      setIsPaused(false)
      setHasWon(false)
      setUsedAssistThisRun(showCodex || showTileNumbers || showLineSums)

      if (keepShuffled) {
        const pool = Array.from({ length: nextConfig.maxNumber - 1 }, (_, i) => i + 2)
        setShuffledOrder(shuffleNumbers(pool))
      } else {
        setShuffledOrder([])
      }
    },
    [mode, isBankShuffled, showCodex, showTileNumbers, showLineSums]
  )

  const handleToggleShuffle = () => {
    if (!isBankShuffled) {
      const pool = Array.from({ length: config.maxNumber - 1 }, (_, i) => i + 2)
      setShuffledOrder(shuffleNumbers(pool))
      setIsBankShuffled(true)
    } else {
      setIsBankShuffled(false)
    }
  }

  const startTimerIfNeeded = () => {
    if (!timerRunning && !hasWon) {
      setTimerRunning(true)
      setIsPaused(false)
    }
  }

  // Place a tile from bank or move/swap between cells
  const applyPlacement = (payload: DragPayload, targetRow: number, targetCol: number) => {
    if (hasWon || isPaused) return
    if (isAnchorCell(mode, targetRow, targetCol)) return

    startTimerIfNeeded()

    setBoard((prev) => {
      const next = prev.map((r) => [...r])
      const existingAtTarget = next[targetRow][targetCol]

      if (payload.source === 'bank') {
        next[targetRow][targetCol] = payload.value
        return next
      }

      // Moving from another cell
      if (payload.row === targetRow && payload.col === targetCol) {
        return prev
      }
      if (isAnchorCell(mode, payload.row, payload.col)) {
        return prev
      }

      next[targetRow][targetCol] = payload.value
      next[payload.row][payload.col] = existingAtTarget
      return next
    })

    setSelection(null)
  }

  const removeTileFromCell = (row: number, col: number) => {
    if (hasWon || isPaused) return
    if (isAnchorCell(mode, row, col)) return

    setBoard((prev) => {
      if (prev[row][col] === null) return prev
      const next = prev.map((r) => [...r])
      next[row][col] = null
      return next
    })
    setSelection(null)
  }

  // Click interactions (mobile/trackpad friendly)
  const handleBankTileClick = (value: number) => {
    if (hasWon || isPaused) return
    if (selection?.source === 'bank' && selection.value === value) {
      setSelection(null)
      return
    }
    setSelection({ source: 'bank', value })
  }

  const handleCellClick = (row: number, col: number) => {
    if (hasWon || isPaused) return
    if (isAnchorCell(mode, row, col)) return

    const cellValue = board[row][col]

    if (selection) {
      if (
        selection.source === 'cell' &&
        selection.row === row &&
        selection.col === col
      ) {
        // Clicking the already-selected cell deselects it
        setSelection(null)
        return
      }
      applyPlacement(selection, row, col)
      return
    }

    if (cellValue !== null) {
      setSelection({ source: 'cell', value: cellValue, row, col })
    }
  }

  // HTML5 Drag & Drop handlers
  const handleDragStart = (e: React.DragEvent, payload: DragPayload) => {
    if (hasWon || isPaused) {
      e.preventDefault()
      return
    }
    e.dataTransfer.setData('application/json', JSON.stringify(payload))
    e.dataTransfer.effectAllowed = 'move'
    setSelection(payload)
  }

  const handleCellDrop = (e: React.DragEvent, targetRow: number, targetCol: number) => {
    e.preventDefault()
    setDragOverCell(null)
    if (isAnchorCell(mode, targetRow, targetCol)) return

    try {
      const raw = e.dataTransfer.getData('application/json')
      if (!raw) return
      const payload = JSON.parse(raw) as DragPayload
      applyPlacement(payload, targetRow, targetCol)
    } catch {
      // Ignore invalid drag payload
    }
  }

  const handleBankDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOverBank(false)
    try {
      const raw = e.dataTransfer.getData('application/json')
      if (!raw) return
      const payload = JSON.parse(raw) as DragPayload
      if (payload.source === 'cell') {
        removeTileFromCell(payload.row, payload.col)
      }
    } catch {
      // Ignore invalid drag payload
    }
  }

  const getSumBadgeStyle = (sum: number, complete: boolean) => {
    if (!complete) {
      return 'border-zinc-800 bg-zinc-950/70 text-gray-500'
    }
    if (sum === config.magicSum) {
      return 'border-emerald-500/60 bg-emerald-950/40 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.25)]'
    }
    return 'border-red-500/60 bg-red-950/40 text-red-400'
  }

  const pureBest = bestTimes[`${mode}-pure`]
  const assistedBest = bestTimes[`${mode}-assisted`]

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <Header />

      <main className="flex-1 container mx-auto px-3 sm:px-4 py-6 max-w-6xl">
        {/* Top Navigation & Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Link href="/?season=3">
              <Button variant="outline" size="sm" className="border-red-900/50 text-gray-300 hover:bg-red-950/40 hover:text-white">
                <ArrowLeft className="w-4 h-4 mr-1.5" />
                Season 3
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono uppercase tracking-widest text-amber-400">
                  S03 // God's Test
                </span>
                <Badge variant="outline" className="border-amber-500/40 bg-amber-500/10 text-amber-300 text-[10px] font-mono">
                  Target Sum: {config.magicSum}
                </Badge>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                49 Magic Square
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Mode Toggle */}
            <div className="inline-flex rounded-lg border border-red-900/50 bg-zinc-950 p-1">
              <button
                type="button"
                onClick={() => resetGame('3x3')}
                className={`px-3 py-1.5 rounded-md text-xs font-mono transition cursor-pointer ${
                  mode === '3x3'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                3×3 Warm-Up
              </button>
              <button
                type="button"
                onClick={() => resetGame('7x7')}
                className={`px-3 py-1.5 rounded-md text-xs font-mono transition cursor-pointer ${
                  mode === '7x7'
                    ? 'bg-red-600/25 text-red-300 border border-red-500/50'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                7×7 Trial
              </button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRulesModal(true)}
              className="border-red-900/50 text-gray-300 hover:bg-red-950/40"
            >
              <HelpCircle className="w-4 h-4 mr-1.5" />
              Rules
            </Button>
          </div>
        </div>

        {/* Status & Controls Bar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-6">
          {/* Timer & Progress */}
          <div className="lg:col-span-5 flex items-center justify-between gap-3 rounded-xl border border-red-900/40 bg-zinc-950/80 px-4 py-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span className="font-mono text-lg font-bold tabular-nums">
                  {formatDuration(elapsedSeconds)}
                </span>
              </div>
              <div className="h-5 w-px bg-zinc-800" />
              <div className="text-xs font-mono text-gray-400">
                Placed:{' '}
                <span className="text-white font-semibold">
                  {validation.placedCount}/{config.maxNumber}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {timerRunning && !hasWon && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsPaused((p) => !p)}
                  className="h-8 px-2 text-gray-300 hover:text-white"
                  title={isPaused ? 'Resume' : 'Pause'}
                >
                  {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => resetGame(mode)}
                className="h-8 px-2 text-gray-300 hover:text-red-400"
                title="Reset Board"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Assists & Hints */}
          <div className="lg:col-span-7 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-900/40 bg-zinc-950/80 px-4 py-3">
            <button
              type="button"
              onClick={() => {
                const next = !showCodex
                setShowCodex(next)
                markAssistIfActive(next, showTileNumbers, showLineSums)
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono border transition cursor-pointer ${
                showCodex
                  ? 'border-amber-500/60 bg-amber-500/15 text-amber-300'
                  : 'border-zinc-800 bg-black text-gray-300 hover:border-amber-500/40'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              {showCodex ? 'Hide Cipher Key' : 'Cipher Key (0–9)'}
            </button>

            <label className="flex items-center gap-2 text-xs font-mono text-gray-300 cursor-pointer">
              <Switch
                checked={showTileNumbers}
                onCheckedChange={(checked) => {
                  setShowTileNumbers(checked)
                  markAssistIfActive(showCodex, checked, showLineSums)
                }}
              />
              {showTileNumbers ? (
                <Eye className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <EyeOff className="w-3.5 h-3.5 text-gray-500" />
              )}
              <span>Tile Numbers</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-mono text-gray-300 cursor-pointer">
              <Switch
                checked={showLineSums}
                onCheckedChange={(checked) => {
                  setShowLineSums(checked)
                  markAssistIfActive(showCodex, showTileNumbers, checked)
                }}
              />
              <Sigma className="w-3.5 h-3.5 text-purple-400" />
              <span>Line Sums</span>
            </label>
          </div>
        </div>

        {/* Collapsible 0-9 Cipher Codex Hint Drawer */}
        <AnimatePresence>
          {showCodex && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-6"
            >
              <div className="rounded-xl border border-amber-500/40 bg-gradient-to-br from-amber-950/20 via-zinc-950 to-black p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-mono uppercase tracking-wider text-amber-300">
                      Exile Language Cipher Key — Double digits place symbols side by side (0 = blank space)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowCodex(false)}
                    className="text-gray-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                  {Array.from({ length: 10 }, (_, d) => (
                    <div
                      key={d}
                      className="flex flex-col items-center justify-center rounded-lg border border-amber-900/40 bg-black/70 py-2 px-1"
                    >
                      <div className="text-amber-400 h-7 flex items-center justify-center">
                        <ExileDigit digit={d} className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-mono font-bold text-gray-200 mt-1">
                        {d}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Workspace: Board (Left) + Tile Bank (Right) */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* Magic Square Board */}
          <div className="xl:col-span-7 flex flex-col items-center">
            <div className="w-full rounded-2xl border border-red-900/40 bg-gradient-to-b from-zinc-950 to-black p-3 sm:p-6 shadow-[0_0_40px_rgba(220,38,38,0.08)] relative">
              {/* Pause Overlay */}
              {isPaused && (
                <div className="absolute inset-0 z-30 rounded-2xl bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
                  <Pause className="w-10 h-10 text-amber-400" />
                  <p className="font-mono text-sm text-gray-300">Trial Paused</p>
                  <Button
                    onClick={() => setIsPaused(false)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Resume
                  </Button>
                </div>
              )}

              {/* Board Grid + Optional Sum Headers */}
              <div className="flex flex-col items-center overflow-x-auto">
                <div
                  className="grid gap-1.5 sm:gap-2"
                  style={{
                    gridTemplateColumns: showLineSums
                      ? `repeat(${config.size}, minmax(0, 1fr)) auto`
                      : `repeat(${config.size}, minmax(0, 1fr))`,
                  }}
                >
                  {board.map((row, rIdx) => (
                    <React.Fragment key={`row-${rIdx}`}>
                      {row.map((cellValue, cIdx) => {
                        const anchor = isAnchorCell(mode, rIdx, cIdx)
                        const cellKey = `${rIdx}-${cIdx}`
                        const isSelected =
                          selection?.source === 'cell' &&
                          selection.row === rIdx &&
                          selection.col === cIdx
                        const isDragTarget = dragOverCell === cellKey && !anchor

                        const cellSizeClass =
                          mode === '3x3'
                            ? 'w-20 h-20 sm:w-24 sm:h-24'
                            : 'w-10 h-11 sm:w-14 sm:h-14 md:w-16 md:h-16'

                        return (
                          <div
                            key={cellKey}
                            draggable={!anchor && cellValue !== null && !hasWon && !isPaused}
                            onDragStart={(e) => {
                              if (cellValue !== null && !anchor) {
                                handleDragStart(e, {
                                  source: 'cell',
                                  value: cellValue,
                                  row: rIdx,
                                  col: cIdx,
                                })
                              }
                            }}
                            onDragOver={(e) => {
                              if (!anchor) {
                                e.preventDefault()
                                setDragOverCell(cellKey)
                              }
                            }}
                            onDragLeave={() => {
                              if (dragOverCell === cellKey) setDragOverCell(null)
                            }}
                            onDrop={(e) => handleCellDrop(e, rIdx, cIdx)}
                            onClick={() => handleCellClick(rIdx, cIdx)}
                            className={`group relative rounded-lg border flex flex-col items-center justify-center transition-all select-none ${cellSizeClass} ${
                              anchor
                                ? 'border-amber-500/80 bg-amber-500/15 text-amber-300 shadow-[0_0_16px_rgba(245,158,11,0.25)] cursor-not-allowed'
                                : isDragTarget
                                  ? 'border-amber-400 bg-amber-500/20 scale-[1.03]'
                                  : isSelected
                                    ? 'border-red-400 bg-red-950/50 ring-2 ring-red-500/60 cursor-pointer'
                                    : cellValue !== null
                                      ? 'border-red-900/60 bg-zinc-900/90 hover:border-amber-500/60 text-amber-400 cursor-grab active:cursor-grabbing'
                                      : selection
                                        ? 'border-zinc-700 bg-zinc-950/80 hover:border-amber-500/50 hover:bg-amber-950/20 cursor-pointer'
                                        : 'border-zinc-800/90 bg-zinc-950/60 hover:border-zinc-700'
                            }`}
                          >
                            {anchor && (
                              <Lock className="absolute top-1 right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-400/80" />
                            )}

                            {!anchor && cellValue !== null && !hasWon && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  removeTileFromCell(rIdx, cIdx)
                                }}
                                className="opacity-0 group-hover:opacity-100 focus:opacity-100 absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center transition cursor-pointer z-10"
                                title="Return tile to bank"
                              >
                                <X className="w-2.5 h-2.5" />
                              </button>
                            )}

                            {cellValue !== null ? (
                              <ExileNumber
                                value={cellValue}
                                size={mode === '3x3' ? 'lg' : 'sm'}
                                showNumberHint={showTileNumbers || anchor}
                                hintClassName={
                                  anchor ? 'text-amber-300 font-bold' : 'text-gray-400'
                                }
                              />
                            ) : (
                              <span className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
                            )}
                          </div>
                        )
                      })}

                      {/* Row Sum */}
                      {showLineSums && (
                        <div
                          className={`flex items-center justify-center rounded-md border px-2 font-mono text-xs font-semibold min-w-[42px] ${getSumBadgeStyle(
                            validation.rowSums[rIdx],
                            validation.rowComplete[rIdx]
                          )}`}
                        >
                          {validation.rowSums[rIdx]}
                        </div>
                      )}
                    </React.Fragment>
                  ))}

                  {/* Column Sums & Diagonal Sums */}
                  {showLineSums && (
                    <>
                      {validation.colSums.map((sum, cIdx) => (
                        <div
                          key={`col-sum-${cIdx}`}
                          className={`flex items-center justify-center rounded-md border py-1 font-mono text-xs font-semibold ${getSumBadgeStyle(
                            sum,
                            validation.colComplete[cIdx]
                          )}`}
                        >
                          {sum}
                        </div>
                      ))}
                      <div
                        className={`flex items-center justify-center rounded-md border px-2 py-1 font-mono text-[10px] font-semibold ${getSumBadgeStyle(
                          validation.diagMainSum,
                          validation.diagMainComplete
                        )}`}
                        title="Main diagonal (↘)"
                      >
                        ↘{validation.diagMainSum}
                      </div>
                    </>
                  )}
                </div>

                {showLineSums && (
                  <div className="mt-3 flex items-center gap-3 text-xs font-mono">
                    <span
                      className={`px-2.5 py-1 rounded-md border ${getSumBadgeStyle(
                        validation.diagMainSum,
                        validation.diagMainComplete
                      )}`}
                    >
                      Main Diag ↘: {validation.diagMainSum} / {config.magicSum}
                    </span>
                    <span
                      className={`px-2.5 py-1 rounded-md border ${getSumBadgeStyle(
                        validation.diagAntiSum,
                        validation.diagAntiComplete
                      )}`}
                    >
                      Anti Diag ↙: {validation.diagAntiSum} / {config.magicSum}
                    </span>
                  </div>
                )}
              </div>

              {/* Validation hint when full but not solved */}
              {validation.isComplete && !validation.isSolved && (
                <div className="mt-4 rounded-lg border border-red-500/50 bg-red-950/30 px-4 py-2.5 text-center text-xs sm:text-sm font-mono text-red-300">
                  All tiles placed, but not every row, column, and diagonal equals{' '}
                  <span className="font-bold text-white">{config.magicSum}</span> yet. Swap tiles to balance the square!
                </div>
              )}

              {/* Victory Banner */}
              {hasWon && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-5 rounded-xl border border-emerald-500/60 bg-gradient-to-r from-emerald-950/60 via-zinc-950 to-amber-950/40 p-4 text-center space-y-3"
                >
                  <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold text-lg">
                    <Trophy className="w-5 h-5" />
                    <span>God's Test Cleared!</span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-300 font-mono">
                    Solved {config.label} in{' '}
                    <span className="text-white font-bold">
                      {formatDuration(elapsedSeconds)}
                    </span>{' '}
                    •{' '}
                    <span className={usedAssistThisRun ? 'text-amber-300' : 'text-emerald-400'}>
                      {usedAssistThisRun ? 'Cipher Assisted' : 'Pure Exile (No Assists)'}
                    </span>
                  </p>
                  <div className="flex justify-center gap-3 flex-wrap">
                    <Button
                      size="sm"
                      onClick={() => resetGame(mode)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Play Again
                    </Button>
                    {mode === '3x3' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => resetGame('7x7')}
                        className="border-amber-500/60 text-amber-300 hover:bg-amber-500/15"
                      >
                        Challenge 7×7 God's Test
                      </Button>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Draggable Tile Bank */}
          <div className="xl:col-span-5">
            <div
              onDragOver={(e) => {
                e.preventDefault()
                setDragOverBank(true)
              }}
              onDragLeave={() => setDragOverBank(false)}
              onDrop={handleBankDrop}
              onClick={() => {
                if (selection?.source === 'cell') {
                  removeTileFromCell(selection.row, selection.col)
                }
              }}
              className={`rounded-2xl border p-4 transition ${
                dragOverBank
                  ? 'border-amber-400 bg-amber-950/20'
                  : 'border-red-900/40 bg-zinc-950/80'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-3">
                <div>
                  <h2 className="text-sm font-mono uppercase tracking-wider text-amber-300">
                    Exile Tile Bank ({bankNumbers.length} left)
                  </h2>
                  <p className="text-xs text-gray-400">
                    Drag onto cells, or click a tile then click a cell.
                  </p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleToggleShuffle()
                  }}
                  className={`border-zinc-700 text-xs font-mono cursor-pointer ${
                    isBankShuffled
                      ? 'border-amber-500/60 text-amber-300 bg-amber-500/10'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {isBankShuffled ? (
                    <>
                      <ArrowUpDown className="w-3.5 h-3.5 mr-1.5" />
                      Ordered
                    </>
                  ) : (
                    <>
                      <Shuffle className="w-3.5 h-3.5 mr-1.5" />
                      Shuffle
                    </>
                  )}
                </Button>
              </div>

              {bankNumbers.length === 0 ? (
                <div className="py-8 text-center text-xs font-mono text-gray-500 border border-dashed border-zinc-800 rounded-xl">
                  All tiles placed on the board. Drop a tile here to return it.
                </div>
              ) : (
                <div
                  className={`grid gap-2 ${
                    mode === '3x3'
                      ? 'grid-cols-4 sm:grid-cols-4'
                      : 'grid-cols-5 sm:grid-cols-7 xl:grid-cols-6'
                  }`}
                >
                  {bankNumbers.map((num) => {
                    const isSelected =
                      selection?.source === 'bank' && selection.value === num
                    return (
                      <div
                        key={num}
                        draggable={!hasWon && !isPaused}
                        onDragStart={(e) =>
                          handleDragStart(e, { source: 'bank', value: num })
                        }
                        onClick={(e) => {
                          e.stopPropagation()
                          handleBankTileClick(num)
                        }}
                        className={`rounded-lg border py-2 px-1 flex items-center justify-center transition select-none cursor-grab active:cursor-grabbing ${
                          isSelected
                            ? 'border-red-400 bg-red-950/60 ring-2 ring-red-500/60 text-amber-300 scale-[1.03]'
                            : 'border-red-900/40 bg-black/80 hover:border-amber-500/60 hover:bg-amber-950/20 text-amber-400'
                        }`}
                      >
                        <ExileNumber
                          value={num}
                          size={mode === '3x3' ? 'md' : 'sm'}
                          showNumberHint={showTileNumbers}
                        />
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Personal Best Times */}
              {(pureBest !== undefined || assistedBest !== undefined) && (
                <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs font-mono text-gray-400 flex-wrap gap-2">
                  <span>Best ({mode}):</span>
                  <div className="flex items-center gap-3">
                    {pureBest !== undefined && (
                      <span className="text-emerald-400">
                        Pure: {formatDuration(pureBest)}
                      </span>
                    )}
                    {assistedBest !== undefined && (
                      <span className="text-amber-300">
                        Assisted: {formatDuration(assistedBest)}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Rules & Lore Modal */}
      <Dialog open={showRulesModal} onOpenChange={setShowRulesModal}>
        <DialogContent className="bg-zinc-950 border-red-900/60 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl text-amber-400 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              49 Magic Square — Rules
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              The Test of the God in Exile (The Devil&apos;s Plan 3)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 text-sm text-gray-300">
            <p>
              Place every tile from <strong className="text-white">1 to 49</strong>{' '}
              (or <strong className="text-white">1 to 9</strong> in Warm-Up mode) onto the board so that{' '}
              <strong className="text-amber-300">
                every row, every column, and both main diagonals
              </strong>{' '}
              add up to the exact same sum:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm font-mono text-gray-300">
              <li>
                <span className="text-amber-400 font-bold">3×3 Warm-Up:</span>{' '}
                Numbers 1–9 • Magic Sum = <strong>15</strong> • Tile 1 locked at top-center
              </li>
              <li>
                <span className="text-red-400 font-bold">7×7 God's Test:</span>{' '}
                Numbers 1–49 • Magic Sum = <strong>175</strong> • Tile 1 locked at Row 1, Col 4
              </li>
            </ul>
            <div className="rounded-lg border border-amber-900/40 bg-black/60 p-3 text-xs text-gray-300 space-y-1">
              <p className="font-semibold text-amber-300">How to Read Exile Numerals</p>
              <p>
                Each symbol represents a digit from <strong>1 to 9</strong>, and{' '}
                <strong>0 is a blank space</strong>. Two-digit numbers place the tens and ones glyphs side by side (for example, 10 shows 1 on the left and a blank space on the right).
              </p>
            </div>
            <p className="text-xs text-gray-400">
              Tip: Toggle <strong>Cipher Key (0–9)</strong>, <strong>Tile Numbers</strong>, or{' '}
              <strong>Line Sums</strong> anytime if you want hints, or keep all three off for a{' '}
              <span className="text-emerald-400">Pure Exile</span> run.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
