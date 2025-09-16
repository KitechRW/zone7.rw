"use client";

import { FilterProvider } from "@/contexts/FilterContext";
import { PropertyProvider } from "@/contexts/PropertyContext";
import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";

export const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <SessionProvider>
      <PropertyProvider>
        <FilterProvider>{children}</FilterProvider>
      </PropertyProvider>
    </SessionProvider>
  );
};
