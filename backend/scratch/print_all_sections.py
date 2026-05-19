import asyncio
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))

from app.services.bitrix import bitrix_service

async def print_sections():
    sections = await bitrix_service.get_sections()
    print("=== BITRIX24 CATALOG SECTIONS ===")
    for s in sections:
        print(f"ID: {s.get('ID')} | Name: '{s.get('NAME')}' | Parent: {s.get('SECTION_ID')}")

if __name__ == "__main__":
    asyncio.run(print_sections())
