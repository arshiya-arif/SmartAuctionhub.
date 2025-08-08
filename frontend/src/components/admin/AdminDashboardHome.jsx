import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Table, 
  Spin, 
  message,
  Empty,
  Tag,
  Image
} from 'antd';
import { 
  UserOutlined, 
  ShoppingOutlined, 
  RiseOutlined,
  TeamOutlined,
  DollarOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

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

const AdminDashboardHome = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const handleAuthError = () => {
    message.error('Session expired. Please login again');
    localStorage.removeItem('auth');
    navigate('/admin/login', { replace: true });
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      const authData = JSON.parse(localStorage.getItem('auth'));
      
      if (!authData?.token || authData.user?.role !== 'admin') {
        handleAuthError();
        return;
      }

      try {
        setLoading(true);
        const response = await api.get('/admin/dashboard');
        console.log('API Response:', response.data); // Debug log

        if (!response.data.success) {
          throw new Error(response.data.message);
        }

        const transformedData = {
          ...response.data.data,
          recent: {
            ...response.data.data.recent,
            auctions: response.data.data.recent?.auctions?.map(auction => {
              console.log('Original Auction Data:', auction); // Debug log
              
              // Handle both camelCase and lowercase field names
              const startingPrice = auction.startingPrice || auction.startingprice || auction.startingPrice || 0;
              const currentPrice = auction.currentPrice || auction.currentprice || startingPrice || 0;

              return {
                ...auction,
                startingPrice,
                currentPrice,
                imageUrl: auction.image ? `http://localhost:3000/${auction.image.replace(/\\/g, "/")}` : null
              };
            }) || []
          }
        };

        console.log('Transformed Data:', transformedData); // Debug log
        setDashboardData(transformedData);
      } catch (error) {
        console.error('Dashboard error:', error);
        if (error.response?.status === 401) {
          handleAuthError();
        } else {
          message.error(error.response?.data?.message || 'Failed to load dashboard');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  const userColumns = [
    { 
      title: 'Name', 
      dataIndex: 'name',
      render: (text) => <span className="font-medium">{text}</span>
    },
    { 
      title: 'Email', 
      dataIndex: 'email',
      render: (text) => <span className="text-blue-500">{text}</span>
    },
    { 
      title: 'Role', 
      dataIndex: 'role',
      render: role => (
        <Tag color={role === 'seller' ? 'blue' : 'default'}>
          {role?.toUpperCase() || 'USER'}
        </Tag>
      )
    },
    { 
      title: 'Joined', 
      dataIndex: 'createdAt',
      render: date => (
        <span className="text-gray-600">
          {dayjs(date).format('MMM D, YYYY h:mm A')}
        </span>
      )
    }
  ];

  const auctionColumns = [
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
      render: (text) => <span className="font-semibold">{text}</span>
    },
    { 
      title: 'Status', 
      dataIndex: 'status',
      render: status => (
        <Tag color={
          status === 'active' ? 'green' : 
          status === 'completed' ? 'blue' : 'orange'
        }>
          {status?.toUpperCase()}
        </Tag>
      )
    },
    { 
      title: 'Starting Price', 
      dataIndex: 'startingPrice',
      render: (price, record) => {
        console.log('Starting Price Render:', { price, record }); // Debug log
        return (
          <span className="font-medium text-gray-600">
            ${Number(price).toFixed(2)}
          </span>
        );
      }
    },
    { 
      title: 'Current Price', 
      dataIndex: 'currentPrice',
      render: (price, record) => {
        console.log('Current Price Render:', { price, record }); // Debug log
        return (
          <span className="font-bold text-green-600">
            ${Number(price).toFixed(2)}
          </span>
        );
      }
    },
    { 
      title: 'Seller', 
      dataIndex: ['sellerId', 'name'],
      render: (name) => (
        <span className="text-blue-500">{name || 'No Seller'}</span>
      )
    },
    { 
      title: 'Created On', 
      dataIndex: 'createdAt',
      render: date => (
        <span className="text-gray-500">
          {dayjs(date).format('MMM D, YYYY')}
        </span>
      )
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" tip="Loading Dashboard..." fullscreen />
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Empty 
          description="No dashboard data available" 
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Admin Dashboard Overview</h2>
      
      <Row gutter={16}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card bordered={false} className="shadow-sm">
            <Statistic
              title="Total Users"
              value={dashboardData.counts?.users || 0}
              prefix={<UserOutlined className="text-blue-500" />}
              valueStyle={{ color: '#035efc' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card bordered={false} className="shadow-sm">
            <Statistic
              title="Active Auctions"
              value={dashboardData.counts?.activeAuctions || 0}
              prefix={<ShoppingOutlined className="text-green-500" />}
              valueStyle={{ color: '#035efc' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card bordered={false} className="shadow-sm">
            <Statistic
              title="Completed Auctions"
              value={dashboardData.counts?.completedAuctions || 0}
              prefix={<RiseOutlined className="text-purple-500" />}
              valueStyle={{ color: '#035efc' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card bordered={false} className="shadow-sm">
            <Statistic
              title="Total Bids"
              value={dashboardData.counts?.totalBids || 0}
              prefix={<TeamOutlined className="text-orange-500" />}
              valueStyle={{ color: '#035efc' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card bordered={false} className="shadow-sm">
            <Statistic
              title="Total Revenue"
              value={dashboardData.counts?.totalRevenue || 0}
              prefix={<DollarOutlined className="text-green-600" />}
              valueStyle={{ color: '#035efc' }}
              precision={2}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} className="mt-6">
        <Col xs={24} md={12}>
          <Card 
            title={<span className="font-semibold">Recent Users</span>} 
            bordered={false}
            className="shadow-sm h-full"
          >
            {dashboardData.recent?.users?.length > 0 ? (
              <Table 
                columns={userColumns}
                dataSource={dashboardData.recent.users}
                rowKey="_id"
                pagination={false}
                scroll={{ x: true }}
                size="middle"
              />
            ) : (
              <Empty 
                description="No recent users found" 
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card 
            title={<span className="font-semibold">Recent Auctions</span>} 
            bordered={false}
            className="shadow-sm h-full"
          >
            {dashboardData.recent?.auctions?.length > 0 ? (
              <Table 
                columns={auctionColumns}
                dataSource={dashboardData.recent.auctions}
                rowKey="_id"
                pagination={false}
                scroll={{ x: true }}
                size="middle"
              />
            ) : (
              <Empty 
                description="No recent auctions found" 
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboardHome;