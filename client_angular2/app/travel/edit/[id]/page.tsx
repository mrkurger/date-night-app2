'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';
import { Itinerary } from '@/services/travel-service';
import EnhancedNavbar from '@/components/enhanced-navbar';
import { Footer } from '@/components/footer';
import { useAuth } from '@/hooks/use-auth';

// Define form schema with Zod
const itineraryFormSchema = z.object({
  destination: z.object({
    city: z.string().min(2, 'City is required'),
    county: z.string().min(2, 'County is required'),
  }),
  dates: z
    .object({
      arrival: z.date({ required_error: 'Arrival date is required' }),
      departure: z.date({ required_error: 'Departure date is required' }),
    })
    .refine(data => data.departure > data.arrival, {
      message: 'Departure date must be after arrival date',
      path: ['departure'],
    }),
  notes: z.string().max(1000).optional(),
  includeAccommodation: z.boolean().default(false),
  accommodation: z
    .object({
      name: z.string().min(2, 'Accommodation name is required').optional(),
      address: z.string().min(5, 'Accommodation address is required').optional(),
    })
    .optional(),
});

type ItineraryFormValues = z.infer<typeof itineraryFormSchema>;

export default function EditItineraryPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const params = useParams();
  const itineraryId = params.id as string;

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [includeAccommodation, setIncludeAccommodation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [adId, setAdId] = useState<string>('');

  // Initialize react-hook-form with empty values initially
  const form = useForm<ItineraryFormValues>({
    resolver: zodResolver(itineraryFormSchema),
    defaultValues: {
      destination: {
        city: '',
        county: '',
      },
      dates: {
        arrival: new Date(),
        departure: new Date(new Date().setDate(new Date().getDate() + 1)),
      },
      notes: '',
      includeAccommodation: false,
    },
  });

  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated) {
      router.push(`/login?redirect=/travel/edit/${itineraryId}`);
      return;
    }

    // Fetch itinerary data
    fetchItineraryData();
  }, [isAuthenticated, itineraryId, router]);

  const fetchItineraryData = async () => {
    try {
      setIsLoading(true);

      // For now, we'll use a default ad ID, but in a full implementation
      // this would come from a query param or context
      const tempAdId = 'ad1';
      setAdId(tempAdId);

      try {
        // Real API call to get the itinerary data
        const itineraryData = await TravelService.getItineraryById(tempAdId, itineraryId);

        // Set state
        setItinerary(itineraryData);

        // Set form values
        form.reset({
          destination: {
            city: itineraryData.destination.city,
            county: itineraryData.destination.county,
          },
          dates: {
            arrival: new Date(itineraryData.arrivalDate),
            departure: new Date(itineraryData.departureDate),
          },
          notes: itineraryData.notes || '',
          includeAccommodation: !!itineraryData.accommodation,
          accommodation: itineraryData.accommodation,
        });

        // Update accommodation toggle
        setIncludeAccommodation(!!itineraryData.accommodation);
      } catch (apiError) {
        console.error('API Error fetching itinerary:', apiError);

        // Fallback to mock data if API call fails
        const mockItinerary: Itinerary = {
          id: itineraryId,
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
          notes: 'Meeting with several clients in Oslo center',
          accommodation: {
            name: 'Grand Hotel Oslo',
            address: 'Karl Johans gate 31, 0159 Oslo',
          },
        };

        // Set state with mock data
        setItinerary(mockItinerary);

        // Set form values with mock data
        form.reset({
          destination: {
            city: mockItinerary.destination.city,
            county: mockItinerary.destination.county,
          },
          dates: {
            arrival: new Date(mockItinerary.arrivalDate),
            departure: new Date(mockItinerary.departureDate),
          },
          notes: mockItinerary.notes || '',
          includeAccommodation: !!mockItinerary.accommodation,
          accommodation: mockItinerary.accommodation,
        });

        // Update accommodation toggle with mock data
        setIncludeAccommodation(!!mockItinerary.accommodation);

        console.warn('Using mock data due to API error');
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching itinerary:', error);
      setSubmitError('Failed to load itinerary data');
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: ItineraryFormValues) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Prepare data for submission
      const updateData = {
        destination: {
          city: data.destination.city,
          county: data.destination.county,
          location: {
            coordinates: itinerary?.destination.location.coordinates || [0, 0],
          },
        },
        arrivalDate: data.dates.arrival.toISOString(),
        departureDate: data.dates.departure.toISOString(),
        notes: data.notes || '',
        accommodation:
          data.includeAccommodation && data.accommodation
            ? {
                name: data.accommodation.name,
                address: data.accommodation.address,
              }
            : undefined,
      };

      console.log('Updating itinerary data:', updateData);

      // Make the real API call to update the itinerary
      await TravelService.updateItinerary(adId, itineraryId, updateData);

      // Redirect to the itinerary list after successful update
      router.push(`/travel?adId=${adId}&updated=true`);
    } catch (error) {
      console.error('Error updating itinerary:', error);
      setSubmitError('An error occurred while updating the itinerary. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAccommodationToggle = (checked: boolean) => {
    setIncludeAccommodation(checked);
    form.setValue('includeAccommodation', checked);

    if (!checked) {
      form.resetField('accommodation');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <EnhancedNavbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center h-full">
            <Loader2 className="h-12 w-12 animate-spin text-gray-400" />
            <p className="mt-4 text-gray-500">Loading itinerary data...</p>
          </div>
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
          <Alert variant="destructive" className="max-w-3xl mx-auto">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Could not load the itinerary data. It may have been deleted or you may not have
              permission to view it.
              <div className="mt-4">
                <Link href="/travel">
                  <Button variant="outline">Return to Travel Page</Button>
                </Link>
              </div>
            </AlertDescription>
          </Alert>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <EnhancedNavbar />

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Edit Travel Itinerary</h1>
          <p className="text-gray-600 mt-2">
            Update your travel plans for {itinerary.destination.city},{' '}
            {itinerary.destination.county}
          </p>
        </div>

        <Alert className="mb-6 bg-blue-50 border-blue-200">
          <InfoIcon className="h-4 w-4 text-blue-500" />
          <AlertTitle className="text-blue-800">Update Your Travel Plan</AlertTitle>
          <AlertDescription className="text-blue-700">
            Make changes to your itinerary details as needed.
          </AlertDescription>
        </Alert>

        {submitError && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}

        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Edit Travel Itinerary</CardTitle>
            <CardDescription>
              Update your travel details for {itinerary.destination.city}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Destination */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Destination</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="destination.city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="destination.county"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>County</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Dates */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Travel Dates</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="dates.arrival"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Arrival Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={'outline'}
                                  className={cn(
                                    'w-full pl-3 text-left font-normal',
                                    !field.value && 'text-muted-foreground',
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, 'PPP')
                                  ) : (
                                    <span>Select arrival date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={date => date < new Date()}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="dates.departure"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Departure Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={'outline'}
                                  className={cn(
                                    'w-full pl-3 text-left font-normal',
                                    !field.value && 'text-muted-foreground',
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, 'PPP')
                                  ) : (
                                    <span>Select departure date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={date => {
                                  const arrival = form.getValues('dates.arrival');
                                  return date < new Date() || (arrival && date <= arrival);
                                }}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Notes */}
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Any additional details about your travel plans..."
                          className="resize-y"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        This information will be visible to potential clients.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Accommodation Toggle */}
                <FormField
                  control={form.control}
                  name="includeAccommodation"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Include Accommodation Details</FormLabel>
                        <FormDescription>Add details about where you&apos;ll be staying</FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={checked => {
                            field.onChange(checked);
                            handleAccommodationToggle(checked);
                          }}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Accommodation Details (conditional) */}
                {includeAccommodation && (
                  <div className="space-y-4 p-4 rounded-lg border">
                    <h3 className="text-lg font-medium">Accommodation Details</h3>
                    <FormField
                      control={form.control}
                      name="accommodation.name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Accommodation Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Hotel name or type of accommodation" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="accommodation.address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Input placeholder="Street address, city, postal code" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                <div className="pt-4 flex justify-end space-x-4">
                  <Link href="/travel">
                    <Button variant="outline" type="button">
                      Cancel
                    </Button>
                  </Link>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-pink-600 hover:bg-pink-700 text-white"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
