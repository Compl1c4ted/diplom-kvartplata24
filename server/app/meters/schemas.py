from pydantic import BaseModel, Field
from enum import Enum

class MeterType(str, Enum):
    HOT_WATER = "hot_water"
    COLD_WATER = "cold_water"
    ELECTRICITY = "electricity_day"
    ELECTRICITY_NIGHT = "electricity_night"

class SMeterCreate(BaseModel):
    property_id: int = Field(..., description="ID объекта недвижимости")
    type: MeterType = Field(..., description="Тип счетчика")
    meter_number: str = Field(..., description="Уникальный идентификатор счетчика")