from sqlalchemy import Column, Integer, String, Float
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class Institution(Base):
    __tablename__ = "institutions"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    province = Column(String)
    name = Column(String)
    votes = Column(Integer)
    latitude = Column(Float)
    longitude = Column(Float)
    geocode_status = Column(String)
    geocode_address = Column(String)


class AgeGenderTurnout(Base):
    __tablename__ = "age_gender_turnout"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    year = Column(Integer)
    election_e = Column(String)
    election_f = Column(String)
    province_id = Column(Integer)
    province = Column(String)
    province_f = Column(String)
    gender = Column(String)
    gender_f = Column(String)
    age_group_id = Column(Integer)
    age_group = Column(String)
    age_group_f = Column(String)
    votes = Column(Integer)
    eligible_electors = Column(Integer)
    turnout_rate = Column(Float)


