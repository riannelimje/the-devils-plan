"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { supabase, type TimeAuctionRoom, type TimeAuctionPlayer, type RoundWinner } from "@/lib/supabase"

export function useTimeAuction() {
  const [room, setRoom] = useState<TimeAuctionRoom | null>(null)
  const [players, setPlayers] = useState<TimeAuctionPlayer[]>([])
  const [currentPlayerId, setCurrentPlayerId] = useState<string>("")
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState("")
  const [isButtonPressed, setIsButtonPressed] = useState(false)
  const [currentAuctionTime, setCurrentAuctionTime] = useState(0) // Time counting up from 0
  const [showTimeUp, setShowTimeUp] = useState(false)
  const [debugInfo, setDebugInfo] = useState<any>({})
  const [localTimeBank, setLocalTimeBank] = useState(0)

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null)
  const keyDownRef = useRef(false)
  const processingRef = useRef(false)
  const lastActionRef = useRef(0)
  const buttonPressStartTime = useRef<number | null>(null)

  // Generate room code
  const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase()
  }

  // Log action to database for reliability
  const logAction = async (actionType: string, actionData: any = {}) => {
    if (!room || !currentPlayerId) return

    try {
      await supabase.from("game_actions").insert({
        room_id: room.id,
        player_id: currentPlayerId,
        action_type: actionType,
        action_data: {
          ...actionData,
          timestamp: Date.now(),
          clientTime: new Date().toISOString(),
        },
      })
    } catch (err) {
      console.error("Failed to log action:", err)
    }
  }

  // Send heartbeat to maintain connection
  const sendHeartbeat = useCallback(async () => {
    if (!currentPlayerId || !room) return

    try {
      await supabase
        .from("players")
        .update({
          last_heartbeat: new Date().toISOString(),
          is_connected: true,
        })
        .eq("id", currentPlayerId)

      await logAction("heartbeat")
    } catch (err) {
      console.error("Heartbeat failed:", err)
      setIsConnected(false)
    }
  }, [currentPlayerId, room])

  // Start heartbeat
  useEffect(() => {
    if (currentPlayerId && room) {
      setIsConnected(true)
      sendHeartbeat()

      heartbeatRef.current = setInterval(sendHeartbeat, 5000) // Every 5 seconds

      return () => {
        if (heartbeatRef.current) {
          clearInterval(heartbeatRef.current)
        }
      }
    }
  }, [currentPlayerId, room, sendHeartbeat])

  // Create room
  const createRoom = async (playerName: string, gameSettings: any) => {
    try {
      const roomCode = generateRoomCode()
      const playerId = crypto.randomUUID()

      const { data: roomData, error: roomError } = await supabase
        .from("rooms")
        .insert({
          room_code: roomCode,
          host_id: playerId,
          game_settings: {
            totalTimeBank: gameSettings.totalTimeBank * 1000 * 60, // Convert minutes to milliseconds
            totalRounds: gameSettings.totalRounds,
          },
          game_state: {
            currentRound: 1,
            gamePhase: "lobby",
            roundWinner: null,
            gameStarted: false,
            countdownStartTime: null,
            auctionStartTime: null,
            phaseTimeout: null,
            lastPhaseUpdate: Date.now(),
            winnerBidTime: null,
          },
        })
        .select()
        .single()

      if (roomError) throw roomError

      const { data: playerData, error: playerError } = await supabase
        .from("players")
        .insert({
          id: playerId,
          room_id: roomData.id,
          player_name: playerName,
          player_data: {
            timeBank: gameSettings.totalTimeBank * 1000 * 60, // Convert minutes to milliseconds
            victoryTokens: 0,
            isButtonPressed: false,
            hasOptedOut: false,
            bidTime: null,
            isEliminated: false,
            buttonPressTime: null,
            lastAction: Date.now(),
            totalTimeUsed: 0,
          },
          is_host: true,
          last_heartbeat: new Date().toISOString(),
        })
        .select()
        .single()

      if (playerError) throw playerError

      setRoom(roomData)
      setCurrentPlayerId(playerId)
      setError("")

      console.log("🎯 Room created:", roomCode)
      return { roomCode, playerId }
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  // Join room
  const joinRoom = async (roomCode: string, playerName: string) => {
    try {
      const { data: roomData, error: roomError } = await supabase
        .from("rooms")
        .select("*")
        .eq("room_code", roomCode)
        .eq("is_active", true)
        .single()

      if (roomError) throw new Error("Room not found")

      const playerId = crypto.randomUUID()

      const { data: playerData, error: playerError } = await supabase
        .from("players")
        .insert({
          id: playerId,
          room_id: roomData.id,
          player_name: playerName,
          player_data: {
            timeBank: roomData.game_settings.totalTimeBank, // Already in milliseconds
            victoryTokens: 0,
            isButtonPressed: false,
            hasOptedOut: false,
            bidTime: null,
            isEliminated: false,
            buttonPressTime: null,
            lastAction: Date.now(),
            totalTimeUsed: 0,
          },
          is_host: false,
          last_heartbeat: new Date().toISOString(),
        })
        .select()
        .single()

      if (playerError) throw playerError

      setRoom(roomData)
      setCurrentPlayerId(playerId)
      setError("")

      console.log("🎯 Joined room:", roomCode)
      return { roomCode, playerId }
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  // Start game
  const startGame = async () => {
    if (!room || !currentPlayerId) return

    const currentPlayer = players.find((p) => p.id === currentPlayerId)
    if (!currentPlayer?.is_host) return

    try {
      const now = Date.now()
      await supabase
        .from("rooms")
        .update({
          game_state: {
            ...room.game_state,
            gameStarted: true,
            gamePhase: "waiting",
            lastPhaseUpdate: now,
            phaseTimeout: now + 300000, // 5 minute timeout
          },
        })
        .eq("id", room.id)

      await logAction("phase_change", { newPhase: "waiting" })
      console.log("🎯 Game started")
    } catch (err: any) {
      setError(err.message)
    }
  }

  // Press button with better synchronization
  const pressButton = useCallback(async () => {
    if (!room || !currentPlayerId || isButtonPressed || processingRef.current) return

    const currentPlayer = players.find((p) => p.id === currentPlayerId)
    if (!currentPlayer || currentPlayer.player_data.isEliminated || currentPlayer.player_data.hasOptedOut) return

    // Prevent rapid-fire button presses
    const now = Date.now()
    if (now - lastActionRef.current < 100) return
    lastActionRef.current = now

    processingRef.current = true
    setIsButtonPressed(true)
    buttonPressStartTime.current = now

    try {
      console.log("🔴 Button pressed")

      await supabase
        .from("players")
        .update({
          player_data: {
            ...currentPlayer.player_data,
            isButtonPressed: true,
            hasOptedOut: false,
            buttonPressTime: now,
            lastAction: now,
          },
        })
        .eq("id", currentPlayerId)

      await logAction("button_press", { pressTime: now })

      // Check if all active players have pressed button
      setTimeout(async () => {
        try {
          const { data: freshPlayers } = await supabase
            .from("players")
            .select("*")
            .eq("room_id", room.id)
            .eq("is_connected", true)

          if (!freshPlayers) return

          const activePlayers = freshPlayers.filter((p) => !p.player_data.isEliminated && !p.player_data.hasOptedOut)
          const pressedPlayers = activePlayers.filter((p) => p.player_data.isButtonPressed)

          console.log(`🔴 Button check: ${pressedPlayers.length}/${activePlayers.length} pressed`)

          if (
            pressedPlayers.length >= activePlayers.length &&
            activePlayers.length >= 2 &&
            room.game_state.gamePhase === "waiting"
          ) {
            // All players pressed - start countdown
            const countdownStartTime = Date.now()
            await supabase
              .from("rooms")
              .update({
                game_state: {
                  ...room.game_state,
                  gamePhase: "countdown",
                  countdownStartTime,
                  lastPhaseUpdate: countdownStartTime,
                  phaseTimeout: countdownStartTime + 10000, // 10 second timeout
                },
              })
              .eq("id", room.id)

            await logAction("phase_change", { newPhase: "countdown", countdownStartTime })
            console.log("🕐 Countdown started")
          }
        } catch (err) {
          console.error("Error checking button states:", err)
        }
      }, 500) // Small delay to ensure all updates are processed
    } catch (err: any) {
      setError(err.message)
      setIsButtonPressed(false)
    } finally {
      processingRef.current = false
    }
  }, [room, currentPlayerId, players, isButtonPressed])

  // Release button with better synchronization
  const releaseButton = useCallback(async () => {
    if (!room || !currentPlayerId || !isButtonPressed || processingRef.current) return

    const currentPlayer = players.find((p) => p.id === currentPlayerId)
    if (!currentPlayer) return

    // Prevent rapid-fire button releases
    const now = Date.now()
    if (now - lastActionRef.current < 100) return
    lastActionRef.current = now

    processingRef.current = true
    setIsButtonPressed(false)

    try {
      console.log("🔴 Button released")

      if (room.game_state.gamePhase === "countdown") {
        // Opt out during countdown
        await supabase
          .from("players")
          .update({
            player_data: {
              ...currentPlayer.player_data,
              isButtonPressed: false,
              hasOptedOut: true,
              lastAction: now,
            },
          })
          .eq("id", currentPlayerId)

        await logAction("button_release", { phase: "countdown", optOut: true })
        console.log("❌ Opted out during countdown")
      } else if (room.game_state.gamePhase === "auction") {
        // Place bid during auction
        const auctionStartTime = room.game_state.auctionStartTime!
        const bidTime = now - auctionStartTime // Time spent in this round
        const newTotalTimeUsed = currentPlayer.player_data.totalTimeUsed + bidTime
        const newTimeBank = Math.max(0, currentPlayer.player_data.timeBank - bidTime)

        // Check if player has run out of time
        if (newTimeBank <= 0) {
          setShowTimeUp(true)
        }

        await supabase
          .from("players")
          .update({
            player_data: {
              ...currentPlayer.player_data,
              isButtonPressed: false,
              bidTime,
              timeBank: newTimeBank,
              totalTimeUsed: newTotalTimeUsed,
              lastAction: now,
              isEliminated: newTimeBank <= 0, // Eliminate if no time left
            },
          })
          .eq("id", currentPlayerId)

        await logAction("button_release", { phase: "auction", bidTime, newTimeBank, newTotalTimeUsed })
        console.log(`💰 Bid placed: ${bidTime}ms, total used: ${newTotalTimeUsed}ms, remaining: ${newTimeBank}ms`)

        // Check if all players have released (with delay for synchronization)
        setTimeout(async () => {
          try {
            const { data: freshPlayers } = await supabase
              .from("players")
              .select("*")
              .eq("room_id", room.id)
              .eq("is_connected", true)

            if (!freshPlayers) return

            const activePlayers = freshPlayers.filter(
              (p) => !p.player_data.isEliminated && !p.player_data.hasOptedOut && p.player_data.bidTime === null,
            )
            const stillHolding = activePlayers.filter((p) => p.player_data.isButtonPressed)

            console.log(`💰 Auction check: ${stillHolding.length} still holding`)

            if (stillHolding.length === 0) {
              await processRoundResults()
            }
          } catch (err) {
            console.error("Error checking auction states:", err)
          }
        }, 500)
      } else {
        // Normal button release
        await supabase
          .from("players")
          .update({
            player_data: {
              ...currentPlayer.player_data,
              isButtonPressed: false,
              lastAction: now,
            },
          })
          .eq("id", currentPlayerId)

        await logAction("button_release", { phase: room.game_state.gamePhase })
      }
    } catch (err: any) {
      setError(err.message)
      setIsButtonPressed(true) // Revert on error
    } finally {
      processingRef.current = false
      buttonPressStartTime.current = null
    }
  }, [room, currentPlayerId, players, isButtonPressed])

  // Process round results
  const processRoundResults = async () => {
    if (!room || !currentPlayerId) return

    const currentPlayer = players.find((p) => p.id === currentPlayerId)
    if (!currentPlayer?.is_host) return

    try {
      console.log("🏆 Processing round results...")

      // Get fresh player data
      const { data: freshPlayers } = await supabase.from("players").select("*").eq("room_id", room.id)

      if (!freshPlayers) return

      const bids = freshPlayers
        .filter((p) => p.player_data.bidTime !== null && !p.player_data.isEliminated && !p.player_data.hasOptedOut)
        .map((p) => ({
          playerId: p.id,
          playerName: p.player_name,
          bidTime: p.player_data.bidTime!,
        }))

      let winner: RoundWinner | null = null
      if (bids.length > 0) {
        // Find highest bid (most time spent)
        const maxBid = Math.max(...bids.map((b) => b.bidTime))
        const winners = bids.filter((b) => Math.abs(b.bidTime - maxBid) < 100) // within 0.1 seconds

        if (winners.length === 1) {
          winner = winners[0]
          // Award victory token
          const winnerPlayer = freshPlayers.find((p) => p.id === winner!.playerId)!
          await supabase
            .from("players")
            .update({
              player_data: {
                ...winnerPlayer.player_data,
                victoryTokens: winnerPlayer.player_data.victoryTokens + 1,
              },
            })
            .eq("id", winner.playerId)

          console.log(`🏆 Winner: ${winner.playerName} (${winner.bidTime}ms)`)
        } else {
          console.log("🤝 Tie - no winner")
        }
      }

      // Update room state
      await supabase
        .from("rooms")
        .update({
          game_state: {
            ...room.game_state,
            gamePhase: "roundResults",
            roundWinner: winner?.playerId || null,
            winnerBidTime: winner?.bidTime || null, // Store winner's bid time
            lastPhaseUpdate: Date.now(),
          },
        })
        .eq("id", room.id)

      await logAction("phase_change", { newPhase: "roundResults", winner: winner?.playerId })
    } catch (err: any) {
      setError(err.message)
      console.error("Error processing round results:", err)
    }
  }

  // Continue to next round
  const continueToNextRound = async () => {
    if (!room || !currentPlayerId) return

    const currentPlayer = players.find((p) => p.id === currentPlayerId)
    if (!currentPlayer?.is_host) return

    try {
      if (room.game_state.currentRound >= room.game_settings.totalRounds) {
        await supabase
          .from("rooms")
          .update({
            game_state: {
              ...room.game_state,
              gamePhase: "gameOver",
              lastPhaseUpdate: Date.now(),
            },
          })
          .eq("id", room.id)

        await logAction("phase_change", { newPhase: "gameOver" })
        console.log("🎮 Game over")
        return
      }

      // Reset for next round
      const allPlayers = players.filter((p) => true)

      for (const player of allPlayers) {
        await supabase
          .from("players")
          .update({
            player_data: {
              ...player.player_data,
              isButtonPressed: false,
              hasOptedOut: false,
              bidTime: null, // Reset bid time for new round
              buttonPressTime: null,
              lastAction: Date.now(),
            },
          })
          .eq("id", player.id)
      }

      const now = Date.now()
      await supabase
        .from("rooms")
        .update({
          game_state: {
            ...room.game_state,
            gamePhase: "waiting",
            currentRound: room.game_state.currentRound + 1,
            roundWinner: null,
            winnerBidTime: null,
            countdownStartTime: null,
            auctionStartTime: null,
            lastPhaseUpdate: now,
            phaseTimeout: now + 300000, // 5 minute timeout
          },
        })
        .eq("id", room.id)

      // Reset the auction timer display
      setCurrentAuctionTime(0)

      await logAction("phase_change", { newPhase: "waiting", round: room.game_state.currentRound + 1 })
      console.log(`🔄 Next round: ${room.game_state.currentRound + 1}`)
    } catch (err: any) {
      setError(err.message)
    }
  }

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !keyDownRef.current) {
        e.preventDefault()
        keyDownRef.current = true
        pressButton()
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space" && keyDownRef.current) {
        e.preventDefault()
        keyDownRef.current = false
        releaseButton()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [pressButton, releaseButton])

  // Enhanced timing system with automatic phase progression
  useEffect(() => {
    if (!room) return

    const timer = setInterval(() => {
      const now = Date.now()

      // Update debug info
      setDebugInfo({
        phase: room.game_state.gamePhase,
        countdownStart: room.game_state.countdownStartTime,
        auctionStart: room.game_state.auctionStartTime,
        lastUpdate: room.game_state.lastPhaseUpdate,
        timeout: room.game_state.phaseTimeout,
        now,
        currentAuctionTime,
      })

      // Handle countdown phase
      if (room.game_state.gamePhase === "countdown" && room.game_state.countdownStartTime) {
        const elapsed = now - room.game_state.countdownStartTime
        if (elapsed >= 5000) {
          // Countdown finished - start auction (host only)
          const currentPlayer = players.find((p) => p.id === currentPlayerId)
          if (currentPlayer?.is_host) {
            console.log("🕐 Countdown finished, starting auction")
            supabase
              .from("rooms")
              .update({
                game_state: {
                  ...room.game_state,
                  gamePhase: "auction",
                  auctionStartTime: now,
                  lastPhaseUpdate: now,
                  phaseTimeout: now + 60000, // 1 minute auction timeout
                },
              })
              .eq("id", room.id)
              .then(() => {
                logAction("phase_change", { newPhase: "auction", auctionStartTime: now })
              })
          }
        }
      }

      // Handle auction phase - update the counting-up timer
      if (room.game_state.gamePhase === "auction" && room.game_state.auctionStartTime) {
        const elapsed = now - room.game_state.auctionStartTime
        setCurrentAuctionTime(elapsed) // Count up from 0

        // Check if current player has run out of total time
        const currentPlayer = players.find((p) => p.id === currentPlayerId)
        if (currentPlayer && isButtonPressed) {
          const totalTimeUsed = currentPlayer.player_data.totalTimeUsed + elapsed
          const remainingTime = currentPlayer.player_data.timeBank - totalTimeUsed

          if (remainingTime <= 0 && !showTimeUp) {
            setShowTimeUp(true)
            releaseButton()
          }
        }
      }

      // Reset timer when not in auction phase
      if (room.game_state.gamePhase !== "auction") {
        setCurrentAuctionTime(0)
      }

      // Handle phase timeouts
      if (room.game_state.phaseTimeout && now > room.game_state.phaseTimeout) {
        const currentPlayer = players.find((p) => p.id === currentPlayerId)
        if (currentPlayer?.is_host) {
          console.log("⏰ Phase timeout, forcing progression")

          if (room.game_state.gamePhase === "countdown") {
            // Force start auction
            supabase
              .from("rooms")
              .update({
                game_state: {
                  ...room.game_state,
                  gamePhase: "auction",
                  auctionStartTime: now,
                  lastPhaseUpdate: now,
                  phaseTimeout: now + 60000,
                },
              })
              .eq("id", room.id)
          } else if (room.game_state.gamePhase === "auction") {
            // Force end auction
            processRoundResults()
          }
        }
      }
    }, 50) // 50ms for smooth updates

    return () => clearInterval(timer)
  }, [room, players, currentPlayerId, isButtonPressed, showTimeUp, releaseButton, currentAuctionTime])

  // Set up real-time subscriptions
  useEffect(() => {
    if (!room) return

    const roomSubscription = supabase
      .channel(`room-${room.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "rooms",
          filter: `id=eq.${room.id}`,
        },
        (payload) => {
          if (payload.new) {
            setRoom(payload.new as TimeAuctionRoom)
          }
        },
      )
      .subscribe()

    const playersSubscription = supabase
      .channel(`players-${room.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "players",
          filter: `room_id=eq.${room.id}`,
        },
        async () => {
          const { data } = await supabase.from("players").select("*").eq("room_id", room.id).order("created_at")
          if (data) {
            setPlayers(data)
          }
        },
      )
      .subscribe()

    return () => {
      roomSubscription.unsubscribe()
      playersSubscription.unsubscribe()
    }
  }, [room])

  // Load initial players
  useEffect(() => {
    if (!room) return

    const loadPlayers = async () => {
      const { data } = await supabase.from("players").select("*").eq("room_id", room.id).order("created_at")
      if (data) {
        setPlayers(data)
      }
    }

    loadPlayers()
  }, [room])

  // Format time helper - ensure it handles numbers properly
  const formatTime = (ms: number) => {
    // Ensure ms is a valid number
    if (typeof ms !== "number" || isNaN(ms) || ms < 0) {
      return "00:00.0"
    }

    const totalSeconds = Math.floor(ms / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    const tenths = Math.floor((ms % 1000) / 100)
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${tenths}`
  }

  // Get countdown time
  const getCountdownTime = () => {
    if (!room?.game_state.countdownStartTime) return 5
    const elapsed = (Date.now() - room.game_state.countdownStartTime) / 1000
    return Math.max(0, 5 - elapsed)
  }

  // Update the localTimeBank when current player data changes
  useEffect(() => {
    const currentPlayer = players.find((p) => p.id === currentPlayerId)
    if (currentPlayer) {
      setLocalTimeBank(currentPlayer.player_data.timeBank)
    }
  }, [players, currentPlayerId])

  return {
    room,
    players,
    currentPlayerId,
    isConnected,
    error,
    isButtonPressed,
    currentAuctionTime,
    showTimeUp,
    debugInfo,
    localTimeBank, 
    setShowTimeUp,
    createRoom,
    joinRoom,
    startGame,
    pressButton,
    releaseButton,
    continueToNextRound,
    formatTime,
    getCountdownTime,
  }
}
