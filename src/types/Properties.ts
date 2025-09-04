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
  image: string;
  featured: boolean;
  description: string;
}
