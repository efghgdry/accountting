import React, { useEffect, useState } from 'react'
import { Table, Button, Modal, Form, Input, message, Card, Row, Col, Space } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons'
import { getVendors, createVendor, updateVendor, deleteVendor } from '../services/api'

const Vendors = () => {
  const [vendors, setVendors] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingVendor, setEditingVendor] = useState(null)
  const [form] = Form.useForm()

  const fetchVendors = async () => {
    try {
      setLoading(true)
      const data = await getVendors()
      setVendors(data)
    } catch (error) {
      message.error('获取供应商列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVendors()
  }, [])

  const handleAdd = () => {
    setEditingVendor(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (record) => {
    setEditingVendor(record)
    form.setFieldsValue(record)
    setModalVisible(true)
  }

  const handleDelete = async (id) => {
    try {
      await deleteVendor(id)
      message.success('供应商删除成功')
      fetchVendors()
    } catch (error) {
      message.error('供应商删除失败')
    }
  }

  const handleSave = async (values) => {
    try {
      if (editingVendor) {
        await updateVendor(editingVendor.id, values)
        message.success('供应商更新成功')
      } else {
        await createVendor(values)
        message.success('供应商创建成功')
      }
      setModalVisible(false)
      fetchVendors()
    } catch (error) {
      message.error(editingVendor ? '供应商更新失败' : '供应商创建失败')
    }
  }

  const columns = [
    {
      title: '供应商名称',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <Space>
          <UserOutlined />
          <span>{name}</span>
        </Space>
      )
    },
    {
      title: '联系人',
      dataIndex: 'contact',
      key: 'contact'
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: '电话',
      dataIndex: 'phone',
      key: 'phone'
    },
    {
      title: '地址',
      dataIndex: 'address',
      key: 'address',
      ellipsis: true
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="primary" icon={<EditOutlined />} size="small" onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button danger icon={<DeleteOutlined />} size="small" onClick={() => handleDelete(record.id)}>
            删除
          </Button>
        </Space>
      )
    }
  ]

  return (
    <div>
      <h1>供应商管理</h1>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={24}>
          <Card>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} style={{ float: 'right' }}>
              新增供应商
            </Button>
          </Card>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={24}>
          <Card>
            <Table
              dataSource={vendors}
              columns={columns}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </Col>
      </Row>
      <Modal
        title={editingVendor ? '编辑供应商' : '新增供应商'}
        open={modalVisible}
        onOk={form.submit}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
        >
          <Form.Item
            name="name"
            label="供应商名称"
            rules={[{ required: true, message: '请输入供应商名称' }]}
          >
            <Input placeholder="请输入供应商名称" />
          </Form.Item>
          <Form.Item
            name="contact"
            label="联系人"
          >
            <Input placeholder="请输入联系人" />
          </Form.Item>
          <Form.Item
            name="email"
            label="邮箱"
            rules={[{ type: 'email', message: '请输入有效的邮箱地址' }]}
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>
          <Form.Item
            name="phone"
            label="电话"
          >
            <Input placeholder="请输入电话" />
          </Form.Item>
          <Form.Item
            name="address"
            label="地址"
          >
            <Input.TextArea placeholder="请输入地址" rows={3} />
          </Form.Item>
          <Form.Item
            name="description"
            label="描述"
          >
            <Input.TextArea placeholder="请输入描述" rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Vendors