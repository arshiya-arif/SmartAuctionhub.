import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Row, Col, Spin, DatePicker, Select } from 'antd';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import moment from 'moment';

const { RangePicker } = DatePicker;
const { Option } = Select;

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const AdminAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [timeRange, setTimeRange] = useState('week');
  const [dateRange, setDateRange] = useState([
    moment().subtract(1, 'month'),
    moment()
  ]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange, dateRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      let params = {};
      
      if (timeRange === 'custom') {
        params = {
          startDate: dateRange[0].format('YYYY-MM-DD'),
          endDate: dateRange[1].format('YYYY-MM-DD')
        };
      } else {
        params = { timeRange };
      }
      
      const res = await axios.get('http://localhost:3000/api/admin/analytics', { params });
      setAnalyticsData(res.data.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTimeRangeChange = (value) => {
    setTimeRange(value);
  };

  const handleDateChange = (dates) => {
    setDateRange(dates);
    if (dates) {
      setTimeRange('custom');
    }
  };

  if (loading || !analyticsData) {
    return <Spin size="large" className="flex justify-center mt-10" />;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Analytics Dashboard</h2>
        <Space>
          <Select 
            defaultValue="week" 
            style={{ width: 120 }}
            onChange={handleTimeRangeChange}
            value={timeRange}
          >
            <Option value="day">Today</Option>
            <Option value="week">This Week</Option>
            <Option value="month">This Month</Option>
            <Option value="year">This Year</Option>
            <Option value="custom">Custom</Option>
          </Select>
          {timeRange === 'custom' && (
            <RangePicker 
              value={dateRange}
              onChange={handleDateChange}
            />
          )}
        </Space>
      </div>

      <Row gutter={16} className="mb-6">
        <Col xs={24} md={12}>
          <Card title="User Registrations" className="h-full">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.userRegistrations}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8884d8" name="Registrations" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="User Roles Distribution" className="h-full">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analyticsData.userRoles}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="role"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {analyticsData.userRoles.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Card title="Auction Activity" className="h-full">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData.auctionActivity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="created" 
                  stroke="#8884d8" 
                  name="Auctions Created"
                />
                <Line 
                  type="monotone" 
                  dataKey="ended" 
                  stroke="#82ca9d" 
                  name="Auctions Ended"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Revenue" className="h-full">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.revenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="amount" fill="#82ca9d" name="Revenue ($)" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminAnalytics;