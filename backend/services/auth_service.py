from typing import Optional
from sqlalchemy.orm import Session
from ..models.user import User
from ..utils.auth import get_password_hash, verify_password


class AuthService:
    """Service for authentication operations"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_user_by_email(self, email: str) -> Optional[User]:
        """Get user by email"""
        return self.db.query(User).filter(User.email == email).first()
    
    def get_user_by_username(self, username: str) -> Optional[User]:
        """Get user by username"""
        return self.db.query(User).filter(User.username == username).first()
    
    def get_user_by_id(self, user_id: int) -> Optional[User]:
        """Get user by ID"""
        return self.db.query(User).filter(User.id == user_id).first()
    
    def create_user(
        self,
        email: str,
        username: str,
        password: str
    ) -> User:
        """
        Create a new user
        
        Args:
            email: User email
            username: Username
            password: Plain text password (will be hashed)
            
        Returns:
            Created user object
        """
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
    
    def authenticate_user(self, username_or_email: str, password: str) -> Optional[User]:
        """
        Authenticate a user by username/email and password
        
        Args:
            username_or_email: Username or email
            password: Plain text password
            
        Returns:
            User object if authentication successful, None otherwise
        """
        # Try to find user by email first, then username
        user = self.get_user_by_email(username_or_email)
        if not user:
            user = self.get_user_by_username(username_or_email)
        
        if not user:
            return None
        
        if not verify_password(password, user.hashed_password):
            return None
        
        if not user.is_active:
            return None
        
        return user
    
    def update_user(self, user_id: int, **kwargs) -> Optional[User]:
        """
        Update user information
        
        Args:
            user_id: User ID
            **kwargs: Fields to update
            
        Returns:
            Updated user object or None if not found
        """
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
        """
        Delete a user
        
        Args:
            user_id: User ID
            
        Returns:
            True if deleted, False if not found
        """
        user = self.get_user_by_id(user_id)
        if not user:
            return False
        
        self.db.delete(user)
        self.db.commit()
        
        return True
