"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, MessageCircle, Video, DollarSign, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FavoriteButton } from "@/components/favorites/favorite-button"
import { cn } from "@/lib/utils"

interface PremiumAd {
  id: number | string
  name: string
  age: number
  location: string
  description: string
  tags: string[]
  image: string
  rating: number
  isVip: boolean
  isOnline: boolean
  isPremium: boolean
}

interface PremiumAdsSectionProps {
  premiumAds?: PremiumAd[]
}

export default function PremiumAdsSection({ premiumAds = [] }: PremiumAdsSectionProps) {
  const [hoveredCard, setHoveredCard] = useState<number | string | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // If no premium ads are provided, return nothing
  if (premiumAds.length === 0) {
    return null
  }

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: "smooth" })
    }
  }

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: "smooth" })
    }
  }

  return (
    <div className="mb-8 relative">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Premium Advertisers</h2>
        <Link href="/premium" className="text-pink-500 hover:text-pink-400 text-sm">
          View all premium advertisers
        </Link>
      </div>

      <div className="relative">
        {/* Left scroll button */}
        <button
          onClick={scrollLeft}
          className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 bg-gray-900/80 hover:bg-gray-800 p-2 rounded-full z-10 shadow-lg"
        >
          <ChevronLeft className="h-6 w-6 text-white" />
        </button>

        {/* Scrollable container */}
        <div ref={scrollContainerRef} className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory no-scrollbar">
          {premiumAds.map((ad) => (
            <div key={ad.id} className="min-w-[280px] snap-start">
              <Link href={`/advertiser/${ad.id}`}>
                <Card
                  className="overflow-hidden bg-gray-900 border-gray-800 transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/20 relative"
                  onMouseEnter={() => setHoveredCard(ad.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <img
                      src={ad.image || `/placeholder.svg?height=400&width=300&text=${ad.name}`}
                      alt={ad.name}
                      className="object-cover w-full h-full transition-transform duration-500 ease-in-out hover:scale-105"
                    />
                    <div className="absolute top-2 right-2 flex flex-col gap-2">
                      <FavoriteButton advertiserId={ad.id.toString()} />
                    </div>
                    <div className="absolute top-2 left-2">
                      <Badge variant="secondary" className="bg-pink-600 text-white border-none">
                        Premium
                      </Badge>
                    </div>
                    {ad.isOnline && (
                      <div className="absolute bottom-2 left-2">
                        <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500">
                          Online Now
                        </Badge>
                      </div>
                    )}
                    {ad.isVip && (
                      <div className="absolute bottom-2 right-2">
                        <Badge variant="outline" className="bg-amber-500/20 text-amber-400 border-amber-500">
                          VIP Content
                        </Badge>
                      </div>
                    )}

                    {/* Overlay that appears on hover */}
                    <div
                      className={cn(
                        "absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-4 flex flex-col justify-end transition-opacity duration-300",
                        hoveredCard === ad.id ? "opacity-100" : "opacity-0",
                      )}
                    >
                      <div className="flex gap-2 mb-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="flex-1 bg-pink-600 hover:bg-pink-700 text-white"
                        >
                          <MessageCircle className="mr-1 h-4 w-4" /> Chat
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <Video className="mr-1 h-4 w-4" /> Call
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        >
                          <DollarSign className="mr-1 h-4 w-4" /> Tip
                        </Button>
                      </div>
                      <div className="text-xs text-gray-300">
                        {ad.tags.map((tag) => (
                          <span key={tag} className="mr-2">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="text-lg font-semibold">
                        {ad.name}, {ad.age}
                      </h3>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-500 mr-1" />
                        <span className="text-sm">{ad.rating}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-400 mb-2">{ad.location}</p>
                    <p className="text-sm line-clamp-2">{ad.description}</p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          ))}
        </div>

        {/* Right scroll button */}
        <button
          onClick={scrollRight}
          className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 bg-gray-900/80 hover:bg-gray-800 p-2 rounded-full z-10 shadow-lg"
        >
          <ChevronRight className="h-6 w-6 text-white" />
        </button>
      </div>
    </div>
  )
}
