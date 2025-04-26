from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from app.database import async_session_maker
from app.readings.dao import ReadingsDAO
from app.meters.dao import MetersDAO
from app.tariffs.dao import TariffDAO
from app.readings.schemas import SReadingCreate, SReadingWithReceiptResponse #, SMeterCreate, 
from app.users.models import User
from app.readings.models import Reading
from app.users.dependencies import get_current_user
from app.properties.dao import PropertiesDAO

router = APIRouter(prefix="/readings", tags=["Readings"])


@router.get("/my-readings/")
async def get_my_readings(
    current_user: User = Depends(get_current_user)
) -> dict:
    """Получить показания текущего пользователя"""
    try:
        readings = await ReadingsDAO.get_readings_by_property(current_user.id)
        return {
            "readings": [
                {
                    "id": reading.id,
                    "meter_id": reading.meter_id,
                    "value": reading.value,
                    "tariff": reading.tariff,
                    "total_cost": reading.total_cost
                }
                for reading in readings
            ]
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при получении показаний: {e}"
        )
    
@router.post("/add-reading/", response_model=SReadingWithReceiptResponse)
async def add_reading(
    reading_data: SReadingCreate,
    current_user: User = Depends(get_current_user)
):
    """Добавить показание"""
    try:
        # Находим счетчик
        meter = await ReadingsDAO.find_meter_by_id(reading_data.meter_id)
        if not meter:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Счетчик не найден"
            )

        # Проверяем права доступа
        property = await PropertiesDAO.find_one_or_none(id=meter.property_id, user_id=current_user.id)
        if not property:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="У вас нет доступа к этому счетчику"
            )

        # Добавляем показание
        result = await ReadingsDAO.add_new_reading(
            meter_id=reading_data.meter_id,
            current_value=reading_data.current_value
        )
        
        return result
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при добавлении показания: {e}"
        )

# @router.post("/add-reading/")
# async def add_reading(
#     reading_data: SReadingCreate,
#     current_user: User = Depends(get_current_user)
# ) -> dict:
#     """Добавить показание"""
#     try:
#         # Находим счетчик
#         meter = await ReadingsDAO.find_meter_by_id(reading_data.meter_id)
#         if not meter:
#             raise HTTPException(
#                 status_code=status.HTTP_404_NOT_FOUND,
#                 detail="Счетчик не найден"
#             )

#         # Проверяем, что счетчик принадлежит текущему пользователю
#         property = await PropertiesDAO.find_one_or_none(id=meter.property_id, user_id=current_user.id)
#         if not property:
#             raise HTTPException(
#                 status_code=status.HTTP_403_FORBIDDEN,
#                 detail="У вас нет доступа к этому счетчику"
#             )

#         # Добавляем показание
#         new_reading = await ReadingsDAO.add_new_reading(
#             meter_id=reading_data.meter_id,
#             current_value=reading_data.current_value
#         )
#         return {
#             "message": "Показание успешно добавлено",
#             "reading_id": new_reading.id
#         }
#     except ValueError as e:
#         raise HTTPException(
#             status_code=status.HTTP_400_BAD_REQUEST,
#             detail=str(e)
#         )
#     except Exception as e:
#         raise HTTPException(
#             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
#             detail=f"Ошибка при добавлении показания: {e}"
#         )

# @router.get("/{property_id}/meters/")
# async def get_meters_by_property(
#     property_id: int,
#     current_user: User = Depends(get_current_user)
# ) -> dict:
#     try:
#         # Проверяем, что объект недвижимости принадлежит текущему пользователю
#         property = await PropertiesDAO.find_one_or_none(id=property_id, user_id=current_user.id)
#         if not property:
#             raise HTTPException(
#                 status_code=status.HTTP_404_NOT_FOUND,
#                 detail="Объект недвижимости не найден или у вас нет доступа"
#             )

#         # Получаем все счетчики для объекта недвижимости
#         meters = await MetersDAO.get_meters_by_property(property_id)
#         return {
#             "meters": [
#                 {
#                     "id": meter.id,
#                     "meter_number": meter.meter_number,
#                     "type": meter.type,
#                     "property_id": meter.property_id,
#                 }
#                 for meter in meters
#             ]
#         }
#     except Exception as e:
#         raise HTTPException(
#             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
#             detail=f"Ошибка при получении счетчиков: {e}"
#         )
    
# @router.post("/add-meter/")
# async def add_meter(
#     meter_data: SMeterCreate,
#     current_user: User = Depends(get_current_user)
# ) -> dict:
#     try:
#         # Проверяем, что объект недвижимости принадлежит текущему пользователю
#         property = await PropertiesDAO.find_one_or_none(id=meter_data.property_id, user_id=current_user.id)
#         if not property:
#             raise HTTPException(
#                 status_code=status.HTTP_404_NOT_FOUND,
#                 detail="Объект недвижимости не найден или у вас нет доступа"
#             )

#         # Создаем счетчик
#         new_meter = await MetersDAO.create_meter(
#             property_id=meter_data.property_id,
#             type=meter_data.type,
#             meter_number=meter_data.meter_number
#         )
#         return {
#             "message": "Счетчик успешно добавлен",
#             "meter_id": new_meter.id
#         }
#     except Exception as e:
#         raise HTTPException(
#             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
#             detail=f"Ошибка при добавлении счетчика: {e}"
#         )

@router.get("/meters/{meter_id}/last-reading/")
async def get_last_reading(
    meter_id: int,
    current_user: User = Depends(get_current_user)
) -> dict:
    """Получить последнее показание по id счетчика"""
    try:
        # Находим счетчик
        meter = await ReadingsDAO.find_meter_by_id(meter_id)
        if not meter:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Счетчик не найден"
            )

        # Проверяем, что счетчик принадлежит текущему пользователю
        property = await PropertiesDAO.find_one_or_none(id=meter.property_id, user_id=current_user.id)
        if not property:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="У вас нет доступа к этому счетчику"
            )

        # Получаем последнее показание для счетчика
        last_reading = await ReadingsDAO.get_last_reading(meter_id)
        if not last_reading:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Показания для этого счетчика не найдены"
            )

        return {
            "last_reading": {
                "id": last_reading.id,
                "current_value": last_reading.current_value,
                "previous_value": last_reading.previous_value,
                "updated_at": last_reading.updated_at.isoformat(),
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при получении последнего показания: {e}"
        )