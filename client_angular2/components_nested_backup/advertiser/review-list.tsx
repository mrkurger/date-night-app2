import { Card, CardContent } from "@/components/ui/card"
import { Star } from "lucide-react"
import { UserReview } from "@/components/user-review"

interface Review {
  id: string | number
  user: string
  rating: number
  date: string
  comment: string
}

interface ReviewListProps {
  reviews: Review[]
  averageRating: number
}

export function ReviewList({ reviews, averageRating }: ReviewListProps) {
  // If no reviews, show a message
  if (!reviews || reviews.length === 0) {
    return (
      <Card className="bg-gray-800/50 border-gray-700">
        <CardContent className="p-4 text-center">
          <p className="text-gray-400">No reviews yet. Be the first to leave a review!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center">
          <Star className="h-6 w-6 text-yellow-500 mr-1" />
          <span className="text-2xl font-bold">{averageRating}</span>
        </div>
        <span className="text-gray-400">•</span>
        <span className="text-gray-300">{reviews.length} reviews</span>
      </div>

      {reviews.map((review) => (
        <UserReview key={review.id} review={review} />
      ))}
    </div>
  )
}
