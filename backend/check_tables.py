from app import app
from models import db, BankStatement, BankStatementItem

with app.app_context():
    print('检查数据库表...')
    engine = db.engine
    inspector = db.inspect(engine)
    
    # 检查所有表
    all_tables = inspector.get_table_names()
    print(f'所有表: {all_tables}')
    
    # 检查银行对账相关表
    bank_statements_exists = 'bank_statements' in all_tables
    bank_statement_items_exists = 'bank_statement_items' in all_tables
    
    print(f'BankStatement表存在: {bank_statements_exists}')
    print(f'BankStatementItem表存在: {bank_statement_items_exists}')
    
    # 如果表不存在，尝试创建
    if not bank_statements_exists or not bank_statement_items_exists:
        print('创建缺失的表...')
        db.create_all()
        print('表创建完成！')
    
    # 再次检查
    all_tables = inspector.get_table_names()
    print(f'创建后所有表: {all_tables}')
