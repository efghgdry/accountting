from flask import Flask
from models import db, Payment
from config import Config

# 创建Flask应用
app = Flask(__name__)
app.config.from_object(Config)

# 初始化数据库
with app.app_context():
    # 检查并更新payments表结构
    db.init_app(app)
    
    # 获取数据库连接
    conn = db.engine.connect()
    
    # 检查payments表是否有tax_declaration_id字段
    inspector = db.inspect(db.engine)
    columns = [col['name'] for col in inspector.get_columns('payments')]
    
    print("Current payments table columns:", columns)
    
    # 如果缺少tax_declaration_id字段，添加它
    if 'tax_declaration_id' not in columns:
        conn.execute(db.text("ALTER TABLE payments ADD COLUMN tax_declaration_id INTEGER REFERENCES tax_declarations(id)"))
        print("Added tax_declaration_id column")
    
    # 如果缺少purchase_order_id字段，添加它
    if 'purchase_order_id' not in columns:
        conn.execute(db.text("ALTER TABLE payments ADD COLUMN purchase_order_id INTEGER REFERENCES purchase_orders(id)"))
        print("Added purchase_order_id column")
    
    # 提交更改
    conn.commit()
    conn.close()
    
    print("Database update completed successfully!")
