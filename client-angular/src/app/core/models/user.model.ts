/**
 *
 */
export interface IUser {
  /**
   *
   */
  id: string;
  /**
   *
   */
  username: string;
  /**
   *
   */
  email: string;
  /**
   *
   */
  roles: string[];
  /**
   *
   */
  status: 'active' | 'banned' | 'suspended';
  /**
   *
   */
  createdAt: Date;
  /**
   *
   */
  lastLogin?: Date;
  /**
   *
   */
  profile?: {
    /**
     *
     */
    firstName?: string;
    /**
     *
     */
    lastName?: string;
    /**
     *
     */
    avatar?: string;
    /**
     *
     */
    bio?: string;
    /**
     *
     */
    location?: {
      /**
       *
       */
      city?: string;
      /**
       *
       */
      country?: string;
    };
  };
  /**
   *
   */
  preferences?: {
    /**
     *
     */
    emailNotifications: boolean;
    /**
     *
     */
    pushNotifications: boolean;
    /**
     *
     */
    theme: 'light' | 'dark';
    /**
     *
     */
    language: string;
  };
  /**
   *
   */
  stats?: {
    /**
     *
     */
    totalLogins: number;
    /**
     *
     */
    totalPosts: number;
    /**
     *
     */
    totalLikes: number;
    /**
     *
     */
    reputation: number;
  };
  /**
   *
   */
  metadata?: {
    /**
     *
     */
    browser?: string;
    /**
     *
     */
    platform?: string;
    /**
     *
     */
    lastIp?: string;
  };
}
