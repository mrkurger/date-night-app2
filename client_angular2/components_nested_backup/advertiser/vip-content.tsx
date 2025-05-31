"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Lock } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import Link from "next/link"

export function VipContent() {
  const { user } = useAuth()
  const isVipMember = user?.isVipMember

  if (!isVipMember) {
    return (
      <Card className="bg-gradient-to-r from-yellow-800 to-amber-700 border-amber-500">
        <CardContent className="p-4 text-center">
          <Lock className="h-8 w-8 mx-auto mb-2 text-amber-300" />
          <h3 className="text-lg font-bold mb-2">VIP Content Locked</h3>
          <p className="mb-4 text-sm">
            This content is only available to VIP members. Upgrade your membership to access exclusive photos, videos,
            and more.
          </p>
          <Button asChild className="w-full bg-amber-500 hover:bg-amber-600 text-black">
            <Link href="/upgrade">Upgrade to VIP</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold">VIP Content</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="aspect-square overflow-hidden rounded-md">
            <img
              src={`/placeholder.svg?height=300&width=300&text=VIP+Content+${index + 1}`}
              alt={`VIP Content ${index + 1}`}
              className="object-cover w-full h-full"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
