import Footer2 from "@/components/layout/Footer2";
import Header2 from "@/components/layout/Header2";
import Image from "next/image";
import Link from "next/link";

const About = () => {
  return (
    <section className="overflow-x-hidden">
      <Header2 />

      <div className="relative mt-20 py-10 h-80">
        <div className="absolute inset-0 bg-black/70 -z-10" />
        <Image
          src="https://res.cloudinary.com/dx2czuzzs/image/upload/v1758743788/1710915176520_apigyg.jpg"
          alt="Welcome"
          fill
          className="w-full h-full object-cover -z-30"
        />
        <div className="max-w-4xl mx-auto xs:px-10 md:px-5 mt-10 text-center text-white">
          <h1 className="text-5xl font-bold mb-10">
            {process.env.NEXT_PUBLIC_COMPANY_NAME}
          </h1>
          <p className="md:text-xl leading-relaxed">
            Rwanda&#39;s trusted real estate platform. We specialize in helping
            individuals and families find their perfect homes, invest in
            properties, and land across the country.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto xs:px-10 md:px-5 py-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
          <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border border-gray-100 hover:border-blue-200">
            <div className="flex items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Our Services</h2>
            </div>
            <div className="space-y-4">
              <p className="text-gray-600 leading-relaxed">
                Whether you&#39;re looking to{" "}
                <span className="font-semibold text-black">
                  buy, sell, or rent
                </span>
                , we are here to make the process simple and reliable. From
                modern apartments in Kigali to spacious family houses and secure
                plots of land.
              </p>
              <p className="text-gray-600 leading-relaxed">
                We connect{" "}
                <span className="font-semibold text-black">
                  property owners with potential buyers or tenants
                </span>
                , ensuring smooth communication and transparent deals.
              </p>
            </div>
          </div>

          <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border border-gray-100 hover:border-green-200">
            <div className="flex items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Why Choose Us?
              </h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              Our team is dedicated to offering personalized support, honest
              guidance, and up-to-date property listings. We pride ourselves on
              being local experts who understand the Rwandan{" "}
              {process.env.NEXT_PUBLIC_COMPANY_NAME} market, giving our clients
              confidence in every decision they make.
            </p>
          </div>

          <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border border-gray-100 hover:border-purple-200">
            <div className="flex items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Our Vision</h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              To become Rwanda&#39;s most trusted{" "}
              {process.env.NEXT_PUBLIC_COMPANY_NAME} partner by making property
              ownership and renting easier, more transparent, and accessible for
              everyone.
            </p>
          </div>

          <div className="group bg-gradient-to-br from-white to-blue-100 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 text-black">
            <div className="flex items-center mb-6">
              <h2 className="text-2xl font-bold">Have any Question?</h2>
            </div>
            <p className="leading-relaxed mb-6">
              Looking to buy, sell, or rent? Let us help you find the right
              place or the right buyer for your property.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center bg-black text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-300 hover:shadow-lg"
            >
              Talk to Us here
            </Link>
          </div>
        </div>
      </div>

      <Footer2 />
    </section>
  );
};

export default About;
