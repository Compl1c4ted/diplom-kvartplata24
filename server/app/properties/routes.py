from fastapi import APIRouter, HTTPException, status, Depends
from app.properties.dao import PropertiesDAO
from app.properties.schemas import SPropertyCreate
from app.users.dependencies import get_current_user
from app.users.models import User
from app.readings.dao import ReadingsDAO

import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/property", tags=["Property"])


@router.post("/create-property")
async def create_property(property_data: SPropertyCreate, current_user: User = Depends(get_current_user)) -> dict:
    """Создать объект недвижимости"""
    try:
        # Создание пользователя
        new_property = await PropertiesDAO.create_property(
            user_id=current_user.id, 
            address=property_data.address, 
            inn_uk=property_data.inn_uk, 
            account_number=property_data.account_number
            )
        
        # Логирование
        print(f'Объект недвижимости {property_data.address} успешно зарегистрирован.')
        
        # Возврат данных о пользователе
        return {
            'message': 'Объект зарегистрирован!',
            'user_id': new_property.user_id,
            'address': new_property.address,
            'account_number': new_property.account_number
        }
    except ValueError as e:
        # Ошибка, если пользователь уже существует
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e))
    except Exception as e:
        # Обработка других ошибок
        print(f'Ошибка при регистрации пользователя: {e}')
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Произошла ошибка при регистрации")

@router.delete("/delete-by-account-number/{account_number}")
async def delete_property_by_account_number(account_number: str) -> dict:
    """Удалить объект недвижимости по id"""
    try:
        # Пытаемся удалить объект
        is_deleted = await PropertiesDAO.delete_by_account_number(account_number)
        
        if not is_deleted:
            # Если объект не найден, возвращаем ошибку 404
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Объект недвижимости с account_number={account_number} не найден"
            )
        
        # Возвращаем сообщение об успешном удалении
        return {
            "message": f"Объект недвижимости с account_number={account_number} успешно удален"
        }
    except Exception as e:
        # Обработка других ошибок
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Произошла ошибка при удалении объекта: {e}"
        )

@router.get("/my-properties/")
async def get_my_properties(
    current_user: User = Depends(get_current_user)
) -> dict:
    """Получить объекты недвижимости для текущего пользователя"""
    try:
        # Получаем объекты недвижимости для текущего пользователя
        properties = await PropertiesDAO.get_properties_by_user(current_user.id)
        return {
            "properties": [
                {
                    "id": property.id,
                    "address": property.address,
                    "user_id": property.user_id,
                    "account_number": property.account_number
                }
                for property in properties
            ]
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при получении объектов недвижимости: {e}"
        )
    
@router.get("/{property_id}")
async def get_property(
    property_id: int,
    current_user: User = Depends(get_current_user)
) -> dict:
    """Получаем объект недвижимости по id"""
    try:
        property = await PropertiesDAO.get_property_by_id(property_id, current_user.id)
        if not property:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Объект недвижимости не найден или вам недоступен"
            )
            
        return {
            "id": property.id,
            "address": property.address,
            "account_number": property.account_number,
            "inn_uk": property.inn_uk
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при получении объекта: {e}"
        )