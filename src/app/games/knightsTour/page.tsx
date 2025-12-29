'use client'

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, CastleIcon as ChessKnight, EyeIcon, EyeOff, BrainCircuit, Crown, Target, Trophy, AlertTriangle, Lock, Clock, Play, Pause, ChevronUp, X, Zap } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import Header from "@/components/header"

const KNIGHT_MOVES = [
  [2, 1], [1, 2], [-1, 2], [-2, 1],
  [-2, -1], [-1, -2], [1, -2], [2, -1]
]

// Leaderboard types
type LeaderboardEntry = {
  rank: number
  username: string
  moves: number
  time: number
  date: string
  boardSize: number
  isBlindMode: boolean
  isFastest?: boolean
}

type TimeFilter = 'DAILY' | 'WEEKLY' | 'ALL-TIME'
type BoardSizeFilter = 5 | 6 | 7 | 8 | 'ALL'
type ModeFilter = 'NORMAL' | 'BLIND'

// Generate mock leaderboard data
const generateMockData = (count: number): LeaderboardEntry[] => {
  const usernames = [
    "Agent█████", "Player███", "Strategist█", "Shadow███", "Phantom█████",
    "Ghost███", "Cipher█████", "Enigma███", "Vortex█████", "Oracle███",
    "Nexus█████", "Wraith███", "Tempest█████", "Apex███", "Nova█████",
    "Void███", "Echo█████", "Spectre███", "Rogue█████", "Titan███"
  ]
  
  const entries: LeaderboardEntry[] = []
  const usedNames = new Set<string>()
  
  for (let i = 0; i < count; i++) {
    let username: string
    do {
      username = usernames[Math.floor(Math.random() * usernames.length)]
    } while (usedNames.has(username) && usedNames.size < usernames.length)
    usedNames.add(username)
    
    const randomBoardSize = [5, 6, 7, 8][Math.floor(Math.random() * 4)] as 5 | 6 | 7 | 8
    const randomIsBlind = Math.random() > 0.7
    
    entries.push({
      rank: 0, // Will be set after sorting
      username,
      moves: 24 + Math.floor(Math.random() * 27), // 24-50 moves
      time: 45 + Math.random() * 300, // 45s - 345s
      date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      boardSize: randomBoardSize,
      isBlindMode: randomIsBlind,
      isFastest: false // Will be set after sorting
    })
  }
  
  // Sort by moves first, then by time
  entries.sort((a, b) => a.moves - b.moves || a.time - b.time)
  
  // Assign ranks after sorting
  entries.forEach((entry, index) => {
    entry.rank = index + 1
    entry.isFastest = index === 0 // Mark first entry as fastest
  })
  
  return entries
}

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
  
  // Leaderboard state
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([])
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('ALL-TIME')
  const [boardSizeFilter, setBoardSizeFilter] = useState<BoardSizeFilter>('ALL')
  const [modeFilter, setModeFilter] = useState<ModeFilter>('NORMAL')
  const [userBestScores, setUserBestScores] = useState<{[key: string]: {moves: number, time: number}}>({})
  const [showMobileLeaderboard, setShowMobileLeaderboard] = useState(false)
  
  const isComplete = visited.size === boardSize * boardSize

  // Initialize leaderboard and load user's best from localStorage
  useEffect(() => {
    setLeaderboardData(generateMockData(20))
    
    const saved = localStorage.getItem('knightsTourBestScores')
    if (saved) {
      const parsed = JSON.parse(saved)
      setUserBestScores(parsed)
    }
  }, [])

  // Update user's best score when game completes
  useEffect(() => {
    if (isComplete && path.length > 0 && elapsedTime > 0) {
      const currentMoves = path.length
      const currentTime = elapsedTime
      const key = `${boardSize}x${boardSize}-${blindMode ? 'BLIND' : 'NORMAL'}`
      
      const existingBest = userBestScores[key]
      
      if (!existingBest || currentMoves < existingBest.moves || (currentMoves === existingBest.moves && currentTime < existingBest.time)) {
        const newBestScores = {
          ...userBestScores,
          [key]: { moves: currentMoves, time: currentTime }
        }
        
        setUserBestScores(newBestScores)
        localStorage.setItem('knightsTourBestScores', JSON.stringify(newBestScores))
      }
    }
  }, [isComplete, path.length, elapsedTime, boardSize, blindMode, userBestScores])

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

  // Filter leaderboard based on all filters
  function getFilteredLeaderboard(): LeaderboardEntry[] {
    const now = new Date()
    let filtered = leaderboardData
    
    // Time filter
    if (timeFilter === 'DAILY') {
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      filtered = filtered.filter(entry => new Date(entry.date) >= oneDayAgo)
    } else if (timeFilter === 'WEEKLY') {
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      filtered = filtered.filter(entry => new Date(entry.date) >= oneWeekAgo)
    }
    
    // Board size filter
    if (boardSizeFilter !== 'ALL') {
      filtered = filtered.filter(entry => entry.boardSize === boardSizeFilter)
    }
    
    // Mode filter (always applied - no ALL option)
    if (modeFilter === 'NORMAL') {
      filtered = filtered.filter(entry => !entry.isBlindMode)
    } else if (modeFilter === 'BLIND') {
      filtered = filtered.filter(entry => entry.isBlindMode)
    }
    
    // Sort by moves then time
    filtered.sort((a, b) => a.moves - b.moves || a.time - b.time)
    
    // Reassign ranks based on filtered results (1, 2, 3, ...)
    const rankedEntries = filtered.slice(0, 10).map((entry, index) => ({
      ...entry,
      rank: index + 1
    }))
    
    return rankedEntries
  }

  // Get user's best for current filter combination
  function getUserBestForCurrentFilters() {
    // Build keys for all relevant combinations
    const boardSizes = boardSizeFilter === 'ALL' ? [5, 6, 7, 8] : [boardSizeFilter]
    const mode = modeFilter
    
    let bestScore: {moves: number, time: number, boardSize: number} | null = null
    
    for (const size of boardSizes) {
      const key = `${size}x${size}-${mode}`
      const score = userBestScores[key]
      
      if (score) {
        if (!bestScore || score.moves < bestScore.moves || (score.moves === bestScore.moves && score.time < bestScore.time)) {
          bestScore = { ...score, boardSize: size }
        }
      }
    }
    
    if (!bestScore) return null
    
    // Calculate rank based on filtered leaderboard
    const filtered = getFilteredLeaderboard()
    const betterThan = filtered.filter(entry => 
      entry.moves < bestScore!.moves || (entry.moves === bestScore!.moves && entry.time < bestScore!.time)
    ).length
    
    return {
      moves: bestScore.moves,
      time: bestScore.time,
      boardSize: bestScore.boardSize,
      rank: betterThan + 1
    }
  }

  // Render leaderboard component
  function renderLeaderboard(compact = false, mobile = false) {
    const entries = getFilteredLeaderboard()
    
    if (compact) {
      // Tablet horizontal bar
      return (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full bg-gradient-to-r from-red-950/30 via-black to-red-950/30 border border-red-900/50 rounded-lg p-3 mb-6 backdrop-blur-sm overflow-x-auto"
        >
          <div className="flex items-center justify-around gap-4 min-w-max px-4">
            <span className="text-red-400 font-mono text-sm flex items-center gap-1">
              <Trophy className="w-4 h-4" /> TOP SCORES:
            </span>
            {entries.slice(0, 3).map((entry, i) => (
              <span key={i} className="text-gray-300 font-mono text-xs">
                #{entry.rank}: {entry.username} - {formatTime(entry.time)}
              </span>
            ))}
            {(() => {
              const userBest = getUserBestForCurrentFilters()
              return userBest && (
                <span className="text-red-400 font-mono text-xs border-l border-red-900/50 pl-4">
                  YOU: #{userBest.rank} ({userBest.moves} moves)
                </span>
              )
            })()}
          </div>
        </motion.div>
      )
    }
    
    // Desktop/Mobile full leaderboard
    return (
      <motion.div
        initial={{ opacity: 0, x: mobile ? 0 : 20 }}
        animate={{ opacity: 1, x: 0 }}
        className={`${mobile ? 'h-full' : 'sticky top-4'} bg-gradient-to-br from-red-950/30 via-black to-purple-950/30 border border-red-900/50 rounded-xl p-6 backdrop-blur-sm shadow-[0_0_30px_rgba(239,68,68,0.3)] ${mobile ? '' : 'max-h-[90vh] overflow-hidden flex flex-col'}`}
      >
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold text-red-400 font-mono flex items-center gap-2">
              <Trophy className="w-6 h-6" />
              LEADERBOARD
            </h3>
            {mobile && (
              <button
                onClick={() => setShowMobileLeaderboard(false)}
                className="text-gray-400 hover:text-red-400 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            )}
          </div>
          <div className="h-0.5 w-full bg-gradient-to-r from-red-900 via-red-500 to-red-900 mb-4" />
          
          {/* Filter tabs */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-mono text-gray-500 mb-2 block">TIME PERIOD</label>
              <div className="flex gap-2">
                {(['DAILY', 'WEEKLY', 'ALL-TIME'] as TimeFilter[]).map(filter => (
                  <motion.button
                    key={filter}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setTimeFilter(filter)}
                    className={`flex-1 px-3 py-2 rounded-md font-mono text-xs transition-all ${
                      timeFilter === filter
                        ? 'bg-red-600 text-white shadow-lg shadow-red-900/50'
                        : 'bg-black/40 text-gray-400 border border-red-900/30 hover:border-red-500/50'
                    }`}
                  >
                    {filter}
                  </motion.button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="text-xs font-mono text-gray-500 mb-2 block">BOARD SIZE</label>
              <div className="flex gap-2">
                {(['ALL', 5, 6, 7, 8] as BoardSizeFilter[]).map(size => (
                  <motion.button
                    key={size}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setBoardSizeFilter(size)}
                    className={`flex-1 px-3 py-2 rounded-md font-mono text-xs transition-all ${
                      boardSizeFilter === size
                        ? 'bg-red-600 text-white shadow-lg shadow-red-900/50'
                        : 'bg-black/40 text-gray-400 border border-red-900/30 hover:border-red-500/50'
                    }`}
                  >
                    {size === 'ALL' ? 'ALL' : `${size}×${size}`}
                  </motion.button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="text-xs font-mono text-gray-500 mb-2 block">MODE</label>
              <div className="flex gap-2">
                {(['NORMAL', 'BLIND'] as ModeFilter[]).map(mode => (
                  <motion.button
                    key={mode}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setModeFilter(mode)}
                    className={`flex-1 px-3 py-2 rounded-md font-mono text-xs transition-all ${
                      modeFilter === mode
                        ? 'bg-red-600 text-white shadow-lg shadow-red-900/50'
                        : 'bg-black/40 text-gray-400 border border-red-900/30 hover:border-red-500/50'
                    }`}
                  >
                    {mode}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Leaderboard entries */}
        <div className="flex-1 overflow-y-auto space-y-2 mb-6 pr-2 custom-scrollbar">
          <AnimatePresence mode="wait">
            {entries.map((entry, index) => {
              const userBest = getUserBestForCurrentFilters()
              const isUserRank = userBest && userBest.rank === entry.rank && userBest.moves === entry.moves
              return (
                <motion.div
                  key={`${timeFilter}-${entry.rank}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className={`group flex items-center gap-3 p-3 rounded-lg transition-all ${
                    isUserRank
                      ? 'bg-red-950/50 border-2 border-red-500 shadow-lg shadow-red-900/30'
                      : 'bg-black/40 border border-red-900/30 hover:bg-red-950/20 hover:border-red-500/50'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-[50px]">
                    <span className={`font-mono font-bold text-lg ${
                      isUserRank ? 'text-red-400' : index < 3 ? 'text-red-400' : 'text-gray-400'
                    }`}>
                      #{entry.rank}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`font-mono text-sm ${
                        isUserRank ? 'text-red-300 font-bold' : 'text-gray-300'
                      }`}>
                        {entry.username}
                      </span>
                      {entry.isFastest && (
                        <span title="Fastest time">
                          <Zap className="w-4 h-4 text-yellow-400" />
                        </span>
                      )}
                      {entry.isBlindMode && (
                        <span title="Blind Mode">
                          <EyeOff className="w-3 h-3 text-purple-400" />
                        </span>
                      )}
                    </div>
                    <div className="flex gap-3 text-xs font-mono text-gray-500 mt-1">
                      <span>{entry.boardSize}×{entry.boardSize}</span>
                      <span>•</span>
                      <span>{formatTime(entry.time)}</span>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>

        {/* User's best section */}
        {(() => {
          const userBest = getUserBestForCurrentFilters()
          return userBest && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border-t border-red-900/50 pt-4 mt-auto"
            >
              <div className="bg-black/60 border-l-4 border-red-500 rounded-lg p-4">
                <h4 className="font-mono text-sm text-red-400 mb-3 flex items-center gap-2">
                  📊 YOUR BEST
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-mono">Rank:</span>
                    <motion.span 
                      key={`${boardSizeFilter}-${modeFilter}-${userBest.rank}`}
                      initial={{ scale: 1.2, color: '#f87171' }}
                      animate={{ scale: 1, color: '#fca5a5' }}
                      className="font-bold font-mono"
                    >
                      #{userBest.rank}
                    </motion.span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-mono">Best Score:</span>
                    <span className="text-red-400 font-bold font-mono">{userBest.moves} moves</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-mono">Best Time:</span>
                    <span className="text-red-400 font-bold font-mono">{formatTime(userBest.time)}</span>
                  </div>
                  {boardSizeFilter === 'ALL' && (
                    <div className="flex justify-between">
                      <span className="text-gray-400 font-mono">Board Size:</span>
                      <span className="text-red-400 font-bold font-mono">{userBest.boardSize}×{userBest.boardSize}</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )
        })()}
      </motion.div>
    )
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

        {/* Tablet horizontal leaderboard (768px - 1199px) */}
        <div className="hidden md:block lg:hidden">
          {renderLeaderboard(true)}
        </div>

        {/* Desktop two-column layout (≥1200px) */}
        <div className="grid grid-cols-1 lg:grid-cols-[70%_30%] gap-8">
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

          {/* Desktop leaderboard panel (≥1200px) */}
          <div className="hidden lg:block">
            {renderLeaderboard()}
          </div>
        </div>

        {/* Mobile leaderboard button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowMobileLeaderboard(true)}
          className="fixed bottom-4 right-4 md:bottom-6 md:right-6 lg:hidden bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-3 rounded-full shadow-lg shadow-red-900/50 font-mono text-sm flex items-center gap-2 border border-red-500/50 z-30"
        >
          <Trophy className="w-5 h-5" />
          Leaderboard
          <ChevronUp className="w-4 h-4" />
        </motion.button>

        {/* Mobile leaderboard bottom sheet */}
        <AnimatePresence>
          {showMobileLeaderboard && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowMobileLeaderboard(false)}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
              />
              
              {/* Bottom sheet */}
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="fixed bottom-0 left-0 right-0 max-h-[80vh] z-50 lg:hidden"
              >
                {renderLeaderboard(false, true)}
              </motion.div>
            </>
          )}
        </AnimatePresence>
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