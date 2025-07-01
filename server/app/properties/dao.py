from sqlalchemy import select
from app.dao.base import BaseDAO
from app.properties.models import Property
from app.database import async_session_maker
from app.properties.schemas import SPropertyCreate

class PropertiesDAO(BaseDAO):
    model = Property

    @classmethod
    async def create_property(cls, user_id: int, address: str, inn_uk: str, account_number: str):
        async with async_session_maker() as session:
            print("Создали сессию бд")
            new_property = Property(user_id=user_id, address=address, inn_uk=inn_uk, account_number=account_number)
            print("Объект недвижимсоти создан")
            session.add(new_property)
            await session.commit()
            await session.refresh(new_property)
            return new_property
        
    @classmethod
    async def delete_by_account_number(cls, account_number: str) -> bool:
        async with async_session_maker() as session:
            print("session craeted")
            query = select(cls.model).where(cls.model.account_number == account_number)
            print(f"Выбрали модель, где аккаунт: {query}")
            result = await session.execute(query)
            property_to_delete = result.scalar_one_or_none()

            if not property_to_delete:
                return False
            
            await session.delete(property_to_delete)
            await session.commit()
            return True
        
    @classmethod
    async def get_properties_by_user(cls, user_id: int):
        async with async_session_maker() as session:
            # Получаем все объекты недвижимости для пользователя
            query = select(Property).where(Property.user_id == user_id)
            result = await session.execute(query)
            return result.scalars().all()
        
    @classmethod
    async def get_property_by_id(cls, property_id: int, user_id: int = None):
        async with async_session_maker() as session:
            query = select(Property).where(Property.id == property_id)
            
            if user_id:  # Если нужно проверить принадлежность пользователю
                query = query.where(Property.user_id == user_id)
                
            result = await session.execute(query)
            return result.scalar_one_or_none()