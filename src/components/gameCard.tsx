import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ReactNode } from "react"

interface GameCardProps {
  title: ReactNode
  description: string
  players: string
  image: string
  href: string
}

export default function GameCard({ title, description, players, image, href }: GameCardProps) {
  return (
    <Card className="bg-gray-900 border-gray-800 overflow-hidden hover:border-red-900 transition-all duration-300">
      <div className="relative h-48 w-full">
        <Image src={image || "/placeholder.svg"} alt={typeof title === "string" ? title : "Game image"} fill className="object-cover" />
      </div>
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription className="text-gray-400">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center text-sm text-gray-400">
          <Users className="h-4 w-4 mr-1" />
          <span>{players} Players</span>
        </div>
      </CardContent>
      <CardFooter>
        <Link href={href} className="w-full">
          <Button className="w-full bg-red-600 hover:bg-red-700">
            Play Now <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
