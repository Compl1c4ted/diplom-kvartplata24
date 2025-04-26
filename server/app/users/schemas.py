from pydantic import BaseModel, EmailStr, Field, validator
import re


class SUserRegister(BaseModel):
    email: EmailStr = Field(..., description="Электронная почта")
    hashed_password: str = Field(..., min_length=5, max_length=50, description="Пароль, от 5 до 50 знаков")


class SUserAuth(BaseModel):
    email: EmailStr = Field(..., description="Электронная почта")
    hashed_password: str = Field(..., min_length=5, max_length=50, description="Пароль, от 5 до 50 знаков")