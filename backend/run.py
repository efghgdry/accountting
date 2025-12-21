import sys
import os
import logging

# 配置日志
logging.basicConfig(level=logging.DEBUG,
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
                    handlers=[
                        logging.StreamHandler()
                    ])

logger = logging.getLogger('backend')
logger.info('--- 启动后端服务 ---')

# 确保当前目录在Python路径中
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import app

if __name__ == '__main__':
    # 使用不同的端口和禁用调试模式自动重载
    logger.info('启动Flask应用...')
    app.run(host='127.0.0.1', port=5001, debug=True, use_reloader=False)
