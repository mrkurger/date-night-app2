import { notFound } from 'next/navigation';
import { AdvertiserProfile } from '@/components/advertiser/advertiser-profile';
import { getAdvertiserById } from '@/lib/data';
import React from 'react';

interface PageProps<T> {
  params: Promise<T>;
}

export default async function AdvertiserDetailPage({ params }: PageProps<{ id: string }>): Promise<React.JSX.Element> {
  const resolvedParams = await params;
  const advertiser = getAdvertiserById(resolvedParams.id);

  if (!advertiser) {
    notFound();
  }

  return <AdvertiserProfile advertiser={advertiser} />;
}
