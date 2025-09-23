import Footer2 from "@/components/layout/Footer2";
import Header2 from "@/components/layout/Header2";
import Link from "next/link";

const About = () => {
  return (
    <section>
      <Header2 />
      <div className="max-w-7xl mx-auto mt-20 xs:px-10 lg:px-5 py-10 space-y-6 text-gray-800">
        <h1 className="text-4xl font-bold">
          About{" "}
          <span className="bg-blue-800 bg-clip-text text-transparent">
            {process.env.NEXT_PUBLIC_COMPANY_NAME}
          </span>{" "}
        </h1>

        <p>
          Welcome to{" "}
          <span className="font-semibold">
            {process.env.NEXT_PUBLIC_COMPANY_NAME}
          </span>
          , a trusted {process.env.NEXT_PUBLIC_COMPANY_NAME} platform based in
          Rwanda. We specialize in helping individuals and families find their
          perfect homes, investment properties, and land across the country.
        </p>

        <h2 className="text-2xl font-semibold">Our Services</h2>
        <p>
          Whether you&#39;re looking to{" "}
          <span className="font-semibold">buy, sell, or rent</span>, we are here
          to make the process simple and reliable. From modern apartments in
          Kigali to spacious family houses and secure plots of land, we provide
          a wide range of property options that meet different needs and
          budgets.
        </p>
        <p>
          Beyond transactions, we also connect{" "}
          <span className="font-semibold">
            property owners with potential buyers or tenants
          </span>
          , ensuring smooth communication and transparent deals.
        </p>

        <h2 className="text-2xl font-semibold">Want to Work with Us?</h2>
        <p>
          Our team is dedicated to offering personalized support, honest
          guidance, and up-to-date property listings. We pride ourselves on
          being local experts who understand the Rwandan{" "}
          {process.env.NEXT_PUBLIC_COMPANY_NAME} market, giving our clients
          confidence in every decision they make.
        </p>

        <h2 className="text-2xl font-semibold">Our Vision</h2>
        <p>
          To become Rwanda&#39;s most trusted{" "}
          {process.env.NEXT_PUBLIC_COMPANY_NAME} partner by making property
          ownership and renting easier, more transparent, and accessible for
          everyone.
        </p>

        <h2 className="text-2xl font-semibold">Get in Touch</h2>
        <p>
          Looking to buy, sell, or rent?{" "}
          <Link
            href={"/contact"}
            className="text-blue-600 font-medium hover:underline"
          >
            Reach out
          </Link>{" "}
          today and let us help you find the right place or the right buyer for
          your property.
        </p>
      </div>
      <Footer2 />
    </section>
  );
};

export default About;
