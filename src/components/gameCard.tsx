import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Users, Wifi, User, UsersRound, Lock, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ReactNode } from "react"
import { GameMode } from "@/data/games"

interface GameCardProps {
  title: ReactNode
  description: string
  players: string
  image?: string
  customVisual?: ReactNode
  href: string
  gameMode: GameMode
  seasonBadge?: string
  comingSoon?: boolean
}

export default function GameCard({
  title,
  description,
  players,
  image,
  customVisual,
  href,
  gameMode,
  seasonBadge,
  comingSoon = false,
}: GameCardProps) {
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
    <Card
      className={`border-gray-800 overflow-hidden transition-all duration-300 bg-white dark:bg-black text-black dark:text-white flex flex-col ${
        comingSoon
          ? "opacity-75 border-dashed border-red-900/50"
          : "hover:border-red-900"
      }`}
    >
      <div className="relative h-48 w-full overflow-hidden">
        {customVisual ? (
          customVisual
        ) : image ? (
          <Image
            src={image}
            alt={typeof title === "string" ? title : "Game image"}
            fill
            className="object-contain"
          />
        ) : null}
      </div>
      <CardHeader>
        <div className="flex items-start justify-between gap-2 mb-2 flex-wrap">
          {comingSoon ? (
            <Badge variant="outline" className="bg-red-950/40 text-red-400 border-red-800/60 border flex items-center gap-1 font-mono">
              <Lock className="h-3 w-3" />
              <span className="text-xs">Classified</span>
            </Badge>
          ) : (
            <Badge variant="outline" className={`${modeInfo.color} border flex items-center gap-1`}>
              {modeInfo.icon}
              <span className="text-xs">{modeInfo.label}</span>
            </Badge>
          )}
          {seasonBadge && !comingSoon && (
            <Badge variant="outline" className="bg-amber-500/15 text-amber-400 border-amber-500/40 border flex items-center gap-1 font-mono">
              <Sparkles className="h-3 w-3" />
              <span className="text-xs">{seasonBadge}</span>
            </Badge>
          )}
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription className="text-gray-400">{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="flex items-center text-sm text-gray-400">
          <Users className="h-4 w-4 mr-1" />
          <span>
            {players === "TBA"
              ? "Players: TBA"
              : `${players} Player${players === "1" ? "" : "s"}`}
          </span>
        </div>
      </CardContent>
      <CardFooter className="mt-auto">
        {comingSoon ? (
          <Button disabled variant="outline" className="w-full border-red-900/40 text-gray-500 font-mono cursor-not-allowed">
            <Lock className="mr-2 h-4 w-4" />
            Decrypting...
          </Button>
        ) : (
          <Link href={href} className="w-full">
            <Button className="w-full bg-red-600 hover:bg-red-700">
              Play Now <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  )
}
