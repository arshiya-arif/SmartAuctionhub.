
import React, { useEffect, useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";

const ProductManagement = () => {
  const [products, setProducts] = useState([]); // State to store products
  const [editingProduct, setEditingProduct] = useState(null); // State to track the product being edited
  const [categories, setCategories] = useState(["Electronics", "Fashion", "Home", "Sports"]); // Example categories


  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/auctions/", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  // Handle delete product
  const handleDelete = async (productId) => {
    try {
      const response = await fetch(`http://localhost:3000/api/auctions/products/${productId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to delete product");
      }
      // Remove the deleted product from the state
      setProducts(products.filter((product) => product._id !== productId));
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  // Handle edit product
  const handleEdit = (product) => {
    setEditingProduct(product);
  };

  // Handle update product
  const handleUpdate = async (updatedProduct) => {
    try {
      const formData = new FormData();
      formData.append("title", updatedProduct.title);
      formData.append("description", updatedProduct.description);
      formData.append("category", updatedProduct.category);
      formData.append("startingBid", updatedProduct.startingBid); // Append startingBid
      formData.append("endDate", updatedProduct.endDate);
      if (updatedProduct.image) {
        formData.append("image", updatedProduct.image); // Append the file if it exists
      }

      const response = await fetch(`http://localhost:3000/api/auctions/products/${updatedProduct._id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData, // Send FormData
      });

      if (!response.ok) {
        throw new Error("Failed to update product");
      }

      const updatedProductData = await response.json();

      // Update the product in the state
      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product._id === updatedProductData._id ? updatedProductData : product
        )
      );

      setEditingProduct(null); // Close the edit form
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Manage Products</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg shadow-lg">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b border-gray-200 bg-gray-100 text-left text-sm font-semibold text-gray-700">
                Title
              </th>
              <th className="py-2 px-4 border-b border-gray-200 bg-gray-100 text-left text-sm font-semibold text-gray-700">
                Description
              </th>
              <th className="py-2 px-4 border-b border-gray-200 bg-gray-100 text-left text-sm font-semibold text-gray-700">
                Category
              </th>
              <th className="py-2 px-4 border-b border-gray-200 bg-gray-100 text-left text-sm font-semibold text-gray-700">
                Starting Bid
              </th>
              <th className="py-2 px-4 border-b border-gray-200 bg-gray-100 text-left text-sm font-semibold text-gray-700">
                End Date
              </th>
              <th className="py-2 px-4 border-b border-gray-200 bg-gray-100 text-left text-sm font-semibold text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product._id} className="hover:bg-gray-50 transition duration-200">
                <td className="py-2 px-4 border-b border-gray-200 text-sm text-gray-700">
                  {product.title}
                </td>
                <td className="py-2 px-4 border-b border-gray-200 text-sm text-gray-700">
                  {product.description}
                </td>
                <td className="py-2 px-4 border-b border-gray-200 text-sm text-gray-700">
                  {product.category}
                </td>
                <td className="py-2 px-4 border-b border-gray-200 text-sm text-gray-700">
                  ${product.startingBid}
                </td>
                <td className="py-2 px-4 border-b border-gray-200 text-sm text-gray-700">
                  {new Date(product.endDate).toLocaleDateString()}
                </td>
                <td className="py-2 px-4 border-b border-gray-200 text-sm text-gray-700">
                  <button
                    onClick={() => handleEdit(product)}
                    className="text-blue-500 hover:text-blue-700 mr-2"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(product._id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Product Form */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Edit Product</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const updatedProduct = {
                  _id: editingProduct._id,
                  title: formData.get("title"),
                  description: formData.get("description"),
                  category: formData.get("category"),
                  startingBid: formData.get("startingBid"), // Get startingBid
                  endDate: formData.get("endDate"),
                  image: e.target.image.files[0], // Get the uploaded file
                };
                handleUpdate(updatedProduct);
              }}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    name="title"
                    defaultValue={editingProduct.title}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    name="description"
                    defaultValue={editingProduct.description}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                    rows="4"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <select
                    name="category"
                    defaultValue={editingProduct.category}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                    required
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Starting Bid</label>
                  <input
                    type="number"
                    name="startingBid"
                    defaultValue={editingProduct.startingBid}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    defaultValue={new Date(editingProduct.endDate).toISOString().split('T')[0]}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Image</label>
                  <input
                    type="file"
                    name="image"
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-200"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;