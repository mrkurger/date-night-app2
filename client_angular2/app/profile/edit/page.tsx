'use client';
import Image from 'next/image';

import * as React from 'react';
import { useState, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import EnhancedNavbar from '@/components/enhanced-navbar';
import { Footer } from '@/components/footer';
import { Upload, X, Plus, MapPin, Calendar, Heart, Star, Camera, ArrowLeft } from 'lucide-react';
import { getFemaleImageByIndex } from '@/lib/data';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  age: number;
  bio: string;
  location: string;
  occupation: string;
  education: string;
  height: string;
  bodyType: string;
  relationshipGoals: string;
  interests: string[];
  photos: string[];
  profilePicture: string;
  isVerified: boolean;
}

const mockProfile: UserProfile = {
  id: '1',
  name: 'Alexandra Johnson',
  email: 'alexandra.johnson@example.com',
  age: 28,
  bio: 'Adventure seeker, coffee enthusiast, and dog lover. Looking for someone to explore the world with!',
  location: 'Oslo, Norway',
  occupation: 'Software Developer',
  education: 'University of Oslo',
  height: '175 cm',
  bodyType: 'Athletic',
  relationshipGoals: 'Long-term relationship',
  interests: ['Travel', 'Photography', 'Hiking', 'Cooking', 'Music'],
  photos: [getFemaleImageByIndex(1), getFemaleImageByIndex(2), getFemaleImageByIndex(3)],
  profilePicture: getFemaleImageByIndex(1),
  isVerified: true,
};

const ProfileEditPage: React.FC = () => {
  const router = useRouter();
  const authContext = useContext(AuthContext);
  const [profile, setProfile] = useState<UserProfile>(mockProfile);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [newInterest, setNewInterest] = useState('');

  const handleSave = async () => {
    setIsLoading(true);
    setSuccessMessage(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      console.log('Saving profile:', profile);
      setSuccessMessage('Profile updated successfully!');

      // Auto-hide success message and redirect after 2 seconds
      setTimeout(() => {
        setSuccessMessage(null);
        router.push('/profile');
      }, 2000);
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = (field: keyof UserProfile, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const addInterest = () => {
    if (newInterest.trim() && !profile.interests.includes(newInterest.trim())) {
      updateProfile('interests', [...profile.interests, newInterest.trim()]);
      setNewInterest('');
    }
  };

  const removeInterest = (interest: string) => {
    updateProfile(
      'interests',
      profile.interests.filter(i => i !== interest),
    );
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = event => {
        const newPhoto = event.target?.result as string;
        updateProfile('photos', [...profile.photos, newPhoto]);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const removePhoto = (index: number) => {
    updateProfile(
      'photos',
      profile.photos.filter((_, i) => i !== index),
    );
  };

  const setAsProfilePicture = (photo: string) => {
    updateProfile('profilePicture', photo);
  };

  return (
    <>
      <EnhancedNavbar />
      <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
        <main className="max-w-4xl mx-auto">
          <header className="mb-8">
            <Button variant="ghost" onClick={() => router.back()} className="mb-4 -ml-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Profile
            </Button>
            <h1 className="text-4xl font-bold text-foreground mb-2">Edit Profile</h1>
            <p className="text-muted-foreground">
              Update your profile information to attract the right matches
            </p>
          </header>

          {successMessage && (
            <div className="mb-6 p-4 bg-primary/10 border border-primary/20 text-primary rounded-lg">
              {successMessage}
            </div>
          )}

          <div className="space-y-8">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Your essential profile details that others will see first
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profile.name}
                      onChange={e => updateProfile('name', e.target.value)}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      min="18"
                      max="100"
                      value={profile.age}
                      onChange={e => updateProfile('age', parseInt(e.target.value))}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="location">Location</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="location"
                        value={profile.location}
                        onChange={e => updateProfile('location', e.target.value)}
                        className="mt-2 pl-10"
                        placeholder="City, Country"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="occupation">Occupation</Label>
                    <Input
                      id="occupation"
                      value={profile.occupation}
                      onChange={e => updateProfile('occupation', e.target.value)}
                      className="mt-2"
                      placeholder="Your job title"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profile.bio}
                    onChange={e => updateProfile('bio', e.target.value)}
                    placeholder="Tell others about yourself..."
                    rows={4}
                    className="mt-2"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    {profile.bio.length}/500 characters
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Physical Attributes */}
            <Card>
              <CardHeader>
                <CardTitle>Physical Attributes</CardTitle>
                <CardDescription>
                  Optional details that help others get to know you better
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label htmlFor="height">Height</Label>
                    <Input
                      id="height"
                      value={profile.height}
                      onChange={e => updateProfile('height', e.target.value)}
                      className="mt-2"
                      placeholder="e.g., 175 cm"
                    />
                  </div>

                  <div>
                    <Label htmlFor="body-type">Body Type</Label>
                    <Select
                      value={profile.bodyType}
                      onValueChange={value => updateProfile('bodyType', value)}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Slim">Slim</SelectItem>
                        <SelectItem value="Athletic">Athletic</SelectItem>
                        <SelectItem value="Average">Average</SelectItem>
                        <SelectItem value="Curvy">Curvy</SelectItem>
                        <SelectItem value="Plus Size">Plus Size</SelectItem>
                        <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="education">Education</Label>
                    <Input
                      id="education"
                      value={profile.education}
                      onChange={e => updateProfile('education', e.target.value)}
                      className="mt-2"
                      placeholder="School or University"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="relationship-goals">Relationship Goals</Label>
                  <Select
                    value={profile.relationshipGoals}
                    onValueChange={value => updateProfile('relationshipGoals', value)}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Casual dating">Casual dating</SelectItem>
                      <SelectItem value="Long-term relationship">Long-term relationship</SelectItem>
                      <SelectItem value="Marriage">Marriage</SelectItem>
                      <SelectItem value="Friendship">Friendship</SelectItem>
                      <SelectItem value="Not sure yet">Not sure yet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Interests */}
            <Card>
              <CardHeader>
                <CardTitle>Interests & Hobbies</CardTitle>
                <CardDescription>
                  Add interests to help others find common ground with you
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest, index) => (
                    <Badge key={index} variant="secondary" className="text-sm">
                      {interest}
                      <button
                        onClick={() => removeInterest(interest)}
                        className="ml-2 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Input
                    value={newInterest}
                    onChange={e => setNewInterest(e.target.value)}
                    placeholder="Add an interest..."
                    onKeyPress={e => e.key === 'Enter' && addInterest()}
                  />
                  <Button onClick={addInterest} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Photos */}
            <Card>
              <CardHeader>
                <CardTitle>Photos</CardTitle>
                <CardDescription>
                  Add up to 6 photos to showcase your personality. Your first photo will be your
                  main profile picture.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {profile.photos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square rounded-lg overflow-hidden bg-muted relative">
                        <Image
                          src={photo}
                          alt={`Profile photo ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>

                      {/* Photo overlay controls */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                        {photo !== profile.profilePicture && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setAsProfilePicture(photo)}
                            className="text-xs"
                          >
                            <Star className="h-3 w-3 mr-1" />
                            Main
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removePhoto(index)}
                          className="text-xs"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>

                      {/* Main photo indicator */}
                      {photo === profile.profilePicture && (
                        <div className="absolute top-2 left-2">
                          <Badge variant="default" className="text-xs">
                            <Star className="h-3 w-3 mr-1" />
                            Main
                          </Badge>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Add photo button */}
                  {profile.photos.length < 6 && (
                    <label className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors cursor-pointer flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground">
                      <Camera className="h-8 w-8" />
                      <span className="text-sm font-medium">Add Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                <div className="text-sm text-muted-foreground">
                  <p>• Upload high-quality photos that show your face clearly</p>
                  <p>• Photos with genuine smiles get more matches</p>
                  <p>• Include photos that show your interests and lifestyle</p>
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end gap-4">
              <Button
                variant="outline"
                onClick={() => router.push('/profile')}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isLoading} className="min-w-[120px]">
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
};

export default ProfileEditPage;
