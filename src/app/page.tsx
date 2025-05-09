import Link from "next/link"
import { ArrowRight, Crown } from 'lucide-react'
import { Button } from "@/components/ui/button"
import Header from "@/components/header"
import GameCard from "@/components/gameCard"


export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-12">
        {/* Hero Section */}
        <section className="mb-16 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Outlast the <span className="text-red-500">Devil's</span> Game
            </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-8">
            Challenge yourself with the same mental games featured in Netflix's 
            <br />
            <span className="font-bold text-purple-500 text-2xl md:text-3xl relative">
              The Devil's Plan 2
              <span className="absolute inset-0 blur-md opacity-50 bg-purple-500 -z-10 rounded-lg"></span>
            </span>        
            </p>
          <div className="flex justify-center gap-4">
            <Link href="/games"> 
            <Button className="bg-red-600 hover:bg-red-700">
              Play Now <ArrowRight className="ml-2 h-4 w-4" />
              {/* // i can lead this to the first game ig  */}
            </Button>
            </Link>
            <Button 
              variant="outline" 
              className="border-red-500 text-red-500 hover:bg-[#7102BF] hover:border-none"
            >
              Learn More
            </Button>
          </div>
        </section>
        {/* Games Section */}
        <section className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">
            Featured Games
          </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <GameCard
              title={<span className="text-red-500">The Knight's Tour</span>}
              description="A classic chess puzzle where you must move a knight to every square on the board without repeating."
              players="1"
              image="/images/game1.jpg" // remind me to find a better image
              href="/games/game1"
            />
            {/* <GameCard
              title={<span className="text-red-500">Game 2</span>}
              description="Description of Game 2"
              players="4"
              image="/images/game2.jpg"
              href="/games/game2"
            />
            <GameCard
              title={<span className="text-red-500">Game 3</span>}
              description="Description of Game 3"
              players="4"
              image="/images/game3.jpg"
              href="/games/game3"
            /> */}
            </div>
        </section>

      </main>

    </div>
  )
}