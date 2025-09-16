import { NextRequest, NextResponse } from "next/server";
import {
  PropertyService,
  UpdatePropertyData,
  RoomTypeImageUpload,
} from "../services/property.service";
import { ErrorMiddleware } from "../middleware/error.middleware";

export class PropertyController {
  static createProperty = ErrorMiddleware.catchAsync(
    async (req: NextRequest): Promise<NextResponse> => {
      try {
        const formData = await req.formData();

        // Extract basic data
        const title = formData.get("title") as string;
        const type = formData.get("type") as "house" | "plot";
        const category = formData.get("category") as "sale" | "rent";
        const price = parseInt(formData.get("price") as string);
        const area = parseInt(formData.get("area") as string);
        const location = formData.get("location") as string;
        const description = formData.get("description") as string;
        const featured = formData.get("featured") === "true";

        // Extract optional fields
        const bedrooms = formData.get("bedrooms")
          ? parseInt(formData.get("bedrooms") as string)
          : undefined;

        const bathrooms = formData.get("bathrooms")
          ? parseInt(formData.get("bathrooms") as string)
          : undefined;

        const features = formData.getAll("features") as string[];

        // Extract main image file
        const mainImageFile = formData.get("mainImage") as File;

        // Extract roomType image uploads
        const roomTypeImageUploads: RoomTypeImageUpload[] = [];
        const roomTypeImageFiles = formData.getAll("roomTypeImages") as File[];
        const roomTypes = formData.getAll("roomTypes") as string[];
        const roomDescriptions = formData.getAll(
          "roomDescriptions"
        ) as string[];

        // Process roomType images with their metadata
        roomTypeImageFiles.forEach((file, index) => {
          if (file && file.size > 0) {
            roomTypeImageUploads.push({
              file,
              roomType:
                (roomTypes[index] as RoomTypeImageUpload["roomType"]) ||
                "other",
              description: roomDescriptions[index] || "",
            });
          }
        });

        // Validation
        if (!title || title.trim().length === 0) {
          return NextResponse.json(
            { error: "Property title is required" },
            { status: 400 }
          );
        }

        if (!type || !["house", "plot"].includes(type)) {
          return NextResponse.json(
            { error: "Valid property type is required (house or plot)" },
            { status: 400 }
          );
        }

        if (!category || !["sale", "rent"].includes(category)) {
          return NextResponse.json(
            { error: "Valid category is required (sale or rent)" },
            { status: 400 }
          );
        }

        if (!price || isNaN(price) || price <= 0) {
          return NextResponse.json(
            { error: "Valid price is required" },
            { status: 400 }
          );
        }

        if (!area || isNaN(area) || area <= 0) {
          return NextResponse.json(
            { error: "Valid area is required" },
            { status: 400 }
          );
        }

        if (!location || location.trim().length === 0) {
          return NextResponse.json(
            { error: "Property location is required" },
            { status: 400 }
          );
        }

        if (!description || description.trim().length === 0) {
          return NextResponse.json(
            { error: "Property description is required" },
            { status: 400 }
          );
        }

        if (!mainImageFile || mainImageFile.size === 0) {
          return NextResponse.json(
            { error: "Main property image is required" },
            { status: 400 }
          );
        }

        // Additional validation for house type
        if (type === "house") {
          if (!bedrooms || isNaN(bedrooms) || bedrooms < 1) {
            return NextResponse.json(
              { error: "Valid number of bedrooms is required for house type" },
              { status: 400 }
            );
          }
          if (!bathrooms || isNaN(bathrooms) || bathrooms < 1) {
            return NextResponse.json(
              { error: "Valid number of bathrooms is required for house type" },
              { status: 400 }
            );
          }
        }

        const propertyData = {
          title: title.trim(),
          type,
          category,
          price,
          bedrooms,
          bathrooms,
          area,
          location: location.trim(),
          featured,
          description: description.trim(),
          features: features.filter((f) => f && f.trim().length > 0),
          mainImageFile,
          roomTypeImageUploads,
        };

        const property = await PropertyService.createProperty(propertyData);

        const propertyResponse = property.toJSON
          ? property.toJSON()
          : property.toObject();

        return NextResponse.json(
          {
            success: true,
            message: "Property created successfully",
            property: propertyResponse,
          },
          { status: 201 }
        );
      } catch (error: unknown) {
        console.error("Detailed create property error:", {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          name: error instanceof Error ? error.name : undefined,
        });

        // Re-throw to let ErrorMiddleware handle it
        throw error;
      }
    }
  );

  static updateProperty = ErrorMiddleware.catchAsync(
    async (req: NextRequest): Promise<NextResponse> => {
      const formData = await req.formData();
      const id = formData.get("id") as string;

      if (!id) {
        return NextResponse.json(
          { error: "Property ID is required" },
          { status: 400 }
        );
      }

      // Extract data (similar to create but optional)
      const updateData: UpdatePropertyData = { id };

      const title = formData.get("title");
      if (title) updateData.title = title as string;

      const type = formData.get("type");
      if (type) updateData.type = type as "house" | "plot";

      const category = formData.get("category");
      if (category) updateData.category = category as "sale" | "rent";

      const price = formData.get("price");
      if (price) updateData.price = parseInt(price as string);

      const area = formData.get("area");
      if (area) updateData.area = parseInt(area as string);

      const location = formData.get("location");
      if (location) updateData.location = location as string;

      const description = formData.get("description");
      if (description) updateData.description = description as string;

      const featured = formData.get("featured");
      if (featured !== null) updateData.featured = featured === "true";

      const bedrooms = formData.get("bedrooms");
      if (bedrooms) updateData.bedrooms = parseInt(bedrooms as string);

      const bathrooms = formData.get("bathrooms");
      if (bathrooms) updateData.bathrooms = parseInt(bathrooms as string);

      const features = formData.getAll("features") as string[];
      if (features.length > 0)
        updateData.features = features.filter((f) => f.trim());

      const mainImageFile = formData.get("mainImage") as File;
      if (mainImageFile && mainImageFile.size > 0) {
        updateData.mainImageFile = mainImageFile;
      }

      const roomTypeImageFiles = formData.getAll("roomTypeImages") as File[];
      const roomTypes = formData.getAll("roomTypes") as string[];
      const roomDescriptions = formData.getAll("roomDescriptions") as string[];

      const roomTypeImageUploads: RoomTypeImageUpload[] = [];
      roomTypeImageFiles.forEach((file, index) => {
        if (file && file.size > 0) {
          roomTypeImageUploads.push({
            file,
            roomType:
              (roomTypes[index] as RoomTypeImageUpload["roomType"]) || "other",
            description: roomDescriptions[index] || "",
          });
        }
      });

      if (roomTypeImageUploads.length > 0) {
        updateData.roomTypeImageUploads = roomTypeImageUploads;
      }

      // Handle room image removal
      const removeRoomTypeImages = formData.getAll(
        "removeRoomTypeImages"
      ) as string[];
      if (removeRoomTypeImages.length > 0)
        updateData.removeRoomTypeImages = removeRoomTypeImages;

      const property = await PropertyService.updateProperty(updateData);

      const propertyResponse = property.toJSON
        ? property.toJSON()
        : property.toObject();

      return NextResponse.json(
        {
          success: true,
          message: "Property updated successfully",
          property: propertyResponse,
        },
        { status: 200 }
      );
    }
  );

  static deleteProperty = ErrorMiddleware.catchAsync(
    async (req: NextRequest): Promise<NextResponse> => {
      const { searchParams } = new URL(req.url);
      const id = searchParams.get("id");

      if (!id) {
        return NextResponse.json(
          { error: "Property ID is required" },
          { status: 400 }
        );
      }

      await PropertyService.deleteProperty(id);

      return NextResponse.json(
        { success: true, message: "Property deleted successfully" },
        { status: 200 }
      );
    }
  );

  static getProperty = ErrorMiddleware.catchAsync(
    async (req: NextRequest): Promise<NextResponse> => {
      const { searchParams } = new URL(req.url);
      const id = searchParams.get("id");

      if (!id) {
        return NextResponse.json(
          { error: "Property ID is required" },
          { status: 400 }
        );
      }

      const property = await PropertyService.getProperty(id);

      if (!property) {
        return NextResponse.json(
          { error: "Property not found" },
          { status: 404 }
        );
      }

      const propertyResponse = property.toJSON
        ? property.toJSON()
        : property.toObject();

      return NextResponse.json(
        { success: true, property: propertyResponse },
        { status: 200 }
      );
    }
  );

  static getProperties = ErrorMiddleware.catchAsync(
    async (req: NextRequest): Promise<NextResponse> => {
      const { searchParams } = new URL(req.url);

      const filters = {
        type: searchParams.get("type") as "all" | "house" | "plot",
        category: searchParams.get("category") as "sale" | "rent",
        minPrice: searchParams.get("minPrice")
          ? parseInt(searchParams.get("minPrice")!)
          : undefined,
        maxPrice: searchParams.get("maxPrice")
          ? parseInt(searchParams.get("maxPrice")!)
          : undefined,
        bedrooms: searchParams.get("bedrooms")
          ? parseInt(searchParams.get("bedrooms")!)
          : undefined,
        bathrooms: searchParams.get("bathrooms")
          ? parseInt(searchParams.get("bathrooms")!)
          : undefined,
        minArea: searchParams.get("minArea")
          ? parseInt(searchParams.get("minArea")!)
          : undefined,
        maxArea: searchParams.get("maxArea")
          ? parseInt(searchParams.get("maxArea")!)
          : undefined,
        featured: searchParams.get("featured")
          ? searchParams.get("featured") === "true"
          : undefined,
        location: searchParams.get("location") || undefined,
        search: searchParams.get("search") || undefined,
      };

      const page = parseInt(searchParams.get("page") || "1");
      const limit = parseInt(searchParams.get("limit") || "10");
      const sortBy = searchParams.get("sortBy") || "createdAt";
      const sortOrder = (searchParams.get("sortOrder") || "desc") as
        | "asc"
        | "desc";

      const result = await PropertyService.getProperties(
        filters,
        page,
        limit,
        sortBy,
        sortOrder
      );

      const propertiesResponse = result.properties.map((property) =>
        property.toJSON ? property.toJSON() : property.toObject()
      );

      return NextResponse.json(
        {
          success: true,
          properties: propertiesResponse,
          total: result.total,
          pages: result.pages,
        },
        { status: 200 }
      );
    }
  );

  static getFeaturedProperties = ErrorMiddleware.catchAsync(
    async (req: NextRequest): Promise<NextResponse> => {
      const { searchParams } = new URL(req.url);
      const limit = parseInt(searchParams.get("limit") || "6");

      const properties = await PropertyService.getFeaturedProperties(limit);

      // Convert Mongoose documents to plain objects
      const propertiesResponse = properties.map((property) =>
        property.toJSON ? property.toJSON() : property.toObject()
      );

      return NextResponse.json(
        { success: true, properties: propertiesResponse },
        { status: 200 }
      );
    }
  );

  static getStats = ErrorMiddleware.catchAsync(
    async (): Promise<NextResponse> => {
      const stats = await PropertyService.getStats();

      return NextResponse.json({ success: true, stats }, { status: 200 });
    }
  );
}
