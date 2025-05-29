'use client';

import * as React from 'react';
import { useState, useContext } from 'react';
import { AuthContext } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import EnhancedNavbar from '@/components/enhanced-navbar';
import { Footer } from '@/components/footer';
import {
  Bell,
  Shield,
  User,
  Heart,
  CreditCard,
  Globe,
  Moon,
  Sun,
  Smartphone,
  Mail,
  MessageSquare,
  Eye,
  EyeOff,
} from 'lucide-react';

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  messageNotifications: boolean;
  matchNotifications: boolean;
  likeNotifications: boolean;
  promotionalEmails: boolean;
}

interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'friends';
  showOnlineStatus: boolean;
  showLastSeen: boolean;
  allowMessageRequests: boolean;
  showAge: boolean;
  showLocation: boolean;
}

interface PreferenceSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  currency: string;
  distanceUnit: 'km' | 'miles';
  ageRange: { min: number; max: number };
  maxDistance: number;
}

const SettingsPage: React.FC = () => {
  const authContext = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Notification Settings
  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: true,
    messageNotifications: true,
    matchNotifications: true,
    likeNotifications: false,
    promotionalEmails: false,
  });

  // Privacy Settings
  const [privacy, setPrivacy] = useState<PrivacySettings>({
    profileVisibility: 'public',
    showOnlineStatus: true,
    showLastSeen: true,
    allowMessageRequests: true,
    showAge: true,
    showLocation: true,
  });

  // Preference Settings
  const [preferences, setPreferences] = useState<PreferenceSettings>({
    theme: 'system',
    language: 'en',
    currency: 'USD',
    distanceUnit: 'km',
    ageRange: { min: 18, max: 35 },
    maxDistance: 50,
  });

  const handleSaveSettings = async () => {
    setIsLoading(true);
    setSuccessMessage(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log('Saving settings:', { notifications, privacy, preferences });
      setSuccessMessage('Settings saved successfully!');

      // Auto-hide success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateNotificationSetting = (key: keyof NotificationSettings, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
  };

  const updatePrivacySetting = (key: keyof PrivacySettings, value: any) => {
    setPrivacy(prev => ({ ...prev, [key]: value }));
  };

  const updatePreferenceSetting = (key: keyof PreferenceSettings, value: any) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  return (
    <>
      <EnhancedNavbar />
      <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
        <main className="max-w-4xl mx-auto">
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">Settings</h1>
            <p className="text-muted-foreground">
              Manage your account preferences and privacy settings
            </p>
          </header>

          {successMessage && (
            <div className="mb-6 p-4 bg-primary/10 border border-primary/20 text-primary rounded-lg">
              {successMessage}
            </div>
          )}

          <Tabs defaultValue="notifications" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="privacy" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Privacy
              </TabsTrigger>
              <TabsTrigger value="preferences" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Preferences
              </TabsTrigger>
              <TabsTrigger value="account" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Account
              </TabsTrigger>
            </TabsList>

            {/* Notifications Tab */}
            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Notification Settings
                  </CardTitle>
                  <CardDescription>
                    Choose how you want to be notified about activity on your account
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <Label htmlFor="email-notifications">Email Notifications</Label>
                          <p className="text-sm text-muted-foreground">
                            Receive notifications via email
                          </p>
                        </div>
                      </div>
                      <Switch
                        id="email-notifications"
                        checked={notifications.emailNotifications}
                        onCheckedChange={checked =>
                          updateNotificationSetting('emailNotifications', checked)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Smartphone className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <Label htmlFor="push-notifications">Push Notifications</Label>
                          <p className="text-sm text-muted-foreground">
                            Receive push notifications on your device
                          </p>
                        </div>
                      </div>
                      <Switch
                        id="push-notifications"
                        checked={notifications.pushNotifications}
                        onCheckedChange={checked =>
                          updateNotificationSetting('pushNotifications', checked)
                        }
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <Label htmlFor="message-notifications">New Messages</Label>
                          <p className="text-sm text-muted-foreground">
                            Get notified when you receive new messages
                          </p>
                        </div>
                      </div>
                      <Switch
                        id="message-notifications"
                        checked={notifications.messageNotifications}
                        onCheckedChange={checked =>
                          updateNotificationSetting('messageNotifications', checked)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Heart className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <Label htmlFor="match-notifications">New Matches</Label>
                          <p className="text-sm text-muted-foreground">
                            Get notified when you have new matches
                          </p>
                        </div>
                      </div>
                      <Switch
                        id="match-notifications"
                        checked={notifications.matchNotifications}
                        onCheckedChange={checked =>
                          updateNotificationSetting('matchNotifications', checked)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Heart className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <Label htmlFor="like-notifications">Likes & Tips</Label>
                          <p className="text-sm text-muted-foreground">
                            Get notified when someone likes your profile or sends tips
                          </p>
                        </div>
                      </div>
                      <Switch
                        id="like-notifications"
                        checked={notifications.likeNotifications}
                        onCheckedChange={checked =>
                          updateNotificationSetting('likeNotifications', checked)
                        }
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <Label htmlFor="promotional-emails">Promotional Emails</Label>
                          <p className="text-sm text-muted-foreground">
                            Receive emails about new features and promotions
                          </p>
                        </div>
                      </div>
                      <Switch
                        id="promotional-emails"
                        checked={notifications.promotionalEmails}
                        onCheckedChange={checked =>
                          updateNotificationSetting('promotionalEmails', checked)
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Privacy Tab */}
            <TabsContent value="privacy">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Privacy & Safety
                  </CardTitle>
                  <CardDescription>
                    Control who can see your profile and personal information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="profile-visibility">Profile Visibility</Label>
                      <Select
                        value={privacy.profileVisibility}
                        onValueChange={(value: 'public' | 'private' | 'friends') =>
                          updatePrivacySetting('profileVisibility', value)
                        }
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">
                            Public - Everyone can see your profile
                          </SelectItem>
                          <SelectItem value="friends">
                            Friends Only - Only matched users can see details
                          </SelectItem>
                          <SelectItem value="private">
                            Private - Hidden from search results
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Eye className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <Label htmlFor="show-online-status">Show Online Status</Label>
                          <p className="text-sm text-muted-foreground">
                            Let others see when you're online
                          </p>
                        </div>
                      </div>
                      <Switch
                        id="show-online-status"
                        checked={privacy.showOnlineStatus}
                        onCheckedChange={checked =>
                          updatePrivacySetting('showOnlineStatus', checked)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <Label htmlFor="show-last-seen">Show Last Seen</Label>
                          <p className="text-sm text-muted-foreground">
                            Display when you were last active
                          </p>
                        </div>
                      </div>
                      <Switch
                        id="show-last-seen"
                        checked={privacy.showLastSeen}
                        onCheckedChange={checked => updatePrivacySetting('showLastSeen', checked)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Preferences Tab */}
            <TabsContent value="preferences">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    App Preferences
                  </CardTitle>
                  <CardDescription>
                    Customize your app experience and dating preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="theme">Theme</Label>
                      <Select
                        value={preferences.theme}
                        onValueChange={(value: 'light' | 'dark' | 'system') =>
                          updatePreferenceSetting('theme', value)
                        }
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">
                            <div className="flex items-center gap-2">
                              <Sun className="h-4 w-4" />
                              Light
                            </div>
                          </SelectItem>
                          <SelectItem value="dark">
                            <div className="flex items-center gap-2">
                              <Moon className="h-4 w-4" />
                              Dark
                            </div>
                          </SelectItem>
                          <SelectItem value="system">
                            <div className="flex items-center gap-2">
                              <Globe className="h-4 w-4" />
                              System
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="language">Language</Label>
                      <Select
                        value={preferences.language}
                        onValueChange={value => updatePreferenceSetting('language', value)}
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Español</SelectItem>
                          <SelectItem value="fr">Français</SelectItem>
                          <SelectItem value="de">Deutsch</SelectItem>
                          <SelectItem value="no">Norsk</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="distance-unit">Distance Unit</Label>
                      <Select
                        value={preferences.distanceUnit}
                        onValueChange={(value: 'km' | 'miles') =>
                          updatePreferenceSetting('distanceUnit', value)
                        }
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="km">Kilometers</SelectItem>
                          <SelectItem value="miles">Miles</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="currency">Currency</Label>
                      <Select
                        value={preferences.currency}
                        onValueChange={value => updatePreferenceSetting('currency', value)}
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD ($)</SelectItem>
                          <SelectItem value="EUR">EUR (€)</SelectItem>
                          <SelectItem value="NOK">NOK (kr)</SelectItem>
                          <SelectItem value="GBP">GBP (£)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="font-medium">Dating Preferences</h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="min-age">Minimum Age</Label>
                        <Input
                          id="min-age"
                          type="number"
                          min="18"
                          max="100"
                          value={preferences.ageRange.min}
                          onChange={e =>
                            updatePreferenceSetting('ageRange', {
                              ...preferences.ageRange,
                              min: parseInt(e.target.value),
                            })
                          }
                          className="mt-2"
                        />
                      </div>

                      <div>
                        <Label htmlFor="max-age">Maximum Age</Label>
                        <Input
                          id="max-age"
                          type="number"
                          min="18"
                          max="100"
                          value={preferences.ageRange.max}
                          onChange={e =>
                            updatePreferenceSetting('ageRange', {
                              ...preferences.ageRange,
                              max: parseInt(e.target.value),
                            })
                          }
                          className="mt-2"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="max-distance">
                        Maximum Distance ({preferences.distanceUnit === 'km' ? 'km' : 'miles'})
                      </Label>
                      <Input
                        id="max-distance"
                        type="number"
                        min="1"
                        max="500"
                        value={preferences.maxDistance}
                        onChange={e =>
                          updatePreferenceSetting('maxDistance', parseInt(e.target.value))
                        }
                        className="mt-2"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Account Tab */}
            <TabsContent value="account">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Account Management
                    </CardTitle>
                    <CardDescription>Manage your account settings and subscription</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Account Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="account-email">Email Address</Label>
                            <Input
                              id="account-email"
                              type="email"
                              value={authContext?.user?.email || 'user@example.com'}
                              disabled
                              className="mt-2"
                            />
                          </div>
                          <div>
                            <Label htmlFor="account-phone">Phone Number</Label>
                            <Input
                              id="account-phone"
                              type="tel"
                              placeholder="+1 (555) 123-4567"
                              className="mt-2"
                            />
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <h4 className="font-medium mb-2">Subscription Status</h4>
                        <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-primary">VIP Premium</p>
                              <p className="text-sm text-muted-foreground">
                                Active until March 15, 2024
                              </p>
                            </div>
                            <Button variant="outline" size="sm">
                              Manage Subscription
                            </Button>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <h4 className="font-medium mb-2">Security</h4>
                        <div className="space-y-3">
                          <Button variant="outline" className="w-full justify-start">
                            Change Password
                          </Button>
                          <Button variant="outline" className="w-full justify-start">
                            Two-Factor Authentication
                          </Button>
                          <Button variant="outline" className="w-full justify-start">
                            Download My Data
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-destructive/50">
                  <CardHeader>
                    <CardTitle className="text-destructive">Danger Zone</CardTitle>
                    <CardDescription>
                      These actions cannot be undone. Please be careful.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full justify-start text-destructive border-destructive/50 hover:bg-destructive/10"
                    >
                      Deactivate Account
                    </Button>
                    <Button variant="destructive" className="w-full justify-start">
                      Delete Account Permanently
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button onClick={handleSaveSettings} disabled={isLoading} className="min-w-[120px]">
                {isLoading ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </Tabs>
        </main>
      </div>
      <Footer />
    </>
  );
};

export default SettingsPage;
