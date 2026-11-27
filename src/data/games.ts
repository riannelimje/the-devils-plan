export type GameMode = 'online' | 'local' | 'single'
export type SeasonNumber = 2 | 3

export interface GameEntry {
  id: string
  season: SeasonNumber
  title: string
  description: string
  players: string
  image?: string
  href: string
  gameMode: GameMode
  seasonBadge?: string
  comingSoon?: boolean
}

export interface SeasonMeta {
  season: SeasonNumber
  code: string
  label: string
  subtitle: string
  tagline: string
  featuredHref: string
  isNew?: boolean
}

export const SEASONS: SeasonMeta[] = [
  {
    season: 3,
    code: 'S03',
    label: 'Season 3',
    subtitle: "God's Test",
    tagline: 'Decode the ancient Exile script and conquer the newest arena.',
    featuredHref: '/games/magicSquare',
    isNew: true,
  },
  {
    season: 2,
    code: 'S02',
    label: 'Season 2',
    subtitle: 'Death Room',
    tagline: 'Original strategic games from The Devil\'s Plan 2.',
    featuredHref: '/games/knightsTour',
  },
]

export const GAMES: GameEntry[] = [
  {
    id: 'magic-square',
    season: 3,
    title: '49 Magic Square',
    description:
      'Decode the Exile hieroglyphs and fill the 7×7 grid (or 3×3 warm-up) so every row, column, and diagonal shares the same magic sum.',
    players: '1',
    href: '/games/magicSquare',
    gameMode: 'single',
    seasonBadge: "God's Test",
  },
  {
    id: 'knights-tour',
    season: 2,
    title: "The Knight's Tour",
    description:
      'A classic chess puzzle where you must move a knight to every square on the board without repeating.',
    players: '1',
    image: '/images/game1.png',
    href: '/games/knightsTour',
    gameMode: 'single',
  },
  {
    id: 'remove-one',
    season: 2,
    title: 'Remove One',
    description: 'The player with the lowest unique number wins the round.',
    players: '2-8',
    image: '/images/game2.png',
    href: '/games/removeOne',
    gameMode: 'online',
  },
  {
    id: 'time-auction',
    season: 2,
    title: 'Time Auction',
    description: 'Bid from a limited time bank and become the last standing player to win!',
    players: '2+',
    image: '/images/game3.png',
    href: '/games/timeAuction2',
    gameMode: 'online',
  },
  {
    id: 'wall-baduk',
    season: 2,
    title: 'Wall Baduk',
    description: 'Wall Baduk aka Wall Go. Claim the largest territory.',
    players: '2',
    image: '/images/game4.png',
    href: '/games/wallBaduk',
    gameMode: 'local',
  },
]
