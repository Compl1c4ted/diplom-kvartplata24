from app.tariffs.models import Tariff
from sqlalchemy import select
from app.database import async_session_maker
from app.tariffs.models import Tariff
from app.meters.models import Meter
from app.dao.base import BaseDAO


class TariffDAO(BaseDAO):
    model = Tariff

    @classmethod
    async def find_by_type(cls, type: str):
        async with async_session_maker() as session:
            query = select(Tariff).where(Tariff.type == type)
            result = await session.execute(query)
            return result.scalar_one_or_none()

    @classmethod
    async def get_all_tariffs(cls):
        async with async_session_maker() as session:
            query = select(Tariff)
            result = await session.execute(query)
            return result.scalars().all()

    @classmethod
    async def create_tariff(cls, type: str, rate: float):
        async with async_session_maker() as session:
            # Проверяем, существует ли тариф с таким типом
            existing_tariff = await cls.find_by_type(type)
            if existing_tariff:
                raise ValueError("Тариф с таким типом уже существует")

            # Создаем новый тариф
            new_tariff = Tariff(type=type, rate=rate)
            session.add(new_tariff)
            await session.commit()
            await session.refresh(new_tariff)
            return new_tariff

    @classmethod
    async def update_tariff(cls, tariff_id: int, rate: float):
        async with async_session_maker() as session:
            # Находим тариф по id
            query = select(Tariff).where(Tariff.id == tariff_id)
            result = await session.execute(query)
            tariff = result.scalar_one_or_none()
            if not tariff:
                raise ValueError("Тариф не найден")

            # Обновляем тариф
            tariff.rate = rate
            await session.commit()
            await session.refresh(tariff)
            return tariff

    @classmethod
    async def delete_tariff(cls, tariff_id: int):
        async with async_session_maker() as session:
            # Находим тариф по id
            query = select(Tariff).where(Tariff.id == tariff_id)
            result = await session.execute(query)
            tariff = result.scalar_one_or_none()
            if not tariff:
                raise ValueError("Тариф не найден")

            # Удаляем тариф
            await session.delete(tariff)
            await session.commit()
            return {"message": "Тариф успешно удален"}
        
    @classmethod
    async def find_by_meter_id(cls, meter_id: int):
        """
        Находим тариф по ID счетчика (через тип счетчика)
        """
        async with async_session_maker() as session:
            # Сначала получаем тип счетчика
            meter_query = select(Meter).where(Meter.id == meter_id)
            meter_result = await session.execute(meter_query)
            meter = meter_result.scalar_one_or_none()
            
            if not meter:
                return None
                
            # Затем находим тариф по типу счетчика
            tariff_query = select(Tariff).where(Tariff.type == meter.type)
            tariff_result = await session.execute(tariff_query)
            return tariff_result.scalar_one_or_none()
        
    @classmethod
    async def find_by_meter_id(cls, meter_id: int):
        """
        Находим тариф по ID счетчика (через тип счетчика)
        """
        async with async_session_maker() as session:
            try:
                # Сначала получаем счетчик
                meter_query = select(Meter).where(Meter.id == meter_id)
                meter_result = await session.execute(meter_query)
                meter = meter_result.scalar_one_or_none()
                
                if not meter:
                    return None
                    
                # Затем находим тариф по типу счетчика
                tariff_query = select(Tariff).where(Tariff.type == meter.type)
                tariff_result = await session.execute(tariff_query)
                tariff = tariff_result.scalar_one_or_none()
                
                # Устанавливаем значение по умолчанию для unit, если оно None
                if tariff and tariff.unit is None:
                    tariff.unit = "ед."  # Или другое значение по умолчанию
                    
                return tariff
                
            except Exception as e:
                print(f"Error in find_by_meter_id: {e}")
                raise