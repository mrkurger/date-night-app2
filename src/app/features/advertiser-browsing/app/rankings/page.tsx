"use client"

import { useState } from "react"
import { getAdvertisers } from "@/lib/data"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ImageCarousel } from "@/components/image-carousel"
import { Heart, MessageCircle, Star, ImageIcon, Video, ThumbsUp } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useFavorites } from "@/context/favorites-context"

export default function RankingsPage() {
  const [rankingType, setRankingType] = useState("overall")
  const advertisers = getAdvertisers()
  const { addFavorite, isFavorite } = useFavorites()

  // Sort advertisers by different criteria
  const sortedByRating = [...advertisers].sort((a, b) => b.rating - a.rating)
  const sortedByReviews = [...advertisers].sort((a, b) => b.reviewCount - a.reviewCount)
  const sortedByMediaRating = [...advertisers].sort((a, b) => b.mediaRating - a.mediaRating)
  const sortedByPopularity = [...advertisers].sort((a, b) => b.popularity - a.popularity)

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Top Ranked Advertisers</h1>

      <Tabs defaultValue="overall" onValueChange={setRankingType}>
        <TabsList className="mb-6">
          <TabsTrigger value="overall">Overall Rating</TabsTrigger>
          <TabsTrigger value="reviews">Most Reviews</TabsTrigger>
          <TabsTrigger value="media">Best Media</TabsTrigger>
          <TabsTrigger value="popularity">Most Popular</TabsTrigger>
        </TabsList>

        <TabsContent value="overall">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">Top Rated Advertisers</h2>
            <p className="text-muted-foreground">Advertisers with the highest overall ratings</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedByRating.slice(0, 8).map((advertiser, index) => (
              <RankedAdvertiserCard
                key={advertiser.id}
                advertiser={advertiser}
                rank={index + 1}
                isFavorite={isFavorite(advertiser.id)}
                onFavorite={() => addFavorite(advertiser.id)}
                rankingType="rating"
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="reviews">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">Most Reviewed Advertisers</h2>
            <p className="text-muted-foreground">Advertisers with the highest number of reviews</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedByReviews.slice(0, 8).map((advertiser, index) => (
              <RankedAdvertiserCard
                key={advertiser.id}
                advertiser={advertiser}
                rank={index + 1}
                isFavorite={isFavorite(advertiser.id)}
                onFavorite={() => addFavorite(advertiser.id)}
                rankingType="reviews"
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="media">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">Best Media Content</h2>
            <p className="text-muted-foreground">Advertisers with the highest rated photos and videos</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedByMediaRating.slice(0, 8).map((advertiser, index) => (
              <RankedAdvertiserCard
                key={advertiser.id}
                advertiser={advertiser}
                rank={index + 1}
                isFavorite={isFavorite(advertiser.id)}
                onFavorite={() => addFavorite(advertiser.id)}
                rankingType="media"
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="popularity">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">Most Popular Advertisers</h2>
            <p className="text-muted-foreground">Advertisers with the highest number of profile views</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedByPopularity.slice(0, 8).map((advertiser, index) => (
              <RankedAdvertiserCard
                key={advertiser.id}
                advertiser={advertiser}
                rank={index + 1}
                isFavorite={isFavorite(advertiser.id)}
                onFavorite={() => addFavorite(advertiser.id)}
                rankingType="popularity"
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

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
          <ImageCarousel images={advertiser.images} className="h-full" showDots={false} />
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
            {advertiser.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="flex justify-between p-4 pt-0">
        <Button variant="outline" size="sm" asChild>
          <a href={`/advertiser/${advertiser.id}`}>View Profile</a>
        </Button>
        <div className="flex gap-2">
          <Button variant={isFavorite ? "default" : "outline"} size="icon" onClick={onFavorite}>
            <Heart className="h-4 w-4" fill={isFavorite ? "currentColor" : "none"} />
          </Button>
          <Button variant="outline" size="icon" asChild>
            <a href={`/chat/${advertiser.id}`}>
              <MessageCircle className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
