import Header from '@/components/header'
import { Gamepad2} from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function About() {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-12">

        <section className="mb-16">
          <div className="bg-gradient-to-r from-red-950/50 to-purple-950/50 p-8 rounded-xl border border-red-900/30">
            <div className="text-center">
                <h2 className="text-3xl font-bold mb-4">About</h2>
                <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-6">
                    This is inspired by The Devil&apos;s Plan - pls don&apos;t sue me. 
                    <br />
                    As a developer and puzzle enthusiast, I wanted to recreate the intellectual games so that everyone can play them!
                </p> 
                <Link href="/">
                    <Button className="bg-red-600 hover:bg-red-700 text-lg px-8 py-3">
                        View Games here<Gamepad2 className="ml-2 h-5 w-5" />
                    </Button>
                </Link>       
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}