#!/usr/bin/env python3
import requests
import json
import sys
from datetime import datetime

# Get the backend URL from the frontend .env file
BACKEND_URL = "http://localhost:8001"

def test_root_endpoint():
    """Test the root endpoint to verify the backend is running."""
    print("\n=== Testing GET /api/ endpoint ===")
    try:
        response = requests.get(f"{BACKEND_URL}/api/")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 200 and response.json().get("message") == "Hello World":
            print("✅ Root endpoint test passed!")
            return True
        else:
            print("❌ Root endpoint test failed!")
            return False
    except Exception as e:
        print(f"❌ Error testing root endpoint: {str(e)}")
        return False

def test_create_status_check():
    """Test creating a status check with POST /api/status."""
    print("\n=== Testing POST /api/status endpoint ===")
    try:
        data = {"client_name": f"Test Client {datetime.now().isoformat()}"}
        response = requests.post(f"{BACKEND_URL}/api/status", json=data)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 200 and response.json().get("client_name") == data["client_name"]:
            print("✅ Create status check test passed!")
            return True, response.json().get("id")
        else:
            print("❌ Create status check test failed!")
            return False, None
    except Exception as e:
        print(f"❌ Error testing create status check: {str(e)}")
        return False, None

def test_get_status_checks():
    """Test retrieving status checks with GET /api/status."""
    print("\n=== Testing GET /api/status endpoint ===")
    try:
        response = requests.get(f"{BACKEND_URL}/api/status")
        print(f"Status Code: {response.status_code}")
        print(f"Found {len(response.json())} status checks")
        
        if response.status_code == 200 and isinstance(response.json(), list):
            print("✅ Get status checks test passed!")
            return True
        else:
            print("❌ Get status checks test failed!")
            return False
    except Exception as e:
        print(f"❌ Error testing get status checks: {str(e)}")
        return False

def run_all_tests():
    """Run all tests and return overall result."""
    results = []
    
    # Test 1: Root endpoint
    root_result = test_root_endpoint()
    results.append(root_result)
    
    # Test 2: Create status check
    create_result, _ = test_create_status_check()
    results.append(create_result)
    
    # Test 3: Get status checks
    get_result = test_get_status_checks()
    results.append(get_result)
    
    # Print summary
    print("\n=== Test Summary ===")
    print(f"Root endpoint: {'✅ Passed' if results[0] else '❌ Failed'}")
    print(f"Create status check: {'✅ Passed' if results[1] else '❌ Failed'}")
    print(f"Get status checks: {'✅ Passed' if results[2] else '❌ Failed'}")
    
    all_passed = all(results)
    print(f"\nOverall result: {'✅ All tests passed!' if all_passed else '❌ Some tests failed!'}")
    
    return all_passed

if __name__ == "__main__":
    print(f"Testing backend API at {BACKEND_URL}")
    success = run_all_tests()
    sys.exit(0 if success else 1)
