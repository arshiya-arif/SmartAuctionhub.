import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaGavel, FaSearchDollar, FaShieldAlt, FaChartLine, FaRocket } from "react-icons/fa";

const HeroSection = () => {
  return (
    <section className="relative w-full min-h-screen flex items-center bg-white overflow-hidden px-4">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
        <div className="absolute top-20 right-20 w-64 h-64 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
        {/* Left Content */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center lg:text-left"
        >
          <div className="inline-flex items-center bg-indigo-100 text-indigo-800 px-4 py-2 rounded-full text-sm font-medium mb-6 shadow-sm">
            <FaRocket className="mr-2 text-indigo-600" />
            PAKISTAN'S PREMIER AUCTION PLATFORM
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-gray-900">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
              Bid Smart,
            </span> <br />
            Win <span className="text-indigo-600">Big!</span>
          </h1>
          
          <p className="text-lg text-gray-600 mb-8 max-w-lg mx-auto lg:mx-0">
            Join thousands of happy buyers and sellers in Pakistan's most exciting online auction marketplace.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
            <Link to="/auctions">
              <motion.button 
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-lg text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                Explore Auctions
              </motion.button>
            </Link>
            <Link to="/register">
              <motion.button 
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white text-indigo-600 px-8 py-3 rounded-lg text-lg font-semibold border-2 border-indigo-500 hover:bg-indigo-50 shadow-md transition-all"
              >
                Become a Seller
              </motion.button>
            </Link>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-md mx-auto lg:mx-0">
            {[
              { icon: <FaGavel className="text-2xl" />, text: "Live Bidding" },
              { icon: <FaSearchDollar className="text-2xl" />, text: "Best Deals" },
              { icon: <FaShieldAlt className="text-2xl" />, text: "Secure" },
              { icon: <FaChartLine className="text-2xl" />, text: "Real-time" }
            ].map((item, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -5 }}
                className="flex flex-col items-center bg-white p-4 rounded-xl shadow-sm hover:shadow-md border border-indigo-100 transition-all"
              >
                <span className="text-indigo-600 mb-2">{item.icon}</span>
                <span className="text-sm font-medium">{item.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right Image */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative"
        >
          <div className="absolute -top-8 -right-8 w-64 h-64 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 z-0"></div>
          <img 
            src="/auction1.png" 
            alt="Auction Platform" 
            className="relative z-10 w-full max-w-lg mx-auto transform hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute -bottom-8 -left-8 w-64 h-64 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 z-0"></div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;