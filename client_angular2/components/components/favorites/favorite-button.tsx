"use client"

import { useState } from "react"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface FavoriteButtonProps {
  advertiserId: string
  className?: string
}

export function FavoriteButton({ advertiserId, className }: FavoriteButtonProps) {
  // In a real app, you would check if this advertiser is already in favorites
  const [isFavorite, setIsFavorite] = useState(false)

  const toggleFavorite = () => {
    // In a real app, you would call an API to add/remove from favorites
    setIsFavorite(!isFavorite)
  }

  return (
    <Button
      variant="outline"
      size="icon"
      className={cn(
        "h-8 w-8 rounded-full bg-black/50 border-0 backdrop-blur-sm",
        isFavorite && "text-pink-500",
        className,
      )}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        toggleFavorite()
      }}
    >
      <Heart className="h-4 w-4" fill={isFavorite ? "currentColor" : "none"} />
      <span className="sr-only">{isFavorite ? "Remove from favorites" : "Add to favorites"}</span>
    </Button>
  )
}
