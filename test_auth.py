"""
Test script for authentication endpoints
Run this after starting the backend server
"""
import requests
import json

BASE_URL = "http://localhost:8000"

def print_section(title):
    print("\n" + "="*60)
    print(f"  {title}")
    print("="*60)

def test_health_check():
    print_section("Health Check")
    response = requests.get(f"{BASE_URL}/health")
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    return response.status_code == 200

def test_register():
    print_section("User Registration")
    data = {
        "email": "demo@cvbuilder.com",
        "username": "demouser",
        "password": "DemoPassword123!"
    }
    response = requests.post(f"{BASE_URL}/api/auth/register", json=data)
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    return response.status_code in [200, 201, 400]  # 400 if already exists

def test_login():
    print_section("User Login")
    data = {
        "username_or_email": "demouser",
        "password": "DemoPassword123!"
    }
    response = requests.post(f"{BASE_URL}/api/auth/login", json=data)
    print(f"Status: {response.status_code}")
    result = response.json()
    print(f"Response: {json.dumps(result, indent=2)}")
    
    if response.status_code == 200:
        return result.get("access_token"), result.get("refresh_token")
    return None, None

def test_get_current_user(access_token):
    print_section("Get Current User (Protected Route)")
    headers = {"Authorization": f"Bearer {access_token}"}
    response = requests.get(f"{BASE_URL}/api/auth/me", headers=headers)
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    return response.status_code == 200

def test_refresh_token(refresh_token):
    print_section("Refresh Access Token")
    data = {"refresh_token": refresh_token}
    response = requests.post(f"{BASE_URL}/api/auth/refresh", json=data)
    print(f"Status: {response.status_code}")
    result = response.json()
    print(f"Response: {json.dumps(result, indent=2)}")
    return response.status_code == 200

def test_logout(access_token):
    print_section("Logout")
    headers = {"Authorization": f"Bearer {access_token}"}
    response = requests.post(f"{BASE_URL}/api/auth/logout", headers=headers)
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    return response.status_code == 200

def run_all_tests():
    print("\n" + "🧪 " * 20)
    print("    AI PROMPT2CV BUILDER - Authentication Test Suite")
    print("🧪 " * 20)
    
    try:
        # Test 1: Health check
        if not test_health_check():
            print("\n❌ Health check failed. Is the server running?")
            return
        
        # Test 2: Register
        test_register()
        
        # Test 3: Login
        access_token, refresh_token = test_login()
        if not access_token:
            print("\n❌ Login failed. Cannot continue tests.")
            return
        
        # Test 4: Get current user
        test_get_current_user(access_token)
        
        # Test 5: Refresh token
        test_refresh_token(refresh_token)
        
        # Test 6: Logout
        test_logout(access_token)
        
        print("\n" + "✅ " * 20)
        print("    All tests completed!")
        print("✅ " * 20 + "\n")
        
    except requests.exceptions.ConnectionError:
        print("\n❌ ERROR: Cannot connect to the server.")
        print("Please make sure the backend is running at http://localhost:8000")
        print("Run: python -m backend.main")
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")

if __name__ == "__main__":
    run_all_tests()
