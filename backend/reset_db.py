from models import db, User, Account, Voucher, VoucherEntry, Vendor
from app import app

with app.app_context():
    # 重新创建数据库表
    db.drop_all()
    db.create_all()
    print("数据库表已重新创建，移除了code字段的唯一约束")
