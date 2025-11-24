"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { ArrowLeft, Clock, Users, Trophy, Play, Hand } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Header from "@/components/header"
import { useTimeAuction2 } from "../../../hooks/useTimeAuction2"

export default function TimeAuction2Game() {
  const [roomCode, setRoomCode] = useState("")
  const [playerName, setPlayerName] = useState("")
  const [gameSettings, setGameSettings] = useState({
    totalTimeBank: 10, // minutes (default: 10)
    totalRounds: 19, // default: 19
    minPlayers: 2,
  })

  const {
    room,
    players,
    currentPlayerId,
    isHost,
    error,
    createRoom,
    joinRoom,
    startGame,
    leaveRoom,
    isButtonPressed,
    pressButton,
    releaseButton,
    timeRemaining,
  } = useTimeAuction2()

  const [showRules, setShowRules] = useState(false)
  const [isPressingButton, setIsPressingButton] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0) // Track elapsed time in current auction

  // Format time (seconds to mm:ss.s)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    const tenths = Math.floor((seconds % 1) * 10)
    return `${mins}:${secs.toString().padStart(2, "0")}.${tenths}`
  }

  // Handle button press
  const handleButtonPress = useCallback(() => {
    if (!currentPlayerId || !room) return
    pressButton()
    setIsPressingButton(true)
  }, [currentPlayerId, room, pressButton])

  // Handle button release
  const handleButtonRelease = useCallback(() => {
    if (!currentPlayerId || !room) return
    releaseButton()
    setIsPressingButton(false)
  }, [currentPlayerId, room, releaseButton])

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const gamePhase = room?.game_state?.gamePhase
      if (e.code === "Space" && !e.repeat && (gamePhase === "waiting" || gamePhase === "countdown" || gamePhase === "auction")) {
        e.preventDefault()
        if (!isPressingButton) {
          handleButtonPress()
        }
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      const gamePhase = room?.game_state?.gamePhase
      if (e.code === "Space" && (gamePhase === "waiting" || gamePhase === "countdown" || gamePhase === "auction")) {
        e.preventDefault()
        handleButtonRelease()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [room, isPressingButton, handleButtonPress, handleButtonRelease])

  const currentPlayer = players.find((p) => p.id === currentPlayerId)
  const gamePhase = room?.game_state?.gamePhase
  const currentRound = room?.game_state?.currentRound || 0
  const countdown = room?.game_state?.countdown || 0
  const auctionWinner = room?.game_state?.auctionWinner
  const isCountdownPhase = gamePhase === "countdown"
  const isAuctionPhase = gamePhase === "auction"

  // Track elapsed time during auction (starts from 0 after countdown)
  useEffect(() => {
    if (isAuctionPhase && room?.game_state?.auctionStartTime) {
      // Auction starts after 5-second countdown
      const auctionActualStartTime = room.game_state.auctionStartTime + 5000
      
      const interval = setInterval(() => {
        const now = Date.now()
        const elapsed = Math.max(0, (now - auctionActualStartTime) / 1000)
        setElapsedTime(elapsed)
      }, 100)

      return () => clearInterval(interval)
    } else {
      setElapsedTime(0)
    }
  }, [isAuctionPhase, room?.game_state?.auctionStartTime])

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <Header />

      {/* Rules Dialog */}
      <Dialog open={showRules} onOpenChange={setShowRules}>
        <DialogContent className="bg-gray-900 border-gray-800 max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Time Auction Rules</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm">
            <div>
              <h3 className="font-bold mb-2">Overview</h3>
              <p>Bid using time to win tokens. The player with the most tokens wins!</p>
            </div>
            <div>
              <h3 className="font-bold mb-2">Setup</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Each player starts with 10 minutes (600 seconds) of auction time</li>
                <li>19 rounds of auctions</li>
                <li>Time is tracked to the nearest 0.1 second</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-2">How to Play</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Press and hold your button (or spacebar) to enter the auction</li>
                <li>A 5-second countdown begins when auction starts</li>
                <li>Release within 5 seconds to abandon the auction (no time spent)</li>
                <li>After countdown, a timer counts UP from 0 showing elapsed time</li>
                <li>Release the button when you want to stop bidding</li>
                <li>Last player holding wins the token for that round</li>
                <li>Your actual time remaining is HIDDEN from everyone (including yourself)</li>
                <li>You can only see who won tokens, not how much time anyone has left</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-2">Important Rules</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Cannot bid more time than you have remaining</li>
                <li>If two+ players bid the same time (to 0.1s), token is lost</li>
                <li>Who participated is NOT disclosed (only winner is shown)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-2">Winning</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Player with most tokens after 19 rounds wins</li>
                <li>Ties: Player with more time remaining wins</li>
                <li>Player with fewest tokens is eliminated</li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="mb-6 flex justify-between items-center">
          <Link href="/" className="text-gray-400 hover:text-white flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Games
          </Link>
          <Button onClick={() => setShowRules(true)} variant="outline" size="sm">
            View Rules
          </Button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">
            <span className="text-purple-500">Time Auction</span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Bid with time to win tokens. Press and hold to bid, release to lock in your time.
          </p>
        </div>

        {error && (
          <div className="max-w-2xl mx-auto mb-6">
            <div className="bg-red-900/50 border border-red-700 rounded-lg p-4 text-red-200">{error}</div>
          </div>
        )}

        {/* Lobby */}
        {!room && (
          <div className="max-w-2xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Create Room */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>Create Room</CardTitle>
                <CardDescription>Start a new Time Auction game</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="create-name">Your Name</Label>
                  <Input
                    id="create-name"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Enter your name"
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
                <div>
                  <Label htmlFor="time-bank">Time Bank (minutes)</Label>
                  <Input
                    id="time-bank"
                    type="number"
                    min="1"
                    max="60"
                    value={gameSettings.totalTimeBank}
                    onChange={(e) =>
                      setGameSettings((prev) => ({ ...prev, totalTimeBank: Number(e.target.value) }))
                    }
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
                <div>
                  <Label htmlFor="total-rounds">Total Rounds</Label>
                  <Input
                    id="total-rounds"
                    type="number"
                    min="1"
                    max="50"
                    value={gameSettings.totalRounds}
                    onChange={(e) => setGameSettings((prev) => ({ ...prev, totalRounds: Number(e.target.value) }))}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
                <Button
                  onClick={() => createRoom(playerName, gameSettings)}
                  disabled={!playerName.trim()}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  Create Room
                </Button>
              </CardContent>
            </Card>

            {/* Join Room */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>Join Room</CardTitle>
                <CardDescription>Enter a room code to join</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="join-name">Your Name</Label>
                  <Input
                    id="join-name"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Enter your name"
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
                <div>
                  <Label htmlFor="room-code">Room Code</Label>
                  <Input
                    id="room-code"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    placeholder="Enter room code"
                    className="bg-gray-800 border-gray-700"
                    maxLength={6}
                  />
                </div>
                <Button
                  onClick={() => joinRoom(roomCode, playerName)}
                  disabled={!playerName.trim() || !roomCode.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Join Room
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Game Room */}
        {room && (
          <div className="max-w-6xl mx-auto">
            {/* Room Header */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="border-purple-500 text-purple-400 text-lg px-4 py-2">
                  Room: {room.room_code}
                </Badge>
                <Badge variant="outline" className="border-blue-500 text-blue-400">
                  <Users className="w-4 h-4 mr-1" />
                  {players.length} Players
                </Badge>
                {room.game_state?.gameStarted && (
                  <Badge variant="outline" className="border-green-500 text-green-400">
                    Round {currentRound}/{room.game_settings?.totalRounds}
                  </Badge>
                )}
              </div>
              <Button onClick={leaveRoom} variant="outline" size="sm">
                Leave Room
              </Button>
            </div>

            {/* Waiting Room */}
            {!room.game_state?.gameStarted && (
              <Card className="bg-gray-900 border-gray-800 mb-6">
                <CardHeader>
                  <CardTitle>Waiting for Players</CardTitle>
                  <CardDescription>
                    {isHost
                      ? `Start the game when ready (minimum ${gameSettings.minPlayers} players)`
                      : "Waiting for host to start the game"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    {players.map((player) => (
                      <div key={player.id} className="p-4 bg-gray-800 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">{player.player_name}</span>
                          {player.is_host && <Badge className="bg-yellow-600">Host</Badge>}
                        </div>
                      </div>
                    ))}
                  </div>
                  {isHost && (
                    <Button
                      onClick={startGame}
                      disabled={players.length < gameSettings.minPlayers}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Start Game
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Game Started */}
            {room.game_state?.gameStarted && (
              <div className="space-y-6">
                {/* Scoreboard */}
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle>Scoreboard</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-700">
                            <th className="text-left py-2 px-4">Player</th>
                            <th className="text-right py-2 px-4">Tokens</th>
                          </tr>
                        </thead>
                        <tbody>
                          {players
                            .sort((a, b) => {
                              const tokensA = a.player_data?.tokens || 0
                              const tokensB = b.player_data?.tokens || 0
                              if (tokensA !== tokensB) return tokensB - tokensA
                              return (b.player_data?.timeRemaining || 0) - (a.player_data?.timeRemaining || 0)
                            })
                            .map((player) => (
                              <tr
                                key={player.id}
                                className={`border-b border-gray-800 ${player.id === currentPlayerId ? "bg-purple-900/30" : ""}`}
                              >
                                <td className="py-3 px-4 font-semibold">
                                  {player.player_name}
                                  {player.id === currentPlayerId && (
                                    <Badge className="ml-2 bg-purple-600">You</Badge>
                                  )}
                                </td>
                                <td className="text-right py-3 px-4">
                                  <Badge className="bg-yellow-600">{player.player_data?.tokens || 0}</Badge>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                {/* Auction Area */}
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-center text-2xl">
                      {gamePhase === "waiting" && "Get Ready for Auction"}
                      {gamePhase === "countdown" && "Countdown"}
                      {gamePhase === "auction" && "Auction in Progress"}
                      {gamePhase === "results" && "Round Results"}
                      {gamePhase === "gameOver" && "Game Over!"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Waiting Phase */}
                    {gamePhase === "waiting" && (
                      <div className="text-center py-12">
                        <Clock className="w-16 h-16 mx-auto mb-4 text-purple-500" />
                        <p className="text-xl mb-2">Round {currentRound}</p>
                        <p className="text-gray-400">Press and hold the button or spacebar when ready</p>
                      </div>
                    )}

                    {/* Countdown Phase */}
                    {isCountdownPhase && (
                      <div className="text-center py-12">
                        <div className="text-8xl font-bold mb-4 text-purple-500">{countdown}</div>
                        <p className="text-xl text-yellow-400">Release button to abandon auction (no time cost)</p>
                        <p className="text-gray-400 mt-2">After countdown, your time starts counting down</p>
                      </div>
                    )}

                    {/* Auction Phase */}
                    {isAuctionPhase && (
                      <div className="text-center py-12">
                        <Hand
                          className={`w-24 h-24 mx-auto mb-4 ${isPressingButton ? "text-red-500" : "text-gray-500"}`}
                        />
                        <p className="text-xl mb-4">
                          {isPressingButton ? "You are bidding..." : "You are not bidding"}
                        </p>
                        <p className="text-gray-400 mb-6">Release button to stop bidding</p>
                        <div className="text-6xl font-mono font-bold text-purple-400">
                          {formatTime(elapsedTime)}
                        </div>
                        <p className="text-sm text-gray-500 mt-2">Elapsed time this round</p>
                      </div>
                    )}

                    {/* Results Phase */}
                    {gamePhase === "results" && (
                      <div className="text-center py-12">
                        {auctionWinner ? (
                          <>
                            <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
                            <p className="text-2xl mb-2">
                              {players.find((p) => p.id === auctionWinner)?.player_name} wins this round!
                            </p>
                            <p className="text-gray-400">Earned 1 token</p>
                          </>
                        ) : (
                          <>
                            <p className="text-2xl mb-2 text-red-400">No Winner!</p>
                            <p className="text-gray-400">Multiple players bid the same time</p>
                          </>
                        )}
                      </div>
                    )}

                    {/* Game Over */}
                    {gamePhase === "gameOver" && (
                      <div className="text-center py-12">
                        <Trophy className="w-20 h-20 mx-auto mb-4 text-yellow-500" />
                        <p className="text-3xl font-bold mb-6">Game Over!</p>
                        <div className="max-w-md mx-auto">
                          {players
                            .sort((a, b) => {
                              const tokensA = a.player_data?.tokens || 0
                              const tokensB = b.player_data?.tokens || 0
                              if (tokensA !== tokensB) return tokensB - tokensA
                              return (b.player_data?.timeRemaining || 0) - (a.player_data?.timeRemaining || 0)
                            })
                            .map((player, index) => (
                              <div
                                key={player.id}
                                className={`flex justify-between items-center py-3 px-4 rounded mb-2 ${
                                  index === 0 ? "bg-yellow-900/30 border border-yellow-600" : "bg-gray-800"
                                }`}
                              >
                                <span className="font-semibold">
                                  #{index + 1} {player.player_name}
                                </span>
                                <div className="text-right">
                                  <div>
                                    <Badge className="bg-yellow-600">{player.player_data?.tokens || 0} tokens</Badge>
                                  </div>
                                  <div className="text-sm text-gray-400 mt-1">
                                    {formatTime(player.player_data?.timeRemaining || 0)} remaining
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* Button Control */}
                    {(gamePhase === "waiting" || isCountdownPhase || isAuctionPhase) && (
                      <div className="mt-8">
                        <Button
                          onMouseDown={handleButtonPress}
                          onMouseUp={handleButtonRelease}
                          onMouseLeave={handleButtonRelease}
                          onTouchStart={handleButtonPress}
                          onTouchEnd={handleButtonRelease}
                          disabled={gamePhase !== "waiting" && gamePhase !== "countdown" && gamePhase !== "auction"}
                          className={`w-full h-32 text-2xl font-bold transition-all ${
                            isPressingButton
                              ? "bg-red-600 hover:bg-red-700 scale-95"
                              : "bg-gray-700 hover:bg-gray-600"
                          }`}
                        >
                          {isPressingButton ? "HOLDING" : "PRESS & HOLD"}
                        </Button>
                        <p className="text-center text-sm text-gray-400 mt-2">
                          Or use SPACEBAR to press and hold
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
