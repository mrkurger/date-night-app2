import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import EnhancedNavbar from '@/components/enhanced-navbar';
import { Footer } from '@/components/footer';

export default function MatchesLoading() {
  return (
    <>
      <EnhancedNavbar />
      <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
        <main className="max-w-6xl mx-auto">
          <header className="mb-8">
            <Skeleton className="h-10 w-48 mb-2" />
            <Skeleton className="h-5 w-64" />
          </header>

          {/* Search and Filter skeleton */}
          <div className="mb-6 flex gap-4">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-24" />
          </div>

          {/* Statistics skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4 text-center">
                  <Skeleton className="h-8 w-12 mx-auto mb-2" />
                  <Skeleton className="h-4 w-20 mx-auto" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Tabs skeleton */}
          <div className="mb-6">
            <div className="grid w-full grid-cols-4 gap-2 mb-6">
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
            </div>

            {/* Match cards skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="w-full h-48" />
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <Skeleton className="h-6 w-32 mb-1" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <div className="text-right">
                        <Skeleton className="h-4 w-12 mb-1" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                    
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-4 w-3/4 mb-3" />
                    
                    <div className="flex flex-wrap gap-1 mb-3">
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-5 w-20" />
                      <Skeleton className="h-5 w-14" />
                    </div>
                    
                    <div className="flex items-center justify-between mb-4">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                    
                    <div className="flex gap-2">
                      <Skeleton className="h-8 flex-1" />
                      <Skeleton className="h-8 w-8" />
                      <Skeleton className="h-8 w-8" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
}
