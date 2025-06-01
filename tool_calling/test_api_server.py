#!/usr/bin/env python3

import requests
import json
import time
import subprocess
import signal
import os
from threading import Thread

def start_server():
    """Start the API server in a subprocess"""
    return subprocess.Popen(['python', 'api_server.py'], 
                          stdout=subprocess.PIPE, 
                          stderr=subprocess.PIPE)

def test_api_endpoints():
    """Test the API endpoints"""
    base_url = "http://localhost:8000"
    
    print("🧬 Testing Cognition API Server...")
    
    # Wait for server to start
    time.sleep(3)
    
    try:
        # Test health endpoint
        response = requests.get(f"{base_url}/health")
        if response.status_code == 200:
            print("✅ Health endpoint working")
        else:
            print(f"❌ Health endpoint failed: {response.status_code}")
            return False
        
        # Test cognition simulation
        response = requests.post(f"{base_url}/simulation/run-cognition", 
                               json={
                                   "cognition_id": "test_http_api",
                                   "sandbox_mode": True,
                                   "timeout": 300
                               })
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Cognition simulation working: {result['execution_id']}")
        else:
            print(f"❌ Cognition simulation failed: {response.status_code}")
            return False
        
        # Test reputation endpoint
        response = requests.get(f"{base_url}/reputation/Theory")
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Reputation endpoint working: Theory has {result['reputation_score']:.1f} reputation")
        else:
            print(f"❌ Reputation endpoint failed: {response.status_code}")
            return False
        
        # Test tools listing
        response = requests.get(f"{base_url}/tools")
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Tools endpoint working: {len(result['tools'])} tools available")
        else:
            print(f"❌ Tools endpoint failed: {response.status_code}")
            return False
        
        print("🎉 All HTTP API tests passed!")
        return True
        
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to API server")
        return False
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False

def main():
    """Main test function"""
    print("Starting API server...")
    server_process = start_server()
    
    try:
        success = test_api_endpoints()
        
        if success:
            print("\n🎉 API Server is working correctly!")
            print("You can now connect the frontend dashboard to http://localhost:8000")
        else:
            print("\n❌ API Server tests failed")
            
    finally:
        # Clean up server process
        print("\nStopping server...")
        server_process.terminate()
        server_process.wait()

if __name__ == "__main__":
    main() 