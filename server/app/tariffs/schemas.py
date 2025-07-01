from pydantic import BaseModel, Field
from enum import Enum
from datetime import datetime
from typing import Optional


class STariffCreate(BaseModel):
    type: str
    rate: float

class STariffUpdate(BaseModel):
    rate: float

class STariff(BaseModel):
    id: int
    type: str
    rate: float
    unit: Optional[str] = Field(None, description="Единица измерения")  # Делаем поле необязательным
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True