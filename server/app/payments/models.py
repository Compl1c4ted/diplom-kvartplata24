# from app.database import Base
# from sqlalchemy import Column, Integer, Numeric, DateTime, String, ForeignKey, Boolean
# from sqlalchemy.sql import func
# from sqlalchemy.orm import relationship

# class Payment(Base):
#     __tablename__ = "payments"

#     id = Column(Integer, primary_key=True)
#     amount = Column(Numeric(10, 2))
#     payment_date = Column(DateTime, server_default=func.now())
#     status = Column(String(20), default="pending")
#     payment_method = Column(String(50))
#     transaction_id = Column(String(100), unique=True)
#     transaction_date = Column(DateTime, nullable=False)
#     paid = Column(Boolean, nullable=False)

#     # receipt_id = Column(Integer, ForeignKey("receipts.id"))
#     # receipt = relationship("Receipt", back_populates="payments")

#     property = relationship("Property", back_populates="payments")

#     def __repr__(self):
#         return f"<Payment {self.id} {self.status}>"