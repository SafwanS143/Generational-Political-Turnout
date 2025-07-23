from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import AgeGenderTurnout

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/api/age-gender-turnout")
def get_age_gender_turnout(db: Session = Depends(get_db)):
    records = db.query(AgeGenderTurnout).all()
    return [
        {
            "id": r.id,
            "year": r.year,
            "election_e": r.election_e,
            "election_f": r.election_f,
            "province_id": r.province_id,
            "province": r.province,
            "province_f": r.province_f,
            "gender": r.gender,
            "gender_f": r.gender_f,
            "age_group_id": r.age_group_id,
            "age_group": r.age_group,
            "age_group_f": r.age_group_f,
            "votes": r.votes,
            "eligible_electors": r.eligible_electors,
            "turnout_rate": r.turnout_rate,
        }
        for r in records
    ] 