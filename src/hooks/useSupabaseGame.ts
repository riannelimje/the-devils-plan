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
            eliminatedPlayer: null,
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
            tempUnavailable: [],
            points: 0,
            victoryTokens: 0,
            isEliminated: false,
            selectedCards: null,
            finalChoice: null,
            finalCard: null,
            isReady: false,
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
            tempUnavailable: [],
            points: 0,
            victoryTokens: 0,
            isEliminated: false,
            selectedCards: null,
            finalChoice: null,
            finalCard: null,
            isReady: false,
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
    if (!currentPlayer || currentPlayer.player_data.isEliminated || currentPlayer.player_data.hasSubmittedCards) return

    const currentSelected = currentPlayer.player_data.selectedCards || []
    let newSelected: number[] = []

    // Fix: Handle the case where selectedCards might have -1 placeholder
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

      // Log action
      await supabase.from("game_actions").insert({
        room_id: room.id,
        player_id: currentPlayerId,
        action_type: "CARDS_SUBMITTED",
        action_data: { selectedCards: validSelected },
      })

      // Check if all players have submitted
      const activePlayers = players.filter((p) => !p.player_data.isEliminated)
      const allSubmitted = activePlayers.every((p) => p.id === currentPlayerId || p.player_data.hasSubmittedCards)

      if (allSubmitted) {
        // Move to reveal phase
        setTimeout(async () => {
          await supabase
            .from("rooms")
            .update({
              game_state: {
                ...room.game_state,
                gamePhase: "cardReveal",
              },
            })
            .eq("id", room.id)
        }, 1000)
      }
    } catch (err: any) {
      setError(err.message)
    }
  }

  // Continue from card reveal to final choice
  const continueToFinalChoice = async () => {
    if (!room || !currentPlayerId) return

    const currentPlayer = players.find((p) => p.id === currentPlayerId)
    if (!currentPlayer?.is_host) return

    try {
      await supabase
        .from("rooms")
        .update({
          game_state: {
            ...room.game_state,
            gamePhase: "finalChoice",
          },
        })
        .eq("id", room.id)
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

      // Log action
      await supabase.from("game_actions").insert({
        room_id: room.id,
        player_id: currentPlayerId,
        action_type: "FINAL_CHOICE_SUBMITTED",
        action_data: {
          choice: currentPlayer.player_data.finalChoice,
          finalCard: currentPlayer.player_data.finalCard,
        },
      })

      // Check if all players have submitted final choices
      const activePlayers = players.filter((p) => !p.player_data.isEliminated)
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
    if (!room || !currentPlayerId) return

    const currentPlayer = players.find((p) => p.id === currentPlayerId)
    if (!currentPlayer?.is_host) return

    try {
      const activePlayers = players.filter((p) => !p.player_data.isEliminated)
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

      // Update players with results
      for (const player of activePlayers) {
        const isWinner = player.id === winner?.playerId
        const usedCard = player.player_data.finalCard!
        const unusedCard = player.player_data.selectedCards!.find((card) => card !== usedCard)!

        await supabase
          .from("players")
          .update({
            player_data: {
              ...player.player_data,
              points: player.player_data.points + (isWinner ? usedCard : 0),
              victoryTokens: player.player_data.victoryTokens + (isWinner ? 1 : 0),
              holdingBox: isWinner ? [...player.player_data.holdingBox, usedCard] : player.player_data.holdingBox,
              tempUnavailable: !isWinner ? [unusedCard] : [],
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
    } catch (err: any) {
      setError(err.message)
    }
  }

  // Continue game (host only)
  const continueGame = async () => {
    if (!room || !currentPlayerId) return

    const currentPlayer = players.find((p) => p.id === currentPlayerId)
    if (!currentPlayer?.is_host) return

    try {
      // Check if it's a survival round
      const isSurvivalRound = room.game_settings.survivalRounds.includes(room.game_state.currentRound)

      if (isSurvivalRound) {
        // Handle survival round logic here
        await supabase
          .from("rooms")
          .update({
            game_state: {
              ...room.game_state,
              gamePhase: "survival",
            },
          })
          .eq("id", room.id)
      } else {
        // Reset for next round
        const activePlayers = players.filter((p) => !p.player_data.isEliminated)

        for (const player of activePlayers) {
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
                tempUnavailable: [], // Return temp unavailable cards
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
      }
    } catch (err: any) {
      setError(err.message)
    }
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
        async () => {
          // Refetch all players when any player changes
          const { data } = await supabase.from("players").select("*").eq("room_id", room.id).order("created_at")

          if (data) {
            setPlayers(data)
          }
        },
      )
      .subscribe()

    // Subscribe to game actions
    const actionsSubscription = supabase
      .channel(`actions-${room.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "game_actions",
          filter: `room_id=eq.${room.id}`,
        },
        (payload) => {
          // Handle real-time game actions here
          console.log("New game action:", payload.new)
        },
      )
      .subscribe()

    return () => {
      roomSubscription.unsubscribe()
      playersSubscription.unsubscribe()
      actionsSubscription.unsubscribe()
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

  return {
    room,
    players,
    currentPlayerId,
    isConnected,
    error,
    createRoom,
    joinRoom,
    startGame,
    selectCard,
    submitCardSelection,
    continueToFinalChoice,
    makeFinalChoice,
    submitFinalChoice,
    continueGame,
  }
}
