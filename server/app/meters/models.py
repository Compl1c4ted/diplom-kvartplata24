from sqlalchemy import Column, Integer, String, ForeignKey, Numeric, DateTime
from sqlalchemy.orm import relationship
from app.database import Base

class Meter(Base):
    __tablename__ = "meters"

    id = Column(Integer, primary_key=True, autoincrement=True)
    property_id = Column(Integer, ForeignKey("properties.id"), nullable=False)
    type = Column(String, nullable=False)  # water, electricity, gas
    meter_number = Column(String, nullable=False, unique=True)
    tariff = Column(Numeric(10, 2), nullable=False)  # Добавляем тариф
    last_reading_value = Column(Numeric(10, 2), nullable=True)  # Последнее показание
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    property = relationship("Property", back_populates="meters")
    readings = relationship("Reading", back_populates="meter")