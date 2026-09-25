import os
import psycopg
from dotenv import load_dotenv
from fastapi import FastAPI

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

app = FastAPI()

@app.get("/")
def root():
    return {"message": "Weekly Hustle is alive"}

@app.get("/db-check")
def db_check():
    with psycopg.connect(DATABASE_URL) as conn:
        result = conn.execute("SELECT version();").fetchone()
    return {"postgres": result[0]}