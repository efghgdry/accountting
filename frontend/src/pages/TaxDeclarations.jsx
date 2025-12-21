import React, { useEffect, useState } from 'react'
import { Table, Card, Spin, message, Button, Modal, Form, Input, Select, DatePicker, Space, Divider } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, CheckOutlined, CloseOutlined, FileTextOutlined, SendOutlined } from '@ant-design/icons'
import { getTaxDeclarations, createTaxDeclaration, updateTaxDeclaration, deleteTaxDeclaration, submitTaxDeclaration } from '../services/api'
import dayjs from 'dayjs'

const { Option } = Select

const TaxDeclarations = () => {
  const [declarations, setDeclarations] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalVisible, setModalVisible] = useState(false)
  const [form] = Form.useForm()
  const [isEditMode, setIsEditMode] = useState(false)
  const [currentDeclaration, setCurrentDeclaration] = useState(null)

  // 税种选项
  const taxTypes = [
    { value: '增值税', label: '增值税' },
    { value: '企业所得税', label: '企业所得税' },
    { value: '附加税', label: '附加税' },
    { value: '个人所得税', label: '个人所得税' }
  ]

  // 申报状态映射
  const statusMap = {
    pending: <span style={{ color: '#faad14' }}>待申报</span>,
    submitted: <span style={{ color: '#1890ff' }}>已提交</span>,
    success: <span style={{ color: '#52c41a' }}>已申报</span>,
    failed: <span style={{ color: '#f5222d' }}>申报失败</span>
  }

  // 获取税务申报列表
  const fetchDeclarations = async () => {
    try {
      setLoading(true)
      const data = await getTaxDeclarations()
      setDeclarations(data)
    } catch (error) {
      message.error('获取税务申报列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDeclarations()
  }, [])

  // 显示新增/编辑模态框
  const showModal = (declaration = null) => {
    if (declaration) {
      setIsEditMode(true)
      setCurrentDeclaration(declaration)
      form.setFieldsValue({
        period: dayjs(declaration.period),
        tax_type: declaration.tax_type,
        taxable_income: declaration.taxable_income,
        tax_rate: declaration.tax_rate || 0,
        tax_payable: declaration.tax_payable
      })
    } else {
      setIsEditMode(false)
      setCurrentDeclaration(null)
      form.resetFields()
    }
    setModalVisible(true)
  }

  // 关闭模态框
  const handleCancel = () => {
    setModalVisible(false)
    form.resetFields()
  }

  // 自动计算应纳税额
  const calculateTaxPayable = () => {
    try {
      const values = form.getFieldsValue()
      const taxableIncome = parseFloat(values.taxable_income || 0)
      const taxRate = parseFloat(values.tax_rate || 0)
      const taxPayable = taxableIncome * (taxRate / 100)
      form.setFieldsValue({ tax_payable: taxPayable })
    } catch (error) {
      console.error('计算应纳税额时出错:', error)
    }
  }

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      
      // 确保应纳税额是计算好的
      calculateTaxPayable()
      
      // 处理日期格式，转换为字符串
      const submissionValues = {
        ...values,
        period: values.period.format('YYYY-MM')
      }
      
      if (isEditMode && currentDeclaration) {
        // 更新税务申报
        await updateTaxDeclaration(currentDeclaration.id, submissionValues)
        message.success('税务申报更新成功')
      } else {
        // 新增税务申报
        await createTaxDeclaration(submissionValues)
        message.success('税务申报新增成功')
      }
      
      // 刷新税务申报列表
      fetchDeclarations()
      setModalVisible(false)
      form.resetFields()
    } catch (error) {
      message.error('操作失败：' + error.message)
    }
  }

  // 删除税务申报
  const handleDelete = async (id) => {
    try {
      await deleteTaxDeclaration(id)
      message.success('税务申报删除成功')
      fetchDeclarations()
    } catch (error) {
      message.error('删除失败：' + error.message)
    }
  }

  // 提交申报
  const handleSubmitDeclaration = async (id) => {
    try {
      const result = await submitTaxDeclaration(id)
      message.success('税务申报成功')
      fetchDeclarations()
    } catch (error) {
      message.error('税务申报失败：' + error.message)
    }
  }

  // 表格列配置
  const columns = [
    {
      title: '申报所属期',
      dataIndex: 'period',
      key: 'period'
    },
    {
      title: '税种',
      dataIndex: 'tax_type',
      key: 'tax_type'
    },
    {
      title: '应纳税额',
      dataIndex: 'tax_payable',
      key: 'tax_payable',
      render: (tax_payable) => `${tax_payable.toFixed(2)} 元`
    },
    {
      title: '申报状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => statusMap[status] || status
    },
    {
      title: '申报时间',
      dataIndex: 'declaration_time',
      key: 'declaration_time',
      render: (time) => time ? new Date(time).toLocaleString() : '-'
    },
    {
      title: '税务回执号',
      dataIndex: 'receipt_number',
      key: 'receipt_number',
      render: (receipt) => receipt || '-'
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" icon={<EditOutlined />} onClick={() => showModal(record)} disabled={record.status !== 'pending'}>
            编辑
          </Button>
          {record.status === 'pending' && (
            <Button type="primary" icon={<SendOutlined />} onClick={() => handleSubmitDeclaration(record.id)}>
              申报
            </Button>
          )}
          <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} disabled={record.status === 'success'}>
            删除
          </Button>
        </Space>
      )
    }
  ]

  return (
    <div>
      <h1>税务申报</h1>
      <Card>
        <div style={{ marginBottom: 16, textAlign: 'right' }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
            新增申报
          </Button>
        </div>
        <Spin spinning={loading}>
          <Table
            dataSource={declarations}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 20 }}
          />
        </Spin>
        
        {/* 新增/编辑模态框 */}
        <Modal
          title={isEditMode ? '编辑税务申报' : '新增税务申报'}
          open={modalVisible}
          onOk={handleSubmit}
          onCancel={handleCancel}
          width={800}
          footer={[
            <Button key="back" onClick={handleCancel}>
              取消
            </Button>,
            <Button key="submit" type="primary" onClick={handleSubmit}>
              {isEditMode ? '更新' : '保存'}
            </Button>
          ]}
        >
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              taxable_income: 0.0,
              tax_rate: 0.0,
              tax_payable: 0.0
            }}
          >
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <Form.Item
                  name="period"
                  label="申报所属期"
                  rules={[{ required: true, message: '请选择申报所属期' }]}
                  style={{ flex: 1, minWidth: 200 }}
                >
                  <DatePicker
                    picker="month"
                    placeholder="选择申报所属期"
                    format="YYYY-MM"
                  />
                </Form.Item>

                <Form.Item
                  name="tax_type"
                  label="税种"
                  rules={[{ required: true, message: '请选择税种' }]}
                  style={{ flex: 1, minWidth: 200 }}
                >
                  <Select placeholder="请选择税种">
                    {taxTypes.map(type => (
                      <Option key={type.value} value={type.value}>{type.label}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>

              <Divider orientation="left">申报数据</Divider>

              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <Form.Item
                  name="taxable_income"
                  label="应税收入"
                  rules={[{ required: true, message: '请输入应税收入' }]}
                  style={{ flex: 1, minWidth: 200 }}
                >
                  <Input
                    type="number"
                    placeholder="请输入应税收入"
                    addonAfter="元"
                    onChange={() => calculateTaxPayable()}
                  />
                </Form.Item>

                <Form.Item
                  name="tax_rate"
                  label="税率(%)"
                  rules={[{ required: true, message: '请输入税率' }]}
                  style={{ flex: 1, minWidth: 200 }}
                >
                  <Input
                    type="number"
                    placeholder="请输入税率"
                    addonAfter="%"
                    onChange={() => calculateTaxPayable()}
                  />
                </Form.Item>

                <Form.Item
                  name="tax_payable"
                  label="应纳税额"
                  rules={[{ required: true, message: '应纳税额将自动计算' }]}
                  style={{ flex: 1, minWidth: 200 }}
                >
                  <Input type="number" placeholder="应纳税额将自动计算" addonAfter="元" disabled />
                </Form.Item>
              </div>
            </Space>
          </Form>
        </Modal>
      </Card>
    </div>
  )
}

export default TaxDeclarations
