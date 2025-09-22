import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Suspense } from "react";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `${process.env.NEXT_PUBLIC_COMPANY_NAME}`,
  description: "Best Property Listing in Rwanda",
};

if (typeof window === "undefined") {
  import("@/lib/utils/globalError")
    .then(({ globalErrorHandler }) => {
      globalErrorHandler();
    })
    .catch(console.error);
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} antialiased`}>
        <Suspense fallback={<div className="min-h-screen" />}>
          <Providers>{children}</Providers>
        </Suspense>
      </body>
    </html>
  );
}
