from models import db, User
from app import app

with app.app_context():
    print('用户表存在:', 'users' in db.metadata.tables.keys())
    print('现有用户数:', User.query.count())
    
    # 打印所有用户
    users = User.query.all()
    print('现有用户列表:')
    for user in users:
        print(f'- {user.username}')