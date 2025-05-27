/**
 * Represents a user in the system with their associated data and preferences.
 * This interface contains all user-related information including authentication,
 * preferences, and settings.
 */
export interface IUser {
  /**
   * Unique identifier for the user.
   */
  id: string;

  /**
   * User's email address, used for authentication and communication.
   */
  email: string;

  /**
   * User's full name as displayed in the application.
   */
  name: string;

  /**
   * List of roles assigned to the user that determine their permissions.
   */
  roles: string[];

  /**
   * User's application preferences for customization.
   */
  preferences: {
    /**
     * Selected theme for the application interface.
     */
    theme: string;
    /**
     * Whether the user has enabled notifications.
     */
    notifications: boolean;
  };

  /**
   * Optional list of travel plans associated with the user.
   */
  travelPlan?: ITravelPlanItem[];

  /**
   * Optional settings for notification preferences.
   */
  notificationSettings?: INotificationSettings;

  /**
   * Optional settings for user privacy preferences.
   */
  privacySettings?: IPrivacySettings;

  /**
   * Timestamp when the user account was created.
   */
  createdAt: Date;

  /**
   * Timestamp of the last update to the user account.
   */
  updatedAt: Date;
}

/**
 * Represents a single travel plan item in a user's itinerary.
 * Contains details about a planned trip including dates and location.
 */
export interface ITravelPlanItem {
  /**
   * Unique identifier for the travel plan item.
   */
  id: string;

  /**
   * The destination location for the travel plan.
   */
  destination: string;

  /**
   * The start date of the planned travel.
   */
  startDate: Date;

  /**
   * The end date of the planned travel.
   */
  endDate: Date;

  /**
   * Optional notes or comments about the travel plan.
   */
  notes?: string;
}

/**
 * Defines the notification preferences for a user.
 * Controls how and when the user receives different types of notifications.
 */
export interface INotificationSettings {
  /**
   * Whether email notifications are enabled.
   */
  email: boolean;

  /**
   * Whether push notifications are enabled.
   */
  push: boolean;

  /**
   * Whether SMS notifications are enabled.
   */
  sms: boolean;

  /**
   * How frequently notifications should be sent to the user.
   */
  frequency: 'realtime' | 'daily' | 'weekly';

  /**
   * Settings for different types of notifications.
   */
  types: {
    /**
     * Whether to receive notifications for new messages.
     */
    messages: boolean;

    /**
     * Whether to receive notifications for new reviews.
     */
    reviews: boolean;

    /**
     * Whether to receive notifications for booking updates.
     */
    bookings: boolean;
  };
}

/**
 * Defines the privacy settings for a user's profile and information.
 * Controls who can see different aspects of the user's profile.
 */
export interface IPrivacySettings {
  /**
   * Who can view the user's profile information.
   */
  profileVisibility: 'public' | 'private' | 'contacts';

  /**
   * Who can view the user's contact information.
   */
  contactInfoVisibility: 'public' | 'private' | 'contacts';

  /**
   * Who can view the user's calendar and availability.
   */
  calendarVisibility: 'public' | 'private' | 'contacts';
}

/**
 * Represents the response from a successful authentication attempt.
 * Contains the user information and authentication tokens.
 */
export interface IAuthResponse {
  /**
   * The authenticated user's information.
   */
  user: IUser;

  /**
   * JWT access token for API requests.
   */
  token: string;

  /**
   * Token used to obtain new access tokens.
   */
  refreshToken: string;

  /**
   * Time in seconds until the access token expires.
   */
  expiresIn: number;
}

/**
 * Represents the credentials required for user login.
 */
export interface ILoginCredentials {
  /**
   * User's email address.
   */
  email: string;

  /**
   * User's password.
   */
  password: string;

  /**
   * Whether to persist the login session.
   */
  rememberMe?: boolean;
}

/**
 * Represents the current authentication state in the application.
 * Used for managing the user's authentication status and related data.
 */
export interface IAuthState {
  /**
   * Currently authenticated user, or null if not authenticated.
   */
  user: IUser | null;

  /**
   * Current JWT access token, or null if not authenticated.
   */
  token: string | null;

  /**
   * Whether the user is currently authenticated.
   */
  isAuthenticated: boolean;

  /**
   * Whether authentication operations are in progress.
   */
  loading: boolean;

  /**
   * Error message from the last authentication operation, if any.
   */
  error: string | null;
}
