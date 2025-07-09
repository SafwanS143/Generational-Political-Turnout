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


