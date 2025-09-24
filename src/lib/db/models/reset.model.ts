import mongoose, { Schema, Document } from "mongoose";

export interface IPasswordReset extends Document {
  _id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  used: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PasswordResetSchema = new Schema<IPasswordReset>(
  {
    userId: {
      type: String,
      required: true,
      ref: "User",
    },
    token: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
    },
    used: {
      type: Boolean,
      default: false,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "password_resets",
  }
);

PasswordResetSchema.index({ userId: 1 });
PasswordResetSchema.index({ token: 1 }, { unique: true });
PasswordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Auto-delete expired tokens
PasswordResetSchema.index({ createdAt: 1 });

PasswordResetSchema.statics.cleanupExpiredTokens = async function () {
  await this.deleteMany({
    $or: [
      { expiresAt: { $lt: new Date() } },
      {
        used: true,
        createdAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    ],
  });
};

export const PasswordReset =
  mongoose.models.PasswordReset ||
  mongoose.model<IPasswordReset>("PasswordReset", PasswordResetSchema);
