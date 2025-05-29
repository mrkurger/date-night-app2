"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, MessageCircle, Star, ThumbsUp, ImageIcon, Video } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import ImageCarousel from "@/components/image-carousel"

// Sample data for rankings
const rankingsData = {
  rating: [
    {
      id: "1",
      name: "Sophia",
      age: 25,
      location: "Stockholm",
      distance: 3.2,
      rating: 4.9,
      reviewCount: 124,
      mediaRating: 4.7,
      popularity: 1542,
      tags: ["Massage", "Escort", "VIP"],
      isOnline: true,
      images: [
        "/placeholder.svg?height=400&width=300&text=Female+Model+1",
        "/placeholder.svg?height=400&width=300&text=Female+Model+2",
      ],
    },
    {
      id: "2",
      name: "Emma",
      age: 23,
      location: "Gothenburg",
      distance: 5.7,
      rating: 4.8,
      reviewCount: 98,
      mediaRating: 4.5,
      popularity: 1320,
      tags: ["Escort", "Massage", "Dinner Date"],
      isOnline: false,
      images: [
        "/placeholder.svg?height=400&width=300&text=Female+Model+3",
        "/placeholder.svg?height=400&width=300&text=Female+Model+4",
      ],
    },
    {
      id: "3",
      name: "Olivia",
      age: 27,
      location: "Malmö",
      distance: 2.1,
      rating: 4.7,
      reviewCount: 156,
      mediaRating: 4.8,
      popularity: 1876,
      tags: ["VIP", "Escort", "Travel Companion"],
      isOnline: true,
      images: [
        "/placeholder.svg?height=400&width=300&text=Female+Model+5",
        "/placeholder.svg?height=400&width=300&text=Female+Model+6",
      ],
    },
  ],
  reviews: [
    {
      id: "4",
      name: "Isabella",
      age: 24,
      location: "Uppsala",
      distance: 4.3,
      rating: 4.6,
      reviewCount: 187,
      mediaRating: 4.4,
      popularity: 1245,
      tags: ["Massage", "Escort", "Dinner Date"],
      isOnline: false,
      images: [
        "/placeholder.svg?height=400&width=300&text=Female+Model+7",
        "/placeholder.svg?height=400&width=300&text=Female+Model+8",
      ],
    },
    {
      id: "5",
      name: "Mia",
      age: 26,
      location: "Helsingborg",
      distance: 6.8,
      rating: 4.5,
      reviewCount: 165,
      mediaRating: 4.6,
      popularity: 1432,
      tags: ["Escort", "VIP", "Travel Companion"],
      isOnline: true,
      images: [
        "/placeholder.svg?height=400&width=300&text=Female+Model+9",
        "/placeholder.svg?height=400&width=300&text=Female+Model+10",
      ],
    },
    {
      id: "6",
      name: "Charlotte",
      age: 28,
      location: "Linköping",
      distance: 3.5,
      rating: 4.4,
      reviewCount: 142,
      mediaRating: 4.3,
      popularity: 1198,
      tags: ["Massage", "Escort", "Dinner Date"],
      isOnline: false,
      images: [
        "/placeholder.svg?height=400&width=300&text=Female+Model+1",
        "/placeholder.svg?height=400&width=300&text=Female+Model+3",
      ],
    },
  ],
  media: [
    {
      id: "7",
      name: "Amelia",
      age: 25,
      location: "Örebro",
      distance: 5.2,
      rating: 4.3,
      reviewCount: 112,
      mediaRating: 4.9,
      popularity: 1356,
      tags: ["VIP", "Escort", "Massage"],
      isOnline: true,
      images: [
        "/placeholder.svg?height=400&width=300&text=Female+Model+2",
        "/placeholder.svg?height=400&width=300&text=Female+Model+4",
      ],
    },
    {
      id: "8",
      name: "Harper",
      age: 24,
      location: "Västerås",
      distance: 4.7,
      rating: 4.2,
      reviewCount: 98,
      mediaRating: 4.8,
      popularity: 1245,
      tags: ["Escort", "Dinner Date", "Travel Companion"],
      isOnline: false,
      images: [
        "/placeholder.svg?height=400&width=300&text=Female+Model+5",
        "/placeholder.svg?height=400&width=300&text=Female+Model+7",
      ],
    },
    {
      id: "9",
      name: "Evelyn",
      age: 27,
      location: "Norrköping",
      distance: 3.8,
      rating: 4.1,
      reviewCount: 87,
      mediaRating: 4.7,
      popularity: 1132,
      tags: ["Massage", "Escort", "VIP"],
      isOnline: true,
      images: [
        "/placeholder.svg?height=400&width=300&text=Female+Model+6",
        "/placeholder.svg?height=400&width=300&text=Female+Model+8",
      ],
    },
  ],
  popularity: [
    {
      id: "10",
      name: "Abigail",
      age: 26,
      location: "Jönköping",
      distance: 7.2,
      rating: 4.0,
      reviewCount: 76,
      mediaRating: 4.2,
      popularity: 2145,
      tags: ["Escort", "Massage", "Dinner Date"],
      isOnline: false,
      images: [
        "/placeholder.svg?height=400&width=300&text=Female+Model+9",
        "/placeholder.svg?height=400&width=300&text=Female+Model+10",
      ],
    },
    {
      id: "11",
      name: "Elizabeth",
      age: 25,
      location: "Umeå",
      distance: 6.3,
      rating: 3.9,
      reviewCount: 65,
      mediaRating: 4.1,
      popularity: 1987,
      tags: ["VIP", "Escort", "Travel Companion"],
      isOnline: true,
      images: [
        "/placeholder.svg?height=400&width=300&text=Female+Model+1",
        "/placeholder.svg?height=400&width=300&text=Female+Model+5",
      ],
    },
    {
      id: "12",
      name: "Sofia",
      age: 27,
      location: "Lund",
      distance: 5.5,
      rating: 3.8,
      reviewCount: 54,
      mediaRating: 4.0,
      popularity: 1876,
      tags: ["Massage", "Escort", "Dinner Date"],
      isOnline: false,
      images: [
        "/placeholder.svg?height=400&width=300&text=Female+Model+3",
        "/placeholder.svg?height=400&width=300&text=Female+Model+7",
      ],
    },
  ],
}

// RankedAdvertiserCard component
function RankedAdvertiserCard({ advertiser, rank, isFavorite, onFavorite, rankingType }) {
  const getRankingInfo = () => {
    switch (rankingType) {
      case "rating":
        return (
          <div className="flex items-center">
            <Star className="h-4 w-4 mr-1 text-yellow-400" />
            <span>{advertiser.rating}/5</span>
          </div>
        )
      case "reviews":
        return (
          <div className="flex items-center">
            <ThumbsUp className="h-4 w-4 mr-1" />
            <span>{advertiser.reviewCount} reviews</span>
          </div>
        )
      case "media":
        return (
          <div className="flex items-center">
            <ImageIcon className="h-4 w-4 mr-1" />
            <Video className="h-4 w-4 mr-1" />
            <span>{advertiser.mediaRating}/5</span>
          </div>
        )
      case "popularity":
        return (
          <div className="flex items-center">
            <span>{advertiser.popularity} views</span>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-0">
        <div className="relative h-64">
          <div className="absolute top-0 left-0 z-10 w-10 h-10 flex items-center justify-center bg-primary text-primary-foreground font-bold rounded-br-lg">
            {rank}
          </div>
          <ImageCarousel
            images={advertiser.images || [`/placeholder.svg?height=400&width=300&text=${advertiser.name}`]}
            className="h-full"
            showDots={false}
          />
          <div className="absolute top-2 right-2 flex gap-1">
            <Badge variant="secondary" className="bg-black/70 text-white">
              {advertiser.rating} ★
            </Badge>
            {advertiser.isOnline && (
              <Badge variant="secondary" className="bg-green-500/90 text-white">
                Online
              </Badge>
            )}
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
            <h3 className="text-lg font-semibold text-white">{advertiser.name}</h3>
            <div className="flex justify-between">
              <p className="text-sm text-white/80">{advertiser.distance} km away</p>
              {getRankingInfo()}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <ScrollArea className="h-12">
          <div className="flex flex-wrap gap-1">
            {advertiser.tags &&
              advertiser.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="flex justify-between p-4 pt-0">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/advertiser/${advertiser.id}`}>View Profile</Link>
        </Button>
        <div className="flex gap-2">
          <Button variant={isFavorite ? "default" : "outline"} size="icon" onClick={onFavorite}>
            <Heart className="h-4 w-4" fill={isFavorite ? "currentColor" : "none"} />
          </Button>
          <Button variant="outline" size="icon" asChild>
            <Link href={`/chat/${advertiser.id}`}>
              <MessageCircle className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

function RankingsPage() {
  const [favoriteAdvertisers, setFavoriteAdvertisers] = useState([])

  const handleFavorite = (advertiserId) => {
    setFavoriteAdvertisers((prevFavorites) =>
      prevFavorites.includes(advertiserId)
        ? prevFavorites.filter((id) => id !== advertiserId)
        : [...prevFavorites, advertiserId],
    )
  }

  return (
    <div className="p-4">
      <Tabs defaultValue="rating" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="rating">Rating</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
          <TabsTrigger value="popularity">Popularity</TabsTrigger>
        </TabsList>
        <TabsContent value="rating">
          {rankingsData.rating.map((advertiser, index) => (
            <RankedAdvertiserCard
              key={advertiser.id}
              advertiser={advertiser}
              rank={index + 1}
              isFavorite={favoriteAdvertisers.includes(advertiser.id)}
              onFavorite={() => handleFavorite(advertiser.id)}
              rankingType="rating"
            />
          ))}
        </TabsContent>
        <TabsContent value="reviews">
          {rankingsData.reviews.map((advertiser, index) => (
            <RankedAdvertiserCard
              key={advertiser.id}
              advertiser={advertiser}
              rank={index + 1}
              isFavorite={favoriteAdvertisers.includes(advertiser.id)}
              onFavorite={() => handleFavorite(advertiser.id)}
              rankingType="reviews"
            />
          ))}
        </TabsContent>
        <TabsContent value="media">
          {rankingsData.media.map((advertiser, index) => (
            <RankedAdvertiserCard
              key={advertiser.id}
              advertiser={advertiser}
              rank={index + 1}
              isFavorite={favoriteAdvertisers.includes(advertiser.id)}
              onFavorite={() => handleFavorite(advertiser.id)}
              rankingType="media"
            />
          ))}
        </TabsContent>
        <TabsContent value="popularity">
          {rankingsData.popularity.map((advertiser, index) => (
            <RankedAdvertiserCard
              key={advertiser.id}
              advertiser={advertiser}
              rank={index + 1}
              isFavorite={favoriteAdvertisers.includes(advertiser.id)}
              onFavorite={() => handleFavorite(advertiser.id)}
              rankingType="popularity"
            />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default function Rankings() {
  return <RankingsPage />
}
