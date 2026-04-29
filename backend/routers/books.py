from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import models
import schemas
import auth as auth_service
from database import get_db

router = APIRouter(prefix="/api/books", tags=["books"])

@router.get("", response_model=list[schemas.BookResponse])
def get_books(db: Session = Depends(get_db)):
    return db.query(models.Book).all()

@router.post("", response_model=schemas.BookResponse)
def create_book(book: schemas.BookCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth_service.get_current_admin_user)):
    db_book = models.Book(**book.model_dump())
    db.add(db_book)
    db.commit()
    db.refresh(db_book)
    return db_book

@router.put("/{book_id}", response_model=schemas.BookResponse)
def update_book(book_id: int, book: schemas.BookCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth_service.get_current_admin_user)):
    db_book = db.query(models.Book).filter(models.Book.id == book_id).first()
    if not db_book:
        raise HTTPException(status_code=404, detail="Book not found")
    for key, value in book.model_dump().items():
        setattr(db_book, key, value)
    db.commit()
    db.refresh(db_book)
    return db_book

@router.delete("/{book_id}")
def delete_book(book_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth_service.get_current_admin_user)):
    db_book = db.query(models.Book).filter(models.Book.id == book_id).first()
    if not db_book:
        raise HTTPException(status_code=404, detail="Book not found")
    db.delete(db_book)
    db.commit()
    return {"message": "Book deleted successfully"}
