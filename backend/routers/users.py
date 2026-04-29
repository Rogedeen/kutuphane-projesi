from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordBearer
import models
import schemas
import auth as auth_service
from database import get_db

router = APIRouter(prefix="/api/users", tags=["users"])
oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl="api/auth/login", auto_error=False)

@router.post("", response_model=schemas.UserResponse)
def create_user(
    user: schemas.UserCreate, 
    db: Session = Depends(get_db),
    token: str | None = Depends(oauth2_scheme_optional)
):
    clean_password = user.password.replace(" ", "")
    if not clean_password:
        raise HTTPException(status_code=400, detail="Password cannot be completely empty or spaces")
        
    is_admin = False
    if token:
        try:
            current_user = auth_service.get_current_user(token, db)
            if current_user.role == models.RoleEnum.ADMIN:
                is_admin = True
        except HTTPException:
            pass
            
    if user.role == models.RoleEnum.ADMIN and not is_admin:
        user.role = models.RoleEnum.USER
        
    existing = db.query(models.User).filter(models.User.username == user.username).first()
    if existing:
         raise HTTPException(status_code=400, detail="Username already registered")
         
    hashed_password = auth_service.get_password_hash(clean_password)
    db_user = models.User(
        username=user.username,
        hashed_password=hashed_password,
        role=user.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.get("", response_model=list[schemas.UserResponse])
def get_users(db: Session = Depends(get_db), current_user: models.User = Depends(auth_service.get_current_admin_user)):
    return db.query(models.User).all()

@router.delete("/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth_service.get_current_admin_user)):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    if db_user.username == "admin":
        raise HTTPException(status_code=400, detail="Cannot delete root admin")
    db.delete(db_user)
    db.commit()
    return {"message": "User deleted successfully"}

@router.patch("/{user_id}/role", response_model=schemas.UserResponse)
def update_user_role(
    user_id: int,
    role_update: schemas.RoleUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_service.get_current_admin_user)
):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    if db_user.username == "admin":
        raise HTTPException(status_code=400, detail="Cannot change root admin role")
    db_user.role = role_update.role
    db.commit()
    db.refresh(db_user)
    return db_user
