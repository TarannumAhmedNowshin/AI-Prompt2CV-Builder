from typing import Optional
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from ..models.user import User
from ..utils.auth import get_password_hash, verify_password

MAX_FAILED_ATTEMPTS = 5
LOCKOUT_DURATION_MINUTES = 15


class AuthService:
    """Service for authentication operations"""

    def __init__(self, db: Session):
        self.db = db

    def get_user_by_email(self, email: str) -> Optional[User]:
        return self.db.query(User).filter(User.email == email).first()

    def get_user_by_username(self, username: str) -> Optional[User]:
        return self.db.query(User).filter(User.username == username).first()

    def get_user_by_id(self, user_id: int) -> Optional[User]:
        return self.db.query(User).filter(User.id == user_id).first()

    def create_user(
        self,
        email: str,
        username: str,
        password: str
    ) -> User:
        hashed_password = get_password_hash(password)

        user = User(
            email=email,
            username=username,
            hashed_password=hashed_password,
            is_active=True,
            is_verified=False
        )

        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)

        return user

    def _is_account_locked(self, user: User) -> bool:
        if user.locked_until and user.locked_until > datetime.now(timezone.utc):
            return True
        if user.locked_until and user.locked_until <= datetime.now(timezone.utc):
            user.failed_login_attempts = 0
            user.locked_until = None
            self.db.commit()
        return False

    def _record_failed_login(self, user: User) -> None:
        user.failed_login_attempts = (user.failed_login_attempts or 0) + 1
        if user.failed_login_attempts >= MAX_FAILED_ATTEMPTS:
            user.locked_until = datetime.now(timezone.utc) + timedelta(minutes=LOCKOUT_DURATION_MINUTES)
        self.db.commit()

    def _reset_failed_login(self, user: User) -> None:
        if user.failed_login_attempts:
            user.failed_login_attempts = 0
            user.locked_until = None
            self.db.commit()

    def authenticate_user(self, username_or_email: str, password: str) -> Optional[User]:
        user = self.get_user_by_email(username_or_email)
        if not user:
            user = self.get_user_by_username(username_or_email)

        if not user:
            return None

        if self._is_account_locked(user):
            return None

        if not verify_password(password, user.hashed_password):
            self._record_failed_login(user)
            return None

        if not user.is_active:
            return None

        self._reset_failed_login(user)
        return user

    def update_user(self, user_id: int, **kwargs) -> Optional[User]:
        user = self.get_user_by_id(user_id)
        if not user:
            return None

        for key, value in kwargs.items():
            if hasattr(user, key) and key != "id":
                setattr(user, key, value)

        self.db.commit()
        self.db.refresh(user)

        return user

    def delete_user(self, user_id: int) -> bool:
        user = self.get_user_by_id(user_id)
        if not user:
            return False

        self.db.delete(user)
        self.db.commit()

        return True
