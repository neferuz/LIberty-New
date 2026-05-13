from typing import Dict, Any, Optional
from pydantic import BaseModel

class PageContentBase(BaseModel):
    page_name: str
    data: Any

class PageContentCreate(PageContentBase):
    pass

class PageContentUpdate(BaseModel):
    data: Any

class PageContent(PageContentBase):
    id: int

    class Config:
        from_attributes = True
