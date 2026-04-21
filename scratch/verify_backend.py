import requests
import time
import subprocess
import os
import sys

def test_backend():
    print("Starting backend...")
    python_exe = os.path.join(os.getcwd(), "venv", "Scripts", "python.exe")
    api_script = os.path.join(os.getcwd(), "src_python", "api.py")
    
    proc = subprocess.Popen([python_exe, api_script])
    
    # Wait for startup
    time.sleep(5)
    
    base_url = "http://127.0.0.1:8000"
    
    tests = [
        ("/cas/simplify", {"expr": "x**2 + 2*x + 1", "variable": "x"}, "Check simplify"),
        ("/cas/differentiate", {"expr": "sin(x)", "variable": "x"}, "Check derivative"),
        ("/cas/solve", {"expr": "x**2 - 4", "variable": "x"}, "Check solve"),
        ("/constants", None, "Check constants"),
    ]
    
    results = []
    try:
        for path, payload, desc in tests:
            print(f"Testing {desc}...")
            if payload:
                r = requests.post(base_url + path, json=payload)
            else:
                r = requests.get(base_url + path)
            
            if r.status_code == 200:
                print(f"[PASS] {desc} success: {r.json()}")
                results.append(True)
            else:
                print(f"[FAIL] {desc} failed: {r.status_code} {r.text}")
                results.append(False)
                
    finally:
        print("Stopping backend...")
        proc.terminate()
        
    if all(results):
        print("\nSUMMARY: ALL TESTS PASSED! 🚀")
    else:
        print("\nSUMMARY: SOME TESTS FAILED! ❌")

if __name__ == "__main__":
    test_backend()
