from app.database import Base
from sqlalchemy.orm import relationship
from sqlalchemy import Column, Date, Integer, String, Numeric, Boolean, ForeignKey, DateTime
# Доделать бек для квитанций, чтобы все правильно считалось,
# Также сделать переход из квитанций в подробную информацию, 
# где можно посмотреть за каждую услугу кол-во потраченого 
# ресурса, а также сколько и кода пользователь заплатил, 
# или не заплатитл. 
# Сделать выгрузку PDF отчета для удобства пользователя.

# На счет фронта вообще пока молчу:)
class Receipt(Base):
    __tablename__ = "receipts"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    transaction_number = Column(String(50), unique=True, nullable=False)
    transaction_date = Column(Date, nullable=False)
    amount = Column(Numeric, nullable=False)
    status = Column(String, nullable=False, default="Pending")
    paid = Column(Boolean)
    payment_date = Column(DateTime, nullable=True)
    # Привязка платежа к пользователю и недвижимости
    # Надо ли property_id?? Или достаточно привязки 
    # по объекту недвижимости
    readings = relationship("Reading", back_populates="receipt")
    property_id = Column(Integer, ForeignKey("properties.id"), nullable=False)
    property = relationship("Property", back_populates="receipts")

    def __repr__(self):
        return f"<Receipt id={self.id} transaction={self.transaction_number} status: {self.status}>"
