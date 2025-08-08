import React, { useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Navbar from "../components/Navbar";
import { FaRocket, FaUsers, FaShieldAlt, FaChartLine, FaGavel, FaLightbulb } from "react-icons/fa";

const About = () => {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: false
  });

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const teamMembers = [
    { 
      name: "Saira Noreen", 
      role: "Lead Developer", 
      color: "bg-gradient-to-r from-indigo-500 to-purple-600",
      icon: <FaGavel className="text-2xl" />
    },
    { 
      name: "Arshiya Arif", 
      role: "Backend Developer", 
      color: "bg-gradient-to-r from-blue-500 to-cyan-500",
      icon: <FaChartLine className="text-2xl" />
    },
    { 
      name: "Ifra Maryam", 
      role: "UI/UX Designer", 
      color: "bg-gradient-to-r from-pink-500 to-rose-500",
      icon: <FaLightbulb className="text-2xl" />
    }
  ];

  return (
    <>
      <Navbar />
      <div className="relative w-full py-20 px-6 bg-gray-50">
        {/* Main Background Card */}
        <div className="relative bg-white shadow-lg border border-gray-200 rounded-lg overflow-hidden max-w-7xl mx-auto">
          {/* Background Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-10 rounded-lg pointer-events-none" />
          
          {/* Content Container */}
          <div className="relative z-10 p-8 md:p-12">
            <motion.div
              ref={ref}
              initial="hidden"
              animate={controls}
              variants={container}
              className="flex flex-col items-center"
            >
              {/* Header */}
              <motion.div variants={item} className="text-center mb-12">
                <div className="inline-flex items-center bg-indigo-100 text-indigo-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
                  <FaRocket className="mr-2 text-indigo-600" />
                  ABOUT AUCTIONHUB
                </div>
                
                <h1 className="text-4xl sm:text-5xl font-bold mb-6 text-gray-900">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
                    Smarter Bidding,
                  </span>{' '}
                  <span className="text-indigo-600">Better Outcomes</span>
                </h1>
                
                <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                  AuctionHub combines cutting-edge technology with marketplace expertise to deliver Pakistan's most transparent auction platform.
                </p>
              </motion.div>

              {/* Mission Section */}
              <motion.div 
                variants={item}
                className="bg-gradient-to-r from-indigo-50 to-purple-50 p-8 rounded-2xl border border-indigo-100 mb-12 w-full"
              >
                <motion.h3 
                  className="text-2xl font-semibold text-indigo-600 mb-4 flex items-center"
                  variants={item}
                >
                  <FaRocket className="mr-3" />
                  Our Mission
                </motion.h3>
                <motion.p 
                  className="text-gray-600"
                  variants={item}
                >
                  To revolutionize online auctions through AI-powered solutions that ensure fairness, efficiency, and an unparalleled user experience. We're building the future of e-commerce transactions.
                </motion.p>
              </motion.div>

              {/* Team Section */}
              <motion.div variants={item} className="w-full">
                <h3 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-8">
                  The Team Behind AuctionHub
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {teamMembers.map((member, index) => (
                    <motion.div
                      key={index}
                      className={`${member.color} p-6 rounded-2xl shadow-lg overflow-hidden relative text-white`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 * index, duration: 0.5 }}
                      whileHover={{ scale: 1.03 }}
                    >
                      <div className="relative z-10 flex flex-col items-center">
                        <div className="w-20 h-20 mb-4 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl">
                          {member.icon}
                        </div>
                        <h4 className="text-xl font-bold text-center">{member.name}</h4>
                        <p className="text-white/90 text-center mt-2">{member.role}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* CTA */}
              <motion.div 
                variants={item}
                className="mt-12 text-center"
              >
                <motion.button
                  className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg relative overflow-hidden group"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <span className="relative z-10">Join Our Community</span>
                  <motion.span
                    className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  />
                </motion.button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default About;