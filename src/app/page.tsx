'use client'

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import Header from "@/components/header"
import GameCard from "@/components/gameCard"
import { GAMES, SEASONS, SeasonNumber } from "@/data/games"
import {
  SeasonTabs,
  MagicSquareCardVisual,
} from "@/components/SeasonTabs"

// Falling symbol component
function FallingSymbol({ delay }: { delay: number }) {
  const symbols = ['♔', '♕', '♖', '♗', '♘', '♙', '01', '10', '∞', '⚡', '◆', '●']
  const [symbol] = useState(symbols[Math.floor(Math.random() * symbols.length)])
  const [left] = useState(Math.random() * 100)
  const [duration] = useState(10 + Math.random() * 10)
  
  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: '100vh', opacity: [0, 1, 1, 0] }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'linear'
      }}
      className="absolute text-red-500/20 font-mono text-xl"
      style={{ left: `${left}%` }}
    >
      {symbol}
    </motion.div>
  )
}

// Glitch text component
function GlitchText({ children }: { children: React.ReactNode }) {
  const [isGlitching, setIsGlitching] = useState(false)
  const [hasGlitched, setHasGlitched] = useState(false)
  
  useEffect(() => {
    const glitchInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        setIsGlitching(true)
        setHasGlitched(true)
        setTimeout(() => setIsGlitching(false), 200)
      }
    }, 3000)
    
    return () => clearInterval(glitchInterval)
  }, [])
  
  return (
    <span className={`relative inline-block ${isGlitching ? 'animate-glitch' : ''} ${hasGlitched ? 'text-red-500' : ''}`}>
      {children}
      {isGlitching && (
        <>
          <span className="absolute top-0 left-0 text-red-500 opacity-80" style={{ transform: 'translate(-2px, -2px)' }}>
            {children}
          </span>
          <span className="absolute top-0 left-0 text-blue-500 opacity-80" style={{ transform: 'translate(2px, 2px)' }}>
            {children}
          </span>
        </>
      )}
    </span>
  )
}

// Typewriter text component with styled segments
function TypewriterText() {
  const fullText = "Outlast the Devil's Game"
  const [displayText, setDisplayText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  
  useEffect(() => {
    if (currentIndex < fullText.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + fullText[currentIndex])
        setCurrentIndex(prev => prev + 1)
      }, 100)
      return () => clearTimeout(timeout)
    } else if (currentIndex === fullText.length && !isComplete) {
      setIsComplete(true)
    }
  }, [currentIndex, fullText.length, isComplete])
  
  if (!isComplete) {
    return <span>{displayText}<span className="animate-pulse">|</span></span>
  }
  
  // Once typing is complete, render with styled segments
  return (
    <span>
      Outlast the <GlitchText>Devil&apos;s</GlitchText> Game
    </span>
  )
}

export default function Home() {
  const [rippleEffect, setRippleEffect] = useState<{ x: number; y: number; id: number } | null>(null)
  const [mounted, setMounted] = useState(false)
  const [activeSeason, setActiveSeason] = useState<SeasonNumber>(2)

  useEffect(() => {
    setMounted(true)
    const params = new URLSearchParams(window.location.search)
    const seasonParam = params.get('season')
    if (seasonParam === '2') {
      setActiveSeason(2)
    } else if (seasonParam === '3') {
      setActiveSeason(3)
    }
  }, [])

  const handleSelectSeason = (season: SeasonNumber) => {
    setActiveSeason(season)
    const url = new URL(window.location.href)
    url.searchParams.set('season', String(season))
    window.history.replaceState({}, '', url.toString())
  }

  const gameCounts = useMemo<Record<SeasonNumber, number>>(
    () => ({
      2: GAMES.filter((g) => g.season === 2 && !g.comingSoon).length,
      3: GAMES.filter((g) => g.season === 3 && !g.comingSoon).length,
    }),
    []
  )

  const filteredGames = useMemo(
    () => GAMES.filter((g) => g.season === activeSeason),
    [activeSeason]
  )

  const activeSeasonMeta = SEASONS.find((s) => s.season === activeSeason) ?? SEASONS[0]

  const getCustomVisual = (gameId: string) => {
    if (gameId === 'magic-square') return <MagicSquareCardVisual />
    return undefined
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-black text-black dark:text-white relative overflow-hidden">
      {/* Falling symbols background */}
      {mounted && (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          {Array.from({ length: 30 }).map((_, i) => (
            <FallingSymbol key={i} delay={i * 0.5} />
          ))}
        </div>
      )}
      
      <Header />

      <main className="flex-1 container mx-auto px-4 py-12 relative z-10">
        {/* Hero Section */}
        <section className="mb-14 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
            <TypewriterText />
            </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-8">
            Challenge yourself with the same mental games featured in Netflix&apos;s 
            <br />
            <span className="font-bold text-purple-500 text-2xl md:text-3xl relative">
              The Devil&apos;s Plan {activeSeason}
            </span>        
            </p>
          <div className="flex justify-center gap-4">
            <Link href={activeSeasonMeta.featuredHref}> 
              <motion.div
                className="relative"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onHoverStart={() => {
                  // Particle burst effect
                }}
              >
                <motion.div
                  animate={{
                    boxShadow: [
                      '0 0 20px rgba(220, 38, 38, 0.5)',
                      '0 0 40px rgba(220, 38, 38, 0.8)',
                      '0 0 20px rgba(220, 38, 38, 0.5)',
                    ]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                  className="rounded-md"
                >
                  <Button 
                    className="bg-red-600 hover:bg-red-700 relative overflow-hidden"
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect()
                      const x = e.clientX - rect.left
                      const y = e.clientY - rect.top
                      setRippleEffect({ x, y, id: Date.now() })
                      setTimeout(() => setRippleEffect(null), 600)
                    }}
                  >
                    {rippleEffect && (
                      <span
                        className="absolute bg-white/30 rounded-full animate-ripple"
                        style={{
                          left: rippleEffect.x,
                          top: rippleEffect.y,
                          width: 0,
                          height: 0,
                        }}
                      />
                    )}
                    Play Now <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </motion.div>
              </motion.div>
            </Link>
            <Link href="https://www.netflix.com/sg/title/81653386" target="_blank" rel="noopener noreferrer">
              <motion.div
                className="relative group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  className="absolute -inset-1 bg-gradient-to-r from-red-600 to-purple-600 rounded-lg opacity-0 group-hover:opacity-75 blur transition-all duration-300"
                />
                <motion.div
                  className="relative"
                  animate={{
                    borderColor: ['#ef4444', '#7c3aed', '#ef4444']
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'linear'
                  }}
                >
                  <Button 
                    variant="outline" 
                    className="border-red-500 text-red-500 hover:bg-red-950/50 relative z-10 backdrop-blur-sm"
                  >
                    Learn More
                  </Button>
                </motion.div>
              </motion.div>
            </Link>
          </div>
        </section>

        {/* Games Section with Season Switcher */}
        <section id="games" className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">
            Featured Games
          </h2>

          <SeasonTabs
            activeSeason={activeSeason}
            onSelectSeason={handleSelectSeason}
            gameCounts={gameCounts}
          />

          <AnimatePresence mode="wait">
            <motion.div
              key={activeSeason}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredGames.map((game) => (
                <GameCard
                  key={game.id}
                  title={
                    <span className={game.comingSoon ? 'text-gray-400' : 'text-red-500'}>
                      {game.title}
                    </span>
                  }
                  description={game.description}
                  players={game.players}
                  image={game.image}
                  customVisual={getCustomVisual(game.id)}
                  href={game.href}
                  gameMode={game.gameMode}
                  seasonBadge={game.seasonBadge}
                  comingSoon={game.comingSoon}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        </section>

      </main>

    </div>
  )
}
