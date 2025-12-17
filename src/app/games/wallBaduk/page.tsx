"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { ArrowLeft, Clock, Users, Hammer, Trophy, RotateCcw } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Header from "@/components/header"

// Game types
type Position = { row: number; col: number }
type Counter = { id: string; position: Position; color: "red" | "blue"; playerId: string }
type WallSlot = {
  row: number
  col: number
  type: "horizontal" | "vertical"
  occupied: boolean
  color?: "red" | "blue"
  playerId?: string
}
type Player = {
  id: string
  name: string
  color: "red" | "blue"
  counters: Counter[]
  wallBreakUsed: boolean
  territory: number
  pieces: number
}

const BOARD_SIZE = 7
const TURN_TIME = 90 // seconds
const PIECES_PER_PLAYER = 4

// Fixed starting positions for 2-player mode
const FIXED_POSITIONS = {
  red: [
    { row: 1, col: 1 },
    { row: 5, col: 5 },
  ],
  blue: [
    { row: 1, col: 5 },
    { row: 5, col: 1 },
  ],
}

export default function WallBadukGame() {
  // Game state
  const [gamePhase, setGamePhase] = useState<"setup" | "placement" | "playing" | "gameOver">("setup")
  const [players, setPlayers] = useState<Player[]>([])
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  const [counters, setCounters] = useState<Counter[]>([])
  const [wallSlots, setWallSlots] = useState<WallSlot[]>([])
  const [selectedCounter, setSelectedCounter] = useState<string | null>(null)
  const [validMoves, setValidMoves] = useState<Position[]>([])
  const [pendingWallPlacement, setPendingWallPlacement] = useState<Position | null>(null)
  const [timeLeft, setTimeLeft] = useState(TURN_TIME)
  const [placementOrder, setPlacementOrder] = useState<string[]>([])
  const [placementIndex, setPlacementIndex] = useState(0)
  const [showGameOver, setShowGameOver] = useState(false)
  const [winner, setWinner] = useState<Player | null>(null)

  // Initialize wall slots
  const initializeWallSlots = useCallback(() => {
    const slots: WallSlot[] = []

    // Horizontal wall slots (between rows)
    for (let row = 0; row < BOARD_SIZE - 1; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        slots.push({
          row,
          col,
          type: "horizontal",
          occupied: false,
        })
      }
    }

    // Vertical wall slots (between columns)
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE - 1; col++) {
        slots.push({
          row,
          col,
          type: "vertical",
          occupied: false,
        })
      }
    }

    return slots
  }, [])

  // Setup players with fixed starting positions
  const setupGame = () => {
    const player1: Player = {
      id: "player1",
      name: "Red Player",
      color: "red",
      counters: [],
      wallBreakUsed: false,
      territory: 0,
      pieces: PIECES_PER_PLAYER,
    }
    const player2: Player = {
      id: "player2",
      name: "Blue Player",
      color: "blue",
      counters: [],
      wallBreakUsed: false,
      territory: 0,
      pieces: PIECES_PER_PLAYER,
    }

    // Randomize play order
    const shuffled = Math.random() > 0.5 ? [player1, player2] : [player2, player1]
    setPlayers(shuffled)

    // Initialize wall slots
    setWallSlots(initializeWallSlots())

    // Place fixed starting positions
    const initialCounters: Counter[] = []

    // Red fixed positions
    FIXED_POSITIONS.red.forEach((pos, index) => {
      const counter: Counter = {
        id: `red-fixed-${index}`,
        position: pos,
        color: "red",
        playerId: "player1",
      }
      initialCounters.push(counter)
    })

    // Blue fixed positions
    FIXED_POSITIONS.blue.forEach((pos, index) => {
      const counter: Counter = {
        id: `blue-fixed-${index}`,
        position: pos,
        color: "blue",
        playerId: "player2",
      }
      initialCounters.push(counter)
    })

    setCounters(initialCounters)

    // Update players with their fixed counters
    setPlayers((prev) =>
      prev.map((p) => ({
        ...p,
        counters: initialCounters.filter((c) => c.playerId === p.id),
      })),
    )

    // Set placement order: Red, Blue, Blue, Red for remaining pieces
    setPlacementOrder(["player1", "player2", "player2", "player1"])
    setPlacementIndex(0)
    setGamePhase("placement")
    setCurrentPlayerIndex(0)
  }

  // Check if there's a wall blocking movement between two adjacent positions
  const isWallBlocking = useCallback(
    (from: Position, to: Position): boolean => {
      const dx = to.col - from.col
      const dy = to.row - from.row

      // Check for walls that would block this movement
      if (dx === 1) {
        // Moving right - check vertical wall slot
        return wallSlots.some(
          (slot) => slot.type === "vertical" && slot.occupied && slot.row === from.row && slot.col === from.col,
        )
      } else if (dx === -1) {
        // Moving left - check vertical wall slot
        return wallSlots.some(
          (slot) => slot.type === "vertical" && slot.occupied && slot.row === from.row && slot.col === to.col,
        )
      } else if (dy === 1) {
        // Moving down - check horizontal wall slot
        return wallSlots.some(
          (slot) => slot.type === "horizontal" && slot.occupied && slot.row === from.row && slot.col === from.col,
        )
      } else if (dy === -1) {
        // Moving up - check horizontal wall slot
        return wallSlots.some(
          (slot) => slot.type === "horizontal" && slot.occupied && slot.row === to.row && slot.col === from.col,
        )
      }

      return false
    },
    [wallSlots],
  )

  // Check if position is valid for movement
  const isValidMove = useCallback(
    (from: Position, to: Position): boolean => {
      const dx = Math.abs(to.col - from.col)
      const dy = Math.abs(to.row - from.row)

      // Must move 0, 1, or 2 spaces in cardinal directions only
      if (!((dx === 0 && dy <= 2) || (dy === 0 && dx <= 2))) {
        return false
      }

      // Check if destination is occupied
      if (counters.some((c) => c.position.row === to.row && c.position.col === to.col)) {
        return false
      }

      // Check path for walls and pieces
      const stepX = dx === 0 ? 0 : (to.col - from.col) / dx
      const stepY = dy === 0 ? 0 : (to.row - from.row) / dy

      let currentPos = { ...from }

      // Check each step of the path
      for (let step = 1; step <= Math.max(dx, dy); step++) {
        const nextPos = {
          row: from.row + stepY * step,
          col: from.col + stepX * step,
        }

        // Check if wall blocks movement from current to next position
        if (isWallBlocking(currentPos, nextPos)) {
          return false
        }

        // Check if next position is occupied (except destination which we already checked)
        if (
          step < Math.max(dx, dy) &&
          counters.some((c) => c.position.row === nextPos.row && c.position.col === nextPos.col)
        ) {
          return false
        }

        currentPos = nextPos
      }

      return true
    },
    [counters, isWallBlocking],
  )

  // Get valid moves for a counter (including staying in place)
  const getValidMoves = useCallback(
    (counter: Counter): Position[] => {
      const moves: Position[] = []

      // Add current position (0 movement)
      moves.push(counter.position)

      const directions = [
        { dr: -1, dc: 0 }, // up
        { dr: 1, dc: 0 }, // down
        { dr: 0, dc: -1 }, // left
        { dr: 0, dc: 1 }, // right
      ]

      for (const dir of directions) {
        for (let dist = 1; dist <= 2; dist++) {
          const newRow = counter.position.row + dir.dr * dist
          const newCol = counter.position.col + dir.dc * dist

          if (newRow >= 0 && newRow < BOARD_SIZE && newCol >= 0 && newCol < BOARD_SIZE) {
            const newPos = { row: newRow, col: newCol }
            if (isValidMove(counter.position, newPos)) {
              moves.push(newPos)
            }
          }
        }
      }

      return moves
    },
    [isValidMove],
  )

  // Get available wall slots around a position
  const getAvailableWallSlots = useCallback(
    (position: Position) => {
      const availableSlots: WallSlot[] = []

      // Top horizontal slot
      if (position.row > 0) {
        const slot = wallSlots.find(
          (s) => s.type === "horizontal" && s.row === position.row - 1 && s.col === position.col,
        )
        if (slot && !slot.occupied) {
          availableSlots.push(slot)
        }
      }

      // Bottom horizontal slot
      if (position.row < BOARD_SIZE - 1) {
        const slot = wallSlots.find((s) => s.type === "horizontal" && s.row === position.row && s.col === position.col)
        if (slot && !slot.occupied) {
          availableSlots.push(slot)
        }
      }

      // Left vertical slot
      if (position.col > 0) {
        const slot = wallSlots.find(
          (s) => s.type === "vertical" && s.row === position.row && s.col === position.col - 1,
        )
        if (slot && !slot.occupied) {
          availableSlots.push(slot)
        }
      }

      // Right vertical slot
      if (position.col < BOARD_SIZE - 1) {
        const slot = wallSlots.find((s) => s.type === "vertical" && s.row === position.row && s.col === position.col)
        if (slot && !slot.occupied) {
          availableSlots.push(slot)
        }
      }

      return availableSlots
    },
    [wallSlots],
  )

  // Handle counter selection
  const handleCounterClick = (counterId: string) => {
    if (gamePhase !== "playing") return

    const counter = counters.find((c) => c.id === counterId)
    if (!counter || counter.playerId !== players[currentPlayerIndex].id) return

    if (selectedCounter === counterId) {
      setSelectedCounter(null)
      setValidMoves([])
    } else {
      setSelectedCounter(counterId)
      setValidMoves(getValidMoves(counter))
    }
  }

  // Handle counter movement
  const handleMove = (to: Position) => {
    if (!selectedCounter) return

    const counter = counters.find((c) => c.id === selectedCounter)
    if (!counter) return

    // Move counter
    setCounters((prev) => prev.map((c) => (c.id === selectedCounter ? { ...c, position: to } : c)))

    setSelectedCounter(null)
    setValidMoves([])
    setPendingWallPlacement(to)
  }

  // Handle wall slot placement
  const handleWallSlotClick = (slotRow: number, slotCol: number, slotType: "horizontal" | "vertical") => {
    if (!pendingWallPlacement) return

    const currentPlayer = players[currentPlayerIndex]

    // Find the wall slot
    const slot = wallSlots.find((s) => s.row === slotRow && s.col === slotCol && s.type === slotType)

    if (!slot || slot.occupied) return

    // Place wall in the slot
    setWallSlots((prev) =>
      prev.map((s) =>
        s.row === slotRow && s.col === slotCol && s.type === slotType
          ? { ...s, occupied: true, color: currentPlayer.color, playerId: currentPlayer.id }
          : s,
      ),
    )

    setPendingWallPlacement(null)

    // Next player's turn
    setCurrentPlayerIndex((prev) => (prev + 1) % players.length)
    setTimeLeft(TURN_TIME)
  }

  // Handle counter placement during setup
  const handleCounterPlacement = (position: Position) => {
    if (gamePhase !== "placement") return

    // Check if position is occupied
    if (counters.some((c) => c.position.row === position.row && c.position.col === position.col)) {
      return
    }

    const currentPlayerId = placementOrder[placementIndex]
    const currentPlayer = players.find((p) => p.id === currentPlayerId)!
    const counterId = `${currentPlayer.color}-placement-${placementIndex}`

    const newCounter: Counter = {
      id: counterId,
      position,
      color: currentPlayer.color,
      playerId: currentPlayer.id,
    }

    setCounters((prev) => [...prev, newCounter])

    // Update player's counters
    setPlayers((prev) =>
      prev.map((p) => (p.id === currentPlayer.id ? { ...p, counters: [...p.counters, newCounter] } : p)),
    )

    // Move to next in placement order
    if (placementIndex >= placementOrder.length - 1) {
      setGamePhase("playing")
      setCurrentPlayerIndex(0)
      setTimeLeft(TURN_TIME)
    } else {
      setPlacementIndex((prev) => prev + 1)
      const nextPlayerId = placementOrder[placementIndex + 1]
      const nextPlayerIndex = players.findIndex((p) => p.id === nextPlayerId)
      setCurrentPlayerIndex(nextPlayerIndex)
    }
  }

  // Calculate territory using flood fill algorithm
  const calculateTerritory = useCallback(
    (playerId: string): number => {
      const playerColor = players.find((p) => p.id === playerId)?.color
      if (!playerColor) return 0

      const visited = new Set<string>()
      let totalTerritory = 0

      // Flood fill function to find enclosed areas
      const floodFill = (startRow: number, startCol: number): number => {
        const stack = [{ row: startRow, col: startCol }]
        const territory = new Set<string>()
        let isEnclosed = true
        let containsOnlyPlayerPieces = true

        while (stack.length > 0) {
          const { row, col } = stack.pop()!
          const key = `${row},${col}`

          if (visited.has(key) || row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE) {
            continue
          }

          // Check if there's a piece here
          const piece = counters.find((c) => c.position.row === row && c.position.col === col)
          if (piece) {
            if (piece.color !== playerColor) {
              containsOnlyPlayerPieces = false
            }
            continue
          }

          visited.add(key)
          territory.add(key)

          // Check all four directions
          const directions = [
            { dr: -1, dc: 0 }, // up
            { dr: 1, dc: 0 }, // down
            { dr: 0, dc: -1 }, // left
            { dr: 0, dc: 1 }, // right
          ]

          for (const { dr, dc } of directions) {
            const newRow = row + dr
            const newCol = col + dc
            const newPos = { row: newRow, col: newCol }
            const currentPos = { row, col }

            // Check if movement is blocked by wall
            if (!isWallBlocking(currentPos, newPos)) {
              if (newRow >= 0 && newRow < BOARD_SIZE && newCol >= 0 && newCol < BOARD_SIZE) {
                stack.push({ row: newRow, col: newCol })
              } else {
                isEnclosed = false // Reached board edge
              }
            }
          }
        }

        return isEnclosed && containsOnlyPlayerPieces ? territory.size : 0
      }

      // Check each empty square
      for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
          const key = `${row},${col}`
          if (!visited.has(key) && !counters.some((c) => c.position.row === row && c.position.col === col)) {
            totalTerritory += floodFill(row, col)
          }
        }
      }

      return totalTerritory
    },
    [counters, players, isWallBlocking],
  )

  // Check if game should end (all pieces in separate territories)
  const checkGameEnd = useCallback(() => {
    // Check if any piece can still move
    const canAnyPieceMove = counters.some((counter) => {
      const moves = getValidMoves(counter)
      return moves.length > 1 // More than just staying in place
    })

    if (!canAnyPieceMove) {
      // Calculate final territories
      const finalPlayers = players.map((p) => ({
        ...p,
        territory: calculateTerritory(p.id),
      }))

      const sortedPlayers = [...finalPlayers].sort((a, b) => b.territory - a.territory)
      setWinner(sortedPlayers[0])
      setPlayers(finalPlayers)
      setGamePhase("gameOver")
      setShowGameOver(true)
    }
  }, [counters, players, getValidMoves, calculateTerritory])

  // Timer effect
  useEffect(() => {
    if (gamePhase !== "playing") return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Time's up - place random wall
          if (pendingWallPlacement) {
            const availableSlots = getAvailableWallSlots(pendingWallPlacement)
            if (availableSlots.length > 0) {
              const randomSlot = availableSlots[Math.floor(Math.random() * availableSlots.length)]
              handleWallSlotClick(randomSlot.row, randomSlot.col, randomSlot.type)
            }
          }
          return TURN_TIME
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gamePhase, pendingWallPlacement, getAvailableWallSlots])

  // Check for game end
  useEffect(() => {
    if (gamePhase === "playing") {
      checkGameEnd()
    }
  }, [gamePhase, checkGameEnd])

  // Reset game
  const resetGame = () => {
    setGamePhase("setup")
    setPlayers([])
    setCounters([])
    setWallSlots([])
    setSelectedCounter(null)
    setValidMoves([])
    setPendingWallPlacement(null)
    setCurrentPlayerIndex(0)
    setTimeLeft(TURN_TIME)
    setPlacementIndex(0)
    setShowGameOver(false)
    setWinner(null)
  }

  // Convert row index to display number (7 at top, 1 at bottom)
  const getRowLabel = (rowIndex: number) => BOARD_SIZE - rowIndex

  // Convert column index to letter
  const getColLabel = (colIndex: number) => String.fromCharCode(65 + colIndex) // A, B, C, etc.

  // Render the board with integrated wall slots
  const renderBoard = () => {
    const boardElements = []

    // Column headers
    const colHeaders = []
    colHeaders.push(<div key="corner" className="w-16 h-8" />) // Corner space
    for (let col = 0; col < BOARD_SIZE; col++) {
      colHeaders.push(
        <div
          key={`col-header-${col}`}
          className="w-16 h-8 flex items-center justify-center text-gray-400 text-sm font-mono"
        >
          {getColLabel(col)}
        </div>,
      )
      if (col < BOARD_SIZE - 1) {
        colHeaders.push(<div key={`col-spacer-${col}`} className="w-4 h-8" />)
      }
    }
    boardElements.push(
      <div key="col-headers" className="flex">
        {colHeaders}
      </div>,
    )

    for (let row = 0; row < BOARD_SIZE; row++) {
      // Render row of squares and vertical wall slots
      const rowElements = []

      // Row label
      rowElements.push(
        <div
          key={`row-label-${row}`}
          className="w-16 h-16 flex items-center justify-center text-gray-400 text-sm font-mono"
        >
          {getRowLabel(row)}
        </div>,
      )

      for (let col = 0; col < BOARD_SIZE; col++) {
        // Render game square
        const position = { row, col }
        const counter = counters.find((c) => c.position.row === row && c.position.col === col)
        const isValidMove = validMoves.some((m) => m.row === row && m.col === col)
        const isPendingWall = pendingWallPlacement?.row === row && pendingWallPlacement?.col === col

        rowElements.push(
          <div
            key={`square-${row}-${col}`}
            className={`w-16 h-16 rounded-lg cursor-pointer transition-all duration-200 flex items-center justify-center border-2 ${
              isValidMove
                ? "bg-emerald-600 border-emerald-500"
                : isPendingWall
                  ? "bg-emerald-600 border-emerald-500"
                  : "bg-gray-700 border-gray-600 hover:bg-gray-600"
            }`}
            onClick={() => {
              if (gamePhase === "placement") {
                handleCounterPlacement(position)
              } else if (isValidMove) {
                handleMove(position)
              }
            }}
          >
            {/* Counter */}
            {counter && (
              <div
                className={`w-12 h-12 rounded-full cursor-pointer transition-all duration-200 ${
                  counter.color === "red" ? "bg-red-400" : "bg-blue-400"
                } ${selectedCounter === counter.id ? "ring-2 ring-white scale-110" : "hover:scale-105"}`}
                onClick={(e) => {
                  e.stopPropagation()
                  handleCounterClick(counter.id)
                }}
              />
            )}
          </div>,
        )

        // Render vertical wall slot (except after last column)
        if (col < BOARD_SIZE - 1) {
          const vSlot = wallSlots.find((s) => s.type === "vertical" && s.row === row && s.col === col)
          const isAvailableForPlacement =
            pendingWallPlacement &&
            getAvailableWallSlots(pendingWallPlacement).some(
              (s) => s.row === row && s.col === col && s.type === "vertical",
            )

          rowElements.push(
            <div
              key={`vwall-${row}-${col}`}
              className={`w-4 h-16 cursor-pointer transition-all duration-200 rounded-sm flex items-center justify-center ${
                vSlot?.occupied
                  ? vSlot.color === "red"
                    ? "bg-red-400"
                    : "bg-blue-400"
                  : isAvailableForPlacement
                    ? "bg-gray-500 hover:bg-gray-400"
                    : "bg-transparent hover:bg-gray-600"
              }`}
              onClick={() => {
                if (isAvailableForPlacement) {
                  handleWallSlotClick(row, col, "vertical")
                }
              }}
            >
              {vSlot?.occupied && (
                <div className={`w-2 h-12 rounded-sm ${vSlot.color === "red" ? "bg-red-500" : "bg-blue-500"}`} />
              )}
            </div>,
          )
        }
      }

      boardElements.push(
        <div key={`row-${row}`} className="flex">
          {rowElements}
        </div>,
      )

      // Render horizontal wall slots (except after last row)
      if (row < BOARD_SIZE - 1) {
        const hRowElements = []

        // Empty space for row label
        hRowElements.push(<div key="row-spacer" className="w-16 h-4" />)

        for (let col = 0; col < BOARD_SIZE; col++) {
          const hSlot = wallSlots.find((s) => s.type === "horizontal" && s.row === row && s.col === col)
          const isAvailableForPlacement =
            pendingWallPlacement &&
            getAvailableWallSlots(pendingWallPlacement).some(
              (s) => s.row === row && s.col === col && s.type === "horizontal",
            )

          hRowElements.push(
            <div
              key={`hwall-${row}-${col}`}
              className={`w-16 h-4 cursor-pointer transition-all duration-200 rounded-sm flex items-center justify-center ${
                hSlot?.occupied
                  ? hSlot.color === "red"
                    ? "bg-red-400"
                    : "bg-blue-400"
                  : isAvailableForPlacement
                    ? "bg-gray-500 hover:bg-gray-400"
                    : "bg-transparent hover:bg-gray-600"
              }`}
              onClick={() => {
                if (isAvailableForPlacement) {
                  handleWallSlotClick(row, col, "horizontal")
                }
              }}
            >
              {hSlot?.occupied && (
                <div className={`w-12 h-2 rounded-sm ${hSlot.color === "red" ? "bg-red-500" : "bg-blue-500"}`} />
              )}
            </div>,
          )

          // Add spacer for vertical wall slots (except after last column)
          if (col < BOARD_SIZE - 1) {
            hRowElements.push(<div key={`spacer-${row}-${col}`} className="w-4 h-4" />)
          }
        }

        boardElements.push(
          <div key={`hrow-${row}`} className="flex">
            {hRowElements}
          </div>,
        )
      }
    }

    return boardElements
  }

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <Header />

      {/* Game Over Dialog */}
      <Dialog open={showGameOver} onOpenChange={setShowGameOver}>
        <DialogContent className="bg-gray-900 border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">Game Over!</DialogTitle>
          </DialogHeader>
          <div className="text-center py-4">
            {winner && (
              <div>
                <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-yellow-500 mb-2">{winner.name} Wins!</h3>
                <p className="text-gray-300">Territory: {winner.territory} squares</p>
                <div className="mt-4 space-y-2">
                  {players
                    .sort((a, b) => b.territory - a.territory)
                    .map((player, index) => (
                      <div key={player.id} className="flex justify-between items-center">
                        <span>
                          #{index + 1} {player.name}
                        </span>
                        <span>{player.territory} squares</span>
                      </div>
                    ))}
                </div>
              </div>
            )}
            <Button onClick={resetGame} className="mt-4 bg-blue-600 hover:bg-blue-700">
              Play Again
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <main className="flex-1 container mx-auto px-4 py-12">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <Link href="/" className="group text-gray-400 hover:text-red-400 flex items-center gap-2 transition-colors">
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> 
            <span className="font-mono text-sm">RETURN TO ARENA</span>
          </Link>
        </motion.div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">
            <span className="text-red-500">Wall Baduk</span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Strategic territorial game where players move pieces and build coloured walls to enclose the largest territory
          </p>
        </div>

        {gamePhase === "setup" && (
          <div className="max-w-md mx-auto">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>Wall Baduk</CardTitle>
                <CardDescription>Build walls to create territories containing only your pieces</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm text-gray-300">
                    <h4 className="font-bold mb-2">Rules:</h4>
                    <ul className="space-y-1 text-xs">
                      <li>• 7×7 board, 4 pieces per player</li>
                      <li>• Fixed starting positions + 2 placement rounds</li>
                      <li>• Move 0, 1, or 2 spaces (cardinal directions)</li>
                      <li>• Cannot cross walls or pieces</li>
                      <li>• Must place colored wall after each move</li>
                      <li>• Goal: Largest enclosed territory wins</li>
                      <li>• 90 seconds per turn</li>
                    </ul>
                  </div>
                  <Button onClick={setupGame} className="w-full bg-red-600 hover:bg-red-700">
                    Start Game
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {(gamePhase === "placement" || gamePhase === "playing") && (
          <div className="max-w-6xl mx-auto">
            {/* Game Status */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="border-blue-500 text-blue-400">
                  <Users className="w-4 h-4 mr-1" />
                  {gamePhase === "placement" ? "Placement Phase" : "Playing"}
                </Badge>
                {gamePhase === "playing" && (
                  <Badge variant="outline" className="border-green-500 text-green-400">
                    <Clock className="w-4 h-4 mr-1" />
                    {timeLeft}s
                  </Badge>
                )}
              </div>
              <Button onClick={resetGame} variant="outline" size="sm">
                <RotateCcw className="w-4 h-4 mr-1" />
                Reset
              </Button>
            </div>

            {/* Current Player */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold">
                {gamePhase === "placement"
                  ? `${players.find((p) => p.id === placementOrder[placementIndex])?.name} - Place piece ${placementIndex + 1}/4`
                  : `${players[currentPlayerIndex]?.name}'s Turn`}
              </h2>
              {pendingWallPlacement && (
                <p className="text-yellow-400 mt-2">
                  Click on a highlighted wall slot to place a {players[currentPlayerIndex]?.color} wall
                </p>
              )}
              {selectedCounter && (
                <p className="text-green-400 mt-2">
                  Click on a highlighted square to move (including staying in place)
                </p>
              )}
            </div>

            {/* Game Board */}
            <div className="flex justify-center mb-6">
              <div className="bg-gray-900 p-6 rounded-xl">{renderBoard()}</div>
            </div>

            {/* Player Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {players.map((player, index) => (
                <Card
                  key={player.id}
                  className={`bg-gray-800 border-gray-600 ${
                    (gamePhase === "playing" && currentPlayerIndex === index) ||
                    (gamePhase === "placement" && player.id === placementOrder[placementIndex])
                      ? "ring-2 ring-yellow-400 bg-gray-700"
                      : ""
                  }`}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between text-white">
                      <span className="flex items-center gap-2">
                        <div
                          className={`w-5 h-5 rounded-full ${player.color === "red" ? "bg-red-400" : "bg-blue-400"}`}
                        />
                        {player.name}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm space-y-1 text-gray-200">
                      <div>
                        Pieces:{" "}
                        <span className="text-white font-semibold">
                          {player.counters.length}/{PIECES_PER_PLAYER}
                        </span>
                      </div>
                      <div>
                        Territory:{" "}
                        <span className="text-white font-semibold">{calculateTerritory(player.id)} squares</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}