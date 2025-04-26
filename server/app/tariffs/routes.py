from fastapi import APIRouter, Depends, HTTPException, status
from app.tariffs.dao import TariffDAO
from app.tariffs.schemas import  STariff, STariffCreate, STariffUpdate
from app.users.models import User
from app.users.dependencies import get_current_user

router = APIRouter(prefix="/tariffs", tags=["Tariffs"])

@router.get("/", response_model=list[STariff])
async def get_tariffs():
    """Получить тарифы"""
    try:
        tariffs = await TariffDAO.get_all_tariffs()
        return tariffs
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при получении тарифов: {e}"
        )

@router.post("/", response_model=STariff)
async def create_tariff(
    tariff_data: STariffCreate,
    current_user: User = Depends(get_current_user)
):
    """Создание нового тарифа"""
    try:
        # Создаем новый тариф
        new_tariff = await TariffDAO.create_tariff(
            type=tariff_data.type,
            rate=tariff_data.rate
        )
        return new_tariff
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при создании тарифа: {e}"
        )

@router.put("/{tariff_id}", response_model=STariff)
async def update_tariff(
    tariff_id: int,
    tariff_data: STariffUpdate,
    current_user: User = Depends(get_current_user)
):
    """Изменение тарифа"""
    try:
        # Проверяем, что пользователь является администратором
        # if not current_user.is_admin:
        #     raise HTTPException(
        #         status_code=status.HTTP_403_FORBIDDEN,
        #         detail="У вас нет прав для изменения тарифов"
        #     )

        # Обновляем тариф
        updated_tariff = await TariffDAO.update_tariff(
            tariff_id=tariff_id,
            rate=tariff_data.rate
        )
        return updated_tariff
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при обновлении тарифа: {e}"
        )

@router.delete("/{tariff_id}")
async def delete_tariff(
    tariff_id: int,
    current_user: User = Depends(get_current_user)
):
    """Удаление тарифа"""
    try:
        # Проверяем, что пользователь является администратором
        # if not current_user.is_admin:
        #     raise HTTPException(
        #         status_code=status.HTTP_403_FORBIDDEN,
        #         detail="У вас нет прав для удаления тарифов"
        #     )

        # Удаляем тариф
        result = await TariffDAO.delete_tariff(tariff_id)
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при удалении тарифа: {e}"
        )

@router.get("/meter/{meter_id}", response_model=STariff)
async def get_tariff_by_meter(
    meter_id: int,
    current_user: User = Depends(get_current_user)
):
    """Получить тариф по номеру счетчика"""
    try:
        tariff = await TariffDAO.find_by_meter_id(meter_id)
        if not tariff:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Тариф для данного счетчика не найден"
            )
        return tariff
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при получении тарифа: {e}"
        )