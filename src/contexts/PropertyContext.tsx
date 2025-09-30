import {
  CreatePropertyFormData,
  Property,
  PropertyFilters,
  PropertyStats,
  RoomTypeImageUpload,
} from "@/types/Properties";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";

interface PropertyContextType {
  properties: Property[];
  loading: boolean;
  error: string | null;
  stats: PropertyStats | null;
  currentProperty: Property | null;
  pagination: {
    total: number;
    pages: number;
    currentPage: number;
  };

  fetchProperties: (
    filters?: PropertyFilters,
    page?: number,
    limit?: number
  ) => Promise<{ properties: Property[]; total: number; pages: number }>;
  fetchProperty: (id: string) => Promise<Property>;
  createProperty: (data: CreatePropertyFormData) => Promise<Property>;
  updateProperty: (
    id: string,
    data: Partial<CreatePropertyFormData>
  ) => Promise<Property>;
  deleteProperty: (id: string) => Promise<void>;
  fetchFeaturedProperties: (limit?: number) => Promise<Property[]>;
  fetchStats: () => Promise<PropertyStats>;

  setCurrentProperty: (property: Property | null) => void;
  clearError: () => void;
}

const PropertyContext = createContext<PropertyContextType | undefined>(
  undefined
);

class PropertyAPI {
  private static handleResponse = async (response: Response) => {
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || error.message || "API request failed");
    }
    return await response.json();
  };

  static async create(data: CreatePropertyFormData): Promise<Property> {
    const formData = new FormData();

    // Add basic fields
    formData.append("title", data.title);
    formData.append("type", data.type);
    formData.append("category", data.category);
    formData.append("price", data.price.toString());
    formData.append("area", data.area.toString());
    formData.append("location", data.location);
    formData.append("description", data.description);
    formData.append("featured", data.featured.toString());

    // Add optional fields
    if (data.bedrooms) formData.append("bedrooms", data.bedrooms.toString());
    if (data.bathrooms) formData.append("bathrooms", data.bathrooms.toString());

    // Add features
    data.features.forEach((feature) => {
      formData.append("features", feature);
    });

    // Add main image
    if (data.mainImageFile) {
      formData.append("mainImage", data.mainImageFile);
    }

    // Add room images
    data.roomTypeImageUploads.forEach((roomUpload) => {
      formData.append("roomTypeImages", roomUpload.file);
      formData.append("roomTypes", roomUpload.roomType);
      formData.append("roomDescriptions", roomUpload.description || "");
    });

    const response = await fetch("/api/properties", {
      method: "POST",
      body: formData,
    });

    const result = await this.handleResponse(response);
    return result.property;
  }

  static async getAll(
    filters: PropertyFilters = {},
    page: number = 1,
    limit: number = 10
  ): Promise<{
    properties: Property[];
    total: number;
    pages: number;
  }> {
    const params = new URLSearchParams();

    // Add filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });

    // Add pagination
    params.append("page", page.toString());
    params.append("limit", limit.toString());

    const response = await fetch(`/api/properties?${params}`);
    const result = await this.handleResponse(response);

    return {
      properties: result.properties,
      total: result.total,
      pages: result.pages,
    };
  }

  static async getById(id: string): Promise<Property> {
    const response = await fetch(`/api/properties/${id}`);
    const result = await this.handleResponse(response);
    return result.property;
  }

  static async update(
    id: string,
    data: Partial<CreatePropertyFormData> & {
      removeRoomTypeImages?: string[];
    }
  ): Promise<Property> {
    const formData = new FormData();
    formData.append("id", id);

    // Add updated fields
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === "features" && Array.isArray(value)) {
          value.forEach((feature) => {
            if (typeof feature === "object" && feature !== null) {
              if (typeof feature === "object" && feature !== null) {
                formData.append("roomImages", feature.file);
                formData.append("roomTypes", feature.roomType);
                formData.append("roomDescriptions", feature.description || "");
              } else {
                //The case when roomUpload is a string
                formData.append("roomImages", feature);
              }
            }
          });
        } else if (key === "roomTypeImageUploads" && Array.isArray(value)) {
          (value as RoomTypeImageUpload[]).forEach((roomUpload) => {
            formData.append("roomTypeImages", roomUpload.file);
            formData.append("roomTypes", roomUpload.roomType);
            formData.append("roomDescriptions", roomUpload.description || "");
          });
        } else if (key === "mainImageFile") {
          formData.append("mainImage", value as File);
        } else if (key === "removeRoomTypeImages" && Array.isArray(value)) {
          (value as RoomTypeImageUpload[]).forEach((roomUpload) => {
            formData.append("roomTypeImages", roomUpload.file);
            formData.append("roomTypes", roomUpload.roomType);
            formData.append("roomDescriptions", roomUpload.description || "");
          });
        } else if (
          key !== "roomTypeImageUploads" &&
          key !== "removeRoomTypeImages"
        ) {
          formData.append(key, value.toString());
        }
      }
    });

    const response = await fetch(`/api/properties/${id}`, {
      method: "PUT",
      body: formData,
    });

    const result = await this.handleResponse(response);
    return result.property;
  }

  static async delete(id: string): Promise<void> {
    const response = await fetch(`/api/properties/${id}`, {
      method: "DELETE",
    });

    await this.handleResponse(response);
  }

  static async getFeatured(limit: number = 6): Promise<Property[]> {
    const response = await fetch(`/api/properties/featured?limit=${limit}`);
    const result = await this.handleResponse(response);
    return result.properties;
  }

  static async getStats(): Promise<PropertyStats> {
    const response = await fetch("/api/properties/stats");
    const result = await this.handleResponse(response);
    return result.stats;
  }
}

export const PropertyProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<PropertyStats | null>(null);
  const [currentProperty, setCurrentProperty] = useState<Property | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0,
    currentPage: 1,
  });

  const handleError = useCallback((err: unknown) => {
    const message =
      err instanceof Error ? err.message : "An unexpected error occurred";
    setError(message);
    console.error("Property context error:", err);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const fetchProperties = useCallback(
    async (filters?: PropertyFilters, page: number = 1, limit: number = 10) => {
      try {
        setLoading(true);
        clearError();

        const result = await PropertyAPI.getAll(filters, page, limit);

        setProperties(result.properties);

        setPagination({
          total: result.total,
          pages: result.pages,
          currentPage: page,
        });

        return result;
      } catch (err) {
        handleError(err);
        setProperties([]);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [clearError, handleError]
  );

  const fetchProperty = useCallback(
    async (id: string) => {
      try {
        setLoading(true);
        clearError();
        const property = await PropertyAPI.getById(id);
        setCurrentProperty(property);
        return property;
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [clearError, handleError]
  );

  //refresh stats after create, update, delete
  const refreshStats = useCallback(async () => {
    try {
      const statsData = await PropertyAPI.getStats();
      setStats(statsData);
    } catch (err) {
      console.error("Failed to refresh stats:", err);
      //No need to throw error
    }
  }, []);

  const createProperty = useCallback(
    async (data: CreatePropertyFormData) => {
      try {
        setLoading(true);
        clearError();

        const newProperty = await PropertyAPI.create(data);

        // Add to the beginning of the list
        setProperties((prev) => [newProperty, ...prev]);

        // Update pagination if needed
        setPagination((prev) => ({
          ...prev,
          total: prev.total + 1,
        }));

        await refreshStats();

        return newProperty;
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [clearError, handleError, refreshStats]
  );

  const updateProperty = useCallback(
    async (
      id: string,
      data: Partial<CreatePropertyFormData> & {
        removeRoomTypeImages?: string[];
      }
    ) => {
      try {
        setLoading(true);
        clearError();

        const updatedProperty = await PropertyAPI.update(id, data);

        // Update in the list
        setProperties((prev) =>
          prev.map((p) => (p.id === id ? updatedProperty : p))
        );

        // Update current property if it's the one being edited
        if (currentProperty?.id === id) {
          setCurrentProperty(updatedProperty);
        }

        await refreshStats();

        return updatedProperty;
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentProperty?.id, clearError, handleError, refreshStats]
  );

  const deleteProperty = useCallback(
    async (id: string) => {
      try {
        setLoading(true);
        clearError();

        await PropertyAPI.delete(id);

        // Remove from the list
        setProperties((prev) => prev.filter((p) => p.id !== id));

        // Update pagination
        setPagination((prev) => ({
          ...prev,
          total: Math.max(0, prev.total - 1),
        }));

        // Clear current property if it's the one being deleted
        if (currentProperty?.id === id) {
          setCurrentProperty(null);
        }

        await refreshStats();
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentProperty?.id, clearError, handleError, refreshStats]
  );

  const fetchFeaturedProperties = useCallback(
    async (limit?: number) => {
      try {
        setLoading(true);
        clearError();
        const featuredProperties = await PropertyAPI.getFeatured(limit);
        return featuredProperties;
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [clearError, handleError]
  );

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      clearError();
      const statsData = await PropertyAPI.getStats();
      setStats(statsData);
      return statsData;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [clearError, handleError]);

  const value: PropertyContextType = {
    properties,
    loading,
    error,
    stats,
    currentProperty,
    pagination,

    fetchProperties,
    fetchProperty,
    createProperty,
    updateProperty,
    deleteProperty,
    fetchFeaturedProperties,
    fetchStats,

    setCurrentProperty,
    clearError,
  };

  return (
    <PropertyContext.Provider value={value}>
      {children}
    </PropertyContext.Provider>
  );
};

export const useProperty = (): PropertyContextType => {
  const context = useContext(PropertyContext);
  if (context === undefined) {
    throw new Error("useProperty must be used within a PropertyProvider");
  }
  return context;
};
