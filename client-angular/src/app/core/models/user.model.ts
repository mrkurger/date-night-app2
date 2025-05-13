export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  roles: string[];
  preferences?: {
    theme?: 'default' | 'dark' | 'cosmic' | 'corporate';
    notifications?: {
      email: boolean;
      push: boolean;
      inApp: boolean;
    };
    privacy?: {
      showOnlineStatus: boolean;
      showLastSeen: boolean;
      showReadReceipts: boolean;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}
