# from fastapi import APIRouter, Depends, HTTPException
# from .schemas import PaymentCreate, PaymentResponse
# from app.users.dependencies import get_current_user
# from app.users.models import User
# from receipts.dao import ReceiptsDAO
# from .dao import PaymentDAO

# router = APIRouter(prefix="/payments", tags=["Payments"])

# @router.post("/", response_model=PaymentResponse)
# async def create_payment(
#     payment_data: PaymentCreate,
#     current_user: User = Depends(get_current_user)
# ):
#     # Проверка прав и валидация
#     receipt = await ReceiptsDAO.get_receipt_with_property(payment_data.receipt_id)
#     if not receipt or receipt.property.user_id != current_user.id:
#         raise HTTPException(status_code=403, detail="Access denied")
    
#     # Создание платежа
#     return await PaymentDAO.create_payment(payment_data, current_user.id)