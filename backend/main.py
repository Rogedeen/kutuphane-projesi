from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session, joinedload
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl="api/auth/login", auto_error=False)
import models
import schemas
import auth
import seed
from database import engine, get_db
from contextlib import asynccontextmanager

models.Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    db = next(get_db())
    if db.query(models.User).count() == 0:
        seed.seed_golden_data(db)
    db.close()
    yield

app = FastAPI(title="Bookstore Sales-Ready Demo API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/auth/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    clean_password = form_data.password.replace(" ", "")
    db_user = auth.authenticate_user(db, form_data.username, clean_password)
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = auth.create_access_token(
        data={"sub": db_user.username, "role": db_user.role},
        expires_delta=auth.timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/books", response_model=list[schemas.BookResponse])
def get_books(db: Session = Depends(get_db)):
    return db.query(models.Book).all()

@app.post("/api/books", response_model=schemas.BookResponse)
def create_book(book: schemas.BookCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_admin_user)):
    db_book = models.Book(**book.model_dump())
    db.add(db_book)
    db.commit()
    db.refresh(db_book)
    return db_book

@app.put("/api/books/{book_id}", response_model=schemas.BookResponse)
def update_book(book_id: int, book: schemas.BookCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_admin_user)):
    db_book = db.query(models.Book).filter(models.Book.id == book_id).first()
    if not db_book:
        raise HTTPException(status_code=404, detail="Book not found")
    for key, value in book.model_dump().items():
        setattr(db_book, key, value)
    db.commit()
    db.refresh(db_book)
    return db_book

@app.delete("/api/books/{book_id}")
def delete_book(book_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_admin_user)):
    db_book = db.query(models.Book).filter(models.Book.id == book_id).first()
    if not db_book:
        raise HTTPException(status_code=404, detail="Book not found")
    db.delete(db_book)
    db.commit()
    return {"message": "Book deleted successfully"}

@app.post("/api/users", response_model=schemas.UserResponse)
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
            current_user = auth.get_current_user(token, db)
            if current_user.role == models.RoleEnum.ADMIN:
                is_admin = True
        except HTTPException:
            pass
            
    if user.role == models.RoleEnum.ADMIN and not is_admin:
        user.role = models.RoleEnum.USER
        
    existing = db.query(models.User).filter(models.User.username == user.username).first()
    if existing:
         raise HTTPException(status_code=400, detail="Username already registered")
         
    hashed_password = auth.get_password_hash(clean_password)
    db_user = models.User(
        username=user.username,
        hashed_password=hashed_password,
        role=user.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.get("/api/users", response_model=list[schemas.UserResponse])
def get_users(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_admin_user)):
    return db.query(models.User).all()

@app.delete("/api/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_admin_user)):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    if db_user.username == "admin":
        raise HTTPException(status_code=400, detail="Cannot delete root admin")
    db.delete(db_user)
    db.commit()
    return {"message": "User deleted successfully"}

@app.get("/api/sales", response_model=list[schemas.SaleResponse])
def get_sales(db: Session = Depends(get_db)):
    return db.query(models.Sale).options(joinedload(models.Sale.book)).all()

@app.post("/api/sales", response_model=schemas.SaleResponse)
def create_sale(sale: schemas.SaleCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    db_sale = models.Sale(**sale.model_dump())
    db.add(db_sale)
    db.commit()
    db.refresh(db_sale)
    return db_sale

@app.post("/api/admin/reset")
def reset_database(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_admin_user)):
    seed.reset_and_seed(db)
    return {"message": "Database reset to golden state successfully"}

@app.post("/api/admin/add-junk")
def add_junk_data(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_admin_user)):
    seed.add_junk_data(db)
    return {"message": "Junk data added successfully"}
