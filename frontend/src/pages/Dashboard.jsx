import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Row, Col, Statistic, Spin, Button, message, Progress, Space } from 'antd'
import {
  ArrowUpOutlined, 
  ArrowDownOutlined, 
  DollarOutlined, 
  UserOutlined, 
  FileTextOutlined, 
  AccountBookOutlined, 
  PieChartOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons'
import { getDashboardData } from '../services/api'

const Dashboard = () => {
  const navigate = useNavigate()
  const [data, setData] = useState({
    total_accounts: 0,
    total_income: 0,
    total_expense: 0,
    total_balance: 0,
    total_asset: 0,
    total_liability: 0,
    total_equity: 0,
    monthly_vouchers: 0,
    total_vendors: 0
  })
  const [loading, setLoading] = useState(true)
  const [refreshLoading, setRefreshLoading] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // 从API获取仪表盘数据
      const dashboardData = await getDashboardData()
      
      setData({
        total_accounts: dashboardData.total_users,
        total_income: dashboardData.monthly_income,
        total_expense: dashboardData.monthly_expense,
        total_balance: dashboardData.monthly_balance,
        total_asset: dashboardData.total_assets,
        total_liability: dashboardData.total_liabilities,
        total_equity: dashboardData.total_equities,
        // 添加新字段
        total_accounts_count: dashboardData.total_accounts,
        monthly_vouchers: dashboardData.monthly_vouchers,
        total_vendors: dashboardData.total_vendors
      })
    } catch (error) {
      message.error('获取仪表盘数据失败')
      console.error('获取仪表盘数据失败:', error)
    } finally {
      setLoading(false)
      setRefreshLoading(false)
    }
  }

  const handleRefresh = () => {
    setRefreshLoading(true)
    fetchData()
  }

  // 计算资产负债比例
  const equityRatio = data.total_asset > 0 ? (data.total_equity / data.total_asset) * 100 : 0
  const liabilityRatio = data.total_asset > 0 ? (data.total_liability / data.total_asset) * 100 : 0

  // 财务健康度评估
  const getFinancialHealth = () => {
    if (equityRatio > 50) {
      return { status: '健康', icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />, color: '#52c41a' }
    } else if (equityRatio > 30) {
      return { status: '良好', icon: <CheckCircleOutlined style={{ color: '#faad14' }} />, color: '#faad14' }
    } else {
      return { status: '警示', icon: <ExclamationCircleOutlined style={{ color: '#f5222d' }} />, color: '#f5222d' }
    }
  }

  const financialHealth = getFinancialHealth()

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1>仪表盘</h1>
        <Space>
          <Button 
            type="primary" 
            onClick={handleRefresh}
            loading={refreshLoading}
            icon={<ReloadOutlined />}
          >
            刷新数据
          </Button>
        </Space>
      </div>
      
      <Spin spinning={loading} tip="正在加载数据...">
        {/* 顶部关键指标卡片 */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={8}>
            <Card className="dashboard-card" hoverable>
              <Statistic
                title="本月收入"
                value={data.total_income}
                prefix={<ArrowUpOutlined style={{ color: '#52c41a' }} />}
                valueStyle={{ color: '#52c41a', fontSize: '28px' }}
                suffix="元"
                description={
                  <div style={{ marginTop: 8, color: '#666' }}>
                    <span>较上月增长</span>
                    <span style={{ marginLeft: 8, color: '#52c41a', fontWeight: '500' }}>
                      5.2% <ArrowUpOutlined style={{ fontSize: '12px' }} />
                    </span>
                  </div>
                }
              />
            </Card>
          </Col>
          
          <Col xs={24} sm={12} lg={8}>
            <Card className="dashboard-card" hoverable>
              <Statistic
                title="本月支出"
                value={data.total_expense}
                prefix={<ArrowDownOutlined style={{ color: '#f5222d' }} />}
                valueStyle={{ color: '#f5222d', fontSize: '28px' }}
                suffix="元"
                description={
                  <div style={{ marginTop: 8, color: '#666' }}>
                    <span>较上月下降</span>
                    <span style={{ marginLeft: 8, color: '#52c41a', fontWeight: '500' }}>
                      3.8% <ArrowDownOutlined style={{ fontSize: '12px' }} />
                    </span>
                  </div>
                }
              />
            </Card>
          </Col>
          
          <Col xs={24} sm={12} lg={8}>
            <Card className="dashboard-card" hoverable>
              <Statistic
                title="本月结余"
                value={data.total_balance}
                prefix={<DollarOutlined style={{ color: data.total_balance >= 0 ? '#52c41a' : '#f5222d' }} />}
                valueStyle={{ color: data.total_balance >= 0 ? '#52c41a' : '#f5222d', fontSize: '28px' }}
                suffix="元"
                description={
                  <div style={{ marginTop: 8, color: '#666' }}>
                    <span>预算执行率</span>
                    <Progress 
                      percent={data.total_expense > 0 ? Math.min(100, (data.total_expense / (data.total_income + data.total_expense)) * 100) : 0} 
                      size="small" 
                      style={{ marginLeft: 8, width: '80px' }}
                    />
                  </div>
                }
              />
            </Card>
          </Col>
        </Row>

        {/* 财务状况概览 */}
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col xs={24} lg={16}>
            <Card title="财务状况概览" hoverable>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <div style={{ padding: 16, background: '#f6ffed', borderRadius: 8, border: '1px solid #b7eb8f' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <span style={{ fontSize: 14, color: '#52c41a' }}>总资产</span>
                      <DollarOutlined style={{ color: '#52c41a' }} />
                    </div>
                    <Statistic
                      value={data.total_asset}
                      valueStyle={{ color: '#52c41a', fontSize: 28 }}
                      suffix="元"
                      description="资产账户余额总计"
                    />
                  </div>
                </Col>
                
                <Col xs={24} sm={12}>
                  <div style={{ padding: 16, background: '#fff7e6', borderRadius: 8, border: '1px solid #ffe7ba' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <span style={{ fontSize: 14, color: '#faad14' }}>总负债</span>
                      <DollarOutlined style={{ color: '#faad14' }} />
                    </div>
                    <Statistic
                      value={data.total_liability}
                      valueStyle={{ color: '#faad14', fontSize: 28 }}
                      suffix="元"
                      description="负债账户余额总计"
                    />
                  </div>
                </Col>
                
                <Col xs={24} sm={12}>
                  <div style={{ padding: 16, background: '#e6f7ff', borderRadius: 8, border: '1px solid #91d5ff' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <span style={{ fontSize: 14, color: '#1890ff' }}>总权益</span>
                      <DollarOutlined style={{ color: '#1890ff' }} />
                    </div>
                    <Statistic
                      value={data.total_equity}
                      valueStyle={{ color: '#1890ff', fontSize: 28 }}
                      suffix="元"
                      description="权益账户余额总计"
                    />
                  </div>
                </Col>
                
                <Col xs={24} sm={12}>
                  <div style={{ padding: 16, background: '#fff2f0', borderRadius: 8, border: '1px solid #ffccc7' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <span style={{ fontSize: 14, color: '#f5222d' }}>财务健康度</span>
                      {financialHealth.icon}
                    </div>
                    <Statistic
                      value={financialHealth.status}
                      valueStyle={{ color: financialHealth.color, fontSize: 28 }}
                      description={
                        <div style={{ marginTop: 12 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                            <span style={{ fontSize: 12, color: '#666' }}>权益比率</span>
                            <span style={{ fontSize: 12, color: '#1890ff', fontWeight: '500' }}>{equityRatio.toFixed(1)}%</span>
                          </div>
                          <Progress percent={equityRatio} strokeColor="#1890ff" size="small" />
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                            <span style={{ fontSize: 12, color: '#666' }}>负债比率</span>
                            <span style={{ fontSize: 12, color: '#faad14', fontWeight: '500' }}>{liabilityRatio.toFixed(1)}%</span>
                          </div>
                          <Progress percent={liabilityRatio} strokeColor="#faad14" size="small" />
                        </div>
                      }
                    />
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>
          
          {/* 右侧统计信息 */}
          <Col xs={24} lg={8}>
            <Card title="系统概览" hoverable>
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>用户总数</div>
                    <div style={{ fontSize: 24, fontWeight: '600', color: '#333' }}>{data.total_accounts}</div>
                  </div>
                  <UserOutlined style={{ fontSize: 24, color: '#1890ff' }} />
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>科目数量</div>
                    <div style={{ fontSize: 24, fontWeight: '600', color: '#333' }}>{data.total_accounts_count}</div>
                  </div>
                  <AccountBookOutlined style={{ fontSize: 24, color: '#52c41a' }} />
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>本月凭证</div>
                    <div style={{ fontSize: 24, fontWeight: '600', color: '#333' }}>{data.monthly_vouchers}</div>
                  </div>
                  <FileTextOutlined style={{ fontSize: 24, color: '#faad14' }} />
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>供应商数量</div>
                    <div style={{ fontSize: 24, fontWeight: '600', color: '#333' }}>{data.total_vendors}</div>
                  </div>
                  <PieChartOutlined style={{ fontSize: 24, color: '#f5222d' }} />
                </div>
              </Space>
              
              <div style={{ marginTop: 24, padding: 16, background: '#fafafa', borderRadius: 8 }}>
                <div style={{ fontSize: 14, fontWeight: '500', marginBottom: 12, color: '#333' }}>快速操作</div>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Button block type="default" icon={<FileTextOutlined />} onClick={() => navigate('/transactions')}>新建凭证</Button>
                  <Button block type="default" icon={<AccountBookOutlined />} onClick={() => navigate('/accounts')}>管理科目</Button>
                  <Button block type="default" icon={<PieChartOutlined />} onClick={() => navigate('/reports')}>查看报表</Button>
                </Space>
              </div>
            </Card>
          </Col>
        </Row>
        
        {/* 页脚信息 */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginTop: 24, 
          padding: 16, 
          background: '#fafafa', 
          borderRadius: 8,
          fontSize: 14,
          color: '#666'
        }}>
          <div>
            <span>会计系统</span> - <span>专业的财务管理解决方案</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ReloadOutlined style={{ fontSize: 14 }} />
            <span>数据更新时间: {new Date().toLocaleString()}</span>
          </div>
        </div>
      </Spin>
    </div>
  )
}

export default Dashboard