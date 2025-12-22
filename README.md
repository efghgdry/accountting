# 项目概述
本系统是一个基于Web的会计财务系统，提供了全面的财务处理功能，包括凭证管理、科目管理、供应商管理、采购订单、税务申报、付款管理、银行对账和报表管理等。系统采用前后端分离架构，界面简洁美观，操作便捷。（登陆方式见文末）

## 技术栈
### 前端
- React 18
- Ant Design 5
- Vite
- Axios
- dayjs
### 后端
- Flask
- SQLAlchemy
- SQLite (默认数据库)
- bcrypt (密码加密)
## 系统功能
### 1. 仪表盘
- 显示系统概览和关键指标
- 本月收入、支出和结余
- 总资产、负债和权益
- 科目数量和凭证数量统计
### 2. 科目管理
资产、负债、权益、收入、费用五类科目管理
科目增删改查功能
科目余额管理
###  3 凭证管理
- 凭证新增、编辑、删除功能
- 凭证过账和取消过账
- 凭证分录管理，支持多条分录
- 借贷平衡验证
- 凭证查询和筛选
### 4. 供应商管理
- 供应商信息管理
- 供应商增删改查
### 5. 采购订单
- 采购订单管理
- 采购订单项管理
- 订单状态跟踪（pending, approved, completed）
### 6. 税务申报
- 多种税种申报支持（增值税、企业所得税、附加税、个人所得税）
- 自动计算应纳税额
- 申报状态跟踪
- 申报记录管理
### 7. 付款管理
- 待付款记录管理（账单、税务申报、采购订单）
- 批量付款功能
- 付款凭证自动生成
- 银行账户余额验证
### 8. 银行对账
- 银行对账单管理
- 对账单明细管理
- 凭证分录关联对账
- 对账状态跟踪
- 对账进度管理
### 9. 报表管理
- 资产负债表
- 利润表
- 现金流量表

## 项目结构

### 前端结构
```text
frontend/
├── src/
│   ├── components/            # 公共组件
│   ├── pages/                 # 页面组件
│   │   ├── Dashboard.jsx      # 仪表盘
│   │   ├── Accounts.jsx       # 科目管理
│   │   ├── Transactions.jsx    # 凭证管理
│   │   ├── Vendors.jsx        # 供应商管理
│   │   ├── PurchaseOrders.jsx  # 采购订单
│   │   ├── TaxDeclarations.jsx # 税务申报
│   │   ├── PaymentManagement.jsx# 付款管理
│   │   ├── BankReconciliation.jsx# 银行对账
│   │   └── Reports.jsx        # 报表管理
│   ├── services/              # API服务
│   │   └── api.js             # API调用封装
│   ├── App.jsx                # 应用入口
│   ├── main.jsx               # 渲染入口
│   └── index.css              # 全局样式
├── public/                    # 静态资源
├── package.json               # 项目配置
└── vite.config.js             # Vite配置
```
### 后端结构
```text
backend/
├── app.py                     # 应用入口
├── models.py                  # 数据库模型
├── routes.py                  # API路由
├── requirements.txt           # 依赖列表
└── update_payment_table.py    # 数据库更新脚本
```

## 数据库结构
主要数据库模型包括：

- User (用户)
- Account (科目)
- Voucher (凭证)
- VoucherEntry (凭证分录)
- Vendor (供应商)
- BankStatement (银行对账单)
- BankStatementItem (银行对账单明细)
- PurchaseOrder (采购订单)
- PurchaseOrderItem (采购订单项)
- TaxDeclaration (税务申报)
- Bill (应付账单)
- Payment (付款记录)
### 使用说明
1. 用户注册和登录
- 首次使用需注册新用户
- 使用注册的用户名和密码登录系统
2. 初始化设置
- 系统会自动创建基础科目结构
- 可根据需要添加自定义科目
3. 日常操作流程
- 录入或导入凭证
- 审核并过账凭证
- 管理供应商和采购订单
- 处理税务申报
- 执行付款操作
- 进行银行对账
- 生成财务报表
## 注意事项
1. 系统默认使用SQLite数据库，数据存储在backend目录下的accounting.db文件中
2. 首次启动系统会自动创建数据库和基础数据
3. 请确保前端和后端服务都已启动，否则系统无法正常工作
4. 凭证过账后将影响账户余额，如需修改请先取消过账
5. 银行对账后，对账单状态会自动更新
6. 付款操作会生成相应的付款凭证并更新账户余额
## 启动登录页面
*URL:*


**账号:  hello**


**密码:  hello**



## 贡献
欢迎提交Issue和Pull Request！

## 联系方式
如有问题或建议，欢迎通过以下方式联系：

Email: 3514960900@qq.com
