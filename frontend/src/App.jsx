import React, { useState, useEffect } from 'react'
import { Layout, Menu, Button, message, Avatar, Breadcrumb } from 'antd'
import { Link, Route, Routes, Navigate, useNavigate, useLocation } from 'react-router-dom'
import {
  HomeOutlined, 
  AccountBookOutlined, 
  TagsOutlined, 
  SwapOutlined, 
  PieChartOutlined, 
  FileTextOutlined, 
  LogoutOutlined, 
  UserOutlined, 
  DollarOutlined,
  ReconciliationOutlined,
  PayCircleOutlined
} from '@ant-design/icons'
import Dashboard from './pages/Dashboard.jsx'
import Accounts from './pages/Accounts.jsx'
import Transactions from './pages/Transactions.jsx'
import Reports from './pages/Reports.jsx'
import Vendors from './pages/Vendors.jsx'
import BankReconciliation from './pages/BankReconciliation.jsx'
import PurchaseOrders from './pages/PurchaseOrders.jsx'
import TaxDeclarations from './pages/TaxDeclarations.jsx'
import PaymentManagement from './pages/PaymentManagement.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import { getCurrentUser, logout } from './services/api'

const { Header, Content, Sider } = Layout

// 面包屑组件
const PageBreadcrumb = () => {
  const location = useLocation()
  const pathname = location.pathname
  
  const breadcrumbItems = [
    { name: '仪表盘', path: '/', icon: <HomeOutlined /> },
    { name: '科目管理', path: '/accounts', icon: <AccountBookOutlined /> },
    { name: '凭证管理', path: '/transactions', icon: <SwapOutlined /> },
    { name: '供应商管理', path: '/vendors', icon: <UserOutlined /> },
    { name: '采购清单', path: '/purchase-orders', icon: <TagsOutlined /> },
    { name: '税务申报', path: '/tax-declarations', icon: <FileTextOutlined /> },
    { name: '付款管理', path: '/payment-management', icon: <PayCircleOutlined /> },
    { name: '银行对账', path: '/bank-reconciliation', icon: <ReconciliationOutlined /> },
    { name: '报表管理', path: '/reports', icon: <FileTextOutlined /> },
  ]
  
  const currentPath = breadcrumbItems.find(item => item.path === pathname)
  
  return (
    <Breadcrumb>
      <Breadcrumb.Item href="/">
        <HomeOutlined />
        <span>首页</span>
      </Breadcrumb.Item>
      {currentPath && pathname !== '/' && (
        <Breadcrumb.Item>
          {currentPath.icon}
          <span>{currentPath.name}</span>
        </Breadcrumb.Item>
      )}
    </Breadcrumb>
  )
}

// 私有路由组件，用于保护需要登录才能访问的路由
const PrivateRoute = ({ element }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 检查用户是否已登录
    const checkAuth = async () => {
      try {
        const user = localStorage.getItem('user')
        if (user) {
          // 如果本地有用户信息，验证其有效性
          try {
            const result = await getCurrentUser()
            localStorage.setItem('user', JSON.stringify(result))
            setIsAuthenticated(true)
          } catch (error) {
            // 本地用户信息无效，清除并重定向
            localStorage.removeItem('user')
            setIsAuthenticated(false)
          }
        } else {
          // 本地没有用户信息，直接重定向到登录页
          setIsAuthenticated(false)
        }
      } catch (error) {
        setIsAuthenticated(false)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  if (loading) {
    return <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      fontSize: '16px',
      color: '#666'
    }}>加载中...</div>
  }

  return isAuthenticated ? element : <Navigate to="/login" replace />  
}

// 主应用布局组件
const MainLayout = () => {
  const navigate = useNavigate()
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    // 获取当前用户信息
    const user = localStorage.getItem('user')
    if (user) {
      setCurrentUser(JSON.parse(user))
    }
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
      localStorage.removeItem('user')
      navigate('/login')
      message.success('退出登录成功')
    } catch (error) {
      message.error('退出登录失败')
    }
  }

  return (
    <Layout>
      <Sider width={220} style={{ background: '#fff', boxShadow: '2px 0 8px rgba(0, 0, 0, 0.05)' }}>
        {/* 品牌标识 */}
        <div className="brand-logo">
          <DollarOutlined />
          <span>会计系统</span>
        </div>
        <Menu
          mode="inline"
          defaultSelectedKeys={['1']}
          style={{ height: '100%', borderRight: 0 }}
          selectedKeys={[window.location.pathname === '/' ? '1' : 
                       window.location.pathname === '/accounts' ? '2' : 
                       window.location.pathname === '/transactions' ? '4' : 
                       window.location.pathname === '/vendors' ? '6' : 
                       window.location.pathname === '/purchase-orders' ? '9' :
                       window.location.pathname === '/tax-declarations' ? '10' :
                       window.location.pathname === '/payment-management' ? '11' :
                       window.location.pathname === '/bank-reconciliation' ? '8' :
                       window.location.pathname === '/reports' ? '7' : '1']}
        >
          <Menu.Item key="1" icon={<HomeOutlined />}>
            <Link to="/">仪表盘</Link>
          </Menu.Item>
          <Menu.Item key="2" icon={<AccountBookOutlined />}>
            <Link to="/accounts">科目管理</Link>
          </Menu.Item>
          
          <Menu.Item key="4" icon={<SwapOutlined />}>
            <Link to="/transactions">凭证管理</Link>
          </Menu.Item>
          
          <Menu.Item key="6" icon={<UserOutlined />}>
            <Link to="/vendors">供应商管理</Link>
          </Menu.Item>
          
          <Menu.Item key="9" icon={<TagsOutlined />}>
          <Link to="/purchase-orders">采购清单</Link>
        </Menu.Item>
        
        <Menu.Item key="10" icon={<FileTextOutlined />}>
          <Link to="/tax-declarations">税务申报</Link>
        </Menu.Item>
        
        <Menu.Item key="11" icon={<PayCircleOutlined />}>
          <Link to="/payment-management">付款管理</Link>
        </Menu.Item>
        
        <Menu.Item key="8" icon={<ReconciliationOutlined />}>
          <Link to="/bank-reconciliation">银行对账</Link>
        </Menu.Item>
          
          <Menu.Item key="7" icon={<FileTextOutlined />}>
            <Link to="/reports">报表管理</Link>
          </Menu.Item>
          
        </Menu>
      </Sider>
      <Layout style={{ padding: '0 24px 24px', background: 'transparent' }}>
        <Header style={{ 
          background: '#fff', 
          padding: '0 24px', 
          margin: '16px 0', 
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          {/* 用户信息 */}
          <div className="user-info">
            <Avatar className="user-avatar">
              {currentUser ? currentUser.username.charAt(0).toUpperCase() : 'U'}
            </Avatar>
            <span style={{ fontSize: '14px', fontWeight: '500' }}>
              {currentUser ? currentUser.username : '用户'}
            </span>
          </div>
          
          <Button 
            type="primary" 
            danger 
            icon={<LogoutOutlined />} 
            onClick={handleLogout}
            size="middle"
          >
            退出登录
          </Button>
        </Header>
        <Content
          style={{
            background: '#fff',
            padding: 24,
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
            minHeight: 280,
          }}
        >
          {/* 面包屑 */}
          <PageBreadcrumb />
          
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/accounts" element={<Accounts />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/vendors" element={<Vendors />} />
            <Route path="/bank-reconciliation" element={<BankReconciliation />} />
          <Route path="/purchase-orders" element={<PurchaseOrders />} />
          <Route path="/payment-management" element={<PaymentManagement />} />
          <Route path="/tax-declarations" element={<TaxDeclarations />} />
          <Route path="/reports" element={<Reports />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  )
}

function App() {
  return (
    <Routes>
      {/* 公开路由 */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      {/* 私有路由 */}
      <Route path="/*" element={<PrivateRoute element={<MainLayout />} />} />
    </Routes>
  )
}

export default App
