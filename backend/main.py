from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import models
import seed
from database import engine, get_db
from contextlib import asynccontextmanager

from routers import auth, books, users, sales, admin

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

app.include_router(auth.router)
app.include_router(books.router)
app.include_router(users.router)
app.include_router(sales.router)
app.include_router(admin.router)
