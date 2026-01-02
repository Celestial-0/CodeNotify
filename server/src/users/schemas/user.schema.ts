import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import type { UserPreferences } from '../dto/user.dto';

// Define the document type with proper id typing
export interface UserDocument extends Document {
  _id: Types.ObjectId;
  id: string;
  email: string;
  password: string;
  name: string;
  phoneNumber?: string;
  role: 'user' | 'admin';
  preferences: UserPreferences;
  isActive: boolean;
  isEmailVerified: boolean;
  refreshToken?: string;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  phoneNumber?: string;

  @Prop({ type: String, enum: ['user', 'admin'], default: 'user' })
  role: string;

  @Prop({
    type: {
      platforms: [
        {
          type: String,
          enum: ['codeforces', 'leetcode', 'codechef', 'atcoder'],
        },
      ],
      alertFrequency: {
        type: String,
        enum: ['immediate', 'daily', 'weekly'],
        default: 'immediate',
      },
      contestTypes: [String],
      notificationChannels: {
        type: {
          whatsapp: { type: Boolean, default: true },
          email: { type: Boolean, default: true },
          push: { type: Boolean, default: false },
        },
        default: {
          whatsapp: true,
          email: true,
          push: false,
        },
      },
      notifyBefore: { type: Number, default: 24 }, // Hours before contest
    },
    default: {
      platforms: ['codeforces', 'leetcode'],
      alertFrequency: 'immediate',
      contestTypes: [],
      notificationChannels: {
        whatsapp: true,
        email: true,
        push: false,
      },
      notifyBefore: 24,
    },
  })
  preferences: UserPreferences;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isEmailVerified: boolean;

  @Prop()
  refreshToken?: string;

  @Prop()
  lastLogin?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Add virtual for id that returns string representation of _id
UserSchema.virtual('id').get(function (this: UserDocument) {
  return this._id.toHexString();
});

// Ensure virtuals are included when converting to JSON
UserSchema.set('toJSON', {
  virtuals: true,
});

// Ensure virtuals are included when converting to Object
UserSchema.set('toObject', {
  virtuals: true,
});
