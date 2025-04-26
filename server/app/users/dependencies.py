from passlib.context import CryptContext
from fastapi.security.oauth2 import OAuth2PasswordBearer
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi import Depends, HTTPException, status
from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
from app.config import settings, get_auth_data
from app.users.dao import UsersDAO
from datetime import datetime


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

revoked_tokens = set()

security = HTTPBearer()


async def revoke_token(token: str):
    revoked_tokens.add(token)

async def is_token_revoked(token: str) -> bool:
    return token in revoked_tokens

def get_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if credentials.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверная схема аутентификации. Используйте Bearer"
        )
    return credentials.credentials

async def get_current_user(token: str = Depends(get_token)):
    """
    Получает текущего пользователя на основе токена.
    """
    payload = await validate_token(token)

    user_email = payload.get('sub')
    if not user_email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Не найден email пользователя"
        )
    
    if token in revoked_tokens:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Токен отозван",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    user = await UsersDAO.find_user_by_email(str(user_email))
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Пользователь не найден"
        )

    return user
    # try:
    #     auth_data = get_auth_data()
    #     payload = jwt.decode(token, auth_data['secret_key'], algorithms=[auth_data['algorithm']])
    # except JWTError:
    #     raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Токен не валиден')
    
    # expire = payload.get('exp')
    # expire_time = datetime.fromtimestamp(int(expire), tz=timezone.utc)
    # if (not expire) or (expire_time < datetime.now(timezone.utc)):
    #     raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Токен истек')
    
    # user_email = payload.get('sub')
    # if not user_email:
    #     raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Не найден ID пользователя')
    # if token in revoked_tokens:
    #     raise HTTPException(
    #         status_code=status.HTTP_401_UNAUTHORIZED,
    #         detail="Token has been revoked",
    #         headers={"WWW-Authenticate": "Barer"}
    #     )
    # user = await UsersDAO.find_user_by_email(str(user_email))
    # if not user:
    #     raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Пользователь не найден')
    # return user

async def validate_token(token: str):
    print("Валидация токена")
    print(f"token{token}")
    print(datetime.now())
    try:
        auth_data = get_auth_data()
        
        # Добавляем 5-минутный буфер для рассинхронизации времени
        payload = jwt.decode(
            token,
            auth_data['secret_key'],
            algorithms=[auth_data['algorithm']],
            # options={'verify_exp': True, 'leeway': 10}  # 300 секунд = 5 минут
        )
        print(f"Декодированный payload: {payload}")
        return payload
        
    except jwt.ExpiredSignatureError:
        print(f'Токен истек (с учетом leeway)')
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Токен истек"
        )
    except JWTError as e:
        print(f"Ошибка при декодировании токена: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Невалидный токен"
        )
