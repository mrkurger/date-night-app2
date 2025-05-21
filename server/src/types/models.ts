import { Types } from 'mongoose';

export interface BaseModel {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface BaseSchema {
  _id: string;
  createdAt: string;
  updatedAt: string;
}

export interface ErrorResponse {
  success: false;
  error: string;
  message: string;
}
