from fastapi import APIRouter, HTTPException, status, Response, Request, Depends, Body
from fastapi.security import OAuth2PasswordBearer
from fastapi.responses import RedirectResponse
from app.users.auth import get_password_hash
from app.users.dao import UsersDAO
from app.users.schemas import SUserRegister, SUserAuth
from app.users.auth import create_access_token, authenticate_user, create_refresh_token
from app.users.models import User
from app.users.dependencies import get_current_user, oauth2_scheme, validate_token, revoke_token, is_token_revoked
from app.config import get_auth_data, settings
import logging
from datetime import timedelta
from datetime import datetime
from jose import jwt, JWTError


router = APIRouter(prefix="/user", tags=["User"])

revoked_refresh_tokens = set()


@router.post("/register/")
async def register_user(user_data: SUserRegister) -> dict:
    """Регистрация пользователя"""
    try:
        # Создание пользователя
        new_user = await UsersDAO.create_user(email=user_data.email, password=user_data.hashed_password)
        
        # Логирование
        print(f'Пользователь {user_data.email} успешно зарегистрировался.')
        
        # Возврат данных о пользователе
        return {
            'message': 'Вы успешно зарегистрированы!',
            'user_id': new_user.id,
            'email': new_user.email,
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


@router.post("/login/")
async def auth_user(response: Response, user_data: SUserAuth):
    """Вход в аккаунт"""
    user = await authenticate_user(email=user_data.email, password=user_data.hashed_password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверная почта или пароль"
        )
    
    # Создаём токены
    access_token = create_access_token(
        data={"sub": str(user.email)},  # Основные данные
        expires_delta=timedelta(minutes=1)  # Параметр функции
    )
    
    refresh_token = create_refresh_token(
        data={"sub": str(user.email)}
    )
    
    print(f'Пользователь {user.email} успешно авторизован')
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }


@router.post("/logout/")
async def logout_user(refresh_token: str):
    """
    Выход пользователя из системы, принимается refresh_token.
    """
    revoked_refresh_tokens.add(refresh_token)
    return {"message": "Вы успешно вышли из системы"}

@router.get("/me/")
async def get_me(user_data: User = Depends(get_current_user)):
    """Получение информации о текущем пользователе"""
    return user_data

@router.post("/refresh-token/")
async def refresh_token(refresh_token: str = Body(..., embed=True)):
    """Получение рефреш токена"""
    try:
        auth_data = get_auth_data()
        payload = jwt.decode(refresh_token, auth_data['secret_key'], algorithms=[auth_data['algorithm']])
        
        user_email = payload.get('sub')
        if not user_email:
            raise HTTPException(status_code=401, detail="Invalid token payload")
        
        new_access_token = create_access_token({"sub": user_email})
        return {
            "access_token": new_access_token,
            "token_type": "bearer"
        }
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Refresh token expired")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

@router.get("/server-time/")
async def get_server_time():
    """Получение времени сервера"""
    return {"server_time": datetime.now().isoformat()}
