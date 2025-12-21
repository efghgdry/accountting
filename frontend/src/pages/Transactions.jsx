import React, { useEffect, useState } from 'react'
import { Table, Button, Modal, Form, Input, Select, DatePicker, message, Card, Row, Col, Space } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { getVouchers, createVoucher, updateVoucher, deleteVoucher, getAccounts, postVoucher, unpostVoucher, getVendors } from '../services/api'
import dayjs from 'dayjs'

const { Option } = Select
const { RangePicker } = DatePicker

const VoucherEntryForm = ({ index, accounts, entry, onChange, onRemove }) => {
  const handleChange = (field, value) => {
    onChange(index, { ...entry, [field]: value })
  }

  return (
    <Card title={`分录 ${index + 1}`} style={{ marginBottom: 16 }}>
      <Row gutter={16}>
        <Col span={8}>
          <Form.Item label="科目" required>
            <Select
              value={entry.account_id}
              onChange={(value) => handleChange('account_id', value)}
              placeholder="请选择科目"
              style={{ width: '100%' }}
            >
              {accounts.map(account => (
                <Option key={account.id} value={account.id}>
                  {account.code} - {account.name} ({account.type})
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item label="方向" required>
            <Select
              value={entry.direction}
              onChange={(value) => handleChange('direction', value)}
              placeholder="请选择方向"
              style={{ width: '100%' }}
            >
              <Option value="借方">借方</Option>
              <Option value="贷方">贷方</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item label="金额" required>
            <Input
              type="number"
              value={entry.amount}
              onChange={(e) => handleChange('amount', parseFloat(e.target.value) || 0)}
              placeholder="请输入金额"
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Col>
        <Col span={4} style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', paddingBottom: 8 }}>
          <Button danger onClick={() => onRemove(index)} disabled={index === 0}>
            删除
          </Button>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={24}>
          <Form.Item label="摘要">
            <Input
              value={entry.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="请输入摘要"
            />
          </Form.Item>
        </Col>
      </Row>
    </Card>
  )
}

const Transactions = () => {
  const [vouchers, setVouchers] = useState([])
  const [filteredVouchers, setFilteredVouchers] = useState([])
  const [accounts, setAccounts] = useState([])
  const [vendors, setVendors] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingVoucher, setEditingVoucher] = useState(null)
  const [form] = Form.useForm()
  const [entries, setEntries] = useState([{ account_id: null, direction: '借方', amount: 0, description: '' }, { account_id: null, direction: '贷方', amount: 0, description: '' }])
  const [searchForm] = Form.useForm()
  const [dateRange, setDateRange] = useState([])

  const fetchVouchers = async () => {
    try {
      setLoading(true)
      const data = await getVouchers()
      setVouchers(data)
      setFilteredVouchers(data)
    } catch (error) {
      message.error('获取凭证列表失败')
    } finally {
      setLoading(false)
    }
  }

  const fetchAccounts = async () => {
    try {
      const data = await getAccounts()
      setAccounts(data)
    } catch (error) {
      message.error('获取科目列表失败')
    }
  }

  const fetchVendors = async () => {
    try {
      const data = await getVendors()
      setVendors(data)
    } catch (error) {
      message.error('获取供应商列表失败')
    }
  }

  useEffect(() => {
    fetchVouchers()
    fetchAccounts()
    fetchVendors()
  }, [])

  // 搜索功能
  const handleSearch = () => {
    const values = searchForm.getFieldsValue()
    
    let result = [...vouchers]
    
    // 按状态筛选
    if (values.status) {
      result = result.filter(voucher => voucher.status === values.status)
    }
    
    // 按科目筛选
    if (values.account) {
      result = result.filter(voucher => {
        return voucher.entries.some(entry => entry.account_id === values.account)
      })
    }
    
    // 按方向筛选
    if (values.direction) {
      result = result.filter(voucher => {
        return voucher.entries.some(entry => entry.direction === values.direction)
      })
    }
    
    // 按日期范围筛选
    if (dateRange && dateRange.length === 2) {
      const startDate = dateRange[0].startOf('day')
      const endDate = dateRange[1].endOf('day')
      
      result = result.filter(voucher => {
        const voucherDate = new Date(voucher.date)
        return voucherDate >= startDate && voucherDate <= endDate
      })
    }
    
    setFilteredVouchers(result)
  }

  // 重置搜索
  const handleReset = () => {
    searchForm.resetFields()
    setDateRange([])
    setFilteredVouchers(vouchers)
  }

  const handleAdd = () => {
    setEditingVoucher(null)
    form.resetFields()
    setEntries([{ account_id: null, direction: '借方', amount: 0, description: '' }, { account_id: null, direction: '贷方', amount: 0, description: '' }])
    setModalVisible(true)
  }

  const handleEdit = async (record) => {
    try {
      setEditingVoucher(record)
      form.setFieldsValue({
        date: dayjs(record.date),
        description: record.description,
        status: record.status
      })
      setEntries(record.entries ? record.entries.map(entry => ({
        account_id: entry.account_id,
        direction: entry.direction,
        amount: entry.amount,
        description: entry.description
      })) : [{ account_id: null, direction: '借方', amount: 0, description: '' }, { account_id: null, direction: '贷方', amount: 0, description: '' }])
      setModalVisible(true)
    } catch (error) {
      console.error('编辑凭证失败:', error)
      message.error('加载凭证信息失败')
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteVoucher(id)
      message.success('凭证删除成功')
      fetchVouchers()
    } catch (error) {
      message.error('凭证删除失败')
    }
  }

  const handleEntryChange = (index, newEntry) => {
    const newEntries = [...entries]
    newEntries[index] = newEntry
    setEntries(newEntries)
  }

  const handleAddEntry = () => {
    setEntries([...entries, { account_id: null, direction: '借方', amount: 0, description: '' }])
  }

  const handleRemoveEntry = (index) => {
    if (entries.length > 2) {
      const newEntries = entries.filter((_, i) => i !== index)
      setEntries(newEntries)
    } else {
      message.warning('至少需要两条分录')
    }
  }

  const handleSave = async (values) => {
    try {
      // 验证所有分录都已填写
      const incompleteEntry = entries.find(entry => !entry.account_id || !entry.amount || entry.amount <= 0)
      if (incompleteEntry) {
        message.error('请填写完整的分录信息')
        return
      }

      // 验证借贷平衡
      const debitTotal = entries.reduce((sum, entry) => entry.direction === '借方' ? sum + entry.amount : sum, 0)
      const creditTotal = entries.reduce((sum, entry) => entry.direction === '贷方' ? sum + entry.amount : sum, 0)
      
      if (debitTotal !== creditTotal) {
        message.error(`借贷不平衡，借方合计: ${debitTotal.toFixed(2)}, 贷方合计: ${creditTotal.toFixed(2)}`)
        return
      }

      // 处理日期格式，确保转换为ISO字符串
      const voucherData = {
        ...values,
        date: dayjs(values.date).toISOString(),
        entries: entries.map(entry => ({
          account_id: entry.account_id,
          direction: entry.direction,
          amount: entry.amount,
          description: entry.description
        }))
      }
      
      if (editingVoucher) {
        await updateVoucher(editingVoucher.id, voucherData)
        message.success('凭证更新成功')
      } else {
        await createVoucher(voucherData)
        message.success('凭证创建成功')
      }
      setModalVisible(false)
      fetchVouchers()
    } catch (error) {
      console.error('保存凭证失败:', error)
      message.error(editingVoucher ? '凭证更新失败' : '凭证创建失败')
    }
  }

  // 过账处理
  const handlePostVoucher = async (id) => {
    try {
      await postVoucher(id)
      message.success('凭证过账成功')
      fetchVouchers()
    } catch (error) {
      message.error('凭证过账失败')
    }
  }

  // 取消过账处理
  const handleUnpostVoucher = async (id) => {
    try {
      await unpostVoucher(id)
      message.success('取消过账成功')
      fetchVouchers()
    } catch (error) {
      message.error('取消过账失败')
    }
  }

  const columns = [
    {
      title: '凭证号',
      dataIndex: 'voucher_no',
      key: 'voucher_no'
    },
    {
      title: '凭证日期',
      dataIndex: 'date',
      key: 'date',
      render: (date) => new Date(date).toLocaleDateString()
    },
    {
      title: '摘要',
      dataIndex: 'description',
      key: 'description'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusMap = {
          '未审核': <span style={{ color: '#faad14' }}>未审核</span>,
          '已审核': <span style={{ color: '#52c41a' }}>已审核</span>,
          '已驳回': <span style={{ color: '#f5222d' }}>已驳回</span>
        }
        return statusMap[status] || status
      }
    },
    {
      title: '借方科目',
      key: 'debit_accounts',
      render: (_, record) => {
        const debitEntries = record.entries.filter(entry => entry.direction === '借方')
        return (
          <div>
            {debitEntries.map((entry, index) => (
              <div key={index}>
                {entry.account ? `${entry.account.code} - ${entry.account.name}` : '-'}: {entry.amount.toFixed(2)} 元
              </div>
            ))}
          </div>
        )
      }
    },
    {
      title: '贷方科目',
      key: 'credit_accounts',
      render: (_, record) => {
        const creditEntries = record.entries.filter(entry => entry.direction === '贷方')
        return (
          <div>
            {creditEntries.map((entry, index) => (
              <div key={index}>
                {entry.account ? `${entry.account.code} - ${entry.account.name}` : '-'}: {entry.amount.toFixed(2)} 元
              </div>
            ))}
          </div>
        )
      }
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="primary" icon={<EditOutlined />} size="small" onClick={() => handleEdit(record)} disabled={record.posted}>
            编辑
          </Button>
          {!record.posted ? (
            <Button type="success" size="small" onClick={() => handlePostVoucher(record.id)}>
              过账
            </Button>
          ) : (
            <Button type="warning" size="small" onClick={() => handleUnpostVoucher(record.id)}>
              取消过账
            </Button>
          )}
          <Button danger icon={<DeleteOutlined />} size="small" onClick={() => handleDelete(record.id)} disabled={record.posted}>
            删除
          </Button>
        </Space>
      )
    }
  ]

  return (
    <div>
      <h1>凭证管理</h1>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={12}>
          <Card title="快速筛选">
            <Form form={searchForm} layout="vertical">
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item name="status">
                    <Select placeholder="凭证状态">
                      <Option value="">全部</Option>
                      <Option value="未审核">未审核</Option>
                      <Option value="已审核">已审核</Option>
                      <Option value="已驳回">已驳回</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="account">
                    <Select placeholder="科目">
                      <Option value="">全部</Option>
                      {accounts.map(account => (
                        <Option key={account.id} value={account.id}>{account.code} - {account.name}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="direction">
                    <Select placeholder="方向">
                      <Option value="">全部</Option>
                      <Option value="借方">借方</Option>
                      <Option value="贷方">贷方</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16} style={{ marginTop: 16 }}>
                <Col span={12}>
                  <Form.Item name="dateRange">
                    <RangePicker 
                      style={{ width: '100%' }} 
                      placeholder={['开始日期', '结束日期']} 
                      onChange={setDateRange}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Space>
                    <Button type="primary" onClick={handleSearch}>
                      搜索
                    </Button>
                    <Button onClick={handleReset}>
                      重置
                    </Button>
                  </Space>
                </Col>
              </Row>
            </Form>
          </Card>
        </Col>
        <Col span={12}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} style={{ float: 'right' }}>
            新增凭证
          </Button>
        </Col>
      </Row>
      
      <Table
        dataSource={filteredVouchers}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
      
      <Modal
        title={editingVoucher ? '编辑凭证' : '新增凭证'}
        open={modalVisible}
        onOk={form.submit}
        onCancel={() => setModalVisible(false)}
        width={900}
        footer={[
          <Button key="back" onClick={() => setModalVisible(false)}>
            取消
          </Button>,
          <Button key="submit" type="primary" onClick={form.submit}>
            提交
          </Button>
        ]}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
        >
          <Form.Item
            name="date"
            label="凭证日期"
            rules={[{ required: true, message: '请选择凭证日期' }]}
          >
            <DatePicker style={{ width: '100%' }} placeholder="请选择凭证日期" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="凭证摘要"
            rules={[{ required: true, message: '请输入凭证摘要' }]}
          >
            <Input placeholder="请输入凭证摘要" />
          </Form.Item>
          
          <Form.Item
            name="vendor_id"
            label="供应商"
          >
            <Select placeholder="请选择供应商" allowClear>
              {vendors.map(vendor => (
                <Option key={vendor.id} value={vendor.id}>{vendor.name}</Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="status"
            label="凭证状态"
          >
            <Select placeholder="请选择凭证状态" defaultValue="未审核">
              <Option value="未审核">未审核</Option>
              <Option value="已审核">已审核</Option>
              <Option value="已驳回">已驳回</Option>
            </Select>
          </Form.Item>
          
          <h3>分录明细</h3>
          {entries.map((entry, index) => (
            <VoucherEntryForm
              key={index}
              index={index}
              accounts={accounts}
              entry={entry}
              onChange={handleEntryChange}
              onRemove={handleRemoveEntry}
            />
          ))}
          
          <Button type="dashed" onClick={handleAddEntry} style={{ width: '100%', marginBottom: 16 }}>
            添加分录
          </Button>
          
          <Row gutter={16}>
            <Col span={12}>
              <Card title="借方合计" style={{ textAlign: 'center' }}>
                <h2 style={{ color: '#1890ff' }}>
                  {entries.reduce((sum, entry) => entry.direction === '借方' ? sum + entry.amount : sum, 0).toFixed(2)} 元
                </h2>
              </Card>
            </Col>
            <Col span={12}>
              <Card title="贷方合计" style={{ textAlign: 'center' }}>
                <h2 style={{ color: '#f5222d' }}>
                  {entries.reduce((sum, entry) => entry.direction === '贷方' ? sum + entry.amount : sum, 0).toFixed(2)} 元
                </h2>
              </Card>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  )
}

export default Transactions
