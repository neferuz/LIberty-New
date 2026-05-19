import hashlib
import json
import urllib.request
import urllib.parse
import sys

def simulate_callback():
    # Production CLICK parameters
    SERVICE_ID = 101626
    SECRET_KEY = "hmlcIj4YHDzARi0"
    
    # We will target ORD-1115 which is our default mock order in the system (90 000 UZS)
    MERCHANT_TRANS_ID = "ORD-1115"
    AMOUNT = 90000.0
    CLICK_TRANS_ID = 99998888
    SIGN_TIME = "2026-05-19 05:30:00"
    
    print("=== CLICK Callback Local Simulator ===")
    print(f"Targeting Order: {MERCHANT_TRANS_ID}")
    print(f"Amount: {AMOUNT} UZS")
    print(f"Secret Key: {SECRET_KEY}")
    
    # 1. Simulate PREPARE Action (0)
    print("\n--- 1. Simulating PREPARE (Action 0) ---")
    action = 0
    text_to_sign = f"{CLICK_TRANS_ID}{SERVICE_ID}{SECRET_KEY}{MERCHANT_TRANS_ID}{int(AMOUNT)}{action}{SIGN_TIME}"
    sign_string = hashlib.md5(text_to_sign.encode("utf-8")).hexdigest()
    
    prepare_payload = {
        "click_trans_id": str(CLICK_TRANS_ID),
        "service_id": str(SERVICE_ID),
        "merchant_trans_id": MERCHANT_TRANS_ID,
        "amount": str(AMOUNT),
        "action": str(action),
        "error": "0",
        "sign_time": SIGN_TIME,
        "sign_string": sign_string
    }
    
    data = urllib.parse.urlencode(prepare_payload).encode("utf-8")
    req = urllib.request.Request("http://localhost:8000/api/v1/orders/click-callback", data=data)
    req.add_header("Content-Type", "application/x-www-form-urlencoded")
    
    try:
        with urllib.request.urlopen(req) as response:
            res_body = response.read().decode("utf-8")
            print(f"Status Code: {response.status}")
            print("Response:")
            print(json.dumps(json.loads(res_body), indent=2, ensure_ascii=False))
    except urllib.error.URLError as e:
        print(f"Failed to connect to backend on port 8000: {e}")
        print("Make sure your backend server is running (usually via uvicorn app.main:app --port 8000 --reload)")
        sys.exit(1)
        
    # 2. Simulate COMPLETE Action (1)
    print("\n--- 2. Simulating COMPLETE (Action 1) ---")
    action = 1
    text_to_sign = f"{CLICK_TRANS_ID}{SERVICE_ID}{SECRET_KEY}{MERCHANT_TRANS_ID}{int(AMOUNT)}{action}{SIGN_TIME}"
    sign_string = hashlib.md5(text_to_sign.encode("utf-8")).hexdigest()
    
    complete_payload = {
        "click_trans_id": str(CLICK_TRANS_ID),
        "service_id": str(SERVICE_ID),
        "merchant_trans_id": MERCHANT_TRANS_ID,
        "amount": str(AMOUNT),
        "action": str(action),
        "error": "0",
        "sign_time": SIGN_TIME,
        "sign_string": sign_string
    }
    
    data = urllib.parse.urlencode(complete_payload).encode("utf-8")
    req = urllib.request.Request("http://localhost:8000/api/v1/orders/click-callback", data=data)
    req.add_header("Content-Type", "application/x-www-form-urlencoded")
    
    with urllib.request.urlopen(req) as response:
        res_body = response.read().decode("utf-8")
        print(f"Status Code: {response.status}")
        print("Response:")
        print(json.dumps(json.loads(res_body), indent=2, ensure_ascii=False))
        
    print("\nChecking if order status is updated to Paid...")
    try:
        with urllib.request.urlopen(f"http://localhost:8000/api/v1/orders/{MERCHANT_TRANS_ID}") as response:
            res_body = response.read().decode("utf-8")
            order_data = json.loads(res_body)
            print(f"Order status in DB is now: {order_data.get('status')} (Payment Method: {order_data.get('method')})!")
    except Exception as e:
        print(f"Failed to fetch order details: {e}")

if __name__ == "__main__":
    simulate_callback()
