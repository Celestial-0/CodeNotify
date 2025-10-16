import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import type { UserPreferences } from '../../common/dto/user.dto';

// Define the document type with proper id typing
export interface UserDocument extends Document {
  _id: Types.ObjectId;
  id: string;
  email: string;
  password: string;
  name: string;
  phoneNumber?: string;
  preferences: UserPreferences;
  isActive: boolean;
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
    },
    default: {
      platforms: ['codeforces', 'leetcode'],
      alertFrequency: 'immediate',
      contestTypes: [],
    },
  })
  preferences: UserPreferences;

  @Prop({ default: true })
  isActive: boolean;

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
