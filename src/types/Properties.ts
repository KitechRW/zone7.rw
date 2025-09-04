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
  features?: string[];
  image: string;
  images: string[];
  roomTypes?: string[];
}
