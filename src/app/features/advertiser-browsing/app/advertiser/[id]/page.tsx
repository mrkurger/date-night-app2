import { notFound } from 'next/navigation';
import { AdvertiserProfile } from '@/components/advertiser/advertiser-profile';
import { getAdvertiserById } from '@/lib/data';
import React from 'react';

interface PageProps<T> {
  params: T;
}

export default function AdvertiserDetailPage({
  params,
}: PageProps<{ id: string }>): React.JSX.Element {
  const advertiser = getAdvertiserById(params.id);

  if (!advertiser) {
    notFound();
  }

  return <AdvertiserProfile advertiser={advertiser} />;
}
