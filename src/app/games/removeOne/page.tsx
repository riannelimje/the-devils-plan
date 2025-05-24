"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Users, Clock, Trophy, Target } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import Header from "@/components/header"

interface Player {
  id: number
  name: string
  deck: number[]
  holdingBox: number[]
  tempUnavailable: number[]
  points: number
  victoryTokens: number
  isEliminated: boolean
  selectedCards: [number, number] | null
  finalChoice: "left" | "right" | null
  finalCard: number | null
}

interface GameState {
  players: Player[]
  currentRound: number
  totalRounds: number
  survivalRounds: number[]
  gamePhase: "setup" | "cardSelection" | "finalChoice" | "reveal" | "roundEnd" | "survival" | "gameOver"
  roundWinner: number | null
  eliminatedPlayer: number | null
  gameStarted: boolean
}

const INITIAL_DECK = [1, 2, 3, 4, 5, 6, 7, 8]

export default function RemoveOneGame() {
  const [gameState, setGameState] = useState<GameState>({
    players: [],
    currentRound: 1,
    totalRounds: 18,
    survivalRounds: [3, 6, 9, 12, 18],
    gamePhase: "setup",
    roundWinner: null,
    eliminatedPlayer: null,
    gameStarted: false,
  })

  const [setupForm, setSetupForm] = useState({
    numPlayers: 7,
    totalRounds: 18,
    survivalRounds: "3,6,9,12,18",
  })

  // Initialize players
  const initializePlayers = () => {
    const players: Player[] = []
    for (let i = 0; i < setupForm.numPlayers; i++) {
      players.push({
        id: i,
        name: `Player ${i + 1}`,
        deck: [...INITIAL_DECK],
        holdingBox: [],
        tempUnavailable: [],
        points: 0,
        victoryTokens: 0,
        isEliminated: false,
        selectedCards: null,
        finalChoice: null,
        finalCard: null,
      })
    }

    const survivalRounds = setupForm.survivalRounds
      .split(",")
      .map((r) => Number.parseInt(r.trim()))
      .filter((r) => !isNaN(r))

    setGameState({
      ...gameState,
      players,
      totalRounds: setupForm.totalRounds,
      survivalRounds,
      gameStarted: true,
      gamePhase: "cardSelection",
    })
  }

  // Get available cards for a player
  const getAvailableCards = (player: Player) => {
    return player.deck.filter((card) => !player.holdingBox.includes(card) && !player.tempUnavailable.includes(card))
  }

  // Handle card selection
  const selectCards = (playerId: number, cards: [number, number]) => {
    setGameState((prev) => ({
      ...prev,
      players: prev.players.map((p) => (p.id === playerId ? { ...p, selectedCards: cards } : p)),
    }))
  }

  // Handle final choice (left or right)
  const makeFinalChoice = (playerId: number, choice: "left" | "right") => {
    setGameState((prev) => ({
      ...prev,
      players: prev.players.map((p) => {
        if (p.id === playerId && p.selectedCards) {
          const finalCard = choice === "left" ? p.selectedCards[0] : p.selectedCards[1]
          return { ...p, finalChoice: choice, finalCard }
        }
        return p
      }),
    }))
  }

  // Check if all active players have made their choices
  const allPlayersReady = (phase: string) => {
    const activePlayers = gameState.players.filter((p) => !p.isEliminated)

    if (phase === "cardSelection") {
      return activePlayers.every((p) => p.selectedCards !== null)
    }

    if (phase === "finalChoice") {
      return activePlayers.every((p) => p.finalChoice !== null)
    }

    return false
  }

  // Process round results
  const processRound = () => {
    const activePlayers = gameState.players.filter((p) => !p.isEliminated)
    const submissions = activePlayers.map((p) => ({
      playerId: p.id,
      card: p.finalCard!,
    }))

    // Find lowest unique number
    const cardCounts = submissions.reduce(
      (acc, sub) => {
        acc[sub.card] = (acc[sub.card] || 0) + 1
        return acc
      },
      {} as Record<number, number>,
    )

    const uniqueCards = submissions.filter((sub) => cardCounts[sub.card] === 1)
    const lowestUnique = uniqueCards.length > 0 ? Math.min(...uniqueCards.map((sub) => sub.card)) : null

    const winner = lowestUnique ? submissions.find((sub) => sub.card === lowestUnique)?.playerId : null

    // Update game state
    setGameState((prev) => ({
      ...prev,
      players: prev.players.map((p) => {
        if (p.isEliminated) return p

        const isWinner = p.id === winner
        const usedCard = p.finalCard!
        const unusedCard = p.selectedCards!.find((card) => card !== usedCard)!

        return {
          ...p,
          points: p.points + (isWinner ? usedCard : 0),
          victoryTokens: p.victoryTokens + (isWinner ? 1 : 0),
          holdingBox: isWinner ? [...p.holdingBox, usedCard] : p.holdingBox,
          tempUnavailable: !isWinner ? [unusedCard] : [],
          selectedCards: null,
          finalChoice: null,
          finalCard: null,
        }
      }),
      roundWinner: winner ?? null,
      gamePhase: "roundEnd",
    }))
  }

  // Move to next round
  const nextRound = () => {
    const isSurvivalRound = gameState.survivalRounds.includes(gameState.currentRound)

    if (isSurvivalRound) {
      setGameState((prev) => ({ ...prev, gamePhase: "survival" }))
    } else {
      // Return temp unavailable cards and move to next round
      setGameState((prev) => ({
        ...prev,
        currentRound: prev.currentRound + 1,
        players: prev.players.map((p) => ({
          ...p,
          tempUnavailable: [],
        })),
        gamePhase: "cardSelection",
        roundWinner: null,
      }))
    }
  }

  // Handle survival round
  const processSurvival = () => {
    const activePlayers = gameState.players.filter((p) => !p.isEliminated)

    // Add victory token bonus
    const playersWithBonus = activePlayers.map((p) => ({
      ...p,
      totalScore: p.points + p.victoryTokens,
    }))

    // Find player with lowest score
    const lowestScore = Math.min(...playersWithBonus.map((p) => p.totalScore))
    const eliminatedPlayer = playersWithBonus.find((p) => p.totalScore === lowestScore)

    // Check for deck reset rounds
    const shouldResetDeck = [6, 12].includes(gameState.currentRound)

    setGameState((prev) => ({
      ...prev,
      players: prev.players.map((p) => {
        const shouldEliminate = p.id === eliminatedPlayer?.id
        return {
          ...p,
          isEliminated: p.isEliminated || shouldEliminate,
          deck: shouldResetDeck && !shouldEliminate ? [...INITIAL_DECK] : p.deck,
          holdingBox: shouldResetDeck && !shouldEliminate ? [] : p.holdingBox,
          tempUnavailable: [],
        }
      }),
      eliminatedPlayer: eliminatedPlayer?.id || null,
      currentRound: prev.currentRound + 1,
      gamePhase: gameState.currentRound >= gameState.totalRounds ? "gameOver" : "cardSelection",
    }))
  }

  // Auto-advance phases when all players are ready
  useEffect(() => {
    if (gameState.gamePhase === "cardSelection" && allPlayersReady("cardSelection")) {
      setTimeout(() => {
        setGameState((prev) => ({ ...prev, gamePhase: "finalChoice" }))
      }, 1000)
    }

    if (gameState.gamePhase === "finalChoice" && allPlayersReady("finalChoice")) {
      setTimeout(() => {
        setGameState((prev) => ({ ...prev, gamePhase: "reveal" }))
        processRound()
      }, 1000)
    }
  }, [gameState.gamePhase, gameState.players])

  if (!gameState.gameStarted) {
    return (
      <div className="flex flex-col min-h-screen bg-black text-white">
        <Header />

        <main className="flex-1 container mx-auto px-4 py-12">
          <div className="mb-6">
            <Link href="/" className="text-gray-400 hover:text-white flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Games
            </Link>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-4">
                <span className="text-red-500">Remove One</span>
              </h1>
              <p className="text-gray-400">
                A strategic elimination game where survival depends on playing the lowest unique card
              </p>
            </div>

            <Tabs defaultValue="setup" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gray-900">
                <TabsTrigger value="setup" className="text-white data-[state=active]:text-purple-500">Game Setup</TabsTrigger>
                <TabsTrigger value="rules" className="text-white data-[state=active]:text-purple-500">Rules</TabsTrigger>
              </TabsList>

              <TabsContent value="setup" className="bg-gray-900 border border-gray-800 rounded-b-xl p-6">
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="numPlayers">Number of Players</Label>
                    <Input
                      id="numPlayers"
                      type="number"
                      min="3"
                      max="12"
                      value={setupForm.numPlayers}
                      onChange={(e) =>
                        setSetupForm((prev) => ({
                          ...prev,
                          numPlayers: Number.parseInt(e.target.value) || 3,
                        }))
                      }
                      className="bg-gray-800 border-gray-700"
                    />
                  </div>

                  <div>
                    <Label htmlFor="totalRounds">Total Rounds</Label>
                    <Input
                      id="totalRounds"
                      type="number"
                      min="5"
                      max="30"
                      value={setupForm.totalRounds}
                      onChange={(e) =>
                        setSetupForm((prev) => ({
                          ...prev,
                          totalRounds: Number.parseInt(e.target.value) || 18,
                        }))
                      }
                      className="bg-gray-800 border-gray-700"
                    />
                  </div>

                  <div>
                    <Label htmlFor="survivalRounds">Survival Rounds (comma-separated)</Label>
                    <Input
                      id="survivalRounds"
                      value={setupForm.survivalRounds}
                      onChange={(e) =>
                        setSetupForm((prev) => ({
                          ...prev,
                          survivalRounds: e.target.value,
                        }))
                      }
                      className="bg-gray-800 border-gray-700"
                      placeholder="3,6,9,12,18"
                    />
                  </div>

                  <Button onClick={initializePlayers} className="w-full bg-red-600 hover:bg-red-700">
                    Start Game
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="rules" className="bg-gray-900 border border-gray-800 rounded-b-xl p-6">
                <div className="space-y-4 text-gray-300">
                  <h3 className="text-xl font-bold text-white">Game Overview</h3>
                  <p>
                    "Remove One" is a high-stakes elimination game where players strategically play numbered cards to
                    survive elimination rounds.
                  </p>

                  <h4 className="font-bold text-white">Setup</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Each player receives cards numbered 1 through 8</li>
                    <li>Game consists of multiple rounds with designated survival rounds</li>
                    <li>Players select two cards each round, then choose one as their final submission</li>
                  </ul>

                  <h4 className="font-bold text-white">Gameplay</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Players simultaneously select two cards from their available deck</li>
                    <li>Players secretly choose left or right card as their final submission</li>
                    <li>All final cards are revealed simultaneously</li>
                    <li>Player with the lowest unique number wins the round</li>
                    <li>Winner gets points equal to their card value plus a victory token</li>
                    <li>Used winning card goes to holding box (unavailable next round)</li>
                    <li>Unused card is temporarily unavailable but returns after one round</li>
                  </ul>

                  <h4 className="font-bold text-white">Elimination</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>At survival rounds, points are tallied (including victory token bonuses)</li>
                    <li>Player with lowest total score is eliminated</li>
                    <li>Decks reset after certain rounds (typically rounds 6 and 12)</li>
                    <li>Game continues until final elimination round</li>
                  </ul>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    )
  }

  // Game interface
  const activePlayers = gameState.players.filter((p) => !p.isEliminated)
  const currentPlayer = activePlayers[0] // For demo, we'll control Player 1

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="mb-6">
          <Link href="/" className="text-gray-400 hover:text-white flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Games
          </Link>
        </div>

        {/* Game Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Remove One - Round {gameState.currentRound}</h1>
          <div className="flex justify-center gap-4 text-sm">
            <Badge variant="outline" className="border-blue-500 text-blue-400">
              <Clock className="w-4 h-4 mr-1" />
              Round {gameState.currentRound}/{gameState.totalRounds}
            </Badge>
            <Badge variant="outline" className="border-green-500 text-green-400">
              <Users className="w-4 h-4 mr-1" />
              {activePlayers.length} Players Active
            </Badge>
            {gameState.survivalRounds.includes(gameState.currentRound) && (
              <Badge variant="outline" className="border-red-500 text-red-400">
                <Target className="w-4 h-4 mr-1" />
                Survival Round
              </Badge>
            )}
          </div>
        </div>

        {/* Game Phase Display */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Player Status */}
          <div className="lg:col-span-2">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>Player Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {gameState.players.map((player) => (
                    <div
                      key={player.id}
                      className={`p-4 rounded-lg border ${
                        player.isEliminated ? "bg-red-950/30 border-red-800" : "bg-gray-800 border-gray-700"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-bold">{player.name}</h3>
                        {player.isEliminated && <Badge variant="destructive">Eliminated</Badge>}
                      </div>
                      <div className="text-sm space-y-1">
                        <div>Points: {player.points}</div>
                        <div>Victory Tokens: {player.victoryTokens}</div>
                        <div>Available Cards: {getAvailableCards(player).length}</div>
                        {gameState.gamePhase === "reveal" && player.finalCard && (
                          <div className="text-purple-400">Played: {player.finalCard}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Game Controls */}
          <div>
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>Game Controls</CardTitle>
                <CardDescription>
                  {gameState.gamePhase === "cardSelection" && "Select two cards"}
                  {gameState.gamePhase === "finalChoice" && "Choose left or right card"}
                  {gameState.gamePhase === "reveal" && "Round results"}
                  {gameState.gamePhase === "roundEnd" && "Round complete"}
                  {gameState.gamePhase === "survival" && "Survival round!"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {gameState.gamePhase === "cardSelection" && currentPlayer && (
                  <div>
                    <p className="mb-4">Available cards for {currentPlayer.name}:</p>
                    <div className="grid grid-cols-4 gap-2 mb-4">
                      {getAvailableCards(currentPlayer).map((card) => (
                        <button
                          key={card}
                          className="p-2 bg-gray-700 hover:bg-gray-600 rounded border"
                          onClick={() => {
                            // For demo, auto-select two cards
                            const available = getAvailableCards(currentPlayer)
                            if (available.length >= 2) {
                              selectCards(currentPlayer.id, [available[0], available[1]])
                            }
                          }}
                        >
                          {card}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {gameState.gamePhase === "finalChoice" && currentPlayer?.selectedCards && (
                  <div>
                    <p className="mb-4">Choose your final card:</p>
                    <div className="flex gap-4">
                      <Button
                        onClick={() => makeFinalChoice(currentPlayer.id, "left")}
                        className="flex-1"
                        variant={currentPlayer.finalChoice === "left" ? "default" : "outline"}
                      >
                        Left: {currentPlayer.selectedCards[0]}
                      </Button>
                      <Button
                        onClick={() => makeFinalChoice(currentPlayer.id, "right")}
                        className="flex-1"
                        variant={currentPlayer.finalChoice === "right" ? "default" : "outline"}
                      >
                        Right: {currentPlayer.selectedCards[1]}
                      </Button>
                    </div>
                  </div>
                )}

                {gameState.gamePhase === "roundEnd" && (
                  <div className="text-center">
                    {gameState.roundWinner !== null ? (
                      <div className="mb-4">
                        <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                        <p>Player {gameState.roundWinner + 1} wins this round!</p>
                      </div>
                    ) : (
                      <p className="mb-4">No winner this round (no unique lowest card)</p>
                    )}
                    <Button onClick={nextRound} className="bg-blue-600 hover:bg-blue-700">
                      Continue
                    </Button>
                  </div>
                )}

                {gameState.gamePhase === "survival" && (
                  <div className="text-center">
                    <Target className="w-8 h-8 text-red-500 mx-auto mb-2" />
                    <p className="mb-4">Survival Round!</p>
                    {gameState.eliminatedPlayer !== null && (
                      <p className="text-red-400 mb-4">Player {gameState.eliminatedPlayer + 1} has been eliminated!</p>
                    )}
                    <Button onClick={processSurvival} className="bg-red-600 hover:bg-red-700">
                      Continue
                    </Button>
                  </div>
                )}

                {gameState.gamePhase === "gameOver" && (
                  <div className="text-center">
                    <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-4">Game Over!</h2>
                    <p>Final standings:</p>
                    <div className="mt-4">
                      {gameState.players
                        .sort((a, b) => b.points + b.victoryTokens - (a.points + a.victoryTokens))
                        .map((player, index) => (
                          <div key={player.id} className="flex justify-between py-1">
                            <span>
                              #{index + 1} {player.name}
                            </span>
                            <span>{player.points + player.victoryTokens} pts</span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
