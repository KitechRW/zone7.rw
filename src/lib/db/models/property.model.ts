import mongoose, { Document, Schema } from "mongoose";

export interface IRoomType {
  url: string;
  roomType:
    | "living_room"
    | "bedroom"
    | "bathroom"
    | "kitchen"
    | "dining_room"
    | "balcony"
    | "exterior"
    | "other";
  description?: string;
}

export interface IProperty extends Document {
  _id: string;
  title: string;
  type: "house" | "plot";
  category: "sale" | "rent";
  price: number;
  bedrooms?: number;
  bathrooms?: number;
  area: number;
  location: string;
  featured: boolean;
  description: string;
  features: string[];
  mainImage: string;
  roomTypeImages: IRoomType[];
  youtubeLink?: string;
  createdBy: mongoose.Types.ObjectId;
  createdByRole: "admin" | "broker";
  createdAt: Date;
  updatedAt: Date;
}

const RoomTypeSchema = new Schema({
  url: {
    type: String,
    required: true,
    validate: {
      validator: function (url: string) {
        return /^https:\/\/res\.cloudinary\.com\//.test(url);
      },
      message: "Image must be a valid Cloudinary URL",
    },
  },
  roomType: {
    type: String,
    required: true,
    enum: {
      values: [
        "living_room",
        "bedroom",
        "bathroom",
        "kitchen",
        "dining_room",
        "balcony",
        "exterior",
        "other",
      ],
      message: "Invalid room type",
    },
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, "Description cannot exceed 200 characters"],
  },
});

const PropertySchema = new Schema<IProperty>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    type: {
      type: String,
      required: [true, "Type is required"],
      enum: {
        values: ["house", "plot"],
        message: "Type must be either house or plot",
      },
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: {
        values: ["sale", "rent"],
        message: "Category must be either sale or rent",
      },
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    bedrooms: {
      type: Number,
      min: [1, "Bedrooms must be at least 1"],
      required: function (this: IProperty) {
        return this.type === "house";
      },
    },
    bathrooms: {
      type: Number,
      min: [1, "Bathrooms must be at least 1"],
      required: function (this: IProperty) {
        return this.type === "house";
      },
    },
    area: {
      type: Number,
      required: [true, "Area is required"],
      min: [1, "Area must be at least 1"],
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
      maxlength: [300, "Location cannot exceed 300 characters"],
    },
    featured: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    features: {
      type: [String],
      default: [],
      validate: {
        validator: function (features: string[]) {
          return features.length <= 20;
        },
        message: "Cannot have more than 20 features",
      },
    },
    mainImage: {
      type: String,
      required: [true, "Main image is required"],
      validate: {
        validator: function (url: string) {
          return /^https:\/\/res\.cloudinary\.com\//.test(url);
        },
        message: "Main image must be a valid Cloudinary URL",
      },
    },
    roomTypeImages: {
      type: [RoomTypeSchema],
      default: [],
      validate: {
        validator: function (roomTypeImages: IRoomType[]) {
          return roomTypeImages.length <= 20;
        },
        message: "Cannot have more than 20 room images",
      },
    },
    youtubeLink: {
      type: String,
      trim: true,
      validate: {
        validator: function (url: string) {
          if (!url) return true;

          // Validate YouTube URL format
          const youtubeRegex =
            /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/)|youtu\.be\/)[\w-]+/;
          return youtubeRegex.test(url);
        },
        message: "Must be a valid YouTube URL",
      },
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Creator ID is required"],
      index: true,
    },
    createdByRole: {
      type: String,
      enum: ["admin", "broker"],
      required: [true, "User role is required"],
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (_doc, ret) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { _id, __v, ...cleanRet } = ret;
        return { ...cleanRet, id: _id };
      },
    },
  }
);

PropertySchema.index({ type: 1, category: 1 });
PropertySchema.index({ price: 1 });
PropertySchema.index({ featured: -1, createdAt: -1 });
PropertySchema.index({ location: "text", title: "text", description: "text" });
PropertySchema.index({ createdBy: 1, createdAt: -1 });
PropertySchema.index({ createdByRole: 1, createdAt: -1 });

PropertySchema.pre("save", function (next) {
  if (this.type === "plot") {
    this.bedrooms = undefined;
    this.bathrooms = undefined;
  }
  next();
});

export const Property =
  mongoose.models.Property ||
  mongoose.model<IProperty>("Property", PropertySchema);
