from app.core.database import SessionLocal


# get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
