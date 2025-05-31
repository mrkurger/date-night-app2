"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"

interface MediaItem {
  id: string
  type: "update" | "media"
  content: string
  advertiserName: string
  advertiserId: string
  timestamp: string
  imageUrl?: string
}

export function MediaTicker() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeIndex, setActiveIndex] = useState(0)
  const tickerRef = useRef<HTMLDivElement>(null)
  const isMobile = useIsMobile()

  // Mock data for the ticker
  useEffect(() => {
    // In a real app, you would fetch this data from an API
    const mockMediaItems: MediaItem[] = [
      {
        id: "1",
        type: "update",
        content: "Just added new photos to my gallery!",
        advertiserName: "Sophia",
        advertiserId: "1",
        timestamp: "10 minutes ago",
      },
      {
        id: "2",
        type: "media",
        content: "Check out my latest photoshoot",
        advertiserName: "Emma",
        advertiserId: "2",
        timestamp: "1 hour ago",
        imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&h=150&fit=crop",
      },
      {
        id: "3",
        type: "update",
        content: "Available for bookings this weekend!",
        advertiserName: "Olivia",
        advertiserId: "3",
        timestamp: "2 hours ago",
      },
      {
        id: "4",
        type: "media",
        content: "New location revealed",
        advertiserName: "Isabella",
        advertiserId: "4",
        timestamp: "3 hours ago",
        imageUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=200&h=150&fit=crop",
      },
      {
        id: "5",
        type: "update",
        content: "Special discount for VIP members this week!",
        advertiserName: "Mia",
        advertiserId: "5",
        timestamp: "5 hours ago",
      },
    ]

    setMediaItems(mockMediaItems)
    setIsLoading(false)
  }, [])

  // Auto-scroll the ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % mediaItems.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [mediaItems.length])

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + mediaItems.length) % mediaItems.length)
  }

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % mediaItems.length)
  }

  if (isLoading) {
    return (
      <div className="bg-gray-800 text-white p-2 flex items-center justify-center">
        <div className="animate-pulse">Loading updates...</div>
      </div>
    )
  }

  return (
    <div className="bg-gray-800 text-white relative overflow-hidden">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" className="text-white hover:bg-gray-700 mr-2" onClick={handlePrev}>
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div ref={tickerRef} className="flex-1 overflow-hidden relative h-10">
            {mediaItems.map((item, index) => (
              <div
                key={item.id}
                className={cn(
                  "absolute inset-0 transition-all duration-500 flex items-center",
                  index === activeIndex ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full",
                )}
              >
                <div className="flex items-center space-x-2 w-full">
                  {item.imageUrl && !isMobile && (
                    <img
                      src={item.imageUrl || "/placeholder.svg"}
                      alt={item.advertiserName}
                      className="h-8 w-8 object-cover rounded"
                    />
                  )}
                  <div className="flex-1 truncate">
                    <span className="font-medium">{item.advertiserName}: </span>
                    <span className="text-gray-300">{item.content}</span>
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap">{item.timestamp}</span>
                </div>
              </div>
            ))}
          </div>

          <Button variant="ghost" size="icon" className="text-white hover:bg-gray-700 ml-2" onClick={handleNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
