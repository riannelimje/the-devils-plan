"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Header from "@/components/header"
import Link from "next/link"
import { 
  Trophy, 
  Users, 
  Clock, 
  Target, 
  Hammer, 
  Eye, 
  Award,
  ChevronDown,
  ChevronUp,
  Play,
  Crown,
  BrainCircuit,
  Grid3x3
} from "lucide-react"

export default function WallBadukRules() {
  const [expandedSection, setExpandedSection] = useState("overview")

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? "" : section)
  }

  const sections = [
    {
      id: "overview",
      title: "Game Overview",
      icon: <Trophy className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-300 leading-relaxed">
            <strong className="text-white">Wall Baduk</strong> is a strategic territorial game where players compete to control the largest territory by strategically placing pieces and building walls. Outmaneuver your opponent and claim victory!
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-800 p-4 rounded-lg text-center">
              <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <div className="font-bold text-white">2 Players</div>
              <div className="text-sm text-gray-400">Head-to-head strategy</div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg text-center">
              <Clock className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <div className="font-bold text-white">15-30 Minutes</div>
              <div className="text-sm text-gray-400">Strategic gameplay</div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg text-center">
              <Target className="w-8 h-8 text-red-400 mx-auto mb-2" />
              <div className="font-bold text-white">Territorial</div>
              <div className="text-sm text-gray-400">Control & positioning</div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "setup",
      title: "Game Setup",
      icon: <Grid3x3 className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <div className="bg-blue-950/30 border border-blue-600 rounded-lg p-4">
            <h4 className="font-bold text-blue-400 mb-2 flex items-center gap-2">
              <Grid3x3 className="w-4 h-4" />
              Board & Pieces
            </h4>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                Game is played on a <strong className="text-white">7×7 grid</strong>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                Each player has <strong className="text-white">4 pieces</strong> of their color (red or blue)
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                <strong className="text-white">2 pieces</strong> start in fixed positions for each player
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                Players alternate placing their remaining <strong className="text-white">2 pieces</strong> anywhere on the board
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                Each turn has a <strong className="text-white">90-second time limit</strong>
              </li>
            </ul>
          </div>
          
          <div className="bg-gray-800 p-4 rounded-lg">
            <h4 className="font-bold text-white mb-2">Starting Positions</h4>
            <div className="text-sm text-gray-300 space-y-2">
              <div>
                <span className="text-red-400 font-bold">Red Player:</span> B2, F6
              </div>
              <div>
                <span className="text-blue-400 font-bold">Blue Player:</span> B6, F2
              </div>
              <div className="text-xs text-gray-400 mt-2">
                (Board coordinates: columns A-G, rows 1-7)
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "gameplay",
      title: "How to Play",
      icon: <Play className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <div className="bg-red-950/30 border border-red-600 rounded-lg p-4">
            <h4 className="font-bold text-red-400 mb-3 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Turn Structure
            </h4>
            <div className="space-y-3">
              <div className="bg-black/40 rounded p-3 border-l-2 border-red-500">
                <span className="font-semibold text-red-400">Step 1: Select & Move</span>
                <p className="mt-1 text-sm text-gray-300">
                  Click on one of your pieces to select it. You can move it <strong className="text-white">0, 1, or 2 spaces</strong> in any cardinal direction (up, down, left, right). You cannot move through walls or other pieces.
                </p>
              </div>
              
              <div className="bg-black/40 rounded p-3 border-l-2 border-yellow-500">
                <span className="font-semibold text-yellow-400">Step 2: Place Wall</span>
                <p className="mt-1 text-sm text-gray-300">
                  After moving, you <strong className="text-white">must place a wall</strong> of your color adjacent to your piece's new position. Walls are permanent and block movement for all pieces.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-blue-950/30 border border-blue-600 rounded-lg p-4">
            <h4 className="font-bold text-blue-400 mb-2">Movement Rules</h4>
            <ul className="space-y-1 text-sm text-gray-300">
              <li>• You can stay in place (0 movement) if you want</li>
              <li>• You can move 1 or 2 spaces in one direction</li>
              <li>• Only move in cardinal directions (no diagonals)</li>
              <li>• Cannot move through walls</li>
              <li>• Cannot move through other pieces</li>
              <li>• Cannot land on occupied squares</li>
            </ul>
          </div>

          <div className="bg-yellow-950/30 border border-yellow-600 rounded-lg p-4">
            <h4 className="font-bold text-yellow-400 mb-2">Wall Placement Rules</h4>
            <ul className="space-y-1 text-sm text-gray-300">
              <li>• Must place wall after every move</li>
              <li>• Wall must be adjacent to your piece's new position</li>
              <li>• Walls can be horizontal or vertical</li>
              <li>• Walls are permanent once placed</li>
              <li>• Walls block all pieces from moving through them</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: "winning",
      title: "How to Win",
      icon: <Crown className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-yellow-900/30 to-yellow-800/30 border border-yellow-600 rounded-lg p-6 text-center">
            <Crown className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <h4 className="text-2xl font-bold text-yellow-400 mb-2">Victory Condition</h4>
            <p className="text-gray-300 mb-2">
              The player who controls the <strong className="text-white">largest territory</strong> when the game ends wins!
            </p>
            <div className="text-sm text-gray-400">
              Territory = number of squares your pieces can reach
            </div>
          </div>

          <div className="bg-green-950/30 border border-green-600 rounded-lg p-4">
            <h4 className="font-bold text-green-400 mb-3">When Does the Game End?</h4>
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full mt-1.5 flex-shrink-0"></div>
                <div>
                  <strong className="text-white">Separated Territories:</strong> When no piece can reach an opponent's piece (all pieces are isolated by walls)
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full mt-1.5 flex-shrink-0"></div>
                <div>
                  <strong className="text-white">No Valid Moves:</strong> When neither player can make a valid move
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full mt-1.5 flex-shrink-0"></div>
                <div>
                  <strong className="text-white">All Walls Placed:</strong> When all available wall slots are occupied
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 p-4 rounded-lg">
            <h4 className="font-bold text-white mb-3">Territory Calculation</h4>
            <p className="text-sm text-gray-300 mb-2">
              Your territory consists of all squares that your pieces can reach through valid movement (following movement rules and not passing through walls).
            </p>
            <div className="bg-black/40 p-3 rounded mt-2">
              <div className="text-sm text-gray-400">
                Example: If your piece can move to a square following the movement rules without being blocked by walls, that square counts as part of your territory.
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "strategy",
      title: "Strategy Tips",
      icon: <BrainCircuit className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-950/30 border border-blue-600 rounded-lg p-4">
              <h4 className="font-bold text-blue-400 mb-2">Opening Strategy</h4>
              <ul className="space-y-1 text-sm text-gray-300">
                <li>• Place your initial pieces strategically</li>
                <li>• Control the center for maximum potential</li>
                <li>• Consider future wall placements</li>
                <li>• Don't get boxed in early</li>
              </ul>
            </div>
            <div className="bg-green-950/30 border border-green-600 rounded-lg p-4">
              <h4 className="font-bold text-green-400 mb-2">Mid-Game Tactics</h4>
              <ul className="space-y-1 text-sm text-gray-300">
                <li>• Build walls to divide the board</li>
                <li>• Trap opponent pieces in small areas</li>
                <li>• Expand your reachable territory</li>
                <li>• Block opponent expansion paths</li>
              </ul>
            </div>
          </div>

          <div className="bg-yellow-950/30 border border-yellow-600 rounded-lg p-4">
            <h4 className="font-bold text-yellow-400 mb-3">Key Strategic Concepts</h4>
            <div className="space-y-3">
              <div>
                <div className="font-bold text-white">Territory Control</div>
                <div className="text-sm text-gray-300">Focus on creating large connected areas that your pieces can reach. Each square your pieces can access counts!</div>
              </div>
              <div>
                <div className="font-bold text-white">Wall Planning</div>
                <div className="text-sm text-gray-300">Every wall is permanent - think several moves ahead before placing one. Walls can help you or hurt you!</div>
              </div>
              <div>
                <div className="font-bold text-white">Piece Positioning</div>
                <div className="text-sm text-gray-300">Keep your pieces spread out to maximize territory coverage, but not so spread that they can't support each other.</div>
              </div>
              <div>
                <div className="font-bold text-white">Containment</div>
                <div className="text-sm text-gray-300">Try to box in your opponent's pieces while keeping yours free to expand. The player with more freedom usually wins.</div>
              </div>
            </div>
          </div>

          <div className="bg-red-950/30 border border-red-600 rounded-lg p-4">
            <h4 className="font-bold text-red-400 mb-2">Common Mistakes</h4>
            <ul className="space-y-1 text-sm text-gray-300">
              <li>• Placing walls that trap your own pieces</li>
              <li>• Focusing only on blocking opponent without expanding</li>
              <li>• Clustering all pieces in one area</li>
              <li>• Not planning ahead - remember walls are permanent!</li>
            </ul>
          </div>
        </div>
      )
    }
  ]

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">
            <span className="text-red-500">Wall Baduk</span> - Game Rules
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Master the art of territory control and strategic wall placement. 
            Read the rules below to become a Wall Baduk champion!
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-4">
          {sections.map((section) => (
            <Card key={section.id} className="bg-gray-900 border-gray-800">
              <CardHeader 
                className="cursor-pointer hover:bg-gray-800/50 transition-colors"
                onClick={() => toggleSection(section.id)}
              >
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-red-400">
                      {section.icon}
                    </div>
                    <span>{section.title}</span>
                  </div>
                  <div className="text-gray-400">
                    {expandedSection === section.id ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              {expandedSection === section.id && (
                <CardContent>
                  {section.content}
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        <div className="max-w-4xl mx-auto mt-8 text-center">
          <div className="bg-red-950/30 border border-red-600 rounded-lg p-6">
            <h3 className="text-xl font-bold text-red-400 mb-2">Ready to Play?</h3>
            <p className="text-gray-300 mb-4">
              Now that you understand the rules, put your strategic skills to the test!
            </p>
            <Link href="/games/wallBaduk"> 
              <Button className="bg-red-600 hover:bg-red-700 text-white">
                Start Playing Wall Baduk
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
