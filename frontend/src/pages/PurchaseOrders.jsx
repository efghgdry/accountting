import React, { useEffect, useState } from 'react'
import { Table, Card, Spin, message, Button, Modal, Form, Input, Select, Space, InputNumber } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons'
import { getPurchaseOrders, createPurchaseOrder, updatePurchaseOrder, deletePurchaseOrder, getVendors, getAccounts } from '../services/api'

const { Option } = Select

const PurchaseOrders = () => {
  const [purchaseOrders, setPurchaseOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [form] = Form.useForm()
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [currentOrder, setCurrentOrder] = useState(null)
  const [vendors, setVendors] = useState([])
  const [accounts, setAccounts] = useState([])
  const [orderItems, setOrderItems] = useState([])
  const [isItemsModalVisible, setIsItemsModalVisible] = useState(false)

  // 获取采购订单列表
  const fetchPurchaseOrders = async () => {
    try {
      setLoading(true)
      const data = await getPurchaseOrders()
      setPurchaseOrders(data)
    } catch (error) {
      message.error('获取采购订单列表失败')
    } finally {
      setLoading(false)
    }
  }

  // 获取供应商列表
  const fetchVendors = async () => {
    try {
      const data = await getVendors()
      setVendors(data)
    } catch (error) {
      message.error('获取供应商列表失败')
    }
  }

  // 获取科目列表
  const fetchAccounts = async () => {
    try {
      const data = await getAccounts()
      setAccounts(data)
    } catch (error) {
      message.error('获取科目列表失败')
    }
  }

  useEffect(() => {
    fetchPurchaseOrders()
    fetchVendors()
    fetchAccounts()
  }, [])

  // 显示新增/编辑模态框
  const showModal = (order = null) => {
    if (order) {
      setIsEditMode(true)
      setCurrentOrder(order)
      setOrderItems(order.items || [])
      form.setFieldsValue({
        vendor_id: order.vendor_id,
        description: order.description,
        order_date: order.order_date
      })
    } else {
      setIsEditMode(false)
      setCurrentOrder(null)
      setOrderItems([])
      form.resetFields()
    }
    setIsModalVisible(true)
  }

  // 关闭模态框
  const handleCancel = () => {
    setIsModalVisible(false)
    form.resetFields()
    setOrderItems([])
  }

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      
      const orderData = {
        ...values,
        items: orderItems
      }
      
      if (isEditMode && currentOrder) {
        // 更新采购订单
        await updatePurchaseOrder(currentOrder.id, orderData)
        message.success('采购订单更新成功')
      } else {
        // 新增采购订单
        await createPurchaseOrder(orderData)
        message.success('采购订单新增成功')
      }
      
      // 刷新采购订单列表
      fetchPurchaseOrders()
      setIsModalVisible(false)
      form.resetFields()
      setOrderItems([])
    } catch (error) {
      message.error('操作失败：' + error.message)
    }
  }

  // 删除采购订单
  const handleDelete = async (id) => {
    try {
      await deletePurchaseOrder(id)
      message.success('采购订单删除成功')
      fetchPurchaseOrders()
    } catch (error) {
      message.error('删除失败：' + error.message)
    }
  }

  // 更新订单状态
  const handleUpdateStatus = async (id, status) => {
    try {
      const purchaseOrder = purchaseOrders.find(order => order.id === id)
      if (!purchaseOrder) {
        message.error('采购订单不存在')
        return
      }
      
      await updatePurchaseOrder(id, { status })
      message.success(`采购订单已${status === 'approved' ? '批准' : status === 'completed' ? '完成' : '取消'}`)
      fetchPurchaseOrders()
    } catch (error) {
      message.error('状态更新失败：' + error.message)
    }
  }

  // 显示订单项编辑模态框
  const showItemsModal = () => {
    setIsItemsModalVisible(true)
  }

  // 关闭订单项编辑模态框
  const handleItemsCancel = () => {
    setIsItemsModalVisible(false)
  }

  // 添加订单项
  const addOrderItem = () => {
    setOrderItems([...orderItems, { product_name: '', quantity: 1, unit_price: 0, account_id: null, description: '' }])
  }

  // 更新订单项
  const updateOrderItem = (index, field, value) => {
    const newItems = [...orderItems]
    newItems[index][field] = value
    setOrderItems(newItems)
  }

  // 删除订单项
  const deleteOrderItem = (index) => {
    const newItems = [...orderItems]
    newItems.splice(index, 1)
    setOrderItems(newItems)
  }

  // 保存订单项
  const saveOrderItems = () => {
    setIsItemsModalVisible(false)
  }

  // 计算订单总金额
  const calculateTotalAmount = () => {
    return orderItems.reduce((total, item) => {
      return total + (item.quantity * item.unit_price)
    }, 0)
  }

  // 表格列配置
  const columns = [
    {
      title: '订单编号',
      dataIndex: 'order_number',
      key: 'order_number'
    },
    {
      title: '供应商',
      dataIndex: 'vendor',
      key: 'vendor',
      render: (vendor) => vendor ? vendor.name : '-'
    },
    {
      title: '订单日期',
      dataIndex: 'order_date',
      key: 'order_date'
    },
    {
      title: '总金额',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (_, record) => {
        const total = (record.items || []).reduce((sum, item) => sum + (item.quantity * item.unit_price), 0)
        return `${total.toFixed(2)} 元`
      }
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusMap = {
          'pending': <span style={{ color: '#faad14' }}>待处理</span>,
          'approved': <span style={{ color: '#52c41a' }}>已批准</span>,
          'completed': <span style={{ color: '#1890ff' }}>已完成</span>,
          'cancelled': <span style={{ color: '#f5222d' }}>已取消</span>
        }
        return statusMap[status] || status
      }
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
            <>
              <Button type="primary" size="small" onClick={() => handleUpdateStatus(record.id, 'approved')}>
                批准
              </Button>
              <Button type="danger" size="small" onClick={() => handleUpdateStatus(record.id, 'cancelled')}>
                取消
              </Button>
            </>
          )}
          {record.status === 'approved' && (
            <>
              <Button type="success" size="small" onClick={() => handleUpdateStatus(record.id, 'completed')}>
                完成
              </Button>
              <Button type="danger" size="small" onClick={() => handleUpdateStatus(record.id, 'cancelled')}>
                取消
              </Button>
            </>
          )}
          <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} disabled={record.status === 'completed'}>
            删除
          </Button>
        </Space>
      )
    }
  ]

  return (
    <div>
      <h1>采购清单管理</h1>
      <Card>
        <div style={{ marginBottom: 16, textAlign: 'right' }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
            新增采购订单
          </Button>
        </div>
        <Spin spinning={loading}>
          <Table
            dataSource={purchaseOrders}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 20 }}
          />
        </Spin>

        {/* 新增/编辑采购订单模态框 */}
        <Modal
          title={isEditMode ? '编辑采购订单' : '新增采购订单'}
          visible={isModalVisible}
          onOk={handleSubmit}
          onCancel={handleCancel}
          destroyOnClose
          width={800}
          footer={[
            <Button key="back" onClick={handleCancel}>
              取消
            </Button>,
            <Button key="items" type="default" onClick={showItemsModal}>
              编辑订单项
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
              status: 'pending'
            }}
          >
            <Form.Item
              name="vendor_id"
              label="供应商"
              rules={[{ required: true, message: '请选择供应商' }]}
            >
              <Select placeholder="请选择供应商">
                {vendors.map(vendor => (
                  <Option key={vendor.id} value={vendor.id}>{vendor.name}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="order_date"
              label="订单日期"
              rules={[{ required: true, message: '请选择订单日期' }]}
            >
              <Input type="date" />
            </Form.Item>

            <Form.Item
              name="description"
              label="描述"
            >
              <Input.TextArea placeholder="请输入订单描述" rows={3} />
            </Form.Item>

            <Form.Item label="订单项">
              <div style={{ border: '1px dashed #d9d9d9', padding: 16, borderRadius: 4 }}>
                {orderItems.length > 0 ? (
                  <div>
                    {orderItems.map((item, index) => (
                      <div key={index} style={{ marginBottom: 16, padding: 12, background: '#fafafa', borderRadius: 4 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                          <span>商品 {index + 1}</span>
                          <Button 
                            type="text" 
                            danger 
                            icon={<DeleteOutlined />} 
                            onClick={() => deleteOrderItem(index)}
                          >
                            删除
                          </Button>
                        </div>
                        <div style={{ fontSize: 12, color: '#999', marginBottom: 8 }}>
                          金额: {item.quantity * item.unit_price} 元
                        </div>
                      </div>
                    ))}
                    <div style={{ textAlign: 'right', padding: 12, background: '#fff', borderRadius: 4, border: '1px solid #d9d9d9' }}>
                      <span style={{ fontSize: 16, fontWeight: 'bold' }}>总金额: {calculateTotalAmount().toFixed(2)} 元</span>
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', color: '#999', padding: 20 }}>
                    暂无订单项，点击"编辑订单项"按钮添加
                  </div>
                )}
              </div>
            </Form.Item>
          </Form>
        </Modal>

        {/* 编辑订单项模态框 */}
        <Modal
          title="编辑订单项"
          visible={isItemsModalVisible}
          onOk={saveOrderItems}
          onCancel={handleItemsCancel}
          destroyOnClose
          width={900}
          footer={[
            <Button key="back" onClick={handleItemsCancel}>
              取消
            </Button>,
            <Button key="add" type="default" onClick={addOrderItem} icon={<PlusOutlined />}>
              添加商品
            </Button>,
            <Button key="submit" type="primary" onClick={saveOrderItems}>
              保存
            </Button>
          ]}
        >
          <div style={{ maxHeight: 500, overflowY: 'auto' }}>
            {orderItems.map((item, index) => (
              <Card key={index} style={{ marginBottom: 16 }}>
                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                  <Form layout="inline">
                    <Form.Item label="商品名称" style={{ width: 200 }}>
                      <Input 
                        value={item.product_name} 
                        onChange={(e) => updateOrderItem(index, 'product_name', e.target.value)}
                        placeholder="请输入商品名称"
                      />
                    </Form.Item>
                    <Form.Item label="数量" style={{ width: 120 }}>
                      <InputNumber 
                        value={item.quantity} 
                        onChange={(value) => updateOrderItem(index, 'quantity', value)}
                        min={1}
                      />
                    </Form.Item>
                    <Form.Item label="单价" style={{ width: 150 }}>
                      <InputNumber 
                        value={item.unit_price} 
                        onChange={(value) => updateOrderItem(index, 'unit_price', value)}
                        min={0}
                        step={0.01}
                      />
                    </Form.Item>
                    <Form.Item label="支出科目" style={{ width: 200 }}>
                      <Select 
                        value={item.account_id} 
                        onChange={(value) => updateOrderItem(index, 'account_id', value)}
                        placeholder="请选择支出科目"
                      >
                        {accounts.map(account => (
                          <Option key={account.id} value={account.id}>{account.name} ({account.code})</Option>
                        ))}
                      </Select>
                    </Form.Item>
                    <Form.Item label="操作">
                      <Button 
                        type="text" 
                        danger 
                        icon={<DeleteOutlined />} 
                        onClick={() => deleteOrderItem(index)}
                      >
                        删除
                      </Button>
                    </Form.Item>
                  </Form>
                  <Form layout="vertical">
                    <Form.Item label="描述">
                      <Input.TextArea 
                        value={item.description} 
                        onChange={(e) => updateOrderItem(index, 'description', e.target.value)}
                        placeholder="请输入商品描述"
                        rows={2}
                      />
                    </Form.Item>
                  </Form>
                </Space>
              </Card>
            ))}
            {orderItems.length === 0 && (
              <div style={{ textAlign: 'center', color: '#999', padding: 40 }}>
                暂无订单项，点击"添加商品"按钮开始添加
              </div>
            )}
          </div>
        </Modal>
      </Card>
    </div>
  )
}

export default PurchaseOrders
