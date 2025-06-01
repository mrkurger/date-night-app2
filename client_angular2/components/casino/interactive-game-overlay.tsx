"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Dice1, Heart, Zap, Crown, Gift, Timer } from "lucide-react"

interface InteractiveGameProps {
  advertiser: {
    id: number
    name: string
    image: string
    currentGame: "keno" | "blackjack" | "raffle" | null
    gameMultiplier: number
  }
  isLive: boolean
  onGameAction: (action: string, amount: number) => void
}

export default function InteractiveGameOverlay({ advertiser, isLive, onGameAction }: InteractiveGameProps) {
  const [gameState, setGameState] = useState<any>({})
  const [timeLeft, setTimeLeft] = useState(30)
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    if (advertiser.currentGame && isLive) {
      setIsActive(true)
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsActive(false)
            return 30
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
    return undefined;
  }, [advertiser.currentGame, isLive])

  if (!advertiser.currentGame || !isLive) return null

  const renderKenoGame = () => (
    <Card className="bg-black/90 backdrop-blur-sm border-yellow-500/50 p-4">
      <div className="text-center mb-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Dice1 className="w-6 h-6 text-yellow-400" />
          <h3 className="text-yellow-400 font-bold text-lg">LIVE KENO with {advertiser.name}</h3>
        </div>
        <Badge className="bg-yellow-500 text-black">
          <Timer className="w-3 h-3 mr-1" />
          {timeLeft}s left to bet
        </Badge>
      </div>

      <div className="grid grid-cols-5 gap-1 mb-4">
        {Array.from({ length: 20 }, (_, i) => i + 1).map((num) => (
          <Button
            key={num}
            size="sm"
            className="aspect-square p-1 text-xs bg-gray-700 hover:bg-yellow-600"
            onClick={() => onGameAction("keno_pick", num)}
          >
            {num}
          </Button>
        ))}
      </div>

      <div className="flex gap-2">
        <Button
          className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-600"
          onClick={() => onGameAction("keno_bet", 25)}
        >
          <Zap className="w-4 h-4 mr-1" />
          Bet $25 ({advertiser.gameMultiplier}x)
        </Button>
      </div>
    </Card>
  )

  const renderBlackjackGame = () => (
    <Card className="bg-black/90 backdrop-blur-sm border-red-500/50 p-4">
      <div className="text-center mb-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Heart className="w-6 h-6 text-red-400 fill-current" />
          <h3 className="text-red-400 font-bold text-lg">BLACKJACK with {advertiser.name}</h3>
        </div>
        <div className="text-white text-sm">Dealer: {advertiser.name} • Your Hand: ?</div>
      </div>

      <div className="flex justify-center gap-2 mb-4">
        <div className="w-12 h-16 bg-gray-800 rounded border-2 border-gray-600 flex items-center justify-center">
          <Heart className="w-6 h-6 text-red-400 fill-current" />
        </div>
        <div className="w-12 h-16 bg-gray-800 rounded border-2 border-gray-600 flex items-center justify-center">
          <span className="text-white font-bold">?</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => onGameAction("blackjack_hit", 0)}>
          Hit
        </Button>
        <Button size="sm" className="bg-red-600 hover:bg-red-700" onClick={() => onGameAction("blackjack_stand", 0)}>
          Stand
        </Button>
        <Button
          size="sm"
          className="bg-yellow-600 hover:bg-yellow-700"
          onClick={() => onGameAction("blackjack_double", 50)}
        >
          Double
        </Button>
      </div>
    </Card>
  )

  const renderRaffleGame = () => (
    <Card className="bg-black/90 backdrop-blur-sm border-purple-500/50 p-4">
      <div className="text-center mb-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Gift className="w-6 h-6 text-purple-400" />
          <h3 className="text-purple-400 font-bold text-lg">LIVE RAFFLE with {advertiser.name}</h3>
        </div>
        <div className="text-white text-sm">Prize Pool: $1,250 • Entries: 47</div>
      </div>

      <div className="mb-4">
        <Progress value={(timeLeft / 30) * 100} className="h-2" />
        <div className="text-center text-gray-300 text-sm mt-1">Draw in {timeLeft} seconds</div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button
          className="bg-gradient-to-r from-purple-500 to-pink-600"
          onClick={() => onGameAction("raffle_enter", 10)}
        >
          <Gift className="w-4 h-4 mr-1" />
          Enter $10
        </Button>
        <Button className="bg-gradient-to-r from-pink-500 to-red-600" onClick={() => onGameAction("raffle_enter", 25)}>
          <Crown className="w-4 h-4 mr-1" />
          VIP $25
        </Button>
      </div>
    </Card>
  )

  return (
    <div className="absolute bottom-20 left-4 right-4 z-10">
      {advertiser.currentGame === "keno" && renderKenoGame()}
      {advertiser.currentGame === "blackjack" && renderBlackjackGame()}
      {advertiser.currentGame === "raffle" && renderRaffleGame()}
    </div>
  )
}
