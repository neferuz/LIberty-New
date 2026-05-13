from sqlalchemy import Column, Integer, String, Text, JSON
from app.db.session import Base

class PageContent(Base):
    __tablename__ = "page_content"

    id = Column(Integer, primary_key=True, index=True)
    page_name = Column(String, unique=True, index=True) # e.g., "home"
    data = Column(JSON) # Stores section-specific data
