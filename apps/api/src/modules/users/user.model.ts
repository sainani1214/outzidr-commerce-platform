import mongoose, { Schema, Document } from 'mongoose';
import { User as UserType } from '../auth/auth.types';

export interface IUserDocument extends Document {
  email: string;
  passwordHash: string;
  name: string;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
  toUserObject(): UserType;
}

const UserSchema = new Schema<IUserDocument>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    tenantId: {
      type: String,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index: email must be unique per tenant
UserSchema.index({ email: 1, tenantId: 1 }, { unique: true });

// Instance method to convert document to plain User object
UserSchema.methods.toUserObject = function (): UserType {
  return {
    id: this._id.toString(),
    email: this.email,
    name: this.name,
    tenantId: this.tenantId,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export const User = mongoose.model<IUserDocument>('User', UserSchema);
