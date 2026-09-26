from fastapi import FastAPI, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel
from typing import List, Optional

DATABASE_URL = "postgresql://localhost/techstore_db"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Book Model
class BookDB(Base):
    __tablename__ = "books"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    author = Column(String)
    category = Column(String, index=True)
    original_price = Column(Float)
    discounted_price = Column(Float)
    rating = Column(Float)
    image_url = Column(String)

Base.metadata.create_all(bind=engine)

class BookSchema(BaseModel):
    id: Optional[int] = None
    title: str
    author: str
    category: str
    original_price: float
    discounted_price: float
    rating: float
    image_url: str

    class Config:
        from_attributes = True

app = FastAPI(title="Rokomari-Style Bookstore API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/api/books", response_model=List[BookSchema])
def get_books(category: Optional[str] = None, q: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(BookDB)
    
    # Initial Data Seeding
    if query.count() == 0:
        sample_books = [
            BookDB(
                title="Paradoxical Sajid 2", 
                author="Arif Azad", 
                category="Islamic", 
                original_price=380.0, 
                discounted_price=266.0, 
                rating=4.8, 
                image_url="https://picsum.photos/200/280?random=1"
            ),
            BookDB(
                title="Python Programming Basics", 
                author="Tamim Shahriar Subeen", 
                category="Academic", 
                original_price=300.0, 
                discounted_price=225.0, 
                rating=4.9, 
                image_url="https://picsum.photos/200/280?random=2"
            ),
            BookDB(
                title="Bela Borat Hobar Age", 
                author="Arif Azad", 
                category="Islamic", 
                original_price=320.0, 
                discounted_price=224.0, 
                rating=4.7, 
                image_url="https://picsum.photos/200/280?random=3"
            ),
            BookDB(
                title="Atomic Habits", 
                author="James Clear", 
                category="Self-Help", 
                original_price=550.0, 
                discounted_price=385.0, 
                rating=4.9, 
                image_url="https://picsum.photos/200/280?random=4"
            )
        ]
        db.add_all(sample_books)
        db.commit()
        query = db.query(BookDB)

    if category:
        query = query.filter(BookDB.category.ilike(f"%{category}%"))
    if q:
        query = query.filter(BookDB.title.ilike(f"%{q}%") | BookDB.author.ilike(f"%{q}%"))

    return query.all()