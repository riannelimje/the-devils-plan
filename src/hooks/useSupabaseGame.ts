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
          game_settings: gameSettings,
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
    if (!currentPlayer || currentPlayer.player_data.isEliminated) return

    const currentSelected: number[] = currentPlayer.player_data.selectedCards || []
    let newSelected: number[] = []

    if (currentSelected.includes(card)) {
      // Deselect card
      newSelected = currentSelected.filter((c) => c !== card)
    } else if (currentSelected.length < 2) {
      // Select card
      newSelected = [...currentSelected, card]
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

      // Log action for real-time updates
      await supabase.from("game_actions").insert({
        room_id: room.id,
        player_id: currentPlayerId,
        action_type: "CARD_SELECTED",
        action_data: { card, selectedCards: newSelected },
      })
    } catch (err: any) {
      setError(err.message)
    }
  }

  // Make final choice
  const makeFinalChoice = async (choice: "left" | "right") => {
    if (!room || !currentPlayerId) return

    const currentPlayer = players.find((p) => p.id === currentPlayerId)
    if (!currentPlayer?.player_data.selectedCards) return

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

      // Log action
      await supabase.from("game_actions").insert({
        room_id: room.id,
        player_id: currentPlayerId,
        action_type: "FINAL_CHOICE",
        action_data: { choice, finalCard },
      })
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
      // Process game logic here (you'll need to implement this)
      // For now, just advance to next phase
      let nextPhase = room.game_state.gamePhase

      if (nextPhase === "roundEnd") {
        nextPhase = "cardSelection"
      } else if (nextPhase === "survival") {
        nextPhase = "cardSelection"
      }

      await supabase
        .from("rooms")
        .update({
          game_state: {
            ...room.game_state,
            gamePhase: nextPhase,
            currentRound:
              nextPhase === "cardSelection" ? room.game_state.currentRound + 1 : room.game_state.currentRound,
          },
        })
        .eq("id", room.id)
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
    makeFinalChoice,
    continueGame,
  }
}
