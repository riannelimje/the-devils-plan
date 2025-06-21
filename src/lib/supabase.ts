import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Remove One Game Types
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
  processed?: boolean
  created_at: string
}

// Time Auction Game Types
export interface TimeAuctionRoom {
  id: string
  room_code: string
  host_id: string
  game_settings: {
    totalTimeBank: number // in milliseconds
    totalRounds: number
  }
  game_state: {
    currentRound: number
    gamePhase: "lobby" | "waiting" | "countdown" | "auction" | "roundResults" | "gameOver"
    roundWinner: string | null
    gameStarted: boolean
    countdownStartTime: number | null
    auctionStartTime: number | null
    phaseTimeout: number | null
    lastPhaseUpdate: number | null
    winnerBidTime: number | null 
  }
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface TimeAuctionPlayer {
  id: string
  room_id: string
  player_name: string
  player_data: {
    timeBank: number // remaining time in milliseconds
    victoryTokens: number
    isButtonPressed: boolean
    hasOptedOut: boolean
    bidTime: number | null // time spent in current auction (ms)
    isEliminated: boolean
    buttonPressTime: number | null
    lastAction: number | null
    totalTimeUsed: number // cumulative time used across all rounds
  }
  is_host: boolean
  is_connected: boolean
  last_heartbeat: string
  created_at: string
  updated_at: string
}

// Winner type for better type safety
export interface RoundWinner {
  playerId: string
  playerName: string
  bidTime: number
}
