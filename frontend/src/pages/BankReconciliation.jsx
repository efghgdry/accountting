import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Space,
  message,
  Spin,
  Row,
  Col,
  InputNumber
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  ReconciliationOutlined,
  UploadOutlined,
  CheckOutlined,
  CloseOutlined
} from '@ant-design/icons';
import { 
  getBankStatements, 
  createBankStatement, 
  updateBankStatement, 
  deleteBankStatement,
  addBankStatementItem,
  addBankStatementItemsBatch,
  reconcileBankStatementItem,
  getUnreconciledVoucherEntries
} from '../services/api';
import { getAccounts } from '../services/api';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

const BankReconciliation = () => {
  // 状态管理
  const [loading, setLoading] = useState(false);
  const [statements, setStatements] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [unreconciledEntries, setUnreconciledEntries] = useState([]);
  const [currentStatement, setCurrentStatement] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedStatementId, setSelectedStatementId] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isItemModalVisible, setIsItemModalVisible] = useState(false);
  const [isReconcileModalVisible, setIsReconcileModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [itemForm] = Form.useForm();

  // 表格列配置
  const statementColumns = [
    {
      title: '账户名称',
      dataIndex: 'account_name',
      key: 'account_name'
    },
    {
      title: '对账单日期',
      dataIndex: 'statement_date',
      key: 'statement_date'
    },
    {
      title: '期初余额',
      dataIndex: 'opening_balance',
      key: 'opening_balance',
      render: (balance) => balance.toFixed(2) + ' 元'
    },
    {
      title: '期末余额',
      dataIndex: 'closing_balance',
      key: 'closing_balance',
      render: (balance) => balance.toFixed(2) + ' 元'
    },
    {title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = '#1890ff';
        let displayStatus = status;
        if (status === '已完成') color = '#52c41a';
        if (status === '待对账') {
          color = '#faad14';
          displayStatus = '已对账';
        }
        return <span style={{ color }}>{displayStatus}</span>;
      }
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button 
            type="primary" 
            icon={<ReconciliationOutlined />} 
            onClick={() => handleSelectStatement(record.id)}
          >
            对账
          </Button>
          <Button 
            icon={<EditOutlined />} 
            onClick={() => handleEditStatement(record)}
          >
            编辑
          </Button>
          <Button 
            danger 
            icon={<DeleteOutlined />} 
            onClick={() => handleDeleteStatement(record.id)}
          >
            删除
          </Button>
        </Space>
      )
    }
  ];

  const itemColumns = [
    {
      title: '交易日期',
      dataIndex: 'transaction_date',
      key: 'transaction_date'
    },
    {
      title: '摘要',
      dataIndex: 'description',
      key: 'description'
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => amount.toFixed(2) + ' 元'
    },
    {
      title: '余额',
      dataIndex: 'balance',
      key: 'balance',
      render: (balance) => balance.toFixed(2) + ' 元'
    },
    {
      title: '对账状态',
      dataIndex: 'reconciled',
      key: 'reconciled',
      render: (reconciled) => (
        <span style={{ color: reconciled ? '#52c41a' : '#faad14' }}>
          {reconciled ? <CheckOutlined /> : <CloseOutlined />}
          {reconciled ? ' 已对账' : ' 待对账'}
        </span>
      )
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button 
            type="primary" 
            icon={<ReconciliationOutlined />} 
            onClick={() => handleReconcileItem(record)}
          >
            过账
          </Button>
        </Space>
      )
    }
  ];

  // 获取银行对账单列表
  const fetchBankStatements = async () => {
    try {
      setLoading(true);
      const data = await getBankStatements();
      setStatements(data);
    } catch (error) {
      message.error('获取银行对账单失败');
    } finally {
      setLoading(false);
    }
  };

  // 获取银行科目列表
  const fetchAccounts = async () => {
    try {
      const data = await getAccounts();
      // 过滤出银行相关科目
      const bankAccounts = data.filter(account => 
        account.type === '资产' && 
        (account.name.includes('银行') || account.code.startsWith('1002'))
      );
      setAccounts(bankAccounts);
    } catch (error) {
      message.error('获取银行科目失败');
    }
  };

  // 获取待对账的凭证分录
  const fetchUnreconciledEntries = async () => {
    try {
      const data = await getUnreconciledVoucherEntries();
      setUnreconciledEntries(data);
    } catch (error) {
      message.error('获取待对账凭证分录失败');
    }
  };

  // 初始加载数据
  useEffect(() => {
    fetchBankStatements();
    fetchAccounts();
    fetchUnreconciledEntries();
  }, []);

  // 处理选择银行对账单
  const handleSelectStatement = async (statementId) => {
    setSelectedStatementId(statementId);
    const statement = statements.find(s => s.id === statementId);
    setCurrentStatement(statement);
    fetchUnreconciledEntries();
  };

  // 处理添加银行对账单
  const handleAddStatement = () => {
    setIsEditMode(false);
    setIsModalVisible(true);
    form.resetFields();
  };

  // 处理编辑银行对账单
  const handleEditStatement = (record) => {
    setIsEditMode(true);
    setCurrentStatement(record);
    setIsModalVisible(true);
    form.setFieldsValue({
      account_id: record.account_id,
      statement_date: dayjs(record.statement_date),
      opening_balance: record.opening_balance,
      closing_balance: record.closing_balance,
      status: record.status
    });
  };

  // 处理删除银行对账单
  const handleDeleteStatement = async (id) => {
    try {
      await deleteBankStatement(id);
      message.success('银行对账单删除成功');
      fetchBankStatements();
      if (selectedStatementId === id) {
        setSelectedStatementId(null);
        setCurrentStatement(null);
      }
    } catch (error) {
      message.error('银行对账单删除失败');
    }
  };

  // 处理银行对账单表单提交
  const handleStatementSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      if (isEditMode && currentStatement) {
        await updateBankStatement(currentStatement.id, {
          ...values,
          statement_date: values.statement_date.format('YYYY-MM-DD')
        });
        message.success('银行对账单更新成功');
      } else {
        await createBankStatement({
          ...values,
          statement_date: values.statement_date.format('YYYY-MM-DD')
        });
        message.success('银行对账单创建成功');
      }

      setIsModalVisible(false);
      fetchBankStatements();
    } catch (error) {
      message.error('操作失败');
    } finally {
      setLoading(false);
    }
  };

  // 处理添加银行对账单明细
  const handleAddItem = () => {
    setSelectedItem(null);
    setIsEditMode(false);
    setIsItemModalVisible(true);
    itemForm.resetFields();
  };

  // 处理提交银行对账单明细
  const handleItemSubmit = async () => {
    try {
      const values = await itemForm.validateFields();
      setLoading(true);

      if (!selectedStatementId) {
        message.error('请先选择银行对账单');
        return;
      }

      await addBankStatementItem(selectedStatementId, {
        ...values,
        transaction_date: values.transaction_date.format('YYYY-MM-DD')
      });

      message.success('银行对账单明细添加成功');
      setIsItemModalVisible(false);
      fetchBankStatements();
      // 刷新当前选中的对账单
      handleSelectStatement(selectedStatementId);
    } catch (error) {
      message.error('操作失败');
    } finally {
      setLoading(false);
    }
  };

  // 处理关联凭证分录
  const handleReconcileItem = (item) => {
    setSelectedItem(item);
    setIsReconcileModalVisible(true);
  };

  // 处理对账提交
  const handleReconcileSubmit = async (values) => {
    try {
      setLoading(true);

      await reconcileBankStatementItem(selectedItem.id, {
        voucher_entry_id: values.voucher_entry_id
      });

      message.success('对账成功');
      setIsReconcileModalVisible(false);
      fetchBankStatements();
      fetchUnreconciledEntries();
      // 刷新当前选中的对账单
      handleSelectStatement(selectedStatementId);
    } catch (error) {
      message.error('操作失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>银行对账</h1>

      {/* 银行对账单列表 */}
      <Card title="银行对账单列表" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddStatement}>
            新增银行对账单
          </Button>
        </div>
        <Spin spinning={loading}>
          <Table 
            columns={statementColumns} 
            dataSource={statements} 
            rowKey="id" 
            pagination={{ pageSize: 10 }}
          />
        </Spin>
      </Card>

      {/* 银行对账明细 */}
      {currentStatement && (
        <Card title={`银行对账明细 - ${currentStatement.account_name}`}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddItem}>
              添加明细
            </Button>
          </div>

          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={6}>
              <div style={{ padding: 16, background: '#f0f2f5', borderRadius: 8 }}>
                <h4>对账单信息</h4>
                <p>日期: {currentStatement.statement_date}</p>
                <p>期初余额: {currentStatement.opening_balance.toFixed(2)} 元</p>
                <p>期末余额: {currentStatement.closing_balance.toFixed(2)} 元</p>
                <p>状态: <span style={{ color: currentStatement.status === '已完成' ? '#52c41a' : '#faad14' }}>{currentStatement.status === '待对账' ? '已对账' : currentStatement.status}</span></p>
              </div>
            </Col>
          </Row>

          <Spin spinning={loading}>
            <Table 
              columns={itemColumns} 
              dataSource={currentStatement.items} 
              rowKey="id" 
              pagination={{ pageSize: 10 }}
            />
          </Spin>
        </Card>
      )}

      {/* 新增/编辑银行对账单模态框 */}
      <Modal
        title={isEditMode ? '编辑银行对账单' : '新增银行对账单'}
        visible={isModalVisible}
        onOk={handleStatementSubmit}
        onCancel={() => setIsModalVisible(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="account_id"
            label="银行账户"
            rules={[{ required: true, message: '请选择银行账户!' }]}
          >
            <Select placeholder="请选择银行账户">
              {accounts.map(account => (
                <Option key={account.id} value={account.id}>
                  {account.name} ({account.code})
                </Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="statement_date"
            label="对账单日期"
            rules={[{ required: true, message: '请选择对账单日期!' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          
          <Form.Item
            name="opening_balance"
            label="期初余额"
            rules={[{ required: true, message: '请输入期初余额!' }]}
          >
            <InputNumber style={{ width: '100%' }} placeholder="请输入期初余额" />
          </Form.Item>
          
          <Form.Item
            name="closing_balance"
            label="期末余额"
            rules={[{ required: true, message: '请输入期末余额!' }]}
          >
            <InputNumber style={{ width: '100%' }} placeholder="请输入期末余额" />
          </Form.Item>
          
          <Form.Item
            name="status"
            label="状态"
          >
            <Select placeholder="请选择状态">
              <Option value="待对账">待对账</Option>
              <Option value="已对账">已对账</Option>
              <Option value="已完成">已完成</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* 新增银行对账单明细模态框 */}
      <Modal
        title="新增银行对账单明细"
        visible={isItemModalVisible}
        onOk={handleItemSubmit}
        onCancel={() => setIsItemModalVisible(false)}
        destroyOnClose
      >
        <Form form={itemForm} layout="vertical">
          <Form.Item
            name="transaction_date"
            label="交易日期"
            rules={[{ required: true, message: '请选择交易日期!' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="摘要"
            rules={[{ required: true, message: '请输入摘要!' }]}
          >
            <TextArea rows={3} placeholder="请输入摘要" />
          </Form.Item>
          
          <Form.Item
            name="amount"
            label="金额"
            rules={[{ required: true, message: '请输入金额!' }]}
          >
            <InputNumber style={{ width: '100%' }} placeholder="请输入金额" />
          </Form.Item>
          
          <Form.Item
            name="balance"
            label="余额"
            rules={[{ required: true, message: '请输入余额!' }]}
          >
            <InputNumber style={{ width: '100%' }} placeholder="请输入余额" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 过账模态框 */}
      <Modal
        title="凭证过账"
        visible={isReconcileModalVisible}
        onOk={handleReconcileSubmit}
        onCancel={() => setIsReconcileModalVisible(false)}
        destroyOnClose
        width={800}
      >
        <Form layout="vertical" onFinish={handleReconcileSubmit}>
          <div style={{ display: 'flex', gap: 20 }}>
            {/* 银行对账单明细 */}
            <div style={{ flex: 1, padding: 16, background: '#f0f2f5', borderRadius: 8 }}>
              <h4 style={{ marginBottom: 16 }}>银行对账单明细</h4>
              <p>交易日期: {selectedItem?.transaction_date}</p>
              <p>摘要: {selectedItem?.description}</p>
              <p>金额: {selectedItem?.amount.toFixed(2)} 元</p>
              <p>余额: {selectedItem?.balance.toFixed(2)} 元</p>
            </div>
            
            {/* 凭证分录信息（选择后显示） */}
            <div style={{ flex: 1, padding: 16, background: '#e6f7ff', borderRadius: 8 }}>
              <h4 style={{ marginBottom: 16 }}>凭证分录信息</h4>
              <Form.Item
                name="voucher_entry_id"
                label="选择凭证分录"
                rules={[{ required: true, message: '请选择凭证分录!' }]}
              >
                <Select placeholder="请选择待过账的凭证分录" style={{ width: '100%' }}>
                  {unreconciledEntries.map(entry => (
                    <Option key={entry.id} value={entry.id}>
                      <div>
                        <div>凭证号: {entry.voucher_no}</div>
                        <div>日期: {entry.date}</div>
                        <div>科目: {entry.account_name}</div>
                        <div>摘要: {entry.description}</div>
                        <div>金额: {entry.amount.toFixed(2)} 元</div>
                      </div>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </div>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default BankReconciliation;