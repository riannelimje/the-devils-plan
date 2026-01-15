# 🎮 The Devil's Plan - Interactive Game Collection

> *"The game never ends..."*

A web-based recreation of the strategic intellectual games from the hit Netflix show "The Devil's Plan". Play the mind-bending puzzles that challenged contestants, now available for everyone to enjoy!

<div align="center">

[![Next.js](https://img.shields.io/badge/Made%20with-Next.js-black?style=flat&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white)](https://supabase.com)

</div>

## 🎯 About The Project

As a developer and puzzle enthusiast, I wanted to bring the intellectual challenges from "The Devil's Plan" to the web. This project recreates the show's strategic games with:

- 🎨 **Mysterious UI** - Dark, surveillance-style aesthetic with glitch effects and animations
- 🎮 **Interactive Gameplay** - Single and multiplayer game modes
- 🔐 **Hidden Easter Eggs** - Including an interactive puzzle to unlock the source code (if you are here, you might or might not have unlocked it hehe)
- ⚡ **Real-time Multiplayer** - Play against others using Supabase
- 📱 **Responsive Design** - Works on all devices

## 🎲 Games Catalogue

| Game | Status | Player(s) | Description |
|------|--------|---------|-------------|
| **♞ Knight's Tour** | ✅ Available | 1 | Navigate a chess knight across the board |
| **➖ Remove One** | ✅ Available | Online Multiplayer | Strategic number elimination game |
| **⏱️ Time Auction** | 🚧 Coming Soon | Online Multiplayer | Bid your time wisely to win challenges |
| **⚫ Wall Baduk** | ✅ Available | Local Multiplayer | Strategic territory control game |

> **Note:** Online Multiplayer games may occasionally experience server delays during peak gameplay (actively working on optimizations!)

### 🔓 Interactive Puzzle System
**Can you unlock the source code?**
Check it out in the about page!
- if you are already here and haven't seen the puzzle, feel free to unravel it!

## 🛠️ Tech Stack

### Core
- **Framework:** [Next.js 15](https://nextjs.org) with App Router
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)

### Backend & Database
- **Database:** [Supabase](https://supabase.com) (PostgreSQL)
- **Real-time:** Supabase Realtime for multiplayer
- **Auth:** Supabase Authentication

### UI Components
- **Icons:** [Lucide React](https://lucide.dev)
- **Components:** [Radix UI](https://www.radix-ui.com/)
- **Theme:** [next-themes](https://github.com/pacocoursey/next-themes)

### Deployment
- **Hosting:** [Vercel](https://vercel.com)
- **CDN:** Vercel Edge Network

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm/yarn/pnpm/bun
- Supabase account (for multiplayer features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/riannelimje/the-devils-plan.git
   cd the-devils-plan
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
the-devils-plan/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── about/          # Mysterious about page with puzzle
│   │   ├── games/          # Game implementations
│   │   │   ├── knightsTour/
│   │   │   ├── removeOne/
│   │   │   ├── timeAuction/
│   │   │   ├── timeAuction2/
│   │   │   └── wallBaduk/
│   │   └── page.tsx        # Homepage
│   ├── components/         # Reusable React components
│   │   ├── ui/            # UI component library
│   │   └── gameCard.tsx   # Game display cards
│   ├── hooks/             # Custom React hooks
│   └── lib/               # Utilities and helpers
├── public/                # Static assets
└── package.json
```

## 🤝 Contributing

Contributions are welcome! Feel free to:

- 🐛 Report bugs
- 💡 Suggest new features
- 🎮 Add new games
- 🎨 Improve UI/UX
- 📝 Enhance documentation

### How to Contribute

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is for educational and entertainment purposes. All rights to "The Devil's Plan" concept belong to their respective owners.

## 🎯 Roadmap

- [ ] Add more games from the show
- [ ] Improve multiplayer stability
- [ ] Add user accounts and leaderboards
- [ ] Mobile app version
- [ ] Game replay system
- [ ] Tournament mode

## 📧 Contact

Found a bug or have suggestions? [Open an issue](https://github.com/riannelimje/the-devils-plan/issues)

---

<div align="center">

*hope everyone has a fun time playing* 

</div>
