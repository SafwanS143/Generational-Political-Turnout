import pandas as pd
from backend.app.database import SessionLocal
from backend.app.models import Institution

df = pd.read_csv("data/voter_turnout_with_coords.csv")
session = SessionLocal()

for _, row in df.iterrows():
    inst = Institution(
        province=row["Province"],
        name=row["Post-secondary Institution"],
        votes=int(row["43rd General Election"].replace(",", "")) if pd.notnull(row["43rd General Election"]) else None,
        latitude=row["latitude"] if pd.notnull(row["latitude"]) else None,
        longitude=row["longitude"] if pd.notnull(row["longitude"]) else None,
        geocode_status=row.get("geocode_status"),
        geocode_address=row.get("geocode_address"),
    )
    session.add(inst)
session.commit()
session.close()
