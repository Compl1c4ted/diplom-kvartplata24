from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from app.database import async_session_maker
from app.meters.models import Meter
from app.tariffs.dao import TariffDAO
from app.dao.base import BaseDAO
from decimal import Decimal

    
class MetersDAO(BaseDAO):
    model = Meter

    @classmethod
    async def create_meter(cls, property_id: int, type: str, meter_number: str):
        async with async_session_maker() as session:
            new_meter = Meter(
                property_id=property_id,
                type=type,
                meter_number=meter_number
            )
            session.add(new_meter)
            await session.commit()
            await session.refresh(new_meter)
            return new_meter
    
    @classmethod
    async def get_meters_by_property(cls, property_id: int):
        async with async_session_maker() as session:
            query = select(Meter).where(Meter.property_id == property_id)
            result = await session.execute(query)
            return result.scalars().all()
    
    @classmethod
    async def get_meters_by_property(cls, property_id: int):
        async with async_session_maker() as session:
            query = select(Meter).where(Meter.property_id == property_id)
            result = await session.execute(query)
            return result.scalars().all()