"use client"

import { AdvertiserDetailWrapper } from "./wrapper"

export default function AdvertiserDetailClient({ id }: { id: string }) {
  return <AdvertiserDetailWrapper id={id} />
}
