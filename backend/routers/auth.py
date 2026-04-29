from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
import auth as auth_service
import schemas
from database import get_db

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    clean_password = form_data.password.replace(" ", "")
    db_user = auth_service.authenticate_user(db, form_data.username, clean_password)
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = auth_service.create_access_token(
        data={"sub": db_user.username, "role": db_user.role},
        expires_delta=auth_service.timedelta(minutes=auth_service.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {"access_token": access_token, "token_type": "bearer", "role": db_user.role.value}
