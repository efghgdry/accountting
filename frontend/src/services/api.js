import axios from 'axios'

// 创建axios实例
const api = axios.create({
  baseURL: '/api',
  timeout: 10000
})

// 请求拦截器
api.interceptors.request.use(
  config => {
    return config
  },
  error => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  response => {
    return response.data
  },
  error => {
    console.error('响应错误:', error)
    return Promise.reject(error)
  }
)

// 用户认证
export const register = (data) => {
  return api.post('/auth/register', data)
}

export const login = (data) => {
  return api.post('/auth/login', data)
}

export const logout = () => {
  return api.post('/auth/logout')
}

export const getCurrentUser = () => {
  return api.get('/auth/user')
}

// 科目管理
export const getAccounts = () => {
  return api.get('/accounts')
}

export const getAccount = (id) => {
  return api.get(`/accounts/${id}`)
}

export const createAccount = (data) => {
  return api.post('/accounts', data)
}

export const updateAccount = (id, data) => {
  return api.put(`/accounts/${id}`, data)
}

export const deleteAccount = (id) => {
  return api.delete(`/accounts/${id}`)
}

// 仪表盘数据
export const getDashboardData = () => {
  return api.get('/dashboard')
}

// 凭证管理
export const getVouchers = () => {
  return api.get('/vouchers')
}

export const getVoucher = (id) => {
  return api.get(`/vouchers/${id}`)
}

export const createVoucher = (data) => {
  return api.post('/vouchers', data)
}

export const updateVoucher = (id, data) => {
  return api.put(`/vouchers/${id}`, data)
}

export const deleteVoucher = (id) => {
  return api.delete(`/vouchers/${id}`)
}

// 凭证过账
export const postVoucher = (id) => {
  return api.post(`/vouchers/${id}/post`)
}

// 取消凭证过账
export const unpostVoucher = (id) => {
  return api.post(`/vouchers/${id}/unpost`)
}

// 供应商管理
export const getVendors = () => {
  return api.get('/vendors')
}

export const getVendor = (id) => {
  return api.get(`/vendors/${id}`)
}

export const createVendor = (data) => {
  return api.post('/vendors', data)
}

export const updateVendor = (id, data) => {
  return api.put(`/vendors/${id}`, data)
}

export const deleteVendor = (id) => {
  return api.delete(`/vendors/${id}`)
}

// 财务报表
export const getBalanceSheet = () => {
  return api.get('/reports/balance_sheet')
}

export const getIncomeStatement = () => {
  return api.get('/reports/income_statement')
}

export const getCashFlow = () => {
  return api.get('/reports/cash_flow')
}

// 银行对账
export const getBankStatements = () => {
  return api.get('/bank-statements')
}

export const getBankStatement = (id) => {
  return api.get(`/bank-statements/${id}`)
}

export const createBankStatement = (data) => {
  return api.post('/bank-statements', data)
}

export const updateBankStatement = (id, data) => {
  return api.put(`/bank-statements/${id}`, data)
}

export const deleteBankStatement = (id) => {
  return api.delete(`/bank-statements/${id}`)
}

export const addBankStatementItem = (statementId, data) => {
  return api.post(`/bank-statements/${statementId}/items`, data)
}

export const addBankStatementItemsBatch = (statementId, data) => {
  return api.post(`/bank-statements/${statementId}/items/batch`, data)
}

export const reconcileBankStatementItem = (itemId, data) => {
  return api.post(`/bank-statement-items/${itemId}/reconcile`, data)
}

export const getUnreconciledVoucherEntries = () => {
  return api.get('/unreconciled-voucher-entries')
}

// 采购订单管理
export const getPurchaseOrders = () => {
  return api.get('/purchase-orders')
}

export const getPurchaseOrder = (id) => {
  return api.get(`/purchase-orders/${id}`)
}

export const createPurchaseOrder = (data) => {
  return api.post('/purchase-orders', data)
}

export const updatePurchaseOrder = (id, data) => {
  return api.put(`/purchase-orders/${id}`, data)
}

export const deletePurchaseOrder = (id) => {
  return api.delete(`/purchase-orders/${id}`)
}

// 税务申报管理
export const getTaxDeclarations = () => {
  return api.get('/tax-declarations')
}

export const getTaxDeclaration = (id) => {
  return api.get(`/tax-declarations/${id}`)
}

export const createTaxDeclaration = (data) => {
  return api.post('/tax-declarations', data)
}

export const updateTaxDeclaration = (id, data) => {
  return api.put(`/tax-declarations/${id}`, data)
}

export const deleteTaxDeclaration = (id) => {
  return api.delete(`/tax-declarations/${id}`)
}

// 计算税款
export const calculateTax = (data) => {
  return api.post('/tax-declarations/calculate', data)
}

// 提交税务申报
export const submitTaxDeclaration = (id) => {
  return api.post(`/tax-declarations/${id}/submit`)
}

// 付款管理
export const getAwaitingPaymentBills = () => {
  return api.get('/bills/awaiting-payment')
}

export const executePayment = (data) => {
  return api.post('/payments/execute', data)
}

export const getBankAccounts = () => {
  return api.get('/accounts/bank')
}

export default api