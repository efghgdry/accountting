from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import bcrypt

# 创建数据库实例
db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String(50), nullable=False, unique=True)
    password_hash = db.Column(db.String(200), nullable=False)
    email = db.Column(db.String(100), unique=True)
    full_name = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 关联关系
    accounts = db.relationship('Account', backref='user', lazy=True)
    vouchers = db.relationship('Voucher', backref='user', lazy=True)
    
    def set_password(self, password):
        # 生成密码哈希
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    def check_password(self, password):
        # 验证密码
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'full_name': self.full_name,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class Account(db.Model):
    __tablename__ = 'accounts'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    code = db.Column(db.String(20), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    type = db.Column(db.String(20), nullable=False)  # 资产、负债、权益、收入、费用
    parent_id = db.Column(db.Integer, db.ForeignKey('accounts.id'))
    description = db.Column(db.String(200))
    balance = db.Column(db.Float, default=0.0)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    parent = db.relationship('Account', remote_side=[id], backref='children')
    
    def to_dict(self):
        return {
            'id': self.id,
            'code': self.code,
            'name': self.name,
            'type': self.type,
            'parent_id': self.parent_id,
            'description': self.description,
            'balance': self.balance,
            'user_id': self.user_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'children': [child.to_dict() for child in self.children] if self.children else []
        }

class Voucher(db.Model):
    __tablename__ = 'vouchers'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    voucher_no = db.Column(db.String(20), nullable=False, unique=True)
    date = db.Column(db.DateTime, nullable=False)
    description = db.Column(db.String(200), nullable=False)
    status = db.Column(db.String(20), default='未审核')  # 未审核、已审核、已驳回
    posted = db.Column(db.Boolean, default=False)  # 是否过账
    posted_at = db.Column(db.DateTime)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    entries = db.relationship('VoucherEntry', backref='voucher', cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'voucher_no': self.voucher_no,
            'date': self.date.isoformat() if self.date else None,
            'description': self.description,
            'status': self.status,
            'posted': self.posted,
            'posted_at': self.posted_at.isoformat() if self.posted_at else None,
            'user_id': self.user_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'entries': [entry.to_dict() for entry in self.entries] if self.entries else []
        }

class VoucherEntry(db.Model):
    __tablename__ = 'voucher_entries'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    voucher_id = db.Column(db.Integer, db.ForeignKey('vouchers.id'), nullable=False)
    account_id = db.Column(db.Integer, db.ForeignKey('accounts.id'), nullable=False)
    direction = db.Column(db.String(10), nullable=False)  # 借方或贷方
    amount = db.Column(db.Float, nullable=False)
    description = db.Column(db.String(200))
    
    account = db.relationship('Account')
    
    def to_dict(self):
        return {
            'id': self.id,
            'voucher_id': self.voucher_id,
            'account_id': self.account_id,
            'direction': self.direction,
            'amount': self.amount,
            'description': self.description,
            'account': self.account.to_dict() if self.account else None
        }

class Vendor(db.Model):
    __tablename__ = 'vendors'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), nullable=False)
    contact = db.Column(db.String(100))
    email = db.Column(db.String(100))
    phone = db.Column(db.String(20))
    address = db.Column(db.String(200))
    description = db.Column(db.String(500))
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'contact': self.contact,
            'email': self.email,
            'phone': self.phone,
            'address': self.address,
            'description': self.description,
            'user_id': self.user_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

# 银行对账单模型
class BankStatement(db.Model):
    __tablename__ = 'bank_statements'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    account_id = db.Column(db.Integer, db.ForeignKey('accounts.id'), nullable=False)
    statement_date = db.Column(db.Date, nullable=False)
    opening_balance = db.Column(db.Float, nullable=False, default=0.0)
    closing_balance = db.Column(db.Float, nullable=False, default=0.0)
    status = db.Column(db.String(20), default='待对账')  # 待对账、已对账、已完成
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 关联关系
    account = db.relationship('Account', backref='bank_statements')
    items = db.relationship('BankStatementItem', backref='bank_statement', cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'account_id': self.account_id,
            'account_name': self.account.name if self.account else None,
            'statement_date': self.statement_date.isoformat() if self.statement_date else None,
            'opening_balance': self.opening_balance,
            'closing_balance': self.closing_balance,
            'status': self.status,
            'user_id': self.user_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'items': [item.to_dict() for item in self.items] if self.items else []
        }

# 银行对账单明细模型
class BankStatementItem(db.Model):
    __tablename__ = 'bank_statement_items'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    bank_statement_id = db.Column(db.Integer, db.ForeignKey('bank_statements.id'), nullable=False)
    transaction_date = db.Column(db.Date, nullable=False)
    description = db.Column(db.String(200), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    balance = db.Column(db.Float, nullable=False)
    reconciled = db.Column(db.Boolean, default=False)  # 是否已对账
    voucher_entry_id = db.Column(db.Integer, db.ForeignKey('voucher_entries.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 关联关系
    voucher_entry = db.relationship('VoucherEntry', backref='bank_statement_items')
    
    def to_dict(self):
        return {
            'id': self.id,
            'bank_statement_id': self.bank_statement_id,
            'transaction_date': self.transaction_date.isoformat() if self.transaction_date else None,
            'description': self.description,
            'amount': self.amount,
            'balance': self.balance,
            'reconciled': self.reconciled,
            'voucher_entry_id': self.voucher_entry_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

# 采购订单模型
class PurchaseOrder(db.Model):
    __tablename__ = 'purchase_orders'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    order_number = db.Column(db.String(20), nullable=False, unique=True)
    vendor_id = db.Column(db.Integer, db.ForeignKey('vendors.id'), nullable=False)
    order_date = db.Column(db.DateTime, nullable=False)
    description = db.Column(db.String(200))
    status = db.Column(db.String(20), default='pending')  # pending, approved, completed, cancelled
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 关联关系
    vendor = db.relationship('Vendor', backref='purchase_orders')
    items = db.relationship('PurchaseOrderItem', backref='purchase_order', cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'order_number': self.order_number,
            'vendor_id': self.vendor_id,
            'vendor': self.vendor.to_dict() if self.vendor else None,
            'order_date': self.order_date.isoformat() if self.order_date else None,
            'description': self.description,
            'status': self.status,
            'user_id': self.user_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'items': [item.to_dict() for item in self.items] if self.items else []
        }

# 采购订单项模型
class PurchaseOrderItem(db.Model):
    __tablename__ = 'purchase_order_items'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    purchase_order_id = db.Column(db.Integer, db.ForeignKey('purchase_orders.id'), nullable=False)
    product_name = db.Column(db.String(100), nullable=False)
    quantity = db.Column(db.Float, nullable=False, default=1.0)
    unit_price = db.Column(db.Float, nullable=False, default=0.0)
    account_id = db.Column(db.Integer, db.ForeignKey('accounts.id'))
    description = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 关联关系
    account = db.relationship('Account', backref='purchase_order_items')
    
    def to_dict(self):
        return {
            'id': self.id,
            'purchase_order_id': self.purchase_order_id,
            'product_name': self.product_name,
            'quantity': self.quantity,
            'unit_price': self.unit_price,
            'account_id': self.account_id,
            'account_name': self.account.name if self.account else None,
            'description': self.description,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

# 税务申报模型
class TaxDeclaration(db.Model):
    __tablename__ = 'tax_declarations'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    period = db.Column(db.String(20), nullable=False)  # 申报所属期，格式如：2025-12
    tax_type = db.Column(db.String(50), nullable=False)  # 税种，如：增值税、企业所得税、附加税
    taxable_income = db.Column(db.Float, default=0.0)  # 应税收入
    tax_rate = db.Column(db.Float, default=0.0)  # 税率（百分比）
    input_tax = db.Column(db.Float, default=0.0)  # 进项税额
    output_tax = db.Column(db.Float, default=0.0)  # 销项税额
    taxable_amount = db.Column(db.Float, default=0.0)  # 应纳税所得额
    deduction_amount = db.Column(db.Float, default=0.0)  # 减免税额
    tax_payable = db.Column(db.Float, default=0.0)  # 应纳税额
    status = db.Column(db.String(20), default='pending')  # pending, submitted, success, failed
    declaration_time = db.Column(db.DateTime)  # 申报时间
    receipt_number = db.Column(db.String(100))  # 税务系统回执号
    failure_reason = db.Column(db.String(500))  # 申报失败原因
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 关联关系
    user = db.relationship('User', backref='tax_declarations')
    
    def to_dict(self):
        return {
            'id': self.id,
            'period': self.period,
            'tax_type': self.tax_type,
            'taxable_income': self.taxable_income,
            'tax_rate': self.tax_rate,
            'input_tax': self.input_tax,
            'output_tax': self.output_tax,
            'taxable_amount': self.taxable_amount,
            'deduction_amount': self.deduction_amount,
            'tax_payable': self.tax_payable,
            'status': self.status,
            'declaration_time': self.declaration_time.isoformat() if self.declaration_time else None,
            'receipt_number': self.receipt_number,
            'failure_reason': self.failure_reason,
            'user_id': self.user_id,
            'user_name': self.user.username if self.user else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

# 应付账单模型
class Bill(db.Model):
    __tablename__ = 'bills'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    bill_no = db.Column(db.String(20), nullable=False, unique=True)  # 账单编号
    vendor_id = db.Column(db.Integer, db.ForeignKey('vendors.id'), nullable=False)  # 供应商ID
    purchase_order_id = db.Column(db.Integer, db.ForeignKey('purchase_orders.id'))  # 关联采购订单
    amount = db.Column(db.Float, nullable=False)  # 账单金额
    due_date = db.Column(db.Date, nullable=False)  # 到期日期
    status = db.Column(db.String(20), default='待核对')  # 待核对、已核对待付款、已支付
    description = db.Column(db.String(200))  # 描述
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 关联关系
    vendor = db.relationship('Vendor', backref='bills')
    purchase_order = db.relationship('PurchaseOrder', backref='bills')
    payments = db.relationship('Payment', backref='bill', cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'bill_no': self.bill_no,
            'vendor_id': self.vendor_id,
            'vendor_name': self.vendor.name if self.vendor else None,
            'purchase_order_id': self.purchase_order_id,
            'purchase_order_number': self.purchase_order.order_number if self.purchase_order else None,
            'amount': self.amount,
            'due_date': self.due_date.isoformat() if self.due_date else None,
            'status': self.status,
            'description': self.description,
            'user_id': self.user_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

# 付款记录模型
class Payment(db.Model):
    __tablename__ = 'payments'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    bill_id = db.Column(db.Integer, db.ForeignKey('bills.id'), nullable=True)  # 关联账单，可为空
    tax_declaration_id = db.Column(db.Integer, db.ForeignKey('tax_declarations.id'), nullable=True)  # 关联税务申报，可为空
    purchase_order_id = db.Column(db.Integer, db.ForeignKey('purchase_orders.id'), nullable=True)  # 关联采购订单，可为空
    voucher_id = db.Column(db.Integer, db.ForeignKey('vouchers.id'))  # 关联凭证
    payment_date = db.Column(db.DateTime, default=datetime.utcnow)  # 付款日期
    amount = db.Column(db.Float, nullable=False)  # 付款金额
    payment_method = db.Column(db.String(20), nullable=False)  # 付款方式
    bank_account_id = db.Column(db.Integer, db.ForeignKey('accounts.id'))  # 付款银行账户
    receipt_number = db.Column(db.String(100))  # 银行回执号
    status = db.Column(db.String(20), default='pending')  # pending, processing, success, failed
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 关联关系
    voucher = db.relationship('Voucher')
    bank_account = db.relationship('Account', backref='payments')
    tax_declaration = db.relationship('TaxDeclaration', backref='payments')
    purchase_order = db.relationship('PurchaseOrder', backref='payments')
    
    def to_dict(self):
        return {
            'id': self.id,
            'bill_id': self.bill_id,
            'bill_no': self.bill.bill_no if self.bill else None,
            'tax_declaration_id': self.tax_declaration_id,
            'tax_declaration_period': self.tax_declaration.period if self.tax_declaration else None,
            'tax_declaration_type': self.tax_declaration.tax_type if self.tax_declaration else None,
            'purchase_order_id': self.purchase_order_id,
            'purchase_order_number': self.purchase_order.order_number if self.purchase_order else None,
            'voucher_id': self.voucher_id,
            'voucher_no': self.voucher.voucher_no if self.voucher else None,
            'payment_date': self.payment_date.isoformat() if self.payment_date else None,
            'amount': self.amount,
            'payment_method': self.payment_method,
            'bank_account_id': self.bank_account_id,
            'bank_account_name': self.bank_account.name if self.bank_account else None,
            'receipt_number': self.receipt_number,
            'status': self.status,
            'user_id': self.user_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
