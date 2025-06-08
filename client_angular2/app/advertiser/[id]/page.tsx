import AdvertiserDetailClient from './client';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdvertiserDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <AdvertiserDetailClient id={id} />;
}
