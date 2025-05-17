"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ImageGalleryProps {
  images: string[]
  className?: string
}

export function ImageGallery({ images, className }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1))
  }

  const goToImage = (index: number) => {
    setCurrentIndex(index)
  }

  return (
    <div className={cn("relative rounded-lg overflow-hidden", className)}>
      {/* Main image */}
      <div className="aspect-[4/3] relative">
        {images.map((image, index) => (
          <div
            key={index}
            className={cn(
              "absolute inset-0 transition-opacity duration-300",
              index === currentIndex ? "opacity-100" : "opacity-0",
            )}
          >
            <img src={image || "/placeholder.svg"} alt={`Image ${index + 1}`} className="w-full h-full object-cover" />
          </div>
        ))}

        {/* Navigation arrows */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 text-white rounded-full hover:bg-black/50"
          onClick={goToPrevious}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 text-white rounded-full hover:bg-black/50"
          onClick={goToNext}
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>

      {/* Thumbnails */}
      <div className="flex mt-2 gap-2 overflow-x-auto">
        {images.map((image, index) => (
          <button
            key={index}
            className={cn(
              "h-16 w-16 flex-shrink-0 rounded-md overflow-hidden transition-all",
              index === currentIndex ? "ring-2 ring-pink-500" : "opacity-70 hover:opacity-100",
            )}
            onClick={() => goToImage(index)}
          >
            <img
              src={image || "/placeholder.svg"}
              alt={`Thumbnail ${index + 1}`}
              className="h-full w-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  )
}
