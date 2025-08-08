import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaGavel, FaHome, FaRobot, FaShieldAlt, FaKey } from "react-icons/fa";
import { motion } from "framer-motion";

const Login = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema: Yup.object({
      email: Yup.string().email("Invalid email").required("Email is required"),
      password: Yup.string().min(6, "Minimum 6 characters").required("Password is required"),
    }),
    onSubmit: async (values) => {
      try {
        const response = await axios.post("http://localhost:3000/api/auth/login", values, {
          headers: { "Content-Type": "application/json" },
        });

        if (response.data.role === "admin") {
          setErrorMessage("Admins must login through the admin portal");
          return;
        }

        if (["buyer", "seller"].includes(response.data.role)) {
          localStorage.setItem("token", response.data.token);
          localStorage.setItem("role", response.data.role);
          
          if (response.data.role === "seller") {
            navigate("/seller-dashboard");
          } else {
            navigate("/");
          }
        } else {
          setErrorMessage("Invalid user role");
        }
      } catch (error) {
        setErrorMessage(error.response?.data?.message || "Login failed");
      }
    },
  });

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-50 to-indigo-50">
      {/* Left side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md bg-white rounded-xl shadow-lg p-10 border border-gray-100"
        >
          <div className="text-center mb-8">
            <FaGavel className="text-4xl mx-auto text-indigo-600 mb-3" />
            <h2 className="text-3xl font-bold text-gray-800">Welcome Back</h2>
            <p className="text-gray-500 mt-2">Sign in to your AuctionHub account</p>
          </div>

          {errorMessage && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-6 p-3 bg-red-50 text-red-500 rounded-lg text-center"
            >
              {errorMessage}
            </motion.div>
          )}

          <form onSubmit={formik.handleSubmit} className="space-y-5">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaEnvelope className="text-indigo-500" />
              </div>
              <input
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                type="email"
                name="email"
                placeholder="Email Address"
                {...formik.getFieldProps("email")}
              />
              {formik.touched.email && formik.errors.email && (
                <p className="text-red-500 text-xs mt-1">{formik.errors.email}</p>
              )}
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaKey className="text-indigo-500" />
              </div>
              <input
                className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-lg bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                {...formik.getFieldProps("password")}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <FaEyeSlash className="text-indigo-500" />
                ) : (
                  <FaEye className="text-indigo-500" />
                )}
              </button>
              {formik.touched.password && formik.errors.password && (
                <p className="text-red-500 text-xs mt-1">{formik.errors.password}</p>
              )}
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>
              <Link
                to="/forgot-password"
                className="text-sm text-indigo-600 hover:text-indigo-700 transition-colors duration-200"
              >
                Forgot password?
              </Link>
            </div>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              Login
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors duration-200"
              >
                Register Now
              </Link>
            </p>
          </div>
        </motion.div>
      </div>

      {/* Right side - Auction Hub Visual */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-indigo-600 to-purple-600 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        
        {/* Back to Home Button */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="absolute top-6 left-6"
        >
          <Link
            to="/"
            className="flex items-center text-blue bg-indigo-200 bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-all duration-300"
          >
            <FaHome className="mr-2" />
            Back to Home
          </Link>
        </motion.div>
        
        <div className="relative z-10 max-w-md text-white text-center">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <FaGavel className="text-6xl mx-auto mb-6 text-indigo-200" />
          </motion.div>
          <h1 className="text-4xl font-bold mb-4">AuctionHub</h1>
          <p className="text-lg mb-6 text-indigo-100">
            Pakistan's premier online auction platform where rare finds meet eager buyers.
          </p>
          <div className="flex justify-center space-x-4 mb-8">
            {[
              { icon: <FaGavel className="text-2xl" />, text: "Automatic Bidding" },
              { icon: <FaShieldAlt className="text-2xl" />, text: "Secure Payments" },
              { icon: <FaRobot className="text-2xl" />, text: "Chatbot Support" }
            ].map((item, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -5 }}
                className="bg-white/10 p-3 rounded-lg backdrop-blur-sm"
              >
                <div className="text-indigo-200">{item.icon}</div>
                <p className="text-sm mt-1 text-indigo-100">{item.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;