from fastapi import FastAPI, HTTPException, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.users.routes import router as user_router
from app.properties.routes import router as property_router
from app.readings.routes import router as readings_router
from app.meters.routes import router as meters_router
from app.tariffs.routes import router as tariffs_router
from app.receipts.routes import router as receipts_router
from app.database import Base, engine, async_session_maker
import asyncio
import datetime

app = FastAPI(title="Utility Cost Calculator API")

# Асинхронная функция для создания таблиц
async def create_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

# Вызов асинхронной функции при старте приложения
@app.on_event("startup")
async def startup_event():
    await create_tables()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://diplom-kvartplata24.vercel.app/"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],  # Разрешаем все методы (GET, POST и т.д.)
    allow_headers=["*"],  # Разрешаем все заголовки
)

@app.exception_handler(HTTPException)
async def handle_unauthorized(request: Request, exc: HTTPException):
    if exc.status_code == status.HTTP_401_UNAUTHORIZED:
        return JSONResponse(
            status_code=401,
            content={"detail": "Not authenticated"},
        )
    return exc

# Подключаем роутеры
app.include_router(user_router)
app.include_router(property_router)
app.include_router(meters_router)
app.include_router(readings_router)
app.include_router(tariffs_router)
app.include_router(receipts_router)
# app.include_router(auth.router, prefix="/auth", tags=["Auth"])
# app.include_router(properties.router, prefix="/properties", tags=["Properties"])
# app.include_router(meters.router, prefix="/meters", tags=["Meters"])
# app.include_router(bills.router, prefix="/bills", tags=["Bills"])
# app.include_router(payments.router, prefix="/payments", tags=["Payments"])