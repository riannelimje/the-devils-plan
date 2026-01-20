"use client"

import { useState, useEffect } from "react"
import { supabase, type Room, type Player } from "@/lib/supabase"

const INITIAL_DECK = [1, 2, 3, 4, 5, 6, 7, 8]

export function useSupabaseGame() {
  const [room, setRoom] = useState<Room | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [currentPlayerId, setCurrentPlayerId] = useState<string>("")
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState("")
  const [isProcessingRound, setIsProcessingRound] = useState(false) // Prevent double processing
  const [debugInfo, setDebugInfo] = useState<string>("")

  // Generate room code
  const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase()
  }

  // Create room
  const createRoom = async (playerName: string, gameSettings: any) => {
    try {
      const roomCode = generateRoomCode()
      const playerId = crypto.randomUUID()

      // Create room
      const { data: roomData, error: roomError } = await supabase
        .from("rooms")
        .insert({
          room_code: roomCode,
          host_id: playerId,
          game_settings: {
            ...gameSettings,
            minPlayers: gameSettings.minPlayers || 2,
          },
          game_state: {
            currentRound: 1,
            gamePhase: "lobby",
            roundWinner: null,
            gameStarted: false,
          },
        })
        .select()
        .single()

      if (roomError) throw roomError

      // Create host player
      const { data: playerData, error: playerError } = await supabase
        .from("players")
        .insert({
          id: playerId,
          room_id: roomData.id,
          player_name: playerName,
          player_data: {
            deck: [...INITIAL_DECK],
            holdingBox: [],
            points: 0,
            victoryTokens: 0,
            selectedCards: null,
            finalChoice: null,
            finalCard: null,
            hasSubmittedCards: false,
            hasSubmittedFinalChoice: false,
          },
          is_host: true,
        })
        .select()
        .single()

      if (playerError) throw playerError

      setRoom(roomData)
      setCurrentPlayerId(playerId)
      setIsConnected(true)
      setError("")

      return { roomCode, playerId }
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  // Join room
  const joinRoom = async (roomCode: string, playerName: string) => {
    try {
      // Find room
      const { data: roomData, error: roomError } = await supabase
        .from("rooms")
        .select("*")
        .eq("room_code", roomCode)
        .eq("is_active", true)
        .single()

      if (roomError) throw new Error("Room not found")

      // Check if room is full
      const { data: existingPlayers } = await supabase.from("players").select("*").eq("room_id", roomData.id)

      if (existingPlayers && existingPlayers.length >= roomData.game_settings.maxPlayers) {
        throw new Error("Room is full")
      }

      const playerId = crypto.randomUUID()

      // Create player
      const { data: playerData, error: playerError } = await supabase
        .from("players")
        .insert({
          id: playerId,
          room_id: roomData.id,
          player_name: playerName,
          player_data: {
            deck: [...INITIAL_DECK],
            holdingBox: [],
            points: 0,
            victoryTokens: 0,
            selectedCards: null,
            finalChoice: null,
            finalCard: null,
            hasSubmittedCards: false,
            hasSubmittedFinalChoice: false,
          },
          is_host: false,
        })
        .select()
        .single()

      if (playerError) throw playerError

      setRoom(roomData)
      setCurrentPlayerId(playerId)
      setIsConnected(true)
      setError("")

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
      await supabase
        .from("rooms")
        .update({
          game_state: {
            ...room.game_state,
            gameStarted: true,
            gamePhase: "cardSelection",
          },
        })
        .eq("id", room.id)
    } catch (err: any) {
      setError(err.message)
    }
  }

  // Select card
  const selectCard = async (card: number) => {
    if (!room || !currentPlayerId) return

    const currentPlayer = players.find((p) => p.id === currentPlayerId)
    if (!currentPlayer || currentPlayer.player_data.hasSubmittedCards) return

    const currentSelected = currentPlayer.player_data.selectedCards || []
    let newSelected: number[] = []

    // Handle the case where selectedCards might have -1 placeholder
    const validSelected = currentSelected.filter((c) => c !== -1)

    if (validSelected.includes(card)) {
      // Deselect card
      newSelected = validSelected.filter((c) => c !== card)
    } else if (validSelected.length < 2) {
      // Select card
      newSelected = [...validSelected, card]
    } else {
      return // Can't select more than 2 cards
    }

    try {
      await supabase
        .from("players")
        .update({
          player_data: {
            ...currentPlayer.player_data,
            selectedCards:
              newSelected.length === 2
                ? (newSelected as [number, number])
                : newSelected.length === 1
                  ? ([newSelected[0], -1] as [number, number])
                  : null,
          },
        })
        .eq("id", currentPlayerId)
    } catch (err: any) {
      setError(err.message)
    }
  }

  // Submit card selection
  const submitCardSelection = async () => {
    if (!room || !currentPlayerId) return

    const currentPlayer = players.find((p) => p.id === currentPlayerId)
    if (!currentPlayer?.player_data.selectedCards) return

    const validSelected = currentPlayer.player_data.selectedCards.filter((c) => c !== -1)
    if (validSelected.length !== 2) return

    try {
      await supabase
        .from("players")
        .update({
          player_data: {
            ...currentPlayer.player_data,
            hasSubmittedCards: true,
          },
        })
        .eq("id", currentPlayerId)

      // Check if all players have submitted
      const activePlayers = players.filter((p) => true) // No elimination, all players active
      const allSubmitted = activePlayers.every((p) => p.id === currentPlayerId || p.player_data.hasSubmittedCards)

      if (allSubmitted) {
        // Move to combined reveal and final choice phase
        setTimeout(async () => {
          await supabase
            .from("rooms")
            .update({
              game_state: {
                ...room.game_state,
                gamePhase: "finalChoice",
              },
            })
            .eq("id", room.id)
        }, 1000)
      }
    } catch (err: any) {
      setError(err.message)
    }
  }

  // Make final choice
  const makeFinalChoice = async (choice: "left" | "right") => {
    if (!room || !currentPlayerId) return

    const currentPlayer = players.find((p) => p.id === currentPlayerId)
    if (!currentPlayer?.player_data.selectedCards || currentPlayer.player_data.hasSubmittedFinalChoice) return

    const finalCard =
      choice === "left" ? currentPlayer.player_data.selectedCards[0] : currentPlayer.player_data.selectedCards[1]

    try {
      await supabase
        .from("players")
        .update({
          player_data: {
            ...currentPlayer.player_data,
            finalChoice: choice,
            finalCard,
          },
        })
        .eq("id", currentPlayerId)
    } catch (err: any) {
      setError(err.message)
    }
  }

  // Submit final choice
  const submitFinalChoice = async () => {
    if (!room || !currentPlayerId) return

    const currentPlayer = players.find((p) => p.id === currentPlayerId)
    if (!currentPlayer?.player_data.finalCard || currentPlayer.player_data.hasSubmittedFinalChoice) return

    try {
      await supabase
        .from("players")
        .update({
          player_data: {
            ...currentPlayer.player_data,
            hasSubmittedFinalChoice: true,
          },
        })
        .eq("id", currentPlayerId)

      // Check if all players have submitted final choices
      const activePlayers = players.filter((p) => true) // No elimination
      const allSubmittedFinal = activePlayers.every(
        (p) => p.id === currentPlayerId || p.player_data.hasSubmittedFinalChoice,
      )

      if (allSubmittedFinal) {
        // Process round and move to results
        setTimeout(async () => {
          await processRoundResults()
        }, 1000)
      }
    } catch (err: any) {
      setError(err.message)
    }
  }

  // Process round results
  const processRoundResults = async () => {
    if (!room || !currentPlayerId || isProcessingRound) return

    const currentPlayer = players.find((p) => p.id === currentPlayerId)
    if (!currentPlayer?.is_host) return

    setDebugInfo("Starting round processing...")
    console.log("Starting round processing...")
    setIsProcessingRound(true) // Prevent double processing

    try {
      const activePlayers = players.filter((p) => true) // No elimination
      const submissions = activePlayers.map((p) => ({
        playerId: p.id,
        playerName: p.player_name,
        card: p.player_data.finalCard!,
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
      const winner = lowestUnique ? submissions.find((sub) => sub.card === lowestUnique) : null

      console.log("🎯 Round analysis:", {
        submissions,
        cardCounts,
        uniqueCards,
        lowestUnique,
        winner: winner?.playerName,
      })

      // Update players with FIXED card management
      for (const player of activePlayers) {
        const isWinner = player.id === winner?.playerId
        const usedCard = player.player_data.finalCard! // Card that was submitted (will be permanently removed)
        const unusedCard = player.player_data.selectedCards!.find((card) => card !== usedCard)! // Card not chosen (goes to holding box)

        console.log(`🎯 BEFORE - Player ${player.player_name}:`, {
          deck: player.player_data.deck,
          holdingBox: player.player_data.holdingBox,
          usedCard,
          unusedCard,
          currentPoints: player.player_data.points,
        })

        // FIXED LOGIC: Properly manage cards without duplicates
        const newDeck = [...player.player_data.deck]
        const newHoldingBox = [...player.player_data.holdingBox]

        // Remove used card from deck (permanently discarded)
        const usedCardIndex = newDeck.indexOf(usedCard)
        if (usedCardIndex > -1) {
          newDeck.splice(usedCardIndex, 1)
        }

        // Remove unused card from deck and add to holding box
        const unusedCardIndex = newDeck.indexOf(unusedCard)
        if (unusedCardIndex > -1) {
          newDeck.splice(unusedCardIndex, 1)
          newHoldingBox.push(unusedCard)
        }

        const pointsAwarded = isWinner ? usedCard : 0
        const newPoints = player.player_data.points + pointsAwarded
        const newVictoryTokens = player.player_data.victoryTokens + (isWinner ? 1 : 0)

        console.log(`🎯 AFTER - Player ${player.player_name}:`, {
          newDeck,
          newHoldingBox,
          pointsAwarded,
          newPoints,
          newVictoryTokens,
        })

        await supabase
          .from("players")
          .update({
            player_data: {
              ...player.player_data,
              points: newPoints,
              victoryTokens: newVictoryTokens,
              deck: newDeck,
              holdingBox: newHoldingBox,
            },
          })
          .eq("id", player.id)
      }

      // Update room with round results
      await supabase
        .from("rooms")
        .update({
          game_state: {
            ...room.game_state,
            gamePhase: "roundResults",
            roundWinner: winner?.playerId || null,
          },
        })
        .eq("id", room.id)

      console.log("🎯 Round processing completed!")
    } catch (err: any) {
      setError(err.message)
      console.error("❌ Error processing round results:", err)
    } finally {
      setIsProcessingRound(false) // Reset processing flag
    }
  }

  // Continue to next round
  const continueToNextRound = async () => {
    if (!room || !currentPlayerId) return

    const currentPlayer = players.find((p) => p.id === currentPlayerId)
    if (!currentPlayer?.is_host) return

    setDebugInfo("Moving to next round...")

    try {
      // Check if game should end
      if (room.game_state.currentRound >= room.game_settings.totalRounds) {
        await supabase
          .from("rooms")
          .update({
            game_state: {
              ...room.game_state,
              gamePhase: "gameOver",
            },
          })
          .eq("id", room.id)
        return
      }

      // Check if we need to reset the deck (after rounds 6 and 12)
      const shouldResetDeck = [6, 12].includes(room.game_state.currentRound)
      console.log("🔄 Current round:", room.game_state.currentRound)
      console.log("🔄 Should reset deck?", shouldResetDeck)

      const allPlayers = players.filter((p) => true)

      for (const player of allPlayers) {
        let newDeck: number[], newHoldingBox: number[]

        if (shouldResetDeck) {
          // FULL RESET: Give a fresh deck and clear holding box
          console.log(`🔄 DECK RESET for ${player.player_name}`)
          newDeck = [...INITIAL_DECK]
          newHoldingBox = []
        } else {
          // Normal: move holding box cards back to deck
          console.log(`🔄 NORMAL RESET for ${player.player_name}:`, {
            currentDeck: player.player_data.deck,
            currentHoldingBox: player.player_data.holdingBox,
          })
          newDeck = [...player.player_data.deck, ...player.player_data.holdingBox]
          newHoldingBox = []
        }

        console.log(`🔄 AFTER RESET - Player ${player.player_name}:`, {
          newDeck,
          newHoldingBox,
        })

        await supabase
          .from("players")
          .update({
            player_data: {
              ...player.player_data,
              selectedCards: null,
              finalChoice: null,
              finalCard: null,
              hasSubmittedCards: false,
              hasSubmittedFinalChoice: false,
              deck: newDeck,
              holdingBox: newHoldingBox,
            },
          })
          .eq("id", player.id)
      }

      // Move to next round
      await supabase
        .from("rooms")
        .update({
          game_state: {
            ...room.game_state,
            gamePhase: "cardSelection",
            currentRound: room.game_state.currentRound + 1,
            roundWinner: null,
          },
        })
        .eq("id", room.id)
    } catch (err: any) {
      setError(err.message)
      console.error("❌ Error continuing to next round:", err)
    }
  }

  const forceProcessRound = async () => {
    console.log("Force processing round...")
    setDebugInfo("Force processing round...")
    setIsProcessingRound(false) // Reset the flag
    await processRoundResults()
  }

  // Set up real-time subscriptions
  useEffect(() => {
    if (!room) return

    // Subscribe to room changes
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
            setRoom(payload.new as Room)
          }
        },
      )
      .subscribe()

    // Subscribe to player changes
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
        (payload) => {
          if (payload.eventType === "INSERT" && payload.new) {
            // Add new player
            setPlayers((prev) => [...prev, payload.new as Player])
          } else if (payload.eventType === "UPDATE" && payload.new) {
            // Update existing player
            setPlayers((prev) =>
              prev.map((p) => (p.id === (payload.new as Player).id ? (payload.new as Player) : p))
            )
          } else if (payload.eventType === "DELETE" && payload.old) {
            // Remove player
            setPlayers((prev) => prev.filter((p) => p.id !== (payload.old as Player).id))
          }
        },
      )
      .subscribe()

    return () => {
      roomSubscription.unsubscribe()
      playersSubscription.unsubscribe()
    }
  }, [room])

  // Load initial players when room is set
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

  // Auto-process round when all players have submitted final choices (FIXED to prevent double processing)
  useEffect(() => {
    if (!room || room.game_state.gamePhase !== "finalChoice" || isProcessingRound) return

    const activePlayers = players.filter((p) => true)
    const allSubmittedFinal =
      activePlayers.length > 0 && activePlayers.every((p) => p.player_data.hasSubmittedFinalChoice)

    if (allSubmittedFinal) {
      const currentPlayer = players.find((p) => p.id === currentPlayerId)
      if (currentPlayer?.is_host) {
        setDebugInfo("All players submitted, processing round...")
        console.log("All players submitted, processing round...")
        // Small delay to ensure all updates are processed
        setTimeout(() => {
          processRoundResults()
        }, 1500)
      }
    }
  }, [players, room, isProcessingRound])

  return {
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
  }
}
