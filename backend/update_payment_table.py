import os
import sqlite3

# 获取数据库文件路径
base_dir = os.path.abspath(os.path.dirname(__file__))
database_path = os.path.join(base_dir, '../database/accounting.db')
print("Database file path:", database_path)

# 连接到SQLite数据库
conn = sqlite3.connect(database_path)
cursor = conn.cursor()

# 查看当前payments表结构
print("\nCurrent payments table structure:")
cursor.execute("PRAGMA table_info(payments)")
columns = cursor.fetchall()
for column in columns:
    print(f"  - {column[1]}: {column[2]}, NOT NULL: {column[3]}")

# 修改bill_id字段，允许NULL
print("\nModifying bill_id column to allow NULL...")
try:
    # 在SQLite中，修改字段约束需要重新创建表
    # 1. 创建新表
    cursor.execute('''
    CREATE TABLE payments_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        bill_id INTEGER,
        voucher_id INTEGER,
        payment_date DATETIME,
        amount FLOAT NOT NULL,
        payment_method VARCHAR(20) NOT NULL,
        bank_account_id INTEGER,
        receipt_number VARCHAR(100),
        status VARCHAR(20) DEFAULT 'pending',
        user_id INTEGER,
        created_at DATETIME,
        updated_at DATETIME,
        tax_declaration_id INTEGER,
        purchase_order_id INTEGER,
        FOREIGN KEY (bill_id) REFERENCES bills(id),
        FOREIGN KEY (voucher_id) REFERENCES vouchers(id),
        FOREIGN KEY (bank_account_id) REFERENCES accounts(id),
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (tax_declaration_id) REFERENCES tax_declarations(id),
        FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id)
    )
    ''')
    
    # 2. 复制数据到新表
    cursor.execute('''
    INSERT INTO payments_new (id, bill_id, voucher_id, payment_date, amount, payment_method, bank_account_id, receipt_number, status, user_id, created_at, updated_at, tax_declaration_id, purchase_order_id)
    SELECT id, bill_id, voucher_id, payment_date, amount, payment_method, bank_account_id, receipt_number, status, user_id, created_at, updated_at, tax_declaration_id, purchase_order_id
    FROM payments
    ''')
    
    # 3. 删除旧表
    cursor.execute('DROP TABLE payments')
    
    # 4. 重命名新表
    cursor.execute('ALTER TABLE payments_new RENAME TO payments')
    
    # 提交更改
    conn.commit()
    print("Successfully modified payments table to allow NULL in bill_id")
    
    # 验证修改后的表结构
    print("\nModified payments table structure:")
    cursor.execute("PRAGMA table_info(payments)")
    columns = cursor.fetchall()
    for column in columns:
        print(f"  - {column[1]}: {column[2]}, NOT NULL: {column[3]}")
        
except Exception as e:
    print(f"Error modifying table: {e}")
    conn.rollback()

# 关闭连接
conn.close()
