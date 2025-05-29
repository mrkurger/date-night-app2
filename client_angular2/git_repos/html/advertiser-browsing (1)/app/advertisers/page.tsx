import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star } from "lucide-react"
import { getAdvertisers } from "@/lib/data"

export default function AdvertisersPage() {
  const advertisers = getAdvertisers()

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Browse All Advertisers</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {advertisers.map((advertiser) => (
          <Card key={advertiser.id} className="overflow-hidden">
            <div className="aspect-[3/4] relative">
              <img
                src={advertiser.image || `/placeholder.svg?height=400&width=300&text=${advertiser.name}`}
                alt={advertiser.name}
                className="w-full h-full object-cover"
              />
              {advertiser.isVip && <Badge className="absolute top-2 right-2 bg-amber-500 text-amber-950">VIP</Badge>}
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
            <CardContent>
              <p className="line-clamp-2 text-sm">
                {advertiser.description || "No description available for this advertiser."}
              </p>
              <div className="flex flex-wrap gap-1 mt-2">
                {advertiser.tags &&
                  advertiser.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href={`/advertiser/${advertiser.id}`}>View Profile</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
