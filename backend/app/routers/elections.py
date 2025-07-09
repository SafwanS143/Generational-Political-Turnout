from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.database import SessionLocal
from backend.app.models import Institution

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/api/voter-turnout")
def get_voter_turnout(db: Session = Depends(get_db)):
    institutions = db.query(Institution).all()
    return [
        {
            "province": i.province,
            "name": i.name,
            "votes": i.votes,
            "latitude": i.latitude,
            "longitude": i.longitude,
            "geocode_status": i.geocode_status,
            "geocode_address": i.geocode_address,
        }
        for i in institutions
    ]
