from sqlalchemy.orm import Session
import models
from auth import get_password_hash
from faker import Faker
import random

fake = Faker()

GOLDEN_BOOKS = [
    {
        "title": "Saatleri Ayarlama Enstitüsü",
        "author": "Ahmet Hamdi Tanpınar",
        "cover_image_url": "https://img.kitapyurdu.com/v1/getImage/fn:130985/wh:true/wi:220",
        "price": 185.00
    },
    {
        "title": "Benim Adım Kırmızı",
        "author": "Orhan Pamuk",
        "cover_image_url": "https://img.kitapyurdu.com/v1/getImage/fn:127027/wh:true/wi:220",
        "price": 210.00
    },
    {
        "title": "Beyaz Kale",
        "author": "Orhan Pamuk",
        "cover_image_url": "https://img.kitapyurdu.com/v1/getImage/fn:127025/wh:true/wi:220",
        "price": 195.50
    }
]

def seed_golden_data(db: Session):
    db.query(models.Sale).delete()
    db.query(models.Book).delete()
    db.query(models.User).delete()
    
    admin_user = models.User(
        username="admin",
        hashed_password=get_password_hash("admin123"),
        role=models.RoleEnum.ADMIN
    )
    reg_user = models.User(
        username="user",
        hashed_password=get_password_hash("user123"),
        role=models.RoleEnum.USER
    )
    db.add(admin_user)
    db.add(reg_user)
    
    for b in GOLDEN_BOOKS:
        book = models.Book(**b)
        db.add(book)
        db.flush()
        
        for _ in range(random.randint(5, 15)):
            sale = models.Sale(
                book_id=book.id,
                quantity=random.randint(1, 3),
                sale_date=fake.date_time_between(start_date="-30d", end_date="now")
            )
            db.add(sale)
            
    db.commit()

def reset_and_seed(db: Session):
    seed_golden_data(db)

def add_junk_data(db: Session):
    for _ in range(5):
        junk_book = models.Book(
            title=fake.word() + " " + fake.word(),
            author="test author",
            cover_image_url=None,
            price=999999.00
        )
        db.add(junk_book)
    db.commit()
