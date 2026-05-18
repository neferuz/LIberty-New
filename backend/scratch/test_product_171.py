import urllib.request
import json

def test_p171():
    url = "http://localhost:8000/api/v1/products/323-171"
    print("Fetching product 171 API data...")
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as r:
            data = json.loads(r.read().decode())
            print(f"Name: {data.get('name')}")
            print(f"SKU: {data.get('sku')}")
            print(f"Bitrix ID: {data.get('bitrix_id')}")
            print("Variants:")
            for v in data.get('variants', []):
                print(f"  Color: {v.get('color')}")
                print(f"  Images ({len(v.get('images', []))}): {v.get('images')}")
                print(f"  Sizes: {v.get('sizes')}")
    except Exception as e:
        print(f"Failed: {e}")

if __name__ == "__main__":
    test_p171()
