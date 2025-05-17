import { notFound } from "next/navigation"
import { AdvertiserProfile } from "@/components/advertiser/advertiser-profile"
import { getAdvertiserById } from "@/lib/data"

export default function AdvertiserDetailPage({ params }: { params: { id: string } }) {
  const advertiser = getAdvertiserById(params.id)

  if (!advertiser) {
    notFound()
  }

  return <AdvertiserProfile advertiser={advertiser} />
}
