from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload
import models
import schemas
import auth as auth_service
from database import get_db

router = APIRouter(prefix="/api/sales", tags=["sales"])

@router.get("", response_model=list[schemas.SaleResponse])
def get_sales(db: Session = Depends(get_db)):
    return db.query(models.Sale).options(joinedload(models.Sale.book)).all()

@router.post("", response_model=schemas.SaleResponse)
def create_sale(sale: schemas.SaleCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth_service.get_current_user)):
    db_sale = models.Sale(**sale.model_dump())
    db.add(db_sale)
    db.commit()
    db.refresh(db_sale)
    return db_sale
