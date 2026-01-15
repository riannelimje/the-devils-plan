import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Users, Wifi, User, UsersRound } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ReactNode } from "react"

type GameMode = "online" | "local" | "single"

interface GameCardProps {
  title: ReactNode
  description: string
  players: string
  image: string
  href: string
  gameMode: GameMode
}

export default function GameCard({ title, description, players, image, href, gameMode }: GameCardProps) {
  const getModeInfo = () => {
    switch (gameMode) {
      case "online":
        return {
          icon: <Wifi className="h-3 w-3" />,
          label: "Online Multiplayer",
          color: "bg-blue-600/20 text-blue-400 border-blue-500/50"
        }
      case "local":
        return {
          icon: <UsersRound className="h-3 w-3" />,
          label: "Local Multiplayer",
          color: "bg-green-600/20 text-green-400 border-green-500/50"
        }
      case "single":
        return {
          icon: <User className="h-3 w-3" />,
          label: "Single Player",
          color: "bg-purple-600/20 text-purple-400 border-purple-500/50"
        }
    }
  }

  const modeInfo = getModeInfo()

  return (
    <Card className="bg-gray-900 border-gray-800 overflow-hidden hover:border-red-900 transition-all duration-300 bg-white dark:bg-black text-black dark:text-white flex flex-col">
        <div className="relative h-48 w-full">
        <Image
            src={image}
            alt={typeof title === "string" ? title : "Game image"}
            fill
            className="object-contain"
        />
        </div>
      <CardHeader>
        <div className="flex items-start justify-between gap-2 mb-2">
          <Badge variant="outline" className={`${modeInfo.color} border flex items-center gap-1`}>
            {modeInfo.icon}
            <span className="text-xs">{modeInfo.label}</span>
          </Badge>
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription className="text-gray-400">{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="flex items-center text-sm text-gray-400">
          <Users className="h-4 w-4 mr-1" />
          <span>{players} Player{players === "1" ? "" : "s"}</span>
        </div>
      </CardContent>
      <CardFooter className="mt-auto">
        <Link href={href} className="w-full">
          <Button className="w-full bg-red-600 hover:bg-red-700">
            Play Now <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
