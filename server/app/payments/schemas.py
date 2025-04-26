# from enum import Enum
# from pydantic import BaseModel
# from datetime import datetime

# class PaymentStatus(str, Enum):
#     PENDING = "pending"
#     COMPLETED = "completed"
#     FAILED = "failed"

# class PaymentCreate(BaseModel):
#     amount: float
#     payment_method: str
#     receipt_id: int

# class PaymentResponse(PaymentCreate):
#     id: int
#     payment_date: datetime
#     status: PaymentStatus
#     transaction_id: str