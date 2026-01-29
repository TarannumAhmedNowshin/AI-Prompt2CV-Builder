from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base


class CV(Base):
    """CV model to store user CVs"""
    __tablename__ = "cvs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    template = Column(String(50), nullable=False)  # 'modern' or 'classic'
    
    # Personal Information
    full_name = Column(String(255))
    email = Column(String(255))
    phone = Column(String(50))
    location = Column(String(255))
    
    # CV Content
    summary = Column(Text)
    experience = Column(Text)
    education = Column(Text)
    skills = Column(Text)
    
    # AI Prompt (stored for reference)
    ai_prompt = Column(Text)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship
    user = relationship("User", back_populates="cvs")
