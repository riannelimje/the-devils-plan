'use client'

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, CastleIcon as ChessKnight, EyeIcon, EyeOff, BrainCircuit, Crown, Target, Trophy, AlertTriangle, Lock, Clock, Play, Pause } from 'lucide-react'
import { motion } from 'framer-motion'

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import Header from "@/components/header"

const KNIGHT_MOVES = [
  [2, 1], [1, 2], [-1, 2], [-2, 1],
  [-2, -1], [-1, -2], [1, -2], [2, -1]
]

export default function KnightsTourGame() {
  const [boardSize, setBoardSize] = useState(5)
  const [knightPos, setKnightPos] = useState<[number, number]>([0, 0])
  const [visited, setVisited] = useState<Set<string>>(new Set(["0,0"]))
  const [path, setPath] = useState<[number, number][]>([[0, 0]])
  const [showInvalidMove, setShowInvalidMove] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [gameResult, setGameResult] = useState("")
  const [blindMode, setBlindMode] = useState(false)
  const [showBlindModeQuiz, setShowBlindModeQuiz] = useState(false)
  const [quizAnswer, setQuizAnswer] = useState("")
  const [quizError, setQuizError] = useState("")
  const [timerRunning, setTimerRunning] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)
  
  const isComplete = visited.size === boardSize * boardSize

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (timerRunning && !isComplete) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 0.01)
      }, 10)
    }

    // Auto-stop when puzzle is complete
    if (isComplete && timerRunning) {
      setTimerRunning(false)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [timerRunning, isComplete])

  function handleSquareClick(row: number, col: number) {
    // Don't allow moves if game is over
    if (gameOver) return

    const [kx, ky] = knightPos
    const dx = row - kx
    const dy = col - ky
    const key = `${row},${col}`

    const isLegalMove = KNIGHT_MOVES.some(([mx, my]) => mx === dx && my === dy)
    
    // Handle Blind Mode specific logic
    if (blindMode) {
      if (!isLegalMove || visited.has(key)) {
        setGameOver(true)
        setGameResult("Game Over! Invalid move in Blind Mode.")
        return
      }
      
      // Auto-start timer on first move
      if (path.length === 1 && !timerRunning) {
        setTimerRunning(true)
      }
      
      // Move is valid, update state
      const newVisited = new Set(visited)
      newVisited.add(key)
      setVisited(newVisited)
      setPath([...path, [row, col]])
      setKnightPos([row, col])
      
      // Check if the game is complete
      if (newVisited.size === boardSize * boardSize) {
        setGameOver(true)
        setGameResult("Congratulations! You completed the Knight's Tour in Blind Mode!")
        return
      }
      
      // Check if there are any valid moves left
      const hasValidMovesLeft = KNIGHT_MOVES.some(([mx, my]) => {
        const newRow = row + mx
        const newCol = col + my
        return (
          newRow >= 0 && newRow < boardSize &&
          newCol >= 0 && newCol < boardSize &&
          !newVisited.has(`${newRow},${newCol}`)
        )
      })
      
      if (!hasValidMovesLeft) {
        setGameOver(true)
        setGameResult("Game Over! No valid moves remaining in Blind Mode.")
      }
    } else {
      // Regular mode logic
      if (isLegalMove && !visited.has(key)) {
        // Auto-start timer on first move
        if (path.length === 1 && !timerRunning) {
          setTimerRunning(true)
        }
        
        const newVisited = new Set(visited)
        newVisited.add(key)
        setVisited(newVisited)
        setPath([...path, [row, col]])
        setKnightPos([row, col])
        setShowInvalidMove(false)
      } else {
        setShowInvalidMove(true)
      }
    }
  }

  function resetGame(newSize = boardSize) {
    setBoardSize(newSize)
    setKnightPos([0, 0])
    setVisited(new Set(["0,0"]))
    setPath([[0, 0]])
    setShowInvalidMove(false)
    setGameOver(false)
    setGameResult("")
    setTimerRunning(false)
    setElapsedTime(0)
  }

  function formatTime(seconds: number) {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    const centisecs = Math.floor((seconds % 1) * 100)
    return `${mins}:${secs.toString().padStart(2, '0')}.${centisecs.toString().padStart(2, '0')}`
  }

  function handleSizeChange(value: string) {
    const newSize = parseInt(value)
    resetGame(newSize)
  }

  function toggleBlindMode() {
    if (!blindMode) {
      // Opening the quiz modal when trying to enable blind mode
      setShowBlindModeQuiz(true)
      setQuizAnswer("")
      setQuizError("")
    } else {
      // Turning blind mode off doesn't require the quiz
      setBlindMode(false)
      resetGame(boardSize)
    }
  }
  
  function handleQuizSubmit() {
    const correctAnswer = "tomorrow";
    if (quizAnswer.toLowerCase() === correctAnswer) {
      setBlindMode(true)
      setShowBlindModeQuiz(false)
      resetGame(boardSize)
    } else {
      setQuizError("Try again!")
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-black text-white relative overflow-hidden">
      {/* Scanline overlay */}
      <div className="fixed inset-0 pointer-events-none z-10 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-500/10 to-transparent" 
             style={{ animation: 'scan 8s linear infinite' }} />
      </div>

      <Header />

      <main className="flex-1 container mx-auto px-4 py-12 relative z-20">
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

        <div className="grid grid-cols-1 gap-8">
          <div>
            {/* Header Card with Glowing Border */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative group mb-8"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-red-800 rounded-xl opacity-40 group-hover:opacity-60 blur transition duration-1000" />
              <div className="relative bg-gradient-to-br from-red-950/30 via-black to-black rounded-xl overflow-hidden border border-red-900/50">
                <div className="relative h-64 w-full flex items-center justify-center bg-black/40 backdrop-blur-sm">
                  {/* Status indicator */}
                  <div className="absolute top-4 right-4 flex items-center gap-2">
                    <motion.div
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-2 h-2 bg-red-500 rounded-full"
                    />
                    <span className="text-xs font-mono text-red-500">CHALLENGE ACTIVE</span>
                  </div>

                  <div className="relative">
                    <Image
                      src="/images/game1.png"
                      alt="The Knight's Tour"
                      width={300}
                      height={300}
                      className="object-contain"
                    />
                    <motion.div
                      className="absolute inset-0 bg-red-500/10"
                      animate={{
                        opacity: [0, 0.3, 0],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            <Tabs defaultValue="play" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-black/60 border border-red-900/30 backdrop-blur-sm">
                <TabsTrigger 
                  value="play" 
                  className="text-gray-400 data-[state=active]:text-red-400 data-[state=active]:bg-red-950/50 font-mono"
                >
                  <Target className="w-4 h-4 mr-2" />
                  PLAY
                </TabsTrigger>
                <TabsTrigger 
                  value="rules" 
                  className="text-gray-400 data-[state=active]:text-red-400 data-[state=active]:bg-red-950/50 font-mono"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  RULES
                </TabsTrigger>
              </TabsList>
              <TabsContent value="play" className="mt-4">
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative group"
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600/30 to-red-800/30 rounded-xl opacity-50 blur" />
                  <div className="relative bg-gradient-to-br from-red-950/20 via-black to-black rounded-xl p-8 border border-red-900/50 backdrop-blur-sm">
                    <div className="text-center">
                      <motion.h3 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-3xl font-bold mb-2 bg-gradient-to-r from-red-500 to-red-300 bg-clip-text text-transparent"
                      >
                        THE KNIGHT&apos;S TOUR
                      </motion.h3>
                      <div className="h-0.5 w-32 mx-auto bg-gradient-to-r from-transparent via-red-500 to-transparent mb-6" />
                      
                      <p className="text-gray-400 mb-8 font-mono text-sm">
                        {"// Navigate the board. Visit every square once. Fail and the mission ends."}
                      </p>

                      {/* Stats Display */}
                      <div className="flex justify-center gap-4 mb-8 flex-wrap">
                        <div className="bg-black/40 border border-red-900/30 rounded-lg px-4 py-2">
                          <div className="text-xs text-gray-500 font-mono">MOVES</div>
                          <div className="text-xl font-bold text-red-400">{path.length}</div>
                        </div>
                        <div className="bg-black/40 border border-red-900/30 rounded-lg px-4 py-2">
                          <div className="text-xs text-gray-500 font-mono">REMAINING</div>
                          <div className="text-xl font-bold text-red-400">{boardSize * boardSize - visited.size}</div>
                        </div>
                        <div className="bg-black/40 border border-red-900/30 rounded-lg px-4 py-2">
                          <div className="text-xs text-gray-500 font-mono">PROGRESS</div>
                          <div className="text-xl font-bold text-red-400">
                            {Math.floor((visited.size / (boardSize * boardSize)) * 100)}%
                          </div>
                        </div>
                        <div className="bg-black/40 border border-red-900/30 rounded-lg px-4 py-2 min-w-[140px]">
                          <div className="text-xs text-gray-500 font-mono flex items-center justify-between mb-1">
                            <span>TIME</span>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => setTimerRunning(!timerRunning)}
                              disabled={isComplete}
                              className="disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {timerRunning ? (
                                <Pause className="w-3 h-3 text-red-400" />
                              ) : (
                                <Play className="w-3 h-3 text-red-400" />
                              )}
                            </motion.button>
                          </div>
                          <div className="text-xl font-bold text-red-400 font-mono">
                            {formatTime(elapsedTime)}
                          </div>
                        </div>
                      </div>

                      {/* Game controls */}
                      <div className="flex flex-col items-center max-w-md mx-auto mb-8 space-y-4">
                        <div className="w-full">
                          <label className="text-xs font-mono text-gray-500 mb-2 block">BOARD SIZE</label>
                          <Select onValueChange={handleSizeChange} defaultValue={boardSize.toString()}>
                            <SelectTrigger className="w-full bg-black/40 border-red-900/50 text-red-400 font-mono hover:border-red-500 transition-colors">
                              <SelectValue placeholder="Select board size" />
                            </SelectTrigger>
                            <SelectContent className="bg-black border-red-900/50">
                              {[5, 6, 7, 8].map(size => (
                                <SelectItem 
                                  key={size} 
                                  value={size.toString()}
                                  className="text-red-400 hover:bg-red-950/50 font-mono"
                                >
                                  {size} × {size} GRID
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <motion.div 
                          whileHover={{ scale: 1.02 }}
                          className="flex items-center justify-center w-full bg-black/40 border border-red-900/50 p-4 rounded-lg hover:border-red-500 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span className="flex items-center">
                              {blindMode ? (
                                <EyeOff className="w-5 h-5 text-red-400" />
                              ) : (
                                <EyeIcon className="w-5 h-5 text-red-400" />
                              )}
                            </span>
                            <span className="font-mono text-sm">BLIND MODE</span>
                            <Switch 
                              checked={blindMode} 
                              onCheckedChange={toggleBlindMode}
                              className="data-[state=checked]:bg-red-600"
                            />
                            {blindMode && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring" }}
                              >
                                <BrainCircuit className="w-5 h-5 text-red-400 ml-2" />
                              </motion.div>
                            )}
                          </div>
                        </motion.div>
                      </div>

                      {isComplete && !blindMode && (
                        <motion.div 
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="relative mb-6"
                        >
                          <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg opacity-50 blur" />
                          <div className="relative bg-green-950/50 border border-green-500/50 p-4 rounded-lg">
                            <div className="flex items-center justify-center gap-2 mb-2">
                              <Trophy className="w-5 h-5 text-green-400" />
                              <span className="font-bold text-green-400 font-mono">MISSION COMPLETE</span>
                            </div>
                            <p className="text-sm text-gray-300 font-mono">
                              Tour completed in {path.length} moves
                            </p>
                            {elapsedTime > 0 && (
                              <p className="text-sm text-gray-300 font-mono mt-1">
                                Time: {formatTime(elapsedTime)}
                              </p>
                            )}
                          </div>
                        </motion.div>
                      )}

                      {gameOver && blindMode && (
                        <motion.div 
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="relative mb-6"
                        >
                          <div className={`absolute -inset-1 bg-gradient-to-r ${gameResult.includes("Congratulations") ? "from-green-600 to-emerald-600" : "from-red-600 to-red-800"} rounded-lg opacity-50 blur`} />
                          <div className={`relative ${gameResult.includes("Congratulations") ? "bg-green-950/50 border-green-500/50" : "bg-red-950/50 border-red-500/50"} border p-4 rounded-lg font-mono`}>
                            {gameResult}
                          </div>
                        </motion.div>
                      )}

                      {/* Chess Board */}
                      <div className="relative p-8 max-w-md mx-auto mb-8">
                        <div className="absolute -inset-1 bg-gradient-to-r from-red-600/20 to-red-800/20 rounded-xl blur" />
                        <div className="relative bg-black/60 border-2 border-red-900/50 rounded-xl p-4 backdrop-blur-sm">
                          <div
                            className="grid gap-0.5 p-1 rounded-lg"
                            style={{
                              gridTemplateColumns: `repeat(${boardSize}, 1fr)`,
                              width: '400px',
                              height: '400px',
                              margin: '0 auto'
                            }}
                          >
                            {Array.from({ length: boardSize * boardSize }).map((_, i) => {
                              const row = Math.floor(i / boardSize)
                              const col = i % boardSize
                              const isBlackSquare = (row + col) % 2 === 1
                              const isKnightHere = knightPos[0] === row && knightPos[1] === col
                              const isVisited = visited.has(`${row},${col}`)
                              const moveIndex = path.findIndex(([x, y]) => x === row && y === col)

                              return (
                                <motion.div
                                  key={i}
                                  whileHover={{ scale: 1.05, zIndex: 10 }}
                                  whileTap={{ scale: 0.95 }}
                                  className={`${
                                    isBlackSquare 
                                      ? "bg-gray-800" 
                                      : "bg-gray-600"
                                  } ${
                                    isVisited ? "ring-1 ring-red-500/30" : ""
                                  } relative flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-red-500 transition-all`}
                                  style={{
                                    aspectRatio: '1/1',
                                    minHeight: '0'
                                  }}
                                  onClick={() => handleSquareClick(row, col)}
                                >
                                  {isKnightHere && (
                                    <motion.div
                                      initial={{ scale: 0, rotate: -180 }}
                                      animate={{ scale: 1, rotate: 0 }}
                                      transition={{ type: "spring", stiffness: 200 }}
                                    >
                                      <ChessKnight className="w-6 h-6 text-red-400 z-10 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                                    </motion.div>
                                  )}
                                  {isVisited && !blindMode && (
                                    <div className="absolute bottom-0.5 right-0.5 text-[10px] font-bold text-red-400 bg-black/60 px-1 rounded">
                                      {moveIndex + 1}
                                    </div>
                                  )}
                                </motion.div>
                              )
                            })}
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-center gap-4 mb-8">
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button 
                            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 font-mono shadow-lg shadow-red-900/50 border border-red-500/50" 
                            onClick={() => resetGame(boardSize)}
                          >
                            NEW MISSION
                          </Button>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button 
                            variant="outline" 
                            className="border-red-900/50 hover:bg-red-950/50 font-mono backdrop-blur-sm" 
                            onClick={() => resetGame(boardSize)}
                          >
                            RESET
                          </Button>
                        </motion.div>
                      </div>

                      {/* Instructions */}
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-left max-w-md mx-auto bg-black/40 border border-red-900/30 p-6 rounded-lg backdrop-blur-sm"
                      >
                        <h4 className="font-bold mb-3 text-red-400 font-mono text-sm flex items-center gap-2">
                          <Target className="w-4 h-4" />
                          MISSION PARAMETERS:
                        </h4>
                        <ol className="space-y-2 text-sm text-gray-300">
                          <li className="flex gap-2">
                            <span className="text-red-400 font-mono">01.</span>
                            <span>Click squares to move the knight</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="text-red-400 font-mono">02.</span>
                            <span>Knights move in L-shape: 2 squares + 1 perpendicular</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="text-red-400 font-mono">03.</span>
                            <span>Visit all squares exactly once</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="text-red-400 font-mono">04.</span>
                            <span>Moves are tracked and numbered</span>
                          </li>
                          <li className={`flex gap-2 ${blindMode ? "font-bold text-red-300" : ""}`}>
                            <span className="text-red-400 font-mono">05.</span>
                            <span>Blind Mode: No numbers. Invalid move = mission failed.</span>
                          </li>
                        </ol>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              </TabsContent>

              <TabsContent value="rules" className="mt-4">
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative group"
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600/30 to-red-800/30 rounded-xl opacity-50 blur" />
                  <div className="relative bg-gradient-to-br from-red-950/20 via-black to-black rounded-xl p-8 border border-red-900/50 backdrop-blur-sm">
                    <h3 className="text-2xl font-bold mb-6 text-red-400 font-mono flex items-center gap-2">
                      <Crown className="w-6 h-6" />
                      KNIGHT&apos;S TOUR PROTOCOLS
                    </h3>
                    <div className="space-y-6 text-gray-300">
                      <div className="bg-black/40 border border-red-900/30 p-4 rounded-lg">
                        <p className="text-sm leading-relaxed">
                          <span className="text-red-400 font-mono">[MISSION BRIEF]</span><br/>
                          Given an n × n chessboard with a Knight starting at position (0, 0). Complete a valid Knight&apos;s Tour where the Knight visits each cell exactly once following standard L-shaped chess moves.
                        </p>
                      </div>

                      <div>
                        <h4 className="font-bold text-red-400 mb-3 font-mono">CORE RULES:</h4>
                        <ul className="space-y-2 text-sm">
                          <li className="flex gap-2">
                            <span className="text-red-500">▸</span>
                            <span>Move knight to every square exactly once</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="text-red-500">▸</span>
                            <span>L-shape pattern: 2 squares + 1 perpendicular</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="text-red-500">▸</span>
                            <span>Cannot revisit any square</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="text-red-500">▸</span>
                            <span>Mission complete when all squares visited</span>
                          </li>
                        </ul>
                      </div>
                      
                      <div className="bg-red-950/20 border border-red-900/50 p-4 rounded-lg">
                        <h4 className="font-bold text-red-400 mb-3 font-mono flex items-center gap-2">
                          <EyeOff className="w-4 h-4" />
                          BLIND MODE PROTOCOL:
                        </h4>
                        <ul className="space-y-2 text-sm">
                          <li className="flex gap-2">
                            <span className="text-red-500">▸</span>
                            <span>Move numbers hidden from view</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="text-red-500">▸</span>
                            <span>Invalid move = immediate mission failure</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="text-red-500">▸</span>
                            <span>No valid moves remaining = mission failure</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="text-red-500">▸</span>
                            <span>Complete all squares = challenge mastered</span>
                          </li>
                        </ul>
                      </div>
                      
                      <div className="bg-black/40 border border-red-900/30 p-4 rounded-lg">
                        <h4 className="font-bold text-red-400 mb-3 font-mono">HISTORICAL DATA:</h4>
                        <p className="text-sm leading-relaxed">
                          First documented by Leonhard Euler (1759). Extensively studied in mathematics and computer science as a Hamiltonian path problem.
                          <br/><br/>
                          <span className="text-red-400">{"// Origin: Hidden stage for the living area"}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      
      {/* Invalid Move Modal */}
      {showInvalidMove && !blindMode && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 flex items-center justify-center z-50 bg-black/80 backdrop-blur-sm"
        >
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative max-w-sm w-full"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-red-800 rounded-xl opacity-75 blur" />
            <div className="relative bg-gradient-to-br from-red-950 via-black to-black rounded-xl p-8 shadow-2xl border border-red-500/50">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4 text-red-400 font-mono flex items-center justify-center gap-2">
                  <AlertTriangle className="w-6 h-6" />
                  INVALID MOVE
                </h2>
                <p className="mb-6 text-gray-300 text-sm">
                  <span className="text-red-400">[PROTOCOL VIOLATION]</span><br/>
                  Knights move in L-shape. Cannot revisit squares.
                </p>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    onClick={() => setShowInvalidMove(false)} 
                    className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-mono shadow-lg shadow-red-900/50"
                  >
                    ACKNOWLEDGE
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
      
      {/* Blind Mode Quiz Modal */}
      {showBlindModeQuiz && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 flex items-center justify-center z-50 bg-black/90 backdrop-blur-sm"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, rotateX: -10 }}
            animate={{ scale: 1, opacity: 1, rotateX: 0 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="relative max-w-md w-full"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-red-600 via-red-700 to-red-800 rounded-xl opacity-75 blur animate-pulse" />
            <div className="relative bg-gradient-to-br from-red-950/90 via-black to-black rounded-xl p-8 shadow-2xl border border-red-500/50 backdrop-blur-md">
              <h2 className="text-2xl font-bold mb-6 text-red-400 text-center font-mono flex items-center justify-center gap-2">
                <Lock className="w-6 h-6" />
                UNLOCK BLIND MODE
              </h2>
              <div className="bg-black/60 p-6 rounded-lg mb-6 border border-red-900/50">
                <p className="text-sm italic mb-2 text-red-400 font-mono">[SECURITY CHALLENGE]</p>
                <p className="text-lg font-medium mb-4 text-gray-200">&quot;What is always coming but never arrives?&quot;</p>
                
                <div className="flex flex-col space-y-4">
                  <div className="relative">
                    <input 
                      type="text" 
                      value={quizAnswer}
                      onChange={(e) => setQuizAnswer(e.target.value)}
                      placeholder="Enter answer..."
                      className="w-full px-4 py-3 rounded-md bg-black/80 border border-red-900/50 text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 font-mono shadow-[0_0_15px_rgba(239,68,68,0.1)] transition-all"
                      onKeyDown={(e) => e.key === 'Enter' && handleQuizSubmit()}
                    />
                    <div className="absolute inset-0 rounded-md bg-red-500/5 pointer-events-none" />
                  </div>
                  
                  {quizError && (
                    <motion.p 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-red-400 text-sm font-mono"
                    >
                      ⚠ {quizError}
                    </motion.p>
                  )}
                </div>
              </div>
              
              <div className="flex justify-center gap-4">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    onClick={() => setShowBlindModeQuiz(false)} 
                    variant="outline"
                    className="border-red-900/50 hover:bg-red-950/50 text-gray-300 font-mono"
                  >
                    ABORT
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    onClick={handleQuizSubmit} 
                    className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-mono shadow-lg shadow-red-900/50"
                  >
                    SUBMIT
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}