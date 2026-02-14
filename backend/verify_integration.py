
import requests
import json
import sys

BASE_URL = "http://127.0.0.1:8000"

def test_endpoints():
    endpoints = [
        ("GET", "/api/users/profile/", True), # Needs Auth
        ("GET", "/api/social/feed/", True),
        ("GET", "/api/groups/", True),
        ("GET", "/api/communities/list/", True), # Check if exists
        ("GET", "/api/music/", False), # Public?
        ("GET", "/api/system/health/", False),
    ]

    print(f"Testing endpoints against {BASE_URL}...")
    
    # login to get token
    login_url = f"{BASE_URL}/api/users/login/"
    # We need a valid user. Assuming 'admin' 'admin' or similar exists or we can create one.
    # For now, let's just check if endpoints return 401 (which means they exist) vs 404.
    
    results = {}

    for method, path, auth_required in endpoints:
        url = f"{BASE_URL}{path}"
        try:
            if method == "GET":
                response = requests.get(url)
            elif method == "POST":
                response = requests.post(url)
            
            status = response.status_code
            
            # If 401 and auth required, that's a PASS for "endpoint exists"
            if auth_required and status == 401:
                results[path] = "PASS (401 Auth)"
            elif 200 <= status < 300:
                 results[path] = f"PASS ({status})"
            else:
                 results[path] = f"FAIL ({status})"
                 
        except Exception as e:
            results[path] = f"ERROR ({str(e)})"

    print(json.dumps(results, indent=2))

if __name__ == "__main__":
    test_endpoints()
