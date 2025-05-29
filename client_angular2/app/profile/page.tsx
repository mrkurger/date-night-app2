'use client';

import * as React from 'react';
import { useState, useContext } from 'react';
import { AuthContext } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import EnhancedNavbar from '@/components/enhanced-navbar';
import { Footer } from '@/components/footer';
import { MediaTicker } from '@/components/media-ticker';

const mockUser = {
  id: '1',
  name: 'Alex Johnson',
  email: 'alex.johnson@example.com',
  bio: 'Lover of adventure, coding, and good food. Always looking for the next challenge.',
  profilePicture:
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=150&q=80',
};

const ProfilePage: React.FC = () => {
  const authContext = useContext(AuthContext);

  const [name, setName] = useState(authContext?.user?.name || mockUser.name);
  const [email, setEmail] = useState(authContext?.user?.email || mockUser.email);
  const [bio, setBio] = useState(mockUser.bio);
  const [profilePicture, setProfilePicture] = useState(mockUser.profilePicture);

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      console.log('Saving profile:', { name, email, bio });
      await new Promise(resolve => setTimeout(resolve, 1500));

      if (authContext && authContext.user) {
        // authContext.updateUser({ ...authContext.user, name, email });
      }
      mockUser.name = name;
      mockUser.email = email;
      mockUser.bio = bio;

      setSuccessMessage('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = event => {
        setProfilePicture(event.target?.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const displayUser = authContext?.user || mockUser;

  return (
    <>
      <EnhancedNavbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-indigo-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <main className="max-w-3xl mx-auto">
          <header className="mb-10 text-center">
            <h1 className="text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-400">
              Your Profile
            </h1>
            <p className="mt-3 text-xl text-slate-300">
              Manage your account details and preferences.
            </p>
          </header>

          {error && (
            <div className="mb-6 p-3 bg-red-500/20 border border-red-500/50 text-red-300 rounded-md text-sm">
              {error}
            </div>
          )}
          {successMessage && (
            <div className="mb-6 p-3 bg-green-500/20 border border-green-500/50 text-green-300 rounded-md text-sm">
              {successMessage}
            </div>
          )}

          <div className="bg-slate-800 shadow-2xl rounded-xl p-8 md:p-10">
            <div className="flex flex-col items-center md:flex-row md:items-start gap-8 mb-8">
              <div className="relative group">
                <Avatar className="w-32 h-32 md:w-40 md:h-40 border-4 border-slate-700 group-hover:border-sky-500 transition-colors duration-300">
                  <AvatarImage
                    src={profilePicture || displayUser.profilePicture}
                    alt={displayUser.name}
                  />
                  <AvatarFallback className="text-slate-900 text-4xl font-semibold">
                    {displayUser.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <label
                    htmlFor="profile-picture-upload"
                    className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer rounded-full"
                  >
                    <span className="text-white text-sm">Change</span>
                    <input
                      id="profile-picture-upload"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handlePictureChange}
                    />
                  </label>
                )}
              </div>
              <div className="flex-grow text-center md:text-left">
                {isEditing ? (
                  <Input
                    id="name"
                    value={name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                    className="text-3xl font-bold text-white bg-slate-700 border-slate-600 mb-2 w-full"
                  />
                ) : (
                  <h2 className="text-4xl font-bold text-sky-400 mb-1">
                    {name || displayUser.name}
                  </h2>
                )}
                {isEditing ? (
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                    className="text-lg text-slate-400 bg-slate-700 border-slate-600 w-full"
                  />
                ) : (
                  <p className="text-lg text-slate-400 mb-4">{email || displayUser.email}</p>
                )}
                {!isEditing && bio && <p className="text-slate-300 mt-2 md:mt-0">{bio}</p>}
              </div>
            </div>

            {isEditing && (
              <div className="space-y-6 mb-8">
                <div>
                  <Label htmlFor="bio" className="block text-sm font-medium text-slate-300 mb-1.5">
                    Your Bio
                  </Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setBio(e.target.value)}
                    placeholder="Tell us a bit about yourself..."
                    rows={4}
                    className="w-full bg-slate-700 border-slate-600 placeholder-slate-500 text-white focus:ring-sky-500 focus:border-sky-500 transition-colors"
                  />
                </div>
                {/* Add more editable fields here: interests, location, etc. */}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              {isEditing ? (
                <>
                  <Button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="flex-1 bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-sky-500 disabled:opacity-70"
                  >
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setName(displayUser.name || '');
                      setEmail(displayUser.email || '');
                      setBio(mockUser.bio);
                      setProfilePicture(mockUser.profilePicture);
                      setError(null);
                      setSuccessMessage(null);
                    }}
                    className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => {
                    setIsEditing(true);
                    setError(null);
                    setSuccessMessage(null);
                  }}
                  className="flex-1 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-semibold py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                  Edit Profile
                </Button>
              )}
            </div>
            {!isEditing && (
              <Button
                variant="destructive"
                className="w-full mt-6 bg-red-700 hover:bg-red-800 text-white"
                onClick={() => {
                  if (confirm('Are you sure you want to log out?')) {
                    authContext?.logout();
                    alert('Logged out (simulated)');
                  }
                }}
              >
                Log Out
              </Button>
            )}
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
};

export default ProfilePage;
