"use client"

import type React from "react"

import { useState } from "react"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"

interface FavoriteButtonProps {
  advertiserId: number
}

export function FavoriteButton({ advertiserId }: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false)
  const { toast } = useToast()

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    setIsFavorite(!isFavorite)

    toast({
      title: isFavorite ? "Removed from favorites" : "Added to favorites",
      description: isFavorite
        ? "This advertiser has been removed from your favorites"
        : "This advertiser has been added to your favorites",
      duration: 3000,
    })
  }

  const addToCollection = (collection: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    setIsFavorite(true)

    toast({
      title: `Added to ${collection}`,
      description: `This advertiser has been added to your "${collection}" collection`,
      duration: 3000,
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className={`rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 ${
            isFavorite ? "text-pink-500" : "text-white"
          }`}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
        >
          <Heart className={`h-5 w-5 ${isFavorite ? "fill-current" : ""}`} />
          <span className="sr-only">Add to favorites</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Add to collection</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={(e) => toggleFavorite(e as any)}>
          {isFavorite ? "Remove from favorites" : "Add to favorites"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={(e) => addToCollection("Favorites", e as any)}>Add to Favorites</DropdownMenuItem>
        <DropdownMenuItem onClick={(e) => addToCollection("Must Visit", e as any)}>Add to Must Visit</DropdownMenuItem>
        <DropdownMenuItem onClick={(e) => addToCollection("Regulars", e as any)}>Add to Regulars</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Create new collection...</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
