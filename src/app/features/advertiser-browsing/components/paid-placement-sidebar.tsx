"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MessageCircle } from "lucide-react"
import Link from "next/link"

interface Advertiser {
  id: number
  name: string
  age: number
  location: string
  description: string
  tags: string[]
  image: string
  rating: number
  isVip: boolean
  isOnline: boolean
}

interface PaidPlacementSidebarProps {
  ads?: Advertiser[]
}

export default function PaidPlacementSidebar({ ads = [] }: PaidPlacementSidebarProps) {
  // If no ads are provided, return nothing
  if (ads.length === 0) {
    return null
  }

  return (
    <div className="w-64 space-y-4 p-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Sponsored</h3>
      </div>

      {ads.map((ad) => (
        <Link href={`/advertiser/${ad.id}`} key={ad.id}>
          <Card className="overflow-hidden bg-gray-900 border-gray-800 hover:border-pink-500/50 transition-all duration-300">
            <div className="relative aspect-[3/4] overflow-hidden">
              <img src={ad.image || "/placeholder.svg"} alt={ad.name} className="object-cover w-full h-full" />
              {ad.isOnline && (
                <div className="absolute top-2 left-2">
                  <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500">
                    Online
                  </Badge>
                </div>
              )}
            </div>

            <CardContent className="p-3">
              <div className="flex justify-between items-start mb-1">
                <h3 className="text-sm font-semibold">
                  {ad.name}, {ad.age}
                </h3>
              </div>
              <p className="text-xs text-gray-400 mb-2">{ad.location}</p>
              <Button size="sm" variant="secondary" className="w-full bg-pink-600 hover:bg-pink-700 text-white mt-2">
                <MessageCircle className="mr-1 h-3 w-3" /> Chat Now
              </Button>
            </CardContent>
          </Card>
        </Link>
      ))}

      <div className="mt-4 text-center">
        <Link href="/advertise" className="text-pink-500 hover:text-pink-400 text-sm">
          Advertise here
        </Link>
      </div>
    </div>
  )
}
