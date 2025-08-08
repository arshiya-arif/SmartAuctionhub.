
import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Table, 
  Button, 
  Space, 
  Modal, 
  Form, 
  Input, 
  Select, 
  message, 
  Popconfirm,
  Tag  // Added Tag import
} from 'antd';
import { 
  UserOutlined, 
  MailOutlined, 
  LockOutlined 
} from '@ant-design/icons';

const { Option } = Select;

// Create axios instance with interceptors
const api = axios.create({
  baseURL: 'http://localhost:3000/api',
});

// Add request interceptor to inject token
api.interceptors.request.use(config => {
  const authData = JSON.parse(localStorage.getItem('auth'));
  if (authData?.token) {
    config.headers.Authorization = `Bearer ${authData.token}`;
  }
  return config;
});

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingUserId, setEditingUserId] = useState(null);

  // Fetch users with authentication check
  const fetchUsers = async () => {
    const authData = JSON.parse(localStorage.getItem('auth'));
    if (!authData?.token || authData.user?.role !== 'admin') {
      message.error('Please login as admin first');
      window.location.href = '/admin/login';
      return;
    }

    setLoading(true);
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data.data || res.data);
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  // Handle API errors
  const handleApiError = (error) => {
    if (error.response?.status === 401) {
      message.error('Session expired. Please login again');
      localStorage.removeItem('auth');
      window.location.href = '/admin/login';
    } else {
      message.error(error.response?.data?.message || 'Operation failed');
    }
  };

  // Form submission
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingUserId) {
        await api.put(`/admin/users/${editingUserId}`, values);
        message.success('User updated successfully');
      } else {
        await api.post('/admin/users', values);
        message.success('User created successfully');
      }
      
      setIsModalVisible(false);
      fetchUsers();
    } catch (error) {
      handleApiError(error);
    }
  };

  // Delete user
  const handleDelete = async (userId) => {
    try {
      await api.delete(`/admin/users/${userId}`);
      message.success('User deleted successfully');
      fetchUsers();
    } catch (error) {
      handleApiError(error);
    }
  };

  // Add new user
  const handleAddUser = () => {
    form.resetFields();
    setEditingUserId(null);
    setIsModalVisible(true);
  };

  // Edit user
  const handleEdit = (user) => {
    form.setFieldsValue({
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone
    });
    setEditingUserId(user._id);
    setIsModalVisible(true);
  };

  // Table columns
  const columns = [
    { 
      title: 'Name', 
      dataIndex: 'name', 
      key: 'name',
      render: (text) => <span className="font-medium">{text}</span>
    },
    { 
      title: 'Email', 
      dataIndex: 'email', 
      key: 'email',
      render: (text) => <span className="text-blue-500">{text}</span>
    },
    { 
      title: 'Role', 
      dataIndex: 'role', 
      key: 'role',
      render: (role) => (
        <Tag color={
          role === 'admin' ? 'purple' : 
          role === 'seller' ? 'blue' : 'default'
        }>
          {role.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" onClick={() => handleEdit(record)}>Edit</Button>
          <Popconfirm
            title="Are you sure to delete this user?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger>Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">User Management</h2>
        <Button type="primary" onClick={handleAddUser}>
          Add User
        </Button>
      </div>

      <Table 
        columns={columns} 
        dataSource={users} 
        loading={loading}
        rowKey="_id"
        bordered
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingUserId ? "Edit User" : "Add New User"}
        visible={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => setIsModalVisible(false)}
        okText={editingUserId ? "Update" : "Create"}
        cancelText="Cancel"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please input the name!' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Name" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please input the email!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="Email" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Phone"
            rules={[{ required: true, message: 'Please input the phone number!' }]}
          >
            <Input placeholder="Phone" />
          </Form.Item>

          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: 'Please select a role!' }]}
          >
            <Select placeholder="Select a role">
              <Option value="buyer">Buyer</Option>
              <Option value="seller">Seller</Option>
              <Option value="admin">Admin</Option>
            </Select>
          </Form.Item>

          {!editingUserId && (
            <Form.Item
              name="password"
              label="Password"
              rules={[{ required: true, message: 'Please input the password!' }]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Password" />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default AdminUsers;