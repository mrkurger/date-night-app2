/**
 *
 */
export interface SafetyCheckin {
  /**
   *
   */
  _id: string;
  /**
   *
   */
  user: string;
  /**
   *
   */
  meetingWith?: {
    /**
     *
     */
    _id: string;
    /**
     *
     */
    username: string;
    /**
     *
     */
    profileImage?: string;
  };
  /**
   *
   */
  clientName?: string;
  /**
   *
   */
  clientContact?: string;
  /**
   *
   */
  location: {
    /**
     *
     */
    type: 'Point';
    /**
     *
     */
    coordinates: [number, number]; // [longitude, latitude]
    /**
     *
     */
    address?: string;
    /**
     *
     */
    locationName?: string;
    /**
     *
     */
    city?: string;
    /**
     *
     */
    county?: string;
  };
  /**
   *
   */
  startTime: Date;
  /**
   *
   */
  expectedEndTime: Date;
  /**
   *
   */
  actualEndTime?: Date;
  /**
   *
   */
  status: 'scheduled' | 'active' | 'completed' | 'missed' | 'emergency';
  /**
   *
   */
  checkInReminders: Array;
  /**
   *
   */
  emergencyContacts: Array;
  /**
   *
   */
  safetyNotes?: string;
  /**
   *
   */
  safetyCode?: string; // Only included when first created
  /**
   *
   */
  distressCode?: string; // Only included when first created
  /**
   *
   */
  checkInMethod: 'app' | 'sms' | 'email';
  /**
   *
   */
  checkInResponses: Array;
  /**
   *
   */
  autoCheckInSettings: {
    /**
     *
     */
    enabled: boolean;
    /**
     *
     */
    intervalMinutes: number;
    /**
     *
     */
    missedCheckInsBeforeAlert: number;
  };
  /**
   *
   */
  createdAt: Date;
  /**
   *
   */
  updatedAt: Date;
}

/**
 *
 */
export interface SafetyCheckinCreateData {
  /**
   *
   */
  meetingWith?: string;
  /**
   *
   */
  clientName?: string;
  /**
   *
   */
  clientContact?: string;
  /**
   *
   */
  location: {
    /**
     *
     */
    type: 'Point';
    /**
     *
     */
    coordinates: [number, number]; // [longitude, latitude]
    /**
     *
     */
    address?: string;
    /**
     *
     */
    locationName?: string;
    /**
     *
     */
    city?: string;
    /**
     *
     */
    county?: string;
  };
  /**
   *
   */
  startTime: Date | string;
  /**
   *
   */
  expectedEndTime: Date | string;
  /**
   *
   */
  safetyNotes?: string;
  /**
   *
   */
  checkInMethod?: 'app' | 'sms' | 'email';
  /**
   *
   */
  autoCheckInSettings?: {
    /**
     *
     */
    enabled: boolean;
    /**
     *
     */
    intervalMinutes: number;
    /**
     *
     */
    missedCheckInsBeforeAlert: number;
  };
  /**
   *
   */
  emergencyContacts?: Array;
}

/**
 *
 */
export interface SafetyCheckinUpdateData {
  /**
   *
   */
  meetingWith?: string;
  /**
   *
   */
  clientName?: string;
  /**
   *
   */
  clientContact?: string;
  /**
   *
   */
  location?: {
    /**
     *
     */
    type: 'Point';
    /**
     *
     */
    coordinates: [number, number]; // [longitude, latitude]
    /**
     *
     */
    address?: string;
    /**
     *
     */
    locationName?: string;
    /**
     *
     */
    city?: string;
    /**
     *
     */
    county?: string;
  };
  /**
   *
   */
  startTime?: Date | string;
  /**
   *
   */
  expectedEndTime?: Date | string;
  /**
   *
   */
  safetyNotes?: string;
  /**
   *
   */
  checkInMethod?: 'app' | 'sms' | 'email';
  /**
   *
   */
  autoCheckInSettings?: {
    /**
     *
     */
    enabled: boolean;
    /**
     *
     */
    intervalMinutes: number;
    /**
     *
     */
    missedCheckInsBeforeAlert: number;
  };
}

/**
 *
 */
export interface CheckInResponse {
  /**
   *
   */
  response: 'safe' | 'need_more_time' | 'distress';
  /**
   *
   */
  coordinates?: [number, number]; // [longitude, latitude]
}

/**
 *
 */
export interface EmergencyContact {
  /**
   *
   */
  name: string;
  /**
   *
   */
  phone?: string;
  /**
   *
   */
  email?: string;
  /**
   *
   */
  relationship?: string;
}

/**
 *
 */
export interface SafetySettings {
  /**
   *
   */
  emergencyContacts: Array;
  /**
   *
   */
  safetyCode?: string;
  /**
   *
   */
  distressCode?: string;
  /**
   *
   */
  autoCheckIn: {
    /**
     *
     */
    enabled: boolean;
    /**
     *
     */
    intervalMinutes: number;
    /**
     *
     */
    missedCheckInsBeforeAlert: number;
  };
}

/**
 *
 */
export interface SafetySettingsUpdateData {
  /**
   *
   */
  emergencyContacts?: Array;
  /**
   *
   */
  autoCheckIn?: {
    /**
     *
     */
    enabled: boolean;
    /**
     *
     */
    intervalMinutes: number;
    /**
     *
     */
    missedCheckInsBeforeAlert: number;
  };
  /**
   *
   */
  generateNewCodes?: boolean;
}
