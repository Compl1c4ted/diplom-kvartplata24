from datetime import datetime, date
import random
from sqlalchemy import select, func
from sqlalchemy.exc import IntegrityError
from app.database import async_session_maker
from app.receipts.models import Receipt
from app.properties.models import Property
from app.readings.models import Reading
import logging

logger = logging

class ReceiptsDAO:
    @classmethod
    async def generate_unique_transaction_number(cls):
        """Генерация уникального номера квитанции"""
        while True:
            now = datetime.now()
            random_num = random.randint(1000, 9999)
            transaction_number = f"R-{now.year}{now.month:02d}{now.day:02d}-{random_num}"
            
            # Проверяем уникальность
            async with async_session_maker() as session:
                exists = await session.execute(
                    select(Receipt).where(Receipt.transaction_number == transaction_number)
                )
                if not exists.scalar_one_or_none():
                    return transaction_number

    @classmethod
    async def create_auto_receipt(cls, property_id: int):
        """Создание автоматической квитанции с уникальным номером"""
        async with async_session_maker() as session:
            try:
                transaction_number = await cls.generate_unique_transaction_number()
                
                new_receipt = Receipt(
                    transaction_number=transaction_number,
                    transaction_date=date.today(),
                    amount=0,  # Временное значение
                    status="pending",
                    paid=False,
                    property_id=property_id
                )
                
                session.add(new_receipt)
                await session.commit()
                await session.refresh(new_receipt)
                return new_receipt
                
            except IntegrityError as e:
                await session.rollback()
                logger.error(f"Integrity error creating receipt: {str(e)}")
                raise ValueError("Ошибка создания квитанции: дублирование номера")
            except Exception as e:
                await session.rollback()
                logger.error(f"Error creating receipt: {str(e)}")
                raise

    @classmethod
    async def get_receipt_with_property(cls, receipt_id: int):
        """Получение квитанции вместе с property"""
        async with async_session_maker() as session:
            query = select(Receipt).options(
                selectinload(Receipt.property)
            ).where(Receipt.id == receipt_id)
            result = await session.execute(query)
            return result.scalar_one_or_none()

    @classmethod
    async def get_receipts_by_property(cls, property_id: int):
        """Получение всех квитанций для property"""
        async with async_session_maker() as session:
            query = select(Receipt).where(Receipt.property_id == property_id)
            result = await session.execute(query)
            return result.scalars().all()

    @classmethod
    async def mark_as_paid(cls, receipt_id: int, user_id: int):
        """Пометить квитанцию как оплаченную"""
        async with async_session_maker() as session:
            # Проверяем права доступа
            receipt = await cls.get_receipt_with_property(receipt_id)
            if not receipt or receipt.property.user_id != user_id:
                return None

            receipt.status = "paid"
            receipt.paid = True
            receipt.payment_date = datetime.now()
            
            await session.commit()
            await session.refresh(receipt)
            return receipt

    @classmethod
    async def update_receipt_status(cls, receipt_id: int, status: str):
        """Обновление статуса квитанции"""
        async with async_session_maker() as session:
            receipt = await session.get(Receipt, receipt_id)
            if not receipt:
                return None
                
            receipt.status = status
            await session.commit()
            await session.refresh(receipt)
            return receipt

    @classmethod
    async def calculate_receipt_amount(cls, receipt_id: int):
        """Расчет суммы квитанции на основе показаний"""
        async with async_session_maker() as session:
            # Получаем все показания для этой квитанции
            query = select(Reading).where(Reading.receipt_id == receipt_id)
            result = await session.execute(query)
            readings = result.scalars().all()
            
            total_amount = sum(reading.total_cost for reading in readings)
            
            # Обновляем сумму в квитанции
            receipt = await session.get(Receipt, receipt_id)
            receipt.amount = total_amount
            await session.commit()
            
            return total_amount

    @classmethod
    async def generate_pdf_for_receipt(cls, receipt_id: int):
        """Генерация PDF для квитанции (заглушка)"""
        from io import BytesIO
        from reportlab.pdfgen import canvas
        
        buffer = BytesIO()
        p = canvas.Canvas(buffer)
        
        # Получаем данные квитанции
        async with async_session_maker() as session:
            receipt = await session.get(Receipt, receipt_id)
            if not receipt:
                raise ValueError("Receipt not found")
            
            # Простейший PDF
            p.drawString(100, 750, f"Квитанция #{receipt.transaction_number}")
            p.drawString(100, 730, f"Дата: {receipt.transaction_date}")
            p.drawString(100, 710, f"Сумма: {receipt.amount} руб.")
            p.drawString(100, 690, f"Статус: {receipt.status}")
            
        p.showPage()
        p.save()
        
        buffer.seek(0)
        return buffer