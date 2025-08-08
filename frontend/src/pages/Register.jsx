import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaUser, FaEnvelope, FaPhone, FaIdCard, FaKey, FaEye, FaEyeSlash, FaGavel, FaRobot } from "react-icons/fa";
import { motion } from "framer-motion";

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const formik = useFormik({
    initialValues: { name: "", email: "", phone: "", cnic: "", role: "", password: "", confirmPassword: "" },
    validationSchema: Yup.object({
      name: Yup.string().required("Required"),
      email: Yup.string().email("Invalid email").required("Required"),
      phone: Yup.string().matches(/^[0-9]{11}$/, "Invalid phone number").required("Required"),
      cnic: Yup.string().matches(/^[0-9]{13}$/, "Invalid CNIC").required("Required"),
      role: Yup.string().oneOf(["buyer", "seller"], "Select Role").required("Required"),
      password: Yup.string().min(6, "Minimum 6 characters").required("Required"),
      confirmPassword: Yup.string().oneOf([Yup.ref("password"), null], "Passwords must match").required("Required"),
    }),
    onSubmit: async (values) => {
      try {
        await axios.post("http://localhost:3000/api/auth/register", values, {
          headers: { "Content-Type": "application/json" },
        });
        navigate("/login");
      } catch (error) {
        alert(error.response?.data?.message || "Registration failed");
      }
    },
  });

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-50 to-indigo-50">
      {/* Left side - Auction Hub Visual */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-indigo-600 to-purple-600 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative z-10 max-w-md text-white text-center">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <FaGavel className="text-6xl mx-auto mb-6 text-indigo-200" />
          </motion.div>
          <h1 className="text-4xl font-bold mb-4">Welcome to AuctionHub</h1>
          <p className="text-lg mb-6 text-indigo-100">
            Join Pakistan's premier online auction platform where rare finds meet eager buyers.
          </p>
          <div className="flex justify-center space-x-4 mb-8">
            {[
              { icon: <FaGavel className="text-2xl" />, text: "Automatic Bidding" },
              { icon: <FaKey className="text-2xl" />, text: "Secure Transactions" },
              { icon: <FaRobot className="text-2xl" />, text: "Chatbot Assitance" }
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

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md bg-white rounded-xl shadow-lg p-10 border border-gray-100"
        >
          <div className="text-center mb-8">
            <FaGavel className="text-4xl mx-auto text-indigo-600 mb-3" />
            <h2 className="text-3xl font-bold text-gray-800">Create Account</h2>
            <p className="text-gray-500 mt-2">Join our auction community</p>
          </div>

          <form onSubmit={formik.handleSubmit} className="space-y-5">
            <InputField 
              type="text" 
              name="name" 
              placeholder="Full Name" 
              formik={formik} 
              icon={<FaUser className="text-indigo-500" />} 
            />
            <InputField 
              type="email" 
              name="email" 
              placeholder="Email Address" 
              formik={formik} 
              icon={<FaEnvelope className="text-indigo-500" />} 
            />
            <InputField 
              type="text" 
              name="phone" 
              placeholder="Phone Number" 
              formik={formik} 
              icon={<FaPhone className="text-indigo-500" />} 
            />
            <InputField 
              type="text" 
              name="cnic" 
              placeholder="CNIC (without dashes)" 
              formik={formik} 
              icon={<FaIdCard className="text-indigo-500" />} 
            />

            {/* Role Selection */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaUser className="text-indigo-500" />
              </div>
              <select
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                name="role"
                {...formik.getFieldProps("role")}
              >
                <option value="">Select Your Role</option>
                <option value="buyer">Buyer</option>
                <option value="seller">Seller</option>
              </select>
              {formik.touched.role && formik.errors.role && (
                <p className="text-red-500 text-xs mt-1">{formik.errors.role}</p>
              )}
            </div>

            {/* Password Input with Toggle */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaKey className="text-indigo-500" />
              </div>
              <input
                className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-lg bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Create Password"
                {...formik.getFieldProps("password")}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash className="text-indigo-500" /> : <FaEye className="text-indigo-500" />}
              </button>
              {formik.touched.password && formik.errors.password && (
                <p className="text-red-500 text-xs mt-1">{formik.errors.password}</p>
              )}
            </div>

            {/* Confirm Password Input with Toggle */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaKey className="text-indigo-500" />
              </div>
              <input
                className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-lg bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm Password"
                {...formik.getFieldProps("confirmPassword")}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FaEyeSlash className="text-indigo-500" /> : <FaEye className="text-indigo-500" />}
              </button>
              {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">{formik.errors.confirmPassword}</p>
              )}
            </div>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg mt-2"
            >
              Register Now
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Already have an account?{" "}
              <a href="/login" className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors duration-200">
                Sign In
              </a>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const InputField = ({ type, name, placeholder, formik, icon }) => (
  <div className="relative">
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
      {icon}
    </div>
    <input
      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
      type={type}
      name={name}
      placeholder={placeholder}
      {...formik.getFieldProps(name)}
    />
    {formik.touched[name] && formik.errors[name] && (
      <p className="text-red-500 text-xs mt-1">{formik.errors[name]}</p>
    )}
  </div>
);

export default Register;

















