from models import db, User
from app import app

with app.app_context():
    # 检查用户表是否存在
    print("检查用户表...")
    users = User.query.all()
    print(f"找到 {len(users)} 个用户")
    
    for user in users:
        print(f"用户ID: {user.id}, 用户名: {user.username}, 邮箱: {user.email}")
    
    # 检查数据库中的所有表
    print("\n数据库中的所有表:")
    inspector = db.inspect(db.engine)
    tables = inspector.get_table_names()
    for table in tables:
        print(f"- {table}")
    
    # 检查users表的结构
    print("\nusers表结构:")
    columns = inspector.get_columns('users')
    for column in columns:
        print(f"- {column['name']}: {column['type']}")
