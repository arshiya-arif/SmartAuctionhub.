
import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaPaperPlane, FaUser, FaEdit } from "react-icons/fa";

const Contact = () => {
  const formik = useFormik({
    initialValues: { name: "", email: "", subject: "", message: "" },
    validationSchema: Yup.object({
      name: Yup.string().required("Name is required"),
      email: Yup.string().email("Invalid email").required("Email is required"),
      subject: Yup.string().required("Subject is required"),
      message: Yup.string().min(10, "Message must be at least 10 characters").required("Message is required"),
    }),
    onSubmit: (values) => {
      alert("Message sent successfully!");
      console.log(values);
    },
  });

  return (
    <>
      <Navbar />
      <div className="relative w-full py-20 px-6 bg-gray-50">
        {/* Main Background Card */}
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

            {/* Right Form */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="bg-white p-6 rounded-lg shadow-sm"
            >
              <form onSubmit={formik.handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Your Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="name"
                      placeholder="John Doe"
                      className="w-full px-4 py-3 pl-12 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      {...formik.getFieldProps("name")}
                    />
                    <FaUser className="absolute left-4 top-3.5 text-indigo-500" />
                  </div>
                  {formik.touched.name && formik.errors.name && (
                    <p className="text-red-500 text-sm mt-2">{formik.errors.name}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Your Email</label>
                  <div className="relative">
                    <input
                      type="email"
                      name="email"
                      placeholder="email@example.com"
                      className="w-full px-4 py-3 pl-12 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      {...formik.getFieldProps("email")}
                    />
                    <FaEnvelope className="absolute left-4 top-3.5 text-indigo-500" />
                  </div>
                  {formik.touched.email && formik.errors.email && (
                    <p className="text-red-500 text-sm mt-2">{formik.errors.email}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Subject</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="subject"
                      placeholder="Subject"
                      className="w-full px-4 py-3 pl-12 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      {...formik.getFieldProps("subject")}
                    />
                    <FaEdit className="absolute left-4 top-3.5 text-indigo-500" />
                  </div>
                  {formik.touched.subject && formik.errors.subject && (
                    <p className="text-red-500 text-sm mt-2">{formik.errors.subject}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Message</label>
                  <div className="relative">
                    <textarea
                      rows="5"
                      name="message"
                      placeholder="Your message here..."
                      className="w-full px-4 py-3 pl-12 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      {...formik.getFieldProps("message")}
                    ></textarea>
                    <FaPaperPlane className="absolute left-4 top-4 text-indigo-500" />
                  </div>
                  {formik.touched.message && formik.errors.message && (
                    <p className="text-red-500 text-sm mt-2">{formik.errors.message}</p>
                  )}
                </div>
                
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.05, backgroundColor: "#4338CA" }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="w-full bg-indigo-600 text-white px-4 py-3 rounded-md font-semibold shadow-md hover:bg-indigo-700 transition-all flex items-center justify-center"
                >
                  <FaPaperPlane className="mr-2" />
                  Send Message
                </motion.button>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Contact;