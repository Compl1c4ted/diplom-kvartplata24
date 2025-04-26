from sqlalchemy import select
from app.dao.base import BaseDAO
from app.users.models import User
from app.database import async_session_maker
from app.users.security import get_password_hash


class UsersDAO(BaseDAO):
    model = User
    
    @classmethod
    async def find_all_users(cls):
        async with async_session_maker() as session:
            query = select(User)
            users = await session.execute(query)
            return users.scalars().all()

    @classmethod
    async def find_one_or_none(cls, **filters):
        async with async_session_maker() as session:
            query = select(User).filter_by(**filters)
            result = await session.execute(query)
            return result.scalar_one_or_none()

    @classmethod
    async def find_user_by_email(cls, email: str):
        async with async_session_maker() as session:
            query = select(User).where(User.email == email)
            result = await session.execute(query)
            return result.scalar_one_or_none()

    @classmethod
    async def create_user(cls, email: str, password: str):
        async with async_session_maker() as session:
            # Проверка уникальности email
            existing_user = await cls.find_one_or_none(email=email)
            if existing_user:
                raise ValueError("Пользователь с таким email уже существует")

            # Хеширование пароля
            hashed_password = get_password_hash(password)

            # Создание пользователя
            new_user = User(email=email, hashed_password=hashed_password)
            session.add(new_user)
            await session.commit()
            await session.refresh(new_user)  # Исправлено: передаем new_user
            return new_user