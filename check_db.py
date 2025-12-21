import os
import sys

# 检查当前目录
print("当前目录:", os.getcwd())

# 检查数据库目录
db_dir = os.path.join(os.getcwd(), "database")
print("数据库目录:", db_dir)
print("数据库目录是否存在:", os.path.exists(db_dir))

# 如果数据库目录存在，列出其中的文件
if os.path.exists(db_dir):
    print("数据库目录中的文件:", os.listdir(db_dir))

# 检查数据库文件
db_file = os.path.join(db_dir, "accounting.db")
print("数据库文件路径:", db_file)
print("数据库文件是否存在:", os.path.exists(db_file))

# 检查后端配置
print("\n--- 检查后端配置 ---")
# 将backend目录添加到Python路径
sys.path.append(os.path.join(os.getcwd(), "backend"))

try:
    from config import Config
    print("配置文件导入成功")
    print("数据库路径配置:", Config.DATABASE_PATH)
    print("数据库URI:", Config.SQLALCHEMY_DATABASE_URI)
    print("数据库文件是否存在(根据配置):", os.path.exists(Config.DATABASE_PATH))
except Exception as e:
    print("配置文件导入失败:", e)

# 检查模型文件
try:
    from models import db, User
    print("模型文件导入成功")
except Exception as e:
    print("模型文件导入失败:", e)
