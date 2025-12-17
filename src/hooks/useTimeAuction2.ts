import { useState, useEffect, useCallback, useRef } from "react"
import { supabase } from "@/lib/supabase"

interface GameSettings {
  totalTimeBank: number // minutes
  totalRounds: number
  minPlayers: number
}

interface PlayerData {
  timeRemaining: number // seconds
  tokens: number
  isHolding: boolean
  holdStartTime: number | null
  abandonedCountdown: boolean
}

interface GameState {
  gameStarted: boolean
  gamePhase: "waiting" | "countdown" | "auction" | "results" | "gameOver"
  currentRound: number
  countdown: number
  auctionStartTime: number | null
  auctionWinner: string | null
  activeBidders: string[]
  bids: Record<string, number> // playerId -> time spent
}

interface Player {
  id: string
  room_id: string
  player_name: string
  player_data: PlayerData
  is_host: boolean
  is_connected: boolean
  last_heartbeat: string
  created_at: string
  updated_at: string
}

interface Room {
  id: string
  room_code: string
  host_id: string
  game_settings: GameSettings
  game_state: GameState
  is_active: boolean
  created_at: string
  updated_at: string
}

export function useTimeAuction2() {
  const [room, setRoom] = useState<Room | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isButtonPressed, setIsButtonPressed] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(0)

  const roomChannelRef = useRef<any>(null)
  const playersChannelRef = useRef<any>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null)

  const isHost = currentPlayerId === room?.host_id

  // Generate room code
  const generateRoomCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    let code = ""
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
  }

  // Create room
  const createRoom = async (playerName: string, settings: GameSettings) => {
    try {
      setError(null)
      const roomCode = generateRoomCode()
      const playerId = crypto.randomUUID()

      // Create room
      const { data: roomData, error: roomError } = await supabase
        .from("rooms")
        .insert({
          room_code: roomCode,
          host_id: playerId,
          game_settings: settings,
          game_state: {
            gameStarted: false,
            gamePhase: "waiting",
            currentRound: 0,
            countdown: 5,
            auctionStartTime: null,
            auctionWinner: null,
            activeBidders: [],
            bids: {},
          },
          is_active: true,
        })
        .select()
        .single()

      if (roomError) throw roomError

      // Create player
      const { error: playerError } = await supabase.from("players").insert({
        id: playerId,
        room_id: roomData.id,
        player_name: playerName,
        player_data: {
          timeRemaining: settings.totalTimeBank * 60, // Convert to seconds
          tokens: 0,
          isHolding: false,
          holdStartTime: null,
          abandonedCountdown: false,
        },
        is_host: true,
        is_connected: true,
        last_heartbeat: new Date().toISOString(),
      })

      if (playerError) throw playerError

      setCurrentPlayerId(playerId)
      setRoom(roomData)
      subscribeToRoom(roomData.id)
      subscribeToPlayers(roomData.id)
      startHeartbeat(playerId)
    } catch (err: any) {
      console.error("Error creating room:", err)
      setError(err.message)
    }
  }

  // Join room
  const joinRoom = async (roomCode: string, playerName: string) => {
    try {
      setError(null)

      // Find room
      const { data: roomData, error: roomError } = await supabase
        .from("rooms")
        .select("*")
        .eq("room_code", roomCode)
        .eq("is_active", true)
        .single()

      if (roomError || !roomData) {
        throw new Error("Room not found")
      }

      if (roomData.game_state?.gameStarted) {
        throw new Error("Game already started")
      }

      const playerId = crypto.randomUUID()

      // Create player
      const { error: playerError } = await supabase.from("players").insert({
        id: playerId,
        room_id: roomData.id,
        player_name: playerName,
        player_data: {
          timeRemaining: roomData.game_settings.totalTimeBank * 60,
          tokens: 0,
          isHolding: false,
          holdStartTime: null,
          abandonedCountdown: false,
        },
        is_host: false,
        is_connected: true,
        last_heartbeat: new Date().toISOString(),
      })

      if (playerError) throw playerError

      setCurrentPlayerId(playerId)
      setRoom(roomData)
      subscribeToRoom(roomData.id)
      subscribeToPlayers(roomData.id)
      startHeartbeat(playerId)
    } catch (err: any) {
      console.error("Error joining room:", err)
      setError(err.message)
    }
  }

  // Leave room
  const leaveRoom = async () => {
    if (currentPlayerId) {
      await supabase.from("players").delete().eq("id", currentPlayerId)
    }
    cleanup()
  }

  // Start game
  const startGame = async () => {
    if (!room || !isHost) return

    try {
      await supabase
        .from("rooms")
        .update({
          game_state: {
            ...room.game_state,
            gameStarted: true,
            gamePhase: "waiting",
            currentRound: 1,
          },
        })
        .eq("id", room.id)
    } catch (err: any) {
      console.error("Error starting game:", err)
      setError(err.message)
    }
  }

  // Press button
  const pressButton = async () => {
    if (!room || !currentPlayerId) return

    const currentPlayer = players.find((p) => p.id === currentPlayerId)
    if (!currentPlayer) return

    setIsButtonPressed(true)

    // Update player state
    await supabase
      .from("players")
      .update({
        player_data: {
          ...currentPlayer.player_data,
          isHolding: true,
          holdStartTime: Date.now(),
          abandonedCountdown: false,
        },
      })
      .eq("id", currentPlayerId)

    // If in waiting phase, check if all players are now holding
    if (room.game_state.gamePhase === "waiting" && isHost) {
      // Wait a bit for the database to update
      setTimeout(async () => {
        const { data: allPlayers } = await supabase
          .from("players")
          .select("*")
          .eq("room_id", room.id)
          .eq("is_connected", true)

        if (allPlayers && allPlayers.length > 0 && allPlayers.every((p: Player) => p.player_data.isHolding)) {
          startCountdown()
        }
      }, 200)
    }
  }

  // Release button
  const releaseButton = async () => {
    if (!room || !currentPlayerId) return

    const currentPlayer = players.find((p) => p.id === currentPlayerId)
    if (!currentPlayer) return

    setIsButtonPressed(false)

    const now = Date.now()
    const holdStartTime = currentPlayer.player_data.holdStartTime

    // Calculate time spent
    let timeSpent = 0
    if (holdStartTime && room.game_state.gamePhase === "auction") {
      const countdownEndTime = (room.game_state.auctionStartTime || 0) + 5000
      const auctionStartTime = Math.max(holdStartTime, countdownEndTime)
      timeSpent = Math.max(0, (now - auctionStartTime) / 1000)
      timeSpent = Math.round(timeSpent * 10) / 10 // Round to 0.1 second
    }

    const newTimeRemaining = Math.max(0, currentPlayer.player_data.timeRemaining - timeSpent)

    // Only mark as abandoned if released during countdown (not during auction)
    const wasAbandoned = room.game_state.gamePhase === "countdown"

    // Update player
    await supabase
      .from("players")
      .update({
        player_data: {
          ...currentPlayer.player_data,
          isHolding: false,
          holdStartTime: null,
          timeRemaining: newTimeRemaining,
          abandonedCountdown: wasAbandoned,
        },
      })
      .eq("id", currentPlayerId)

    // Record bid if in auction phase
    if (room.game_state.gamePhase === "auction" && timeSpent > 0) {
      const bids = { ...room.game_state.bids, [currentPlayerId]: timeSpent }

      await supabase
        .from("rooms")
        .update({
          game_state: {
            ...room.game_state,
            bids,
          },
        })
        .eq("id", room.id)
    }
  }

  // Start countdown (host only)
  const startCountdown = async () => {
    if (!room || !isHost) return

    await supabase
      .from("rooms")
      .update({
        game_state: {
          ...room.game_state,
          gamePhase: "countdown",
          countdown: 5,
          auctionStartTime: Date.now(),
          bids: {},
        },
      })
      .eq("id", room.id)
  }

  // Countdown timer (host only)
  useEffect(() => {
    if (!room || !isHost || room.game_state.gamePhase !== "countdown") return

    const interval = setInterval(async () => {
      const newCountdown = room.game_state.countdown - 1

      if (newCountdown <= 0) {
        // Mark players who aren't holding as abandoned before starting auction
        const { data: currentPlayers } = await supabase.from("players").select("*").eq("room_id", room.id)
        
        if (currentPlayers) {
          for (const player of currentPlayers) {
            if (!player.player_data.isHolding) {
              await supabase
                .from("players")
                .update({
                  player_data: {
                    ...player.player_data,
                    abandonedCountdown: true,
                  },
                })
                .eq("id", player.id)
            }
          }
        }

        // Start auction
        await supabase
          .from("rooms")
          .update({
            game_state: {
              ...room.game_state,
              gamePhase: "auction",
              countdown: 0,
            },
          })
          .eq("id", room.id)
      } else {
        await supabase
          .from("rooms")
          .update({
            game_state: {
              ...room.game_state,
              countdown: newCountdown,
            },
          })
          .eq("id", room.id)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [room?.game_state.gamePhase, room?.game_state.countdown, isHost])

  // Monitor auction (host only)
  useEffect(() => {
    if (!room || !isHost || room.game_state.gamePhase !== "auction") return

    const interval = setInterval(async () => {
      const { data: currentPlayers } = await supabase.from("players").select("*").eq("room_id", room.id)

      if (!currentPlayers) return

      // Check who's still holding
      const stillHolding = currentPlayers.filter((p: Player) => p.player_data.isHolding && !p.player_data.abandonedCountdown)

      // Force release for players who ran out of time
      const now = Date.now()
      const countdownEndTime = (room.game_state.auctionStartTime || 0) + 5000

      for (const player of stillHolding) {
        const holdStartTime = player.player_data.holdStartTime || 0
        const auctionStartTime = Math.max(holdStartTime, countdownEndTime)
        const timeSpent = Math.max(0, (now - auctionStartTime) / 1000)

        if (timeSpent >= player.player_data.timeRemaining) {
          // Force release
          await supabase
            .from("players")
            .update({
              player_data: {
                ...player.player_data,
                isHolding: false,
                holdStartTime: null,
                timeRemaining: 0,
              },
            })
            .eq("id", player.id)

          // Record bid
          const bids = { ...room.game_state.bids, [player.id]: player.player_data.timeRemaining }
          await supabase
            .from("rooms")
            .update({
              game_state: {
                ...room.game_state,
                bids,
              },
            })
            .eq("id", room.id)
        }
      }

      // Refresh players
      const { data: refreshedPlayers } = await supabase.from("players").select("*").eq("room_id", room.id)
      const stillHoldingAfter = refreshedPlayers?.filter(
        (p: Player) => p.player_data.isHolding && !p.player_data.abandonedCountdown,
      )

      // End auction only when NO players are holding (last person released)
      if (stillHoldingAfter && stillHoldingAfter.length === 0) {
        endAuction()
      }
    }, 100) // Check every 100ms

    return () => clearInterval(interval)
  }, [room?.game_state.gamePhase, isHost])

  // End auction (host only)
  const endAuction = async () => {
    if (!room || !isHost) return

    const { data: currentPlayers } = await supabase.from("players").select("*").eq("room_id", room.id)

    if (!currentPlayers) return

    // Get all bids
    const bids = room.game_state.bids

    // Find winner (highest bid, but check for ties)
    let winner: string | null = null
    let maxBid = 0
    let tieExists = false

    const bidEntries = Object.entries(bids)
    for (const [playerId, bid] of bidEntries) {
      if (bid > maxBid) {
        maxBid = bid
        winner = playerId
        tieExists = false
      } else if (bid === maxBid && bid > 0) {
        tieExists = true
      }
    }

    // If tie, no winner
    if (tieExists) {
      winner = null
    }

    // Award token to winner
    if (winner) {
      const winnerPlayer = currentPlayers.find((p: Player) => p.id === winner)
      if (winnerPlayer) {
        await supabase
          .from("players")
          .update({
            player_data: {
              ...winnerPlayer.player_data,
              tokens: winnerPlayer.player_data.tokens + 1,
            },
          })
          .eq("id", winner)
      }
    }

    // Move to results
    await supabase
      .from("rooms")
      .update({
        game_state: {
          ...room.game_state,
          gamePhase: "results",
          auctionWinner: winner,
        },
      })
      .eq("id", room.id)

    // After 5 seconds, move to next round or end game
    setTimeout(async () => {
      const nextRound = room.game_state.currentRound + 1

      if (nextRound > room.game_settings.totalRounds) {
        // Game over
        await supabase
          .from("rooms")
          .update({
            game_state: {
              ...room.game_state,
              gamePhase: "gameOver",
            },
          })
          .eq("id", room.id)
      } else {
        // Reset for next round
        const { data: allPlayers } = await supabase.from("players").select("*").eq("room_id", room.id)

        if (allPlayers) {
          for (const player of allPlayers) {
            await supabase
              .from("players")
              .update({
                player_data: {
                  ...player.player_data,
                  isHolding: false,
                  holdStartTime: null,
                  abandonedCountdown: false,
                },
              })
              .eq("id", player.id)
          }
        }

        await supabase
          .from("rooms")
          .update({
            game_state: {
              ...room.game_state,
              gamePhase: "waiting",
              currentRound: nextRound,
              countdown: 5,
              auctionStartTime: null,
              auctionWinner: null,
              activeBidders: [],
              bids: {},
            },
          })
          .eq("id", room.id)
      }
    }, 5000)
  }

  // Subscribe to room updates
  const subscribeToRoom = (roomId: string) => {
    roomChannelRef.current = supabase
      .channel(`room:${roomId}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "rooms", filter: `id=eq.${roomId}` }, (payload) => {
        setRoom(payload.new as Room)
      })
      .subscribe()
  }

  // Subscribe to players updates
  const subscribeToPlayers = (roomId: string) => {
    playersChannelRef.current = supabase
      .channel(`players:${roomId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "players", filter: `room_id=eq.${roomId}` },
        async () => {
          const { data } = await supabase.from("players").select("*").eq("room_id", roomId).eq("is_connected", true)
          if (data) setPlayers(data)
        },
      )
      .subscribe()

    // Initial load
    supabase
      .from("players")
      .select("*")
      .eq("room_id", roomId)
      .eq("is_connected", true)
      .then(({ data }) => {
        if (data) setPlayers(data)
      })
  }

  // Heartbeat
  const startHeartbeat = (playerId: string) => {
    heartbeatRef.current = setInterval(async () => {
      await supabase
        .from("players")
        .update({ last_heartbeat: new Date().toISOString() })
        .eq("id", playerId)
    }, 5000)
  }

  // Cleanup
  const cleanup = () => {
    if (roomChannelRef.current) {
      supabase.removeChannel(roomChannelRef.current)
    }
    if (playersChannelRef.current) {
      supabase.removeChannel(playersChannelRef.current)
    }
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current)
    }
    setRoom(null)
    setPlayers([])
    setCurrentPlayerId(null)
    setError(null)
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => cleanup()
  }, [])

  // Update local time remaining for display
  useEffect(() => {
    if (!currentPlayerId) return

    const currentPlayer = players.find((p) => p.id === currentPlayerId)
    if (currentPlayer) {
      setTimeRemaining(currentPlayer.player_data.timeRemaining)
    }
  }, [players, currentPlayerId])

  return {
    room,
    players,
    currentPlayerId,
    isHost,
    error,
    createRoom,
    joinRoom,
    leaveRoom,
    startGame,
    isButtonPressed,
    pressButton,
    releaseButton,
    timeRemaining,
  }
}
