from fastapi import APIRouter, Depends, HTTPException, status
from app.meters.dao import MetersDAO
from app.tariffs.dao import TariffDAO
from app.meters.schemas import SMeterCreate
from app.users.models import User
from app.users.dependencies import get_current_user
from app.properties.dao import PropertiesDAO


router = APIRouter(prefix="/meters", tags=["Meters"])


@router.post("/add-meter/")
async def add_meter(
    meter_data: SMeterCreate,
    current_user: User = Depends(get_current_user)
) -> dict:
    """Добавление счетчика"""
    try:
        # Проверяем, что объект недвижимости принадлежит текущему пользователю
        property = await PropertiesDAO.find_one_or_none(id=meter_data.property_id, user_id=current_user.id)
        if not property:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Объект недвижимости не найден или у вас нет доступа"
            )

        # Создаем счетчик
        new_meter = await MetersDAO.create_meter(
            property_id=meter_data.property_id,
            type=meter_data.type,
            meter_number=meter_data.meter_number
        )
        return {
            "message": "Счетчик успешно добавлен",
            "meter_id": new_meter.id
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при добавлении счетчика: {e}"
        )
    
@router.get("/{property_id}/meters/")
async def get_meters_by_property(
    property_id: int,
    current_user: User = Depends(get_current_user)
) -> dict:
    """Получение счетчика по id недвижимости"""
    try:
        # Проверяем, что объект недвижимости принадлежит текущему пользователю
        property = await PropertiesDAO.find_one_or_none(id=property_id, user_id=current_user.id)
        if not property:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Объект недвижимости не найден или у вас нет доступа"
            )

        # Получаем все счетчики для объекта недвижимости
        meters = await MetersDAO.get_meters_by_property(property_id)
        return {
            "meters": [
                {
                    "id": meter.id,
                    "meter_number": meter.meter_number,
                    "type": meter.type,
                    "property_id": meter.property_id,
                }
                for meter in meters
            ]
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при получении счетчиков: {e}"
        )