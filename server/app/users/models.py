from sqlalchemy import String, Column
from sqlalchemy.orm import relationship, Mapped, mapped_column
from app.database import Base, str_uniq, int_pk, str_null_true

class User(Base):
    __tablename__ = "users"

    id: Mapped[int_pk]
    email: Mapped[str_uniq]
    hashed_password: Mapped[str] = mapped_column(String, nullable=False)
    phone_number: Mapped[str_null_true] = mapped_column(String, unique=True)
    first_name: Mapped[str_null_true] = mapped_column(String)
    last_name: Mapped[str_null_true] = mapped_column(String)

    properties = relationship("Property", back_populates="user")  # Отношение к Property

    def __str__(self):
        return (f"{self.__class__.__name__}(id={self.id}, "
                f"email={self.email!r}, "
                f"first_name={self.first_name!r}, "
                f"last_name={self.last_name!r})")

    def __repr__(self):
        return str(self)