export interface Property {
  id: string;
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
  roomTypeImages: RoomTypeImage[];
  youtubeLink?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface RoomTypeImage {
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

export interface CreatePropertyFormData {
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
  youtubeLink?: string;
  mainImageFile: File;
  roomTypeImageUploads: RoomTypeImageUpload[];
  removeRoomTypeImages?: string[];
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
  description: string;
}

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
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PropertyStats {
  totalProperties: number;
  totalSales: number;
  totalRentals: number;
  featuredProperties: number;
  totalValue: number;
}
