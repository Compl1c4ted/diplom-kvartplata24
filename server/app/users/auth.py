from passlib.context import CryptContext
from pydantic import EmailStr
from jose import jwt, JWTError
from datetime import datetime, timedelta, timezone
from app.config import get_auth_data 
from app.users.dao import UsersDAO

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


async def authenticate_user(email: EmailStr, password: str):
    user = await UsersDAO.find_one_or_none(email=email)
    if not user or verify_password(plain_password=password, hashed_password=user.hashed_password) is False:
        return None
    return user

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    auth_data = get_auth_data()
    to_encode = data.copy()
    
    # Определяем срок действия
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=30)  # Дефолтное значение
    
    # Добавляем timestamp истечения в payload
    to_encode.update({"exp": expire})
    
    encoded_jwt = jwt.encode(to_encode, auth_data['secret_key'], algorithm=auth_data['algorithm'])
    print(f'Время создания токена: {datetime.now(timezone.utc)}')
    print(f'Время истечения токена: {expire}')
    return encoded_jwt

def create_refresh_token(data: dict, expires_delta: timedelta | None = None):
    auth_data = get_auth_data()
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now() + expires_delta
    else:
        expire = datetime.now() + timedelta(days=7)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, auth_data['secret_key'], algorithm=auth_data['algorithm'])
    return encoded_jwt

# def create_access_token(data: dict) -> str:
#     to_encode = data.copy()
#     expire = datetime.now(timezone.utc) + timedelta(days=30)
#     to_encode.update({"exp": expire})
#     auth_data = get_auth_data()
#     encode_jwt = jwt.encode(to_encode, auth_data['secret_key'], algorithm=auth_data['algorithm'])
#     return encode_jwt

# def create_refresh_token(data: dict) -> str:
#     to_encode = data.copy()
    

# def create_access_token(data: dict, expires_delta: timedelta):
#     to_encode = data.copy()
#     if expires_delta:
#         expire = datetime.now(timezone.utc) + expires_delta
#     else:
#         expire = datetime.now(timezone.utc) + timedelta(minutes=15)
#     to_encode.update({"exp": expire})
#     encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
#     return encoded_jwt