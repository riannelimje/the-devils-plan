import Link from "next/link"
import { ArrowRight} from 'lucide-react'
import { Button } from "@/components/ui/button"
import Header from "@/components/header"
import GameCard from "@/components/gameCard"


export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-black text-black dark:text-white">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-12">
        {/* Hero Section */}
        <section className="mb-16 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Outlast the <span className="text-red-500">Devil&apos;s</span> Game
            </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-8">
            Challenge yourself with the same mental games featured in Netflix&apos;s 
            <br />
            <span className="font-bold text-purple-500 text-2xl md:text-3xl relative">
              The Devil&apos;s Plan 2
              <span className="absolute inset-0 blur-md opacity-50 bg-purple-500 -z-10 rounded-lg"></span>
            </span>        
            </p>
          <div className="flex justify-center gap-4">
            <Link href="/games/knightsTour"> 
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
              title={<span className="text-red-500">The Knight&apos;s Tour</span>}
              description="A classic chess puzzle where you must move a knight to every square on the board without repeating."
              players="1"
              image="/images/game1.png" // remind me to find a better image
              href="/games/knightsTour"
            />
            <GameCard
              title={<span className="text-red-500">Remove One</span>}
              description="The player with the lowest unique number wins the round."
              players="2-8"
              image="/images/game2.png"
              href="/games/removeOne"
            />
            <GameCard
              title={<span className="text-red-500">Time Auction</span>}
              description="Bid from a limited time bank and become the last standing player to win! - this game is still in development"
              players="2+"
              image="/images/game3.png"
              href="/games/timeAuction"
            />
            </div>
        </section>

      </main>

    </div>
  )
}