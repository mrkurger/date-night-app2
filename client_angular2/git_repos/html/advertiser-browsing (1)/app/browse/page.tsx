"use client"

import type React from "react"
import MasonryGrid from "@/components/MasonryGrid"
import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { MediaTicker } from "@/components/media-ticker"
import { EnhancedCarousel } from "@/components/enhanced-carousel"
import { getAdvertisers, getPremiumAdvertisers, getOnlineAdvertisers } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search } from "lucide-react"
import { TipFrenzy } from "@/components/TipFrenzy"

export default function BrowsePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [allAdvertisers, setAllAdvertisers] = useState([])
  const [premiumAdvertisers, setPremiumAdvertisers] = useState([])
  const [onlineAdvertisers, setOnlineAdvertisers] = useState([])
  const [newAdvertisers, setNewAdvertisers] = useState([])
  const [popularAdvertisers, setPopularAdvertisers] = useState([])

  const femaleImages = [
    "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=400&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=400&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=400&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=300&h=400&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=300&h=400&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=400&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&h=400&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&h=400&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=300&h=400&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=300&h=400&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=300&h=400&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1506863530036-1efeddceb993?w=300&h=400&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=300&h=400&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=400&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=400&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1548142813-c348350df52b?w=300&h=400&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=300&h=400&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=300&h=400&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&h=400&fit=crop&crop=face",
  ]

  useEffect(() => {
    // Get all advertisers with distances
    const all = getAdvertisers().map((adv, index) => ({
      ...adv,
      image: femaleImages[index % femaleImages.length],
      distance: Math.floor(Math.random() * 20) + 1,
    }))
    setAllAdvertisers(all)

    // Get premium advertisers
    const premium = getPremiumAdvertisers().map((adv, index) => ({
      ...adv,
      image: femaleImages[index % femaleImages.length],
      distance: Math.floor(Math.random() * 20) + 1,
      isPremium: true,
    }))
    setPremiumAdvertisers(premium)

    // Get online advertisers
    const online = getOnlineAdvertisers().map((adv, index) => ({
      ...adv,
      image: femaleImages[index % femaleImages.length],
      distance: Math.floor(Math.random() * 20) + 1,
    }))
    setOnlineAdvertisers(online)

    // Get new advertisers (most recent 10)
    const newOnes = [...all]
      .sort(() => Math.random() - 0.5)
      .slice(0, 10)
      .map((adv, index) => ({
        ...adv,
        image: femaleImages[index % femaleImages.length],
        distance: Math.floor(Math.random() * 20) + 1,
      }))
    setNewAdvertisers(newOnes)

    // Get popular advertisers (highest rated)
    const popular = [...all]
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 10)
      .map((adv, index) => ({
        ...adv,
        image: femaleImages[index % femaleImages.length],
        distance: Math.floor(Math.random() * 20) + 1,
      }))
    setPopularAdvertisers(popular)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, you would search and filter the advertisers
    console.log("Searching for:", searchQuery)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <MediaTicker />
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold mb-8 text-gray-800">Browse Advertisers</h1>

          <form onSubmit={handleSearch} className="flex w-full md:w-auto">
            <Input
              type="search"
              placeholder="Search advertisers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-[300px]"
            />
            <Button type="submit" className="ml-2">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </form>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid grid-cols-3 md:grid-cols-5 mb-6">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="premium">Premium</TabsTrigger>
            <TabsTrigger value="online">Online Now</TabsTrigger>
            <TabsTrigger value="new">New</TabsTrigger>
            <TabsTrigger value="popular">Popular</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-0">
            <MasonryGrid advertisers={allAdvertisers.slice(0, 7)} className="mb-12" />
            <EnhancedCarousel advertisers={allAdvertisers} title="All Advertisers" />
          </TabsContent>

          <TabsContent value="premium" className="mt-0">
            <MasonryGrid advertisers={premiumAdvertisers.slice(0, 7)} className="mb-12" />
            <EnhancedCarousel advertisers={premiumAdvertisers} title="Premium Advertisers" variant="premium" />
          </TabsContent>

          <TabsContent value="online" className="mt-0">
            <MasonryGrid advertisers={onlineAdvertisers.slice(0, 7)} className="mb-12" />
            <EnhancedCarousel advertisers={onlineAdvertisers} title="Online Now" />
          </TabsContent>

          <TabsContent value="new" className="mt-0">
            <MasonryGrid advertisers={newAdvertisers.slice(0, 7)} className="mb-12" />
            <EnhancedCarousel advertisers={newAdvertisers} title="New Advertisers" />
          </TabsContent>

          <TabsContent value="popular" className="mt-0">
            <MasonryGrid advertisers={popularAdvertisers.slice(0, 7)} className="mb-12" />
            <EnhancedCarousel advertisers={popularAdvertisers} title="Popular Advertisers" />
          </TabsContent>
        </Tabs>
      </div>
      <TipFrenzy />
      <Footer />
    </div>
  )
}
