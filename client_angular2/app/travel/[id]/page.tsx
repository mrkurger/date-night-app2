'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  AlertCircle,
  Calendar,
  MapPin,
  Clock,
  Pencil,
  Trash2,
  ArrowLeft,
  Building,
  Globe,
  Share2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import EnhancedNavbar from '@/components/enhanced-navbar';
import { Footer } from '@/components/footer';
import { useAuth } from '@/hooks/use-auth';
import { TravelService, Itinerary } from '@/services/travel-service';
import dynamic from 'next/dynamic';

// Dynamically import the Map component to avoid SSR issues
const Map = dynamic(() => import('@/components/map'), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] w-full">
      <Skeleton className="h-full w-full rounded-md" />
    </div>
  ),
});

export default function ItineraryDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [adId, setAdId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/travel/${id}`);
      return;
    }

    fetchItinerary();
  }, [isAuthenticated, id]);

  const fetchItinerary = async () => {
    try {
      setIsLoading(true);

      // In a real implementation, we would get the ad ID from the itinerary
      // For now, we'll use a default ad ID
      // This would be improved in a full implementation by storing the ad ID in state
      // when navigating from the itinerary list
      const tempAdId = 'ad1';
      setAdId(tempAdId);

      try {
        // Real API call
        const itineraryData = await TravelService.getItineraryById(tempAdId, id as string);
        setItinerary(itineraryData);
      } catch (apiError: any) {
        console.error('API Error:', apiError);

        // Fallback to mock data if API call fails
        const mockItinerary: Itinerary = {
          id: id as string,
          destination: {
            city: 'Oslo',
            county: 'Oslo',
            location: {
              coordinates: [10.7522, 59.9139], // [longitude, latitude]
            },
          },
          arrivalDate: '2025-06-15T12:00:00Z',
          departureDate: '2025-06-20T12:00:00Z',
          status: 'planned',
          notes:
            'Meeting with several clients in Oslo center. Available for bookings daily from 10 AM to 10 PM.',
          accommodation: {
            name: 'Grand Hotel Oslo',
            address: 'Karl Johans gate 31, 0159 Oslo',
          },
        };

        setItinerary(mockItinerary);
        console.warn('Using mock data due to API error:', apiError.message);
      }

      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching itinerary:', err);
      setError('Unable to load itinerary details. Please try again later.');
      setIsLoading(false);
    }
  };

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleCancelItinerary = async () => {
    if (!itinerary || !adId) return;

    try {
      // Real API call to cancel the itinerary
      await TravelService.cancelItinerary(adId, itinerary.id);
      router.push('/travel?cancelled=true');
    } catch (err) {
      console.error('Error cancelling itinerary:', err);
      setError('Failed to cancel itinerary. Please try again.');
    }
  };

  const formatDateRange = (arrival: string, departure: string) => {
    const arrivalDate = new Date(arrival);
    const departureDate = new Date(departure);

    return `${arrivalDate.toLocaleDateString()} - ${departureDate.toLocaleDateString()}`;
  };

  const calculateDuration = (arrival: string, departure: string) => {
    const arrivalDate = new Date(arrival);
    const departureDate = new Date(departure);
    const diffTime = Math.abs(departureDate.getTime() - arrivalDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'planned':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'active':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'completed':
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const getMapMarker = () => {
    if (!itinerary) return [];

    return [
      {
        id: itinerary.id,
        position: itinerary.destination.location.coordinates,
        popup: `<strong>${itinerary.destination.city}, ${itinerary.destination.county}</strong><br/>
        ${formatDateRange(itinerary.arrivalDate, itinerary.departureDate)}`,
        status: itinerary.status,
      },
    ];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <EnhancedNavbar />

        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="flex items-center mb-6">
            <Skeleton className="h-6 w-32 mr-2" />
            <Skeleton className="h-6 w-64" />
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <div className="h-[400px] w-full">
                <Skeleton className="h-full w-full rounded-md" />
              </div>
            </CardContent>
          </Card>
        </main>

        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <EnhancedNavbar />

        <main className="flex-grow container mx-auto px-4 py-8">
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button variant="outline" onClick={() => router.push('/travel')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Itineraries
          </Button>
        </main>

        <Footer />
      </div>
    );
  }

  if (!itinerary) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <EnhancedNavbar />

        <main className="flex-grow container mx-auto px-4 py-8">
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Itinerary not found.</AlertDescription>
          </Alert>
          <Button variant="outline" onClick={() => router.push('/travel')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Itineraries
          </Button>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <EnhancedNavbar />

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
          <div className="flex items-center mb-4 sm:mb-0">
            <Button variant="outline" size="sm" onClick={() => router.push('/travel')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 ml-4">Itinerary Details</h1>
          </div>

          <div className="flex space-x-2">
            <Link href={`/travel/edit/${id}`}>
              <Button size="sm" variant="outline" className="flex items-center gap-2">
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
            </Link>

            {itinerary.status === 'planned' && (
              <Button
                size="sm"
                variant="outline"
                className="flex items-center gap-2 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 hover:bg-red-50"
                onClick={handleCancelItinerary}
              >
                <Trash2 className="h-4 w-4" />
                Cancel Itinerary
              </Button>
            )}

            <Button
              size="sm"
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => {
                // Share functionality would be implemented here
                alert('Share functionality will be implemented in a future update.');
              }}
            >
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          </div>
        </div>

        <Card className="mb-8">
          <CardHeader className="pb-2">
            <div className="flex flex-wrap justify-between items-start gap-4">
              <div>
                <CardTitle className="text-2xl">
                  {itinerary.destination.city}, {itinerary.destination.county}
                </CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4" />
                  {formatDateRange(itinerary.arrivalDate, itinerary.departureDate)}
                  <span className="mx-1">•</span>
                  <Clock className="h-4 w-4" />
                  {calculateDuration(itinerary.arrivalDate, itinerary.departureDate)}
                </CardDescription>
              </div>
              <Badge className={getStatusBadgeColor(itinerary.status)} variant="secondary">
                {itinerary.status.charAt(0).toUpperCase() + itinerary.status.slice(1)}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {itinerary.notes && (
              <div className="space-y-2">
                <h3 className="font-medium text-gray-900">Notes</h3>
                <p className="text-gray-700">{itinerary.notes}</p>
              </div>
            )}

            {itinerary.accommodation && (
              <div className="bg-gray-50 p-4 rounded-md space-y-2">
                <h3 className="font-medium text-gray-900 flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Accommodation
                </h3>
                <p className="font-medium">{itinerary.accommodation.name}</p>
                <p className="text-gray-600 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {itinerary.accommodation.address}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <h3 className="font-medium text-gray-900 flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Location
              </h3>
              <div className="h-[400px] w-full rounded-md overflow-hidden">
                <Map
                  center={itinerary.destination.location.coordinates}
                  zoom={12}
                  markers={getMapMarker()}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
