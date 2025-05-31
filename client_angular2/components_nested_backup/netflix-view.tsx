"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, MessageCircle, Video, DollarSign, ChevronLeft, ChevronRight } from "lucide-react"
import { FavoriteButton } from "@/components/favorites/favorite-button"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"

interface Advertiser {
  id: number | string
  name: string
  age: number
  location: string
  description: string
  tags: string[]
  image: string
  images?: string[]
  rating: number
  isVip: boolean
  isOnline: boolean
}

interface NetflixViewProps {
  advertisers: Advertiser[]
  loadMore?: (page: number) => void
  title?: string
  showSectionNav?: boolean
}

export default function NetflixView({
  advertisers,
  loadMore,
  title = "Browse Advertisers",
  showSectionNav = false,
}: NetflixViewProps) {
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hoveredCard, setHoveredCard] = useState<number | string | null>(null)
  const observer = useRef<IntersectionObserver | null>(null)
  const lastCardRef = useRef<HTMLDivElement | null>(null)
  const rowRef = useRef<HTMLDivElement | null>(null)
  const isMobile = useIsMobile()

  // Function to handle infinite scrolling
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries
      if (entry.isIntersecting && !loading && loadMore) {
        setLoading(true)
        loadMore(page)
        setPage((prev) => prev + 1)
        setLoading(false)
      }
    },
    [loading, loadMore, page],
  )

  // Set up the intersection observer
  useEffect(() => {
    if (loadMore) {
      observer.current = new IntersectionObserver(handleObserver, {
        root: null,
        rootMargin: "20px",
        threshold: 0.1,
      })

      if (lastCardRef.current) {
        observer.current.observe(lastCardRef.current)
      }

      return () => {
        if (observer.current) {
          observer.current.disconnect()
        }
      }
    }
  }, [handleObserver, loadMore, advertisers])

  const scrollRow = (direction: "left" | "right") => {
    if (rowRef.current) {
      const scrollAmount = rowRef.current.clientWidth * 0.75
      if (direction === "left") {
        rowRef.current.scrollBy({ left: -scrollAmount, behavior: "smooth" })
      } else {
        rowRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" })
      }
    }
  }

  if (advertisers.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl mb-2">No advertisers found</h3>
        <p className="text-gray-400">Try adjusting your search or filters</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {title && (
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">{title}</h2>
          {showSectionNav && (
            <div className="flex space-x-2">
              <Button variant="outline" size="icon" onClick={() => scrollRow("left")} className="rounded-full">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => scrollRow("right")} className="rounded-full">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}

      <div
        ref={rowRef}
        className={cn(
          "grid gap-4",
          showSectionNav
            ? "flex overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide"
            : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
        )}
      >
        {advertisers.map((advertiser, index) => {
          // Check if this is the last card
          const isLastCard = index === advertisers.length - 1

          return (
            <div
              key={`${advertiser.id}-${index}`}
              ref={isLastCard ? lastCardRef : null}
              className={cn(showSectionNav && "min-w-[250px] sm:min-w-[280px] snap-start")}
            >
              <Link href={`/advertiser/${advertiser.id}`}>
                <Card
                  className="overflow-hidden bg-gray-900 border-gray-800 transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/20 h-full"
                  onMouseEnter={() => setHoveredCard(advertiser.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <img
                      src={advertiser.image || `/placeholder.svg?height=400&width=300&text=${advertiser.name}`}
                      alt={advertiser.name}
                      className="object-cover w-full h-full transition-transform duration-500 ease-in-out hover:scale-105"
                    />
                    <div className="absolute top-2 right-2 flex flex-col gap-2">
                      <FavoriteButton advertiserId={advertiser.id.toString()} />
                    </div>
                    {advertiser.isOnline && (
                      <div className="absolute bottom-2 left-2">
                        <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500">
                          Online Now
                        </Badge>
                      </div>
                    )}
                    {advertiser.isVip && (
                      <div className="absolute bottom-2 right-2">
                        <Badge variant="outline" className="bg-amber-500/20 text-amber-400 border-amber-500">
                          VIP Content
                        </Badge>
                      </div>
                    )}

                    {/* Overlay that appears on hover */}
                    <div
                      className={cn(
                        "absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-4 flex flex-col justify-end transition-opacity duration-300",
                        hoveredCard === advertiser.id ? "opacity-100" : "opacity-0",
                        isMobile && "opacity-100 bg-gradient-to-t from-black/80 via-black/30 to-transparent",
                      )}
                    >
                      <div className="flex gap-2 mb-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="flex-1 bg-pink-600 hover:bg-pink-700 text-white"
                        >
                          <MessageCircle className="mr-1 h-4 w-4" /> Chat
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <Video className="mr-1 h-4 w-4" /> Video
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        >
                          <DollarSign className="mr-1 h-4 w-4" /> Tip
                        </Button>
                      </div>
                      <div className="text-xs text-gray-300">
                        {advertiser.tags.map((tag) => (
                          <span key={tag} className="mr-2">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="text-lg font-semibold">
                        {advertiser.name}, {advertiser.age}
                      </h3>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-500 mr-1" />
                        <span className="text-sm">{advertiser.rating}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-400 mb-2">{advertiser.location}</p>
                    <p className="text-sm line-clamp-2">{advertiser.description}</p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          )
        })}
      </div>

      {loading && (
        <div className="text-center py-4">
          <p>Loading more advertisers...</p>
        </div>
      )}
    </div>
  )
}
