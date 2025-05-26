"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Users, Clock, Wifi, WifiOff, Trophy, Bug } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Header from "@/components/header"
import { useTimeAuction } from "@/hooks/useTimeAuction"
import { supabase } from "@/lib/supabase" // Import from shared file

export default function TimeAuctionGame() {
  const {
    room,
    players,
    currentPlayerId,
    isConnected,
    error,
    isButtonPressed,
    localTimeBank,
    showTimeUp,
    debugInfo,
    setShowTimeUp,
    createRoom,
    joinRoom,
    startGame,
    pressButton,
    releaseButton,
    continueToNextRound,
    formatTime,
    getCountdownTime,
  } = useTimeAuction()

  const [playerName, setPlayerName] = useState("")
  const [roomCodeInput, setRoomCodeInput] = useState("")
  const [showDebug, setShowDebug] = useState(false)
  const [gameSettings, setGameSettings] = useState({
    totalTimeBank: 10, // minutes
    totalRounds: 19,
  })

  // Get current player
  const currentPlayer = players.find((p) => p.id === currentPlayerId)
  const isHost = currentPlayer?.is_host || false

  // Handle create room
  const handleCreateRoom = async () => {
    if (!playerName.trim()) return

    try {
      await createRoom(playerName.trim(), gameSettings)
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

  // Get round winner info
  const getRoundWinner = () => {
    if (!room?.game_state.roundWinner) return null
    const winner = players.find((p) => p.id === room.game_state.roundWinner)
    return winner
  }

  // Force phase progression (emergency button for host)
  const forcePhaseProgression = async () => {
    if (!isHost || !room) return

    try {
      const now = Date.now()
      let newPhase = room.game_state.gamePhase

      if (room.game_state.gamePhase === "waiting") {
        newPhase = "countdown"
      } else if (room.game_state.gamePhase === "countdown") {
        newPhase = "auction"
      } else if (room.game_state.gamePhase === "auction") {
        newPhase = "roundResults"
      }

      await supabase
        .from("rooms")
        .update({
          game_state: {
            ...room.game_state,
            gamePhase: newPhase,
            lastPhaseUpdate: now,
            countdownStartTime: newPhase === "countdown" ? now : room.game_state.countdownStartTime,
            auctionStartTime: newPhase === "auction" ? now : room.game_state.auctionStartTime,
          },
        })
        .eq("id", room.id)
    } catch (err) {
      console.error("Failed to force phase progression:", err)
    }
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
                <span className="text-red-500">Time Auction</span> - Multiplayer
              </h1>
              <p className="text-gray-400">Strategic bidding game where players use their time banks to win rounds</p>
              <Link href="/games/timeAuction/rules" className="text-blue-400 hover:underline mt-2 inline-block">
                View Game Rules
              </Link>

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
                      <h3 className="font-bold mb-2">Players ({players.length})</h3>
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

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Time Bank:</span>
                        <span className="ml-2 text-white">{formatTime(room.game_settings.totalTimeBank)}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Rounds:</span>
                        <span className="ml-2 text-white">{room.game_settings.totalRounds}</span>
                      </div>
                    </div>

                    {isHost && (
                      <Button
                        onClick={startGame}
                        className="w-full bg-red-600 hover:bg-red-700"
                        disabled={players.length < 2}
                      >
                        Start Game ({players.length}/2+ players)
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
                      <Label>Time Bank (minutes)</Label>
                      <Input
                        type="number"
                        min="1"
                        max="60"
                        value={gameSettings.totalTimeBank}
                        onChange={(e) =>
                          setGameSettings((prev) => ({
                            ...prev,
                            totalTimeBank: Number.parseInt(e.target.value) || 10,
                          }))
                        }
                        className="bg-gray-800 border-gray-700"
                      />
                      <p className="text-xs text-gray-400 mt-1">Each player starts with this much time</p>
                    </div>

                    <div>
                      <Label>Total Rounds</Label>
                      <Input
                        type="number"
                        min="1"
                        max="50"
                        value={gameSettings.totalRounds}
                        onChange={(e) =>
                          setGameSettings((prev) => ({
                            ...prev,
                            totalRounds: Number.parseInt(e.target.value) || 19,
                          }))
                        }
                        className="bg-gray-800 border-gray-700"
                      />
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
  const winner = getRoundWinner()

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <Header />

      {/* Time's Up Dialog */}
      <Dialog open={showTimeUp} onOpenChange={setShowTimeUp}>
        <DialogContent className="bg-gray-900 border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-red-500 text-center text-2xl">Time's Up!</DialogTitle>
          </DialogHeader>
          <div className="text-center py-4">
            <p className="text-gray-300">Your time bank has been exhausted.</p>
            <p className="text-gray-300">You have been automatically removed from this auction.</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Round Results Dialog */}
      <Dialog open={room?.game_state.gamePhase === "roundResults"} onOpenChange={() => {}}>
        <DialogContent className="bg-gray-900 border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">Round {room?.game_state.currentRound} Results</DialogTitle>
          </DialogHeader>
          <div className="text-center py-4">
            {winner ? (
              <div>
                <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-yellow-500 mb-2">{winner.player_name} Wins!</h3>
                <p className="text-gray-300">Time spent: {formatTime(winner.player_data.bidTime || 0)}</p>
              </div>
            ) : (
              <div>
                <h3 className="text-xl font-bold text-gray-500 mb-2">No Winner</h3>
                <p className="text-gray-300">Tie or no valid bids</p>
              </div>
            )}
            {isHost && (
              <Button onClick={continueToNextRound} className="mt-4 bg-blue-600 hover:bg-blue-700">
                {room?.game_state.currentRound >= room?.game_settings.totalRounds ? "End Game" : "Next Round"}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

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
                <div>Phase: {debugInfo.phase}</div>
                <div>Countdown Start: {debugInfo.countdownStart}</div>
                <div>Auction Start: {debugInfo.auctionStart}</div>
                <div>Last Update: {debugInfo.lastUpdate}</div>
                <div>Timeout: {debugInfo.timeout}</div>
                <div>Now: {debugInfo.now}</div>
                <div>Connected Players: {players.filter((p) => p.is_connected).length}</div>
                <div>Active Players: {activePlayers.length}</div>
              </div>
              {isHost && (
                <Button onClick={forcePhaseProgression} className="mt-2 bg-orange-600 hover:bg-orange-700" size="sm">
                  Force Next Phase
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Game Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Time Auction - Round {room.game_state.currentRound}</h1>
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
          <Card className="bg-gray-900 border-gray-800 mb-6">
            <CardHeader>
              <CardTitle className="text-center">
                {room.game_state.gamePhase === "waiting" && "Press and hold the button when ready"}
                {room.game_state.gamePhase === "countdown" && `Countdown: ${getCountdownTime().toFixed(1)}s`}
                {room.game_state.gamePhase === "auction" && "Auction in progress - Release to bid!"}
              </CardTitle>
              {room.game_state.gamePhase === "auction" && currentPlayer && (
                <CardDescription className="text-center text-2xl font-mono">
                  Your Time: {formatTime(localTimeBank)}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              {/* Big Red Button */}
              <div className="relative">
                <button
                  className={`w-64 h-64 rounded-full text-white font-bold text-2xl transition-all duration-150 ${
                    isButtonPressed
                      ? "bg-red-700 shadow-inner transform scale-95"
                      : "bg-red-600 hover:bg-red-500 shadow-lg transform scale-100"
                  } ${
                    currentPlayer?.player_data.isEliminated || currentPlayer?.player_data.hasOptedOut
                      ? "opacity-50 cursor-not-allowed"
                      : "cursor-pointer"
                  }`}
                  onMouseDown={pressButton}
                  onMouseUp={releaseButton}
                  onMouseLeave={releaseButton}
                  disabled={
                    currentPlayer?.player_data.isEliminated ||
                    currentPlayer?.player_data.hasOptedOut ||
                    room.game_state.gamePhase === "roundResults"
                  }
                >
                  {isButtonPressed ? "HOLDING" : "PRESS & HOLD"}
                </button>
                <div className="text-center mt-4 text-gray-400">
                  <p>Click and hold or use SPACEBAR</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Players Status */}
          <Card className="bg-gray-900 border-gray-800">
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
                        {!player.is_connected && <Badge variant="destructive">Offline</Badge>}
                      </div>
                    </div>
                    <div className="text-sm space-y-1 text-gray-300">
                      <div className="text-white">
                        Victory Tokens: <span className="text-yellow-400">{player.player_data.victoryTokens}</span>
                      </div>
                      {player.id === currentPlayerId && (
                        <div className="text-white">
                          Time Bank: <span className="text-green-400">{formatTime(player.player_data.timeBank)}</span>
                        </div>
                      )}
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
