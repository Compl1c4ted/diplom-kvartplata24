from sqlalchemy import Column, Integer, String, ForeignKey, Numeric, DateTime, Float, func
from sqlalchemy.orm import relationship
from app.database import Base


class Tariff(Base):
    __tablename__ = "tariffs"
    
    id = Column(Integer, primary_key=True)
    type = Column(String, unique=True, nullable=False)  # Например: "electricity", "water"
    rate = Column(Numeric, nullable=False)  # Ставка тарифа
    unit = Column(String, nullable=True)  # Единица измерения
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())