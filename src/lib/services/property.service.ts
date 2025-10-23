import mongoose, { FilterQuery } from "mongoose";
import DBConnection from "../db/connect";
import { IProperty, Property, IRoomType } from "../db/models/property.model";
import { ApiError } from "../utils/apiError";
import logger from "../utils/logger";
import { UserRole } from "../utils/permission";
import { CloudinaryService } from "./cloudinary.service";

export interface PropertyFilters {
  type?: "house" | "plot" | "all";
  category?: "sale" | "rent" | "all";
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  minArea?: number;
  maxArea?: number;
  featured?: boolean;
  location?: string;
  search?: string;
  createdBy?: string;
}

export interface RoomTypeImageUpload {
  file: File;
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

export interface CreatePropertyData {
  title: string;
  type: "house" | "plot";
  category: "sale" | "rent";
  price: number;
  bedrooms?: number;
  bathrooms?: number;
  area: number;
  location: string;
  featured?: boolean;
  description: string;
  features?: string[];
  mainImageFile: File;
  roomTypeImageUploads?: RoomTypeImageUpload[];
  youtubeLink?: string;
}

export interface UpdatePropertyData extends Partial<CreatePropertyData> {
  id?: string;
  removeRoomTypeImages?: string[];
  mainImage?: string;
  roomTypeImages?: IRoomType[];
}

type Query = FilterQuery<IProperty>;

export class PropertyService {
  static async createProperty(
    data: CreatePropertyData,
    userId: string,
    userRole: UserRole
  ): Promise<IProperty> {
    try {
      // Connect to database
      await DBConnection.getInstance().connect();

      const userExists = await mongoose.model("User").findById(userId);

      if (!userExists) {
        throw new ApiError(400, "Invalid user, creator not found");
      }

      let mainImageUrl: string;
      let roomTypeImages: IRoomType[] = [];

      try {
        // Upload main image
        mainImageUrl = await CloudinaryService.uploadImage(
          data.mainImageFile,
          `real-estate/${data.type}s/main`
        );
      } catch (error) {
        logger.error("PropertyService: Failed to upload main image:", error);
        throw new ApiError(
          400,
          "Failed to upload main image. Please check the file and try again."
        );
      }

      // Upload room images if provided
      if (data.roomTypeImageUploads && data.roomTypeImageUploads.length > 0) {
        try {
          const roomTypeImagePromises = data.roomTypeImageUploads.map(
            async (roomUpload, index) => {
              try {
                const url = await CloudinaryService.uploadImage(
                  roomUpload.file,
                  `real-estate/${data.type}s/rooms`
                );
                return {
                  url,
                  roomType: roomUpload.roomType,
                  description: roomUpload.description || "",
                };
              } catch (error) {
                logger.error(
                  `PropertyService: Failed to upload room image ${index + 1}:`,
                  error
                );
                throw error;
              }
            }
          );

          roomTypeImages = await Promise.all(roomTypeImagePromises);
        } catch (error) {
          logger.error("PropertyService: Failed to upload room images:", error);

          // Clean up main image if room image upload fails
          try {
            const mainImagePublicId =
              CloudinaryService.extractPublicId(mainImageUrl);
            await CloudinaryService.deleteImage(mainImagePublicId);
          } catch (cleanupError) {
            logger.error(
              "PropertyService: Failed to cleanup main image:",
              cleanupError
            );
          }

          throw new ApiError(
            400,
            "Failed to upload room images. Please check the files and try again."
          );
        }
      }

      // Prepare property data
      const propertyData = {
        title: data.title.trim(),
        type: data.type,
        category: data.category,
        price: data.price,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        area: data.area,
        location: data.location.trim(),
        featured: data.featured || false,
        description: data.description.trim(),
        features: data.features || [],
        mainImage: mainImageUrl,
        roomTypeImages: roomTypeImages,
        youtubeLink: data.youtubeLink?.trim() || undefined,
        createdBy: new mongoose.Types.ObjectId(userId),
        createdByRole: userRole,
      };

      try {
        const property = new Property(propertyData);
        await property.save();

        return property;
      } catch (error) {
        logger.error("PropertyService: Database save failed:", error);

        // Clean up uploaded images if database save fails
        try {
          const imagesToCleanup = [
            mainImageUrl,
            ...roomTypeImages.map((img) => img.url),
          ];
          const publicIds = imagesToCleanup.map((url) =>
            CloudinaryService.extractPublicId(url)
          );
          await CloudinaryService.deleteMultipleImages(publicIds);
        } catch (cleanupError) {
          logger.error(
            "PropertyService: Failed to cleanup images after database failure:",
            cleanupError
          );
        }

        if (error instanceof Error && error.name === "ValidationError") {
          throw new ApiError(
            400,
            `Property validation failed: ${error.message}`
          );
        }

        throw new ApiError(500, "Failed to save property to database");
      }
    } catch (error) {
      logger.error("PropertyService: Create property error:", error);

      if (error instanceof ApiError) {
        throw error;
      }

      logger.error("PropertyService: Unexpected error in createProperty:", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        data: {
          title: data.title,
          type: data.type,
          category: data.category,
          hasMainImage: !!data.mainImageFile,
          roomImagesCount: data.roomTypeImageUploads?.length || 0,
        },
      });

      throw new ApiError(
        500,
        "An unexpected error occurred while creating the property"
      );
    }
  }

  static async updateProperty(
    data: UpdatePropertyData,
    requesterId: string,
    requesterRole: string
  ): Promise<IProperty> {
    await DBConnection.getInstance().connect();

    try {
      const existingProperty = await Property.findById(data.id);

      if (!existingProperty) {
        throw new ApiError(404, "Property not found");
      }

      const isAdmin = requesterRole === "admin";
      const isCreator = existingProperty.createdBy.toString() === requesterId;

      if (!isAdmin && !isCreator) {
        throw new ApiError(403, "You can only update properties you created");
      }

      let roomTypeImages = [...existingProperty.roomTypeImages];
      let mainImage = existingProperty.mainImage;

      // Remove specified roomType images
      if (data.removeRoomTypeImages && data.removeRoomTypeImages.length > 0) {
        const publicIds = data.removeRoomTypeImages.map((url) =>
          CloudinaryService.extractPublicId(url)
        );

        await CloudinaryService.deleteMultipleImages(publicIds);

        roomTypeImages = roomTypeImages.filter(
          (roomImg) => !data.removeRoomTypeImages!.includes(roomImg.url)
        );
      }

      // Upload new main image if provided
      if (data.mainImageFile) {
        // Delete old main image
        const oldMainImagePublicId =
          CloudinaryService.extractPublicId(mainImage);
        await CloudinaryService.deleteImage(oldMainImagePublicId);

        // Upload new main image
        mainImage = await CloudinaryService.uploadImage(
          data.mainImageFile,
          `real-estate/${data.type || existingProperty.type}s/main`
        );
      }

      // Upload new roomType images if provided
      if (data.roomTypeImageUploads && data.roomTypeImageUploads.length > 0) {
        const newRoomTypeImagePromises = data.roomTypeImageUploads.map(
          async (roomUpload) => {
            const url = await CloudinaryService.uploadImage(
              roomUpload.file,
              `real-estate/${data.type || existingProperty.type}s/rooms`
            );
            return {
              url,
              roomType: roomUpload.roomType,
              description: roomUpload.description || "",
            };
          }
        );

        const newRoomTypeImages = await Promise.all(newRoomTypeImagePromises);

        roomTypeImages = [...roomTypeImages, ...newRoomTypeImages];
      }

      const updateData: UpdatePropertyData = {
        ...data,
        roomTypeImages,
        mainImage,
      };

      // Clean up update data
      delete updateData.id;
      delete updateData.mainImageFile;
      delete updateData.roomTypeImageUploads;
      delete updateData.removeRoomTypeImages;

      const updatedProperty = await Property.findByIdAndUpdate(
        data.id,
        updateData,
        { new: true, runValidators: true }
      );

      if (!updatedProperty) {
        throw new ApiError(400, "Failed to update property");
      }

      return updatedProperty;
    } catch (error) {
      logger.error("Update property error:", error);

      if (error instanceof ApiError) {
        throw error;
      }

      throw new ApiError(500, "Failed to update property");
    }
  }

  static async deleteProperty(
    id: string,
    requesterId: string,
    requesterRole: string
  ): Promise<boolean> {
    await DBConnection.getInstance().connect();

    try {
      const property = await Property.findById(id);

      if (!property) {
        throw new ApiError(404, "Property not found");
      }

      const isAdmin = requesterRole === "admin";
      // Debug logs for permission check
      logger.info("DeleteProperty Debug", {
        propertyId: id,
        propertyCreatedBy:
          property.createdBy?.toString?.() ?? property.createdBy,
        requesterId,
        requesterRole,
      });
      const isCreator = property.createdBy.toString() === requesterId;

      if (!isAdmin && !isCreator) {
        logger.warn("DeleteProperty Forbidden", {
          propertyId: id,
          propertyCreatedBy:
            property.createdBy?.toString?.() ?? property.createdBy,
          requesterId,
          requesterRole,
        });
        throw new ApiError(403, "You can only delete properties you created");
      }

      // Collect all image URLs to delete
      const imageUrls = [
        property.mainImage,
        ...property.roomTypeImages.map((img: IRoomType) => img.url),
      ];
      const publicIds = imageUrls.map((url) =>
        CloudinaryService.extractPublicId(url)
      );

      if (publicIds.length > 0) {
        await CloudinaryService.deleteMultipleImages(publicIds);
      }

      await Property.findByIdAndDelete(id);
      return true;
    } catch (error) {
      logger.error("Delete property error:", error);

      if (error instanceof ApiError) {
        throw error;
      }

      throw new ApiError(500, "Failed to delete property");
    }
  }

  static async getProperty(id: string): Promise<IProperty | null> {
    await DBConnection.getInstance().connect();

    try {
      const property = await Property.findById(id);
      return property;
    } catch (error) {
      logger.error("Get property error:", error);
      throw new ApiError(500, "Failed to fetch property");
    }
  }

  static async getProperties(
    filters: PropertyFilters = {},
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder: "asc" | "desc" = "desc"
  ): Promise<{ properties: IProperty[]; total: number; pages: number }> {
    await DBConnection.getInstance().connect();

    try {
      const query: Query = {};

      // Apply filters
      if (filters.type && filters.type !== "all") {
        query.type = filters.type;
      }

      if (filters.category && filters.category !== "all") {
        query.category = filters.category;
      }

      if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
        query.price = {};
        if (filters.minPrice !== undefined) query.price.$gte = filters.minPrice;
        if (filters.maxPrice !== undefined) query.price.$lte = filters.maxPrice;
      }

      if (filters.bedrooms !== undefined && filters.bedrooms > 0) {
        query.bedrooms = { $gte: filters.bedrooms };
      }

      if (filters.bathrooms !== undefined && filters.bathrooms > 0) {
        query.bathrooms = { $gte: filters.bathrooms };
      }

      if (filters.minArea !== undefined || filters.maxArea !== undefined) {
        query.area = {};
        if (filters.minArea !== undefined) query.area.$gte = filters.minArea;
        if (filters.maxArea !== undefined) query.area.$lte = filters.maxArea;
      }

      if (filters.featured !== undefined) {
        query.featured = filters.featured;
      }

      if (filters.location) {
        query.location = { $regex: filters.location, $options: "i" };
      }

      if (filters.search) {
        query.$or = [
          { title: { $regex: filters.search, $options: "i" } },
          { description: { $regex: filters.search, $options: "i" } },
          { location: { $regex: filters.search, $options: "i" } },
        ];
      }

      const skip = (page - 1) * limit;
      const sort: Record<string, 1 | -1> = {};
      sort[sortBy] = sortOrder === "desc" ? -1 : 1;

      const [properties, total] = await Promise.all([
        Property.find(query).sort(sort).skip(skip).limit(limit),
        Property.countDocuments(query),
      ]);

      return {
        properties,
        total,
        pages: Math.ceil(total / limit),
      };
    } catch (error) {
      logger.error("Get properties error:", error);
      throw new ApiError(500, "Failed to fetch properties");
    }
  }

  static async getBrokerProperties(
    filters: PropertyFilters = {},
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder: "asc" | "desc" = "desc",
    requesterId?: string,
    requesterRole?: string
  ): Promise<{ properties: IProperty[]; total: number; pages: number }> {
    await DBConnection.getInstance().connect();

    try {
      const query: Query = {};

      // Apply filters
      if (filters.type && filters.type !== "all") {
        query.type = filters.type;
      }

      if (filters.category && filters.category !== "all") {
        query.category = filters.category;
      }

      if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
        query.price = {};
        if (filters.minPrice !== undefined) query.price.$gte = filters.minPrice;
        if (filters.maxPrice !== undefined) query.price.$lte = filters.maxPrice;
      }

      if (filters.bedrooms !== undefined && filters.bedrooms > 0) {
        query.bedrooms = { $gte: filters.bedrooms };
      }

      if (filters.bathrooms !== undefined && filters.bathrooms > 0) {
        query.bathrooms = { $gte: filters.bathrooms };
      }

      if (filters.minArea !== undefined || filters.maxArea !== undefined) {
        query.area = {};
        if (filters.minArea !== undefined) query.area.$gte = filters.minArea;
        if (filters.maxArea !== undefined) query.area.$lte = filters.maxArea;
      }

      if (filters.featured !== undefined) {
        query.featured = filters.featured;
      }

      if (filters.location) {
        query.location = { $regex: filters.location, $options: "i" };
      }

      if (filters.search) {
        query.$or = [
          { title: { $regex: filters.search, $options: "i" } },
          { description: { $regex: filters.search, $options: "i" } },
          { location: { $regex: filters.search, $options: "i" } },
        ];
      }

      //If Broker, only show their properties
      if (requesterRole !== "admin" && requesterId) {
        query.createdBy = new mongoose.Types.ObjectId(requesterId);
      }

      const skip = (page - 1) * limit;
      const sort: Record<string, 1 | -1> = {};
      sort[sortBy] = sortOrder === "desc" ? -1 : 1;

      const [properties, total] = await Promise.all([
        Property.find(query).sort(sort).skip(skip).limit(limit),
        Property.countDocuments(query),
      ]);

      return {
        properties,
        total,
        pages: Math.ceil(total / limit),
      };
    } catch (error) {
      logger.error("Get properties error:", error);
      throw new ApiError(500, "Failed to fetch properties");
    }
  }

  static async getFeaturedProperties(limit = 6): Promise<IProperty[]> {
    await DBConnection.getInstance().connect();

    try {
      const properties = await Property.find({ featured: true })
        .sort({ createdAt: -1 })
        .limit(limit);

      return properties;
    } catch (error) {
      logger.error("Error getting featured properties:", error);
      throw new ApiError(500, "Failed to fetch featured properties");
    }
  }

  static async getStats(
    requesterId: string,
    requesterRole: string
  ): Promise<{
    totalProperties: number;
    totalSales: number;
    totalRentals: number;
    featuredProperties: number;
    totalValue: number;
  }> {
    await DBConnection.getInstance().connect();

    try {
      const query: Query =
        requesterRole !== "admin"
          ? { createdBy: new mongoose.Types.ObjectId(requesterId) }
          : {};

      const [
        totalProperties,
        totalSales,
        totalRentals,
        featuredProperties,
        totalValueResult,
      ] = await Promise.all([
        Property.countDocuments(query),
        Property.countDocuments({ ...query, category: "sale" }),
        Property.countDocuments({ ...query, category: "rent" }),
        Property.countDocuments({ ...query, featured: true }),
        Property.aggregate([
          { $match: query },
          { $group: { _id: null, total: { $sum: "$price" } } },
        ]),
      ]);

      return {
        totalProperties,
        totalSales,
        totalRentals,
        featuredProperties,
        totalValue: totalValueResult[0]?.total || 0,
      };
    } catch (error) {
      logger.error("Error getting stats:", error);
      throw new ApiError(500, "Failed to fetch statistics");
    }
  }
}
