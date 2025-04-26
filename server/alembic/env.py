from logging.config import fileConfig

from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.future import Connection
from sqlalchemy import pool

from alembic import context

import asyncio

# Добавьте импорт ваших моделей и настройки базы данных
from app.database import DATABASE_URL, Base  # Импортируйте ваш асинхронный движок и модели
from app.users.models import User
from app.properties.models import Property
# from app.payments.models import Payment
from app.readings.models import Reading
from app.meters.models import Meter
from app.receipts.models import Receipt
from app.tariffs.models import Tariff



# Это объект конфигурации Alembic, который предоставляет доступ к значениям из alembic.ini.
config = context.config

# Настройка логгирования
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Укажите целевые метаданные
target_metadata = Base.metadata

def run_migrations_offline() -> None:
    """Запуск миграций в 'offline' режиме."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()

async def run_migrations_online() -> None:
    """Запуск миграций в 'online' режиме."""
    # Создаем асинхронный движок
    connectable = create_async_engine(
        DATABASE_URL,
        poolclass=pool.NullPool,
    )

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()

def do_run_migrations(connection: Connection) -> None:
    """Запуск миграций с использованием синхронного соединения."""
    context.configure(
        connection=connection, target_metadata=target_metadata
    )

    with context.begin_transaction():
        context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    asyncio.run(run_migrations_online())