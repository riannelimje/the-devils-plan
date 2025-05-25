import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database
export interface Room {
  id: string
  room_code: string
  host_id: string
  game_settings: {
    totalRounds: number
    maxPlayers: number
    minPlayers: number
  }
  game_state: {
    currentRound: number
    gamePhase: string
    roundWinner: string | null
    gameStarted: boolean
  }
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Player {
  id: string
  room_id: string
  player_name: string
  player_data: {
    deck: number[]
    holdingBox: number[]
    points: number
    victoryTokens: number
    selectedCards: [number, number] | null
    finalChoice: "left" | "right" | null
    finalCard: number | null
    hasSubmittedCards: boolean
    hasSubmittedFinalChoice: boolean
  }
  is_host: boolean
  is_connected: boolean
  created_at: string
  updated_at: string
}

export interface GameAction {
  id: string
  room_id: string
  player_id: string
  action_type: string
  action_data: any
  created_at: string
}
