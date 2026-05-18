import urllib.request
import json

def test_api():
    url = "http://localhost:8000/api/v1/products/3123"
    print(f"Sending request to {url}...")
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            print("\n=== SUCCESS: API RETURNED DATA ===")
            print(f"Name: {data.get('name')}")
            print(f"SKU: {data.get('sku')}")
            print(f"Bitrix ID: {data.get('bitrix_id')}")
            print(f"Composition: {data.get('composition')}")
            print(f"Characteristics: {data.get('characteristics')}")
            
            variants = data.get('variants')
            if variants:
                print(f"\nFound {len(variants)} color variants:")
                for idx, v in enumerate(variants):
                    print(f"\nVariant {idx + 1}:")
                    print(f"  Color: {v.get('color')}")
                    print(f"  Sizes: {v.get('sizes')}")
                    print(f"  Images count: {len(v.get('images'))}")
                    if v.get('images'):
                        print(f"  First Image: {v.get('images')[0][:80]}...")
            else:
                print("\nNo variants returned.")
    except Exception as e:
        print(f"API request failed: {e}")

if __name__ == "__main__":
    test_api()
