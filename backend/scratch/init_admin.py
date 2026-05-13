from sqlalchemy.orm import Session
from app.db.session import SessionLocal, engine
from app.models.user import User
from app.core.security import get_password_hash

def init_db():
    db = SessionLocal()
    # Check if admin exists
    admin = db.query(User).filter(User.email == "admin@example.com").first()
    if not admin:
        admin_user = User(
            email="admin@example.com",
            hashed_password=get_password_hash("admin"),
            full_name="Administrator",
            is_active=True,
            is_superuser=True
        )
        db.add(admin_user)
        db.commit()
        print("Admin user created: admin@example.com / admin")
    else:
        print("Admin user already exists")
    db.close()

if __name__ == "__main__":
    init_db()
