# User Profile System

## Overview

The User Profile System allows users to manage their personal information, preferences, and account settings. It supports profile image uploads, personal details management, location information, and user preferences. This feature provides users with control over their identity and experience within the application.

## User Experience

Users interact with the Profile System through several interfaces:

- **Profile Page**: Displays user information and allows editing
- **Profile Image Upload**: Allows users to update their profile picture
- **Account Settings**: Manages account-related preferences and security settings
- **Privacy Controls**: Controls visibility of profile information to other users

## Architecture

### Client-Side Components

| Component                   | Path                                                                                        | Description                       |
| --------------------------- | ------------------------------------------------------------------------------------------- | --------------------------------- |
| `ProfileComponent`          | `/client-angular/src/app/features/profile/profile.component.ts`                             | Main profile management component |
| `ProfileEditComponent`      | `/client-angular/src/app/features/profile/profile-edit/profile-edit.component.ts`           | Profile editing form              |
| `ProfileImageComponent`     | `/client-angular/src/app/shared/components/profile-image/profile-image.component.ts`        | Profile image display and upload  |
| `AccountSettingsComponent`  | `/client-angular/src/app/features/profile/account-settings/account-settings.component.ts`   | Account settings management       |
| `PrivacySettingsComponent`  | `/client-angular/src/app/features/profile/privacy-settings/privacy-settings.component.ts`   | Privacy controls management       |
| `SecuritySettingsComponent` | `/client-angular/src/app/features/profile/security-settings/security-settings.component.ts` | Security settings management      |

### Client-Side Services

| Service             | Path                                                           | Description                      |
| ------------------- | -------------------------------------------------------------- | -------------------------------- |
| `UserService`       | `/client-angular/src/app/core/services/user.service.ts`        | Manages user data and operations |
| `AuthService`       | `/client-angular/src/app/core/services/auth.service.ts`        | Handles authentication           |
| `FileUploadService` | `/client-angular/src/app/core/services/file-upload.service.ts` | Manages file uploads             |

### Server-Side Controllers

| Controller         | Path                                       | Description                        |
| ------------------ | ------------------------------------------ | ---------------------------------- |
| `UserController`   | `/server/controllers/user.controller.js`   | Handles user-related HTTP requests |
| `AuthController`   | `/server/controllers/auth.controller.js`   | Handles authentication requests    |
| `UploadController` | `/server/controllers/upload.controller.js` | Handles file upload requests       |

### Server-Side Models

| Model  | Path                           | Description                   |
| ------ | ------------------------------ | ----------------------------- |
| `User` | `/server/models/user.model.js` | Mongoose schema for user data |

## API Endpoints

| Endpoint                          | Method | Description               | Request Body                     | Response              |
| --------------------------------- | ------ | ------------------------- | -------------------------------- | --------------------- |
| `/api/users/me`                   | GET    | Get current user profile  | N/A                              | User object           |
| `/api/users/profile`              | PUT    | Update user profile       | FormData with profile fields     | Updated user object   |
| `/api/users/:userId`              | GET    | Get user by ID            | N/A                              | User object           |
| `/api/users/:userId/public`       | GET    | Get public profile        | N/A                              | Public profile object |
| `/api/users/search`               | GET    | Search users              | Query params                     | Array of user objects |
| `/api/auth/change-password`       | POST   | Change password           | `{currentPassword, newPassword}` | Success message       |
| `/api/auth/reset-password`        | POST   | Request password reset    | `{email}`                        | Success message       |
| `/api/auth/reset-password/:token` | POST   | Reset password with token | `{password}`                     | Success message       |
| `/api/uploads/profile-image`      | POST   | Upload profile image      | FormData with image file         | Image URL             |

## Data Flow

The profile system follows these data flows:

1. **Viewing Profile**:

   - User navigates to the Profile page
   - ProfileComponent calls UserService.getCurrentUser()
   - UserService makes a GET request to /api/users/me
   - Server returns the user profile data
   - ProfileComponent displays the user information

2. **Updating Profile**:

   - User edits profile information in the form
   - On submit, ProfileComponent creates FormData with updated fields
   - If a new profile image is selected, it's added to the FormData
   - UserService.updateProfile() sends a PUT request to /api/users/profile
   - Server updates the user document and returns updated profile
   - UI displays success message and updated information

3. **Changing Password**:

   - User enters current and new password
   - SecuritySettingsComponent calls AuthService.changePassword()
   - AuthService sends a POST request to /api/auth/change-password
   - Server verifies current password, updates with new hashed password
   - UI displays success message

4. **Uploading Profile Image**:
   - User selects a new profile image
   - FileUploadService uploads the image to /api/uploads/profile-image
   - Server processes the image (resizing, optimization)
   - Server stores the image and returns the URL
   - UserService updates the profile with the new image URL
   - UI displays the updated profile image

## State Management

The profile system uses a combination of service-based state management:

- **UserService**: Maintains the current user state with BehaviorSubject
- **AuthService**: Manages authentication state
- **LocalStorage**: Stores authentication token

## Data Model

The User model includes:

```typescript
interface User {
  _id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  role: 'user' | 'advertiser' | 'admin';
  profileImage?: string;
  bio?: string;
  online?: boolean;
  lastActive?: Date;
  location?: {
    city?: string;
    country?: string;
  };
  preferences?: {
    notifications?: boolean;
    darkMode?: boolean;
    language?: string;
  };
  privacySettings?: {
    profileVisibility?: 'public' | 'private' | 'friends';
    showOnlineStatus?: boolean;
    allowMessaging?: 'all' | 'friends' | 'none';
  };
  createdAt: Date;
  updatedAt: Date;
}
```

## Key Features

1. **Profile Information Management**:

   - Users can update personal details (name, bio, location)
   - Form validation ensures data integrity
   - Changes are immediately reflected across the application

2. **Profile Image Upload**:

   - Support for image upload from device
   - Image processing (resizing, optimization)
   - Default avatar for users without custom images

3. **Privacy Controls**:

   - Users can control profile visibility
   - Options for who can message them
   - Control over online status visibility

4. **Preference Management**:

   - Notification preferences
   - Language settings
   - Dark mode toggle

5. **Security Features**:
   - Password change functionality
   - Password reset via email
   - Account verification

## Security Considerations

1. **Data Protection**:

   - Passwords are hashed using Argon2id (with bcrypt fallback)
   - Sensitive fields are protected from unauthorized access
   - Form data is validated on both client and server

2. **Access Control**:

   - Authentication required for profile operations
   - Users can only modify their own profiles
   - Admin-only endpoints for user management

3. **Image Upload Security**:
   - File type validation
   - Size limits
   - Content scanning for malicious files

## Testing

### Unit Tests

| Test File                   | Path                                                                 | Description                 |
| --------------------------- | -------------------------------------------------------------------- | --------------------------- |
| `profile.component.spec.ts` | `/client-angular/src/app/features/profile/profile.component.spec.ts` | Tests for profile component |
| `user.service.spec.ts`      | `/client-angular/src/app/core/services/user.service.spec.ts`         | Tests for user service      |
| `auth.service.spec.ts`      | `/client-angular/src/app/core/services/auth.service.spec.ts`         | Tests for auth service      |

### Integration Tests

| Test File                 | Path                                                     | Description           |
| ------------------------- | -------------------------------------------------------- | --------------------- |
| `user.controller.test.js` | `/server/tests/integration/user/user.controller.test.js` | API integration tests |
| `user.model.test.js`      | `/server/tests/integration/user/user.model.test.js`      | Database model tests  |

## Performance Considerations

1. **Image Optimization**:

   - Profile images are resized and compressed
   - Multiple image sizes for different contexts
   - Lazy loading for images

2. **Form Submission**:

   - Debounced form submissions
   - Optimistic UI updates
   - Progressive form validation

3. **Caching**:
   - User profile data cached for performance
   - Cache invalidation on profile updates

## Future Enhancements

1. **Social Media Integration**:

   - Connect social media accounts
   - Import profile data from social platforms
   - Share profile on social media

2. **Enhanced Verification**:

   - Multi-factor authentication
   - Identity verification options
   - Verification badges

3. **Profile Analytics**:

   - Profile view statistics
   - Interaction metrics
   - Profile completion score

4. **Advanced Privacy**:
   - Granular privacy controls per field
   - Temporary profile visibility
   - Profile visibility scheduling
