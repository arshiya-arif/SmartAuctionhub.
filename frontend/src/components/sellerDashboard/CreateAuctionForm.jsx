import React, { useState } from "react";

const CreateAuctionForm = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    startingBid: "", // Added startingBid field
    endDate: "", // Added endDate field
  });
  const [image, setImage] = useState(null); // State to store the uploaded image file

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file); // Store the selected image file
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Create a FormData object to send the form data and image file
    const formDataToSend = new FormData();
    formDataToSend.append("title", formData.title);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("category", formData.category);
    formDataToSend.append("startingBid", formData.startingBid); // Append startingBid
    formDataToSend.append("endDate", formData.endDate); // Append endDate
    formDataToSend.append("image", image); // Append the image file

    try {
      const token = localStorage.getItem("token"); // Get the JWT token from localStorage
      if (!token) {
        alert("You are not logged in. Please log in to create an auction.");
        return;
      }

      const response = await fetch("http://localhost:3000/api/auctions/create", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`, // Send JWT token for authentication
        },
        body: formDataToSend, // Send FormData instead of JSON
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.message || "Failed to create auction");
      }

      const data = await response.json();
      alert("Auction created successfully!");
      console.log("Auction created:", data.auction);

      // Clear the form
      setFormData({
        title: "",
        description: "",
        category: "",
        startingBid: "", // Reset startingBid
        endDate: "", // Reset endDate
      });
      setImage(null); // Clear the image file
    } catch (error) {
      console.error("Error creating auction:", error);
      alert(error.message || "Failed to create auction. Please try again.");
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Create Auction</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Product Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter product title"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows="4"
            placeholder="Enter product description"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Image</label>
          <input
            type="file"
            name="image"
            onChange={handleImageChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            accept="image/*" // Allow only image files
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select a category</option>
            <option value="Electronics">Electronics</option>
            <option value="Fashion">Fashion</option>
            <option value="Home">Home</option>
            <option value="Sports">Sports</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Starting Bid</label>
          <input
            type="number"
            name="startingBid"
            value={formData.startingBid}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter starting bid amount"
            min="1"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">End Date</label>
          <input
            type="datetime-local"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-md hover:from-blue-600 hover:to-blue-700 transition duration-200"
        >
          Create Auction
        </button>
      </form>
    </div>
  );
};

export default CreateAuctionForm;
