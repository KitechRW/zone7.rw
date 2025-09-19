import mongoose, { Schema, Document } from "mongoose";

export interface IInterest extends Document {
  _id: string;
  userId: string;
  propertyId: string;
  userPhone: string;
  message?: string;
  status: "new" | "contacted" | "closed";
  createdAt: Date;
  updatedAt: Date;
}

const InterestSchema = new Schema<IInterest>(
  {
    userId: {
      type: String,
      required: true,
      ref: "User",
    },
    propertyId: {
      type: String,
      required: true,
      ref: "Property",
    },
    userPhone: {
      type: String,
      required: true,
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

// Compound index to ensure one interest per user per property
InterestSchema.index({ userId: 1, propertyId: 1 }, { unique: true });

export const Interest =
  mongoose.models.Interest ||
  mongoose.model<IInterest>("Interest", InterestSchema);
