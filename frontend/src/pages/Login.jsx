import React, { useState } from 'react'
import { Form, Input, Button, message } from 'antd'
import { UserOutlined, LockOutlined, UserAddOutlined, DollarOutlined } from '@ant-design/icons'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../services/api'

const Login = () => {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (values) => {
    try {
      setLoading(true)
      const result = await login(values)
      message.success(result.message)
      localStorage.setItem('user', JSON.stringify(result.user))
      navigate('/')
    } catch (error) {
      message.error(error.response?.data?.message || '登录失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-form">
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <DollarOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 12 }} />
          <h2>会计系统</h2>
          <p style={{ color: '#666', fontSize: 14, marginTop: 8 }}>专业的财务管理解决方案</p>
        </div>
        
        <Form
          name="login"
          onFinish={handleLogin}
          initialValues={{ remember: true }}
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
          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading} 
              block 
              size="large"
              style={{ marginBottom: 16 }}
            >
              登录
            </Button>
            <div style={{ textAlign: 'center', fontSize: 14, color: '#666' }}>
              还没有账号？ 
              <Link to="/register" style={{ color: '#1890ff', textDecoration: 'none' }}>
                立即注册
              </Link>
            </div>
          </Form.Item>
        </Form>
      </div>
    </div>
  )
}

export default Login