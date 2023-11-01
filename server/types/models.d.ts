import { Document } from "mongoose";

interface IUser extends Document {
  _id: string;
  avatar: { url: string; localPath: string };
  username: string;
  email: string;
  password: string;
  role: string;
  loginType: string;
  isEmailVerified: boolean;
  refreshToken: string | null;
  forgotPasswordToken: string | null;
  forgotPasswordExpiry: Date | null;
  emailVerificationToken: string | null;
  emailVerificationExpiry: Date | null;
  profilePhoto: string | null;
  generateAccessToken: () => string;
  generateRefreshToken: () => string;
  isPasswordCorrect: (password: string) => boolean;
  generateTemporaryToken: () => {
    unHashedToken: string;
    hashedToken: string;
    tokenExpiry: Date;
  };
}

export interface IChatMessage extends Document {
  sender: Schema.Types.ObjectId;
  content: string;
  attachments: Array<{
    url: string;
    localPath: string;
  }>;
  chat: Schema.Types.ObjectId;
}

export interface IChat extends Document {
  name: string;
  isGroupChat: boolean;
  lastMessage: Schema.Types.ObjectId;
  participants: Schema.Types.ObjectId[];
  admin: Schema.Types.ObjectId;
}
