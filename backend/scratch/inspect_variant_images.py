import urllib.request
import json

def inspect_urls():
    url = "http://localhost:8000/api/v1/products/3123"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            variants = data.get('variants', [])
            for idx, v in enumerate(variants):
                print(f"\nVariant {idx + 1}: Color Hash/Name: '{v.get('color')}'")
                for img in v.get('images', []):
                    print(f"  Img URL: {img}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    inspect_urls()
