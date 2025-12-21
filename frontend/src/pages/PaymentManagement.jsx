import React, { useEffect, useState } from 'react'
import { Table, Card, Spin, message, Button, Modal, Form, Select, Space, Checkbox, Tag, Statistic } from 'antd'
import { PlusOutlined, PayCircleOutlined, InfoCircleOutlined } from '@ant-design/icons'
import { getAwaitingPaymentBills, executePayment, getBankAccounts } from '../services/api'

const { Option } = Select

const PaymentManagement = () => {
  const [bills, setBills] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedBills, setSelectedBills] = useState([])
  const [bankAccounts, setBankAccounts] = useState([])
  const [paymentModalVisible, setPaymentModalVisible] = useState(false)
  const [form] = Form.useForm()
  const [processingPayment, setProcessingPayment] = useState(false)

  // 获取待付款账单
  const fetchBills = async () => {
    try {
      setLoading(true)
      const data = await getAwaitingPaymentBills()
      setBills(data)
    } catch (error) {
      message.error('获取待付款账单失败')
    } finally {
      setLoading(false)
    }
  }

  // 获取银行账户列表
  const fetchBankAccounts = async () => {
    try {
      const data = await getBankAccounts()
      setBankAccounts(data)
    } catch (error) {
      message.error('获取银行账户失败')
    }
  }

  useEffect(() => {
    fetchBills()
    fetchBankAccounts()
  }, [])

  // 处理记录选择
  const handleBillSelect = (record) => {
    const index = selectedBills.findIndex(bill => bill.id === record.id && bill.type === record.type)
    if (index === -1) {
      setSelectedBills([...selectedBills, record])
    } else {
      setSelectedBills(selectedBills.filter(bill => !(bill.id === record.id && bill.type === record.type)))
    }
  }

  // 处理全选
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedBills([...bills])
    } else {
      setSelectedBills([])
    }
  }

  // 打开付款模态框
  const openPaymentModal = () => {
    if (selectedBills.length === 0) {
      message.warning('请先选择要支付的账单')
      return
    }
    form.resetFields()
    setPaymentModalVisible(true)
  }

  // 关闭付款模态框
  const handleCancel = () => {
    setPaymentModalVisible(false)
  }

  // 提交付款
  const handlePaymentSubmit = async () => {
    try {
      const values = await form.validateFields()
      setProcessingPayment(true)

      // 按类型分类待付款记录
      const billIds = selectedBills.filter(item => item.type === 'bill').map(item => item.id)
      const taxIds = selectedBills.filter(item => item.type === 'tax').map(item => item.id)
      const purchaseOrderIds = selectedBills.filter(item => item.type === 'purchase_order').map(item => item.id)
      
      const result = await executePayment({
        bill_ids: billIds,
        tax_ids: taxIds,
        purchase_order_ids: purchaseOrderIds,
        payment_method: values.payment_method,
        bank_account_id: values.bank_account_id
      })

      message.success('付款成功')
      setPaymentModalVisible(false)
      setSelectedBills([])
      fetchBills() // 刷新记录列表
    } catch (error) {
      message.error('付款失败：' + (error.response?.data?.message || error.message))
    } finally {
      setProcessingPayment(false)
    }
  }

  // 计算总金额
  const totalAmount = selectedBills.reduce((sum, bill) => {
    let amount = 0;
    switch(bill.type) {
      case 'bill':
        amount = bill.amount || 0;
        break;
      case 'tax':
        amount = bill.tax_payable || 0;
        break;
      case 'purchase_order':
        amount = bill.amount || 0;
        break;
      default:
        amount = 0;
    }
    return sum + amount;
  }, 0)

  // 待付款记录表格列配置
  const columns = [
    {
      title: (
        <Checkbox
          checked={selectedBills.length === bills.length && bills.length > 0}
          onChange={(e) => handleSelectAll(e.target.checked)}
        />
      ),
      key: 'select',
      render: (_, record) => (
        <Checkbox
          checked={selectedBills.some(bill => bill.id === record.id && bill.type === record.type)}
          onChange={() => handleBillSelect(record)}
        />
      )
    },
    {
      title: '记录类型',
      key: 'type',
      render: (_, record) => {
        let typeLabel = '';
        let typeColor = '';
        
        switch(record.type) {
          case 'bill':
            typeLabel = '账单';
            typeColor = 'blue';
            break;
          case 'tax':
            typeLabel = '税务申报';
            typeColor = 'green';
            break;
          case 'purchase_order':
            typeLabel = '采购订单';
            typeColor = 'purple';
            break;
          default:
            typeLabel = '其他';
            typeColor = 'gray';
        }
        
        return <Tag color={typeColor}>{typeLabel}</Tag>;
      }
    },
    {
      title: '编号',
      key: 'number',
      render: (_, record) => {
        switch(record.type) {
          case 'bill':
            return record.bill_no;
          case 'tax':
            return `${record.tax_type}（${record.period}）`;
          case 'purchase_order':
            return record.order_number;
          default:
            return '-';
        }
      }
    },
    {
      title: '供应商',
      dataIndex: 'vendor_name',
      key: 'vendor_name'
    },
    {
      title: '到期日期',
      dataIndex: 'due_date',
      key: 'due_date',
      render: (date) => date ? new Date(date).toLocaleDateString() : '-'
    },
    {
      title: '金额',
      key: 'amount',
      render: (_, record) => {
        let amount = 0;
        switch(record.type) {
          case 'bill':
            amount = record.amount || 0;
            break;
          case 'tax':
            amount = record.tax_payable || 0;
            break;
          case 'purchase_order':
            amount = record.amount || 0;
            break;
          default:
            amount = 0;
        }
        return `${amount.toFixed(2)} 元`;
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => {
        let color = 'orange';
        if (record.type === 'tax' && status === 'success') {
          color = 'green';
        } else if (record.type === 'purchase_order' && status === 'approved') {
          color = 'blue';
        }
        return <Tag color={color}>{status}</Tag>;
      }
    }
  ]

  return (
    <div>
      <h1>付款管理</h1>
      
      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <Button 
              type="primary" 
              icon={<PayCircleOutlined />} 
              onClick={openPaymentModal}
              disabled={selectedBills.length === 0}
            >
              执行付款
            </Button>
            <Statistic 
              title="已选择金额" 
              value={totalAmount} 
              precision={2}
              suffix=" 元"
            />
          </Space>
        </div>
        
        <Spin spinning={loading}>
          <Table
            dataSource={bills}
            columns={columns}
            rowKey={(record) => `${record.type}-${record.id}`}
            pagination={{ pageSize: 20 }}
          />
        </Spin>
      </Card>
      
      {/* 付款模态框 */}
      <Modal
        title="执行付款"
        open={paymentModalVisible}
        onOk={handlePaymentSubmit}
        onCancel={handleCancel}
        width={600}
        confirmLoading={processingPayment}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="payment_method"
            label="付款方式"
            rules={[{ required: true, message: '请选择付款方式' }]}
          >
            <Select placeholder="请选择付款方式">
              <Option value="银企直连">银企直连</Option>
              <Option value="银行转账">银行转账</Option>
              <Option value="现金">现金</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="bank_account_id"
            label="付款银行账户"
            rules={[{ required: true, message: '请选择付款银行账户' }]}
          >
            <Select placeholder="请选择付款银行账户">
              {bankAccounts.map(account => (
                <Option key={account.id} value={account.id}>
                  {account.name} ({account.code}) - 余额: {account.balance.toFixed(2)} 元
                </Option>
              ))}
            </Select>
          </Form.Item>
          
          <Card title="付款汇总信息" size="small" style={{ marginTop: 16 }}>
            <div style={{ marginBottom: 8 }}>
              <strong>待支付账单数量：</strong>{selectedBills.length} 张
            </div>
            <div style={{ marginBottom: 8 }}>
              <strong>总金额：</strong>{totalAmount.toFixed(2)} 元
            </div>
            <div>
              <strong>收款方：</strong>
              {selectedBills.map((bill, index) => (
                <span key={bill.id}>
                  {bill.vendor_name}{index < selectedBills.length - 1 ? '、' : ''}
                </span>
              ))}
            </div>
          </Card>
        </Form>
      </Modal>
    </div>
  )
}

export default PaymentManagement