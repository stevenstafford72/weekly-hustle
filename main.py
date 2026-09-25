import os
from typing import Literal

import psycopg
from psycopg.rows import dict_row
from dotenv import load_dotenv
from fastapi import FastAPI
from pydantic import BaseModel

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

app = FastAPI(title="Weekly Hustle")


def get_conn():
    return psycopg.connect(DATABASE_URL, row_factory=dict_row)
{"name": "Tech Job ", "is_hustle": True, "pay_type": "salary"}
{"name": "Security ", "is_hustle": True, "pay_type": "hourly"}
{"name": "Valet ", "is_hustle": True, "pay_type": "hourly"}
{"name": "Uber ", "is_hustle": True, "pay_type": "per_gig"}
class JobCreate(BaseModel):
    name: str
    is_hustle: bool = True
    pay_type: Literal["salary", "hourly", "per_gig"]


class Job(JobCreate):
    id: int


@app.get("/")
def root():
    return {"message": "Weekly Hustle is alive"}


@app.get("/db-check")
def db_check():
    with get_conn() as conn:
        result = conn.execute("SELECT version() AS version;").fetchone()
    return {"postgres": result["version"]}


@app.post("/jobs", response_model=Job, status_code=201)
def create_job(job: JobCreate):
    with get_conn() as conn:
        row = conn.execute(
            """
            INSERT INTO jobs (name, is_hustle, pay_type)
            VALUES (%s, %s, %s)
            RETURNING id, name, is_hustle, pay_type
            """,
            (job.name, job.is_hustle, job.pay_type),
        ).fetchone()
    return row


@app.get("/jobs", response_model=list[Job])
def list_jobs():
    with get_conn() as conn:
        rows = conn.execute(
            "SELECT id, name, is_hustle, pay_type FROM jobs ORDER BY id"
        ).fetchall()
    return rows