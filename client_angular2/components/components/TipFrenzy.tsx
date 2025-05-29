"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Gift, Star, Coins, Shuffle, Target, TrendingUp, Heart, Sparkles } from "lucide-react"

interface TipOption {
  amount: number
  xp: number
  color: string
}

interface Advertiser {
  id: string
  name: string
  image: string
  isOnline: boolean
  xp: number
}

const tipOptions: TipOption[] = [
  { amount: 5, xp: 10, color: "bg-green-500" },
  { amount: 10, xp: 25, color: "bg-blue-500" },
  { amount: 25, xp: 75, color: "bg-purple-500" },
  { amount: 50, xp: 175, color: "bg-orange-500" },
  { amount: 100, xp: 400, color: "bg-red-500" },
  { amount: 250, xp: 1200, color: "bg-pink-500" },
  { amount: 500, xp: 2500, color: "bg-gradient-to-r from-yellow-400 to-orange-500" },
]

const femaleImages = [
  "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=400&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=400&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=400&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=300&h=400&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=300&h=400&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=400&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&h=400&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&h=400&fit=crop&crop=face",
]

const names = [
  "Sofia",
  "Isabella",
  "Valentina",
  "Camila",
  "Aria",
  "Luna",
  "Zara",
  "Mia",
  "Elena",
  "Natalia",
  "Carmen",
  "Lucia",
  "Gabriela",
  "Adriana",
  "Paloma",
  "Catalina",
]

export function TipFrenzy() {
  const [userCoins, setUserCoins] = useState(1250)
  const [userXP, setUserXP] = useState(2840)
  const [selectedAdvertisers, setSelectedAdvertisers] = useState<Advertiser[]>([])
  const [randomAdvertisers, setRandomAdvertisers] = useState<Advertiser[]>([])
  const [frenzyMode, setFrenzyMode] = useState<"selected" | "random">("selected")
  const [isAnimating, setIsAnimating] = useState(false)
  const [recentTips, setRecentTips] = useState<Array<{ id: string; amount: number; name: string }>>([])

  const generateRandomAdvertisers = () => {
    return Array.from({ length: 6 }, (_, i) => ({
      id: `random-${i}`,
      name: names[Math.floor(Math.random() * names.length)],
      image: femaleImages[i % femaleImages.length],
      isOnline: Math.random() > 0.4,
      xp: Math.floor(Math.random() * 1000) + 100,
    }))
  }

  useEffect(() => {
    setRandomAdvertisers(generateRandomAdvertisers())
    // Generate some selected advertisers for demo
    setSelectedAdvertisers(generateRandomAdvertisers().slice(0, 3))
  }, [])

  const handleTip = (amount: number, xpGain: number) => {
    if (userCoins < amount) return

    setIsAnimating(true)
    setUserCoins((prev) => prev - amount)
    setUserXP((prev) => prev + xpGain)

    const targetAdvertisers = frenzyMode === "selected" ? selectedAdvertisers : randomAdvertisers
    const randomAdvertiser = targetAdvertisers[Math.floor(Math.random() * targetAdvertisers.length)]

    if (randomAdvertiser) {
      setRecentTips((prev) => [{ id: randomAdvertiser.id, amount, name: randomAdvertiser.name }, ...prev.slice(0, 4)])
    }

    setTimeout(() => setIsAnimating(false), 1000)

    // Simulate receiving content back
    if (amount >= 25) {
      setTimeout(() => {
        // Show notification about receiving content
        console.log(`${randomAdvertiser?.name} sent you exclusive content!`)
      }, 2000)
    }
  }

  const shuffleRandomAdvertisers = () => {
    setRandomAdvertisers(generateRandomAdvertisers())
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-black via-gray-900 to-transparent p-4 z-50">
      <Card className="bg-black/90 border-pink-500/30 backdrop-blur-lg">
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-pink-500" />
                Tip Frenzy
              </h3>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1 text-yellow-400">
                  <Coins className="h-4 w-4" />
                  <span className="font-bold">{userCoins}</span>
                </div>
                <div className="flex items-center gap-1 text-blue-400">
                  <Star className="h-4 w-4" />
                  <span className="font-bold">{userXP} XP</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant={frenzyMode === "selected" ? "default" : "outline"}
                size="sm"
                onClick={() => setFrenzyMode("selected")}
                className="text-xs"
              >
                <Target className="h-3 w-3 mr-1" />
                Selected
              </Button>
              <Button
                variant={frenzyMode === "random" ? "default" : "outline"}
                size="sm"
                onClick={() => setFrenzyMode("random")}
                className="text-xs"
              >
                <Shuffle className="h-3 w-3 mr-1" />
                Random
              </Button>
            </div>
          </div>

          {/* Advertisers Preview */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex -space-x-2">
              {(frenzyMode === "selected" ? selectedAdvertisers : randomAdvertisers).slice(0, 6).map((advertiser) => (
                <div key={advertiser.id} className="relative">
                  <img
                    src={advertiser.image || "/placeholder.svg"}
                    alt={advertiser.name}
                    className="w-10 h-10 rounded-full border-2 border-pink-500 object-cover"
                  />
                  {advertiser.isOnline && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-black"></div>
                  )}
                </div>
              ))}
            </div>

            {frenzyMode === "random" && (
              <Button size="sm" variant="outline" onClick={shuffleRandomAdvertisers} className="text-xs">
                <Shuffle className="h-3 w-3 mr-1" />
                Shuffle
              </Button>
            )}
          </div>

          {/* Tip Options */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {tipOptions.map((option) => (
              <Button
                key={option.amount}
                onClick={() => handleTip(option.amount, option.xp)}
                disabled={userCoins < option.amount || isAnimating}
                className={`${option.color} hover:scale-105 transition-all duration-200 text-white border-0 flex flex-col py-3 h-auto ${
                  isAnimating ? "animate-pulse" : ""
                }`}
              >
                <Gift className="h-4 w-4 mb-1" />
                <span className="text-xs font-bold">${option.amount}</span>
                <span className="text-xs opacity-80">+{option.xp} XP</span>
              </Button>
            ))}
          </div>

          {/* Recent Tips */}
          {recentTips.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs text-gray-400 mb-2">Recent Tips:</p>
              <div className="flex gap-2 overflow-x-auto">
                {recentTips.map((tip, index) => (
                  <Badge
                    key={`${tip.id}-${index}`}
                    variant="outline"
                    className="text-xs whitespace-nowrap bg-green-500/20 text-green-400 border-green-500/30"
                  >
                    <TrendingUp className="h-3 w-3 mr-1" />${tip.amount} → {tip.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Frenzy Stats */}
          <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-700">
            <div className="text-xs text-gray-400">
              Tip {frenzyMode === "selected" ? "selected" : "random"} advertisers • Earn XP • Get exclusive content
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Heart className="h-3 w-3 text-pink-500" />
              <span className="text-pink-400">Tips sent today: {Math.floor(userXP / 50)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
