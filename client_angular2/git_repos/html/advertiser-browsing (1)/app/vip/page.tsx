"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import EnhancedNavbar from "@/components/enhanced-navbar"
import { Crown, Star, Diamond, Video, MessageCircle, Lock, Sparkles } from "lucide-react"

const vipAdvertisers = [
  {
    id: 1,
    name: "Sophia Elite",
    age: 24,
    location: "Miami, FL",
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=600&fit=crop&crop=face",
    tier: "Diamond",
    price: 299,
    rating: 4.9,
    isOnline: true,
    exclusiveContent: 45,
    vipMembers: 234,
  },
  {
    id: 2,
    name: "Isabella Luxe",
    age: 26,
    location: "Los Angeles, CA",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop&crop=face",
    tier: "Platinum",
    price: 199,
    rating: 4.8,
    isOnline: true,
    exclusiveContent: 32,
    vipMembers: 189,
  },
  {
    id: 3,
    name: "Emma Royal",
    age: 23,
    location: "New York, NY",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=600&fit=crop&crop=face",
    tier: "Gold",
    price: 149,
    rating: 4.7,
    isOnline: false,
    exclusiveContent: 28,
    vipMembers: 156,
  },
]

export default function VIPPage() {
  const [selectedTier, setSelectedTier] = useState("all")

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-red-900">
      <EnhancedNavbar />

      <div className="container mx-auto px-4 py-8">
        {/* VIP Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Crown className="w-12 h-12 text-yellow-400" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              VIP EXCLUSIVE
            </h1>
            <Crown className="w-12 h-12 text-yellow-400" />
          </div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Access premium content, private shows, and exclusive experiences with our top-tier advertisers
          </p>
        </div>

        {/* VIP Tiers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 border-yellow-500/30 p-6 text-center">
            <Crown className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-yellow-400 mb-2">Gold VIP</h3>
            <p className="text-gray-300 mb-4">Premium access to exclusive content</p>
            <div className="text-3xl font-bold text-white mb-4">$149/month</div>
            <Button className="w-full bg-gradient-to-r from-yellow-500 to-orange-600">Upgrade Now</Button>
          </Card>

          <Card className="bg-gradient-to-br from-gray-400/20 to-gray-600/20 border-gray-400/30 p-6 text-center">
            <Diamond className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-300 mb-2">Platinum VIP</h3>
            <p className="text-gray-300 mb-4">Enhanced features + private messaging</p>
            <div className="text-3xl font-bold text-white mb-4">$199/month</div>
            <Button className="w-full bg-gradient-to-r from-gray-500 to-gray-700">Upgrade Now</Button>
          </Card>

          <Card className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border-blue-500/30 p-6 text-center">
            <Sparkles className="w-16 h-16 text-blue-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-blue-400 mb-2">Diamond VIP</h3>
            <p className="text-gray-300 mb-4">Ultimate access + personal concierge</p>
            <div className="text-3xl font-bold text-white mb-4">$299/month</div>
            <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600">Upgrade Now</Button>
          </Card>
        </div>

        {/* VIP Content Tabs */}
        <Tabs defaultValue="exclusive" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-black/40 backdrop-blur-sm">
            <TabsTrigger value="exclusive">Exclusive Content</TabsTrigger>
            <TabsTrigger value="live">Private Shows</TabsTrigger>
            <TabsTrigger value="casino">VIP Casino</TabsTrigger>
            <TabsTrigger value="concierge">Concierge</TabsTrigger>
          </TabsList>

          <TabsContent value="exclusive" className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vipAdvertisers.map((advertiser) => (
                <Card key={advertiser.id} className="bg-black/40 backdrop-blur-sm border-pink-500/30 overflow-hidden">
                  <div className="relative">
                    <img
                      src={advertiser.image || "/placeholder.svg"}
                      alt={advertiser.name}
                      className="w-full h-64 object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge
                        className={`${
                          advertiser.tier === "Diamond"
                            ? "bg-blue-600"
                            : advertiser.tier === "Platinum"
                              ? "bg-gray-600"
                              : "bg-yellow-600"
                        } text-white`}
                      >
                        <Crown className="w-3 h-3 mr-1" />
                        {advertiser.tier}
                      </Badge>
                    </div>
                    {advertiser.isOnline && (
                      <div className="absolute top-4 right-4 bg-green-500 rounded-full w-4 h-4 border-2 border-white animate-pulse" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  </div>

                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-bold text-white">{advertiser.name}</h3>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-yellow-400">{advertiser.rating}</span>
                      </div>
                    </div>

                    <p className="text-gray-300 mb-4">{advertiser.location}</p>

                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div className="text-center">
                        <div className="text-pink-400 font-bold">{advertiser.exclusiveContent}</div>
                        <div className="text-gray-400">Exclusive Photos</div>
                      </div>
                      <div className="text-center">
                        <div className="text-purple-400 font-bold">{advertiser.vipMembers}</div>
                        <div className="text-gray-400">VIP Members</div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600">
                        <Lock className="w-4 h-4 mr-2" />
                        Unlock ${advertiser.price}
                      </Button>
                      <Button size="sm" className="bg-green-600">
                        <MessageCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="live" className="mt-8">
            <div className="text-center py-12">
              <Video className="w-24 h-24 text-pink-400 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-white mb-4">Private Live Shows</h2>
              <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
                Book exclusive one-on-one sessions with your favorite VIP advertisers
              </p>
              <Button className="bg-gradient-to-r from-pink-500 to-purple-600 text-lg px-8 py-3">
                Browse Available Shows
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="casino" className="mt-8">
            <div className="text-center py-12">
              <Crown className="w-24 h-24 text-yellow-400 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-white mb-4">VIP Casino</h2>
              <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
                Access high-stakes games and exclusive casino experiences
              </p>
              <Button className="bg-gradient-to-r from-yellow-500 to-orange-600 text-lg px-8 py-3">
                Enter VIP Casino
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="concierge" className="mt-8">
            <div className="text-center py-12">
              <Sparkles className="w-24 h-24 text-blue-400 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-white mb-4">Personal Concierge</h2>
              <p className="text-gray-300 mb-8 max-w-2xl mx-auto">24/7 personal assistance for Diamond VIP members</p>
              <Button className="bg-gradient-to-r from-blue-500 to-purple-600 text-lg px-8 py-3">
                Contact Concierge
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
