from datetime import date, time
import os
from typing import Literal
from fastapi.middleware.cors import CORSMiddleware

import psycopg
from psycopg.rows import dict_row
from dotenv import load_dotenv
from fastapi import FastAPI
from pydantic import BaseModel, Field
from decimal import Decimal

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

app = FastAPI(title="Weekly Hustle")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_conn():
    return psycopg.connect(DATABASE_URL, row_factory=dict_row)


class JobCreate(BaseModel):
    name: str
    is_hustle: bool = True
    pay_type: Literal["salary", "hourly", "per_gig"]
    hourly_rate: Decimal | None = Field(default=None, ge=0)

class Job(JobCreate):
    id: int

class ShiftCreate(BaseModel):
    job_id: int
    shift_date: date 
    start_time: time | None = None 
    end_time: time | None = None
    planned_minutes: int = Field(gt=0) 
    actual_minutes: int | None = Field(default=None, ge=0) 
    pay_amount: Decimal | None = Field(default=None, ge=0) 
    tips: Decimal = Field(default=Decimal("0"), ge=0)
    status: Literal["planned", "completed", "cancelled"] = "planned"


class Shift(ShiftCreate):
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
            INSERT INTO jobs (name, is_hustle, pay_type, hourly_rate)
            VALUES (%s, %s, %s, %s)
            RETURNING id, name, is_hustle, pay_type, hourly_rate
            """,
            (job.name, job.is_hustle, job.pay_type, job.hourly_rate),
        ).fetchone()

    return row



@app.get("/jobs", response_model=list[Job])
def list_jobs():
    with get_conn() as conn:
        rows = conn.execute(
            "SELECT id, name, is_hustle, pay_type, hourly_rate FROM jobs ORDER BY id"
        ).fetchall()
    return rows

@app.post("/shifts", response_model=Shift, status_code=201)
def create_shift(shift: ShiftCreate):
    with get_conn() as conn:
        row = conn.execute(
            """
            INSERT INTO shifts (job_id, shift_date, start_time, end_time, planned_minutes, actual_minutes, pay_amount, tips, status)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id, job_id, shift_date, start_time, end_time, planned_minutes, actual_minutes, pay_amount, tips, status
            """, 
            (shift.job_id, shift.shift_date, shift.start_time, shift.end_time, shift.planned_minutes, shift.actual_minutes, shift.pay_amount, shift.tips, shift.status)
        ).fetchone()
    return row

@app.get("/weekly-shifts")
def list_weekly_shifts(start: date, end: date):
    with get_conn() as conn:
        rows = conn.execute(
            """
            SELECT s.id,
                   j.name AS job_name,
                   s.shift_date,
                   s.start_time,
                   s.end_time,
                   s.planned_minutes,
                   ROUND(COALESCE(s.pay_amount, j.hourly_rate * s.planned_minutes / 60), 2) AS pay
            FROM shifts s
            JOIN jobs j ON j.id = s.job_id
            WHERE s.shift_date BETWEEN %s AND %s
            ORDER BY s.shift_date, s.start_time
            """,
            (start, end),
        ).fetchall()
    return rows


@app.get("/shifts", response_model=list[Shift])
def list_shifts():
    with get_conn() as conn:
        rows = conn.execute(
            """
            SELECT * from shifts;
            """,
        ).fetchall()
    return rows
