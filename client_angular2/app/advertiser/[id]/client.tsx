'use client';

import EnhancedNavbar from '@/components/enhanced-navbar';
import { AdvertiserDetailWrapper } from './wrapper';

interface AdvertiserDetailClientProps {
  id: string;
}

export default function AdvertiserDetailClient({ id }: AdvertiserDetailClientProps) {
  return (
    <>
      <EnhancedNavbar />
      <AdvertiserDetailWrapper id={id} />
    </>
  );
}
