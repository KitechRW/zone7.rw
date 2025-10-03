import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  _id: string;
  username: string;
  email: string;
  password?: string;
  provider: "credentials";
  role: "owner" | "admin" | "user";
  emailVerified?: Date;
  refreshTokens: Array<{
    token: string;
    expiresAt: Date;
    device?: string;
    userAgent?: string;
    createdAt: Date;
  }>;
  lastLoginAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const RefreshTokenSchema = new Schema({
  token: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  device: { type: String },
  userAgent: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const UserSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      minlength: 8,
      select: false,
    },
    provider: {
      type: String,
      enum: ["credentials"],
      required: true,
      default: "credentials",
    },
    role: {
      type: String,
      enum: ["owner", "admin", "user"],
      required: true,
      default: "user",
    },
    emailVerified: {
      type: Date,
      default: null,
    },
    refreshTokens: [RefreshTokenSchema],
    lastLoginAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: "users",
  }
);

// Indexes for performance
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ username: 1 }, { unique: true });
UserSchema.index({ role: 1 });
UserSchema.index({ "refreshTokens.token": 1 });
UserSchema.index({ "refreshTokens.expiresAt": 1 });

UserSchema.pre("save", function (next) {
  if (this.refreshTokens) {
    this.refreshTokens = this.refreshTokens.filter(
      (token) => token.expiresAt > new Date()
    );
  }
  next();
});

// Static method to clean expired tokens
UserSchema.statics.cleanExpiredTokens = async function () {
  await this.updateMany(
    {},
    {
      $pull: {
        refreshTokens: { expiresAt: { $lt: new Date() } },
      },
    }
  );
};

export const User =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
