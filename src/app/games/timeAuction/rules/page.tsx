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
  Timer, 
  Eye, 
  Award, 
  Brain,
  ChevronDown,
  ChevronUp,
  Play,
  Crown,
  Zap,
  AlertTriangle,
} from "lucide-react"

export default function TimeAuctionRules() {
  const [expandedSection, setExpandedSection] = useState("overview")

interface Section {
    id: string
    title: string
    icon: React.ReactNode
    content: React.ReactNode
}

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
            <strong className="text-white">Time Auction</strong> is an intense psychological showdown that challenges memory, nerve, and strategy. Players bid from a limited time bank to win victory tokens over 19 rounds, where every second counts and mental fortitude determines the winner.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-800 p-4 rounded-lg text-center">
              <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <div className="font-bold text-white">Multiple Players</div>
              <div className="text-sm text-gray-400">Psychological warfare</div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg text-center">
              <Clock className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <div className="font-bold text-white">10 Minutes</div>
              <div className="text-sm text-gray-400">Per player time bank</div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg text-center">
              <Brain className="w-8 h-8 text-red-400 mx-auto mb-2" />
              <div className="font-bold text-white">Mental Strategy</div>
              <div className="text-sm text-gray-400">Memory & nerve</div>
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
              <Timer className="w-4 h-4" />
              Initial Setup
            </h4>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                Each player receives a hidden <strong className="text-white">"time bank" of 10 minutes</strong> 
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                Time is measured in <strong className="text-white">tenths of a second</strong> for precision
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                Game is played over <strong className="text-white">19 rounds</strong> total
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                All players start with <strong className="text-white">0 victory tokens</strong>
              </li>
            </ul>
          </div>
          
          <div className="bg-gray-800 p-4 rounded-lg">
            <h4 className="font-bold text-white mb-2">Information Limits</h4>
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-red-400" />
                <span>Players cannot see their remaining time</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-red-400" />
                <span>Other players' time banks remain completely hidden</span>
              </div>
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-yellow-400" />
                <span>Players must mentally track their spending</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "gameplay",
      title: "Round Mechanics",
      icon: <Play className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="bg-gray-800 border-l-4 border-yellow-500 p-4">
              <h4 className="font-bold text-yellow-400 mb-2 flex items-center gap-2">
                <span className="bg-yellow-500 text-black rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</span>
                Entry Decision (5 seconds)
              </h4>
              <p className="text-gray-300 mb-3">
                All players press and hold a concealed button. During the <strong className="text-white">5-second countdown</strong>, players can choose to opt out by releasing early.
              </p>
              <div className="bg-gray-900 p-3 rounded">
                <div className="text-sm text-gray-400 mb-2">Decision Point:</div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-green-400">Hold button = Enter auction (risk time)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-red-400">Release early = Opt out (safe)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 border-l-4 border-blue-500 p-4">
              <h4 className="font-bold text-blue-400 mb-2 flex items-center gap-2">
                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</span>
                Time Auction Phase
              </h4>
              <p className="text-gray-300 mb-3">
                Participating players' time banks begin <strong className="text-white">counting down</strong>. To bid, release the button when you've spent your desired amount.
              </p>
              <div className="bg-gray-900 p-3 rounded">
                <div className="text-sm text-gray-400 mb-2">Auction in Progress:</div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Timer className="w-4 h-4 text-blue-400" />
                    <span className="text-gray-300">Time counting down: 598.7s, 598.6s, 598.5s...</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <span className="text-gray-300">Release button = Lock in your bid</span>
                  </div>
                </div>
                <div className="text-xs text-yellow-400 mt-2">
                  <AlertTriangle className="w-3 h-3 inline mr-1" />
                  Once spent, time cannot be recovered!
                </div>
              </div>
            </div>

            <div className="bg-gray-800 border-l-4 border-green-500 p-4">
              <h4 className="font-bold text-green-400 mb-2 flex items-center gap-2">
                <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</span>
                Resolution & Winner
              </h4>
              <p className="text-gray-300 mb-3">
                The player who spent the <strong className="text-white">most time</strong> wins the round and receives 1 victory token.
              </p>
              <div className="bg-gray-900 p-3 rounded">
                <div className="text-sm text-gray-400 mb-2">Example Resolution:</div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-6 bg-green-600 rounded text-xs font-bold flex items-center justify-center text-white border-2 border-green-400">4.7s</div>
                    <Crown className="w-4 h-4 text-yellow-400" />
                    <span className="text-green-400 font-bold">WINNER! +1 Victory Token</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-6 bg-gray-600 rounded text-xs font-bold flex items-center justify-center text-white">3.2s</div>
                    <span className="text-gray-400">Second highest bid</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-6 bg-gray-600 rounded text-xs font-bold flex items-center justify-center text-white">1.8s</div>
                    <span className="text-gray-400">Lower bid</span>
                  </div>
                </div>
                <div className="text-xs text-blue-400 mt-2">
                  <Eye className="w-3 h-3 inline mr-1" />
                  Only the winner is revealed - other bids remain anonymous
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "rules",
      title: "Critical Rules",
      icon: <AlertTriangle className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <div className="bg-red-950/30 border border-red-600 rounded-lg p-4">
            <h4 className="font-bold text-red-400 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Tie Breaking Rule
            </h4>
            <div className="bg-gray-800 p-3 rounded">
              <div className="text-white font-bold mb-1">If bids are tied within one-tenth of a second:</div>
              <div className="text-red-400 font-bold">NO VICTORY TOKENS are awarded that round</div>
              <div className="text-xs text-gray-400 mt-1">Example: 3.2s and 3.1s = tie, no winner</div>
            </div>
          </div>

          <div className="bg-yellow-950/30 border border-yellow-600 rounded-lg p-4">
            <h4 className="font-bold text-yellow-400 mb-3 flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Information Warfare
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-800 p-3 rounded">
                <div className="text-green-400 font-bold mb-1">Revealed</div>
                <div className="text-gray-300 text-sm">• Round winners only</div>
                <div className="text-gray-300 text-sm">• Time during active bidding</div>
              </div>
              <div className="bg-gray-800 p-3 rounded">
                <div className="text-red-400 font-bold mb-1">Hidden</div>
                <div className="text-gray-300 text-sm">• Other participants' identities</div>
                <div className="text-gray-300 text-sm">• Losing bid amounts</div>
                <div className="text-gray-300 text-sm">• Everyone's remaining time</div>
              </div>
            </div>
          </div>

          <div className="bg-blue-950/30 border border-blue-600 rounded-lg p-4">
            <h4 className="font-bold text-blue-400 mb-3 flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Mental Tracking Required
            </h4>
            <div className="space-y-2 text-gray-300">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                Players must <strong className="text-white">mentally calculate</strong> their remaining time
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                No displays show time except during active auctions
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                Strategic memory becomes crucial for late-game decisions
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "scoring",
      title: "Final Scoring",
      icon: <Award className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <div className="bg-yellow-950/30 border border-yellow-600 rounded-lg p-4">
            <h4 className="font-bold text-yellow-400 mb-3 flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              After 19 Rounds
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-800 p-3 rounded">
                <div className="text-green-400 font-bold mb-1">Winner Determination</div>
                <div className="text-gray-300 text-sm">1. Most victory tokens wins</div>
                <div className="text-gray-300 text-sm">2. If tied: Most time remaining wins</div>
                <div className="text-gray-300 text-sm">3. If both tied: No piece awarded</div>
              </div>
              <div className="bg-gray-800 p-3 rounded">
                <div className="text-red-400 font-bold mb-1">Elimination</div>
                <div className="text-gray-300 text-sm">1. Fewest victory tokens eliminated</div>
                <div className="text-gray-300 text-sm">2. If tied: Least time remaining eliminated</div>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 p-4 rounded-lg">
            <h4 className="font-bold text-white mb-3">Scoring Example</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center py-1 border-b border-gray-700">
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-yellow-400" />
                  <span className="font-bold">#1 Alice</span>
                </div>
                <div className="text-right">
                  <div className="text-yellow-400 font-bold">8 tokens</div>
                  <div className="text-xs text-green-400">247.3s remaining</div>
                </div>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-gray-700">
                <div className="flex items-center gap-2">
                  <span className="w-4 text-center font-bold">#2</span>
                  <span>Bob</span>
                </div>
                <div className="text-right">
                  <div className="text-yellow-400 font-bold">7 tokens</div>
                  <div className="text-xs text-green-400">189.7s remaining</div>
                </div>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-red-600">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span className="text-red-400">Charlie (Eliminated)</span>
                </div>
                <div className="text-right">
                  <div className="text-red-400 font-bold">2 tokens</div>
                  <div className="text-xs text-red-400">15.2s remaining</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "strategy",
      title: "Strategic Mastery",
      icon: <Target className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-950/30 border border-blue-600 rounded-lg p-4">
              <h4 className="font-bold text-blue-400 mb-2">Risk vs. Reward</h4>
              <ul className="space-y-1 text-sm text-gray-300">
                <li>• Spending more time increases win chances</li>
                <li>• But depletes your precious time bank</li>
                <li>• Conservative bidding preserves time</li>
                <li>• Aggressive plays can backfire</li>
              </ul>
            </div>
            <div className="bg-green-950/30 border border-green-600 rounded-lg p-4">
              <h4 className="font-bold text-green-400 mb-2">Psychological Warfare</h4>
              <ul className="space-y-1 text-sm text-gray-300">
                <li>• Hidden participation creates uncertainty</li>
                <li>• Winners revealed = psychological pressure</li>
                <li>• Bluff with participation decisions</li>
                <li>• Read opponent patterns</li>
              </ul>
            </div>
          </div>

          <div className="bg-yellow-950/30 border border-yellow-600 rounded-lg p-4">
            <h4 className="font-bold text-yellow-400 mb-3">Advanced Strategies</h4>
            <div className="space-y-3">
              <div>
                <div className="font-bold text-white">Time Bank Management</div>
                <div className="text-sm text-gray-300">Balance aggressive early plays vs. endgame preservation</div>
              </div>
              <div>
                <div className="font-bold text-white">Participation Psychology</div>
                <div className="text-sm text-gray-300">Use opt-outs strategically to confuse opponents</div>
              </div>
              <div>
                <div className="font-bold text-white">Endgame Planning</div>
                <div className="text-sm text-gray-300">Remember: time remaining breaks ties - plan accordingly</div>
              </div>
              <div>
                <div className="font-bold text-white">Mental Mathematics</div>
                <div className="text-sm text-gray-300">Track spending precisely - every tenth of a second matters</div>
              </div>
            </div>
          </div>

          <div className="bg-red-950/30 border border-red-600 rounded-lg p-4">
            <h4 className="font-bold text-red-400 mb-2 flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Mental Fortitude Required
            </h4>
            <p className="text-gray-300 text-sm">
              Success demands nerves of steel, precise mental arithmetic, and the ability to make split-second decisions under extreme pressure while your time bank depletes in real-time.
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
            Master the ultimate test of psychological warfare and strategic time management. 
            Every second counts in this intense battle of nerves and mental fortitude!
          </p>
        </div>

        <div className="space-y-4 max-w-4xl mx-auto">
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

        <div className="mt-8 text-center max-w-4xl mx-auto">
          <div className="bg-red-950/30 border border-red-600 rounded-lg p-6">
            <h3 className="text-xl font-bold text-red-400 mb-2">Ready for the Ultimate Challenge?</h3>
            <p className="text-gray-300 mb-4">
              Test your nerve, strategy, and mental fortitude in this psychological battle!
            </p>
            <Link href="/games/timeAuction">
            <Button className="bg-red-600 hover:bg-red-700">
              Enter Time Auction
            </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}