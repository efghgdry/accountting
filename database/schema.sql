-- 会计财务系统数据库设计
-- 简化版，不考虑币种问题

-- 创建数据库
-- SQLite会自动创建数据库文件，无需CREATE DATABASE语句


-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    email TEXT UNIQUE,
    full_name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 科目表
CREATE TABLE IF NOT EXISTS accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- 资产、负债、权益、收入、费用
    parent_id INTEGER,
    description TEXT,
    balance REAL DEFAULT 0.0,
    user_id INTEGER REFERENCES users(id),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES accounts(id)
);

-- 凭证表
CREATE TABLE IF NOT EXISTS vouchers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    voucher_no TEXT NOT NULL UNIQUE,
    date DATETIME NOT NULL,
    description TEXT NOT NULL,
    status TEXT DEFAULT '未审核', -- 未审核、已审核、已驳回
    user_id INTEGER REFERENCES users(id),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 凭证详情表（分录）
CREATE TABLE IF NOT EXISTS voucher_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    voucher_id INTEGER NOT NULL,
    account_id INTEGER NOT NULL,
    direction TEXT NOT NULL, -- 借方或贷方
    amount REAL NOT NULL,
    description TEXT,
    FOREIGN KEY (voucher_id) REFERENCES vouchers(id),
    FOREIGN KEY (account_id) REFERENCES accounts(id)
);

-- 供应商表
CREATE TABLE IF NOT EXISTS vendors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    contact TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    description TEXT,
    user_id INTEGER REFERENCES users(id),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 初始化数据
-- 默认用户
INSERT INTO users (username, password_hash, email, full_name) VALUES 
('admin', '$2b$12$7I4LzH3z4e0P5c0a9B1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6', 'admin@example.com', '管理员');

-- 预设科目
INSERT INTO accounts (code, name, type, parent_id, description) VALUES 
-- 资产类
('1001', '库存现金', '资产', NULL, '库存现金'),
('1002', '银行存款', '资产', NULL, '银行存款'),
('1122', '应收账款', '资产', NULL, '应收账款'),
('1221', '其他应收款', '资产', NULL, '其他应收款'),
('1401', '材料采购', '资产', NULL, '材料采购'),
('1403', '原材料', '资产', NULL, '原材料'),
('1405', '库存商品', '资产', NULL, '库存商品'),
('1601', '固定资产', '资产', NULL, '固定资产'),
('1602', '累计折旧', '资产', 8, '累计折旧'),
('1801', '长期待摊费用', '资产', NULL, '长期待摊费用'),

-- 负债类
('2001', '短期借款', '负债', NULL, '短期借款'),
('2201', '应付票据', '负债', NULL, '应付票据'),
('2202', '应付账款', '负债', NULL, '应付账款'),
('2211', '应付职工薪酬', '负债', NULL, '应付职工薪酬'),
('2221', '应交税费', '负债', NULL, '应交税费'),
('2231', '应付利息', '负债', NULL, '应付利息'),
('2241', '其他应付款', '负债', NULL, '其他应付款'),
('2501', '长期借款', '负债', NULL, '长期借款'),

-- 权益类
('4001', '实收资本', '权益', NULL, '实收资本'),
('4002', '资本公积', '权益', NULL, '资本公积'),
('4101', '盈余公积', '权益', NULL, '盈余公积'),
('4103', '本年利润', '权益', NULL, '本年利润'),
('4104', '利润分配', '权益', NULL, '利润分配'),

-- 收入类
('6001', '主营业务收入', '收入', NULL, '主营业务收入'),
('6051', '其他业务收入', '收入', NULL, '其他业务收入'),
('6111', '投资收益', '收入', NULL, '投资收益'),
('6301', '营业外收入', '收入', NULL, '营业外收入'),

-- 费用类
('6401', '主营业务成本', '费用', NULL, '主营业务成本'),
('6402', '其他业务成本', '费用', NULL, '其他业务成本'),
('6403', '税金及附加', '费用', NULL, '税金及附加'),
('6601', '销售费用', '费用', NULL, '销售费用'),
('6602', '管理费用', '费用', NULL, '管理费用'),
('6603', '财务费用', '费用', NULL, '财务费用'),
('6711', '营业外支出', '费用', NULL, '营业外支出'),
('6801', '所得税费用', '费用', NULL, '所得税费用');
