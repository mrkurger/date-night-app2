"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface ImageCarouselProps {
  images: string[]
  className?: string
  showDots?: boolean
}

export default function ImageCarousel({ images, className, showDots = true }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  // Default image if no images are provided
  if (!images || images.length === 0) {
    images = ["/placeholder.svg?height=400&width=300&text=No+Image"]
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
    <div className={cn("relative w-full h-full group", className)}>
      <div className="w-full h-full overflow-hidden">
        <div
          className="w-full h-full bg-center bg-cover duration-500"
          style={{ backgroundImage: `url(${images[currentIndex]})` }}
        />
      </div>

      {/* Left Arrow */}
      {images.length > 1 && (
        <div className="hidden group-hover:block absolute top-1/2 -translate-y-1/2 left-2 text-2xl rounded-full p-2 bg-black/20 text-white cursor-pointer">
          <ChevronLeft onClick={goToPrevious} className="w-5 h-5" />
        </div>
      )}

      {/* Right Arrow */}
      {images.length > 1 && (
        <div className="hidden group-hover:block absolute top-1/2 -translate-y-1/2 right-2 text-2xl rounded-full p-2 bg-black/20 text-white cursor-pointer">
          <ChevronRight onClick={goToNext} className="w-5 h-5" />
        </div>
      )}

      {/* Dots */}
      {showDots && images.length > 1 && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
          {images.map((_, slideIndex) => (
            <div
              key={slideIndex}
              onClick={() => goToSlide(slideIndex)}
              className={cn(
                "cursor-pointer w-2 h-2 rounded-full",
                slideIndex === currentIndex ? "bg-white" : "bg-white/50",
              )}
            />
          ))}
        </div>
      )}
    </div>
  )
}
