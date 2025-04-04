export interface User {
  _id: string;
  username: string;
  email: string;
  role: 'user' | 'advertiser' | 'admin';
  online?: boolean;
  lastActive?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface RegisterDTO {
  username: string;
  email: string;
  password: string;
  role: 'user' | 'advertiser';
}

export interface AuthResponse {
  token: string;
  user: User;
}
