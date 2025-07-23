import pandas as pd
from app.database import SessionLocal
from app.models import Institution, AgeGenderTurnout

df = pd.read_csv("../data/voter_turnout_with_coords.csv")
session = SessionLocal()

for _, row in df.iterrows():
    inst = Institution(
        province=row["province"],
        name=row["name"],
        votes=int(str(row["votes"]).replace(",", "")) if pd.notnull(row["votes"]) else None,
        latitude=row["latitude"] if pd.notnull(row["latitude"]) else None,
        longitude=row["longitude"] if pd.notnull(row["longitude"]) else None,
        geocode_status=row.get("geocode_status"),
        geocode_address=row.get("geocode_address"),
    )
    session.add(inst)
session.commit()

# --- New AgeGenderTurnout import ---
df2 = pd.read_csv("../data/turnout_by_age_gender_and_province_ge38_ge44.csv")
for _, row in df2.iterrows():
    agt = AgeGenderTurnout(
        year=int(row["YEAR"]) if pd.notnull(row["YEAR"]) else None,
        election_e=row["ELECTION_E"] if pd.notnull(row["ELECTION_E"]) else None,
        election_f=row["ELECTION_F"] if pd.notnull(row["ELECTION_F"]) else None,
        province_id=int(row["PROVINCE_ID"]) if pd.notnull(row["PROVINCE_ID"]) else None,
        province=row["province"] if pd.notnull(row["province"]) else None,
        province_f=row["PROVINCE_F"] if pd.notnull(row["PROVINCE_F"]) else None,
        gender=row["gender"] if pd.notnull(row["gender"]) else None,
        gender_f=row["GENDER_F"] if pd.notnull(row["GENDER_F"]) else None,
        age_group_id=int(row["AGE_GROUP_ID"]) if pd.notnull(row["AGE_GROUP_ID"]) else None,
        age_group=row["age_group"] if pd.notnull(row["age_group"]) else None,
        age_group_f=row["AGE_GROUP_F"] if pd.notnull(row["AGE_GROUP_F"]) else None,
        votes=int(row["VOTES"]) if pd.notnull(row["VOTES"]) else None,
        eligible_electors=int(row["ELIGIBLE_ELECTORS"]) if pd.notnull(row["ELIGIBLE_ELECTORS"]) else None,
        turnout_rate=float(row["turnout_rate"]) if pd.notnull(row["turnout_rate"]) else None,
    )
    session.add(agt)
session.commit()
session.close()
