import React, { useEffect, useState } from 'react'
import { Table, Card, Spin, message, Button, Modal, Form, Input, Select } from 'antd'
import { AccountBookOutlined, PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons'
import { getAccounts, createAccount, updateAccount, deleteAccount } from '../services/api'

const Accounts = () => {
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [form] = Form.useForm()
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [currentAccount, setCurrentAccount] = useState(null)

  const fetchAccounts = async () => {
    try {
      setLoading(true)
      const data = await getAccounts()
      setAccounts(data)
    } catch (error) {
      message.error('获取科目列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAccounts()
  }, [])

  // 递归计算父科目余额
  const calculateParentBalance = (accounts) => {
    const accountMap = {};
    const rootAccounts = [];
    
    // 首先创建所有账户的映射
    accounts.forEach(account => {
      accountMap[account.id] = { ...account, children: [] };
    });
    
    // 构建层级结构
    accounts.forEach(account => {
      if (account.parent_id) {
        if (accountMap[account.parent_id]) {
          accountMap[account.parent_id].children.push(accountMap[account.id]);
        }
      } else {
        rootAccounts.push(accountMap[account.id]);
      }
    });
    
    // 递归计算父科目余额
    const computeBalance = (account) => {
      // 计算所有子科目的余额总和
      const childrenBalance = account.children.reduce((sum, child) => {
        return sum + computeBalance(child);
      }, 0);
      
      // 父科目余额 = 自身余额 + 所有子科目余额
      account.totalBalance = account.balance + childrenBalance;
      return account.totalBalance;
    };
    
    // 计算每个根科目的余额
    rootAccounts.forEach(account => {
      computeBalance(account);
    });
    
    return rootAccounts;
  };
  
  const [processedAccounts, setProcessedAccounts] = useState([]);
  
  useEffect(() => {
    if (accounts.length > 0) {
      const rootAccounts = calculateParentBalance(accounts);
      setProcessedAccounts(rootAccounts);
    }
  }, [accounts]);
  
  // 账户类型选项
  const accountTypes = [
    { value: '资产', label: '资产' },
    { value: '负债', label: '负债' },
    { value: '权益', label: '权益' },
    { value: '收入', label: '收入' },
    { value: '费用', label: '费用' }
  ];

  // 显示新增/编辑模态框
  const showModal = (account = null) => {
    if (account) {
      setIsEditMode(true)
      setCurrentAccount(account)
      form.setFieldsValue({
        code: account.code,
        name: account.name,
        type: account.type,
        parent_id: account.parent_id,
        description: account.description,
        balance: account.balance
      })
    } else {
      setIsEditMode(false)
      setCurrentAccount(null)
      form.resetFields()
    }
    setIsModalVisible(true)
  }

  // 关闭模态框
  const handleCancel = () => {
    setIsModalVisible(false)
    form.resetFields()
  }

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      
      if (isEditMode && currentAccount) {
        // 更新科目
        await updateAccount(currentAccount.id, values)
        message.success('科目更新成功')
      } else {
        // 新增科目
        await createAccount(values)
        message.success('科目新增成功')
      }
      
      // 刷新科目列表
      fetchAccounts()
      setIsModalVisible(false)
      form.resetFields()
    } catch (error) {
      message.error('操作失败：' + error.message)
    }
  }

  // 删除科目
  const handleDelete = async (id) => {
    try {
      await deleteAccount(id)
      message.success('科目删除成功')
      fetchAccounts()
    } catch (error) {
      message.error('删除失败：' + error.message)
    }
  }
  
  const columns = [
    {
      title: '科目名称',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => {
        const indent = record.parent_id ? '└─ ' : '';
        return `${indent}${name} (${record.code})`;
      }
    },
    {
      title: '科目类型',
      dataIndex: 'type',
      key: 'type',
      render: (type) => {
        const typeMap = {
          '资产': <span style={{ color: '#1890ff' }}>资产</span>,
          '负债': <span style={{ color: '#faad14' }}>负债</span>,
          '权益': <span style={{ color: '#52c41a' }}>权益</span>,
          '收入': <span style={{ color: '#52c41a' }}>收入</span>,
          '费用': <span style={{ color: '#f5222d' }}>费用</span>
        }
        return typeMap[type] || type;
      }
    },
    {
      title: '余额',
      dataIndex: 'balance',
      key: 'balance',
      render: (balance, record) => {
        // 父科目显示计算后的总余额，子科目显示自身余额
        const displayBalance = record.totalBalance !== undefined ? record.totalBalance : balance;
        const balanceClass = displayBalance >= 0 ? 'positive-balance' : 'negative-balance';
        return <span className={balanceClass}>{displayBalance.toFixed(2)} 元</span>;
      },
      sorter: (a, b) => {
        const balanceA = a.totalBalance !== undefined ? a.totalBalance : a.balance;
        const balanceB = b.totalBalance !== undefined ? b.totalBalance : b.balance;
        return balanceA - balanceB;
      }
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description'
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <>
          <Button type="link" icon={<EditOutlined />} onClick={() => showModal(record)}>
            编辑
          </Button>
          <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>
            删除
          </Button>
        </>
      )
    }
  ]

  return (
    <div>
      <h1>科目管理</h1>
      <Card>
        <div style={{ marginBottom: 16, textAlign: 'right' }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
            新增科目
          </Button>
        </div>
        <Spin spinning={loading}>
          <Table
              dataSource={processedAccounts}
              columns={columns}
              rowKey="id"
              pagination={{ pageSize: 20 }}
              expandable={{
                expandedRowRender: (record) => null,
                expandIconColumnIndex: 0,
              }}
              childrenColumnName="children"
            />
        </Spin>
        
        {/* 新增/编辑科目模态框 */}
        <Modal
          title={isEditMode ? '编辑科目' : '新增科目'}
          visible={isModalVisible}
          onOk={handleSubmit}
          onCancel={handleCancel}
          destroyOnClose
        >
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              balance: 0.0
            }}
          >
            <Form.Item
              name="code"
              label="科目编码"
              rules={[{ required: false, message: '请输入科目编码（可选，不填则自动生成）' }]}
            >
              <Input placeholder="请输入科目编码（可选，不填则自动生成）" />
            </Form.Item>
            
            <Form.Item
              name="name"
              label="科目名称"
              rules={[{ required: true, message: '请输入科目名称' }]}
            >
              <Input placeholder="请输入科目名称" />
            </Form.Item>
            
            <Form.Item
              name="type"
              label="科目类型"
              rules={[{ required: true, message: '请选择科目类型' }]}
            >
              <Select placeholder="请选择科目类型">
                {accountTypes.map(type => (
                  <Select.Option key={type.value} value={type.value}>{type.label}</Select.Option>
                ))}
              </Select>
            </Form.Item>
            
            <Form.Item
              name="parent_id"
              label="上级科目"
            >
              <Select placeholder="请选择上级科目（可选）">
                <Select.Option value={null}>无上级科目</Select.Option>
                {accounts.map(account => (
                  <Select.Option key={account.id} value={account.id}>{account.name} ({account.code})</Select.Option>
                ))}
              </Select>
            </Form.Item>
            
            <Form.Item
              name="description"
              label="科目描述"
            >
              <Input.TextArea placeholder="请输入科目描述" rows={3} />
            </Form.Item>
            
            <Form.Item
              name="balance"
              label="金额"
              rules={[{ required: true, message: '请输入金额' }]}
            >
              <Input placeholder="请输入金额" type="number" />
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </div>
  )
}

export default Accounts