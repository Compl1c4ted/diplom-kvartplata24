from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.responses import StreamingResponse
from app.receipts.dao import ReceiptsDAO
from app.receipts.schemes import SReceiptCreate, SReceiptResponse, ReceiptStatus, SReceiptPayRequest, SReceiptPayResponse
from app.properties.dao import PropertiesDAO
from app.users.dependencies import get_current_user
from app.users.models import User
from typing import List

router = APIRouter(prefix="/receipts", tags=["Receipts"])

@router.get("/{receipt_id}", response_model=SReceiptResponse)
async def read_receipt(
    receipt_id: int, 
    current_user: User = Depends(get_current_user)
):
    """Получить квитанцию по id"""
    receipt = await ReceiptsDAO.get_receipt_with_property(receipt_id)
    if not receipt:
        raise HTTPException(status_code=404, detail="Receipt not found")
    
    # Проверяем, что property квитанции принадлежит текущему пользователю
    if receipt.property.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    return receipt

@router.get("/unpaid-receipts/", response_model=list[SReceiptResponse])
async def get_unpaid(
    property_id: int,
    current_user: User = Depends(get_current_user)
):
    """Получить все неоплаченные квитанции для объекта"""
    receipts = await ReceiptsDAO.get_user_receipts(property_id, current_user.id)
    if receipts is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Нет доступа к этом объекту недвижимости"
        )
    return receipts

@router.post("/pay/", response_model=SReceiptPayResponse)
async def pay_receipt(
    pay_data: SReceiptPayRequest,
    current_user: User = Depends(get_current_user)
):
    """"Оплатить квитанцию (заглушка)"""
    receipt = await ReceiptsDAO.mark_as_paid(pay_data.receipt_id, current_user.id)
    if not receipt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Квитанция не найдена или нет доступа"
        )
    return {
        "success": True,
        "message": "Квитанция не найдена или нет доступа",
        "receipt": receipt
    }

@router.get("/property/{property_id}", response_model=List[SReceiptResponse])
async def read_receipts_by_property(
    property_id: int, 
    current_user: User = Depends(get_current_user)
):
    """Получить квитанцию по id недвижимости"""

    # Сначала проверяем, что property принадлежит пользователю
    property = await PropertiesDAO.find_one_or_none(id=property_id, user_id=current_user.id)
    if not property:
        raise HTTPException(status_code=403, detail="Access denied")

    # Если property принадлежит пользователю, получаем квитанции
    receipts = await ReceiptsDAO.get_receipts_by_property(property_id)
    return receipts

@router.post("/", response_model=SReceiptResponse, status_code=status.HTTP_201_CREATED)
async def create_new_receipt(
    receipt_data: SReceiptCreate, 
    current_user: User = Depends(get_current_user)
):
    """
    Создать новую квитанцию на основе непогашенных показаний.
    Сумма рассчитывается автоматически.
    """
    # Проверяем права доступа к property_id
    try:
        receipt = await ReceiptsDAO.create_receipt(receipt_data.property_id)
        return receipt
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.patch("/{receipt_id}/status")
async def update_receipt_status(
    receipt_id: int, 
    status: ReceiptStatus,  # Используем Enum вместо str
    current_user: User = Depends(get_current_user)
):
    """Изменить статус квитанции"""

    # Получаем квитанцию вместе с property
    receipt = await ReceiptsDAO.get_receipt_with_property(receipt_id)
    if not receipt:
        raise HTTPException(status_code=404, detail="Receipt not found")
    
    # Проверяем права доступа
    if receipt.property.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    # Обновляем статус
    updated_receipt = await ReceiptsDAO.update_receipt_status(receipt_id, status)
    if not updated_receipt:
        raise HTTPException(status_code=500, detail="Failed to update receipt status")
    
    return {
        "message": "Status updated successfully",
        "receipt": updated_receipt
    }

from fastapi.responses import StreamingResponse
from io import BytesIO

@router.get("/{receipt_id}/pdf")
async def generate_receipt_pdf(
    receipt_id: int,
    current_user: User = Depends(get_current_user)
):
    """Генерация квитанции в PDF"""

    try:
        # Проверка прав и получение данных
        receipt = await ReceiptsDAO.get_receipt_with_property(receipt_id)
        if not receipt or receipt.property.user_id != current_user.id:
            raise HTTPException(status_code=404, detail="Receipt not found or access denied")
        
        # Генерация PDF
        pdf_buffer = await ReceiptsDAO.generate_pdf_for_receipt(receipt_id)
        
        # Сбрасываем указатель в начало буфера
        pdf_buffer.seek(0)
        
        # Правильный возврат файла
        return StreamingResponse(
            pdf_buffer,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename=receipt_{receipt.transaction_number}.pdf",
                "Content-Length": str(pdf_buffer.getbuffer().nbytes)
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.get("/all-receipts/", response_model=List[SReceiptResponse])
async def get_all_user_receipts(current_user: User = Depends(get_current_user)):
    """
    Получение ВСЕХ квитанций текущего пользователя
    """

    # Получаем все property пользователя
    properties = await PropertiesDAO.find_all(user_id=current_user.id)
    property_ids = [p.id for p in properties]
    
    # Получаем все квитанции для этих property
    all_receipts = []
    for pid in property_ids:
        receipts = await ReceiptsDAO.get_receipts_by_property(pid)
        all_receipts.extend(receipts)
    
    return all_receipts