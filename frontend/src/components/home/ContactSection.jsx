
import React from "react";
import { motion } from "framer-motion";
import { FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa";

const ContactSection = () => {
  return (
    <section className="relative w-full py-20 px-6">
      {/* Main Background Card - Matching AuctionCard */}
      <div className="relative bg-white shadow-lg border border-gray-200 rounded-lg overflow-hidden max-w-7xl mx-auto">
        {/* Background Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-10 rounded-lg pointer-events-none" />
        
        {/* Content Container */}
        <div className="relative z-10 p-8 md:p-12 grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Content */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            <div className="inline-flex items-center bg-indigo-100 text-indigo-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <FaEnvelope className="mr-2 text-indigo-600" />
              CONTACT US
            </div>
            
            <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-gray-900">
              Get In <span className="text-indigo-600">Touch</span>
            </h2>
            
            <p className="text-lg text-gray-600 mb-8">
              Have questions about our auctions? Our team is ready to help.
            </p>
            
            <div className="space-y-4 text-left">
              <div className="flex items-start">
                <FaEnvelope className="text-indigo-600 mt-1 mr-3 text-xl" />
                <div>
                  <h3 className="font-bold text-gray-800">Email Us</h3>
                  <p className="text-gray-600">support@auctionhub.com</p>
                </div>
              </div>
              <div className="flex items-start">
                <FaPhone className="text-indigo-600 mt-1 mr-3 text-xl" />
                <div>
                  <h3 className="font-bold text-gray-800">Call Us</h3>
                  <p className="text-gray-600">+1 (555) 123-4567</p>
                </div>
              </div>
              <div className="flex items-start">
                <FaMapMarkerAlt className="text-indigo-600 mt-1 mr-3 text-xl" />
                <div>
                  <h3 className="font-bold text-gray-800">Visit Us</h3>
                  <p className="text-gray-600">123 Auction Street, Karachi</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Form - Clean White */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-white p-6 rounded-lg shadow-sm"
          >
            <form className="space-y-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Your Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2">Your Email</label>
                <input
                  type="email"
                  placeholder="email@example.com"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2">Message</label>
                <textarea
                  rows="5"
                  placeholder="Your message here..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                ></textarea>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05, backgroundColor: "#4338CA" }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="w-full bg-indigo-600 text-white px-4 py-3 rounded-md font-semibold shadow-md hover:bg-indigo-700 transition-all"
              >
                Send Message
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;