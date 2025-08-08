
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Tag, Button, Space, Modal, Descriptions, message, Spin, Popconfirm, Image } from 'antd';
import { EyeOutlined, StopOutlined } from '@ant-design/icons';

// Create axios instance with request interceptor
const api = axios.create({
  baseURL: 'http://localhost:3000/api',
});

// Add request interceptor to inject fresh token
api.interceptors.request.use(config => {
  const authData = JSON.parse(localStorage.getItem('auth'));
  if (authData?.token) {
    config.headers.Authorization = `Bearer ${authData.token}`;
  }
  return config;
});

const AdminAuctions = () => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAuction, setSelectedAuction] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleAuthError = () => {
    message.error('Session expired. Please login again');
    localStorage.removeItem('auth');
    window.location.href = '/admin/login';
  };

  const fetchAuctions = async () => {
    // Check authentication first
    const authData = JSON.parse(localStorage.getItem('auth'));
    if (!authData?.token || authData.user?.role !== 'admin') {
      handleAuthError();
      return;
    }

    setLoading(true);
    try {
      const res = await api.get('/admin/auctions');
      
      const processedAuctions = res.data.data.map(auction => ({
        ...auction,
        key: auction._id,
        sellerName: auction.sellerId?.name || 'Unknown Seller',
        imageUrl: auction.image ? `http://localhost:3000/${auction.image.replace(/\\/g, "/")}` : null
      }));
      
      setAuctions(processedAuctions);
    } catch (error) {
      if (error.response?.status === 401) {
        handleAuthError();
      } else {
        message.error(error.response?.data?.message || 'Failed to fetch auctions');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuctions();
  }, []);

  const viewAuctionDetails = (auction) => {
    setSelectedAuction(auction);
    setIsModalVisible(true);
  };

  const endAuction = async (auctionId) => {
    try {
      await api.put(`/admin/auctions/${auctionId}/end`);
      message.success('Auction ended successfully');
      fetchAuctions();
    } catch (error) {
      if (error.response?.status === 401) {
        handleAuthError();
      } else {
        message.error('Failed to end auction');
      }
    }
  };

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
          alt="Auction"
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
      title: 'Seller',
      dataIndex: 'sellerName',
      key: 'seller',
    },
    {
      title: 'Starting Bid',
      dataIndex: 'startingBid',
      key: 'startingBid',
      render: (amount) => `$${amount}`
    },
    {
      title: 'Highest Bid',
      dataIndex: 'highestBid',
      key: 'highestBid',
      render: (amount) => `$${amount || 'No bids yet'}`
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = '';
        let text = '';
        
        switch(status) {
          case 'active':
            color = 'green';
            text = 'Active';
            break;
          case 'ended_winner':
            color = 'orange';
            text = 'Completed';
            break;
          default:
            color = 'gray';
            text = 'Ended';
        }
        
        return <Tag color={color}>{text}</Tag>;
      }
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            icon={<EyeOutlined />} 
            onClick={() => viewAuctionDetails(record)}
          >
            View
          </Button>
          {record.status === 'active' && (
            <Popconfirm
              title="Are you sure to end this auction?"
              onConfirm={() => endAuction(record._id)}
              okText="Yes"
              cancelText="No"
            >
              <Button icon={<StopOutlined />} danger>
                End
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Auction Monitoring</h2>
      </div>

      <Table 
        columns={columns} 
        dataSource={auctions} 
        loading={loading}
        rowKey="_id"
        bordered
      />

      <Modal
        title="Auction Details"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedAuction && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Title">{selectedAuction.title}</Descriptions.Item>
            <Descriptions.Item label="Description">{selectedAuction.description}</Descriptions.Item>
            <Descriptions.Item label="Seller">{selectedAuction.sellerName}</Descriptions.Item>
            <Descriptions.Item label="Starting Bid">${selectedAuction.startingBid}</Descriptions.Item>
            <Descriptions.Item label="Highest Bid">${selectedAuction.highestBid || 'No bids yet'}</Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={selectedAuction.status === 'active' ? 'green' : 'orange'}>
                {selectedAuction.status === 'active' ? 'Active' : 'Completed'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="End Date">
              {new Date(selectedAuction.endDate).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="Image">
              {selectedAuction.imageUrl ? (
                <img 
                  src={selectedAuction.imageUrl}
                  alt={selectedAuction.title} 
                  className="max-w-full h-40 object-contain"
                  onError={(e) => e.target.src = "https://via.placeholder.com/400"}
                />
              ) : (
                <span>No Image Available</span>
              )}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default AdminAuctions;