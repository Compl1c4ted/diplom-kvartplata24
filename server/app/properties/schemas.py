from pydantic import BaseModel, EmailStr, Field, validator
import re


class SPropertyCreate(BaseModel):
    address: str = Field(..., description="Адрес объекта недвижимости")
    inn_uk: str = Field(..., description="ИНН УК")
    account_number: str = Field(..., description="Номер счета")

    class Config:
        from_attributes = True

        
class SPropertyAddInfo(BaseModel):
    square: str = Field(..., description="Площадь объекта недвижисоти")

