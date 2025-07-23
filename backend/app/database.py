from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

DATABASE_URL = "postgresql://elections_db_ckkt_user:isAgxHZ8JYKCyi8owYjR0ilygxi1u6fl@dpg-d203klmuk2gs738tqgng-a.virginia-postgres.render.com/elections_db_ckkt"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
