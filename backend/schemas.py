from pydantic import BaseModel
from typing import Optional, List
import datetime
from models import RoleEnum

class UserCreate(BaseModel):
    username: str
    password: str
    role: Optional[RoleEnum] = RoleEnum.USER

class UserResponse(BaseModel):
    id: int
    username: str
    role: RoleEnum
    
    class Config:
        from_attributes = True
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str

class BookBase(BaseModel):
    title: str
    author: str
    cover_image_url: Optional[str] = None
    price: float

class BookCreate(BookBase):
    pass

class BookResponse(BookBase):
    id: int
    
    class Config:
        from_attributes = True

class SaleBase(BaseModel):
    book_id: int
    quantity: int

class SaleCreate(SaleBase):
    pass

class SaleResponse(SaleBase):
    id: int
    sale_date: datetime.datetime
    book: BookResponse
    
    class Config:
        from_attributes = True
