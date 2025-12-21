import React, { useState, useEffect } from 'react';
import { Table, Button, Card, Row, Col, Tabs, message } from 'antd';
import { FileTextOutlined, BarChartOutlined, LineChartOutlined } from '@ant-design/icons';
import { getBalanceSheet, getIncomeStatement, getCashFlow } from '../services/api';

const { TabPane } = Tabs;

const Reports = () => {
  const [loading, setLoading] = useState(false);
  const [balanceSheetData, setBalanceSheetData] = useState(null);
  const [incomeStatementData, setIncomeStatementData] = useState(null);
  const [cashFlowData, setCashFlowData] = useState(null);

  // 资产负债表列配置
  const balanceSheetColumns = [
    {
      title: '科目代码',
      dataIndex: 'code',
      key: 'code'
    },
    {
      title: '科目名称',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '余额',
      dataIndex: 'balance',
      key: 'balance',
      render: (balance) => balance.toFixed(2) + ' 元'
    }
  ];

  // 利润表列配置
  const incomeStatementColumns = [
    {
      title: '科目代码',
      dataIndex: 'code',
      key: 'code'
    },
    {
      title: '科目名称',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '金额',
      dataIndex: 'balance',
      key: 'balance',
      render: (balance) => balance.toFixed(2) + ' 元'
    }
  ];

  // 现金流量表列配置
  const cashFlowColumns = [
    {
      title: '科目代码',
      dataIndex: 'code',
      key: 'code'
    },
    {
      title: '科目名称',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '余额',
      dataIndex: 'balance',
      key: 'balance',
      render: (balance) => balance.toFixed(2) + ' 元'
    }
  ];

  // 生成资产负债表
  const generateBalanceSheet = async (showMessage = true) => {
    try {
      setLoading(true);
      const data = await getBalanceSheet();
      setBalanceSheetData(data);
      if (showMessage) {
        message.success('资产负债表生成成功');
      }
    } catch (error) {
      message.error('资产负债表生成失败');
    } finally {
      setLoading(false);
    }
  };

  // 生成利润表
  const generateIncomeStatement = async (showMessage = true) => {
    try {
      setLoading(true);
      const data = await getIncomeStatement();
      setIncomeStatementData(data);
      if (showMessage) {
        message.success('利润表生成成功');
      }
    } catch (error) {
      message.error('利润表生成失败');
    } finally {
      setLoading(false);
    }
  };

  // 生成现金流量表
  const generateCashFlow = async (showMessage = true) => {
    try {
      setLoading(true);
      const data = await getCashFlow();
      setCashFlowData(data);
      if (showMessage) {
        message.success('现金流量表生成成功');
      }
    } catch (error) {
      message.error('现金流量表生成失败');
    } finally {
      setLoading(false);
    }
  };

  // 初始生成所有报表（不显示重复消息）
  useEffect(() => {
    generateBalanceSheet(false);
    generateIncomeStatement(false);
    generateCashFlow(false);
  }, []);

  return (
    <div>
      <h1>财务报表</h1>
      
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={24}>
          <Card title="报表生成">
            <Button type="primary" icon={<FileTextOutlined />} onClick={generateBalanceSheet} style={{ marginRight: 8 }} loading={loading}>
              刷新资产负债表
            </Button>
            <Button type="primary" icon={<BarChartOutlined />} onClick={generateIncomeStatement} style={{ marginRight: 8 }} loading={loading}>
              刷新利润表
            </Button>
            <Button type="primary" icon={<LineChartOutlined />} onClick={generateCashFlow} loading={loading}>
              刷新现金流量表
            </Button>
          </Card>
        </Col>
      </Row>
      
      <Tabs defaultActiveKey="balanceSheet" type="card">
        {/* 资产负债表 */}
        <TabPane tab={<span><FileTextOutlined /> 资产负债表</span>} key="balanceSheet">
          {balanceSheetData && (
            <>
              <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col span={8}>
                  <Card title="资产总计" bordered={false}>
                    <h2 style={{ color: '#1890ff', textAlign: 'center' }}>
                      {balanceSheetData.total_assets.toFixed(2)} 元
                    </h2>
                  </Card>
                </Col>
                <Col span={8}>
                  <Card title="负债总计" bordered={false}>
                    <h2 style={{ color: '#faad14', textAlign: 'center' }}>
                      {balanceSheetData.total_liabilities.toFixed(2)} 元
                    </h2>
                  </Card>
                </Col>
                <Col span={8}>
                  <Card title="所有者权益总计" bordered={false}>
                    <h2 style={{ color: '#52c41a', textAlign: 'center' }}>
                      {balanceSheetData.total_equities.toFixed(2)} 元
                    </h2>
                  </Card>
                </Col>
              </Row>
              
              <Row gutter={16}>
                <Col span={12}>
                  <Card title="资产项目">
                    <Table
                      dataSource={balanceSheetData.assets}
                      columns={balanceSheetColumns}
                      rowKey="code"
                      pagination={false}
                    />
                  </Card>
                </Col>
                <Col span={12}>
                  <Card title="负债和所有者权益项目">
                    <div style={{ marginBottom: 16 }}>
                      <h4>负债</h4>
                      <Table
                        dataSource={balanceSheetData.liabilities}
                        columns={balanceSheetColumns}
                        rowKey="code"
                        pagination={false}
                      />
                    </div>
                    <div>
                      <h4>所有者权益</h4>
                      <Table
                        dataSource={balanceSheetData.equities}
                        columns={balanceSheetColumns}
                        rowKey="code"
                        pagination={false}
                      />
                    </div>
                  </Card>
                </Col>
              </Row>
            </>
          )}
        </TabPane>

        {/* 利润表 */}
        <TabPane tab={<span><BarChartOutlined /> 利润表</span>} key="incomeStatement">
          {incomeStatementData && (
            <>
              <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col span={8}>
                  <Card title="总收入" bordered={false}>
                    <h2 style={{ color: '#52c41a', textAlign: 'center' }}>
                      {incomeStatementData.total_income.toFixed(2)} 元
                    </h2>
                  </Card>
                </Col>
                <Col span={8}>
                  <Card title="总费用" bordered={false}>
                    <h2 style={{ color: '#f5222d', textAlign: 'center' }}>
                      {incomeStatementData.total_expense.toFixed(2)} 元
                    </h2>
                  </Card>
                </Col>
                <Col span={8}>
                  <Card title="净利润" bordered={false}>
                    <h2 style={{ color: incomeStatementData.profit >= 0 ? '#52c41a' : '#f5222d', textAlign: 'center' }}>
                      {incomeStatementData.profit.toFixed(2)} 元
                    </h2>
                  </Card>
                </Col>
              </Row>
              
              <Row gutter={16}>
                <Col span={12}>
                  <Card title="收入项目">
                    <Table
                      dataSource={incomeStatementData.incomes}
                      columns={incomeStatementColumns}
                      rowKey="code"
                      pagination={false}
                    />
                  </Card>
                </Col>
                <Col span={12}>
                  <Card title="费用项目">
                    <Table
                      dataSource={incomeStatementData.expenses}
                      columns={incomeStatementColumns}
                      rowKey="code"
                      pagination={false}
                    />
                  </Card>
                </Col>
              </Row>
            </>
          )}
        </TabPane>

        {/* 现金流量表 */}
        <TabPane tab={<span><LineChartOutlined /> 现金流量表</span>} key="cashFlow">
          {cashFlowData && (
            <>
              <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col span={24}>
                  <Card title="现金及现金等价物净增加额" bordered={false}>
                    <h2 style={{ color: '#1890ff', textAlign: 'center' }}>
                      {cashFlowData.total_cash.toFixed(2)} 元
                    </h2>
                  </Card>
                </Col>
              </Row>
              
              <Row gutter={16}>
                <Col span={24}>
                  <Card title="现金流量项目">
                    <Table
                      dataSource={cashFlowData.cash_accounts}
                      columns={cashFlowColumns}
                      rowKey="code"
                      pagination={false}
                    />
                  </Card>
                </Col>
              </Row>
            </>
          )}
        </TabPane>
      </Tabs>
    </div>
  );
};

export default Reports;