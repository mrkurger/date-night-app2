import AdvertiserDetailClient from "./client"

export default function AdvertiserDetailPage({ params }: { params: { id: string } }) {
  return <AdvertiserDetailClient id={params.id} />
}
