"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface ImageGalleryProps {
  images: string[]
}

export function ImageGallery({ images }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  // Default image if no images are provided
  if (!images || images.length === 0) {
    images = ["/placeholder.svg?height=600&width=400&text=No+Image"]
  }

  const goToPrevious = () => {
    const isFirstSlide = currentIndex === 0
    const newIndex = isFirstSlide ? images.length - 1 : currentIndex - 1
    setCurrentIndex(newIndex)
  }

  const goToNext = () => {
    const isLastSlide = currentIndex === images.length - 1
    const newIndex = isLastSlide ? 0 : currentIndex + 1
    setCurrentIndex(newIndex)
  }

  const goToSlide = (slideIndex: number) => {
    setCurrentIndex(slideIndex)
  }

  return (
    <div className="relative w-full h-full aspect-[3/4] group">
      <div className="w-full h-full overflow-hidden rounded-lg">
        <img
          src={images[currentIndex] || "/placeholder.svg"}
          alt={`Gallery image ${currentIndex + 1}`}
          className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
        />
      </div>

      {/* Left Arrow */}
      {images.length > 1 && (
        <div className="hidden group-hover:block absolute top-1/2 -translate-y-1/2 left-4 text-2xl rounded-full p-2 bg-black/20 text-white cursor-pointer">
          <ChevronLeft onClick={goToPrevious} className="w-6 h-6" />
        </div>
      )}

      {/* Right Arrow */}
      {images.length > 1 && (
        <div className="hidden group-hover:block absolute top-1/2 -translate-y-1/2 right-4 text-2xl rounded-full p-2 bg-black/20 text-white cursor-pointer">
          <ChevronRight onClick={goToNext} className="w-6 h-6" />
        </div>
      )}

      {/* Dots */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
          {images.map((_, slideIndex) => (
            <div
              key={slideIndex}
              onClick={() => goToSlide(slideIndex)}
              className={cn(
                "cursor-pointer w-3 h-3 rounded-full",
                slideIndex === currentIndex ? "bg-white" : "bg-white/50",
              )}
            />
          ))}
        </div>
      )}

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="absolute -bottom-16 left-0 right-0 flex gap-2 overflow-x-auto py-2">
          {images.map((image, index) => (
            <div
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                "cursor-pointer w-16 h-16 rounded-md overflow-hidden border-2",
                index === currentIndex ? "border-pink-500" : "border-transparent",
              )}
            >
              <img
                src={image || "/placeholder.svg"}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
