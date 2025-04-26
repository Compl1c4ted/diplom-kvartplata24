from sqlalchemy import Column, Integer, String, ForeignKey, Numeric, DateTime
from sqlalchemy.orm import relationship
from app.database import Base

class Meter(Base):
    __tablename__ = "meters"

    id = Column(Integer, primary_key=True, autoincrement=True)
    property_id = Column(Integer, ForeignKey("properties.id"), nullable=False)  # Связь с объектом недвижимости
    type = Column(String, nullable=False)  # Тип счетчика: hot_water, cold_water, electricity_day, electricity_night
    meter_number = Column(String, nullable=False, unique=True)  # Уникальный идентификатор счетчика

    # Связь с объектом недвижимости
    property = relationship("Property", back_populates="meters")
    # Связь с показаниями
    readings = relationship("Reading", back_populates="meter")