'use client'

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button"
import Header from "@/components/header"
import GameCard from "@/components/gameCard"

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
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
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
        <section className="mb-16 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
            <TypewriterText />
            </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-8">
            Challenge yourself with the same mental games featured in Netflix&apos;s 
            <br />
            <span className="font-bold text-purple-500 text-2xl md:text-3xl relative">
              The Devil&apos;s Plan 2
            </span>        
            </p>
          <div className="flex justify-center gap-4">
            <Link href="/games/knightsTour"> 
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
        {/* Games Section */}
        <section className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">
            Featured Games
          </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <GameCard
              title={<span className="text-red-500">The Knight&apos;s Tour</span>}
              description="A classic chess puzzle where you must move a knight to every square on the board without repeating."
              players="1"
              image="/images/game1.png" // remind me to find a better image
              href="/games/knightsTour"
              gameMode="single"
            />
            <GameCard
              title={<span className="text-red-500">Remove One</span>}
              description="The player with the lowest unique number wins the round."
              players="2-8"
              image="/images/game2.png"
              href="/games/removeOne"
              gameMode="online"
            />
            <GameCard
              title={<span className="text-red-500">Time Auction</span>}
              description="Bid from a limited time bank and become the last standing player to win! - this game is still in development"
              players="2+"
              image="/images/game3.png"
              href="/games/timeAuction2"
              gameMode="online"
            />
             <GameCard
              title={<span className="text-red-500">Wall Baduk</span>}
              description="Wall Baduk aka Wall Go. Claim the largest territory."
              players="2"
              image="/images/game4.png"
              href="/games/wallBaduk"
              gameMode="local"
            />
            </div>
        </section>

      </main>

    </div>
  )
}