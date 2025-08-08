import { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Tag, Button, Modal, Descriptions, Input, message, Spin, Image } from 'antd';
import { SearchOutlined, EyeOutlined } from '@ant-design/icons';

// Create axios instance with interceptor
const api = axios.create({
  baseURL: 'http://localhost:3000/api',
});

api.interceptors.request.use(config => {
  const authData = JSON.parse(localStorage.getItem('auth'));
  if (authData?.token) {
    config.headers.Authorization = `Bearer ${authData.token}`;
  }
  return config;
});

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/admin/products');
      
      // Process products with proper image URLs
      const processedProducts = res.data.data.map(product => ({
        ...product,
        key: product._id,
        imageUrl: product.image 
          ? `http://localhost:3000/${product.image.replace(/\\/g, "/")}`
          : 'https://via.placeholder.com/150'
      }));
      
      setProducts(processedProducts);
    } catch (error) {
      if (error.response?.status === 401) {
        message.error('Session expired. Please login again');
        localStorage.removeItem('auth');
        window.location.href = '/admin/login';
      } else {
        message.error('Failed to fetch products');
      }
    } finally {
      setLoading(false);
    }
  };

  const viewProductDetails = (product) => {
    setSelectedProduct(product);
    setIsModalVisible(true);
  };

  const filteredProducts = products.filter(product => 
    product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      title: 'Image',
      dataIndex: 'imageUrl',
      key: 'image',
      width: 100,
      render: (imageUrl) => (
        <Image
          width={50}
          height={50}
          src={imageUrl}
          alt="Product"
          style={{ objectFit: 'cover' }}
          fallback="https://via.placeholder.com/50"
        />
      )
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category) => <Tag color="blue">{category}</Tag>
    },
    {
      title: 'Seller',
      dataIndex: ['sellerId', 'name'],
      key: 'seller',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button 
          icon={<EyeOutlined />} 
          onClick={() => viewProductDetails(record)}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">All Products</h2>
        <Input
          placeholder="Search products"
          prefix={<SearchOutlined />}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: 300 }}
        />
      </div>

      <Table 
        columns={columns} 
        dataSource={filteredProducts} 
        loading={loading}
        rowKey="_id"
        bordered
      />

      <Modal
        title="Product Details"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedProduct && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Title">{selectedProduct.title}</Descriptions.Item>
            <Descriptions.Item label="Description">{selectedProduct.description}</Descriptions.Item>
            <Descriptions.Item label="Category">{selectedProduct.category}</Descriptions.Item>
            <Descriptions.Item label="Seller">{selectedProduct.sellerId?.name}</Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={selectedProduct.status === 'active' ? 'green' : 'red'}>
                {selectedProduct.status.toUpperCase()}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Created At">
              {new Date(selectedProduct.createdAt).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="Image">
              <Image
                width={200}
                src={selectedProduct.imageUrl}
                alt={selectedProduct.title}
                fallback="https://via.placeholder.com/200"
              />
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default AdminProducts;