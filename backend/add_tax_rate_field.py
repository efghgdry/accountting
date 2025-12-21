from app import app
from models import db

with app.app_context():
    print('检查并添加tax_rate字段...')
    
    # 获取数据库连接
    conn = db.engine.connect()
    
    # 检查表是否存在
    inspector = db.inspect(db.engine)
    tables = inspector.get_table_names()
    
    if 'tax_declarations' in tables:
        # 检查tax_rate字段是否存在
        columns = [col['name'] for col in inspector.get_columns('tax_declarations')]
        
        if 'tax_rate' not in columns:
            # 添加tax_rate字段
            conn.execute(db.text('ALTER TABLE tax_declarations ADD COLUMN tax_rate FLOAT DEFAULT 0.0'))
            print('成功添加tax_rate字段到tax_declarations表')
        else:
            print('tax_rate字段已经存在')
    else:
        print('tax_declarations表不存在，将创建所有表')
        db.create_all()
    
    conn.close()
    print('操作完成!')