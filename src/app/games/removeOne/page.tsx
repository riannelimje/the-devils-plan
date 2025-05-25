"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Users, Clock, Wifi, WifiOff } from "lucide-react"
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
    createRoom,
    joinRoom,
    startGame,
    selectCard,
    makeFinalChoice,
    continueGame,
  } = useSupabaseGame()

  const [playerName, setPlayerName] = useState("")
  const [roomCodeInput, setRoomCodeInput] = useState("")
  const [gameSettings, setGameSettings] = useState({
    totalRounds: 18,
    survivalRounds: "3,6,9,12,18",
    minPlayers: 2,
  })

  // Get current player
  const currentPlayer = players.find((p) => p.id === currentPlayerId)
  const isHost = currentPlayer?.is_host || false

  // Get available cards for current player
  const getAvailableCards = (player: any) => {
    if (!player?.player_data) return []
    const { deck, holdingBox, tempUnavailable } = player.player_data
    return deck.filter((card: number) => !holdingBox.includes(card) && !tempUnavailable.includes(card))
  }

  // Handle create room
  const handleCreateRoom = async () => {
    if (!playerName.trim()) return

    try {
      const survivalRounds = gameSettings.survivalRounds
        .split(",")
        .map((r) => Number.parseInt(r.trim()))
        .filter((r) => !isNaN(r))

      await createRoom(playerName.trim(), {
        ...gameSettings,
        maxPlayers: gameSettings.minPlayers, // Use minPlayers as maxPlayers
        survivalRounds,
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
    if (!currentPlayer || currentPlayer.player_data.isEliminated) return
    selectCard(card)
  }

  // Handle final choice
  const handleFinalChoice = (choice: "left" | "right") => {
    makeFinalChoice(choice)
  }

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
              <p className="text-gray-400">
                A strategic elimination game where survival depends on playing the lowest unique card
              </p>

              {/* Connection Status */}
              <div className="flex items-center justify-center gap-2 mt-4">
                {isConnected ? (
                  <>
                    <Wifi className="w-4 h-4 text-green-500" />
                    <span className="text-green-500">Connected to Supabase</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-4 h-4 text-red-500" />
                    <span className="text-red-500">Disconnected</span>
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
                        Players ({players.length}/{gameSettings.minPlayers || room.game_settings.maxPlayers || 2})
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
                        disabled={players.length < (room.game_settings.maxPlayers || 2)}
                      >
                        Start Game ({players.length}/{room.game_settings.maxPlayers || 2} min players)
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

                    <div className="grid gap-4">
                      <div>
                        <Label>Number of Players</Label>
                        <Input
                          type="number"
                          min="2"
                          max="8"
                          value={gameSettings.minPlayers}
                          onChange={(e) =>
                            setGameSettings((prev) => ({
                              ...prev,
                              minPlayers: Number.parseInt(e.target.value) || 2,
                            }))
                          }
                          className="bg-gray-800 border-gray-700"
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Total Rounds</Label>
                      <Input
                        type="number"
                        min="5"
                        max="30"
                        value={gameSettings.totalRounds}
                        onChange={(e) =>
                          setGameSettings((prev) => ({
                            ...prev,
                            totalRounds: Number.parseInt(e.target.value) || 18,
                          }))
                        }
                        className="bg-gray-800 border-gray-700"
                      />
                    </div>

                    <div>
                      <Label>Survival Rounds (comma-separated)</Label>
                      <Input
                        value={gameSettings.survivalRounds}
                        onChange={(e) =>
                          setGameSettings((prev) => ({
                            ...prev,
                            survivalRounds: e.target.value,
                          }))
                        }
                        className="bg-gray-800 border-gray-700"
                        placeholder="3,6,9,12,18"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        Enter round numbers where players get eliminated (e.g., 3,6,9,12,18)
                      </p>
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
  const activePlayers = players.filter((p) => !p.player_data.isEliminated)

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
          </div>
        </div>

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
              {activePlayers.length} Players Active
            </Badge>
          </div>
        </div>

        {/* Game Controls */}
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle>Game Controls</CardTitle>
              <CardDescription className="text-gray-300">
                {room.game_state.gamePhase === "cardSelection" && "Select two cards"}
                {room.game_state.gamePhase === "finalChoice" && "Choose left or right card"}
                {room.game_state.gamePhase === "reveal" && "Round results"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {room.game_state.gamePhase === "cardSelection" &&
                currentPlayer &&
                !currentPlayer.player_data.isEliminated && (
                  <div>
                    <p className="mb-4 text-white">Select exactly 2 cards:</p>
                    <div className="grid grid-cols-4 gap-2 mb-4 max-w-md">
                      {getAvailableCards(currentPlayer).map((card: number) => {
                        const selectedCards = currentPlayer.player_data.selectedCards || []
                        const validSelected = selectedCards.filter((c) => c !== -1)
                        const isSelected = validSelected.includes(card)

                        return (
                          <button
                            key={card}
                            className={`p-3 rounded border-2 transition-all text-white font-bold ${
                              isSelected
                                ? "bg-red-600 border-red-400 shadow-lg transform scale-105"
                                : "bg-gray-700 border-gray-600 hover:bg-gray-600 hover:border-gray-500"
                            }`}
                            onClick={() => handleCardSelection(card)}
                            disabled={!isSelected && validSelected.length >= 2}
                          >
                            {card}
                          </button>
                        )
                      })}
                    </div>
                    <div className="text-sm text-gray-300">
                      Selected: {currentPlayer.player_data.selectedCards?.filter((c) => c !== -1).length || 0}/2 cards
                      {currentPlayer.player_data.selectedCards && (
                        <span className="ml-2 text-white">
                          [{currentPlayer.player_data.selectedCards.filter((c) => c !== -1).join(", ")}]
                        </span>
                      )}
                    </div>
                  </div>
                )}

              {room.game_state.gamePhase === "finalChoice" &&
                currentPlayer?.player_data.selectedCards &&
                !currentPlayer.player_data.isEliminated && (
                  <div>
                    <p className="mb-4 text-white">Choose your final card:</p>
                    <div className="flex gap-4 max-w-md">
                      <Button
                        onClick={() => handleFinalChoice("left")}
                        className={`flex-1 text-white font-bold ${
                          currentPlayer.player_data.finalChoice === "left"
                            ? "bg-red-600 hover:bg-red-700"
                            : "bg-gray-700 hover:bg-gray-600 border border-gray-600"
                        }`}
                        variant={currentPlayer.player_data.finalChoice === "left" ? "default" : "outline"}
                      >
                        Left: {currentPlayer.player_data.selectedCards[0]}
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
                        Right: {currentPlayer.player_data.selectedCards[1]}
                      </Button>
                    </div>
                  </div>
                )}

              {isHost && (room.game_state.gamePhase === "roundEnd" || room.game_state.gamePhase === "survival") && (
                <div className="text-center">
                  <Button onClick={continueGame} className="bg-blue-600 hover:bg-blue-700">
                    Continue Game
                  </Button>
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
                      player.player_data.isEliminated
                        ? "bg-red-950/30 border-red-800"
                        : player.id === currentPlayerId
                          ? "bg-blue-950/30 border-blue-600"
                          : "bg-gray-800 border-gray-700"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-bold text-white">
                        {player.player_name} {player.id === currentPlayerId && "(You)"}
                      </h3>
                      <div className="flex gap-1">
                        {player.player_data.isEliminated && <Badge variant="destructive">Eliminated</Badge>}
                        {player.is_host && <Badge variant="outline">Host</Badge>}
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