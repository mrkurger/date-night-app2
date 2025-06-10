'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  AlertCircle,
  Calendar,
  MapPin,
  Clock,
  Pencil,
  Trash2,
  CalendarCheck,
  Eye,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TravelService } from '@/services/travel-service';
import type { TravelItinerary } from './travel-types.d';

interface ItineraryListProps {
  isLoading?: boolean;
  adId?: string;
}

export default function ItineraryList({ isLoading = false, adId }: ItineraryListProps) {
  const [itineraries, setItineraries] = useState<TravelItinerary[]>([]);
  const [filteredItineraries, setFilteredItineraries] = useState<TravelItinerary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date-asc');

  const fetchItineraries = useCallback(async () => {
    try {
      setError(null);
      let fetchedItineraries: any[] = [];

      try {
        if (adId) {
          // If adId is provided, get itineraries for this specific ad
          fetchedItineraries = await TravelService.getItinerariesByAdId(adId);
        } else {
          // Otherwise get all itineraries for the user
          fetchedItineraries = await TravelService.getAllItineraries();
        }

        // Type assertion to ensure correct typing
        setItineraries(fetchedItineraries as TravelItinerary[]);
      } catch (apiError) {
        console.error('API error:', apiError);
        setError('Failed to load itineraries from the server. Using mock data instead.');

        // Fallback to mock data if API call fails
        const mockItineraries: TravelItinerary[] = [
          {
            id: '1',
            destination: {
              city: 'Oslo',
              county: 'Oslo',
              location: {
                coordinates: [10.7522, 59.9139] as [number, number],
              },
            },
            arrivalDate: '2025-06-15T12:00:00Z',
            departureDate: '2025-06-20T12:00:00Z',
            status: 'planned',
            notes: 'Meeting with several clients in Oslo center',
          },
          {
            id: '2',
            destination: {
              city: 'Bergen',
              county: 'Vestland',
              location: {
                coordinates: [5.3221, 60.3913] as [number, number],
              },
            },
            arrivalDate: '2025-06-22T12:00:00Z',
            departureDate: '2025-06-28T12:00:00Z',
            status: 'planned',
            accommodation: {
              name: 'Hotel Norge',
              address: 'Nedre Ole Bulls plass 4, 5012 Bergen',
            },
          },
          {
            id: '3',
            destination: {
              city: 'Trondheim',
              county: 'Trøndelag',
              location: {
                coordinates: [10.3951, 63.4305] as [number, number],
              },
            },
            arrivalDate: '2025-07-01T12:00:00Z',
            departureDate: '2025-07-07T12:00:00Z',
            status: 'planned',
          },
        ];

        setItineraries(mockItineraries);
      }
    } catch (err) {
      console.error('Error fetching itineraries:', err);
      setError('Unable to load travel itineraries. Please try again later.');
    }
  }, [adId]);

  const filterAndSortItineraries = useCallback(() => {
    // First filter by status
    let filtered = [...itineraries];
    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.status === statusFilter);
    }

    // Then sort
    switch (sortBy) {
      case 'date-asc':
        filtered.sort(
          (a, b) => new Date(a.arrivalDate).getTime() - new Date(b.arrivalDate).getTime(),
        );
        break;
      case 'date-desc':
        filtered.sort(
          (a, b) => new Date(b.arrivalDate).getTime() - new Date(a.arrivalDate).getTime(),
        );
        break;
      case 'city-asc':
        filtered.sort((a, b) => a.destination.city.localeCompare(b.destination.city));
        break;
      case 'city-desc':
        filtered.sort((a, b) => b.destination.city.localeCompare(a.destination.city));
        break;
      default:
        // Default to date ascending
        filtered.sort(
          (a, b) => new Date(a.arrivalDate).getTime() - new Date(b.arrivalDate).getTime(),
        );
        break;
    }

    setFilteredItineraries(filtered);
  }, [itineraries, statusFilter, sortBy]);

  useEffect(() => {
    if (!isLoading) {
      fetchItineraries();
    }
  }, [isLoading, fetchItineraries]);

  useEffect(() => {
    filterAndSortItineraries();
  }, [filterAndSortItineraries, itineraries, statusFilter, sortBy]);

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

  const isUpcoming = (arrivalDate: string) => {
    return new Date(arrivalDate) > new Date();
  };

  const handleCancelItinerary = async (itineraryId: string) => {
    if (!adId) return;

    if (confirm('Are you sure you want to cancel this itinerary?')) {
      try {
        await TravelService.cancelItinerary(adId, itineraryId);
        // After successful cancellation, refresh the list
        fetchItineraries();
      } catch (err) {
        console.error('Error cancelling itinerary:', err);
        alert('Failed to cancel itinerary. Please try again.');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        {[1, 2, 3].map(i => (
          <Card key={i} className="mb-4">
            <CardHeader className="pb-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <h2 className="text-2xl font-semibold text-gray-800">Your Travel Plans</h2>

        <div className="flex flex-col sm:flex-row gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="planned">Planned</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date-asc">Date (Earliest First)</SelectItem>
              <SelectItem value="date-desc">Date (Latest First)</SelectItem>
              <SelectItem value="city-asc">City (A-Z)</SelectItem>
              <SelectItem value="city-desc">City (Z-A)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredItineraries.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-lg border border-gray-100">
          <CalendarCheck className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No travel plans found</h3>
          <p className="mt-2 text-sm text-gray-500">
            You haven&apos;t created any itineraries yet or none match your filter.
          </p>
          <div className="mt-6">
            <Link href="/travel/create">
              <Button>Create New Itinerary</Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredItineraries.map(itinerary => (
            <Card key={itinerary.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex flex-wrap justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">
                      {itinerary.destination.city}, {itinerary.destination.county}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDateRange(itinerary.arrivalDate, itinerary.departureDate)}
                      <span className="mx-1">•</span>
                      <Clock className="h-3.5 w-3.5" />
                      {calculateDuration(itinerary.arrivalDate, itinerary.departureDate)}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusBadgeColor(itinerary.status)}>
                    {itinerary.status.charAt(0).toUpperCase() + itinerary.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="pb-2">
                {itinerary.notes && (
                  <p className="text-gray-600 text-sm line-clamp-2 mb-2">{itinerary.notes}</p>
                )}

                {itinerary.accommodation && (
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <MapPin className="h-3.5 w-3.5 mt-0.5" />
                    <span>
                      Staying at <span className="font-medium">{itinerary.accommodation.name}</span>
                    </span>
                  </div>
                )}
              </CardContent>

              <Separator />

              <CardFooter className="pt-3 pb-3 flex justify-between">
                <Link href={`/travel/${itinerary.id}`}>
                  <Button size="sm" variant="outline" className="text-sm">
                    <Eye className="h-3.5 w-3.5 mr-1" /> View Details
                  </Button>
                </Link>

                <div className="flex gap-2">
                  <Link href={`/travel/edit/${itinerary.id}`}>
                    <Button size="sm" variant="outline" className="text-sm">
                      <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                    </Button>
                  </Link>

                  {isUpcoming(itinerary.arrivalDate) && itinerary.status === 'planned' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-sm text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 hover:bg-red-50"
                      onClick={() => handleCancelItinerary(itinerary.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" /> Cancel
                    </Button>
                  )}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
