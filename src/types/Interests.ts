export interface Interest {
  id: string;
  userId: string;
  propertyId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  message?: string;
  status: "new" | "contacted" | "closed";
  propertyTitle: string;
  createdAt: string;
  updatedAt: string;
}
export interface CreateInterestData {
  userId: string;
  propertyId: string;
  userPhone: string;
  message?: string;
}

export interface InterestStats {
  total: number;
  new: number;
  contacted: number;
  closed: number;
}

export interface InterestFilters {
  status?: "new" | "contacted" | "closed" | "all";
  search?: string;
  startDate?: Date;
  endDate?: Date;
}
