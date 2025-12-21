from flask import Blueprint, request, jsonify, session
from models import db, User, Account, Voucher, VoucherEntry, Vendor, BankStatement, BankStatementItem, PurchaseOrder, PurchaseOrderItem, TaxDeclaration, Bill, Payment
from datetime import datetime

# 创建蓝图
api_bp = Blueprint('api', __name__, url_prefix='/api')

# 用户相关路由
@api_bp.route('/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # 检查用户名是否已存在
    existing_user = User.query.filter_by(username=data['username']).first()
    if existing_user:
        return jsonify({'message': '用户名已存在'}), 400
    
    # 检查邮箱是否已存在
    if data.get('email'):
        existing_email = User.query.filter_by(email=data['email']).first()
        if existing_email:
            return jsonify({'message': '邮箱已存在'}), 400
    
    # 创建新用户
    new_user = User(
        username=data['username'],
        email=data.get('email'),
        full_name=data.get('full_name')
    )
    new_user.set_password(data['password'])
    
    db.session.add(new_user)
    db.session.commit()
    
    # 为新用户创建简单的科目结构
    simple_accounts = [
        # 资产类
        {'code': '1001', 'name': '库存现金', 'type': '资产', 'parent_id': None, 'description': '库存现金', 'balance': 0.0},
        {'code': '1002', 'name': '银行存款', 'type': '资产', 'parent_id': None, 'description': '银行存款', 'balance': 0.0},
        {'code': '1122', 'name': '应收账款', 'type': '资产', 'parent_id': None, 'description': '应收账款', 'balance': 0.0},
        {'code': '1221', 'name': '其他应收款', 'type': '资产', 'parent_id': None, 'description': '其他应收款', 'balance': 0.0},
        {'code': '1403', 'name': '原材料', 'type': '资产', 'parent_id': None, 'description': '原材料', 'balance': 0.0},
        {'code': '1405', 'name': '库存商品', 'type': '资产', 'parent_id': None, 'description': '库存商品', 'balance': 0.0},
        {'code': '1601', 'name': '固定资产', 'type': '资产', 'parent_id': None, 'description': '固定资产', 'balance': 0.0},
        {'code': '1602', 'name': '累计折旧', 'type': '资产', 'parent_id': None, 'description': '累计折旧', 'balance': 0.0},
        
        # 负债类
        {'code': '2001', 'name': '短期借款', 'type': '负债', 'parent_id': None, 'description': '短期借款', 'balance': 0.0},
        {'code': '2202', 'name': '应付账款', 'type': '负债', 'parent_id': None, 'description': '应付账款', 'balance': 0.0},
        {'code': '2211', 'name': '应付职工薪酬', 'type': '负债', 'parent_id': None, 'description': '应付职工薪酬', 'balance': 0.0},
        {'code': '2221', 'name': '应交税费', 'type': '负债', 'parent_id': None, 'description': '应交税费', 'balance': 0.0},
        {'code': '2241', 'name': '其他应付款', 'type': '负债', 'parent_id': None, 'description': '其他应付款', 'balance': 0.0},
        
        # 权益类
        {'code': '4001', 'name': '实收资本', 'type': '权益', 'parent_id': None, 'description': '实收资本', 'balance': 1000.0},
        {'code': '4101', 'name': '盈余公积', 'type': '权益', 'parent_id': None, 'description': '盈余公积', 'balance': 0.0},
        {'code': '4103', 'name': '本年利润', 'type': '权益', 'parent_id': None, 'description': '本年利润', 'balance': 0.0},
        {'code': '4104', 'name': '利润分配', 'type': '权益', 'parent_id': None, 'description': '利润分配', 'balance': 0.0},
        
        # 收入类
        {'code': '6001', 'name': '主营业务收入', 'type': '收入', 'parent_id': None, 'description': '主营业务收入', 'balance': 0.0},
        {'code': '6051', 'name': '其他业务收入', 'type': '收入', 'parent_id': None, 'description': '其他业务收入', 'balance': 0.0},
        {'code': '6111', 'name': '投资收益', 'type': '收入', 'parent_id': None, 'description': '投资收益', 'balance': 0.0},
        {'code': '6301', 'name': '营业外收入', 'type': '收入', 'parent_id': None, 'description': '营业外收入', 'balance': 0.0},
        
        # 费用类
        {'code': '6401', 'name': '主营业务成本', 'type': '费用', 'parent_id': None, 'description': '主营业务成本', 'balance': 0.0},
        {'code': '6402', 'name': '其他业务成本', 'type': '费用', 'parent_id': None, 'description': '其他业务成本', 'balance': 0.0},
        {'code': '6403', 'name': '税金及附加', 'type': '费用', 'parent_id': None, 'description': '税金及附加', 'balance': 0.0},
        {'code': '6601', 'name': '销售费用', 'type': '费用', 'parent_id': None, 'description': '销售费用', 'balance': 0.0},
        {'code': '6602', 'name': '管理费用', 'type': '费用', 'parent_id': None, 'description': '管理费用', 'balance': 0.0},
        {'code': '6603', 'name': '财务费用', 'type': '费用', 'parent_id': None, 'description': '财务费用', 'balance': 0.0},
        {'code': '6711', 'name': '营业外支出', 'type': '费用', 'parent_id': None, 'description': '营业外支出', 'balance': 0.0},
        {'code': '6801', 'name': '所得税费用', 'type': '费用', 'parent_id': None, 'description': '所得税费用', 'balance': 0.0}
    ]
    
    for account_data in simple_accounts:
        new_account = Account(
            code=account_data['code'],
            name=account_data['name'],
            type=account_data['type'],
            parent_id=account_data['parent_id'],
            description=account_data['description'],
            balance=account_data['balance'],
            user_id=new_user.id
        )
        db.session.add(new_account)
    
    db.session.commit()
    
    # 登录用户
    session['user_id'] = new_user.id
    
    return jsonify({
        'message': '注册成功',
        'user': new_user.to_dict()
    }), 201

@api_bp.route('/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    
    # 查找用户
    user = User.query.filter_by(username=data['username']).first()
    
    # 验证密码
    if user and user.check_password(data['password']):
        # 登录成功，设置session
        session['user_id'] = user.id
        return jsonify({
            'message': '登录成功',
            'user': user.to_dict()
        })
    else:
        return jsonify({'message': '用户名或密码错误'}), 401

@api_bp.route('/auth/logout', methods=['POST'])
def logout():
    # 清除session
    session.pop('user_id', None)
    return jsonify({'message': '退出登录成功'})

@api_bp.route('/auth/user', methods=['GET'])
def get_current_user():
    # 获取当前登录用户
    user_id = session.get('user_id')
    if user_id:
        user = User.query.get(user_id)
        if user:
            return jsonify(user.to_dict())
    return jsonify({'message': '未登录'}), 401

# 凭证相关路由
@api_bp.route('/vouchers', methods=['GET'])
def get_vouchers():
    # 获取当前用户
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'message': '未登录'}), 401
    
    vouchers = Voucher.query.filter_by(user_id=user_id).all()
    return jsonify([voucher.to_dict() for voucher in vouchers])

@api_bp.route('/vouchers/<int:id>', methods=['GET'])
def get_voucher(id):
    # 获取当前用户
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'message': '未登录'}), 401
    
    voucher = Voucher.query.filter_by(id=id, user_id=user_id).first_or_404()
    return jsonify(voucher.to_dict())

@api_bp.route('/vouchers', methods=['POST'])
def create_voucher():
    # 获取当前用户
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'message': '未登录'}), 401
    
    data = request.get_json()
    
    # 验证借贷平衡
    debit_total = sum(float(entry['amount']) for entry in data['entries'] if entry['direction'] == '借方')
    credit_total = sum(float(entry['amount']) for entry in data['entries'] if entry['direction'] == '贷方')
    
    if debit_total != credit_total:
        return jsonify({'message': '借贷不平衡，借方合计: {}, 贷方合计: {}'.format(debit_total, credit_total)}), 400
    
    # 生成凭证号
    now = datetime.now()
    voucher_no = now.strftime('%Y%m%d') + '-' + str(Voucher.query.count() + 1).zfill(4)
    
    new_voucher = Voucher(
        voucher_no=voucher_no,
        date=datetime.fromisoformat(data['date']),
        description=data['description'],
        status=data.get('status', '未审核'),
        user_id=user_id
    )
    db.session.add(new_voucher)
    db.session.commit()
    
    # 创建凭证分录，暂不更新账户余额（仅在过账时更新）
    for entry_data in data['entries']:
        new_entry = VoucherEntry(
            voucher_id=new_voucher.id,
            account_id=entry_data['account_id'],
            direction=entry_data['direction'],
            amount=float(entry_data['amount']),
            description=entry_data.get('description')
        )
        db.session.add(new_entry)
    
    db.session.commit()
    return jsonify(new_voucher.to_dict()), 201

@api_bp.route('/vouchers/<int:id>', methods=['PUT'])
def update_voucher(id):
    # 获取当前用户
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'message': '未登录'}), 401
    
    voucher = Voucher.query.filter_by(id=id, user_id=user_id).first_or_404()
    data = request.get_json()
    
    # 验证借贷平衡
    debit_total = sum(float(entry['amount']) for entry in data['entries'] if entry['direction'] == '借方')
    credit_total = sum(float(entry['amount']) for entry in data['entries'] if entry['direction'] == '贷方')
    
    if debit_total != credit_total:
        return jsonify({'message': '借贷不平衡，借方合计: {}, 贷方合计: {}'.format(debit_total, credit_total)}), 400
    
    # 只有已过账的凭证才需要恢复原余额
    if voucher.posted:
        # 恢复原凭证分录对账户余额的影响
        for entry in voucher.entries:
            account = Account.query.get(entry.account_id)
            # 根据科目类型调整余额恢复逻辑
            if account.type in ['资产', '费用']:
                # 资产和费用类：借方增加，贷方减少
                if entry.direction == '借方':
                    account.balance -= entry.amount
                else:
                    account.balance += entry.amount
            else:  # 负债、权益、收入类
                # 负债、权益、收入类：贷方增加，借方减少
                if entry.direction == '借方':
                    account.balance += entry.amount
                else:
                    account.balance -= entry.amount
    
    # 删除原凭证分录
    VoucherEntry.query.filter_by(voucher_id=id).delete()
    
    # 更新凭证基本信息
    voucher.date = datetime.fromisoformat(data['date'])
    voucher.description = data['description']
    voucher.status = data.get('status', '未审核')
    
    # 创建新的凭证分录（暂不更新余额，仅在过账时更新）
    for entry_data in data['entries']:
        new_entry = VoucherEntry(
            voucher_id=voucher.id,
            account_id=entry_data['account_id'],
            direction=entry_data['direction'],
            amount=float(entry_data['amount']),
            description=entry_data.get('description')
        )
        db.session.add(new_entry)
    
    db.session.commit()
    return jsonify(voucher.to_dict())

@api_bp.route('/vouchers/<int:id>', methods=['DELETE'])
def delete_voucher(id):
    # 获取当前用户
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'message': '未登录'}), 401
    
    voucher = Voucher.query.filter_by(id=id, user_id=user_id).first_or_404()
    
    # 只有已过账的凭证才需要恢复余额
    if voucher.posted:
        # 恢复账户余额
        for entry in voucher.entries:
            account = Account.query.get(entry.account_id)
            # 根据科目类型调整余额恢复逻辑
            if account.type in ['资产', '费用']:
                # 资产和费用类：借方增加，贷方减少
                if entry.direction == '借方':
                    account.balance -= entry.amount
                else:
                    account.balance += entry.amount
            else:  # 负债、权益、收入类
                # 负债、权益、收入类：贷方增加，借方减少
                if entry.direction == '借方':
                    account.balance += entry.amount
                else:
                    account.balance -= entry.amount
    
    db.session.delete(voucher)
    db.session.commit()
    return jsonify({'message': '凭证删除成功'})

# 凭证过账
@api_bp.route('/vouchers/<int:id>/post', methods=['POST'])
def post_voucher(id):
    # 获取当前用户
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'message': '未登录'}), 401
    
    voucher = Voucher.query.filter_by(id=id, user_id=user_id).first_or_404()
    
    # 只有未过账的凭证才能过账
    if voucher.posted:
        return jsonify({'message': '该凭证已过账，不能重复过账'}), 400
    
    # 更新账户余额
    for entry in voucher.entries:
        account = Account.query.get(entry.account_id)
        # 根据科目类型调整余额更新逻辑
        if account.type in ['资产', '费用']:
            # 资产和费用类：借方增加，贷方减少
            if entry.direction == '借方':
                account.balance += entry.amount
            else:
                account.balance -= entry.amount
        else:  # 负债、权益、收入类
            # 负债、权益、收入类：贷方增加，借方减少
            if entry.direction == '借方':
                account.balance -= entry.amount
            else:
                account.balance += entry.amount
    
    # 标记为已过账
    voucher.status = '已审核'
    voucher.posted = True
    voucher.posted_at = datetime.utcnow()
    voucher.updated_at = datetime.utcnow()
    
    db.session.commit()
    return jsonify({'message': '凭证过账成功', 'voucher': voucher.to_dict()})

# 取消凭证过账
@api_bp.route('/vouchers/<int:id>/unpost', methods=['POST'])
def unpost_voucher(id):
    # 获取当前用户
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'message': '未登录'}), 401
    
    voucher = Voucher.query.filter_by(id=id, user_id=user_id).first_or_404()
    
    # 只有已过账的凭证才能取消过账
    if not voucher.posted:
        return jsonify({'message': '只有已过账的凭证才能取消过账'}), 400
    
    # 恢复账户余额
    for entry in voucher.entries:
        account = Account.query.get(entry.account_id)
        # 根据科目类型调整余额恢复逻辑
        if account.type in ['资产', '费用']:
            # 资产和费用类：反向恢复
            if entry.direction == '借方':
                account.balance -= entry.amount  # 之前增加的现在减少
            else:
                account.balance += entry.amount  # 之前减少的现在增加
        else:  # 负债、权益、收入类
            # 负债、权益、收入类：反向恢复
            if entry.direction == '借方':
                account.balance += entry.amount  # 之前减少的现在增加
            else:
                account.balance -= entry.amount  # 之前增加的现在减少
    
    # 标记为未审核和未过账
    voucher.status = '未审核'
    voucher.posted = False
    voucher.posted_at = None
    voucher.updated_at = datetime.utcnow()
    
    db.session.commit()
    return jsonify({'message': '取消过账成功', 'voucher': voucher.to_dict()})

# 获取所有科目
@api_bp.route('/accounts', methods=['GET'])
def get_accounts():
    # 获取当前用户
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'message': '未登录'}), 401
    
    accounts = Account.query.filter_by(user_id=user_id).all()
    return jsonify([account.to_dict() for account in accounts])

# 获取单个科目
@api_bp.route('/accounts/<int:id>', methods=['GET'])
def get_account(id):
    # 获取当前用户
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'message': '未登录'}), 401
    
    account = Account.query.filter_by(id=id, user_id=user_id).first_or_404()
    return jsonify(account.to_dict())

# 创建科目
@api_bp.route('/accounts', methods=['POST'])
def create_account():
    # 获取当前用户
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'message': '未登录'}), 401
    
    data = request.get_json()
    
    # 处理科目编码：如果未提供，则自动生成
    code = data.get('code')
    if not code:
        # 自动生成科目编码
        account_type = data['type']
        
        # 根据科目类型设置前缀
        prefix_map = {
            '资产': '100',
            '负债': '200',
            '权益': '400',
            '收入': '600',
            '费用': '660'
        }
        
        prefix = prefix_map.get(account_type, '999')
        
        # 获取当前用户该类型科目的数量
        existing_accounts = Account.query.filter(
            Account.user_id == user_id,
            Account.type == account_type
        ).count()
        
        # 生成编码：前缀 + 3位数字（从001开始）
        code = f"{prefix}{str(existing_accounts + 1).zfill(3)}"
    
    new_account = Account(
        code=code,
        name=data['name'],
        type=data['type'],
        parent_id=data.get('parent_id'),
        description=data.get('description'),
        balance=data.get('balance', 0.0),
        user_id=user_id
    )
    db.session.add(new_account)
    db.session.commit()
    return jsonify(new_account.to_dict()), 201

# 更新科目
@api_bp.route('/accounts/<int:id>', methods=['PUT'])
def update_account(id):
    # 获取当前用户
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'message': '未登录'}), 401
    
    account = Account.query.filter_by(id=id, user_id=user_id).first_or_404()
    data = request.get_json()
    account.code = data.get('code', account.code)
    account.name = data.get('name', account.name)
    account.type = data.get('type', account.type)
    account.parent_id = data.get('parent_id', account.parent_id)
    account.description = data.get('description', account.description)
    account.balance = data.get('balance', account.balance)
    db.session.commit()
    return jsonify(account.to_dict())

# 删除科目
@api_bp.route('/accounts/<int:id>', methods=['DELETE'])
def delete_account(id):
    # 获取当前用户
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'message': '未登录'}), 401
    
    account = Account.query.filter_by(id=id, user_id=user_id).first_or_404()
    db.session.delete(account)
    db.session.commit()
    return jsonify({'message': '科目删除成功'})

# 供应商相关路由
@api_bp.route('/vendors', methods=['GET'])
def get_vendors():
    # 获取当前用户
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'message': '未登录'}), 401
    
    vendors = Vendor.query.filter_by(user_id=user_id).all()
    return jsonify([vendor.to_dict() for vendor in vendors])

@api_bp.route('/vendors/<int:id>', methods=['GET'])
def get_vendor(id):
    # 获取当前用户
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'message': '未登录'}), 401
    
    vendor = Vendor.query.filter_by(id=id, user_id=user_id).first_or_404()
    return jsonify(vendor.to_dict())

@api_bp.route('/vendors', methods=['POST'])
def create_vendor():
    # 获取当前用户
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'message': '未登录'}), 401
    
    data = request.get_json()
    new_vendor = Vendor(
        name=data['name'],
        contact=data.get('contact'),
        email=data.get('email'),
        phone=data.get('phone'),
        address=data.get('address'),
        description=data.get('description'),
        user_id=user_id
    )
    db.session.add(new_vendor)
    db.session.commit()
    return jsonify(new_vendor.to_dict()), 201

@api_bp.route('/vendors/<int:id>', methods=['PUT'])
def update_vendor(id):
    # 获取当前用户
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'message': '未登录'}), 401
    
    vendor = Vendor.query.filter_by(id=id, user_id=user_id).first_or_404()
    data = request.get_json()
    vendor.name = data.get('name', vendor.name)
    vendor.contact = data.get('contact', vendor.contact)
    vendor.email = data.get('email', vendor.email)
    vendor.phone = data.get('phone', vendor.phone)
    vendor.address = data.get('address', vendor.address)
    vendor.description = data.get('description', vendor.description)
    db.session.commit()
    return jsonify(vendor.to_dict())

@api_bp.route('/vendors/<int:id>', methods=['DELETE'])
def delete_vendor(id):
    # 获取当前用户
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'message': '未登录'}), 401
    
    vendor = Vendor.query.filter_by(id=id, user_id=user_id).first_or_404()
    db.session.delete(vendor)
    db.session.commit()
    return jsonify({'message': '供应商删除成功'})

# 银行对账相关路由
@api_bp.route('/bank-statements', methods=['GET'])
def get_bank_statements():
    # 获取当前用户
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'message': '未登录'}), 401
    
    statements = BankStatement.query.filter_by(user_id=user_id).all()
    return jsonify([statement.to_dict() for statement in statements])

@api_bp.route('/bank-statements/<int:id>', methods=['GET'])
def get_bank_statement(id):
    # 获取当前用户
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'message': '未登录'}), 401
    
    statement = BankStatement.query.filter_by(id=id, user_id=user_id).first_or_404()
    return jsonify(statement.to_dict())

@api_bp.route('/bank-statements', methods=['POST'])
def create_bank_statement():
    # 获取当前用户
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'message': '未登录'}), 401
    
    data = request.get_json()
    new_statement = BankStatement(
        account_id=data['account_id'],
        statement_date=datetime.strptime(data['statement_date'], '%Y-%m-%d').date(),
        opening_balance=data.get('opening_balance', 0.0),
        closing_balance=data['closing_balance'],
        status=data.get('status', '待对账'),
        user_id=user_id
    )
    
    db.session.add(new_statement)
    db.session.commit()
    return jsonify(new_statement.to_dict()), 201

@api_bp.route('/bank-statements/<int:id>', methods=['PUT'])
def update_bank_statement(id):
    # 获取当前用户
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'message': '未登录'}), 401
    
    statement = BankStatement.query.filter_by(id=id, user_id=user_id).first_or_404()
    data = request.get_json()
    
    statement.account_id = data.get('account_id', statement.account_id)
    statement.statement_date = datetime.strptime(data['statement_date'], '%Y-%m-%d').date() if data.get('statement_date') else statement.statement_date
    statement.opening_balance = data.get('opening_balance', statement.opening_balance)
    statement.closing_balance = data.get('closing_balance', statement.closing_balance)
    statement.status = data.get('status', statement.status)
    
    db.session.commit()
    return jsonify(statement.to_dict())

@api_bp.route('/bank-statements/<int:id>', methods=['DELETE'])
def delete_bank_statement(id):
    # 获取当前用户
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'message': '未登录'}), 401
    
    statement = BankStatement.query.filter_by(id=id, user_id=user_id).first_or_404()
    db.session.delete(statement)
    db.session.commit()
    return jsonify({'message': '银行对账单删除成功'})

# 添加银行对账单明细
@api_bp.route('/bank-statements/<int:statement_id>/items', methods=['POST'])
def add_bank_statement_item(statement_id):
    # 获取当前用户
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'message': '未登录'}), 401
    
    statement = BankStatement.query.filter_by(id=statement_id, user_id=user_id).first_or_404()
    data = request.get_json()
    
    new_item = BankStatementItem(
        bank_statement_id=statement_id,
        transaction_date=datetime.strptime(data['transaction_date'], '%Y-%m-%d').date(),
        description=data['description'],
        amount=data['amount'],
        balance=data['balance'],
        reconciled=data.get('reconciled', False)
    )
    
    db.session.add(new_item)
    db.session.commit()
    return jsonify(new_item.to_dict()), 201

# 批量添加银行对账单明细
@api_bp.route('/bank-statements/<int:statement_id>/items/batch', methods=['POST'])
def add_bank_statement_items_batch(statement_id):
    # 获取当前用户
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'message': '未登录'}), 401
    
    statement = BankStatement.query.filter_by(id=statement_id, user_id=user_id).first_or_404()
    data = request.get_json()
    
    items = data.get('items', [])
    new_items = []
    
    for item_data in items:
        new_item = BankStatementItem(
            bank_statement_id=statement_id,
            transaction_date=datetime.strptime(item_data['transaction_date'], '%Y-%m-%d').date(),
            description=item_data['description'],
            amount=item_data['amount'],
            balance=item_data['balance'],
            reconciled=item_data.get('reconciled', False)
        )
        new_items.append(new_item)
    
    db.session.add_all(new_items)
    db.session.commit()
    return jsonify([item.to_dict() for item in new_items]), 201

# 银行对账：关联凭证分录
@api_bp.route('/bank-statement-items/<int:item_id>/reconcile', methods=['POST'])
def reconcile_bank_statement_item(item_id):
    # 获取当前用户
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'message': '未登录'}), 401
    
    item = BankStatementItem.query.get(item_id)
    if not item or item.bank_statement.user_id != user_id:
        return jsonify({'message': '银行对账单明细不存在'}), 404
    
    data = request.get_json()
    voucher_entry_id = data.get('voucher_entry_id')
    
    # 验证凭证分录是否属于当前用户
    if voucher_entry_id:
        voucher_entry = VoucherEntry.query.get(voucher_entry_id)
        if not voucher_entry or voucher_entry.voucher.user_id != user_id:
            return jsonify({'message': '凭证分录不存在'}), 404
        
        item.voucher_entry_id = voucher_entry_id
        item.reconciled = True
    else:
        # 取消对账
        item.voucher_entry_id = None
        item.reconciled = False
    
    # 更新银行对账单状态：根据对账进度更新状态
    bank_statement = item.bank_statement
    all_reconciled = all(item.reconciled for item in bank_statement.items)
    any_reconciled = any(item.reconciled for item in bank_statement.items)
    
    if all_reconciled:
        bank_statement.status = '已完成'  # 所有明细都已对账，更新为已完成
    elif any_reconciled:
        bank_statement.status = '已对账'  # 部分明细已对账，更新为已对账
    else:
        bank_statement.status = '待对账'  # 没有明细已对账，保持待对账状态
    
    db.session.commit()
    return jsonify(item.to_dict())

# 获取待对账的凭证分录
@api_bp.route('/unreconciled-voucher-entries', methods=['GET'])
def get_unreconciled_voucher_entries():
    # 获取当前用户
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'message': '未登录'}), 401
    
    # 获取用户的银行科目
    bank_accounts = Account.query.filter(
        Account.user_id == user_id,
        Account.type == '资产',
        (Account.name.contains('银行') | Account.code.startswith('1002'))
    ).all()
    
    bank_account_ids = [account.id for account in bank_accounts]
    
    # 获取这些科目的未对账凭证分录
    unreconciled_entries = VoucherEntry.query.join(Voucher).filter(
        Voucher.user_id == user_id,
        VoucherEntry.account_id.in_(bank_account_ids),
        ~VoucherEntry.id.in_(db.session.query(BankStatementItem.voucher_entry_id).filter(BankStatementItem.reconciled == True).subquery())
    ).all()
    
    return jsonify([{
        'id': entry.id,
        'voucher_no': entry.voucher.voucher_no,
        'date': entry.voucher.date.isoformat() if entry.voucher.date else None,
        'account_id': entry.account_id,
        'account_name': entry.account.name if entry.account else None,
        'description': entry.description,
        'amount': entry.amount,
        'direction': entry.direction
    } for entry in unreconciled_entries])

# 财务报表相关路由
@api_bp.route('/reports/balance_sheet', methods=['GET'])
def get_balance_sheet():
    # 获取当前用户
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'message': '未登录'}), 401
    
    # 资产负债表：资产 = 负债 + 所有者权益
    assets = Account.query.filter_by(type='资产', user_id=user_id).all()
    liabilities = Account.query.filter_by(type='负债', user_id=user_id).all()
    equities = Account.query.filter_by(type='权益', user_id=user_id).all()
    
    return jsonify({
        'assets': [{'code': a.code, 'name': a.name, 'balance': a.balance} for a in assets],
        'liabilities': [{'code': l.code, 'name': l.name, 'balance': l.balance} for l in liabilities],
        'equities': [{'code': e.code, 'name': e.name, 'balance': e.balance} for e in equities],
        'total_assets': sum(a.balance for a in assets),
        'total_liabilities': sum(l.balance for l in liabilities),
        'total_equities': sum(e.balance for e in equities)
    })

@api_bp.route('/reports/income_statement', methods=['GET'])
def get_income_statement():
    # 获取当前用户
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'message': '未登录'}), 401
    
    # 利润表：收入 - 费用 = 利润
    incomes = Account.query.filter_by(type='收入', user_id=user_id).all()
    expenses = Account.query.filter_by(type='费用', user_id=user_id).all()
    
    total_income = sum(i.balance for i in incomes)
    total_expense = sum(e.balance for e in expenses)
    profit = total_income - total_expense
    
    return jsonify({
        'incomes': [{'code': i.code, 'name': i.name, 'balance': i.balance} for i in incomes],
        'expenses': [{'code': e.code, 'name': e.name, 'balance': e.balance} for e in expenses],
        'total_income': total_income,
        'total_expense': total_expense,
        'profit': profit
    })

@api_bp.route('/reports/cash_flow', methods=['GET'])
def get_cash_flow():
    # 获取当前用户
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'message': '未登录'}), 401
    
    # 现金流量表：简化版，只考虑现金相关科目
    cash_accounts = Account.query.filter(Account.code.in_(['1001', '1002']), Account.user_id == user_id).all()
    
    return jsonify({
        'cash_accounts': [{'code': c.code, 'name': c.name, 'balance': c.balance} for c in cash_accounts],
        'total_cash': sum(c.balance for c in cash_accounts)
    })

# 获取仪表盘数据
@api_bp.route('/dashboard', methods=['GET'])
def get_dashboard_data():
    # 获取当前用户
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'message': '未登录'}), 401
    
    # 获取用户总数
    total_users = User.query.count()
    
    # 计算本月收入和支出
    now = datetime.now()
    month_start = datetime(now.year, now.month, 1)
    
    # 获取本月凭证
    vouchers = Voucher.query.filter(
        Voucher.user_id == user_id,
        Voucher.date >= month_start
    ).all()
    
    monthly_income = 0.0
    monthly_expense = 0.0
    
    for voucher in vouchers:
        for entry in voucher.entries:
            account = Account.query.get(entry.account_id)
            # 确保科目存在才进行后续操作
            if account:
                if account.type == '收入' and entry.direction == '贷方':
                    monthly_income += entry.amount
                elif account.type == '费用' and entry.direction == '借方':
                    monthly_expense += entry.amount
    
    monthly_balance = monthly_income - monthly_expense
    
    # 获取总资产、总负债、总权益
    assets = Account.query.filter_by(type='资产', user_id=user_id).all()
    liabilities = Account.query.filter_by(type='负债', user_id=user_id).all()
    equities = Account.query.filter_by(type='权益', user_id=user_id).all()
    
    total_assets = sum(a.balance for a in assets)
    total_liabilities = sum(l.balance for l in liabilities)
    total_equities = sum(e.balance for e in equities)
    
    # 获取当前用户的实际数据
    # 科目数量
    total_accounts = Account.query.filter_by(user_id=user_id).count()
    
    # 本月凭证数量
    monthly_vouchers = Voucher.query.filter(
        Voucher.user_id == user_id,
        Voucher.date >= month_start
    ).count()
    
    # 供应商数量
    total_vendors = Vendor.query.filter_by(user_id=user_id).count()
    
    return jsonify({
        'total_users': total_users,
        'monthly_income': monthly_income,
        'monthly_expense': monthly_expense,
        'monthly_balance': monthly_balance,
        'total_assets': total_assets,
        'total_liabilities': total_liabilities,
        'total_equities': total_equities,
        'total_accounts': total_accounts,
        'monthly_vouchers': monthly_vouchers,
        'total_vendors': total_vendors
    })

# 采购订单相关路由
@api_bp.route('/purchase-orders', methods=['GET'])
def get_purchase_orders():
    # 获取当前用户
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'message': '未登录'}), 401
    
    purchase_orders = PurchaseOrder.query.filter_by(user_id=user_id).all()
    return jsonify([order.to_dict() for order in purchase_orders])

@api_bp.route('/purchase-orders/<int:id>', methods=['GET'])
def get_purchase_order(id):
    # 获取当前用户
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'message': '未登录'}), 401
    
    purchase_order = PurchaseOrder.query.filter_by(id=id, user_id=user_id).first_or_404()
    return jsonify(purchase_order.to_dict())

@api_bp.route('/purchase-orders', methods=['POST'])
def create_purchase_order():
    # 获取当前用户
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'message': '未登录'}), 401
    
    data = request.get_json()
    
    # 生成订单编号
    now = datetime.now()
    order_no = now.strftime('%Y%m%d') + '-' + str(PurchaseOrder.query.count() + 1).zfill(4)
    
    new_order = PurchaseOrder(
        order_number=order_no,
        vendor_id=data['vendor_id'],
        order_date=datetime.fromisoformat(data['order_date']),
        description=data.get('description'),
        status=data.get('status', 'pending'),
        user_id=user_id
    )
    db.session.add(new_order)
    db.session.commit()
    
    # 创建采购订单项
    if 'items' in data:
        for item_data in data['items']:
            new_item = PurchaseOrderItem(
                purchase_order_id=new_order.id,
                product_name=item_data['product_name'],
                quantity=float(item_data['quantity']),
                unit_price=float(item_data['unit_price']),
                account_id=item_data.get('account_id'),
                description=item_data.get('description')
            )
            db.session.add(new_item)
    
    db.session.commit()
    return jsonify(new_order.to_dict()), 201

@api_bp.route('/purchase-orders/<int:id>', methods=['PUT'])
def update_purchase_order(id):
    # 获取当前用户
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'message': '未登录'}), 401
    
    purchase_order = PurchaseOrder.query.filter_by(id=id, user_id=user_id).first_or_404()
    data = request.get_json()
    
    # 更新采购订单基本信息
    purchase_order.vendor_id = data.get('vendor_id', purchase_order.vendor_id)
    purchase_order.order_date = datetime.fromisoformat(data['order_date']) if data.get('order_date') else purchase_order.order_date
    purchase_order.description = data.get('description', purchase_order.description)
    purchase_order.status = data.get('status', purchase_order.status)
    
    # 删除原采购订单项
    PurchaseOrderItem.query.filter_by(purchase_order_id=id).delete()
    
    # 创建新的采购订单项
    if 'items' in data:
        for item_data in data['items']:
            new_item = PurchaseOrderItem(
                purchase_order_id=purchase_order.id,
                product_name=item_data['product_name'],
                quantity=float(item_data['quantity']),
                unit_price=float(item_data['unit_price']),
                account_id=item_data.get('account_id'),
                description=item_data.get('description')
            )
            db.session.add(new_item)
    
    db.session.commit()
    return jsonify(purchase_order.to_dict())

@api_bp.route('/purchase-orders/<int:id>', methods=['DELETE'])
def delete_purchase_order(id):
    # 获取当前用户
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'message': '未登录'}), 401
    
    purchase_order = PurchaseOrder.query.filter_by(id=id, user_id=user_id).first_or_404()
    db.session.delete(purchase_order)
    db.session.commit()
    return jsonify({'message': '采购订单删除成功'})

# 税务申报相关路由
@api_bp.route('/tax-declarations', methods=['GET'])
def get_tax_declarations():
    # 获取当前用户
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'message': '未登录'}), 401
    
    declarations = TaxDeclaration.query.filter_by(user_id=user_id).all()
    return jsonify([declaration.to_dict() for declaration in declarations])

@api_bp.route('/tax-declarations/<int:id>', methods=['GET'])
def get_tax_declaration(id):
    # 获取当前用户
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'message': '未登录'}), 401
    
    declaration = TaxDeclaration.query.filter_by(id=id, user_id=user_id).first_or_404()
    return jsonify(declaration.to_dict())

@api_bp.route('/tax-declarations', methods=['POST'])
def create_tax_declaration():
    # 获取当前用户
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'message': '未登录'}), 401
    
    data = request.get_json()
    
    new_declaration = TaxDeclaration(
        period=data['period'],
        tax_type=data['tax_type'],
        taxable_income=float(data.get('taxable_income', 0.0)),
        tax_rate=float(data.get('tax_rate', 0.0)),
        input_tax=float(data.get('input_tax', 0.0)),
        output_tax=float(data.get('output_tax', 0.0)),
        taxable_amount=float(data.get('taxable_amount', 0.0)),
        deduction_amount=float(data.get('deduction_amount', 0.0)),
        tax_payable=float(data.get('tax_payable', 0.0)),
        status=data.get('status', 'pending'),
        user_id=user_id
    )
    db.session.add(new_declaration)
    db.session.commit()
    return jsonify(new_declaration.to_dict()), 201

@api_bp.route('/tax-declarations/<int:id>', methods=['PUT'])
def update_tax_declaration(id):
    # 获取当前用户
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'message': '未登录'}), 401
    
    declaration = TaxDeclaration.query.filter_by(id=id, user_id=user_id).first_or_404()
    data = request.get_json()
    
    declaration.period = data.get('period', declaration.period)
    declaration.tax_type = data.get('tax_type', declaration.tax_type)
    declaration.taxable_income = float(data.get('taxable_income', declaration.taxable_income))
    declaration.tax_rate = float(data.get('tax_rate', declaration.tax_rate))
    declaration.input_tax = float(data.get('input_tax', declaration.input_tax))
    declaration.output_tax = float(data.get('output_tax', declaration.output_tax))
    declaration.taxable_amount = float(data.get('taxable_amount', declaration.taxable_amount))
    declaration.deduction_amount = float(data.get('deduction_amount', declaration.deduction_amount))
    declaration.tax_payable = float(data.get('tax_payable', declaration.tax_payable))
    declaration.status = data.get('status', declaration.status)
    declaration.declaration_time = datetime.fromisoformat(data['declaration_time']) if data.get('declaration_time') else declaration.declaration_time
    declaration.receipt_number = data.get('receipt_number', declaration.receipt_number)
    declaration.failure_reason = data.get('failure_reason', declaration.failure_reason)
    
    db.session.commit()
    return jsonify(declaration.to_dict())

@api_bp.route('/tax-declarations/<int:id>', methods=['DELETE'])
def delete_tax_declaration(id):
    # 获取当前用户
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'message': '未登录'}), 401
    
    declaration = TaxDeclaration.query.filter_by(id=id, user_id=user_id).first_or_404()
    db.session.delete(declaration)
    db.session.commit()
    return jsonify({'message': '税务申报删除成功'})

# 计算税款
@api_bp.route('/tax-declarations/calculate', methods=['POST'])
def calculate_tax():
    # 获取当前用户
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'message': '未登录'}), 401
    
    data = request.get_json()
    period = data['period']
    tax_type = data['tax_type']
    
    # 模拟税款计算逻辑
    # 实际应用中，这里应该根据财务数据进行复杂计算
    calculation_result = {
        'period': period,
        'tax_type': tax_type,
        'taxable_income': 1000000.00,
        'input_tax': 80000.00,
        'output_tax': 130000.00,
        'taxable_amount': 500000.00,
        'deduction_amount': 50000.00,
        'tax_payable': 95000.00  # 示例计算结果
    }
    
    return jsonify(calculation_result)

# 提交税务申报
@api_bp.route('/tax-declarations/<int:id>/submit', methods=['POST'])
def submit_tax_declaration(id):
    # 获取当前用户
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'message': '未登录'}), 401
    
    declaration = TaxDeclaration.query.filter_by(id=id, user_id=user_id).first_or_404()
    
    # 模拟提交到税务系统的逻辑
    # 实际应用中，这里应该连接到真实的税务系统API
    try:
        # 模拟税务系统返回成功
        declaration.status = 'success'
        declaration.declaration_time = datetime.utcnow()
        declaration.receipt_number = f"TAX-{datetime.now().strftime('%Y%m%d%H%M%S')}-{id}"
        declaration.failure_reason = None
        
        db.session.commit()
        return jsonify({
            'message': '税务申报成功',
            'declaration': declaration.to_dict()
        })
    except Exception as e:
        # 模拟税务系统返回失败
        declaration.status = 'failed'
        declaration.failure_reason = str(e)
        
        db.session.commit()
        return jsonify({
            'message': '税务申报失败',
            'declaration': declaration.to_dict()
        }), 500

# 付款管理相关路由

# 获取待付款记录列表（包括账单、税务申报、采购订单）
@api_bp.route('/bills/awaiting-payment', methods=['GET'])
def get_awaiting_payment_bills():
    # 获取当前用户
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'message': '未登录'}), 401
    
    # 查询状态为"已核对待付款"的账单
    bills = Bill.query.filter_by(user_id=user_id, status='已核对待付款').all()
    
    # 查询状态为"success"的税务申报（需要付款）
    tax_declarations = TaxDeclaration.query.filter_by(user_id=user_id, status='success').all()
    
    # 查询状态为"approved"的采购订单（需要付款）
    purchase_orders = PurchaseOrder.query.filter_by(user_id=user_id, status='approved').all()
    
    # 组合所有待付款记录
    all_payments = []
    
    # 添加账单记录
    for bill in bills:
        bill_dict = bill.to_dict()
        bill_dict['type'] = 'bill'  # 添加类型标识
        all_payments.append(bill_dict)
    
    # 添加税务申报记录
    for tax in tax_declarations:
        tax_dict = tax.to_dict()
        tax_dict['type'] = 'tax'  # 添加类型标识
        tax_dict['vendor_name'] = '税务部门'  # 税务部门作为供应商
        tax_dict['due_date'] = datetime.now().date().isoformat()  # 默认为当前日期
        all_payments.append(tax_dict)
    
    # 添加采购订单记录
    for po in purchase_orders:
        po_dict = po.to_dict()
        po_dict['type'] = 'purchase_order'  # 添加类型标识
        po_dict['vendor_name'] = po.vendor.name if po.vendor else '未知供应商'
        po_dict['amount'] = sum(item.quantity * item.unit_price for item in po.items) if po.items else 0.0  # 计算订单总金额
        po_dict['due_date'] = datetime.now().date().isoformat()  # 默认为当前日期
        all_payments.append(po_dict)
    
    return jsonify(all_payments)

# 执行付款
@api_bp.route('/payments/execute', methods=['POST'])
def execute_payment():
    # 获取当前用户
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'message': '未登录'}), 401
    
    data = request.get_json()
    bill_ids = data.get('bill_ids', [])
    tax_ids = data.get('tax_ids', [])
    purchase_order_ids = data.get('purchase_order_ids', [])
    payment_method = data.get('payment_method', '银企直连')
    bank_account_id = data.get('bank_account_id')
    
    # 检查是否选择了任何付款记录
    if not bill_ids and not tax_ids and not purchase_order_ids:
        return jsonify({'message': '请选择要支付的记录'}), 400
    
    if not bank_account_id:
        return jsonify({'message': '请选择付款银行账户'}), 400
    
    # 检查银行账户是否存在且属于当前用户
    bank_account = Account.query.filter_by(id=bank_account_id, user_id=user_id).first()
    if not bank_account:
        return jsonify({'message': '银行账户不存在'}), 404
    
    # 获取所有要支付的记录
    bills = []
    taxes = []
    purchase_orders = []
    
    total_amount = 0.0
    
    # 处理账单记录
    if bill_ids:
        bills = Bill.query.filter(Bill.id.in_(bill_ids), Bill.user_id == user_id).all()
        if len(bills) != len(bill_ids):
            return jsonify({'message': '部分账单不存在或无权限访问'}), 400
        total_amount += sum(bill.amount for bill in bills)
    
    # 处理税务申报记录
    if tax_ids:
        taxes = TaxDeclaration.query.filter(TaxDeclaration.id.in_(tax_ids), TaxDeclaration.user_id == user_id).all()
        if len(taxes) != len(tax_ids):
            return jsonify({'message': '部分税务申报不存在或无权限访问'}), 400
        total_amount += sum(tax.tax_payable for tax in taxes)
    
    # 处理采购订单记录
    if purchase_order_ids:
        purchase_orders = PurchaseOrder.query.filter(PurchaseOrder.id.in_(purchase_order_ids), PurchaseOrder.user_id == user_id).all()
        if len(purchase_orders) != len(purchase_order_ids):
            return jsonify({'message': '部分采购订单不存在或无权限访问'}), 400
        for po in purchase_orders:
            po_amount = sum(item.quantity * item.unit_price for item in po.items) if po.items else 0.0
            total_amount += po_amount
    
    # 检查银行账户余额是否充足
    if bank_account.balance < total_amount:
        return jsonify({'message': '银行账户余额不足'}), 400
    
    try:
        # 模拟银企直连调用，这里应该调用真实的银行API
        # 假设调用成功
        receipt_number = f"PAY-{datetime.now().strftime('%Y%m%d%H%M%S')}-{user_id}"
        
        # 开始事务
        
        # 1. 处理账单付款
        for bill in bills:
            # 创建付款记录
            # 使用text()函数包装SQL语句，符合SQLAlchemy要求
            db.session.execute(
                db.text("INSERT INTO payments (bill_id, amount, payment_method, bank_account_id, receipt_number, status, user_id, payment_date, created_at, updated_at) "
                "VALUES (:bill_id, :amount, :method, :bank_id, :receipt, :status, :user_id, :date, :created, :updated)"),
                {
                    'bill_id': bill.id,
                    'amount': bill.amount,
                    'method': payment_method,
                    'bank_id': bank_account_id,
                    'receipt': receipt_number,
                    'status': 'success',
                    'user_id': user_id,
                    'date': datetime.utcnow(),
                    'created': datetime.utcnow(),
                    'updated': datetime.utcnow()
                }
            )
            
            # 更新账单状态为已支付
            bill.status = '已支付'
            
            # 生成付款凭证（借：应付账款，贷：银行存款）
            # 生成凭证号
            voucher_no = datetime.now().strftime('%Y%m%d') + '-' + str(Voucher.query.count() + 1).zfill(4)
            
            # 安全获取供应商名称
            vendor_name = bill.vendor.name if bill.vendor else '未知供应商'
            
            # 创建凭证
            voucher = Voucher(
                voucher_no=voucher_no,
                date=datetime.utcnow(),
                description=f'支付{vendor_name}账单 {bill.bill_no}',
                status='已审核',
                posted=True,
                posted_at=datetime.utcnow(),
                user_id=user_id
            )
            db.session.add(voucher)
            db.session.flush()  # 获取voucher.id
            
            # 查找应付账款科目
            accounts_payable = Account.query.filter(
                Account.user_id == user_id,
                Account.code.startswith('2202')
            ).first()
            
            if not accounts_payable:
                # 如果没有应付账款科目，创建一个
                accounts_payable = Account(
                    code='2202',
                    name='应付账款',
                    type='负债',
                    parent_id=None,
                    description='应付账款',
                    balance=0.0,
                    user_id=user_id
                )
                db.session.add(accounts_payable)
                db.session.flush()
            
            # 创建凭证分录
            # 借：应付账款
            debit_entry = VoucherEntry(
                voucher_id=voucher.id,
                account_id=accounts_payable.id,
                direction='借方',
                amount=bill.amount,
                description=f'支付{vendor_name}账单'
            )
            db.session.add(debit_entry)
            
            # 贷：银行存款
            credit_entry = VoucherEntry(
                voucher_id=voucher.id,
                account_id=bank_account_id,
                direction='贷方',
                amount=bill.amount,
                description=f'从{bank_account.name}支付'
            )
            db.session.add(credit_entry)
            
            # 关联凭证到付款记录 - 注释掉，因为直接使用SQL插入
            
            # 更新银行账户余额
            bank_account.balance -= bill.amount
            
            # 更新应付账款科目余额
            accounts_payable.balance -= bill.amount
        
        # 2. 处理税务申报付款
        for tax in taxes:
            # 创建付款记录
            # 使用text()函数包装SQL语句，符合SQLAlchemy要求
            db.session.execute(
                db.text("INSERT INTO payments (tax_declaration_id, amount, payment_method, bank_account_id, receipt_number, status, user_id, payment_date, created_at, updated_at) "
                "VALUES (:tax_id, :amount, :method, :bank_id, :receipt, :status, :user_id, :date, :created, :updated)"),
                {
                    'tax_id': tax.id,
                    'amount': tax.tax_payable,
                    'method': payment_method,
                    'bank_id': bank_account_id,
                    'receipt': receipt_number,
                    'status': 'success',
                    'user_id': user_id,
                    'date': datetime.utcnow(),
                    'created': datetime.utcnow(),
                    'updated': datetime.utcnow()
                }
            )
            
            # 更新税务申报状态为已支付
            tax.status = 'paid'
            
            # 生成付款凭证（借：应交税费，贷：银行存款）
            # 生成凭证号
            voucher_no = datetime.now().strftime('%Y%m%d') + '-' + str(Voucher.query.count() + 1).zfill(4)
            
            # 创建凭证
            voucher = Voucher(
                voucher_no=voucher_no,
                date=datetime.utcnow(),
                description=f'支付{tax.tax_type}（所属期：{tax.period}）',
                status='已审核',
                posted=True,
                posted_at=datetime.utcnow(),
                user_id=user_id
            )
            db.session.add(voucher)
            db.session.flush()  # 获取voucher.id
            
            # 查找应交税费科目
            tax_payable_account = Account.query.filter(
                Account.user_id == user_id,
                Account.code.startswith('2221')
            ).first()
            
            if not tax_payable_account:
                # 如果没有应交税费科目，创建一个
                tax_payable_account = Account(
                    code='2221',
                    name='应交税费',
                    type='负债',
                    parent_id=None,
                    description='应交税费',
                    balance=0.0,
                    user_id=user_id
                )
                db.session.add(tax_payable_account)
                db.session.flush()
            
            # 创建凭证分录
            # 借：应交税费
            debit_entry = VoucherEntry(
                voucher_id=voucher.id,
                account_id=tax_payable_account.id,
                direction='借方',
                amount=tax.tax_payable,
                description=f'支付{tax.tax_type}（所属期：{tax.period}）'
            )
            db.session.add(debit_entry)
            
            # 贷：银行存款
            credit_entry = VoucherEntry(
                voucher_id=voucher.id,
                account_id=bank_account_id,
                direction='贷方',
                amount=tax.tax_payable,
                description=f'从{bank_account.name}支付'
            )
            db.session.add(credit_entry)
            
            # 关联凭证到付款记录 - 注释掉，因为直接使用SQL插入
            
            # 更新银行账户余额
            bank_account.balance -= tax.tax_payable
            
            # 更新应交税费科目余额
            tax_payable_account.balance -= tax.tax_payable
        
        # 3. 处理采购订单付款
        for po in purchase_orders:
            # 计算采购订单总金额
            po_amount = sum(item.quantity * item.unit_price for item in po.items) if po.items else 0.0
            
            # 创建付款记录
            # 使用text()函数包装SQL语句，符合SQLAlchemy要求
            db.session.execute(
                db.text("INSERT INTO payments (purchase_order_id, amount, payment_method, bank_account_id, receipt_number, status, user_id, payment_date, created_at, updated_at) "
                "VALUES (:po_id, :amount, :method, :bank_id, :receipt, :status, :user_id, :date, :created, :updated)"),
                {
                    'po_id': po.id,
                    'amount': po_amount,
                    'method': payment_method,
                    'bank_id': bank_account_id,
                    'receipt': receipt_number,
                    'status': 'success',
                    'user_id': user_id,
                    'date': datetime.utcnow(),
                    'created': datetime.utcnow(),
                    'updated': datetime.utcnow()
                }
            )
            
            # 更新采购订单状态为已完成
            po.status = 'completed'
            
            # 生成付款凭证（借：应付账款，贷：银行存款）
            # 生成凭证号
            voucher_no = datetime.now().strftime('%Y%m%d') + '-' + str(Voucher.query.count() + 1).zfill(4)
            
            # 安全获取供应商名称
            vendor_name = po.vendor.name if po.vendor else '未知供应商'
            
            # 创建凭证
            voucher = Voucher(
                voucher_no=voucher_no,
                date=datetime.utcnow(),
                description=f'支付{vendor_name}采购订单 {po.order_number}',
                status='已审核',
                posted=True,
                posted_at=datetime.utcnow(),
                user_id=user_id
            )
            db.session.add(voucher)
            db.session.flush()  # 获取voucher.id
            
            # 查找应付账款科目
            accounts_payable = Account.query.filter(
                Account.user_id == user_id,
                Account.code.startswith('2202')
            ).first()
            
            if not accounts_payable:
                # 如果没有应付账款科目，创建一个
                accounts_payable = Account(
                    code='2202',
                    name='应付账款',
                    type='负债',
                    parent_id=None,
                    description='应付账款',
                    balance=0.0,
                    user_id=user_id
                )
                db.session.add(accounts_payable)
                db.session.flush()
            
            # 创建凭证分录
            # 借：应付账款
            debit_entry = VoucherEntry(
                voucher_id=voucher.id,
                account_id=accounts_payable.id,
                direction='借方',
                amount=po_amount,
                description=f'支付{vendor_name}采购订单'
            )
            db.session.add(debit_entry)
            
            # 贷：银行存款
            credit_entry = VoucherEntry(
                voucher_id=voucher.id,
                account_id=bank_account_id,
                direction='贷方',
                amount=po_amount,
                description=f'从{bank_account.name}支付'
            )
            db.session.add(credit_entry)
            
            # 关联凭证到付款记录 - 注释掉，因为直接使用SQL插入
            
            # 更新银行账户余额
            bank_account.balance -= po_amount
            
            # 更新应付账款科目余额
            accounts_payable.balance -= po_amount
        
        # 提交事务
        db.session.commit()
        
        # 准备返回结果
        result = {
            'message': '付款成功',
            'total_amount': total_amount,
            'receipt_number': receipt_number
        }
        
        # 添加各类型付款记录到结果
        if bills:
            result['bills'] = [bill.to_dict() for bill in bills]
        if taxes:
            result['tax_declarations'] = [tax.to_dict() for tax in taxes]
        if purchase_orders:
            result['purchase_orders'] = [po.to_dict() for po in purchase_orders]
        
        return jsonify(result)
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'付款失败: {str(e)}'}), 500

# 获取银行账户列表（用于付款选择）
@api_bp.route('/accounts/bank', methods=['GET'])
def get_bank_accounts():
    # 获取当前用户
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'message': '未登录'}), 401
    
    # 查询资产类且名称包含银行的账户
    bank_accounts = Account.query.filter(
        Account.user_id == user_id,
        Account.type == '资产',
        (Account.name.contains('银行') | Account.code.startswith('1002'))
    ).all()
    
    return jsonify([account.to_dict() for account in bank_accounts])
