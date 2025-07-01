from sqlalchemy import select, and_, extract
from sqlalchemy.orm import joinedload
from app.database import async_session_maker
from app.dao.base import BaseDAO
from app.receipts.models import Receipt
from app.receipts.schemes import SReceiptCreate
from app.readings.models import Reading
from app.meters.models import Meter
from app.properties.models import Property
from app.properties.dao import PropertiesDAO
from fastapi import HTTPException, status
from app.receipts.pdf_generator import generate_receipt_pdf
import uuid
from decimal import Decimal
from datetime import datetime


class ReceiptsDAO(BaseDAO):
    model = Receipt

    @classmethod
    async def get_receipt_with_property(cls, receipt_id: int):
        async with async_session_maker() as session:
            # Загружаем квитанцию вместе с связанным property
            query = select(cls.model).options(
                joinedload(Receipt.property)  # Жадно загружаем связанное property
            ).filter(Receipt.id == receipt_id)
            
            result = await session.execute(query)
            return result.scalars().first()
        
    @classmethod
    async def get_receipts_by_property(cls, property_id: int):
        async with async_session_maker() as session:
            query = select(cls.model).filter(Receipt.property_id == property_id)
            result = await session.execute(query)
            return result.scalars().all()
        
    # @classmethod
    # async def create_receipt(cls, receipt_data: SReceiptCreate):
    #     async with async_session_maker() as session:
    #         transaction_number = str(uuid.uuid4())[:8]
    #         receipt = Receipt(
    #             transaction_number=transaction_number,
    #             transaction_date=receipt_data.transaction_date,
    #             amount=receipt_data.amount,
    #             status="pending",
    #             property_id=receipt_data.property_id
    #         )
    #         session.add(receipt)
    #         await session.commit()
    #         await session.refresh(receipt)  # Важно для получения ID
            
    #         if receipt.id is None:  # Добавьте проверку
    #             raise Exception("Failed to get receipt ID after creation")
                
    #         return receipt


    @classmethod
    async def create_auto_receipt(cls, property_id: int):
        async with async_session_maker() as session:
            # Получаем все показания за текущий месяц для property
            now = datetime.now()
            readings_query = select(Reading).join(Meter).where(
                Meter.property_id == property_id,
                extract('year', Reading.created_at) == now.year,
                extract('month', Reading.created_at) == now.month
            )
            readings_result = await session.execute(readings_query)
            readings = readings_result.scalars().all()
            
            # Рассчитываем общую сумму
            total_amount = sum(reading.total_cost for reading in readings)
            
            # Создаем квитанцию
            receipt = Receipt(
                transaction_number=f"R-{now.year}{now.month:02d}-{property_id}",
                transaction_date=now.date(),
                amount=total_amount,
                status="pending",
                paid=False,
                property_id=property_id
            )
            
            session.add(receipt)
            await session.commit()
            await session.refresh(receipt)
            
            # Обновляем показания, привязывая их к квитанции
            for reading in readings:
                reading.receipt_id = receipt.id
            
            await session.commit()
            
            return receipt
        
    @classmethod
    async def create_receipt(cls, property_id: int):
        async with async_session_maker() as session:
            # Получаем все непогашенные показания для property_id
            result = await session.execute(
                select(Reading)
                .join(Meter)
                .where(
                    Meter.property_id == property_id,
                    Reading.receipt_id.is_(None)
                )
            )
            unpaid_readings = result.scalars().all()

            if not unpaid_readings:
                raise ValueError("Нет непогашенных показаний для создания квитанции")
            
            # Рассчитываем общую сумму
            total_amount = sum(
                [float(reading.total_cost) for reading in unpaid_readings]
            )
            
            # Создаем квитанцию с текущей датой и рассчитанной суммой
            receipt = Receipt(
                transaction_number=str(uuid.uuid4())[:8],
                transaction_date=datetime.now().date(),
                amount=total_amount,
                status="pending",
                paid=False,
                property_id=property_id
            )

            session.add(receipt)
            await session.flush()
            
            # Привязываем показания к квитанции
            for reading in unpaid_readings:
                reading.receipt_id = receipt.id
                session.add(reading)

            await session.commit()
            await session.refresh(receipt)
            
            return receipt

    @classmethod
    async def update_receipt_status(cls, receipt_id: int, status: str):
        async with async_session_maker() as session:
            # Получаем квитанцию
            query = select(cls.model).filter(Receipt.id == receipt_id)
            result = await session.execute(query)
            receipt = result.scalars().first()
            
            if receipt:
                receipt.status = status
                await session.commit()  # Используем await
                await session.refresh(receipt)  # Используем await
            return receipt
        
    @classmethod
    async def generate_pdf_for_receipt(cls, receipt_id: int):
        async with async_session_maker() as session:
            # Загружаем квитанцию вместе со связанными property и user
            query = select(cls.model).options(
                joinedload(Receipt.property).joinedload(Property.user)  # Добавляем загрузку user через property
            ).filter(Receipt.id == receipt_id)
            
            result = await session.execute(query)
            receipt = result.scalars().first()
            
            if not receipt:
                raise HTTPException(status_code=404, detail="Receipt not found")
            
            # Теперь user доступен через receipt.property.user
            pdf_buffer = await generate_receipt_pdf(receipt, receipt.property, receipt.property.user)
            return pdf_buffer
        
    @classmethod
    async def get_receipt_with_property_and_user(cls, receipt_id: int):
        async with async_session_maker() as session:
            query = select(cls.model).options(
                joinedload(Receipt.property).joinedload(Property.user)
            ).filter(Receipt.id == receipt_id)
            
            result = await session.execute(query)
            return result.scalars().first()
        
    @classmethod
    async def get_unpaid_readings(cls, property_id: int):
        """Получает все неоплаченные показания для property"""
        async with async_session_maker() as session:
            # Получаем все показания, которые не привязаны ни к одной квитанции
            query = select(Reading).join(Meter).where(
                and_(
                    Meter.property_id == property_id,
                    ~Reading.receipts.any()
                )
            )
            result = await session.execute(query)
            return result.scalars().all()
    
    @classmethod
    async def get_user_receipts(cls, property_id: int, user_id: int):
        async with async_session_maker() as session:
            property = await PropertiesDAO.find_one_or_none(id=property_id, user_id=user_id)
            if not property:
                None
            
            query = select(Receipt).where(
                Receipt.property_id == property_id,
                Receipt.paid == False
            ).order_by(Receipt.transaction_date.desc())

            result = await session.execute(query)
            return result.scalars().all()
        
    @classmethod
    async def get_receipt_by_id(cls, receipt_id: int, user_id: int):
        async with async_session_maker() as session:
            query = select(Receipt).options(
                joinedload(Receipt.property)
            ).where(
                Receipt.id == receipt_id
            )
            result = await session.execute(query)
            receipt = result.scalar_one_or_none()

            if not receipt:
                return None
            
            property = await PropertiesDAO.find_one_or_none(id=receipt.property_id, user_id=user_id)

            if not property:
                return None
            
            return receipt
        

    @classmethod
    async def mark_as_paid(cls, receipt_id: int, user_id: int):
        async with async_session_maker() as session:
            receipt = await cls.get_receipt_by_id(receipt_id, user_id)
            if not receipt:
                return None
            
            receipt.paid = True
            receipt.status = "paid"
            receipt.payment_date = datetime.now()

            session.add(receipt)
            await session.commit()
            await session.refresh(receipt)

            return receipt
    # @classmethod
    # async def calculate_utilities_summary(cls, property_id: int, period_start: date, period_end: date):
    #     """Рассчитывает сумму всех коммунальных услуг за период"""
    #     async with async_session_maker() as session:
    #         # Получаем все неоплаченные показания за период
    #         readings = await cls.get_unpaid_readings(property_id)

    #         if not readings:
    #             raise ValueError("No unpaid readings found for the property")
            
    #         # Фильтр по периоду
    #         period_readings = [
    #             r for r in readings
    #             if hasattr(r, 'date') and period_start <= r.date <= period_end
    #         ]

    #         sums = {
    #             'cold_water': Decimal('0'),
    #             'hot_water': Decimal('0'),
    #             'electricity_day': Decimal('0'),
    #             'electricity_night': Decimal('0'),
    #         }
            
    #         # Суммируем по типам счетчиков
    #         for reading in period_readings:
    #             meter_type = reading.meter.type
    #             if meter_type in sums:
    #                 sums[meter_type] += reading.total_cost

    #         total = sum(sums.values())

    #         return {
    #             **sums,
    #             'total': total,
    #             'period_start': period_start,
    #             'period_end': period_end,
    #             'readings': period_readings,
    #         }
        
    # @classmethod
    # async def create_receipt_with readings(c)