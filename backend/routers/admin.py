from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import models
import auth as auth_service
import seed
from database import get_db

router = APIRouter(prefix="/api/admin", tags=["admin"])

@router.post("/reset")
def reset_database(db: Session = Depends(get_db), current_user: models.User = Depends(auth_service.get_current_user)):
    seed.reset_and_seed(db)
    return {"message": "Database reset to golden state successfully"}

@router.post("/add-junk")
def add_junk_data(db: Session = Depends(get_db), current_user: models.User = Depends(auth_service.get_current_admin_user)):
    seed.add_junk_data(db)
    return {"message": "Junk data added successfully"}
