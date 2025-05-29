"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { SearchIcon } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { MediaTicker } from "@/components/media-ticker"
import { EnhancedCarousel } from "@/components/enhanced-carousel"
import { getAdvertisers, searchAdvertisers } from "@/lib/data"

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [distance, setDistance] = useState([10])
  const [filters, setFilters] = useState({
    online: false,
    vip: false,
    massage: false,
    escort: false,
    dinnerDate: false,
  })

  // Get all advertisers and then filter them based on the search query and filters
  const allAdvertisers = getAdvertisers().map((adv) => ({
    ...adv,
    distance: Math.floor(Math.random() * 20) + 1,
  }))

  // Filter advertisers based on search query
  let filteredAdvertisers = searchQuery ? searchAdvertisers(searchQuery) : allAdvertisers

  // Apply additional filters
  if (filters.online) {
    filteredAdvertisers = filteredAdvertisers.filter((adv) => adv.isOnline)
  }

  if (filters.vip) {
    filteredAdvertisers = filteredAdvertisers.filter((adv) => adv.isVip)
  }

  if (filters.massage || filters.escort || filters.dinnerDate) {
    filteredAdvertisers = filteredAdvertisers.filter((adv) => {
      if (!adv.tags) return false

      if (filters.massage && adv.tags.includes("Massage")) return true
      if (filters.escort && adv.tags.includes("Escort")) return true
      if (filters.dinnerDate && adv.tags.includes("Dinner Date")) return true

      return false
    })
  }

  // Add distance to filtered advertisers
  filteredAdvertisers = filteredAdvertisers.map((adv) => ({
    ...adv,
    distance: Math.floor(Math.random() * 20) + 1,
  }))

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // The filtering is already done reactively, so we don't need to do anything here
  }

  const handleFilterChange = (key: string, value: boolean) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div>
      <Header />
      <MediaTicker />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Search Advertisers</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Filters sidebar */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold mb-4">Filters</h2>

              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-2">Distance</h3>
                  <div className="space-y-3">
                    <Slider value={distance} onValueChange={setDistance} max={50} step={1} />
                    <div className="flex justify-between text-sm">
                      <span>0 km</span>
                      <span>{distance[0]} km</span>
                      <span>50 km</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Status</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="online"
                        checked={filters.online}
                        onCheckedChange={(checked) => handleFilterChange("online", !!checked)}
                      />
                      <label htmlFor="online">Online now</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="vip"
                        checked={filters.vip}
                        onCheckedChange={(checked) => handleFilterChange("vip", !!checked)}
                      />
                      <label htmlFor="vip">VIP advertisers</label>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Services</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="massage"
                        checked={filters.massage}
                        onCheckedChange={(checked) => handleFilterChange("massage", !!checked)}
                      />
                      <label htmlFor="massage">Massage</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="escort"
                        checked={filters.escort}
                        onCheckedChange={(checked) => handleFilterChange("escort", !!checked)}
                      />
                      <label htmlFor="escort">Escort</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="dinnerDate"
                        checked={filters.dinnerDate}
                        onCheckedChange={(checked) => handleFilterChange("dinnerDate", !!checked)}
                      />
                      <label htmlFor="dinnerDate">Dinner Date</label>
                    </div>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setFilters({
                      online: false,
                      vip: false,
                      massage: false,
                      escort: false,
                      dinnerDate: false,
                    })
                    setDistance([10])
                  }}
                >
                  Reset Filters
                </Button>
              </div>
            </div>
          </div>

          {/* Search results */}
          <div className="md:col-span-3">
            <form onSubmit={handleSearch} className="flex gap-2 mb-6">
              <Input
                placeholder="Search by name, location, or services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button type="submit">
                <SearchIcon className="h-4 w-4 mr-2" />
                Search
              </Button>
            </form>

            {filteredAdvertisers.length === 0 ? (
              <div className="text-center py-12">
                <h2 className="text-2xl font-semibold mb-4">No results found</h2>
                <p className="text-gray-500 mb-8">
                  Try adjusting your search or filters to find what you're looking for.
                </p>
                <Button
                  onClick={() => {
                    setSearchQuery("")
                    setFilters({
                      online: false,
                      vip: false,
                      massage: false,
                      escort: false,
                      dinnerDate: false,
                    })
                  }}
                >
                  Clear Search
                </Button>
              </div>
            ) : (
              <div>
                <p className="mb-4">Found {filteredAdvertisers.length} advertisers</p>
                <EnhancedCarousel
                  advertisers={filteredAdvertisers.filter((adv) => adv.isVip || adv.isPremium)}
                  title="Premium Results"
                  variant="premium"
                  className="mb-12"
                />
                <EnhancedCarousel advertisers={filteredAdvertisers} title="All Results" />
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
