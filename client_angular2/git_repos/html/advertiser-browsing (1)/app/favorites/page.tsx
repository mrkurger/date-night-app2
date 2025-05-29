"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, MessageCircle, Trash2 } from "lucide-react"
import { Header } from "@/components/header"
import { getAdvertisers } from "@/lib/data"

export default function FavoritesPage() {
  // In a real app, you would fetch the user's favorites from an API
  // For now, we'll just use some sample data
  const allAdvertisers = getAdvertisers()
  const [favorites, setFavorites] = useState(allAdvertisers.slice(0, 4))

  const removeFavorite = (id: string | number) => {
    setFavorites(favorites.filter((adv) => adv.id !== id))
  }

  return (
    <div>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Your Favorites</h1>

        {favorites.length === 0 ? (
          <div className="text-center py-16">
            <h2 className="text-2xl font-semibold mb-4">No favorites yet</h2>
            <p className="text-gray-500 mb-8">Browse advertisers and add them to your favorites to see them here.</p>
            <Button asChild>
              <Link href="/advertisers">Browse Advertisers</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {favorites.map((advertiser) => (
              <Card key={advertiser.id} className="overflow-hidden">
                <div className="aspect-[3/4] relative">
                  <img
                    src={advertiser.image || `/placeholder.svg?height=400&width=300&text=${advertiser.name}`}
                    alt={advertiser.name}
                    className="w-full h-full object-cover"
                  />
                  {advertiser.isVip && (
                    <Badge className="absolute top-2 right-2 bg-amber-500 text-amber-950">VIP</Badge>
                  )}
                  {advertiser.isOnline && (
                    <Badge className="absolute top-2 left-2 bg-green-500 text-green-950">Online</Badge>
                  )}
                </div>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle>
                      {advertiser.name}
                      {advertiser.age && <span className="text-gray-400 ml-2">{advertiser.age}</span>}
                    </CardTitle>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-500 mr-1" />
                      <span>{advertiser.rating || "New"}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-400">{advertiser.location || "Location not specified"}</p>
                </CardHeader>
                <CardFooter className="flex justify-between">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/advertiser/${advertiser.id}`}>View</Link>
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="text-red-500"
                      onClick={() => removeFavorite(advertiser.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" asChild>
                      <Link href={`/chat/${advertiser.id}`}>
                        <MessageCircle className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
