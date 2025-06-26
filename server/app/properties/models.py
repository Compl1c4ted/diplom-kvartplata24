from sqlalchemy import ForeignKey, String, Column, Integer, DECIMAL
from sqlalchemy.orm import relationship, Mapped, mapped_column
from app.database import Base, str_uniq, int_pk

class Property(Base):
    __tablename__ = "properties"

    id: Mapped[int_pk]
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))  # Внешний ключ
    address: Mapped[str] = mapped_column(String, nullable=False)
    square: Mapped[float] = mapped_column(DECIMAL, nullable=True)
    inn_uk: Mapped[str_uniq]
    account_number: Mapped[str_uniq]  # Уникальный номер счета

    # Связь с пользователем
    user = relationship("User", back_populates="properties")
    # Связь с счетчиками
    meters = relationship("Meter", back_populates="property")
    # Связь с квитанциями
    receipts = relationship("Receipt", back_populates="property")

    def __str__(self):
        return f"{self.__class__.__name__}(id={self.id}, address={self.address!r})"

    def __repr__(self):
        return str(self)