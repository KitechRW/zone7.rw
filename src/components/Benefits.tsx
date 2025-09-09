import React, { useEffect, useState } from "react";
import { Home, Shield, Award, Heart, MapPinHouse, Phone } from "lucide-react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import CountUp from "react-countup";

const Benefits = () => {
  const [count, setCount] = useState(false);
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.5 });

  useEffect(() => {
    if (inView) {
      setCount(true);
    }
  }, [inView]);

  const stats = [
    { number: 150, label: "Happy Clients", icon: Heart },
    { number: 500, label: "Properties Sold", icon: Home },
    { number: 6, label: "Years Experience", icon: Award },
  ];

  return (
    <div className="xs:px-10 md:px-20">
      <div className="text-center mb-16">
        <h2 className="xs:text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
          With&nbsp;
          <span className="bg-gradient-to-r from-light-blue to-blue-800 bg-clip-text text-transparent">
            Real Estate
          </span>{" "}
          Your Dream Home Awaits You
        </h2>

        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          We find you the perfect property to suit your lifestyle and budget.
        </p>
      </div>

      <div className="flex xs:flex-col md:flex-row items-center justify-center gap-10 mb-20">
        <motion.div
          initial={{ opacity: 0, x: -100 }}
          whileInView={{ opacity: 2, x: 0 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          <div className="group relative overflow-hidden bg-white rounded-sm shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
            <div className="relative p-8">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <MapPinHouse className="w-8 h-8 text-blue-500" />
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-800 transition-colors">
                Affordable Properties
              </h3>

              <p className="text-black italic text-lg font-light">
                Collection of residential homes, condos, and commercial spaces
                in strategic locations.
              </p>
            </div>

            <div
              className={`absolute inset-0 bg-blue-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 100 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          <div className="group relative overflow-hidden bg-white rounded-sm shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
            <div className="relative p-8">
              <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-8 h-8 text-green-500" />
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-green-700 transition-colors">
                Trusted Agents
              </h3>

              <p className="text-black italic text-lg font-light">
                Our agents will never lie of the actual value of a property or
                be in a position to mislead you.
              </p>
            </div>

            <div
              className={`absolute inset-0 bg-green-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
            />
          </div>
        </motion.div>
      </div>

      <div className="bg-gradient-to-r from-light-blue/20 to-green-300/20 rounded-3xl p-10 mb-10 relative overflow-hidden">
        <div className="max-w-[1600px] mx-auto relative z-10">
          <h3 className="text-3xl font-bold text-black text-center mb-12">
            Trusted by Hundreds of Satisfied Clients
          </h3>

          <div className="flex flex-wrap justify-evenly gap-10">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center group">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto transition-colors">
                    <Icon className="w-8 h-8 text-black" />
                  </div>
                  <div
                    ref={ref}
                    className="xs:text-3xl md:text-5xl font-bold text-black mb-2 group-hover:scale-110 transition-transform duration-500 cursor-default"
                  >
                    {count && (
                      <CountUp
                        start={0}
                        end={stat.number}
                        duration={3}
                        scrollSpyDelay={500}
                      />
                    )}
                    +
                  </div>
                  <div className="text-black/80 font-medium">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="absolute top-10 left-5 w-6 h-6 bg-light-blue/20 rounded-full animate-pulse" />
        <div className="absolute top-28 left-10 w-12 h-12 bg-light-blue/20 rounded-full animate-pulse" />
        <div className="absolute bottom-10 right-10 w-4 h-4 bg-green-200  rounded-full animate-pulse delay-300" />
        <div className="absolute bottom-20 right-20 w-8 h-8 bg-green-200 rounded-full animate-pulse delay-700" />
      </div>

      <div className="text-center py-10 mb-10 relative overflow-hidden">
        <div className="relative">
          <h3 className="xs:text-3xl md:text-5xl font-bold text-black mb-6">
            Ready to Find Your Perfect Home?
          </h3>

          <p className="text-black italic xs:text-lg md:text-xl mb-10 max-w-2xl mx-auto">
            Join hundreds of satisfied clients who found their dream properties
            with Real Estate. Your journey starts with a single click.
          </p>

          <div className="flex justify-center">
            <button className="bg-gradient-to-br from-gray-600 to-gray-800 text-white px-10 py-5 rounded-sm font-semibold flex items-center justify-center hover:shadow-2xl transition cursor-pointer">
              <Phone className="w-5 h-5 mr-3" />
              Contact The Expert
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Benefits;
