"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import EnhancedNavbar from "@/components/enhanced-navbar"
import { Play, Heart, Star, Eye, Clock, DollarSign, Crown } from "lucide-react"

const categories = [
  "Trending Now",
  "New Arrivals",
  "Top Rated",
  "VIP Exclusive",
  "Live Shows",
  "Interactive",
  "Premium Content",
  "Most Popular",
]

const advertisers = [
  {
    id: 1,
    name: "Sophia",
    age: 24,
    location: "Miami, FL",
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=300&fit=crop&crop=face",
    category: "Trending Now",
    rating: 4.9,
    views: 12500,
    duration: "45 min",
    price: 25,
    isVip: true,
    isLive: true,
  },
  {
    id: 2,
    name: "Isabella",
    age: 26,
    location: "Los Angeles, CA",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=300&fit=crop&crop=face",
    category: "New Arrivals",
    rating: 4.8,
    views: 8900,
    duration: "32 min",
    price: 20,
    isVip: false,
    isLive: false,
  },
  {
    id: 3,
    name: "Emma",
    age: 23,
    location: "New York, NY",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=300&fit=crop&crop=face",
    category: "Top Rated",
    rating: 4.9,
    views: 15200,
    duration: "38 min",
    price: 30,
    isVip: true,
    isLive: true,
  },
  {
    id: 4,
    name: "Olivia",
    age: 25,
    location: "Las Vegas, NV",
    image: "https://images.unsplash.com/photo-1488716820095-cbe80883c496?w=400&h=300&fit=crop&crop=face",
    category: "VIP Exclusive",
    rating: 4.7,
    views: 6800,
    duration: "28 min",
    price: 35,
    isVip: true,
    isLive: false,
  },
]

export default function NetflixViewPage() {
  const [selectedCategory, setSelectedCategory] = useState("Trending Now")
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)

  const filteredAdvertisers = advertisers.filter((advertiser) => advertiser.category === selectedCategory)

  return (
    <div className="min-h-screen bg-black">
      <EnhancedNavbar />

      {/* Hero Section */}
      <div className="relative h-[70vh] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=1920&h=1080&fit=crop&crop=face"
          alt="Featured"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent" />
        <div className="absolute bottom-0 left-0 p-12 max-w-2xl">
          <h1 className="text-6xl font-bold text-white mb-4">Sophia</h1>
          <p className="text-xl text-gray-300 mb-6">
            Experience premium entertainment with Miami's most sought-after performer. Exclusive content and live
            interactions available.
          </p>
          <div className="flex items-center gap-4 mb-6">
            <Badge className="bg-red-600 text-white">
              <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
              LIVE NOW
            </Badge>
            <div className="flex items-center gap-1">
              <Star className="w-5 h-5 text-yellow-400 fill-current" />
              <span className="text-white font-bold">4.9</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="w-5 h-5 text-gray-400" />
              <span className="text-gray-300">12.5K views</span>
            </div>
          </div>
          <div className="flex gap-4">
            <Button className="bg-white text-black hover:bg-gray-200 text-lg px-8 py-3">
              <Play className="w-5 h-5 mr-2 fill-current" />
              Watch Now
            </Button>
            <Button variant="outline" className="border-gray-400 text-white hover:bg-white/10 text-lg px-8 py-3">
              <Heart className="w-5 h-5 mr-2" />
              Add to Favorites
            </Button>
          </div>
        </div>
      </div>

      {/* Category Navigation */}
      <div className="px-12 py-6">
        <div className="flex gap-4 overflow-x-auto scrollbar-hide">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "ghost"}
              className={`whitespace-nowrap ${
                selectedCategory === category
                  ? "bg-red-600 text-white"
                  : "text-gray-300 hover:text-white hover:bg-gray-800"
              }`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Content Rows */}
      <div className="px-12 space-y-12">
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">{selectedCategory}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredAdvertisers.map((advertiser) => (
              <Card
                key={advertiser.id}
                className="bg-gray-900 border-gray-700 overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:z-10"
                onMouseEnter={() => setHoveredCard(advertiser.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className="relative aspect-video">
                  <img
                    src={advertiser.image || "/placeholder.svg"}
                    alt={advertiser.name}
                    className="w-full h-full object-cover"
                  />

                  {/* Overlay on hover */}
                  {hoveredCard === advertiser.id && (
                    <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                      <Button className="bg-white text-black hover:bg-gray-200">
                        <Play className="w-5 h-5 mr-2 fill-current" />
                        Play
                      </Button>
                    </div>
                  )}

                  {/* Status badges */}
                  <div className="absolute top-2 left-2 flex gap-2">
                    {advertiser.isLive && (
                      <Badge className="bg-red-600 text-white text-xs">
                        <div className="w-1.5 h-1.5 bg-white rounded-full mr-1 animate-pulse"></div>
                        LIVE
                      </Badge>
                    )}
                    {advertiser.isVip && (
                      <Badge className="bg-yellow-600 text-white text-xs">
                        <Crown className="w-3 h-3 mr-1" />
                        VIP
                      </Badge>
                    )}
                  </div>

                  {/* Duration */}
                  <div className="absolute bottom-2 right-2">
                    <Badge className="bg-black/80 text-white text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      {advertiser.duration}
                    </Badge>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="text-white font-bold text-lg mb-1">{advertiser.name}</h3>
                  <p className="text-gray-400 text-sm mb-2">{advertiser.location}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-yellow-400 text-sm">{advertiser.rating}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-400 text-sm">{(advertiser.views / 1000).toFixed(1)}K</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4 text-green-400" />
                      <span className="text-green-400 font-bold text-sm">${advertiser.price}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Additional rows for other categories */}
        {categories
          .filter((cat) => cat !== selectedCategory)
          .slice(0, 3)
          .map((category) => (
            <div key={category}>
              <h2 className="text-2xl font-bold text-white mb-6">{category}</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {advertisers
                  .filter((advertiser) => advertiser.category === category)
                  .slice(0, 6)
                  .map((advertiser) => (
                    <Card
                      key={`${category}-${advertiser.id}`}
                      className="bg-gray-900 border-gray-700 overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105"
                    >
                      <div className="relative aspect-video">
                        <img
                          src={advertiser.image || "/placeholder.svg"}
                          alt={advertiser.name}
                          className="w-full h-full object-cover"
                        />
                        {advertiser.isLive && (
                          <Badge className="absolute top-2 left-2 bg-red-600 text-white text-xs">
                            <div className="w-1.5 h-1.5 bg-white rounded-full mr-1 animate-pulse"></div>
                            LIVE
                          </Badge>
                        )}
                      </div>
                      <div className="p-3">
                        <h3 className="text-white font-bold text-sm">{advertiser.name}</h3>
                        <div className="flex items-center justify-between mt-1">
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-400 fill-current" />
                            <span className="text-yellow-400 text-xs">{advertiser.rating}</span>
                          </div>
                          <span className="text-green-400 text-xs font-bold">${advertiser.price}</span>
                        </div>
                      </div>
                    </Card>
                  ))}
              </div>
            </div>
          ))}
      </div>

      <div className="h-20"></div>
    </div>
  )
}
