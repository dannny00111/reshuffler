#!/usr/bin/env python3
import requests
import json
import sys
from datetime import datetime

# Get the backend URL from the frontend .env file
import os
from dotenv import load_dotenv

# Load the frontend .env file to get the backend URL
load_dotenv("/app/frontend/.env")
BACKEND_URL = os.environ.get("REACT_APP_BACKEND_URL", "http://localhost:8001")

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
        data = {"client_name": f"AyoRecuts Client {datetime.now().isoformat()}"}
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

def test_invalid_status_check_creation():
    """Test error handling for invalid status check creation."""
    print("\n=== Testing POST /api/status with invalid data ===")
    try:
        # Missing required field
        data = {}
        response = requests.post(f"{BACKEND_URL}/api/status", json=data)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 422:  # FastAPI validation error
            print("✅ Invalid data handling test passed!")
            return True
        else:
            print("❌ Invalid data handling test failed!")
            return False
    except Exception as e:
        print(f"❌ Error testing invalid data handling: {str(e)}")
        return False

def test_mongodb_connection():
    """Test MongoDB connection by creating and retrieving a status check."""
    print("\n=== Testing MongoDB connection ===")
    try:
        # Create a unique status check
        unique_name = f"MongoDB Test {datetime.now().isoformat()}"
        data = {"client_name": unique_name}
        create_response = requests.post(f"{BACKEND_URL}/api/status", json=data)
        
        if create_response.status_code != 200:
            print("❌ MongoDB connection test failed - couldn't create status check!")
            return False
            
        # Retrieve status checks and verify our entry exists
        get_response = requests.get(f"{BACKEND_URL}/api/status")
        
        if get_response.status_code != 200:
            print("❌ MongoDB connection test failed - couldn't retrieve status checks!")
            return False
            
        # Check if our unique entry exists in the response
        found = False
        for status in get_response.json():
            if status.get("client_name") == unique_name:
                found = True
                break
                
        if found:
            print("✅ MongoDB connection test passed!")
            return True
        else:
            print("❌ MongoDB connection test failed - created entry not found!")
            return False
    except Exception as e:
        print(f"❌ Error testing MongoDB connection: {str(e)}")
        return False

def test_cors_configuration():
    """Test CORS configuration by sending a preflight request."""
    print("\n=== Testing CORS configuration ===")
    try:
        # Send OPTIONS request to simulate preflight
        headers = {
            'Origin': 'http://example.com',
            'Access-Control-Request-Method': 'GET',
            'Access-Control-Request-Headers': 'Content-Type'
        }
        response = requests.options(f"{BACKEND_URL}/api/", headers=headers)
        
        # Check if CORS headers are present
        cors_headers = [
            'Access-Control-Allow-Origin',
            'Access-Control-Allow-Methods',
            'Access-Control-Allow-Headers'
        ]
        
        all_headers_present = all(header in response.headers for header in cors_headers)
        
        if all_headers_present:
            print("✅ CORS configuration test passed!")
            return True
        else:
            print("❌ CORS configuration test failed!")
            print(f"Missing headers: {[h for h in cors_headers if h not in response.headers]}")
            return False
    except Exception as e:
        print(f"❌ Error testing CORS configuration: {str(e)}")
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
    
    # Test 4: Invalid status check creation
    invalid_result = test_invalid_status_check_creation()
    results.append(invalid_result)
    
    # Test 5: MongoDB connection
    mongo_result = test_mongodb_connection()
    results.append(mongo_result)
    
    # Test 6: CORS configuration
    cors_result = test_cors_configuration()
    results.append(cors_result)
    
    # Print summary
    print("\n=== Test Summary ===")
    print(f"Root endpoint: {'✅ Passed' if results[0] else '❌ Failed'}")
    print(f"Create status check: {'✅ Passed' if results[1] else '❌ Failed'}")
    print(f"Get status checks: {'✅ Passed' if results[2] else '❌ Failed'}")
    print(f"Invalid data handling: {'✅ Passed' if results[3] else '❌ Failed'}")
    print(f"MongoDB connection: {'✅ Passed' if results[4] else '❌ Failed'}")
    print(f"CORS configuration: {'✅ Passed' if results[5] else '❌ Failed'}")
    
    all_passed = all(results)
    print(f"\nOverall result: {'✅ All tests passed!' if all_passed else '❌ Some tests failed!'}")
    
    return all_passed

if __name__ == "__main__":
    print(f"Testing backend API at {BACKEND_URL}")
    success = run_all_tests()
    sys.exit(0 if success else 1)
