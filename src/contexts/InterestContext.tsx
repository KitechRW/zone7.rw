"use client";

import {
  CreateInterestData,
  Interest,
  InterestFilters,
  InterestStats,
} from "@/types/Interests";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";

interface InterestContextType {
  interests: Interest[];
  loading: boolean;
  error: string | null;
  stats: InterestStats | null;
  pagination: {
    total: number;
    pages: number;
    currentPage: number;
  };

  fetchInterests: (
    filters?: InterestFilters,
    page?: number,
    limit?: number
  ) => Promise<{ interests: Interest[]; total: number; pages: number }>;
  createInterest: (data: CreateInterestData) => Promise<Interest>;
  fetchUserInterests: (userId: string) => Promise<{
    interests: Interest[];
    total: number;
    pages: number;
  }>;
  updateInterestStatus: (
    id: string,
    status: "new" | "contacted" | "closed"
  ) => Promise<Interest>;
  deleteInterest: (id: string) => Promise<void>;
  fetchStats: () => Promise<InterestStats>;
  checkUserInterest: (
    propertyId: string,
    userEmail?: string
  ) => Promise<{
    hasInterest: boolean;
    interest: Interest | null;
  }>;

  clearError: () => void;
  clearInterests: () => void;
}

const InterestContext = createContext<InterestContextType | undefined>(
  undefined
);

class InterestAPI {
  private static handleResponse = async (response: Response) => {
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || error.error || "API request failed");
    }
    return await response.json();
  };

  static async create(data: CreateInterestData): Promise<Interest> {
    const response = await fetch("/api/interests", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await this.handleResponse(response);
    return result.data.interest;
  }

  static async getAll(
    filters: InterestFilters = {},
    page: number = 1,
    limit: number = 10
  ): Promise<{
    interests: Interest[];
    total: number;
    pages: number;
  }> {
    const params = new URLSearchParams();

    // Add filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        if (key === "startDate" || key === "endDate") {
          params.append(key, (value as Date).toISOString());
        } else {
          params.append(key, value.toString());
        }
      }
    });

    // Add pagination
    params.append("page", page.toString());
    params.append("limit", limit.toString());

    const response = await fetch(`/api/interests?${params}`);
    const result = await this.handleResponse(response);

    return {
      interests: result.data.interests,
      total: result.data.total,
      pages: result.data.pages,
    };
  }

  static async updateStatus(
    id: string,
    status: "new" | "contacted" | "closed"
  ): Promise<Interest> {
    if (!id || id === "undefined") {
      throw new Error("Invalid interest ID provided");
    }

    const response = await fetch(`/api/interests/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });

    const result = await this.handleResponse(response);
    return result.data.interest;
  }

  static async delete(id: string): Promise<void> {
    const response = await fetch(`/api/interests/${id}`, {
      method: "DELETE",
    });

    await this.handleResponse(response);
  }

  static async getStats(): Promise<InterestStats> {
    const response = await fetch("/api/interests/stats");
    const result = await this.handleResponse(response);
    return result.data.stats;
  }

  static async getUserInterests(userId: string): Promise<{
    interests: Interest[];
    total: number;
    pages: number;
  }> {
    const response = await fetch(`/api/interests/user?userId=${userId}`);
    const result = await this.handleResponse(response);

    return {
      interests: result.data.interests || result.data,
      total: result.data.total || result.data.length || 0,
      pages: 1, // User interests might not be paginated
    };
  }

  static async checkUserInterest(
    propertyId: string,
    userEmail?: string
  ): Promise<{
    hasInterest: boolean;
    interest: Interest | null;
  }> {
    const params = new URLSearchParams();
    params.append("propertyId", propertyId);

    if (userEmail) {
      params.append("userEmail", userEmail);
    }

    const response = await fetch(`/api/interests/check?${params.toString()}`);
    const result = await this.handleResponse(response);

    if (result.data.interest) {
      result.data.interest.id = result.data.interest._id;
    }
    return result.data;
  }
}

export const InterestProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [interests, setInterests] = useState<Interest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<InterestStats | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0,
    currentPage: 1,
  });

  const handleError = useCallback((err: unknown) => {
    const message =
      err instanceof Error ? err.message : "An unexpected error occurred";
    setError(message);
    console.error("Interest context error:", err);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const fetchInterests = useCallback(
    async (filters?: InterestFilters, page: number = 1, limit: number = 10) => {
      try {
        setLoading(true);
        clearError();

        const result = await InterestAPI.getAll(filters, page, limit);

        setInterests(result.interests);
        setPagination({
          total: result.total,
          pages: result.pages,
          currentPage: page,
        });

        return result;
      } catch (err) {
        handleError(err);
        setInterests([]);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [clearError, handleError]
  );

  const createInterest = useCallback(
    async (data: CreateInterestData) => {
      try {
        setLoading(true);
        clearError();

        const newInterest = await InterestAPI.create(data);

        // Add to the beginning of the list
        setInterests((prev) => [newInterest, ...prev]);

        // Update pagination if needed
        setPagination((prev) => ({
          ...prev,
          total: prev.total + 1,
        }));

        return newInterest;
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [clearError, handleError]
  );

  const fetchUserInterests = useCallback(
    async (userId: string) => {
      try {
        setLoading(true);
        clearError();

        // Clear existing interests first
        setInterests([]);
        setPagination({
          total: 0,
          pages: 0,
          currentPage: 1,
        });

        // Make sure to pass the userId as a query parameter
        const response = await fetch(`/api/interests/user?userId=${userId}`);

        if (!response.ok) {
          const error = await response.json();
          throw new Error(
            error.message || error.error || "Failed to fetch user interests"
          );
        }

        const result = await response.json();

        // Extract the interests data properly
        const interests = result.data.interests || [];
        const total = result.data.total || interests.length || 0;
        const pages = result.data.pages || (total > 0 ? 1 : 0);

        setInterests(interests);
        setPagination({
          total,
          pages,
          currentPage: 1,
        });

        return {
          interests,
          total,
          pages,
        };
      } catch (err) {
        handleError(err);
        setInterests([]);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [clearError, handleError]
  );

  const updateInterestStatus = useCallback(
    async (id: string, status: "new" | "contacted" | "closed") => {
      try {
        setLoading(true);
        clearError();

        const updatedInterest = await InterestAPI.updateStatus(id, status);

        // Update in the list
        setInterests((prev) =>
          prev.map((interest) =>
            interest.id === id ? updatedInterest : interest
          )
        );

        return updatedInterest;
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [clearError, handleError]
  );

  const deleteInterest = useCallback(
    async (id: string) => {
      try {
        setLoading(true);
        clearError();

        await InterestAPI.delete(id);

        // Remove from the list
        setInterests((prev) => prev.filter((interest) => interest.id !== id));

        // Update pagination
        setPagination((prev) => ({
          ...prev,
          total: Math.max(0, prev.total - 1),
        }));
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
      const statsData = await InterestAPI.getStats();
      setStats(statsData);
      return statsData;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [clearError, handleError]);

  const checkUserInterest = useCallback(
    async (propertyId: string, userEmail?: string) => {
      try {
        clearError();
        return await InterestAPI.checkUserInterest(propertyId, userEmail);
      } catch (err) {
        handleError(err);
        throw err;
      }
    },
    [clearError, handleError]
  );

  const clearInterests = useCallback(() => {
    setInterests([]);
    setPagination({ total: 0, pages: 0, currentPage: 1 });
  }, []);

  const value: InterestContextType = {
    interests,
    loading,
    error,
    stats,
    pagination,

    fetchInterests,
    createInterest,
    fetchUserInterests,
    updateInterestStatus,
    deleteInterest,
    fetchStats,
    checkUserInterest,

    clearError,
    clearInterests,
  };

  return (
    <InterestContext.Provider value={value}>
      {children}
    </InterestContext.Provider>
  );
};

export const useInterest = (): InterestContextType => {
  const context = useContext(InterestContext);
  if (context === undefined) {
    throw new Error("useInterest must be used within an InterestProvider");
  }
  return context;
};
