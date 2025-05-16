"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Star, ThumbsUp, Flag } from "lucide-react"

interface Review {
  id: string
  user: string
  rating: number
  comment: string
  date: string
}

interface ReviewListProps {
  reviews: Review[]
  averageRating: number
}

export function ReviewList({ reviews, averageRating }: ReviewListProps) {
  const [sortBy, setSortBy] = useState<"recent" | "highest" | "lowest">("recent")
  const [page, setPage] = useState(1)
  const reviewsPerPage = 5

  // Sort reviews based on selected option
  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortBy === "recent") {
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    } else if (sortBy === "highest") {
      return b.rating - a.rating
    } else {
      return a.rating - b.rating
    }
  })

  // Paginate reviews
  const paginatedReviews = sortedReviews.slice(0, page * reviewsPerPage)
  const hasMoreReviews = paginatedReviews.length < sortedReviews.length

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-5 w-5 ${star <= averageRating ? "text-yellow-500 fill-yellow-500" : "text-gray-400"}`}
                />
              ))}
            </div>
            <span className="font-bold text-lg">{averageRating.toFixed(1)}</span>
            <span className="text-gray-400">({reviews.length} reviews)</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Sort by:</span>
          <div className="flex gap-1">
            <Button
              variant={sortBy === "recent" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy("recent")}
              className={sortBy === "recent" ? "bg-pink-600 hover:bg-pink-700" : ""}
            >
              Recent
            </Button>
            <Button
              variant={sortBy === "highest" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy("highest")}
              className={sortBy === "highest" ? "bg-pink-600 hover:bg-pink-700" : ""}
            >
              Highest
            </Button>
            <Button
              variant={sortBy === "lowest" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy("lowest")}
              className={sortBy === "lowest" ? "bg-pink-600 hover:bg-pink-700" : ""}
            >
              Lowest
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {paginatedReviews.length > 0 ? (
          paginatedReviews.map((review) => (
            <Card key={review.id} className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>{review.user.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{review.user}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${
                                star <= review.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-400"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-400">{new Date(review.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="mt-3 text-gray-300">{review.comment}</p>
                <div className="flex justify-end mt-2 gap-2">
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    Helpful
                  </Button>
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                    <Flag className="h-4 w-4 mr-1" />
                    Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-400">No reviews yet</p>
          </div>
        )}

        {hasMoreReviews && (
          <div className="text-center mt-4">
            <Button variant="outline" onClick={() => setPage(page + 1)}>
              Load More Reviews
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
