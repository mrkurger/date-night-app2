/**
 *
 */
export interface ISafetyCheckin {
  /**
   *
   */
  id: string;
  /**
   *
   */
  userId: string;
  /**
   *
   */
  timestamp: Date;
  /**
   *
   */
  location: {
    /**
     *
     */
    latitude: number;
    /**
     *
     */
    longitude: number;
    /**
     *
     */
    address?: string;
  };
  /**
   *
   */
  status: 'safe' | 'help-needed' | 'emergency';
  /**
   *
   */
  message?: string;
  /**
   *
   */
  attachments?: {
    /**
     *
     */
    images: string[];
    /**
     *
     */
    audio: string[];
  };
  /**
   *
   */
  emergencyContacts: {
    /**
     *
     */
    notified: string[];
    /**
     *
     */
    confirmed: string[];
  };
  /**
   *
   */
  automatedActions: {
    /**
     *
     */
    smsNotifications: boolean;
    /**
     *
     */
    emailNotifications: boolean;
    /**
     *
     */
    emergencyServices: boolean;
  };
}

/**
 *
 */
export interface ISafetyCheckinCreateData {
  /**
   *
   */
  location: {
    /**
     *
     */
    latitude: number;
    /**
     *
     */
    longitude: number;
    /**
     *
     */
    address?: string;
  };
  /**
   *
   */
  status: 'safe' | 'help-needed' | 'emergency';
  /**
   *
   */
  message?: string;
  /**
   *
   */
  attachments?: {
    /**
     *
     */
    images: File[];
    /**
     *
     */
    audio: File[];
  };
  /**
   *
   */
  emergencyContacts?: string[];
  /**
   *
   */
  automatedActions?: {
    /**
     *
     */
    smsNotifications?: boolean;
    /**
     *
     */
    emailNotifications?: boolean;
    /**
     *
     */
    emergencyServices?: boolean;
  };
}

/**
 *
 */
export interface ISafetyCheckinUpdateData {
  /**
   *
   */
  status?: 'safe' | 'help-needed' | 'emergency';
  /**
   *
   */
  message?: string;
  /**
   *
   */
  attachments?: {
    /**
     *
     */
    images?: string[];
    /**
     *
     */
    audio?: string[];
  };
  /**
   *
   */
  emergencyContacts?: {
    /**
     *
     */
    notified?: string[];
    /**
     *
     */
    confirmed?: string[];
  };
  /**
   *
   */
  automatedActions?: {
    /**
     *
     */
    smsNotifications?: boolean;
    /**
     *
     */
    emailNotifications?: boolean;
    /**
     *
     */
    emergencyServices?: boolean;
  };
}

/**
 *
 */
export interface ICheckInResponse {
  /**
   *
   */
  success: boolean;
  /**
   *
   */
  checkinId?: string;
  /**
   *
   */
  error?: string;
}

/**
 *
 */
export interface IEmergencyContact {
  /**
   *
   */
  id: string;
  /**
   *
   */
  name: string;
  /**
   *
   */
  phone: string;
  /**
   *
   */
  email?: string;
  /**
   *
   */
  relationship: string;
  /**
   *
   */
  priority: number;
}

/**
 *
 */
export interface ISafetySettings {
  /**
   *
   */
  autoCheckin: {
    /**
     *
     */
    enabled: boolean;
    /**
     *
     */
    interval: number; // minutes
    /**
     *
     */
    startTime?: string; // HH:mm
    /**
     *
     */
    endTime?: string; // HH:mm
  };
  /**
   *
   */
  emergencyContacts: IEmergencyContact[];
  /**
   *
   */
  notificationPreferences: {
    /**
     *
     */
    sms: boolean;
    /**
     *
     */
    email: boolean;
    /**
     *
     */
    push: boolean;
  };
  /**
   *
   */
  locationSharing: {
    /**
     *
     */
    enabled: boolean;
    /**
     *
     */
    shareWith: ('emergency-contacts' | 'trusted-users')[];
  };
}

/**
 *
 */
export interface ISafetySettingsUpdateData {
  /**
   *
   */
  autoCheckin?: {
    /**
     *
     */
    enabled?: boolean;
    /**
     *
     */
    interval?: number;
    /**
     *
     */
    startTime?: string;
    /**
     *
     */
    endTime?: string;
  };
  /**
   *
   */
  emergencyContacts?: IEmergencyContact[];
  /**
   *
   */
  notificationPreferences?: {
    /**
     *
     */
    sms?: boolean;
    /**
     *
     */
    email?: boolean;
    /**
     *
     */
    push?: boolean;
  };
  /**
   *
   */
  locationSharing?: {
    /**
     *
     */
    enabled?: boolean;
    /**
     *
     */
    shareWith?: ('emergency-contacts' | 'trusted-users')[];
  };
}
