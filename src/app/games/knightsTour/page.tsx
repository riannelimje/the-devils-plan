'use client'

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, CastleIcon as ChessKnight } from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Header from "@/components/header"

const BOARD_SIZE = 5
const KNIGHT_MOVES = [
  [2, 1], [1, 2], [-1, 2], [-2, 1],
  [-2, -1], [-1, -2], [1, -2], [2, -1]
]

export default function KnightsTourGame() {
  const [knightPos, setKnightPos] = useState<[number, number]>([0, 0])
  const [visited, setVisited] = useState<Set<string>>(new Set(["0,0"]))
  const [path, setPath] = useState<[number, number][]>([[0, 0]])
  const [showInvalidMove, setShowInvalidMove] = useState(false)

  const isComplete = visited.size === BOARD_SIZE * BOARD_SIZE

  function handleSquareClick(row: number, col: number) {
    const [kx, ky] = knightPos
    const dx = row - kx
    const dy = col - ky
    const key = `${row},${col}`

    const isLegalMove = KNIGHT_MOVES.some(([mx, my]) => mx === dx && my === dy)
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

  function resetGame() {
    setKnightPos([0, 0])
    setVisited(new Set(["0,0"]))
    setPath([[0, 0]])
    setShowInvalidMove(false)
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
                <TabsTrigger value="play">Play</TabsTrigger>
                <TabsTrigger value="rules">Rules</TabsTrigger>
              </TabsList>
              <TabsContent value="play" className="bg-gray-900 border border-gray-800 rounded-b-xl p-6">
                <div className="text-center py-12">
                  <h3 className="text-2xl font-bold mb-4">The Knight's Tour</h3>
                  <p className="text-gray-400 mb-8">
                    Move the knight to visit every square on the board exactly once. Can you complete the tour?
                  </p>

                  {isComplete && (
                    <div className="bg-green-700 p-4 rounded-lg mb-4 font-semibold">
                      Congratulations! You completed the Knight's Tour in {path.length} moves.
                    </div>
                  )}

                  <div className="bg-gray-800 rounded-xl p-8 max-w-md mx-auto mb-8">
                    <div className="grid grid-cols-5 aspect-square gap-0 border border-gray-600">
                      {Array.from({ length: BOARD_SIZE * BOARD_SIZE }).map((_, i) => {
                        const row = Math.floor(i / BOARD_SIZE)
                        const col = i % BOARD_SIZE
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
                            {isVisited && (
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
                    <Button className="bg-red-600 hover:bg-red-700" onClick={resetGame}>Start New Game</Button>
                    <Button variant="outline" className="border-gray-600 text-black hover:bg-[#7102BF]" onClick={resetGame}>Reset Board</Button>
                  </div>

                  <div className="text-left max-w-md mx-auto bg-gray-800 p-4 rounded-lg">
                    <h4 className="font-bold mb-2">How to Play:</h4>
                    <ol className="list-decimal pl-5 space-y-1 text-sm text-gray-300">
                      <li>Click on a square to move the knight</li>
                      <li>Knights move in an L-shape: 2 squares in one direction, then 1 square perpendicular</li>
                      <li>Visit all 25 squares exactly once to complete the tour</li>
                      <li>Your moves are tracked and numbered on the board</li>
                    </ol>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="rules" className="bg-gray-900 border border-gray-800 rounded-b-xl p-6">
                <h3 className="text-xl font-bold mb-4">The Knight's Tour Rules</h3>
                <div className="space-y-4 text-gray-300">
                  <p>
                    Given an n × n chessboard with a Knight starting at the top-left corner (position (0, 0)). The task is to determine a valid Knight’s Tour where the Knight visits each cell exactly once following the standard L-shaped moves of a Knight in chess.
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
      {showInvalidMove && (
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
    </div>
  )
}
