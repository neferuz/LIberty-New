import sqlite3
import httpx
import asyncio

async def test_url(client, url):
    try:
        res = await client.head(url, timeout=5.0)
        return res.status_code
    except Exception as e:
        return f"Error: {e}"

async def main():
    conn = sqlite3.connect("liberty_wear.db")
    cursor = conn.cursor()
    
    cursor.execute("SELECT id, name, sku, image_url, images FROM products")
    products = cursor.fetchall()
    
    total = len(products)
    with_main_image = sum(1 for p in products if p[3])
    with_gallery = sum(1 for p in products if p[4])
    
    print(f"📊 Verification Report:")
    print(f"  - Total products in database: {total}")
    print(f"  - Products with primary image: {with_main_image} / {total}")
    print(f"  - Products with gallery images: {with_gallery} / {total}")
    
    print("\n🔍 Sample Synced Products & Assets:")
    async with httpx.AsyncClient() as client:
        sample_count = 0
        for p in products:
            p_id, name, sku, img_url, images = p
            if img_url:
                sample_count += 1
                status = await test_url(client, img_url)
                gallery_count = len(images.split(",")) if images else 0
                print(f"  [{sample_count}] Name: {name[:30]}")
                print(f"      SKU: {sku}")
                print(f"      Main Image: {img_url[:60]}... (Status: {status})")
                print(f"      Gallery Count: {gallery_count} image(s)")
                if sample_count >= 5:
                    break
    
    conn.close()

if __name__ == "__main__":
    asyncio.run(main())
