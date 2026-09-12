import mongoose, { Schema, type Document } from 'mongoose';

export interface IUser extends Document {
  firebaseUid: string;
  email: string | null;
  displayName: string;
  photoURL: string | null;
  provider: 'google' | 'email' | 'anonymous';
  role: 'user' | 'admin';
  level: number;
  xp: number;
  streakDays: number;
  characterClass: 'Warrior' | 'Mage' | 'Rogue' | 'Paladin';
  avatarIcon: string;
  equippedCharacter: number;
  inventory: string[];
  lastLoginAt: Date;
  loginCount: number;
  isBanned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    firebaseUid: {
      type: String,
      required: [true, 'Firebase UID is required'],
      unique: true,
      immutable: true,
      trim: true,
      maxlength: [128, 'Firebase UID too long'],
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
      maxlength: [254, 'Email too long'],
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email format'],
      default: null,
    },
    displayName: {
      type: String,
      trim: true,
      maxlength: [50, 'Display name cannot exceed 50 characters'],
      default: 'Adventurer',
    },
    photoURL: {
      type: String,
      trim: true,
      maxlength: [2048, 'Photo URL too long'],
      default: null,
    },
    provider: {
      type: String,
      enum: {
        values: ['google', 'email', 'anonymous'],
        message: 'Provider must be google, email, or anonymous',
      },
      required: true,
      default: 'email',
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    level: {
      type: Number,
      default: 1,
      min: 1,
    },
    xp: {
      type: Number,
      default: 0,
      min: 0,
    },
    streakDays: {
      type: Number,
      default: 1,
      min: 0,
    },
    characterClass: {
      type: String,
      enum: ['Warrior', 'Mage', 'Rogue', 'Paladin'],
      default: 'Warrior',
    },
    avatarIcon: {
      type: String,
      default: '0',
    },
    equippedCharacter: {
      type: Number,
      default: 0,
    },
    inventory: {
      type: [String],
      default: [],
    },
    lastLoginAt: {
      type: Date,
      default: Date.now,
    },
    loginCount: {
      type: Number,
      default: 0,
      min: [0, 'Login count cannot be negative'],
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        delete ret.__v;
        delete ret._id;
        return ret;
      },
    },
  }
);

userSchema.index({ createdAt: -1 });

const User = mongoose.model<IUser>('User', userSchema);

export default User;
