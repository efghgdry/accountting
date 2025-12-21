from flask import Flask
from flask_cors import CORS
from config import Config
from models import db
from routes import api_bp

# 创建Flask应用实例
app = Flask(__name__)

# 加载配置
app.config.from_object(Config)

# 初始化CORS
CORS(app, origins=app.config['CORS_ORIGINS'])

# 初始化数据库
with app.app_context():
    db.init_app(app)
    # 创建表，包括新添加的银行对账表和采购订单表
    db.create_all()

# 注册蓝图
app.register_blueprint(api_bp)

# 健康检查路由
@app.route('/health')
def health_check():
    return {'status': 'healthy'}

# 首页路由
@app.route('/')
def index():
    return {'message': '会计财务系统API'}

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=app.config['DEBUG'])
