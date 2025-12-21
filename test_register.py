import requests
import json

# 测试注册API
def test_register():
    url = "http://127.0.0.1:5001/api/auth/register"
    headers = {
        "Content-Type": "application/json"
    }
    data = {
        "username": "testuser",
        "email": "test@example.com",
        "password": "testpassword",
        "full_name": "Test User"
    }
    
    print(f"测试注册API: {url}")
    print(f"请求数据: {json.dumps(data, ensure_ascii=False)}")
    
    try:
        response = requests.post(url, headers=headers, json=data)
        print(f"响应状态码: {response.status_code}")
        print(f"响应头: {dict(response.headers)}")
        print(f"响应内容: {response.text}")
        return response
    except Exception as e:
        print(f"请求失败: {e}")
        return None

if __name__ == "__main__":
    test_register()
