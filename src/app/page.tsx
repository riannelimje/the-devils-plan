import Link from "next/link"
import { ArrowRight, Crown } from 'lucide-react'
import { Button } from "@/components/ui/button"
import Header from "@/components/header"


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
            <br />The Devil's Plan 2
          </p>
          <div className="flex justify-center gap-4">
            <Button className="bg-red-600 hover:bg-red-700">
              Play Now <ArrowRight className="ml-2 h-4 w-4" />
              {/* // i can lead this to the game catalog ig  */}
            </Button>
            <Button variant="outline" className="border-red-500 text-red-500 hover:bg-[#7102BF]">
              Learn More
            </Button>
          </div>
        </section>

       
      </main>

    </div>
  )
}