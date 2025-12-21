from app import app
from models import db, Bill, Payment

with app.app_context():
    print('Creating new tables...')
    # 创建所有尚未存在的表
    db.create_all()
    print('Tables created successfully!')
    
    # 显示所有表
    print('\nAll tables in the database:')
    for table in db.metadata.tables.keys():
        print(f'- {table}')
    
    print('\nOperation completed!')