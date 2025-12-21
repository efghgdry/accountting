import sqlite3
import os

# 获取当前脚本所在目录
dir_path = os.path.dirname(os.path.abspath(__file__))
# 数据库文件路径
db_path = os.path.join(dir_path, 'accounting.db')
# SQL脚本路径
sql_path = os.path.join(dir_path, 'schema.sql')

# 连接到SQLite数据库
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# 读取SQL脚本内容
with open(sql_path, 'r', encoding='utf-8') as f:
    sql_script = f.read()

# 执行SQL脚本
cursor.executescript(sql_script)

# 提交事务
conn.commit()

# 关闭连接
conn.close()

print(f"数据库初始化成功，数据库文件位于: {db_path}")
