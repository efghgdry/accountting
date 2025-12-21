import traceback
import sys
import os

# 确保当前目录在Python路径中
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    print("--- 开始调试后端应用 ---")
    print(f"Python版本: {sys.version}")
    print(f"当前目录: {os.getcwd()}")
    
    # 检查必要的文件是否存在
    print(f"app.py 是否存在: {os.path.exists('app.py')}")
    print(f"config.py 是否存在: {os.path.exists('config.py')}")
    print(f"models.py 是否存在: {os.path.exists('models.py')}")
    print(f"routes.py 是否存在: {os.path.exists('routes.py')}")
    
    # 检查数据库目录
    db_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../database')
    print(f"数据库目录: {db_dir}")
    print(f"数据库目录是否存在: {os.path.exists(db_dir)}")
    
    if os.path.exists(db_dir):
        print(f"数据库目录内容: {os.listdir(db_dir)}")
    
    # 导入配置
    print("\n--- 导入配置 ---")
    from config import Config
    print(f"配置加载成功")
    print(f"DEBUG模式: {Config.DEBUG}")
    print(f"数据库路径: {Config.DATABASE_PATH}")
    print(f"数据库文件是否存在: {os.path.exists(Config.DATABASE_PATH)}")
    print(f"数据库URI: {Config.SQLALCHEMY_DATABASE_URI}")
    
    # 导入模型
    print("\n--- 导入模型 ---")
    from models import db
    print(f"模型加载成功")
    
    # 导入路由
    print("\n--- 导入路由 ---")
    from routes import api_bp
    print(f"路由加载成功")
    
    # 创建Flask应用
    print("\n--- 创建Flask应用 ---")
    from flask import Flask
    app = Flask(__name__)
    app.config.from_object(Config)
    print(f"Flask应用创建成功")
    
    # 初始化数据库
    print("\n--- 初始化数据库 ---")
    with app.app_context():
        db.init_app(app)
        print(f"数据库初始化成功")
    
    # 注册蓝图
    print("\n--- 注册蓝图 ---")
    app.register_blueprint(api_bp)
    print(f"蓝图注册成功")
    
    print("\n--- 所有组件加载成功！应用可以启动 ---")
    print(f"请使用以下命令启动应用: python app.py")
    
except Exception as e:
    print("\n--- 错误发生 ---")
    print(f"错误类型: {type(e).__name__}")
    print(f"错误信息: {e}")
    print(f"\n完整堆栈跟踪:")
    traceback.print_exc()
    print(f"\n--- 调试结束 ---")
    sys.exit(1)
