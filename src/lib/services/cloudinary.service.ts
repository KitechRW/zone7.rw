import { v2 as cloudinary } from "cloudinary";
import logger from "../utils/logger";
import { ApiError } from "../utils/apiError";

export interface UploadProgress {
  progress: number;
  status: "uploading" | "processing" | "completed" | "error";
  message: string;
}

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export class CloudinaryService {
  static async uploadImage(
    file: File,
    folder: string = "real-estate",
    onProgress?: (progress: UploadProgress) => void
  ): Promise<string> {
    try {
      onProgress?.({
        progress: 20,
        status: "uploading",
        message: "Preparing upload...",
      });

      // Convert File to buffer for server-side upload
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      onProgress?.({
        progress: 40,
        status: "uploading",
        message: "Uploading to Cloudinary...",
      });

      // Upload to cloudinary using buffer
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder,
              resource_type: "image",
              format: "webp",
              transformation: [
                { width: 1920, height: 1080, crop: "limit", quality: "auto" },
              ],
            },
            (error, result) => {
              if (error) {
                logger.error("Cloudinary upload_stream error:", error);
                reject(error);
              } else {
                resolve(result);
              }
            }
          )
          .end(buffer);
      });

      onProgress?.({
        progress: 80,
        status: "processing",
        message: "Processing image...",
      });

      onProgress?.({
        progress: 100,
        status: "completed",
        message: "Upload completed!",
      });

      return (result as { secure_url: string }).secure_url;
    } catch (error) {
      logger.error("Cloudinary upload error details:", error);
      logger.error("Cloudinary upload error:", error);

      onProgress?.({
        progress: 0,
        status: "error",
        message: "Upload failed. Please try again.",
      });

      // Provide more specific error messages
      if (error && typeof error === "object" && "message" in error) {
        const errorMessage = (error as { message: string }).message;
        if (
          errorMessage.includes("Must supply api_key") ||
          errorMessage.includes("Invalid API Key")
        ) {
          throw ApiError.internalServer(
            "Cloudinary API key is missing or invalid. Please check your NEXT_PUBLIC_CLOUDINARY_API_KEY environment variable."
          );
        } else if (errorMessage.includes("Invalid API Secret")) {
          throw ApiError.internalServer(
            "Cloudinary API secret is invalid. Please check your CLOUDINARY_API_SECRET environment variable."
          );
        } else if (errorMessage.includes("Invalid cloud name")) {
          throw ApiError.internalServer(
            "Cloudinary cloud name is invalid. Please check your NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME environment variable."
          );
        }
      }

      throw ApiError.internalServer("Failed to upload image to cloud storage");
    }
  }

  static async uploadMultipleImages(
    files: File[],
    folder: string = "real-estate",
    onProgress?: (progress: UploadProgress, index: number) => void
  ): Promise<string[]> {
    const uploadPromises = files.map((file, index) =>
      this.uploadImage(file, folder, (progress) =>
        onProgress?.(progress, index)
      )
    );

    try {
      const results = await Promise.all(uploadPromises);
      return results;
    } catch (error) {
      logger.error("Multiple upload error:", error);
      throw ApiError.internalServer("Failed to upload one or more images");
    }
  }

  static async deleteImage(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      logger.error("Cloudinary delete error:", error);
      logger.error("Cloudinary delete error:", error);
      throw ApiError.internalServer("Failed to delete image");
    }
  }

  static async deleteMultipleImages(publicIds: string[]): Promise<void> {
    try {
      await cloudinary.api.delete_resources(publicIds);
    } catch (error) {
      logger.error("Cloudinary batch delete error:", error);
      logger.error("Cloudinary batch delete error:", error);
      throw ApiError.internalServer("Failed to delete images");
    }
  }

  static extractPublicId(url: string): string {
    try {
      const parts = url.split("/");
      const filename = parts[parts.length - 1];
      const publicIdWithExtension = filename.split(".")[0];

      // Handle versioned URLs (remove version if present)
      const versionRegex = /^v\d+_(.+)$/;
      const match = publicIdWithExtension.match(versionRegex);

      if (match) {
        return match[1];
      }

      return publicIdWithExtension;
    } catch (error) {
      logger.error("Error extracting public ID from URL:", url, error);
      return url; // Fallback to original URL
    }
  }

  static getOptimizedUrl(url: string, width?: number, height?: number): string {
    if (!url) return "";

    try {
      const transformations = [];

      if (width && height) {
        transformations.push(`w_${width},h_${height},c_fill`);
      } else if (width) {
        transformations.push(`w_${width}`);
      } else if (height) {
        transformations.push(`h_${height}`);
      }
      transformations.push("q_auto,f_auto");

      const transformString = transformations.join(",");

      return url.replace("/upload/", `/upload/${transformString}/`);
    } catch (error) {
      logger.error("Error optimizing URL:", error);
      return url; // Return original URL if optimization fails
    }
  }

  private static async fileToBuffer(file: File): Promise<Buffer> {
    const bytes = await file.arrayBuffer();
    return Buffer.from(bytes);
  }

  private static fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      // Only use FileReader in browser environment
      if (typeof window !== "undefined" && window.FileReader) {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
      } else {
        reject(new Error("FileReader is not available in this environment"));
      }
    });
  }
}
