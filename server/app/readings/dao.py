from sqlalchemy import select, and_, extract
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import selectinload
from app.database import async_session_maker
from app.readings.models import Reading
from app.receipts.dao import ReceiptsDAO
from app.properties.models import Property
from app.meters.models import Meter
from app.tariffs.dao import TariffDAO
from app.dao.base import BaseDAO
from decimal import Decimal
from datetime import datetime
import logging

logger = logging


class ReadingsDAO(BaseDAO):
    model = Reading

    @classmethod
    async def _get_meter_with_check(
        cls, 
        meter_id: int, 
        user_id: int, 
    ):
        async with async_session_maker() as session:
            """Получаем счетчик с проверкой прав доступа"""
            meter = await session.execute(
                select(Meter)
                .options(selectinload(Meter.property))
                .where(Meter.id == meter_id)
            )
            meter = meter.scalar_one_or_none()
            
            if not meter or meter.property.user_id != user_id:
                raise ValueError("Счетчик не найден или нет доступа")
            return meter

    @classmethod
    async def find_meter_by_id(cls, meter_id: int):
        async with async_session_maker() as session:
            # Находим счетчик по id
            query = select(Meter).where(Meter.id == meter_id)
            result = await session.execute(query)
            return result.scalar_one_or_none()

    # @classmethod
    # async def add_new_reading(cls, meter_id: int, current_value: float):
    #     async with async_session_maker() as session:
    #         # Находим счетчик по id
    #         query = select(Meter).where(Meter.id == meter_id)
    #         result = await session.execute(query)
    #         meter = result.scalar_one_or_none()
    #         if not meter:
    #             raise ValueError("Счетчик не найден")

    #         # Получаем тариф для данного типа счетчика
    #         tariff = await TariffDAO.find_by_type(meter.type)
    #         if not tariff:
    #             raise ValueError(f"Тариф для типа счетчика '{meter.type}' не найден")

    #         # Получаем последнее показание для счетчика
    #         query = select(Reading).where(Reading.meter_id == meter_id).order_by(Reading.updated_at.desc())
    #         result = await session.execute(query)
    #         last_reading = result.scalars().first()

    #         # Рассчитываем предыдущее показание
    #         previous_value = last_reading.current_value if last_reading else None

    #         # Преобразуем current_value в Decimal
    #         current_value_decimal = Decimal(str(current_value))

    #         # Рассчитываем общую стоимость
    #         if previous_value is not None:
    #             total_cost = (current_value_decimal - previous_value) * tariff.rate
    #         else:
    #             total_cost = Decimal('0')

    #         # Создаем новое показание
    #         new_reading = Reading(
    #             meter_id=meter_id,
    #             current_value=current_value_decimal,
    #             previous_value=previous_value,
    #             tariff=tariff.rate,
    #             total_cost=total_cost,
    #         )

    #         # Добавляем новое показание в сессию
    #         session.add(new_reading)
    #         await session.commit()  # Фиксируем изменения
    #         await session.refresh(new_reading)  # Обновляем объект, чтобы получить его ID

    #         return new_reading

    @classmethod
    async def add_new_reading(
        cls, 
        meter_id: int, 
        current_value: float, 
        user_id: int,
    ):
        async with async_session_maker() as session:
            """Добавление нового показания с проверкой прав и расчетом стоимости"""
            try:
                # Получаем счетчик с проверкой прав
                meter = await session.execute(
                    select(Meter)
                    .join(Property)
                    .where(
                        Meter.id == meter_id,
                        Property.user_id == user_id
                    )
                )
                meter = meter.scalar_one_or_none()
                
                if not meter:
                    raise ValueError("Счетчик не найден или нет доступа")

                # Рассчитываем потребление и стоимость
                previous_value = meter.last_reading_value or 0
                consumption = Decimal(current_value) - previous_value
                total_cost = consumption * meter.tariff

                # Создаем запись показания
                new_reading = Reading(
                    meter_id=meter_id,
                    current_value=current_value,
                    previous_value=previous_value,
                    tariff=meter.tariff,
                    total_cost=total_cost
                )
                session.add(new_reading)

                # Обновляем последнее показание в счетчике
                meter.last_reading_value = current_value
                await session.commit()
                await session.refresh(new_reading)
                
                return new_reading

            except Exception as e:
                await session.rollback()
                logger.error(f"Error adding reading: {str(e)}")
                raise

    @classmethod
    async def get_readings_by_property(cls, property_id: int):
        async with async_session_maker() as session:
            # Получаем все счетчики для объекта недвижимости
            query = select(Meter).where(Meter.property_id == property_id)
            result = await session.execute(query)
            meters = result.scalars().all()

            # Получаем показания для каждого счетчика
            readings = []
            for meter in meters:
                query = select(Reading).where(Reading.meter_id == meter.id)
                result = await session.execute(query)
                readings.extend(result.scalars().all())

            return readings
        
    @classmethod
    async def get_last_reading(cls, meter_id: int):
        """
        Получает последнее показание для счетчика.
        """
        async with async_session_maker() as session:
            query = select(Reading).where(Reading.meter_id == meter_id).order_by(Reading.updated_at.desc())
            result = await session.execute(query)
            last_reading = result.scalars().first()
            return last_reading
    
    @classmethod
    async def get_readings_by_date(cls, meter_id: int):
        """
        Получает все показания для счетчика, отсортированные по дате.
        """
        async with async_session_maker() as session:
            query = select(Reading).where(Reading.meter_id == meter_id).order_by(Reading.updated_at.desc())
            result = await session.execute(query)
            return result.scalars().all()
    
    @classmethod
    async def calculate_monthly_summary(cls, property_id: int, year: int, month: int):
        async with async_session_maker() as session:
            # Получаем все показания за указанный месяц
            query = select(Reading).join(Meter).where(
                and_(
                    Meter.property_id == property_id,
                    extract('year', Reading.created_at) == year,
                    extract('month', Reading.created_at) == month
                )
            )
            result = await session.execute(query)
            readings = result.scalars().all()
            
            if not readings:
                return None
                
            # Группируем по типам счетчиков
            summary = {
                'cold_water': 0.0,
                'hot_water': 0.0,
                'electricity': 0.0,
                'total': 0.0
            }
            
            for reading in readings:
                if reading.meter.type == 'cold_water':
                    summary['cold_water'] += float(reading.cost)
                elif reading.meter.type == 'hot_water':
                    summary['hot_water'] += float(reading.cost)
                elif reading.meter.type in ('electricity_day', 'electricity_night'):
                    summary['electricity'] += float(reading.cost)
                    
            summary['total'] = sum(v for k, v in summary.items() if k != 'total')
            
            return summary
        

    @classmethod
    async def check_all_meters_have_readings(cls, property_id: int):
        async with async_session_maker() as session:
            # Получаем все счетчики для property
            meters_query = select(Meter).where(Meter.property_id == property_id)
            meters_result = await session.execute(meters_query)
            meters = meters_result.scalars().all()
            
            # Получаем текущий месяц и год
            now = datetime.now()
            current_month = now.month
            current_year = now.year
            
            # Проверяем для каждого счетчика наличие показаний за текущий месяц
            for meter in meters:
                readings_query = select(Reading).where(
                    and_(
                        Reading.meter_id == meter.id,
                        extract('year', Reading.created_at) == current_year,
                        extract('month', Reading.created_at) == current_month
                    )
                )
                readings_result = await session.execute(readings_query)
                if not readings_result.scalars().first():
                    return False
                    
            return True
# class MetersDAO(BaseDAO):
#     model = Meter

#     @classmethod
#     async def create_meter(cls, property_id: int, type: str, meter_number: str):
#         async with async_session_maker() as session:
#             new_meter = Meter(
#                 property_id=property_id,
#                 type=type,
#                 meter_number=meter_number
#             )
#             session.add(new_meter)
#             await session.commit()
#             await session.refresh(new_meter)
#             return new_meter
    
#     @classmethod
#     async def get_meters_by_property(cls, property_id: int):
#         async with async_session_maker() as session:
#             query = select(Meter).where(Meter.property_id == property_id)
#             result = await session.execute(query)
#             return result.scalars().all()
    
#     @classmethod
#     async def get_meters_by_property(cls, property_id: int):
#         async with async_session_maker() as session:
#             query = select(Meter).where(Meter.property_id == property_id)
#             result = await session.execute(query)
#             return result.scalars().all()