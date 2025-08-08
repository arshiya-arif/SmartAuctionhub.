import { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Input, Button, Card, Switch, message, Spin } from 'antd';
import { SaveOutlined } from '@ant-design/icons';

const AdminSettings = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await axios.get('/api/admin/settings');
      form.setFieldsValue(res.data.data);
    } catch (error) {
      message.error('Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      setSaving(true);
      await axios.put('/api/admin/settings', values);
      message.success('Settings saved successfully');
    } catch (error) {
      message.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Spin size="large" className="flex justify-center mt-10" />;
  }

  return (
    <div className="p-6">
      <Card title="System Settings" className="max-w-3xl mx-auto">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            label="Site Name"
            name="siteName"
            rules={[{ required: true, message: 'Please input the site name!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Site Email"
            name="siteEmail"
            rules={[
              { required: true, message: 'Please input the site email!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Commission Rate (%)"
            name="commissionRate"
            rules={[
              { required: true, message: 'Please input the commission rate!' },
              { pattern: /^[0-9]+$/, message: 'Please enter a valid number!' }
            ]}
          >
            <Input type="number" min={0} max={100} />
          </Form.Item>

          <Form.Item
            label="Auction Duration (Days)"
            name="auctionDuration"
            rules={[
              { required: true, message: 'Please input the auction duration!' },
              { pattern: /^[0-9]+$/, message: 'Please enter a valid number!' }
            ]}
          >
            <Input type="number" min={1} max={30} />
          </Form.Item>

          <Form.Item
            label="Enable Email Notifications"
            name="emailNotifications"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            label="Maintenance Mode"
            name="maintenanceMode"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              icon={<SaveOutlined />}
              loading={saving}
            >
              Save Settings
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default AdminSettings;