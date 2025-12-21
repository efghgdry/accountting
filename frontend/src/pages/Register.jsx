import React, { useState } from 'react'
import { Form, Input, Button, message } from 'antd'
import { UserOutlined, LockOutlined, MailOutlined, UserAddOutlined, DollarOutlined } from '@ant-design/icons'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '../services/api'

const Register = () => {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleRegister = async (values) => {
    try {
      setLoading(true)
      const result = await register(values)
      message.success(result.message)
      localStorage.setItem('user', JSON.stringify(result.user))
      navigate('/')
    } catch (error) {
      message.error(error.response?.data?.message || '注册失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="register-container">
      <div className="register-form">
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <DollarOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 12 }} />
          <h2>会计系统</h2>
          <p style={{ color: '#666', fontSize: 14, marginTop: 8 }}>专业的财务管理解决方案</p>
        </div>
        
        <Form
          name="register"
          onFinish={handleRegister}
          layout="vertical"
        >
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名!' }]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="请输入用户名" 
              size="large"
            />
          </Form.Item>
          <Form.Item
            name="email"
            label="邮箱"
            rules={[{ required: true, type: 'email', message: '请输入有效的邮箱!' }]}
          >
            <Input 
              prefix={<MailOutlined />} 
              placeholder="请输入有效的邮箱" 
              size="large"
            />
          </Form.Item>
          <Form.Item
            name="password"
            label="密码"
            rules={[{ required: true, message: '请输入密码!' }]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="请输入密码" 
              size="large"
            />
          </Form.Item>
          <Form.Item
            name="full_name"
            label="姓名"
            rules={[{ required: true, message: '请输入姓名!' }]}
          >
            <Input 
              prefix={<UserAddOutlined />} 
              placeholder="请输入姓名" 
              size="large"
            />
          </Form.Item>
          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading} 
              block 
              size="large"
              style={{ marginBottom: 16 }}
            >
              注册
            </Button>
            <div style={{ textAlign: 'center', fontSize: 14, color: '#666' }}>
              已有账号？ 
              <Link to="/login" style={{ color: '#1890ff', textDecoration: 'none' }}>
                立即登录
              </Link>
            </div>
          </Form.Item>
        </Form>
      </div>
    </div>
  )
}

export default Register