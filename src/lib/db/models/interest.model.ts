import mongoose, { Schema, Document } from "mongoose";

export interface IInterest extends Document {
  _id: string;
  userId?: string;
  propertyId: string;
  userName?: string;
  userEmail: string;
  userPhone?: string;
  message?: string;
  status: "new" | "contacted" | "closed";
  createdAt: Date;
  updatedAt: Date;
}

const InterestSchema = new Schema<IInterest>(
  {
    userId: {
      type: String,
      required: false,
      ref: "User",
    },
    propertyId: {
      type: String,
      required: true,
      ref: "Property",
    },
    userName: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    userEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    userPhone: {
      type: String,
      required: false,
      trim: true,
      minlength: 10,
      maxlength: 15,
    },
    message: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    status: {
      type: String,
      enum: ["new", "contacted", "closed"],
      default: "new",
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "interests",
  }
);

InterestSchema.index({ userId: 1 });
InterestSchema.index({ propertyId: 1 });
InterestSchema.index({ status: 1 });
InterestSchema.index({ createdAt: -1 });
InterestSchema.index({ userEmail: 1 }); //email index for guest user lookups

// Compound index to allow multiple interests per property from different emails
InterestSchema.index({ userEmail: 1, propertyId: 1 }, { unique: true });

export const Interest =
  mongoose.models.Interest ||
  mongoose.model<IInterest>("Interest", InterestSchema);
