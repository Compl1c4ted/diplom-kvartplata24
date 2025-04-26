from sqlalchemy import Column, Table, Integer, String, ForeignKey, Numeric, DateTime
from sqlalchemy.orm import relationship
from app.database import Base

# receipt_readings = Table(
#     'receipt_readings',
#     Base.metadata,
#     Column('receipt_id', Integer, ForeignKey('receipts.id'), primary_key=True),
#     Column('reading_id', Integer, ForeignKey('readings.id'), primary_key=True)
# )

class Reading(Base):
    __tablename__ = "readings"

    id = Column(Integer, primary_key=True, autoincrement=True)
    meter_id = Column(Integer, ForeignKey("meters.id"), nullable=False)
    current_value = Column(Numeric, nullable=False)  # Текущее показание счетчика
    previous_value = Column(Numeric, nullable=True)  # Предыдущее показание счетчика
    tariff = Column(Numeric, nullable=False)  # Тариф (стоимость за единицу)
    total_cost = Column(Numeric, nullable=False)  # Общая стоимость (разница между текущим и предыдущим показанием * тариф)

    receipt_id = Column(Integer, ForeignKey("receipts.id"), nullable=True)
    receipt = relationship("Receipt", back_populates="readings")    # Связь с счетчиком
    meter = relationship("Meter", back_populates="readings")