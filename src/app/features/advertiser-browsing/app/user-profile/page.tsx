"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { User, Settings, Bell, Shield, CreditCard, Lock, Eye, EyeOff, MapPin } from "lucide-react"

// Mock user data
const userData = {
  id: "user123",
  name: "John Doe",
  email: "john.doe@example.com",
  avatar: "/placeholder.svg?height=100&width=100",
  joinDate: "2023-01-15",
  preferences: {
    theme: "system",
    language: "en",
    notifications: {
      email: true,
      push: true,
      sms: false,
      newMessages: true,
      promotions: false,
      updates: true,
    },
    privacy: {
      profileVisibility: "public",
      showOnlineStatus: true,
      showLastSeen: false,
      allowLocationSharing: true,
    },
    contentPreferences: {
      adultContent: true,
      autoplayVideos: true,
      showSensitiveContent: true,
    },
  },
  savedLocations: [
    { id: 1, name: "Home", address: "123 Main St, Oslo, Norway" },
    { id: 2, name: "Work", address: "456 Business Ave, Oslo, Norway" },
    { id: 3, name: "Gym", address: "789 Fitness Blvd, Oslo, Norway" },
  ],
}

export default function UserProfilePage() {
  const [user, setUser] = useState(userData)
  const [showPassword, setShowPassword] = useState(false)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const handleNotificationChange = (key, value) => {
    setUser({
      ...user,
      preferences: {
        ...user.preferences,
        notifications: {
          ...user.preferences.notifications,
          [key]: value,
        },
      },
    })
  }

  const handlePrivacyChange = (key, value) => {
    setUser({
      ...user,
      preferences: {
        ...user.preferences,
        privacy: {
          ...user.preferences.privacy,
          [key]: value,
        },
      },
    })
  }

  const handleContentPreferenceChange = (key, value) => {
    setUser({
      ...user,
      preferences: {
        ...user.preferences,
        contentPreferences: {
          ...user.preferences.contentPreferences,
          [key]: value,
        },
      },
    })
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/3">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>{user.name}</CardTitle>
                  <CardDescription>{user.email}</CardDescription>
                  <p className="text-sm text-muted-foreground mt-1">
                    Member since {new Date(user.joinDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Free Account</Badge>
                  <Button variant="outline" size="sm">
                    Upgrade
                  </Button>
                </div>
                <Separator />
                <nav className="space-y-1">
                  <Button variant="ghost" className="w-full justify-start" asChild>
                    <a href="#account">
                      <User className="mr-2 h-4 w-4" />
                      Account Information
                    </a>
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" asChild>
                    <a href="#security">
                      <Shield className="mr-2 h-4 w-4" />
                      Security
                    </a>
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" asChild>
                    <a href="#notifications">
                      <Bell className="mr-2 h-4 w-4" />
                      Notifications
                    </a>
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" asChild>
                    <a href="#privacy">
                      <Lock className="mr-2 h-4 w-4" />
                      Privacy
                    </a>
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" asChild>
                    <a href="#payment">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Payment Methods
                    </a>
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" asChild>
                    <a href="#preferences">
                      <Settings className="mr-2 h-4 w-4" />
                      Preferences
                    </a>
                  </Button>
                </nav>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:w-2/3 space-y-6">
          <Card id="account">
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Manage your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" defaultValue={user.name} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" defaultValue={user.email} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" type="tel" placeholder="Enter your phone number" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input id="dob" type="date" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea id="bio" placeholder="Tell us about yourself" />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>

          <Card id="security">
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>Manage your account security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <div className="relative">
                  <Input
                    id="current-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your current password"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Two-Factor Authentication</Label>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Enable 2FA</p>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Update Password</Button>
            </CardFooter>
          </Card>

          <Card id="notifications">
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Manage how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                  </div>
                  <Switch
                    checked={user.preferences.notifications.email}
                    onCheckedChange={(checked) => handleNotificationChange("email", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Push Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive notifications on your device</p>
                  </div>
                  <Switch
                    checked={user.preferences.notifications.push}
                    onCheckedChange={(checked) => handleNotificationChange("push", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">SMS Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive notifications via text message</p>
                  </div>
                  <Switch
                    checked={user.preferences.notifications.sms}
                    onCheckedChange={(checked) => handleNotificationChange("sms", checked)}
                  />
                </div>
              </div>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Notification Types</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">New Messages</p>
                    <p className="text-sm text-muted-foreground">Get notified when you receive new messages</p>
                  </div>
                  <Switch
                    checked={user.preferences.notifications.newMessages}
                    onCheckedChange={(checked) => handleNotificationChange("newMessages", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Promotions</p>
                    <p className="text-sm text-muted-foreground">Get notified about promotions and deals</p>
                  </div>
                  <Switch
                    checked={user.preferences.notifications.promotions}
                    onCheckedChange={(checked) => handleNotificationChange("promotions", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Updates</p>
                    <p className="text-sm text-muted-foreground">Get notified about platform updates</p>
                  </div>
                  <Switch
                    checked={user.preferences.notifications.updates}
                    onCheckedChange={(checked) => handleNotificationChange("updates", checked)}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Preferences</Button>
            </CardFooter>
          </Card>

          <Card id="privacy">
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>Manage your privacy preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="profile-visibility">Profile Visibility</Label>
                  <Select
                    defaultValue={user.preferences.privacy.profileVisibility}
                    onValueChange={(value) => handlePrivacyChange("profileVisibility", value)}
                  >
                    <SelectTrigger id="profile-visibility">
                      <SelectValue placeholder="Select visibility" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public - Anyone can view your profile</SelectItem>
                      <SelectItem value="private">Private - Only you can view your profile</SelectItem>
                      <SelectItem value="contacts">Contacts Only - Only your contacts can view your profile</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Show Online Status</p>
                    <p className="text-sm text-muted-foreground">Let others see when you're online</p>
                  </div>
                  <Switch
                    checked={user.preferences.privacy.showOnlineStatus}
                    onCheckedChange={(checked) => handlePrivacyChange("showOnlineStatus", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Show Last Seen</p>
                    <p className="text-sm text-muted-foreground">Let others see when you were last active</p>
                  </div>
                  <Switch
                    checked={user.preferences.privacy.showLastSeen}
                    onCheckedChange={(checked) => handlePrivacyChange("showLastSeen", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Allow Location Sharing</p>
                    <p className="text-sm text-muted-foreground">Share your location with others</p>
                  </div>
                  <Switch
                    checked={user.preferences.privacy.allowLocationSharing}
                    onCheckedChange={(checked) => handlePrivacyChange("allowLocationSharing", checked)}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Privacy Settings</Button>
            </CardFooter>
          </Card>

          <Card id="payment">
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>Manage your payment options</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">You have no payment methods saved.</p>
                <Button>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Add Payment Method
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card id="preferences">
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>Customize your experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Appearance</h3>
                <div className="space-y-2">
                  <Label htmlFor="theme">Theme</Label>
                  <Select defaultValue={user.preferences.theme}>
                    <SelectTrigger id="theme">
                      <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium">Language</h3>
                <div className="space-y-2">
                  <Label htmlFor="language">Display Language</Label>
                  <Select defaultValue={user.preferences.language}>
                    <SelectTrigger id="language">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="no">Norwegian</SelectItem>
                      <SelectItem value="sv">Swedish</SelectItem>
                      <SelectItem value="da">Danish</SelectItem>
                      <SelectItem value="fi">Finnish</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium">Content Preferences</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Adult Content</p>
                    <p className="text-sm text-muted-foreground">Show adult content in search results</p>
                  </div>
                  <Switch
                    checked={user.preferences.contentPreferences.adultContent}
                    onCheckedChange={(checked) => handleContentPreferenceChange("adultContent", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Autoplay Videos</p>
                    <p className="text-sm text-muted-foreground">Automatically play videos when browsing</p>
                  </div>
                  <Switch
                    checked={user.preferences.contentPreferences.autoplayVideos}
                    onCheckedChange={(checked) => handleContentPreferenceChange("autoplayVideos", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Show Sensitive Content</p>
                    <p className="text-sm text-muted-foreground">Display potentially sensitive content</p>
                  </div>
                  <Switch
                    checked={user.preferences.contentPreferences.showSensitiveContent}
                    onCheckedChange={(checked) => handleContentPreferenceChange("showSensitiveContent", checked)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium">Saved Locations</h3>
                <div className="space-y-2">
                  {user.savedLocations.map((location) => (
                    <div key={location.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{location.name}</p>
                          <p className="text-xs text-muted-foreground">{location.address}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm">
                    <MapPin className="mr-2 h-4 w-4" />
                    Add Location
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Preferences</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
