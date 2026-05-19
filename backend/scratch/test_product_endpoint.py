import asyncio
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))

from app.db.session import SessionLocal
from app.api.v1.endpoints.products import read_product

async def test_endpoint():
    db = SessionLocal()
    try:
        # Test 1: Lace Grace (Kids)
        res = await read_product(db=db, id_or_sku="31255-174")
        print("\n=== API RESPONSE FOR KIDS PRODUCT 174 ===")
        print(f"Product Name: '{res['name']}'")
        print(f"Product-level sizes: '{res['sizes']}'")
        if res['variants']:
            for var in res['variants']:
                print(f"  Color: '{var['color']}' | Sizes: {var['sizes']}")
                
        # Test 2: Funny Jumpsuit (Baby)
        res2 = await read_product(db=db, id_or_sku="YUS-001")
        print("\n=== API RESPONSE FOR BABY PRODUCT (Funny Jumpsuit) ===")
        print(f"Product Name: '{res2['name']}'")
        print(f"Product-level sizes: '{res2['sizes']}'")
        if res2['variants']:
            for var in res2['variants']:
                print(f"  Color: '{var['color']}' | Sizes: {var['sizes']}")
                
        # Test 3: Panda Baby (Baby)
        res3 = await read_product(db=db, id_or_sku="LW-3571")
        print("\n=== API RESPONSE FOR BABY PRODUCT (Panda Baby) ===")
        print(f"Product Name: '{res3['name']}'")
        print(f"Product-level sizes: '{res3['sizes']}'")
        if res3['variants']:
            for var in res3['variants']:
                print(f"  Color: '{var['color']}' | Sizes: {var['sizes']}")
                
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(test_endpoint())
