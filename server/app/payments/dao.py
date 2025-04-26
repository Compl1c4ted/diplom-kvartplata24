# from app.dao.base import BaseDAO
# from app.payments.models import Payments


# class PaymentsDAO(BaseDAO):
#     model = Payments

#     @classmethod
#     async def get_sum_payments(cls, )


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