from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum
from decimal import Decimal
from datetime import datetime
from app.receipts.schemes import SReceiptResponse

class SReadingCreate(BaseModel):
    meter_id: int = Field(..., description="ID счетчика")
    current_value: float = Field(..., description="Показание счетчика")

class SReadingResponse(BaseModel):
    id: int = Field(..., description="ID показания")
    meter_id: int = Field(..., description="ID счетчика")
    current_value: Decimal = Field(..., description="Текущее показание")
    previous_value: Optional[Decimal] = Field(None, description="Предыдущее показание")
    tariff: Decimal = Field(..., description="Тариф")
    total_cost: Decimal = Field(..., description="Общая стоимость")
    created_at: datetime = Field(..., description="Дата создания")
    

class SReadingWithReceiptResponse(BaseModel):
    reading: SReadingResponse
    receipt: Optional[SReceiptResponse] = None
    message: str

    class Config:
        from_attributes = True
        json_encoders = {
            Decimal: lambda v: str(v)  # Для корректной сериализации Decimal
        }
# class MeterType(str, Enum):
#     HOT_WATER = "hot_water"
#     COLD_WATER = "cold_water"
#     ELECTRICITY = "electricity_day"
#     ELECTRICITY_NIGHT = "electricity_night"

# class SMeterCreate(BaseModel):
#     property_id: int = Field(..., description="ID объекта недвижимости")
#     type: MeterType = Field(..., description="Тип счетчика")
#     meter_number: str = Field(..., description="Уникальный идентификатор счетчика")