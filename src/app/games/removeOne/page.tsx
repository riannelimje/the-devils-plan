"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Users, Clock, Wifi, WifiOff, Eye, CheckCircle, Trophy, Bug } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import Header from "@/components/header"
import { useSupabaseGame } from "@/hooks/useSupabaseGame"

export default function RemoveOneGame() {
  const {
    room,
    players,
    currentPlayerId,
    isConnected,
    error,
    debugInfo,
    isProcessingRound,
    createRoom,
    joinRoom,
    startGame,
    selectCard,
    submitCardSelection,
    makeFinalChoice,
    submitFinalChoice,
    continueToNextRound,
    forceProcessRound,
  } = useSupabaseGame()

  const [playerName, setPlayerName] = useState("")
  const [roomCodeInput, setRoomCodeInput] = useState("")
  const [showDebug, setShowDebug] = useState(false)
  const [gameSettings, setGameSettings] = useState({
    totalRounds: 10,
    minPlayers: 2,
  })

  // Get current player
  const currentPlayer = players.find((p) => p.id === currentPlayerId)
  const isHost = currentPlayer?.is_host || false

  // Get available cards for current player (deck minus holding box)
  const getAvailableCards = (player: any) => {
    if (!player?.player_data) return []
    const { deck, holdingBox } = player.player_data
    return deck.filter((card: number) => !holdingBox.includes(card))
  }

  // Handle create room
  const handleCreateRoom = async () => {
    if (!playerName.trim()) return

    try {
      await createRoom(playerName.trim(), {
        ...gameSettings,
        maxPlayers: gameSettings.minPlayers,
      })
    } catch (err) {
      console.error("Failed to create room:", err)
    }
  }

  // Handle join room
  const handleJoinRoom = async () => {
    if (!playerName.trim() || !roomCodeInput.trim()) return

    try {
      await joinRoom(roomCodeInput.trim().toUpperCase(), playerName.trim())
    } catch (err) {
      console.error("Failed to join room:", err)
    }
  }

  // Handle card selection
  const handleCardSelection = (card: number) => {
    if (!currentPlayer || currentPlayer.player_data.hasSubmittedCards) return
    selectCard(card)
  }

  // Handle submit cards
  const handleSubmitCards = () => {
    if (!currentPlayer?.player_data.selectedCards) return
    const validSelected = currentPlayer.player_data.selectedCards.filter((c) => c !== -1)
    if (validSelected.length !== 2) return
    submitCardSelection()
  }

  // Handle final choice
  const handleFinalChoice = (choice: "left" | "right") => {
    makeFinalChoice(choice)
  }

  // Handle submit final choice
  const handleSubmitFinalChoice = () => {
    if (!currentPlayer?.player_data.finalCard || currentPlayer.player_data.hasSubmittedFinalChoice) return
    submitFinalChoice()
  }

  // Check if all players have submitted
  const allPlayers = players.filter((p) => true) // No elimination
  const allPlayersSubmittedCards = allPlayers.length > 0 && allPlayers.every((p) => p.player_data.hasSubmittedCards)
  const allPlayersSubmittedFinal =
    allPlayers.length > 0 && allPlayers.every((p) => p.player_data.hasSubmittedFinalChoice)

  // Get round winner
  const roundWinner = room?.game_state.roundWinner ? players.find((p) => p.id === room.game_state.roundWinner) : null

  // Lobby/Connection Screen
  if (!room?.game_state.gameStarted) {
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
                <span className="text-red-500">Remove One</span> - Multiplayer
              </h1>
              <p className="text-gray-400">Accumulate points by playing the lowest unique card each round!</p>
              <Link href="/games/removeOne/rules" className="text-blue-400 hover:underline mt-2 inline-block">
                View Game Rules
              </Link>

              {/* Connection Status */}
              <div className="flex items-center justify-center gap-2 mt-4">
                {isConnected ? (
                  <>
                    <Wifi className="w-4 h-4 text-green-500" />
                    <span className="text-green-500">Connected</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-4 h-4 text-red-500" />
                    <span className="text-red-500">Disconnected - enter or create a game</span>
                  </>
                )}
              </div>
            </div>

            {error && (
              <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 mb-6">
                <p className="text-red-200">{error}</p>
              </div>
            )}

            {room ? (
              // In Room - Lobby
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Room: {room.room_code}
                    {isHost && <Badge className="bg-yellow-600">Host</Badge>}
                  </CardTitle>
                  <CardDescription>Share this room code with other players</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-bold mb-2">
                        Players ({players.length}/{gameSettings.minPlayers || room.game_settings.minPlayers || 2})
                      </h3>
                      <div className="space-y-2">
                        {players.map((player) => (
                          <div key={player.id} className="flex items-center justify-between p-2 bg-gray-800 rounded">
                            <span>
                              {player.player_name}
                              {player.id === currentPlayerId && " (You)"}
                            </span>
                            <div className="flex gap-2">
                              {player.is_host && <Badge variant="outline">Host</Badge>}
                              {player.is_connected && <Badge className="bg-green-600">Online</Badge>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {isHost && (
                      <Button
                        onClick={startGame}
                        className="w-full bg-red-600 hover:bg-red-700"
                        disabled={players.length < (room.game_settings.minPlayers || 2)}
                      >
                        Start Game ({players.length}/{room.game_settings.minPlayers || 2} min players)
                      </Button>
                    )}

                    {!isHost && <div className="text-center text-gray-400">Waiting for host to start the game...</div>}
                  </div>
                </CardContent>
              </Card>
            ) : (
              // Join/Create Room
              <Tabs defaultValue="join" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-gray-900">
                  <TabsTrigger value="join">Join Game</TabsTrigger>
                  <TabsTrigger value="create">Create Game</TabsTrigger>
                </TabsList>

                <TabsContent value="join" className="bg-gray-900 border border-gray-800 rounded-b-xl p-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="playerName">Your Name</Label>
                      <Input
                        id="playerName"
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        className="bg-gray-800 border-gray-700"
                        placeholder="Enter your name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="roomCode">Room Code</Label>
                      <Input
                        id="roomCode"
                        value={roomCodeInput}
                        onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                        className="bg-gray-800 border-gray-700"
                        placeholder="Enter room code"
                      />
                    </div>
                    <Button onClick={handleJoinRoom} className="w-full bg-blue-600 hover:bg-blue-700">
                      Join Game
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="create" className="bg-gray-900 border border-gray-800 rounded-b-xl p-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="hostName">Your Name</Label>
                      <Input
                        id="hostName"
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        className="bg-gray-800 border-gray-700"
                        placeholder="Enter your name"
                      />
                    </div>

                    <div>
                      <Label>Number of Players</Label>
                      <select
                        value={gameSettings.minPlayers}
                        onChange={(e) =>
                          setGameSettings((prev) => ({
                            ...prev,
                            minPlayers: Number(e.target.value),
                          }))
                        }
                        className="bg-gray-800 border-gray-700 rounded px-3 py-2 w-full text-white"
                      >
                        {[2, 3, 4, 5, 6, 7, 8].map((num) => (
                          <option key={num} value={num}>
                            {num}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <Label>Total Rounds</Label>
                      <select
                        value={gameSettings.totalRounds}
                        onChange={(e) =>
                          setGameSettings((prev) => ({
                            ...prev,
                            totalRounds: Number.parseInt(e.target.value) || 10,
                          }))
                        }
                        className="bg-gray-800 border-gray-700 rounded px-3 py-2 w-full text-white"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18].map((num) => (
                          <option key={num} value={num}>
                            {num}
                          </option>
                        ))}
                      </select>
                    </div>

                    <Button onClick={handleCreateRoom} className="w-full bg-red-600 hover:bg-red-700">
                      Create Game
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </div>
        </main>
      </div>
    )
  }

  // Game Interface
  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="mb-6 flex justify-between items-center">
          <Link href="/" className="text-gray-400 hover:text-white flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Games
          </Link>
          <div className="flex items-center gap-2 text-sm">
            <span>Room: {room.room_code}</span>
            <Wifi className="w-4 h-4 text-green-500" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDebug(!showDebug)}
              className="text-gray-400 hover:text-white"
            >
              <Bug className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Debug Info */}
        {showDebug && (
          <Card className="bg-gray-900 border-gray-800 mb-6">
            <CardHeader>
              <CardTitle className="text-sm">Debug Info</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs space-y-1 font-mono">
                <div>Phase: {room.game_state.gamePhase}</div>
                <div>Round: {room.game_state.currentRound}</div>
                <div>Processing: {isProcessingRound ? "Yes" : "No"}</div>
                <div>All Cards Submitted: {allPlayersSubmittedCards ? "Yes" : "No"}</div>
                <div>All Final Submitted: {allPlayersSubmittedFinal ? "Yes" : "No"}</div>
                <div>Players: {allPlayers.length}</div>
                <div>
                  Card Submissions:{" "}
                  {allPlayers.map((p) => `${p.player_name}:${p.player_data.hasSubmittedCards ? "✓" : "✗"}`).join(", ")}
                </div>
                <div>
                  Final Submissions:{" "}
                  {allPlayers
                    .map((p) => `${p.player_name}:${p.player_data.hasSubmittedFinalChoice ? "✓" : "✗"}`)
                    .join(", ")}
                </div>
                {debugInfo && <div>Debug: {debugInfo}</div>}
              </div>
              {isHost && (
                <div className="mt-2 space-x-2">
                  <Button onClick={forceProcessRound} className="bg-orange-600 hover:bg-orange-700" size="sm">
                    Force Process Round
                  </Button>
                  {room.game_state.gamePhase === "roundResults" && (
                    <Button onClick={continueToNextRound} className="bg-blue-600 hover:bg-blue-700" size="sm">
                      Force Next Round
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Processing Indicator */}
        {(debugInfo || isProcessingRound) && (
          <div className="max-w-4xl mx-auto mb-4">
            <div className="bg-blue-900/50 border border-blue-500 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <div className="animate-spin w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full"></div>
                <span className="text-blue-200">{debugInfo || "Processing..."}</span>
                {isHost && isProcessingRound && (
                  <Button onClick={forceProcessRound} size="sm" variant="outline" className="ml-auto text-xs">
                    Force Continue
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Game Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Remove One - Round {room.game_state.currentRound}</h1>
          <div className="flex justify-center gap-4 text-sm">
            <Badge variant="outline" className="border-blue-500 text-blue-400">
              <Clock className="w-4 h-4 mr-1" />
              Round {room.game_state.currentRound}/{room.game_settings.totalRounds}
            </Badge>
            <Badge variant="outline" className="border-green-500 text-green-400">
              <Users className="w-4 h-4 mr-1" />
              {allPlayers.length} Players
            </Badge>
          </div>
        </div>

        {/* Game Controls */}
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle>Game Controls</CardTitle>
              <CardDescription className="text-gray-300">
                {room.game_state.gamePhase === "cardSelection" && "Select two cards and submit"}
                {room.game_state.gamePhase === "finalChoice" && "Choose your final card from your selection"}
                {room.game_state.gamePhase === "roundResults" && "Round results"}
                {room.game_state.gamePhase === "gameOver" && "Game finished!"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Card Selection Phase */}
              {room.game_state.gamePhase === "cardSelection" && currentPlayer && (
                <div>
                  {!currentPlayer.player_data.hasSubmittedCards ? (
                    <>
                      <p className="mb-4 text-white">Select exactly 2 cards:</p>
                      <div className="grid grid-cols-4 gap-2 mb-4 max-w-md">
                        {getAvailableCards(currentPlayer).map((card: number, idx: number, arr: number[]) => {
                          const selectedCards = currentPlayer.player_data.selectedCards || []
                          const validSelected = selectedCards.filter((c) => c !== -1)
                          const isSelected = validSelected.includes(card)
                          const isLastCard = idx === arr.length - 1
                          // Only disable the last card from round 2 onwards
                          // Disable last card except on rounds 7 and 13
                          const shouldDisableLastCard =
                            isLastCard &&
                            room.game_state.currentRound >= 2 &&
                            room.game_state.currentRound !== 7 &&
                            room.game_state.currentRound !== 13
                          return (
                            <button
                              key={card}
                              className={`p-3 rounded border-2 transition-all text-white font-bold ${
                                isSelected
                                  ? "bg-red-600 border-red-400 shadow-lg transform scale-105"
                                  : "bg-gray-700 border-gray-600 hover:bg-gray-600 hover:border-gray-500"
                              } ${shouldDisableLastCard ? "opacity-50 cursor-not-allowed" : ""}`}
                              onClick={() => handleCardSelection(card)}
                              disabled={shouldDisableLastCard || (!isSelected && validSelected.length >= 2)}
                            >
                              {card}
                            </button>
                          )
                        })}
                      </div>
                      <div className="text-sm text-gray-300 mb-4">
                        Selected: {currentPlayer.player_data.selectedCards?.filter((c) => c !== -1).length || 0}/2 cards
                        {currentPlayer.player_data.selectedCards && (
                          <span className="ml-2 text-white">
                            [{currentPlayer.player_data.selectedCards.filter((c) => c !== -1).join(", ")}]
                          </span>
                        )}
                      </div>
                      {currentPlayer.player_data.holdingBox.length > 0 && (
                        <div className="text-xs text-orange-400 mb-4">
                          Cards frozen this round: [{currentPlayer.player_data.holdingBox.join(", ")}]
                        </div>
                      )}
                      <Button
                        onClick={handleSubmitCards}
                        className="bg-green-600 hover:bg-green-700"
                        disabled={
                          !currentPlayer.player_data.selectedCards ||
                          currentPlayer.player_data.selectedCards.filter((c) => c !== -1).length !== 2
                        }
                      >
                        Submit Cards
                      </Button>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                      <p className="text-green-400 font-bold mb-2">Cards Submitted!</p>
                      <p className="text-gray-400">
                        Waiting for other players... ({allPlayers.filter((p) => p.player_data.hasSubmittedCards).length}
                        /{allPlayers.length})
                      </p>
                      <div className="mt-4">
                        <p className="text-sm text-gray-300">
                          Your cards: [{currentPlayer.player_data.selectedCards?.filter((c) => c !== -1).join(", ")}]
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Combined Final Choice Phase (shows everyone's cards + final choice) */}
              {room.game_state.gamePhase === "finalChoice" && currentPlayer && (
                <div>
                  <div className="flex items-center gap-2 mb-6">
                    <Eye className="w-5 h-5 text-blue-400" />
                    <h3 className="text-xl font-bold">All Players Card Selections</h3>
                  </div>

                  {/* Show all players' cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    {allPlayers.map((player) => (
                      <div
                        key={player.id}
                        className={`p-4 rounded-lg border ${
                          player.id === currentPlayerId
                            ? "bg-blue-950/30 border-blue-600"
                            : "bg-gray-800 border-gray-700"
                        }`}
                      >
                        <h4 className="font-bold mb-2">
                          {player.player_name} {player.id === currentPlayerId && "(You)"}
                        </h4>
                        <div className="flex gap-2">
                          {player.player_data.selectedCards
                            ?.filter((c) => c !== -1)
                            .map((card, index) => (
                              <div
                                key={index}
                                className="w-12 h-12 bg-red-600 border border-red-400 rounded flex items-center justify-center font-bold text-white"
                              >
                                {card}
                              </div>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Final choice for current player */}
                  {!currentPlayer.player_data.hasSubmittedFinalChoice ? (
                    <>
                      <p className="mb-4 text-white">Choose your final card:</p>
                      <div className="flex gap-4 max-w-md mb-4">
                        <Button
                          onClick={() => handleFinalChoice("left")}
                          className={`flex-1 text-white font-bold ${
                            currentPlayer.player_data.finalChoice === "left"
                              ? "bg-red-600 hover:bg-red-700"
                              : "bg-gray-700 hover:bg-gray-600 border border-gray-600"
                          }`}
                          variant={currentPlayer.player_data.finalChoice === "left" ? "default" : "outline"}
                        >
                          Left: {currentPlayer.player_data.selectedCards?.[0]}
                        </Button>
                        <Button
                          onClick={() => handleFinalChoice("right")}
                          className={`flex-1 text-white font-bold ${
                            currentPlayer.player_data.finalChoice === "right"
                              ? "bg-red-600 hover:bg-red-700"
                              : "bg-gray-700 hover:bg-gray-600 border border-gray-600"
                          }`}
                          variant={currentPlayer.player_data.finalChoice === "right" ? "default" : "outline"}
                        >
                          Right: {currentPlayer.player_data.selectedCards?.[1]}
                        </Button>
                      </div>
                      <Button
                        onClick={handleSubmitFinalChoice}
                        className="bg-green-600 hover:bg-green-700"
                        disabled={!currentPlayer.player_data.finalChoice}
                      >
                        Submit Final Choice
                      </Button>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                      <p className="text-green-400 font-bold mb-2">Final Choice Submitted!</p>
                      <p className="text-gray-400">
                        Waiting for other players... (
                        {allPlayers.filter((p) => p.player_data.hasSubmittedFinalChoice).length}/{allPlayers.length})
                      </p>
                      <div className="mt-4">
                        <p className="text-sm text-gray-300">Your final card: {currentPlayer.player_data.finalCard}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Round Results Phase */}
              {room.game_state.gamePhase === "roundResults" && (
                <div>
                  <div className="flex items-center gap-2 mb-6">
                    <Trophy className="w-5 h-5 text-yellow-400" />
                    <h3 className="text-xl font-bold">Round Results</h3>
                  </div>

                  {/* Show all final cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {allPlayers.map((player) => (
                      <div
                        key={player.id}
                        className={`p-4 rounded-lg border ${
                          player.id === room.game_state.roundWinner
                            ? "bg-yellow-950/30 border-yellow-600"
                            : player.id === currentPlayerId
                              ? "bg-blue-950/30 border-blue-600"
                              : "bg-gray-800 border-gray-700"
                        }`}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-bold">
                            {player.player_name} {player.id === currentPlayerId && "(You)"}
                          </h4>
                          {player.id === room.game_state.roundWinner && (
                            <Badge className="bg-yellow-600">Winner!</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-12 bg-red-600 border border-red-400 rounded flex items-center justify-center font-bold text-white">
                            {player.player_data.finalCard}
                          </div>
                          {player.id === room.game_state.roundWinner && (
                            <div className="text-sm text-yellow-400">
                              +{player.player_data.finalCard} points, +1 victory token
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {roundWinner ? (
                    <div className="text-center mb-6">
                      <p className="text-lg font-bold text-yellow-400">
                        🎉 {roundWinner.player_name} wins with the lowest unique card (
                        {roundWinner.player_data.finalCard})!
                      </p>
                    </div>
                  ) : (
                    <div className="text-center mb-6">
                      <p className="text-lg font-bold text-gray-400">
                        🤝 It&apos;s a draw! No unique lowest card this round.
                      </p>
                    </div>
                  )}

                  {isHost && (
                    <div className="text-center">
                      <Button onClick={continueToNextRound} className="bg-blue-600 hover:bg-blue-700">
                        {room.game_state.currentRound >= room.game_settings.totalRounds
                          ? "End Game"
                          : "Continue to Next Round"}
                      </Button>
                    </div>
                  )}
                  {!isHost && <div className="text-center text-gray-400">Waiting for host to continue...</div>}
                </div>
              )}

              {/* Game Over */}
              {room.game_state.gamePhase === "gameOver" && (
                <div className="text-center py-8">
                  <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                  <h2 className="text-3xl font-bold mb-6">Game Over!</h2>
                  <div className="bg-gray-800 rounded-lg p-6 max-w-md mx-auto">
                    <h3 className="text-xl font-bold mb-4">Final Standings</h3>
                    {players
                      .sort((a, b) => b.player_data.points - a.player_data.points)
                      .map((player, index) => (
                        <div key={player.id} className="flex justify-between items-center py-2">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold">#{index + 1}</span>
                            <span>{player.player_name}</span>
                            {index === 0 && <Trophy className="w-4 h-4 text-yellow-500" />}
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-green-400">{player.player_data.points} pts</div>
                            <div className="text-xs text-yellow-400">{player.player_data.victoryTokens} tokens</div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Players Status */}
          <Card className="bg-gray-900 border-gray-800 mt-6">
            <CardHeader>
              <CardTitle>Players</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {players.map((player) => (
                  <div
                    key={player.id}
                    className={`p-4 rounded-lg border ${
                      player.id === currentPlayerId ? "bg-blue-950/30 border-blue-600" : "bg-gray-800 border-gray-700"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-bold text-white">
                        {player.player_name} {player.id === currentPlayerId && "(You)"}
                      </h3>
                      <div className="flex gap-1">
                        {player.is_host && <Badge variant="outline">Host</Badge>}
                        {room.game_state.gamePhase === "cardSelection" && player.player_data.hasSubmittedCards && (
                          <Badge className="bg-green-600">Submitted</Badge>
                        )}
                        {room.game_state.gamePhase === "finalChoice" && player.player_data.hasSubmittedFinalChoice && (
                          <Badge className="bg-green-600">Submitted</Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-sm space-y-1 text-gray-300">
                      <div className="text-white">
                        Points: <span className="text-green-400">{player.player_data.points}</span>
                      </div>
                      <div className="text-white">
                        Victory Tokens: <span className="text-yellow-400">{player.player_data.victoryTokens}</span>
                      </div>
                      <div className="text-white">
                        Available Cards: <span className="text-blue-400">{getAvailableCards(player).length}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
