import httpx
import logging
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)

class BitrixService:
    def __init__(self):
        # Using the webhook provided by user
        self.base_url = "https://yustex.bitrix24.uz/rest/11/6kuit00wrbcyega9/"
        self.timeout = 30.0

    async def _call(self, method: str, params: Dict[str, Any] = None, timeout: float = None) -> Dict[str, Any]:
        """Generic method to call Bitrix24 REST API"""
        url = f"{self.base_url}{method}"
        async with httpx.AsyncClient(timeout=timeout or self.timeout) as client:
            try:
                response = await client.post(url, json=params or {})
                response.raise_for_status()
                data = response.json()
                if "error" in data:
                    logger.error(f"Bitrix API error in {method}: {data.get('error_description')}")
                    return {"error": data["error"], "description": data.get("error_description")}
                return data.get("result", data)
            except Exception as e:
                logger.error(f"Failed to call Bitrix API {method}: {str(e)}")
                return {"error": "connection_error", "description": str(e)}

    # 1. Product Catalog Sync
    async def get_all_products(self) -> List[Dict[str, Any]]:
        """Fetch all products from Bitrix24"""
        products = []
        start = 0
        while True:
            result = await self._call("crm.product.list", {
                "order": {"ID": "ASC"},
                "select": ["ID", "NAME", "DESCRIPTION", "PRICE", "CURRENCY_ID", "XML_ID", "PREVIEW_PICTURE", "DETAIL_PICTURE", "PROPERTY_45", "PROPERTY_113", "SECTION_ID"],
                "start": start
            })
            
            if isinstance(result, list):
                products.extend(result)
                if len(result) < 50: # Default limit
                    break
                start += len(result)
            else:
                break
        return products

    async def get_product_fields(self) -> Dict[str, Any]:
        """Get description of product fields"""
        return await self._call("crm.product.fields")

    async def get_sections(self) -> List[Dict[str, Any]]:
        """Fetch all product sections from Bitrix24"""
        result = await self._call("crm.productsection.list", {
            "order": {"SORT": "ASC"},
            "select": ["ID", "NAME", "SECTION_ID"]
        })
        return result if isinstance(result, list) else []

    # 2. Contact Management
    async def find_contact_by_email_or_phone(self, email: str = None, phone: str = None) -> Optional[Dict[str, Any]]:
        """Check if contact exists in Bitrix24 using email or phone"""
        if not email and not phone:
            return None
        
        filter_params = {}
        if email:
            filter_params["EMAIL"] = email
        if phone:
            filter_params["PHONE"] = phone
            
        result = await self._call("crm.contact.list", {
            "filter": filter_params,
            "select": ["ID", "NAME", "LAST_NAME", "EMAIL", "PHONE"]
        })
        
        if result and isinstance(result, list) and len(result) > 0:
            return result[0]
        return None

    async def create_contact(self, contact_data: Dict[str, Any]) -> Optional[int]:
        """Create a new contact in Bitrix24"""
        result = await self._call("crm.contact.add", {"fields": contact_data})
        if isinstance(result, int):
            return result
        return None

    async def add_timeline_event(self, entity_id: int, entity_type: str, message: str):
        """Add event to entity timeline (e.g. for registration)"""
        # Note: Bitrix24 timeline API can be complex, often done via crm.livefeedmessage.add or similar
        # For simplicity, using a generic activity as a timeline item
        await self._call("crm.activity.add", {
            "fields": {
                "OWNER_ID": entity_id,
                "OWNER_TYPE_ID": 3, # 3 is Contact
                "TYPE_ID": 4, # 4 is Message/Event
                "SUBJECT": "Активность на сайте",
                "COMPLETED": "Y",
                "DESCRIPTION": message
            }
        })

    # 3. Deals & Cart
    async def create_deal(self, deal_data: Dict[str, Any]) -> Optional[int]:
        """Create a new deal in Bitrix24"""
        result = await self._call("crm.deal.add", {"fields": deal_data})
        if isinstance(result, int):
            return result
        return None

    async def set_deal_products(self, deal_id: int, products: List[Dict[str, Any]]):
        """Set product rows for a deal"""
        # products format: [{"PRODUCT_ID": 123, "PRICE": 100, "QUANTITY": 2}, ...]
        await self._call("crm.deal.productrows.set", {
            "id": deal_id,
            "rows": products
        })

    async def update_deal_stage(self, deal_id: int, stage_id: str):
        """Update deal stage (e.g. to 'Paid')"""
        await self._call("crm.deal.update", {
            "id": deal_id,
            "fields": {"STAGE_ID": stage_id}
        })

    async def get_contact_deals(self, contact_id: int) -> List[Dict[str, Any]]:
        """Get all deals for a contact from Bitrix24"""
        result = await self._call("crm.deal.list", {
            "filter": {"CONTACT_ID": contact_id},
            "select": ["ID", "TITLE", "OPPORTUNITY", "STAGE_ID", "DATE_CREATE"]
        })
        if isinstance(result, list):
            return result
        return []

    async def get_deal_products(self, deal_id: int) -> List[Dict[str, Any]]:
        """Get product rows for a specific deal"""
        result = await self._call("crm.deal.productrows.get", {"id": deal_id}, timeout=2.0)
        if isinstance(result, list):
            return result
        return []

    async def get_all_deals(self) -> List[Dict[str, Any]]:
        """Get all deals from Bitrix24"""
        result = await self._call("crm.deal.list", {
            "order": {"ID": "DESC"},
            "select": ["ID", "TITLE", "OPPORTUNITY", "STAGE_ID", "DATE_CREATE"]
        }, timeout=3.0)
        if isinstance(result, list):
            return result
        return []

    async def delete_deal(self, deal_id: int) -> Dict[str, Any]:
        """Delete a deal in Bitrix24 by ID"""
        return await self._call("crm.deal.delete", {"id": deal_id})

bitrix_service = BitrixService()
