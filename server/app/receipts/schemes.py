from decimal import Decimal
from pydantic import BaseModel, Field
from datetime import date as DateType
from enum import Enum
from datetime import datetime
from typing import Optional

class ReceiptStatus(str, Enum):
    PENDING = "pending"
    PAID = "paid"
    FAILED = "failed"
    OVERDUE = "overdue"

class SReceiptBase(BaseModel):
    transaction_date: DateType = Field(..., description="Дата платежа")
    amount: Decimal = Field(..., description="Сумма оплаты")  # Изменено на Decimal
    property_id: int = Field(..., description="ID объекта недвижимости")

    class Config:
        json_encoders = {
            Decimal: lambda v: str(v)  # Для корректной сериализации Decimal
        }

class SReceiptCreate(BaseModel):
    property_id: int = Field(..., description="ID объекта недвижимости")
    
    # Убираем transaction_date и amount, так как они будут генерироваться автоматически
    class Config:
        from_attributes = True

class SReceiptSummary(BaseModel):
    month: DateType
    total_amount: float
    is_paid: bool
    
    class Config:
        from_attributes = True

class UtilitySummary(BaseModel):
    cold_water: Decimal
    hot_water: Decimal
    electricity_day: Decimal
    electricity_night: Decimal
    total: Decimal
    period_start: DateType
    period_end: DateType

class SReceiptResponse(BaseModel):
    id: int = Field(..., description="ID квитанции")
    transaction_number: str = Field(..., description="Номер транзакции")
    transaction_date: datetime = Field(..., description="Дата транзакции")
    amount: Decimal = Field(..., description="Сумма к оплате")
    status: ReceiptStatus = Field(..., description="Статус квитанции")
    paid: bool = Field(..., description="Оплачена ли квитанция")
    property_id: int = Field(..., description="ID объекта недвижимости")
    
    class Config:
        from_attributes = True
        json_encoders = {
            Decimal: lambda v: str(v),
            datetime: lambda v: v.isoformat()
        }

class SReceiptPayRequest(BaseModel):
    receipt_id: int = Field(..., description="ID квитанции для оплаты")

class SReceiptPayResponse(BaseModel):
    success: bool
    message: str
    receipt: Optional[SReceiptResponse] = None