import sys
import os

# Add the parent directory to sys.path to import app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import SessionLocal, engine, Base
from app.models.user import User
from app.core.security import get_password_hash

def create_user():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    email = "admin@liberty.uz"
    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(
            email=email,
            hashed_password=get_password_hash("admin123"),
            full_name="Super Admin",
            role="admin",
            is_active=True
        )
        db.add(user)
        db.commit()
        print(f"User {email} created successfully!")
    else:
        print(f"User {email} already exists.")
    db.close()

    # Create home page content
    home_content = db.query(models.PageContent).filter(models.PageContent.page_name == "home").first()
    if not home_content:
        home_content = models.PageContent(
            page_name="home",
            data={
                "hero": {
                    "titleFirst": "Премиальная Одежда",
                    "titleSecond": "Искусство",
                    "titleThird": "Простоты",
                    "subtitle": "Исключительное мастерство встречается с современным дизайном для современного человека.",
                    "primaryBtn": "В магазин",
                    "secondaryBtn": "Лукбук",
                    "imageUrl": "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop"
                }
            }
        )
        db.add(home_content)
        db.commit()
        print("Home page content seeded successfully!")

if __name__ == "__main__":
    create_user()
