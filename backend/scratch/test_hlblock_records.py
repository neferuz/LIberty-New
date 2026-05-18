import asyncio
from app.services.bitrix import bitrix_service

async def test_hl():
    print("=== TESTING hlblock.definition.list ===")
    try:
        res = await bitrix_service._call('hlblock.definition.list', {})
        print("Success! Definitions list:")
        import pprint
        pprint.pprint(res)
        
        # Look for table names b_hlbd_699444a3da96c and b_hlbd_razmery
        definitions = res.get('result', []) if isinstance(res, dict) else []
        for def_item in definitions:
            tbl_name = def_item.get('tableName')
            hl_id = def_item.get('id')
            print(f"HLBlock: ID={hl_id} | Name={def_item.get('name')} | Table={tbl_name}")
            
            # Query elements for this block!
            print(f"  Fetching records for HLBlock ID {hl_id}...")
            try:
                rec_res = await bitrix_service._call('hlblock.record.list', {
                    'HLBLOCK_ID': hl_id
                })
                print(f"  Records response keys: {list(rec_res.keys()) if isinstance(rec_res, dict) else rec_res}")
                if isinstance(rec_res, dict) and 'result' in rec_res:
                    records = rec_res['result']
                    print(f"  Found {len(records)} records!")
                    for r in records[:15]: # Show first 15 records
                        print(f"    Record: {r}")
            except Exception as e:
                print(f"  Failed to get records: {e}")
                
    except Exception as e:
        print(f"hlblock.definition.list failed: {e}")

if __name__ == "__main__":
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.run_until_complete(test_hl())
