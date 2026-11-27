export type BoardMode = '3x3' | '7x7'

export interface BoardConfig {
  mode: BoardMode
  size: number
  maxNumber: number
  magicSum: number
  anchorRow: number
  anchorCol: number
  label: string
}

export const BOARD_CONFIGS: Record<BoardMode, BoardConfig> = {
  '3x3': {
    mode: '3x3',
    size: 3,
    maxNumber: 9,
    magicSum: 15,
    anchorRow: 0,
    anchorCol: 1,
    label: '3×3 Warm-Up (1–9)',
  },
  '7x7': {
    mode: '7x7',
    size: 7,
    maxNumber: 49,
    magicSum: 175,
    anchorRow: 0,
    anchorCol: 3,
    label: "7×7 God's Test (1–49)",
  },
}

export type MagicBoard = (number | null)[][]

export function createInitialBoard(mode: BoardMode): MagicBoard {
  const { size, anchorRow, anchorCol } = BOARD_CONFIGS[mode]
  const board: MagicBoard = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => null)
  )
  board[anchorRow][anchorCol] = 1
  return board
}

export function isAnchorCell(mode: BoardMode, row: number, col: number): boolean {
  const { anchorRow, anchorCol } = BOARD_CONFIGS[mode]
  return row === anchorRow && col === anchorCol
}

export interface MagicValidationResult {
  placedCount: number
  isComplete: boolean
  isSolved: boolean
  hasUniqueValues: boolean
  rowSums: number[]
  colSums: number[]
  rowComplete: boolean[]
  colComplete: boolean[]
  diagMainSum: number
  diagAntiSum: number
  diagMainComplete: boolean
  diagAntiComplete: boolean
}

export function validateMagicSquare(
  board: MagicBoard,
  mode: BoardMode
): MagicValidationResult {
  const { size, maxNumber, magicSum, anchorRow, anchorCol } = BOARD_CONFIGS[mode]

  const seen = new Set<number>()
  let placedCount = 0
  let hasDuplicatesOrOutOfRange = false

  const rowSums = Array(size).fill(0)
  const colSums = Array(size).fill(0)
  const rowComplete = Array(size).fill(true)
  const colComplete = Array(size).fill(true)

  let diagMainSum = 0
  let diagAntiSum = 0
  let diagMainComplete = true
  let diagAntiComplete = true

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const val = board[r]?.[c] ?? null
      if (val === null) {
        rowComplete[r] = false
        colComplete[c] = false
        if (r === c) diagMainComplete = false
        if (r + c === size - 1) diagAntiComplete = false
        continue
      }

      placedCount++
      if (val < 1 || val > maxNumber || seen.has(val)) {
        hasDuplicatesOrOutOfRange = true
      }
      seen.add(val)

      rowSums[r] += val
      colSums[c] += val
      if (r === c) diagMainSum += val
      if (r + c === size - 1) diagAntiSum += val
    }
  }

  const isComplete = placedCount === size * size
  const hasUniqueValues = !hasDuplicatesOrOutOfRange && seen.size === placedCount
  const anchorValid = board[anchorRow]?.[anchorCol] === 1

  const rowsValid = rowComplete.every((done, i) => done && rowSums[i] === magicSum)
  const colsValid = colComplete.every((done, i) => done && colSums[i] === magicSum)
  const diagsValid =
    diagMainComplete &&
    diagAntiComplete &&
    diagMainSum === magicSum &&
    diagAntiSum === magicSum

  const isSolved =
    isComplete &&
    hasUniqueValues &&
    anchorValid &&
    rowsValid &&
    colsValid &&
    diagsValid

  return {
    placedCount,
    isComplete,
    isSolved,
    hasUniqueValues,
    rowSums,
    colSums,
    rowComplete,
    colComplete,
    diagMainSum,
    diagAntiSum,
    diagMainComplete,
    diagAntiComplete,
  }
}

export function shuffleNumbers(nums: number[]): number[] {
  const arr = [...nums]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}
