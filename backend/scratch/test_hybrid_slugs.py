import urllib.request
import json

def test_hybrids():
    # Test 1: Fetching "Мужской свитшот" (ID 169, SKU 3123)
    url1 = "http://localhost:8000/api/v1/products/3123-169"
    # Test 2: Fetching "Женская майка на лямках" (ID 787 / DB ID 699, wait, let's see. In our previous test we fetched SKU 3123 and it loaded ID 787!)
    # Actually, in SQLite:
    # ID: 169 is "Мужской свитшот базовый Classic Navy", SKU: 3123.
    # What was the ID of "Женская майка на лямках"? Let's fetch ID 169 and then ID 12 (or whichever is the other one).
    
    print("Testing Test 1: 3123-169 (Should load Мужской свитшот базовый “Classic Navy”)...")
    try:
        req = urllib.request.Request(url1, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as r:
            data = json.loads(r.read().decode())
            print(f"Loaded: Name='{data.get('name')}' | SKU='{data.get('sku')}' | ID={data.get('id')}")
    except Exception as e:
        print(f"Failed: {e}")

if __name__ == "__main__":
    test_hybrids()
