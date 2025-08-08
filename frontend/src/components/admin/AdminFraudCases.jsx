import { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Tag, Button, Space, Modal, Descriptions, message, Input, Select, Spin } from 'antd';
import { ExclamationCircleOutlined, SearchOutlined } from '@ant-design/icons';

const { Option } = Select;

const AdminFraudCases = () => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchFraudCases();
  }, []);

  const fetchFraudCases = async () => {
    try {
      const res = await axios.get('/api/admin/fraud-cases');
      setCases(res.data.data);
    } catch (error) {
      message.error('Failed to fetch fraud cases');
    } finally {
      setLoading(false);
    }
  };

  const viewCaseDetails = (caseItem) => {
    setSelectedCase(caseItem);
    setIsModalVisible(true);
  };

  const updateCaseStatus = async (caseId, status) => {
    try {
      await axios.put(`/api/admin/fraud-cases/${caseId}`, { status });
      message.success('Case status updated');
      fetchFraudCases();
    } catch (error) {
      message.error('Failed to update case');
    }
  };

  const filteredCases = cases.filter(caseItem => {
    const matchesSearch = caseItem.reportedUser.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         caseItem.reason.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || caseItem.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns = [
    {
      title: 'Reported User',
      dataIndex: ['reportedUser', 'name'],
      key: 'reportedUser',
    },
    {
      title: 'Reason',
      dataIndex: 'reason',
      key: 'reason',
      ellipsis: true,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = '';
        switch(status) {
          case 'pending':
            color = 'orange';
            break;
          case 'resolved':
            color = 'green';
            break;
          case 'rejected':
            color = 'red';
            break;
          default:
            color = 'gray';
        }
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      }
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button onClick={() => viewCaseDetails(record)}>Details</Button>
          <Select
            defaultValue={record.status}
            style={{ width: 120 }}
            onChange={(value) => updateCaseStatus(record._id, value)}
          >
            <Option value="pending">Pending</Option>
            <Option value="resolved">Resolved</Option>
            <Option value="rejected">Rejected</Option>
          </Select>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Fraud Cases</h2>
        <Space>
          <Input
            placeholder="Search cases"
            prefix={<SearchOutlined />}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: 200 }}
          />
          <Select
            defaultValue="all"
            style={{ width: 120 }}
            onChange={(value) => setStatusFilter(value)}
          >
            <Option value="all">All Status</Option>
            <Option value="pending">Pending</Option>
            <Option value="resolved">Resolved</Option>
            <Option value="rejected">Rejected</Option>
          </Select>
        </Space>
      </div>

      <Table 
        columns={columns} 
        dataSource={filteredCases} 
        loading={loading}
        rowKey="_id"
        bordered
      />

      <Modal
        title="Fraud Case Details"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedCase && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Reported User">
              {selectedCase.reportedUser?.name} ({selectedCase.reportedUser?.email})
            </Descriptions.Item>
            <Descriptions.Item label="Reported By">
              {selectedCase.reporter?.name} ({selectedCase.reporter?.email})
            </Descriptions.Item>
            <Descriptions.Item label="Reason">{selectedCase.reason}</Descriptions.Item>
            <Descriptions.Item label="Description">{selectedCase.description}</Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={
                selectedCase.status === 'pending' ? 'orange' :
                selectedCase.status === 'resolved' ? 'green' : 'red'
              }>
                {selectedCase.status.toUpperCase()}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Reported At">
              {new Date(selectedCase.createdAt).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="Evidence">
              {selectedCase.evidence && (
                <div className="mt-2">
                  {selectedCase.evidence.map((item, index) => (
                    <div key={index} className="mb-2">
                      {item.type === 'image' ? (
                        <img 
                          src={item.url} 
                          alt="Evidence" 
                          className="max-w-full h-40 object-contain border rounded"
                        />
                      ) : (
                        <a 
                          href={item.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-500"
                        >
                          View Document
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default AdminFraudCases;