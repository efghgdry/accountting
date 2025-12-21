import os
from flask import Flask
from config import Config

# 创建Flask应用
app = Flask(__name__)
app.config.from_object(Config)

# 检查数据库配置
print("Database URI:", app.config['SQLALCHEMY_DATABASE_URI'])

# 检查数据库文件是否存在
base_dir = os.path.abspath(os.path.dirname(__file__))
database_path = os.path.join(base_dir, '../database/accounting.db')
print("Database file exists:", os.path.exists(database_path))
print("Database file path:", database_path)

# 直接使用SQLite连接检查表结构
import sqlite3

# 连接到SQLite数据库
conn = sqlite3.connect(database_path)
cursor = conn.cursor()

# 检查payments表结构
print("\nChecking payments table structure...")
cursor.execute("PRAGMA table_info(payments)")
columns = cursor.fetchall()
print("Payments table columns:")
for column in columns:
    print(f"  - {column[1]}: {column[2]}")

# 关闭连接
conn.close()
