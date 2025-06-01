'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Star } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';

export function VipContent() {
  const { user } = useAuth();
  const isVipMember = user?.isVipMember;

  if (isVipMember) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center">
          <Star className="h-5 w-5 text-yellow-500 mr-2 fill-yellow-500" />
          VIP Content
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(index => (
            <div key={index} className="aspect-square rounded-md overflow-hidden relative group">
              <Image
                src={`/placeholder.svg?height=300&width=300&text=VIP+Content+${index}`}
                alt={`VIP Content ${index}`}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <Card className="bg-gradient-to-r from-amber-900/50 to-yellow-800/50 border-amber-500/50">
      <CardContent className="p-6 text-center">
        <div className="bg-amber-500/20 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <Lock className="h-8 w-8 text-amber-500" />
        </div>
        <h3 className="text-xl font-bold mb-2">VIP Content Locked</h3>
        <p className="mb-4 text-gray-300">
          Upgrade to VIP membership to access exclusive photos, videos, and special offers from this
          advertiser.
        </p>
        <Button asChild className="bg-amber-500 hover:bg-amber-600 text-black">
          <Link href="/upgrade">Upgrade to VIP</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
