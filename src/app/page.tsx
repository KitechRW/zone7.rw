"use client";

import Loader from "@/components/misc/Loader";
import { useAuth } from "@/contexts/AuthContext";
import Head from "next/head";
import React, { Suspense, useEffect, useRef, useState } from "react";
import Header from "@/components/layout/Header";
import Welcome from "@/components/layout/Welcome";
import Benefits from "@/components/layout/Benefits";
import Footer from "@/components/layout/Footer";
import PropertyListings from "@/components/layout/PropertyListings";

const Home = () => {
  const [isLoading, SetIsLoading] = useState<boolean>(true);
  const { authLoading } = useAuth();

  useEffect(() => {
    setTimeout(() => {
      SetIsLoading(false);
    }, 1000);
  }, []);

  const homeRef = useRef<HTMLDivElement | null>(null);
  const propertyRef = useRef<HTMLDivElement | null>(null);

  const homeScroll = () => {
    if (homeRef.current) {
      homeRef.current.scrollIntoView({
        behavior: "smooth",
      });
    }
  };

  const propertyScroll = () => {
    if (propertyRef.current) {
      propertyRef.current.scrollIntoView({
        behavior: "smooth",
      });
    }
  };

  return authLoading && isLoading ? (
    <Loader className="h-screen" />
  ) : (
    <main className="overflow-x-hidden">
      <Head>
        <title>Find Your Dream Property</title>
        <meta
          name="description"
          content="Find your dream property from our curated selection of homes, plots, and investment opportunities."
        />
      </Head>

      <Suspense fallback={<Loader className="h-screen" />}>
        <Header scrollToProperties={propertyScroll} scrollToHome={homeScroll} />
        <Welcome scrollToProperties={propertyScroll} homeRef={homeRef} />
        <PropertyListings propertyRef={propertyRef} />
        <Benefits />
        <Footer scrollToHome={homeScroll} />
      </Suspense>
    </main>
  );
};

export default Home;
