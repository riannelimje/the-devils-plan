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
  Hand, 
  Eye, 
  Award, 
  Timer,
  ChevronDown,
  ChevronUp,
  Play,
  Crown,
  AlertCircle
} from "lucide-react"

export default function TimeAuction2Rules() {
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
            <strong className="text-white">Time Auction</strong> is a strategic bidding game where players use their limited time bank to win tokens. The key is managing your time wisely while predicting when opponents will give up.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-800 p-4 rounded-lg text-center">
              <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <div className="font-bold text-white">2+ Players</div>
              <div className="text-sm text-gray-400">Multiplayer competition</div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg text-center">
              <Clock className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <div className="font-bold text-white">10-20 Minutes</div>
              <div className="text-sm text-gray-400">Fast-paced rounds</div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg text-center">
              <Target className="w-8 h-8 text-red-400 mx-auto mb-2" />
              <div className="font-bold text-white">Psychological</div>
              <div className="text-sm text-gray-400">Timing & prediction</div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "setup",
      title: "Game Setup",
      icon: <Timer className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <div className="bg-blue-950/30 border border-blue-600 rounded-lg p-4">
            <h4 className="font-bold text-blue-400 mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Initial Setup
            </h4>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                Each player starts with <strong className="text-white">10 minutes (600 seconds)</strong> in their time bank
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                All players start with <strong className="text-white">0 tokens</strong>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                Game is played over <strong className="text-white">19 rounds</strong> (customizable)
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                Time is tracked to <strong className="text-white">0.1 second precision</strong>
              </li>
            </ul>
          </div>
          
          <div className="bg-gray-800 p-4 rounded-lg">
            <h4 className="font-bold text-white mb-2">What You See</h4>
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-yellow-400" />
                <span>Who won each round (their name and token count)</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <span className="text-red-300">Your time remaining is HIDDEN from everyone (including yourself)</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-400" />
                <span>A timer counting UP from 0 during auctions (for reference only)</span>
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
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="bg-gray-800 border-l-4 border-yellow-500 p-4">
              <h4 className="font-bold text-yellow-400 mb-2 flex items-center gap-2">
                <span className="bg-yellow-500 text-black rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</span>
                Waiting Phase
              </h4>
              <p className="text-gray-300 mb-3">
                All players must <strong className="text-white">press and hold</strong> their button (or spacebar) to signal they're ready for the auction.
              </p>
              <div className="bg-gray-900 p-3 rounded">
                <div className="text-sm text-gray-400 mb-2">Action:</div>
                <div className="flex items-center gap-2">
                  <Hand className="w-6 h-6 text-red-400" />
                  <span className="text-white">Press and hold your button or spacebar</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 border-l-4 border-blue-500 p-4">
              <h4 className="font-bold text-blue-400 mb-2 flex items-center gap-2">
                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</span>
                Countdown Phase (5 seconds)
              </h4>
              <p className="text-gray-300 mb-3">
                Once all players are holding, a <strong className="text-white">5-second countdown</strong> begins.
              </p>
              <div className="bg-gray-900 p-3 rounded space-y-2">
                <div className="text-sm text-gray-400">During countdown:</div>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Keep holding to enter the auction</li>
                  <li>• Release to abandon (no time spent, no chance to win)</li>
                  <li>• A large countdown number is displayed: 5... 4... 3... 2... 1...</li>
                </ul>
              </div>
            </div>

            <div className="bg-gray-800 border-l-4 border-red-500 p-4">
              <h4 className="font-bold text-red-400 mb-2 flex items-center gap-2">
                <span className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</span>
                Auction Phase
              </h4>
              <p className="text-gray-300 mb-3">
                After countdown, the auction begins. <strong className="text-white">Time starts counting from your time bank</strong> while you hold.
              </p>
              <div className="bg-gray-900 p-3 rounded space-y-3">
                <div>
                  <div className="text-sm text-gray-400 mb-1">What you see:</div>
                  <div className="text-4xl font-mono font-bold text-red-400 text-center my-2">0:05.3</div>
                  <div className="text-xs text-gray-500 text-center">↑ Elapsed time (counting UP from 0)</div>
                </div>
                <div className="border-t border-gray-700 pt-2">
                  <div className="text-sm text-yellow-400 font-bold mb-1">
                    <AlertCircle className="w-3 h-3 inline mr-1" />
                    Important:
                  </div>
                  <ul className="text-xs text-gray-300 space-y-1">
                    <li>• Your actual time remaining is HIDDEN</li>
                    <li>• You don't know how much time you have left</li>
                    <li>• Release when you think you've outlasted everyone</li>
                    <li>• If you run out of time, you're automatically released</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 border-l-4 border-green-500 p-4">
              <h4 className="font-bold text-green-400 mb-2 flex items-center gap-2">
                <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">4</span>
                Determine Winner
              </h4>
              <p className="text-gray-300 mb-3">
                The <strong className="text-white">last player still holding</strong> wins the round and earns 1 token.
              </p>
              <div className="bg-gray-900 p-3 rounded">
                <div className="text-sm text-gray-400 mb-2">Winner conditions:</div>
                <div className="space-y-2 text-sm text-gray-300">
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-yellow-400" />
                    <span>Last player holding = Winner (+1 token)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-orange-400" />
                    <span>If 2+ players release at exactly the same time (to 0.1s) = No winner</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "scoring",
      title: "Scoring & Time Management",
      icon: <Award className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <div className="bg-yellow-950/30 border border-yellow-600 rounded-lg p-4">
            <h4 className="font-bold text-yellow-400 mb-3 flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              How Tokens Work
            </h4>
            <div className="space-y-3">
              <div className="bg-gray-800 p-3 rounded">
                <div className="text-green-400 font-bold mb-1">Win a Round</div>
                <div className="text-gray-300">Last player holding earns +1 token</div>
              </div>
              <div className="bg-gray-800 p-3 rounded">
                <div className="text-red-400 font-bold mb-1">Tie</div>
                <div className="text-gray-300">If multiple players tie for longest time, no one gets a token</div>
              </div>
            </div>
          </div>

          <div className="bg-red-950/30 border border-red-600 rounded-lg p-4">
            <h4 className="font-bold text-red-400 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Time Deduction
            </h4>
            <div className="space-y-3 text-gray-300">
              <p>
                Time spent holding during the <strong className="text-white">auction phase</strong> (after countdown) is deducted from your time bank.
              </p>
              <div className="bg-gray-800 p-3 rounded">
                <div className="font-bold text-white mb-2">Example:</div>
                <div className="text-sm space-y-1">
                  <div>• You start with 600.0 seconds</div>
                  <div>• Round 1: You hold for 12.3 seconds → 587.7 seconds remaining</div>
                  <div>• Round 2: You hold for 8.5 seconds → 579.2 seconds remaining</div>
                  <div className="text-yellow-400">• Your remaining time is always hidden!</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-950/30 border border-blue-600 rounded-lg p-4">
            <h4 className="font-bold text-blue-400 mb-3">What Happens If You Run Out of Time?</h4>
            <p className="text-gray-300">
              If your time bank reaches 0, you are <strong className="text-white">automatically released</strong> from the current auction. You can still participate in future rounds if you manage to win some back... but you won't have any time left to bid!
            </p>
          </div>
        </div>
      )
    },
    {
      id: "strategy",
      title: "Strategy Tips",
      icon: <Target className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-950/30 border border-blue-600 rounded-lg p-4">
              <h4 className="font-bold text-blue-400 mb-2">Early Game</h4>
              <ul className="space-y-1 text-sm text-gray-300">
                <li>• Test the waters with small time commitments</li>
                <li>• Observe opponent behavior patterns</li>
                <li>• Don't spend too much too early</li>
                <li>• Remember: you can't see your own time!</li>
              </ul>
            </div>
            <div className="bg-green-950/30 border border-green-600 rounded-lg p-4">
              <h4 className="font-bold text-green-400 mb-2">Late Game</h4>
              <ul className="space-y-1 text-sm text-gray-300">
                <li>• Estimate how much time you might have left</li>
                <li>• Watch who's winning tokens</li>
                <li>• Decide when to go all-in vs. conserve</li>
                <li>• Predict when opponents are running low</li>
              </ul>
            </div>
          </div>

          <div className="bg-yellow-950/30 border border-yellow-600 rounded-lg p-4">
            <h4 className="font-bold text-yellow-400 mb-3">Key Strategic Concepts</h4>
            <div className="space-y-3">
              <div>
                <div className="font-bold text-white">Chicken Game</div>
                <div className="text-sm text-gray-300">It's a psychological battle - who will release first? The longer you wait, the more time you risk.</div>
              </div>
              <div>
                <div className="font-bold text-white">Memory & Tracking</div>
                <div className="text-sm text-gray-300">Try to estimate your remaining time based on how long you've held in previous rounds.</div>
              </div>
              <div>
                <div className="font-bold text-white">Risk Management</div>
                <div className="text-sm text-gray-300">Sometimes it's better to abandon early and save time for crucial rounds.</div>
              </div>
              <div>
                <div className="font-bold text-white">Bluffing</div>
                <div className="text-sm text-gray-300">You can bluff by holding longer than expected, or release early to make opponents think you're out of time.</div>
              </div>
            </div>
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
            <h4 className="text-2xl font-bold text-yellow-400 mb-2">Victory Conditions</h4>
            <p className="text-gray-300 mb-2">
              The player with the <strong className="text-white">most tokens</strong> at the end of 19 rounds wins!
            </p>
            <div className="text-sm text-gray-400">
              Tiebreaker: Most time remaining wins
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-800 p-4 rounded-lg">
              <h4 className="font-bold text-green-400 mb-2">Primary Goal</h4>
              <div className="text-gray-300">Win as many rounds as possible to collect tokens</div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <h4 className="font-bold text-yellow-400 mb-2">Tiebreaker</h4>
              <div className="text-gray-300">If tied on tokens, most time remaining wins</div>
            </div>
          </div>

          <div className="bg-gray-800 p-4 rounded-lg">
            <h4 className="font-bold text-white mb-3">Final Standings Example</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center py-1 border-b border-gray-700">
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-yellow-400" />
                  <span className="font-bold">#1 Alice</span>
                </div>
                <div className="text-right">
                  <div className="text-yellow-400 font-bold">12 tokens</div>
                  <div className="text-xs text-gray-400">145.2s remaining</div>
                </div>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-gray-700">
                <div className="flex items-center gap-2">
                  <span className="w-4 text-center font-bold">#2</span>
                  <span>Bob</span>
                </div>
                <div className="text-right">
                  <div className="text-yellow-400 font-bold">10 tokens</div>
                  <div className="text-xs text-gray-400">203.7s remaining</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-red-950/30 border border-red-600 rounded-lg p-4">
            <h4 className="font-bold text-red-400 mb-2">Elimination Rule</h4>
            <p className="text-gray-300 text-sm">
              At the end of the game, the player with the <strong className="text-white">fewest tokens</strong> is eliminated and loses the overall competition.
            </p>
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
            <span className="text-red-500">Time Auction</span> - Game Rules
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Master the art of timing and psychological warfare in this high-stakes bidding game. 
            Read the rules below to become a Time Auction champion!
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
              Now that you understand the rules, put your timing and psychology skills to the test!
            </p>
            <Link href="/games/timeAuction2"> 
              <Button className="bg-red-600 hover:bg-red-700 text-white">
                Start Playing Time Auction
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
