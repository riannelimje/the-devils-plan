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
  Shuffle, 
  Eye, 
  Award, 
  Snowflake,
  ChevronDown,
  ChevronUp,
  Play,
  Crown
} from "lucide-react"

export default function RemoveOneRules() {
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
            <strong className="text-white">Remove One</strong> is a strategic card game where players compete to win rounds by playing the lowest unique card. Players must carefully manage their limited deck while predicting opponents' moves.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-800 p-4 rounded-lg text-center">
              <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <div className="font-bold text-white">2-8 Players</div>
              <div className="text-sm text-gray-400">Multiplayer strategy</div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg text-center">
              <Clock className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <div className="font-bold text-white">15-30 Minutes</div>
              <div className="text-sm text-gray-400">Quick rounds</div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg text-center">
              <Target className="w-8 h-8 text-red-400 mx-auto mb-2" />
              <div className="font-bold text-white">Strategic</div>
              <div className="text-sm text-gray-400">Mind games & bluffing</div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "setup",
      title: "Game Setup",
      icon: <Shuffle className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <div className="bg-blue-950/30 border border-blue-600 rounded-lg p-4">
            <h4 className="font-bold text-blue-400 mb-2 flex items-center gap-2">
              <Shuffle className="w-4 h-4" />
              Initial Setup
            </h4>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                Each player receives a personal deck of 8 cards numbered <strong className="text-white">1 through 8</strong>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                All players start with <strong className="text-white">0 points</strong> and <strong className="text-white">0 victory tokens</strong>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                Game is played over <strong className="text-white">10 rounds</strong> (customisable)
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                The card deck resets after <strong className="text-white">round 6 and round 12</strong>
              </li>
            </ul>
          </div>
          
          <div className="grid grid-cols-4 gap-2 max-w-sm">
            <div className="text-center">
              <div className="text-xs text-gray-400 mb-1">Your Deck</div>
              <div className="grid grid-cols-4 gap-1">
                {[1,2,3,4,5,6,7,8].map(num => (
                  <div key={num} className="w-8 h-8 bg-red-600 border border-red-400 rounded text-xs font-bold flex items-center justify-center text-white">
                    {num}
                  </div>
                ))}
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
                Card Selection Phase
              </h4>
              <p className="text-gray-300 mb-3">
                Each round, all players simultaneously select <strong className="text-white">exactly 2 cards</strong> from their available deck.
              </p>
              <div className="bg-gray-900 p-3 rounded">
                <div className="text-sm text-gray-400 mb-2">Example Selection:</div>
                <div className="flex gap-2">
                  <div className="w-10 h-10 bg-red-600 border-2 border-red-400 rounded flex items-center justify-center font-bold text-white shadow-lg">3</div>
                  <div className="w-10 h-10 bg-red-600 border-2 border-red-400 rounded flex items-center justify-center font-bold text-white shadow-lg">7</div>
                  <div className="text-gray-500 flex items-center">← Selected cards</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 border-l-4 border-blue-500 p-4">
              <h4 className="font-bold text-blue-400 mb-2 flex items-center gap-2">
                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</span>
                Reveal & Final Choice
              </h4>
              <p className="text-gray-300 mb-3">
                All players reveal their 2 selected cards, then <strong className="text-white">secretly choose 1 card</strong> as their final submission.
              </p>
              <div className="bg-gray-900 p-3 rounded">
                <div className="text-sm text-gray-400 mb-2">All players see each other's selections:</div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm w-16">Player 1:</span>
                    <div className="w-8 h-8 bg-red-600 rounded text-xs font-bold flex items-center justify-center text-white">3</div>
                    <div className="w-8 h-8 bg-red-600 rounded text-xs font-bold flex items-center justify-center text-white">7</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm w-16">Player 2:</span>
                    <div className="w-8 h-8 bg-red-600 rounded text-xs font-bold flex items-center justify-center text-white">2</div>
                    <div className="w-8 h-8 bg-red-600 rounded text-xs font-bold flex items-center justify-center text-white">5</div>
                  </div>
                </div>
                <div className="text-xs text-yellow-400 mt-2">
                  <Eye className="w-3 h-3 inline mr-1" />
                  Now each player secretly picks their final card...
                </div>
              </div>
            </div>

            <div className="bg-gray-800 border-l-4 border-green-500 p-4">
              <h4 className="font-bold text-green-400 mb-2 flex items-center gap-2">
                <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</span>
                Determine Winner
              </h4>
              <p className="text-gray-300 mb-3">
                The player with the <strong className="text-white">lowest unique number</strong> wins the round.
              </p>
              <div className="bg-gray-900 p-3 rounded">
                <div className="text-sm text-gray-400 mb-2">Final cards revealed:</div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm w-16">Player 1:</span>
                    <div className="w-8 h-8 bg-red-600 rounded text-xs font-bold flex items-center justify-center text-white">3</div>
                    <span className="text-xs text-gray-400">← Not unique (Player 3 also has 3)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm w-16">Player 2:</span>
                    <div className="w-8 h-8 bg-green-600 rounded text-xs font-bold flex items-center justify-center text-white border-2 border-green-400">5</div>
                    <Crown className="w-4 h-4 text-yellow-400" />
                    <span className="text-xs text-green-400 font-bold">WINNER! (Lowest unique)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm w-16">Player 3:</span>
                    <div className="w-8 h-8 bg-red-600 rounded text-xs font-bold flex items-center justify-center text-white">3</div>
                    <span className="text-xs text-gray-400">← Not unique</span>
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
      title: "Scoring & Rewards",
      icon: <Award className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <div className="bg-yellow-950/30 border border-yellow-600 rounded-lg p-4">
            <h4 className="font-bold text-yellow-400 mb-3 flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Round Winner Rewards
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-800 p-3 rounded">
                <div className="text-green-400 font-bold mb-1">Points</div>
                <div className="text-gray-300">Gain points equal to your winning card number</div>
                <div className="text-xs text-gray-400 mt-1">Win with card 5 = +5 points</div>
              </div>
              <div className="bg-gray-800 p-3 rounded">
                <div className="text-yellow-400 font-bold mb-1">Victory Token</div>
                <div className="text-gray-300">Receive +1 victory token</div>
                <div className="text-xs text-gray-400 mt-1">Used for final scoring</div>
              </div>
            </div>
          </div>

          <div className="bg-red-950/30 border border-red-600 rounded-lg p-4">
            <h4 className="font-bold text-red-400 mb-3 flex items-center gap-2">
              <Snowflake className="w-4 h-4" />
              Card Management
            </h4>
            <div className="space-y-3">
              <div className="bg-gray-800 p-3 rounded">
                <div className="text-red-400 font-bold mb-1">Winning/Losing Card</div>
                <div className="text-gray-300">This card will be discarded</div>
              </div>
              <div className="bg-gray-800 p-3 rounded">
                <div className="text-orange-400 font-bold mb-1">Unused Card</div>
                <div className="text-gray-300">Returns to your deck after one round break</div>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 p-4 rounded-lg">
            <h4 className="font-bold text-white mb-2">Scoring Example</h4>
            <div className="text-sm space-y-1 text-gray-300">
              <div>Round 1: Win with card 3 → +3 points, +1 token, card 3 discarded, card 8 frozen</div>
              <div>Round 2: Win with card 7 → +7 points, +1 token, card 7 discarded</div>
              <div>Round 3: Card 8 returns from round 1</div>
            </div>
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
                <li>• Save low cards (1-3) for crucial moments</li>
                <li>• Test opponents with mid-range cards</li>
                <li>• Observe opponent patterns</li>
              </ul>
            </div>
            <div className="bg-green-950/30 border border-green-600 rounded-lg p-4">
              <h4 className="font-bold text-green-400 mb-2">Late Game</h4>
              <ul className="space-y-1 text-sm text-gray-300">
                <li>• Track frozen opponent cards</li>
                <li>• Predict desperate plays</li>
                <li>• Manage final card carefully</li>
              </ul>
            </div>
          </div>

          <div className="bg-yellow-950/30 border border-yellow-600 rounded-lg p-4">
            <h4 className="font-bold text-yellow-400 mb-3">Key Strategic Concepts</h4>
            <div className="space-y-3">
              <div>
                <div className="font-bold text-white">Bluffing</div>
                <div className="text-sm text-gray-300">Select high and low cards to confuse opponents about your final choice</div>
              </div>
              <div>
                <div className="font-bold text-white">Deck Management</div>
                <div className="text-sm text-gray-300">Balance winning rounds vs. preserving powerful low cards</div>
              </div>
              <div>
                <div className="font-bold text-white">Opponent Tracking</div>
                <div className="text-sm text-gray-300">Remember which cards are frozen and predict available options</div>
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
            <p className="text-gray-300">
              The player with the <strong className="text-white">most points</strong> at the end of all rounds wins the game!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-800 p-4 rounded-lg">
              <h4 className="font-bold text-green-400 mb-2">Primary Goal</h4>
              <div className="text-gray-300">Accumulate the highest total points by winning rounds</div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <h4 className="font-bold text-yellow-400 mb-2">Tiebreaker</h4>
              <div className="text-gray-300">Most victory tokens wins if points are tied</div>
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
                  <div className="text-green-400 font-bold">43 points</div>
                  <div className="text-xs text-yellow-400">7 tokens</div>
                </div>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-gray-700">
                <div className="flex items-center gap-2">
                  <span className="w-4 text-center font-bold">#2</span>
                  <span>Bob</span>
                </div>
                <div className="text-right">
                  <div className="text-green-400 font-bold">38 points</div>
                  <div className="text-xs text-yellow-400">5 tokens</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ]

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
    <Header />
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">
          <span className="text-red-500">Remove One</span> - Game Rules
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Master the art of strategic card play in this psychological battle of wits. 
          Read the rules below to become a Remove One champion!
        </p>
      </div>

      <div className="space-y-4">
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

      <div className="mt-8 text-center">
        <div className="bg-red-950/30 border border-red-600 rounded-lg p-6">
          <h3 className="text-xl font-bold text-red-400 mb-2">Ready to Play?</h3>
          <p className="text-gray-300 mb-4">
            Now that you understand the rules, put your strategy to the test!
          </p>
          <Link href="/games/removeOne"> 
            <Button className="bg-red-600 hover:bg-red-700 text-white">
                Start Playing Remove One
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}