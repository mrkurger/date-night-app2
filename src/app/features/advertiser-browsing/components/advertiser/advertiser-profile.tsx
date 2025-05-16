"use client"

import { useState } from "react"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Clock, DollarSign, MessageCircle, Phone, Star, Video } from "lucide-react"
import { ImageGallery } from "@/components/advertiser/image-gallery"
import { ServiceCard } from "@/components/advertiser/service-card"
import { ReviewList } from "@/components/advertiser/review-list"
import { VipContent } from "@/components/advertiser/vip-content"
import { FavoriteButton } from "@/components/favorites/favorite-button"
import { useAuth } from "@/context/auth-context"
import type { Advertiser } from "@/lib/data"

interface AdvertiserProfileProps {
  advertiser: Advertiser
}

export function AdvertiserProfile({ advertiser }: AdvertiserProfileProps) {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("about")

  // For real implementation, these would be separate arrays/objects
  const advertiserImages = [
    `/placeholder.svg?height=600&width=400&text=${advertiser.name}+1`,
    `/placeholder.svg?height=600&width=400&text=${advertiser.name}+2`,
    `/placeholder.svg?height=600&width=400&text=${advertiser.name}+3`,
    `/placeholder.svg?height=600&width=400&text=${advertiser.name}+4`,
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left column with images and action buttons */}
        <div className="lg:w-1/2 space-y-4">
          <div className="relative">
            <ImageGallery images={advertiserImages} />
            <div className="absolute top-4 right-4 z-10">
              <FavoriteButton advertiserId={advertiser.id.toString()} />
            </div>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-3 gap-4">
            <Button className="flex flex-col items-center py-6 bg-pink-600 hover:bg-pink-700">
              <MessageCircle className="h-6 w-6 mb-1" />
              <span>Chat</span>
            </Button>
            <Button className="flex flex-col items-center py-6 bg-blue-600 hover:bg-blue-700">
              <Video className="h-6 w-6 mb-1" />
              <span>Video Call</span>
            </Button>
            <Button className="flex flex-col items-center py-6 bg-green-600 hover:bg-green-700">
              <Phone className="h-6 w-6 mb-1" />
              <span>Call</span>
            </Button>
          </div>

          {/* VIP upgrade prompt for non-VIP users */}
          {user && !user.isVipMember && advertiser.isVip && (
            <Card className="bg-gradient-to-r from-yellow-800 to-amber-700 border-amber-500">
              <CardContent className="p-4">
                <h3 className="text-lg font-bold mb-2">Unlock VIP Content</h3>
                <p className="mb-4 text-sm">This advertiser has exclusive content only available to VIP members.</p>
                <Button asChild className="w-full bg-amber-500 hover:bg-amber-600 text-black">
                  <Link href="/upgrade">Upgrade to VIP</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right column with advertiser details */}
        <div className="lg:w-1/2">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold">{advertiser.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-500 mr-1" />
                  <span>{advertiser.rating}</span>
                </div>
                <span className="text-gray-400">•</span>
                <span>{advertiser.location}</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              {advertiser.isVip && <Badge className="bg-amber-500 text-amber-950">VIP Advertiser</Badge>}
              {advertiser.isOnline && <Badge className="bg-green-500 text-green-950">Online Now</Badge>}
            </div>
          </div>

          <div className="mb-6">
            <div className="flex flex-wrap gap-2 mb-4">
              {advertiser.tags &&
                advertiser.tags.map((tag: string) => (
                  <Badge key={tag} variant="outline" className="bg-gray-800 border-gray-700">
                    {tag}
                  </Badge>
                ))}
            </div>
            <p className="text-gray-300">{advertiser.description}</p>
          </div>

          {/* Price */}
          <Card className="mb-6 bg-gray-800/50 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-5 w-5 text-green-500" />
                <h3 className="text-lg font-semibold">Starting at {advertiser.price}</h3>
              </div>
              <p className="text-sm text-gray-400">Prices may vary based on services and duration</p>
            </CardContent>
          </Card>

          {/* Availability */}
          <Card className="mb-6 bg-gray-800/50 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-blue-500" />
                <h3 className="text-lg font-semibold">Availability</h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {advertiser.availability &&
                  advertiser.availability.map((slot: any) => (
                    <div key={slot.day} className="flex justify-between">
                      <span className="font-medium">{slot.day}</span>
                      <span className={slot.hours === "Closed" ? "text-red-400" : "text-green-400"}>{slot.hours}</span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Tabs for more details */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
            <TabsList className="w-full grid grid-cols-4">
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="services">Services</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="media">Media</TabsTrigger>
            </TabsList>

            <TabsContent value="about" className="mt-4">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-4 space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">About Me</h3>
                    <p>
                      {advertiser.description} I'm a professional service provider with several years of experience
                      dedicated to providing high-quality experiences. Customer satisfaction is my top priority, and I
                      strive to exceed expectations with every encounter.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Contact Information</h3>
                    <p className="text-gray-300">
                      The best way to contact me is through the chat feature on this platform. I typically respond
                      within 30 minutes during my available hours.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="services" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {advertiser.services &&
                  advertiser.services.map((service: any, index: number) => (
                    <ServiceCard key={index} service={service} />
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="mt-4">
              <ReviewList reviews={advertiser.reviews} averageRating={advertiser.rating} />
            </TabsContent>

            <TabsContent value="media" className="mt-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {advertiserImages.map((image, index) => (
                  <div key={index} className="aspect-square overflow-hidden rounded-md">
                    <img
                      src={image || "/placeholder.svg"}
                      alt={`Media ${index + 1}`}
                      className="object-cover w-full h-full"
                    />
                  </div>
                ))}
              </div>

              {advertiser.isVip && (
                <div className="mt-6">
                  <VipContent />
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
