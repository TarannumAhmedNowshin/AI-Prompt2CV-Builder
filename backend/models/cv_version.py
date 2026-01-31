from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base


class CVVersion(Base):
    """CV Version model to store version history of CVs (like Google Docs)"""
    __tablename__ = "cv_versions"

    id = Column(Integer, primary_key=True, index=True)
    cv_id = Column(Integer, ForeignKey("cvs.id", ondelete="CASCADE"), nullable=False)
    version_number = Column(Integer, nullable=False)
    
    # Version metadata
    version_name = Column(String(255), nullable=True)  # Optional user-defined name
    change_summary = Column(String(500), nullable=True)  # Auto-generated or user summary
    
    # Snapshot of CV data at this version
    title = Column(String(255), nullable=False)
    template = Column(String(50), nullable=False)
    full_name = Column(String(255))
    email = Column(String(255))
    phone = Column(String(50))
    location = Column(String(255))
    summary = Column(Text)
    experience = Column(Text)
    education = Column(Text)
    skills = Column(Text)
    ai_prompt = Column(Text)
    
    # Timestamp when version was created
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Who created this version (for future collaboration feature)
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Relationships
    cv = relationship("CV", back_populates="versions")
    created_by = relationship("User", foreign_keys=[created_by_id])
    
    def __repr__(self):
        return f"<CVVersion(id={self.id}, cv_id={self.cv_id}, version={self.version_number})>"
