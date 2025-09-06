import HomeComponent from "@/components/Home";
import Head from "next/head";
import { Suspense } from "react";

const Home = () => {
  return (
    <main>
      <Head>
        <title>Find Your Dream Property</title>
        <meta
          name="description"
          content="Find your dream property from our curated selection of homes, plots, and investment opportunities."
        />
      </Head>

      <Suspense
        fallback={
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-20 w-20 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        }
      >
        <HomeComponent />
      </Suspense>
    </main>
  );
};

export default Home;
