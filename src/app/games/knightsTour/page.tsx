'use client'

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, CastleIcon as ChessKnight, EyeIcon, EyeOff, BrainCircuit } from 'lucide-react'

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
  
  const isComplete = visited.size === boardSize * boardSize

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
    <div className="flex flex-col min-h-screen bg-black text-white">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="mb-6">
          <Link href="/" className="text-gray-400 hover:text-white flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Games
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-8">
          <div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden mb-6">
              <div className="relative h-64 w-full">
                <Image
                  src="/images/game1.jpg"
                  alt="The Knight's Tour"
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            <Tabs defaultValue="play" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gray-900">
                <TabsTrigger 
                value="play" 
                className="text-white data-[state=active]:text-purple-500"
                >
                Play
                </TabsTrigger>
                <TabsTrigger 
                value="rules" 
                className="text-white data-[state=active]:text-purple-500"
                >
                Rules
                </TabsTrigger>
              </TabsList>
              <TabsContent value="play" className="bg-gray-900 border border-gray-800 rounded-b-xl p-6">
                <div className="text-center py-12">
                  <h3 className="text-2xl font-bold mb-4">The Knight's Tour</h3>
                  <p className="text-gray-400 mb-8">
                    Move the knight to visit every square on the board exactly once. Can you complete the tour?
                  </p>

                  {/* Game controls */}
                  <div className="flex flex-col items-center max-w-md mx-auto mb-6 space-y-4">
                    <Select onValueChange={handleSizeChange} defaultValue={boardSize.toString()}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select board size" />
                      </SelectTrigger>
                      <SelectContent>
                        {[5, 6, 7, 8].map(size => (
                          <SelectItem key={size} value={size.toString()}>
                            {size} × {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <div className="flex items-center justify-center w-full bg-gray-800 p-3 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center">
                          {blindMode ? <EyeOff className="w-5 h-5 text-purple-400" /> : <EyeIcon className="w-5 h-5 text-purple-400" />}
                        </span>
                        <span className="mr-2">Blind Mode</span>
                        <Switch 
                          checked={blindMode} 
                          onCheckedChange={toggleBlindMode}
                          className="data-[state=checked]:bg-purple-600"
                        />
                        {blindMode && <BrainCircuit className="w-5 h-5 text-purple-400 ml-2" />}
                      </div>
                    </div>
                  </div>

                  {isComplete && !blindMode && (
                    <div className="bg-green-700 p-4 rounded-lg mb-4 font-semibold">
                      Congratulations! You completed the Knight's Tour in {path.length} moves.
                    </div>
                  )}

                  {gameOver && blindMode && (
                    <div className={`${gameResult.includes("Congratulations") ? "bg-green-700" : "bg-red-700"} p-4 rounded-lg mb-4 font-semibold`}>
                      {gameResult}
                    </div>
                  )}

                  <div className="bg-gray-800 rounded-xl p-8 max-w-md mx-auto mb-8">
                    <div
                      className={`grid aspect-square gap-0 border border-gray-600`}
                      style={{
                        gridTemplateColumns: `repeat(${boardSize}, minmax(0, 1fr))`,
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
                          <div
                            key={i}
                            className={`${isBlackSquare ? "bg-gray-700" : "bg-gray-500"} relative flex items-center justify-center cursor-pointer`}
                            onClick={() => handleSquareClick(row, col)}
                          >
                            {isKnightHere && (
                              <ChessKnight className="w-8 h-8 text-purple-400 z-10" />
                            )}
                            {isVisited && !blindMode && (
                              <div className="absolute bottom-1 right-1 text-xs opacity-50">
                                {moveIndex + 1}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div className="flex justify-center gap-4 mb-8">
                    <Button className="bg-red-600 hover:bg-red-700" onClick={() => resetGame(boardSize)}>Start New Game</Button>
                    <Button variant="outline" className="border-gray-600 text-black hover:bg-[#7102BF] hover:text-white" onClick={() => resetGame(boardSize)}>Reset Board</Button>
                  </div>

                  <div className="text-left max-w-md mx-auto bg-gray-800 p-4 rounded-lg">
                    <h4 className="font-bold mb-2">How to Play:</h4>
                    <ol className="list-decimal pl-5 space-y-1 text-sm text-gray-300">
                      <li>Click on a square to move the knight</li>
                      <li>Knights move in an L-shape: 2 squares in one direction, then 1 square perpendicular</li>
                      <li>Visit all squares exactly once to complete the tour</li>
                      <li>Your moves are tracked and numbered on the board</li>
                      <li className={blindMode ? "font-bold text-purple-300" : ""}>
                        In Blind Mode: No numbering shown. Invalid moves or getting stuck ends the game!
                      </li>
                    </ol>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="rules" className="bg-gray-900 border border-gray-800 rounded-b-xl p-6">
                <h3 className="text-xl font-bold mb-4">The Knight's Tour Rules</h3>
                <div className="space-y-4 text-gray-300">
                  <p>
                    Given an n × n chessboard with a Knight starting at the top-left corner (position (0, 0)). The task is to determine a valid Knight's Tour where the Knight visits each cell exactly once following the standard L-shaped moves of a Knight in chess.
                  </p>
                  <h4 className="font-bold text-white">Basic Rules:</h4>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>The goal is to move a knight to every square on the chessboard exactly once</li>
                    <li>The knight moves according to standard chess rules: in an L-shape pattern</li>
                    <li>Each move consists of 2 squares in one direction followed by 1 square perpendicular</li>
                    <li>You cannot visit a square more than once</li>
                    <li>The puzzle is complete when all squares have been visited exactly once</li>
                  </ul>
                  
                  <div className="bg-gray-800 p-4 rounded-lg mt-6">
                    <h4 className="font-bold text-white mb-2">Blind Mode Rules:</h4>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>Move numbers are not shown on the board</li>
                      <li>Making an invalid move (non L-shape or revisiting a square) ends the game immediately</li>
                      <li>Running out of valid moves without completing the tour ends the game</li>
                      <li>Successfully visiting all squares completes the challenge</li>
                    </ul>
                  </div>
                  
                  <div className="bg-gray-800 p-4 rounded-lg mt-6">
                    <h4 className="font-bold text-white mb-2">Historical Context:</h4>
                    <p>
                      The Knight's Tour problem was first documented by mathematician Leonhard Euler in 1759. It has been studied extensively in mathematics and computer science as an example of a Hamiltonian path problem.
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      
      {/* Invalid Move Modal */}
      {showInvalidMove && !blindMode && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white text-black rounded-lg p-6 shadow-xl max-w-sm w-full text-center">
            <h2 className="text-xl font-bold mb-4">Invalid Move!</h2>
            <p className="mb-6">That move is not allowed. Knights move in an L-shape and cannot revisit squares.</p>
            <Button onClick={() => setShowInvalidMove(false)} className="bg-purple-700 hover:bg-purple-800 text-white">
              Close
            </Button>
          </div>
        </div>
      )}
      
      {/* Blind Mode Quiz Modal */}
      {showBlindModeQuiz && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-70">
          <div className="bg-gray-800 text-white rounded-lg p-8 shadow-xl max-w-md w-full text-center border border-purple-500">
            <h2 className="text-2xl font-bold mb-6">Unlock Blind Mode</h2>
            <div className="bg-gray-700 p-6 rounded-lg mb-6">
              <p className="text-xl italic mb-2">Riddle:</p>
              <p className="text-lg font-medium mb-4">"What is always coming but never arrives?"</p>
              
              <div className="flex flex-col space-y-4">
                <input 
                  type="text" 
                  value={quizAnswer}
                  onChange={(e) => setQuizAnswer(e.target.value)}
                  placeholder="Your answer..."
                  className="px-4 py-2 rounded-md bg-gray-600 border border-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  onKeyDown={(e) => e.key === 'Enter' && handleQuizSubmit()}
                />
                
                {quizError && (
                  <p className="text-red-400 text-sm">{quizError}</p>
                )}
              </div>
            </div>
            
            <div className="flex justify-center gap-4">
              <Button onClick={() => setShowBlindModeQuiz(false)} className="bg-gray-600 hover:bg-gray-700 text-white">
                Cancel
              </Button>
              <Button onClick={handleQuizSubmit} className="bg-purple-700 hover:bg-purple-800 text-white">
                Submit Answer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}