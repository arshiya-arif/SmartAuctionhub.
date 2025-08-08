
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Button, Space, Modal, Form, Input, message, Popconfirm, Spin } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';

// Create axios instance with interceptor
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

const AdminManagement = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingAdminId, setEditingAdminId] = useState(null);

  const handleAuthError = () => {
    message.error('Session expired. Please login again');
    localStorage.removeItem('auth');
    window.location.href = '/admin/login';
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    // Check authentication first
    const authData = JSON.parse(localStorage.getItem('auth'));
    if (!authData?.token || authData.user?.role !== 'admin') {
      handleAuthError();
      return;
    }

    setLoading(true);
    try {
      const res = await api.get('/admin/admins');
      setAdmins(res.data.data);
    } catch (error) {
      if (error.response?.status === 401) {
        handleAuthError();
      } else {
        message.error('Failed to fetch admins');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = () => {
    form.resetFields();
    setEditingAdminId(null);
    setIsModalVisible(true);
  };

  const handleEdit = (admin) => {
    form.setFieldsValue({
      name: admin.name,
      email: admin.email,
      phone: admin.phone
    });
    setEditingAdminId(admin._id);
    setIsModalVisible(true);
  };

  const handleDelete = async (adminId) => {
    try {
      await api.delete(`/admin/admins/${adminId}`);
      message.success('Admin deleted successfully');
      fetchAdmins();
    } catch (error) {
      if (error.response?.status === 401) {
        handleAuthError();
      } else {
        message.error('Failed to delete admin');
      }
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingAdminId) {
        await api.put(`/admin/admins/${editingAdminId}`, values);
        message.success('Admin updated successfully');
      } else {
        await api.post('/admin/admins', values);
        message.success('Admin created successfully');
      }
      
      setIsModalVisible(false);
      fetchAdmins();
    } catch (error) {
      if (error.response?.status === 401) {
        handleAuthError();
      } else {
        message.error(error.response?.data?.message || 'Operation failed');
      }
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" onClick={() => handleEdit(record)}>Edit</Button>
          {record._id !== editingAdminId && (
            <Popconfirm
              title="Are you sure to delete this admin?"
              onConfirm={() => handleDelete(record._id)}
              okText="Yes"
              cancelText="No"
            >
              <Button type="link" danger>Delete</Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Admin Management</h2>
        <Button type="primary" onClick={handleAddAdmin}>
          Add Admin
        </Button>
      </div>

      <Table 
        columns={columns} 
        dataSource={admins} 
        loading={loading}
        rowKey="_id"
        bordered
      />

      <Modal
        title={editingAdminId ? "Edit Admin" : "Add New Admin"}
        visible={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => setIsModalVisible(false)}
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

          {!editingAdminId && (
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

export default AdminManagement;