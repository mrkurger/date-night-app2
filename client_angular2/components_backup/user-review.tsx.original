import { Star } from "lucide-react"
import { ProfileAvatar } from "@/components/profile-avatar"
import { Card, CardContent } from "@/components/ui/card"

interface UserReviewProps {
  review: {
    id: string | number
    user: string
    rating: number
    date: string
    comment: string
    userImage?: string
  }
}

export function UserReview({ review }: UserReviewProps) {
  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardContent className="p-4">
        <div className="flex items-start gap-3 mb-2">
          <ProfileAvatar src={review.userImage} name={review.user} size="sm" />
          <div className="flex-1 min-w-0">
            <h4 className="font-medium">{review.user}</h4>
            <p className="text-xs text-gray-400">{review.date}</p>
          </div>
          <div className="flex items-center">
            <Star className="h-4 w-4 text-yellow-500 mr-1" />
            <span>{review.rating}</span>
          </div>
        </div>
        <p className="text-sm text-gray-300">{review.comment}</p>
      </CardContent>
    </Card>
  )
}
