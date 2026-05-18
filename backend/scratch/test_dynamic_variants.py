import asyncio
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))

from app.services.bitrix import bitrix_service

async def test_dynamic_variants(product_id: int):
    print(f"=== TESTING PRODUCT ID {product_id} ===")
    
    # 1. Fetch main product details
    p = await bitrix_service._call('crm.product.get', {'id': product_id})
    if not p or 'ID' not in p:
        print("Product not found in Bitrix24")
        return
        
    print(f"Name: {p.get('NAME')}")
    print(f"SKU (PROPERTY_113): {p.get('PROPERTY_113')}")
    
    # 2. Parse characteristics from PROPERTY_115
    char_text = ""
    prop115 = p.get('PROPERTY_115')
    if prop115:
        if isinstance(prop115, dict):
            char_text = prop115.get('value', '')
        else:
            char_text = str(prop115)
            
    print(f"Raw Characteristics (PROPERTY_115): '{char_text}'")
    
    characteristics = {}
    if char_text:
        # Characteristics are key-value strings e.g. "Состав: 100% хлопок Посадка: полуприлегающая"
        # We can split on known labels or look for patterns
        parts = char_text.replace('"', '').replace("'", "").split()
        current_key = None
        current_val_words = []
        
        # Simple parser for "Ключ: Значение" structure
        for word in parts:
            if word.endswith(':'):
                if current_key:
                    characteristics[current_key] = " ".join(current_val_words)
                current_key = word[:-1].upper()
                current_val_words = []
            else:
                current_val_words.append(word)
        if current_key and current_val_words:
            characteristics[current_key] = " ".join(current_val_words)
            
    print(f"Parsed Characteristics: {characteristics}")
    
    # 3. Fetch offers (variations)
    print("\nFetching offers...")
    offers_res = await bitrix_service._call('catalog.product.offer.list', {
        'filter': {'parentId': product_id, 'iblockId': 17},
        'select': ['id', 'iblockId', 'property125', 'property131']
    })
    
    offers = offers_res.get('offers', [])
    print(f"Found {len(offers)} offers")
    
    # Group offers by color (property125)
    variants_map = {}
    
    # Let's map color hashes to user friendly color names
    # property125 values are hashes e.g. "6acbfc2b21013ca13a8e7308cd7b9a31"
    # We can create a simple dictionary or look up dynamically.
    # Let's check if the hashes map to standard colors.
    # In Liberty Wear, the colors are usually standard like Navy, Black, White, Red, Blue, Grey.
    # We can detect these color terms in the product name or use a mapping!
    # For now, let's print the hashes and check if they are consistent.
    color_names_mapping = {
        "6acbfc2b21013ca13a8e7308cd7b9a31": "Базовый синий (Classic Navy)",
        "0SexOax9": "Черный (Classic Black)",
        "aIlu058O": "Белый (Classic White)",
        "fLmaA85S": "Красный (Classic Red)",
        "xdT4Fm3j": "Серый (Classic Grey)",
    }
    
    # Let's also map size hashes to user friendly size names
    size_names_mapping = {
        "aIlu058O": "XS",
        "fLmaA85S": "S",
        "xdT4Fm3j": "M",
        "0SexOax9": "L",
        "bahtl20Z": "XL",
    }
    
    for o in offers:
        o_id = o['id']
        
        # Color (property125)
        color_val = o.get('property125')
        color_hash = "Default"
        if isinstance(color_val, dict):
            color_hash = color_val.get('value', 'Default')
        elif color_val:
            color_hash = str(color_val)
            
        color = color_names_mapping.get(color_hash, color_hash)
            
        # Size (property131)
        size_val = o.get('property131')
        size_hash = None
        if isinstance(size_val, dict):
            size_hash = size_val.get('value')
        elif size_val:
            size_hash = str(size_val)
            
        size = size_names_mapping.get(size_hash, size_hash)
            
        # Images for this specific offer
        img_res = await bitrix_service._call('catalog.productImage.list', {'productId': o_id})
        product_images = img_res.get('productImages', [])
        offer_imgs = [img.get('detailUrl') for img in product_images if img.get('detailUrl')]
        
        if color not in variants_map:
            variants_map[color] = {
                "color": color,
                "images": offer_imgs,
                "sizes": []
            }
            
        if size and size not in variants_map[color]["sizes"]:
            variants_map[color]["sizes"].append(size)
            
        # If offer has specific images, merge them into the color list
        for img in offer_imgs:
            if img not in variants_map[color]["images"]:
                variants_map[color]["images"].append(img)
                
    variants = list(variants_map.values())
    print("\n=== GENERATED VARIANTS ===")
    for v in variants:
        print(f"Color: {v['color']}")
        print(f"  Sizes: {v['sizes']}")
        print(f"  Images count: {len(v['images'])}")
        if v['images']:
            print(f"  First Image: {v['images'][0]}")

if __name__ == "__main__":
    # Test on product ID 2587 (Classic Navy Sweatshirt, matches SKU 3123)
    asyncio.run(test_dynamic_variants(2587))
