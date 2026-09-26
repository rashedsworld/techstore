from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel
from typing import List

DATABASE_URL = "postgresql://localhost/techstore_db"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class ProductDB(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    price = Column(Float)
    description = Column(String)
    image_url = Column(String)

Base.metadata.create_all(bind=engine)

class ProductSchema(BaseModel):
    id: int | None = None
    name: str
    price: float
    description: str
    image_url: str

    class Config:
        from_attributes = True

app = FastAPI(title="TechStore API")

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

@app.get("/api/products", response_model=List[ProductSchema])
def get_products(db: Session = Depends(get_db)):
    products = db.query(ProductDB).all()
    if not products:
        sample_items = [
            ProductDB(name="Wireless Headphones", price=99.99, description="Active noise cancelling", image_url="https://picsum.photos/300/200?random=1"),
            ProductDB(name="Mechanical Keyboard", price=149.50, description="RGB tactile switches", image_url="https://picsum.photos/300/200?random=2"),
            ProductDB(name="Ergonomic Mouse", price=59.00, description="Precision optical tracking", image_url="https://picsum.photos/300/200?random=3"),
        ]
        db.add_all(sample_items)
        db.commit()
        products = db.query(ProductDB).all()
    return products