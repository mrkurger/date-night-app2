'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, MapPin, Loader2 } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';
import EnhancedNavbar from '@/components/enhanced-navbar';
import { Footer } from '@/components/footer';
import { useAuth } from '@/hooks/use-auth';
import { GeocodingService } from '@/services/geocoding-service';
import { TravelService } from '@/services/travel-service';

// Define form schema with Zod
const itineraryFormSchema = z.object({
  destination: z.object({
    city: z.string().min(2, 'City is required'),
    county: z.string().min(2, 'County is required'),
    coordinates: z
      .tuple([
        z.number().min(-180).max(180), // longitude
        z.number().min(-90).max(90), // latitude
      ])
      .optional(),
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
  adId: z.string().min(1, 'Ad ID is required'),
});

type ItineraryFormValues = z.infer<typeof itineraryFormSchema>;

export default function CreateItineraryPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [includeAccommodation, setIncludeAccommodation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userAds, setUserAds] = useState<{ id: string; title: string }[]>([]);
  const [selectedAdId, setSelectedAdId] = useState<string>('');

  // Initial form values
  const defaultValues: Partial<ItineraryFormValues> = {
    destination: {
      city: '',
      county: '',
    },
    notes: '',
    includeAccommodation: false,
    adId: searchParams.get('adId') || '',
  };

  // Initialize react-hook-form
  const form = useForm<ItineraryFormValues>({
    resolver: zodResolver(itineraryFormSchema),
    defaultValues,
  });

  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated) {
      router.push('/login?redirect=/travel/create');
      return;
    }

    // Fetch user's ads
    fetchUserAds();

    // Pre-populate adId from URL if provided
    const adIdFromUrl = searchParams.get('adId');
    if (adIdFromUrl) {
      setSelectedAdId(adIdFromUrl);
      form.setValue('adId', adIdFromUrl);
    }
  }, [isAuthenticated, router, searchParams]);

  const fetchUserAds = async () => {
    try {
      // In a real implementation, we would fetch the user's ads from the API
      // This could be via a dedicated endpoint or by extracting from user profile data
      // For now we'll use mock data but without the setTimeout
      const mockAds = [
        { id: 'ad1', title: 'Oslo Escort Service' },
        { id: 'ad2', title: 'Bergen Massage Services' },
        { id: 'ad3', title: 'Trondheim Premium Services' },
      ];
      setUserAds(mockAds);

      // If no adId was provided in URL but we have ads, select the first one by default
      if (!searchParams.get('adId') && mockAds.length > 0) {
        setSelectedAdId(mockAds[0].id);
        form.setValue('adId', mockAds[0].id);
      }
    } catch (error) {
      console.error('Error fetching user ads:', error);
      setSubmitError('Failed to load advertisements. Please try again.');
    }
  };

  const onSubmit = async (data: ItineraryFormValues) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      let coordinates = data.destination.coordinates;

      // If no coordinates are provided, try to geocode the address
      if (!coordinates) {
        try {
          const addressToGeocode = `${data.destination.city}, ${data.destination.county}`;

          if (data.includeAccommodation && data.accommodation?.address) {
            // Use accommodation address for more precise geocoding if available
            const geocodeResult = await GeocodingService.geocode(data.accommodation.address);
            coordinates = geocodeResult.coordinates;
          } else {
            // Use city and county for geocoding
            const geocodeResult = await GeocodingService.geocode(addressToGeocode);
            coordinates = geocodeResult.coordinates;
          }
        } catch (geocodeError) {
          console.error('Geocoding error:', geocodeError);
          // Fall back to default coordinates if geocoding fails
          coordinates = [0, 0];
        }
      }

      // Prepare the data to match backend schema
      const itineraryData = {
        destination: {
          city: data.destination.city,
          county: data.destination.county,
          location: {
            coordinates: coordinates,
          },
        },
        arrivalDate: data.dates.arrival.toISOString(),
        departureDate: data.dates.departure.toISOString(),
        notes: data.notes || '',
        status: 'planned',
        accommodation:
          data.includeAccommodation && data.accommodation
            ? {
                name: data.accommodation.name,
                address: data.accommodation.address,
              }
            : undefined,
      };

      console.log('Submitting itinerary data:', itineraryData);

      // Make actual API call to create itinerary
      try {
        // Real API integration
        const createdItinerary = await TravelService.createItinerary(data.adId, itineraryData);

        // Redirect to the itinerary list after successful creation
        router.push(`/travel?adId=${data.adId}&created=true`);
      } catch (apiError: any) {
        console.error('API Error:', apiError);
        setSubmitError(apiError.message || 'Failed to create itinerary. Please try again.');
      }
    } catch (error) {
      console.error('Error creating itinerary:', error);
      setSubmitError('An error occurred while creating the itinerary. Please try again.');
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <EnhancedNavbar />

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Create Travel Itinerary</h1>
          <p className="text-gray-600 mt-2">
            Let potential clients know when you&apos;ll be visiting their area
          </p>
        </div>

        <Alert className="mb-6 bg-blue-50 border-blue-200">
          <InfoIcon className="h-4 w-4 text-blue-500" />
          <AlertTitle className="text-blue-800">Create Your Travel Plan</AlertTitle>
          <AlertDescription className="text-blue-700">
            Enter the details of your upcoming travel. This will be visible to users searching in
            that location.
          </AlertDescription>
        </Alert>

        {submitError && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}

        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>New Travel Itinerary</CardTitle>
            <CardDescription>Create a new travel itinerary for your advertisement</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Ad Selection */}
                <div className="space-y-4">
                  <FormLabel>Select Advertisement</FormLabel>
                  {userAds.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                      {userAds.map(ad => (
                        <div key={ad.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={ad.id}
                            checked={selectedAdId === ad.id}
                            onCheckedChange={() => {
                              setSelectedAdId(ad.id);
                              form.setValue('adId', ad.id);
                            }}
                          />
                          <label
                            htmlFor={ad.id}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {ad.title}
                          </label>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Loading your advertisements...</p>
                  )}
                </div>

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
                            <Input placeholder="Oslo" {...field} />
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
                            <Input placeholder="Oslo" {...field} />
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
                        <FormDescription>
                          Add details about where you&apos;ll be staying
                        </FormDescription>
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
                    {isSubmitting ? 'Creating...' : 'Create Itinerary'}
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
