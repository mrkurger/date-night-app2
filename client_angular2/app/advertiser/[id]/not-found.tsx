import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AdvertiserNotFound() {
  return (
    <div className="container mx-auto py-16 px-4 text-center">
      <h1 className="text-3xl font-bold mb-4">Advertiser Not Found</h1>
      <p className="text-lg mb-8">
        Sorry, we couldn&apos;t find the advertiser you&apos;re looking for. They may have removed
        their profile or changed their information.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button asChild>
          <Link href="/">Browse Advertisers</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/search">Search</Link>
        </Button>
      </div>
    </div>
  );
}
