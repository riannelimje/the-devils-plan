'use client'

import Header from '@/components/header'
import { Gamepad2, Github, Lock, Eye, Brain, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { motion, useAnimation, useMotionValue, useTransform } from 'framer-motion'
import { useEffect, useState } from 'react'

// Animated particle component
const FloatingParticle = ({ delay, duration, x, y, symbol }: any) => (
  <motion.div
    className="absolute text-red-600/20 font-mono text-sm pointer-events-none"
    initial={{ opacity: 0, x, y }}
    animate={{
      opacity: [0, 0.5, 0],
      x: [x, x + Math.random() * 100 - 50],
      y: [y, y - 200],
    }}
    transition={{
      duration,
      delay,
      repeat: Infinity,
      ease: "linear"
    }}
  >
    {symbol}
  </motion.div>
)

// Glitch text component
const GlitchText = ({ children, className = "" }: any) => {
  const [isGlitching, setIsGlitching] = useState(false)
  
  useEffect(() => {
    const interval = setInterval(() => {
      setIsGlitching(true)
      setTimeout(() => setIsGlitching(false), 100)
    }, 3000)
    return () => clearInterval(interval)
  }, [])
  
  return (
    <div className="relative inline-block">
      <span className={className}>{children}</span>
      {isGlitching && (
        <>
          <span className={`absolute top-0 left-0 ${className} text-red-500 opacity-70`} style={{ transform: 'translate(-2px, 0)' }}>
            {children}
          </span>
          <span className={`absolute top-0 left-0 ${className} text-blue-500 opacity-70`} style={{ transform: 'translate(2px, 0)' }}>
            {children}
          </span>
        </>
      )}
    </div>
  )
}

// Typing reveal effect
const TypewriterText = ({ text, delay = 0 }: any) => {
  const [displayedText, setDisplayedText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (currentIndex < text.length) {
        setDisplayedText(text.substring(0, currentIndex + 1))
        setCurrentIndex(currentIndex + 1)
      }
    }, 30)
    
    return () => clearTimeout(timeout)
  }, [currentIndex, text])
  
  return <span>{displayedText}<span className="animate-pulse">|</span></span>
}

export default function About() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isRevealed, setIsRevealed] = useState(false)
  const [clearanceLevel, setClearanceLevel] = useState(0)
  const [particles, setParticles] = useState<any[]>([])
  const [redactedRevealed, setRedactedRevealed] = useState(false)
  
  // Puzzle state
  const [lockClicks, setLockClicks] = useState(0)
  const [binaryRevealed, setBinaryRevealed] = useState(false)
  const [sourceCodeUnlocked, setSourceCodeUnlocked] = useState(false)
  const [typedKeys, setTypedKeys] = useState('')
  const [lockShake, setLockShake] = useState(false)
  
  const REQUIRED_CLICKS = 5
  const SECRET_CODE = 'THEGAME'
  
  useEffect(() => {
    const timer = setTimeout(() => setIsRevealed(true), 500)
    return () => clearTimeout(timer)
  }, [])
  
  // Check sessionStorage for unlocked state
  useEffect(() => {
    const unlocked = sessionStorage.getItem('sourceCodeUnlocked')
    if (unlocked === 'true') {
      setSourceCodeUnlocked(true)
      setLockClicks(REQUIRED_CLICKS)
      setBinaryRevealed(true)
    }
  }, [])
  
  useEffect(() => {
    const levelTimer = setInterval(() => {
      setClearanceLevel(prev => prev < 100 ? prev + 1 : 100)
    }, 20)
    return () => clearInterval(levelTimer)
  }, [])
  
  // Generate particles on client-side only
  useEffect(() => {
    const generatedParticles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      symbol: ['♟', '♞', '♝', '♜', '∞', '◆', '▲', '●', '■', '01'][Math.floor(Math.random() * 10)],
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      delay: Math.random() * 5,
      duration: 5 + Math.random() * 5
    }))
    setParticles(generatedParticles)
  }, [])
  
  // Console Easter eggs and puzzle hints
  useEffect(() => {
    const styles = {
      title: 'color: #dc2626; font-size: 24px; font-weight: bold; text-shadow: 2px 2px 4px rgba(220, 38, 38, 0.5);',
      warning: 'color: #ef4444; font-size: 14px; font-weight: bold; background: #1a0000; padding: 4px 8px;',
      info: 'color: #a78bfa; font-size: 12px; font-style: italic;',
      secret: 'color: #4ade80; font-size: 11px; font-family: monospace;',
      ascii: 'color: #dc2626; font-family: monospace; font-size: 10px; line-height: 1.2;',
      puzzle: 'color: #f59e0b; font-size: 13px; font-weight: bold;'
    }
    
    console.clear()
    
    // ASCII Art
    console.log('%c' + `
    ╔═══════════════════════════════════════╗
    ║   THE DEVIL'S PLAN - UNAUTHORIZED     ║
    ║         ACCESS DETECTED               ║
    ╚═══════════════════════════════════════╝
    `, styles.ascii)
    
    console.log('%c⚠️ CLASSIFIED SYSTEM ⚠️', styles.title)
    console.log('%c[WARNING] You have entered a restricted area.', styles.warning)
    console.log('%cClearance Level Required: DEVELOPER', styles.info)
    
    // Puzzle hints (Layer 1)
    setTimeout(() => {
      console.log('%c\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', styles.secret)
      console.log('%c🔐 SYSTEM BREACH DETECTED...', styles.warning)
      console.log('%cDecrypting files...', styles.info)
      console.log('%c💡 HINT: "The CLASSIFIED CONTENT holds secrets. Click to unlock."', styles.puzzle)
    }, 1000)
    
    setTimeout(() => {
      console.log('%c\n👁️  Someone is watching...', styles.warning)
      console.log('%c🧠 Intelligence Level: Superior', styles.info)
      console.log('%c⚡ Status: ACTIVE', styles.info)
    }, 2000)
    
    setTimeout(() => {
      console.log('%c\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', styles.secret)
      console.log('%c[SYSTEM]: The game never ends...', styles.secret)
      console.log('%c[HINT]: Try clicking the redacted text', styles.secret)
      console.log('%c[SECRET]: The locked button wants to be clicked...', styles.puzzle)
    }, 3000)
    
    // Random cryptic message
    const crypticMessages = [
      'The pieces are in motion...',
      '01010100 01001000 01000101 00100000 01000111 01000001 01001101 01000101',
      'Player count: ∞',
      'Next move: ???',
      'Winning probability: CALCULATING...',
      'Trust no one.',
      'Every choice matters.',
      'The devil is in the details.'
    ]
    
    setTimeout(() => {
      const randomMsg = crypticMessages[Math.floor(Math.random() * crypticMessages.length)]
      console.log(`%c🔮 ${randomMsg}`, 'color: #a855f7; font-size: 12px; font-style: italic;')
    }, 5000)
  }, [])
  
  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY })
  }
  
  // Handle lock click (Layer 2)
  const handleLockClick = () => {
    if (lockClicks >= REQUIRED_CLICKS) return
    
    const newCount = lockClicks + 1
    setLockClicks(newCount)
    setLockShake(true)
    setTimeout(() => setLockShake(false), 500)
    
    const styles = {
      progress: 'color: #f59e0b; font-size: 12px; font-weight: bold;',
      success: 'color: #22c55e; font-size: 14px; font-weight: bold;',
      binary: 'color: #dc2626; font-size: 16px; font-family: monospace; letter-spacing: 2px;'
    }
    
    console.log(`%c🔓 Lock Protocol: ${newCount}/${REQUIRED_CLICKS} clicks registered`, styles.progress)
    
    if (newCount === REQUIRED_CLICKS) {
      setBinaryRevealed(true)
      setTimeout(() => {
        console.log('%c\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #4ade80; font-family: monospace;')
        console.log('%c✅ LOCK BREACHED!', styles.success)
        console.log('%c📡 ENCRYPTED MESSAGE RECEIVED:', styles.progress)
        console.log('%c\n01010100 01001000 01000101 00100000 01000111 01000001 01001101 01000101\n', styles.binary)
        console.log('%c💡 HINT: Decode this binary message. Type the decoded text anywhere on the page. (note: no space!)', styles.progress)
        console.log('%c🔍 Binary translates to ASCII text...', 'color: #a78bfa; font-size: 11px; font-style: italic;')
      }, 300)
    }
  }
  
  // Note: Keypress listener removed - now handled by input field below
  
  return (
    <div className="flex flex-col min-h-screen bg-black text-white overflow-hidden relative" onMouseMove={handleMouseMove}>
      {/* Scanline overlay */}
      <div className="fixed inset-0 pointer-events-none z-10 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-500/5 to-transparent animate-scan" 
             style={{ animation: 'scan 8s linear infinite' }} />
      </div>
      
      {/* Animated particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {particles.map((p) => (
          <FloatingParticle key={p.id} {...p} />
        ))}
      </div>
      
      {/* Spotlight effect */}
      <div 
        className="fixed w-96 h-96 rounded-full pointer-events-none z-0 transition-all duration-300 ease-out"
        style={{
          background: 'radial-gradient(circle, rgba(220,38,38,0.1) 0%, transparent 70%)',
          left: mousePosition.x - 192,
          top: mousePosition.y - 192,
        }}
      />
      
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-12 relative z-20">
        {/* Clearance badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center justify-center gap-3 relative z-50"
        >
          <motion.button
            type="button"
            className="cursor-pointer p-2 rounded-lg hover:bg-red-950/30 transition-colors relative z-50"
            onClick={handleLockClick}
            animate={lockShake ? { 
              rotate: [0, -10, 10, -10, 10, 0],
              scale: [1, 1.2, 1.2, 1.2, 1.2, 1]
            } : {}}
            transition={{ duration: 0.5 }}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            title={`Click to unlock (${lockClicks}/${REQUIRED_CLICKS})`}
          >
            <Lock 
              className={`w-5 h-5 transition-colors pointer-events-none ${
                lockClicks >= REQUIRED_CLICKS 
                  ? 'text-green-500' 
                  : lockClicks > 0 
                    ? 'text-yellow-500' 
                    : 'text-red-500'
              }`} 
            />
          </motion.button>
          <span className="text-xs font-mono text-gray-500 tracking-wider">
            CLEARANCE LEVEL: {sourceCodeUnlocked ? 'DEVELOPER' : 'PUBLIC'}
          </span>
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <motion.div 
                key={i} 
                className={`w-2 h-2 rounded-full ${
                  sourceCodeUnlocked 
                    ? 'bg-green-500' 
                    : i < Math.floor((lockClicks / REQUIRED_CLICKS) * 5) 
                      ? 'bg-yellow-500' 
                      : i < 2 
                        ? 'bg-red-500' 
                        : 'bg-gray-700'
                }`}
                animate={sourceCodeUnlocked ? {
                  scale: [1, 1.3, 1],
                  opacity: [1, 0.5, 1]
                } : {}}
                transition={{ duration: 1, repeat: sourceCodeUnlocked ? Infinity : 0, delay: i * 0.1 }}
              />
            ))}
          </div>
        </motion.div>

        <section className="mb-16 max-w-4xl mx-auto">
          {/* Main card with animated border */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative group"
          >
            {/* Animated border glow */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 via-purple-600 to-red-600 rounded-xl opacity-30 group-hover:opacity-60 blur transition duration-1000 animate-pulse" />
            
            <div className="relative bg-gradient-to-br from-red-950/30 via-purple-950/30 to-black p-12 rounded-xl border border-red-900/50 backdrop-blur-sm">
              {/* Status indicator */}
              <motion.div 
                className="absolute top-6 right-6 flex items-center gap-2"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Eye className="w-4 h-4 text-red-500" />
                <span className="text-xs font-mono text-red-500">ACTIVE</span>
              </motion.div>
              
              <div className="text-center space-y-8">
                {/* Title with glitch effect */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <Brain className="w-8 h-8 text-red-500" />
                    <h2 className="text-5xl font-bold tracking-tight">
                      <GlitchText className="bg-gradient-to-r from-red-500 via-purple-400 to-red-500 bg-clip-text text-transparent">
                        CLASSIFIED: ABOUT
                      </GlitchText>
                    </h2>
                    <Brain className="w-8 h-8 text-red-500" />
                  </div>
                  <div className="h-0.5 w-32 mx-auto bg-gradient-to-r from-transparent via-red-500 to-transparent" />
                </motion.div>

                {/* Loading bar animation */}
                <motion.div 
                  className="max-w-md mx-auto"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <div className="flex justify-between text-xs font-mono text-gray-500 mb-2">
                    <span>DECRYPTING...</span>
                    <span>{clearanceLevel}%</span>
                  </div>
                  <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-red-600 to-purple-600"
                      initial={{ width: 0 }}
                      animate={{ width: `${clearanceLevel}%` }}
                      transition={{ duration: 2 }}
                    />
                  </div>
                </motion.div>

                {/* Puzzle progress indicator */}
                {lockClicks > 0 && lockClicks < REQUIRED_CLICKS && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center"
                  >
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-950/30 border border-yellow-900/50 rounded-lg">
                      <Lock className="w-3 h-3 text-yellow-500 animate-pulse" />
                      <span className="text-xs font-mono text-yellow-500">
                        Unlocking: {lockClicks}/{REQUIRED_CLICKS}
                      </span>
                    </div>
                  </motion.div>
                )}

                {/* Main content with reveal animation */}
                <motion.div
                  initial={{ opacity: 0, filter: "blur(10px)" }}
                  animate={{ opacity: isRevealed ? 1 : 0, filter: isRevealed ? "blur(0px)" : "blur(10px)" }}
                  transition={{ delay: 1, duration: 1 }}
                  className="space-y-6"
                >
                  <div className="font-mono text-sm text-gray-400 mb-4">
                    <span className="text-red-500">[DOCUMENT_ID: TDP-2025]</span>
                  </div>
                  
                  <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
                    This project is inspired by{' '}
                    <motion.span 
                      className="relative inline-block cursor-pointer group"
                      onClick={() => setRedactedRevealed(!redactedRevealed)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {!redactedRevealed ? (
                        <span className="text-red-400 font-semibold hover:text-red-300 transition-colors bg-red-950/50 px-2 py-1 rounded border border-red-900/50">
                          ████████████████
                        </span>
                      ) : (
                        <motion.span
                          initial={{ opacity: 0, filter: "blur(10px)" }}
                          animate={{ opacity: 1, filter: "blur(0px)" }}
                          className="text-purple-400 font-bold px-2"
                        >
                          The Devil&apos;s Plan
                        </motion.span>
                      )}
                    </motion.span>{' '}
                    <motion.span 
                      className="text-xs text-gray-500 italic"
                      animate={{ 
                        opacity: [0.3, 0.7, 0.3],
                        scale: [1, 1.02, 1]
                      }}
                      transition={{ 
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      (pls don&apos;t sue me)
                    </motion.span>
                  </p>
                  
                  <div className="relative p-6 bg-black/40 rounded-lg border border-red-900/30 max-w-2xl mx-auto">
                    <Sparkles className="absolute top-3 right-3 w-5 h-5 text-purple-400 animate-pulse" />
                    <p className="text-lg text-gray-300 leading-relaxed">
                      As a <span className="text-red-400">developer</span> and{' '}
                      <span className="text-purple-400">puzzle enthusiast</span>, I wanted to recreate 
                      the intellectual games so that <span className="text-red-400 font-semibold">everyone</span> can play them!
                    </p>
                  </div>
                </motion.div>

                {/* Interactive buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.5 }}
                  className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6"
                >
                  <Link href="/">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-lg px-8 py-6 shadow-lg shadow-red-900/50 border border-red-500/50">
                        <Gamepad2 className="mr-2 h-5 w-5" />
                        Enter the Arena
                      </Button>
                    </motion.div>
                  </Link>
                  
                  {/* Hidden GitHub button - revealed only after puzzle */}
                  {sourceCodeUnlocked && (
                    <Link href="https://github.com/riannelimje/the-devils-plan" target="_blank" rel="noopener noreferrer">
                      <motion.div 
                        whileHover={{ scale: 1.05 }} 
                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
                        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      >
                        <Button variant="outline" className="relative border-green-900/50 hover:bg-green-950/50 text-lg px-8 py-6 backdrop-blur-sm overflow-hidden group">
                          {/* Animated glow effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 via-emerald-500/20 to-green-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                          <Github className="mr-2 h-5 w-5 relative z-10" />
                          <span className="relative z-10">View Source Code</span>
                          {/* Glitch overlay */}
                          <motion.div
                            className="absolute inset-0 bg-green-500/10"
                            animate={{
                              opacity: [0, 0.5, 0],
                              x: [-5, 5, -5]
                            }}
                            transition={{
                              duration: 0.3,
                              repeat: 3,
                              repeatDelay: 2
                            }}
                          />
                        </Button>
                      </motion.div>
                    </Link>
                  )}
                  
                  {/* Locked state indicator - Click to unlock */}
                  {!sourceCodeUnlocked && (
                    <motion.button
                      type="button"
                      onClick={handleLockClick}
                      className="flex items-center gap-2 px-8 py-6 text-gray-600 border border-gray-800/50 rounded-md backdrop-blur-sm cursor-pointer hover:border-yellow-900/50 hover:text-yellow-600 transition-colors"
                      animate={lockShake ? {
                        rotate: [0, -2, 2, -2, 2, 0],
                        scale: [1, 1.05, 1.05, 1.05, 1.05, 1]
                      } : {
                        opacity: [0.3, 0.5, 0.3]
                      }}
                      transition={lockShake ? { duration: 0.5 } : { duration: 2, repeat: Infinity }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      title={`Click to unlock (${lockClicks}/${REQUIRED_CLICKS})`}
                    >
                      <Lock 
                        className={`w-4 h-4 transition-colors ${
                          lockClicks > 0 ? 'text-yellow-500' : ''
                        }`} 
                      />
                      <span className="text-sm font-mono">
                        {lockClicks > 0 ? `UNLOCKING... ${lockClicks}/${REQUIRED_CLICKS}` : 'CLASSIFIED CONTENT'}
                      </span>
                    </motion.button>
                  )}
                </motion.div>

                {/* Footer info */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2 }}
                  className="pt-8 space-y-2 border-t border-red-900/30"
                >
                  <p className="text-gray-500 text-sm font-mono flex items-center justify-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    OPEN SOURCE • CONTRIBUTIONS WELCOME
                  </p>
                  <p className="text-gray-500 text-sm">
                    Found a bug or have suggestions?{' '}
                    <Link href="https://github.com/riannelimje/the-devils-plan/issues" target="_blank" rel="noopener noreferrer">
                      <span className="text-red-400 hover:text-red-300 cursor-pointer transition-colors">Let me know</span>
                    </Link>
                  </p>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Secret message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            transition={{ delay: 3 }}
            className="text-center mt-8 text-xs font-mono text-gray-700 hover:text-red-500 transition-colors cursor-help"
            title="You found it!"
          >
            {"// THE GAME IS NEVER OVER"}
            <br/>
            {"// OPEN YOUR CONSOLE LOG TO UNLOCK THE SECRET"}
          </motion.div>

          {/* Password input field - shown after binary is revealed */}
          {binaryRevealed && !sourceCodeUnlocked && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mt-8 flex flex-col items-center gap-4"
            >
              <div className="text-center">
                <p className="text-sm font-mono text-green-500 mb-2">
                  {"// ENTER DECODED PASSWORD"}
                </p>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="TYPE HERE..."
                    className="bg-black/50 border-2 border-green-900/50 rounded-lg px-6 py-3 text-center font-mono text-green-400 placeholder-gray-600 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all uppercase tracking-widest"
                    value={typedKeys}
                    onChange={(e) => {
                      const value = e.target.value.toUpperCase()
                      setTypedKeys(value)
                      if (value === SECRET_CODE) {
                        setSourceCodeUnlocked(true)
                        sessionStorage.setItem('sourceCodeUnlocked', 'true')
                        
                        const styles = {
                          success: 'color: #22c55e; font-size: 18px; font-weight: bold; background: #052e16; padding: 8px 16px;',
                          glow: 'color: #86efac; font-size: 14px;'
                        }
                        
                        setTimeout(() => {
                          console.log('%c\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #22c55e; font-family: monospace;')
                          console.log('%c🎉 ACCESS GRANTED! 🎉', styles.success)
                          console.log('%c✨ SOURCE CODE UNLOCKED ✨', styles.glow)
                          console.log('%cWelcome, Developer. You have proven your worth.', 'color: #a78bfa; font-size: 12px;')
                          console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'color: #22c55e; font-family: monospace;')
                        }, 300)
                      }
                    }}
                    maxLength={SECRET_CODE.length}
                    autoComplete="off"
                    spellCheck={false}
                  />
                  <motion.div
                    className="absolute -inset-1 bg-green-500/20 rounded-lg blur-lg -z-10"
                    animate={{
                      opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                </div>
                <p className="text-xs font-mono text-gray-600 mt-2">
                  {SECRET_CODE.length - typedKeys.length} characters remaining
                </p>
              </div>
            </motion.div>
          )}
        </section>
      </main>

      <style jsx>{`
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
      `}</style>
    </div>
  )
}