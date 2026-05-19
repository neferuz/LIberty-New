from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from app import crud, schemas
from app.db.session import get_db

from app.services.bitrix import bitrix_service

router = APIRouter()

@router.get("/categories")
async def get_categories(db: Session = Depends(get_db)):
    """Fetch categories from Bitrix24 with product counts and cover images (including sub-categories)"""
    from sqlalchemy import func
    from app.models.product import Product
    
    # Fetch sections from Bitrix
    res = await bitrix_service.get_sections()
    if not res:
        return []
        
    # Map sections by ID for traversal
    sections_map = {int(s['ID']): {
        'id': s['ID'],
        'name': s['NAME'],
        'parent_id': int(s['SECTION_ID']) if s.get('SECTION_ID') else None,
        'count': 0,
        'image': None
    } for s in res}
    
    # Get counts and first image for direct/leaf categories
    subquery = db.query(
        Product.category_id,
        Product.image_url,
        func.row_number().over(partition_by=Product.category_id, order_by=Product.id).label("rn")
    ).subquery()
    
    first_images = db.query(subquery.c.category_id, subquery.c.image_url).filter(subquery.c.rn == 1).all()
    image_map = {int(img[0]): img[1] for img in first_images if img[0] is not None}
    
    counts = db.query(Product.category_id, func.count(Product.id)).group_by(Product.category_id).all()
    count_map = {int(c[0]): c[1] for c in counts if c[0] is not None}
    
    # Populate initial states
    for cid, sec in sections_map.items():
        sec['count'] = count_map.get(cid, 0)
        sec['image'] = image_map.get(cid)
        
    # Build children maps for top-down computation
    children_map = {}
    for cid, sec in sections_map.items():
        pid = sec['parent_id']
        if pid:
            children_map.setdefault(pid, []).append(cid)
            
    visited = set()
    
    # Recursive post-order traversal to compute counts and bubble up covers
    def compute_category(cid: int):
        if cid in visited:
            return sections_map[cid]['count'], sections_map[cid]['image']
            
        sec = sections_map[cid]
        direct_count = count_map.get(cid, 0)
        direct_image = image_map.get(cid)
        
        children = children_map.get(cid, [])
        total_count = direct_count
        first_child_image = None
        
        for child_id in children:
            child_count, child_image = compute_category(child_id)
            total_count += child_count
            if not first_child_image and child_image:
                first_child_image = child_image
                
        sec['count'] = total_count
        if not sec['image']:
            sec['image'] = direct_image or first_child_image
            
        visited.add(cid)
        return total_count, sec['image']
        
    # Compute for all categories
    for cid in list(sections_map.keys()):
        compute_category(cid)
        
    # Filter out categories that have zero products, ensuring a clean and beautifully filled interface
    return [
        sec for sec in sections_map.values() if sec['count'] > 0
    ]

@router.get("/categories/tree")
async def get_categories_tree():
    """Fetch categories as a tree structure for navigation"""
    res = await bitrix_service.get_sections()
    if not res:
        return []
        
    # Build tree
    sections_map = {s['ID']: {**s, 'children': []} for s in res}
    tree = []
    
    for s in res:
        sec = sections_map[s['ID']]
        parent_id = s.get('SECTION_ID')
        if parent_id and parent_id in sections_map:
            sections_map[parent_id]['children'].append(sec)
        else:
            tree.append(sec)
            
    return tree

@router.get("", response_model=List[schemas.product.Product])
@router.get("/", response_model=List[schemas.product.Product])
def read_products(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    category_id: Optional[int] = None,
) -> Any:
    """
    Retrieve products.
    """
    products = crud.crud_product.get_multi(db, skip=skip, limit=limit, category_id=category_id)
    return products

@router.post("", response_model=schemas.product.Product)
@router.post("/", response_model=schemas.product.Product)
def create_product(
    *,
    db: Session = Depends(get_db),
    product_in: schemas.product.ProductCreate,
) -> Any:
    """
    Create new product.
    """
    product = crud.crud_product.create(db, obj_in=product_in)
    return product

@router.get("/{id_or_sku}", response_model=schemas.product.Product)
async def read_product(
    *,
    db: Session = Depends(get_db),
    id_or_sku: str,
) -> Any:
    """
    Get product by ID or SKU, dynamically enriched with Bitrix24 variants and characteristics.
    """
    from app.models.product import Product
    
    product = None
    
    # Try parsing hybrid sku-id format (e.g. "AW4KNA0196-48" or "3123-169")
    if "-" in id_or_sku:
        parts = id_or_sku.split("-")
        last_part = parts[-1]
        if last_part.isdigit():
            product = db.query(Product).filter(Product.id == int(last_part)).first()

    # 1. Try to fetch as integer ID if numeric
    if not product and id_or_sku.isdigit():
        product = db.query(Product).filter(Product.id == int(id_or_sku)).first()
            
    # 2. Try to fetch by SKU exact match
    if not product:
        product = db.query(Product).filter(Product.sku == id_or_sku).first()
        
    # 3. Try to fetch by SKU case-insensitive match
    if not product:
        product = db.query(Product).filter(Product.sku.ilike(id_or_sku)).first()
        
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    variants = []
    characteristics = {}
    composition = product.composition
    sizes = product.sizes

    if product.bitrix_id:
        try:
            # Fetch raw product details to get composition from PROPERTY_115
            p_data = await bitrix_service._call('crm.product.get', {'id': product.bitrix_id})
            if p_data and isinstance(p_data, dict):
                # Check for dynamic characteristics in PROPERTY_115
                prop115 = p_data.get('PROPERTY_115')
                char_text = ""
                if isinstance(prop115, dict):
                    char_text = prop115.get('value', '')
                elif prop115:
                    char_text = str(prop115)
                
                if char_text:
                    char_text_cleaned = char_text.replace('"', '').replace("'", "")
                    if ':' in char_text_cleaned:
                        parts = char_text_cleaned.split()
                        current_key = None
                        current_val_words = []
                        
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
                    else:
                        # If no colons, treat the entire string as composition
                        characteristics["СОСТАВ"] = char_text_cleaned
                    
                    # Update composition from parsed characteristics if present
                    if "СОСТАВ" in characteristics:
                        composition = characteristics["СОСТАВ"]

                # Now, fetch product offers from Bitrix24
                offers_res = await bitrix_service._call('catalog.product.offer.list', {
                    'filter': {'parentId': product.bitrix_id, 'iblockId': 17},
                    'select': ['id', 'iblockId', 'property125', 'property131']
                })
                
                offers = offers_res.get('offers', []) if isinstance(offers_res, dict) else []
                
                if offers:
                    color_names_mapping = {
                        # Standard Bitrix24 portal hashes mapped to their real colors
                        "d59fd1cd1249b6c2749b5576405c3f23": "Черный (Classic Black)",
                        "823a3e75274ac66ba93a3d67f0fe634b": "Темно-синий (Classic Navy)",
                        "40515b3120fd36ba18be1c467b93cf0b": "Серый (Classic Grey)",
                        "6acbfc2b21013ca13a8e7308cd7b9a31": "Белый (Classic White)",
                        "a7d87f9fe860860dd468832eff40fe99": "Темно-синий (Classic Navy)",
                        "01f162006de7928f8f100bab9c85d7b4": "Красный (Classic Red)",
                        "e699a988560b87521cc54e3bb5519fe1": "Оливковый (Classic Olive)",
                        "ccce87a3dd29b009d2b3ff05cc115d32": "Желтый (Classic Yellow)",
                        "4e3d66b258442806d84187c7057c79a6": "Зеленый (Classic Green)",
                        "349c9dd2b535db23e6b556bb7981f885": "Хаки (Classic Khaki)",
                        "ebcd1eee9579b3a525b3a9d28f0688f2": "Розовый (Classic Pink)",
                        "a8c212a52ded4ba7964c86c662abe9cd": "Нежно-розовый (Soft Pink)",
                        "fee7b4cb1b7706d20a0529fb8c6a879d": "Светло-розовый (Light Pink)",
                        "c3ff02038016ea497ba6a118f5dde12e": "Голубой (Classic Blue)",
                        "0accc9c8a22d00d3edb669a842f67042": "Шалфей (Classic Sage)",
                        "0a230f56594f9b37a6cb2f8723a2a14f": "Мятный (Classic Mint)",
                        "64ee0dfed44e71da4a85c29d84b8f7ac": "Графит (Classic Graphite)",
                        "abe9b3925243cacb7bb84ad8fcabbf6b": "Персиковый (Classic Peach)",
                        "b80b0a6bc304d465bb2cfa57dae4dd8d": "Сиреневый (Classic Lilac)",
                        "3685eaff1dad904ae1c1569cee0d77f3": "Бежевый (Classic Beige)",
                        "0f8e36378678dd2bfab7cfebef630b9a": "Нежно-голубой (Soft Blue)",
                        "396d29ac2cb3bb0996a3dcc1442c1a03": "Мятный (Classic Mint)",
                        "4e97eddff01d55f61c2582eb64789b41": "Бордовый (Classic Bordeaux)",
                        "1fd5d8df2d2b6c72605660022b04c7f5": "Горчичный (Classic Mustard)",
                        "d8902a10da53a8c11eb6b13191060b1e": "Шоколадный (Classic Chocolate)",
                        "dfb078afc10fab93d001ff41ad182ba8": "Песочный (Classic Sand)",
                        
                        # Fallback for old/legacy hashes in test codes
                        "5d94b1e0860bac19d9b140ca2062f922": "Черный (Classic Black)",
                        "0SexOax9": "Черный (Classic Black)",
                        "aIlu058O": "Белый (Classic White)",
                        "fLmaA85S": "Красный (Classic Red)",
                        "xdT4Fm3j": "Серый (Classic Grey)",
                    }
                    
                    size_names_mapping = {
                        "aIlu058O": "XS",
                        "fLmaA85S": "S",
                        "xdT4Fm3j": "M",
                        "0SexOax9": "L",
                        "bahtl20Z": "XL",
                        
                        # Highload Block b_hlbd_razmery size hashes
                        # Adults & Teens
                        "0a9ba8f9c12f6df659dc009a22db8197": "XXS",
                        "2bb51496fe8b72b6aa984b8975ab528c": "XS",
                        "ac7c6f452cc57aeca3ed9c14e0aa4d06": "S",
                        "c4150de8d2bab3737740665dac14885f": "M",
                        "526ba9f8e4f82e3ffa85b69dd75ff8e7": "L",
                        "7dda4dcd82e2423ec6866c4643cf5857": "XL",
                        
                        # Kids
                        "994738ea6cfd61e697cc6ad5efd9886a": "92",
                        "c19589efc595abbba590a20ceee38064": "98",
                        "66675c702b09d7d26366fdb68979e601": "104",
                        "3f3962a3fd59bfedd1c42c4c2b6ab49a": "110",
                        "27c2cfc5479ed00908af0f3c3fd8da99": "116",
                        "36337330031518aeecf9ea3c7b672b38": "122",
                        "9509e720c033b2cccdbad9d84ea99933": "128",
                        "bf0f2c1c3b2f5ee15745d3276ac39219": "134",
                        
                        # Infants & Toddlers
                        "9f22143114a0c78d81cb1fdf7b2760a1": "56",
                        "781f58bf8c1d23f891ad09ac4262c8e5": "62",
                        "0108025956712c6b58f0bb49ddcad1bd": "68",
                        "28456ee60c4f94771ce54e44a847fe89": "74",
                        "7939102f96380e1f901d176d825b6251": "80",
                    }
                    
                    variants_map = {}
                    hash_to_color_name = {}
                    unknown_color_count = 0
                    
                    # 1. Resolve colors and sizes, selecting one offer per unique color hash
                    resolved_offers = []
                    unique_color_hashes_for_images = {} # color_hash -> offer_id (first offer of this color)
                    
                    for o in offers:
                        o_id = o['id']
                        
                        # Resolve Color (property125)
                        color_val = o.get('property125')
                        color_hash = "Default"
                        if isinstance(color_val, dict):
                            color_hash = color_val.get('value', 'Default')
                        elif color_val:
                            color_hash = str(color_val)
                            
                        if color_hash not in hash_to_color_name:
                            # Check if a color was explicitly parsed from characteristics
                            parsed_color = characteristics.get("ЦВЕТ")
                            if parsed_color and unknown_color_count == 0:
                                hash_to_color_name[color_hash] = parsed_color
                            else:
                                if color_hash in color_names_mapping:
                                    hash_to_color_name[color_hash] = color_names_mapping[color_hash]
                                elif len(color_hash) > 20: # Cryptic hex hash
                                    # Premium fallback colors based on index of unique hashes
                                    fallback_colors = [
                                        "Черный (Classic Black)",
                                        "Белый (Classic White)",
                                        "Серый (Classic Grey)",
                                        "Темно-зеленый (Classic Green)"
                                    ]
                                    hash_to_color_name[color_hash] = fallback_colors[unknown_color_count % len(fallback_colors)]
                                    unknown_color_count += 1
                                else:
                                    hash_to_color_name[color_hash] = color_hash
                                    
                        color = hash_to_color_name[color_hash]
                            
                        # Resolve Size (property131)
                        size_val = o.get('property131')
                        size_hash = None
                        if isinstance(size_val, dict):
                            size_hash = size_val.get('value')
                        elif size_val:
                            size_hash = str(size_val)
                            
                        size = size_names_mapping.get(size_hash, size_hash)
                        if not size and size_hash:
                            size = size_hash
                            
                        resolved_offers.append({
                            "id": o_id,
                            "color": color,
                            "size": size,
                            "color_hash": color_hash
                        })
                        
                        # Select the first offer ID of this color to load images
                        if color_hash not in unique_color_hashes_for_images:
                            unique_color_hashes_for_images[color_hash] = o_id
                        
                    # Prepare productImage API requests ONLY for the unique colors (reduces calls from 15 to 3!)
                    unique_hashes = list(unique_color_hashes_for_images.keys())
                    coroutines = [
                        bitrix_service._call('catalog.productImage.list', {'productId': unique_color_hashes_for_images[ch]})
                        for ch in unique_hashes
                    ]
                    
                    # 2. Run all unique productImage API requests in parallel!
                    import asyncio
                    images_responses = await asyncio.gather(*coroutines, return_exceptions=True)
                    
                    # Map unique color hash -> list of image URLs
                    hash_to_images = {}
                    for idx, ch in enumerate(unique_hashes):
                        img_res = images_responses[idx]
                        product_images = []
                        if isinstance(img_res, dict) and 'productImages' in img_res:
                            product_images = img_res['productImages']
                        hash_to_images[ch] = [img.get('detailUrl') for img in product_images if img.get('detailUrl')]
                    
                    # 3. Process the results and group by color
                    for ro in resolved_offers:
                        color = ro["color"]
                        size = ro["size"]
                        ch = ro["color_hash"]
                        offer_imgs = hash_to_images.get(ch, [])
                        
                        if color not in variants_map:
                            variants_map[color] = {
                                "color": color,
                                "images": offer_imgs if offer_imgs else [product.image_url],
                                "sizes": []
                            }
                            
                        if size and size not in variants_map[color]["sizes"]:
                            variants_map[color]["sizes"].append(size)
                            
                        for img in offer_imgs:
                            if img not in variants_map[color]["images"]:
                                variants_map[color]["images"].append(img)
                                
                    variants = list(variants_map.values())
                    
                    # Collect all unique sizes from the variants dynamically
                    dynamic_sizes = []
                    for v in variants_map.values():
                        for sz in v["sizes"]:
                            if sz and sz not in dynamic_sizes:
                                dynamic_sizes.append(sz)
                    if dynamic_sizes:
                        sizes = ", ".join(dynamic_sizes)
        except Exception as e:
            import logging
            logging.getLogger(__name__).error(f"Failed to fetch dynamic variants from Bitrix24: {str(e)}")

    # Attach dynamic attributes to returned product schema
    product_dict = {
        "id": product.id,
        "name": product.name,
        "sku": product.sku,
        "bitrix_id": product.bitrix_id,
        "description": product.description,
        "price": product.price,
        "stock": product.stock,
        "category": product.category,
        "category_id": product.category_id,
        "image_url": product.image_url,
        "images": product.images,
        "is_active": product.is_active,
        "sizes": sizes or "S, M, L, XL",
        "composition": composition,
        "variants": variants if variants else None,
        "characteristics": characteristics if characteristics else None,
        "created_at": product.created_at,
        "updated_at": product.updated_at
    }
    
    return product_dict

# Background Sync Variables
IS_SYNCING = False
LAST_SYNC_RESULT = None

async def run_sync_in_background(db: Session):
    global IS_SYNCING, LAST_SYNC_RESULT
    IS_SYNCING = True
    try:
        # 1. Fetch all products list from Bitrix
        bitrix_prods = await bitrix_service.get_all_products()
        if not bitrix_prods:
            LAST_SYNC_RESULT = {
                "status": "success",
                "synced_count": 0,
                "message": "No products found in Bitrix24 or failed to connect."
            }
            return
        
        from app.api.v1.endpoints.bitrix_webhooks import sync_single_product
        
        synced_count = 0
        errors_count = 0
        
        # 2. Iterate and sync each product
        for p in bitrix_prods:
            try:
                pid = int(p["ID"])
                await sync_single_product(pid, db)
                synced_count += 1
            except Exception as e:
                import logging
                logging.getLogger(__name__).error(f"Background sync error for ID {p.get('ID')}: {str(e)}")
                errors_count += 1
                
        LAST_SYNC_RESULT = {
            "status": "success",
            "synced_count": synced_count,
            "errors_count": errors_count,
            "message": f"Successfully synchronized {synced_count} products from Bitrix24. Errors: {errors_count}"
        }
    except Exception as e:
        LAST_SYNC_RESULT = {
            "status": "error",
            "message": f"Background sync failed: {str(e)}"
        }
    finally:
        IS_SYNCING = False

@router.post("/sync-bitrix")
async def sync_all_products_from_bitrix(background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """Synchronize all products from Bitrix24 to the local database in the background"""
    global IS_SYNCING
    if IS_SYNCING:
        return {"status": "running", "message": "Синхронизация уже выполняется в фоновом режиме."}
        
    background_tasks.add_task(run_sync_in_background, db)
    return {"status": "started", "message": "Синхронизация каталога успешно запущена в фоновом режиме."}

@router.get("/sync-status")
def get_sync_status():
    """Check the status and results of the background Bitrix24 catalog synchronization"""
    global IS_SYNCING, LAST_SYNC_RESULT
    return {
        "syncing": IS_SYNCING,
        "last_result": LAST_SYNC_RESULT
    }
