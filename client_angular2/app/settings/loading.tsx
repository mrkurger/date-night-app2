import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import EnhancedNavbar from '@/components/enhanced-navbar';
import { Footer } from '@/components/footer';

export default function SettingsLoading() {
  return (
    <>
      <EnhancedNavbar />
      <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
        <main className="max-w-4xl mx-auto">
          <header className="mb-8">
            <Skeleton className="h-10 w-48 mb-2" />
            <Skeleton className="h-5 w-96" />
          </header>

          {/* Tabs skeleton */}
          <div className="space-y-6">
            <div className="grid w-full grid-cols-4 gap-2">
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
            </div>

            {/* Card skeleton */}
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-96" />
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-4 w-4" />
                        <div>
                          <Skeleton className="h-4 w-32 mb-1" />
                          <Skeleton className="h-3 w-48" />
                        </div>
                      </div>
                      <Skeleton className="h-6 w-12" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
}
