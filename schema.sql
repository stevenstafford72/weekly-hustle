CREATE TABLE jobs (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    is_hustle BOOLEAN NOT NULL DEFAULT TRUE,
    pay_type TEXT NOT NULL CHECK (pay_type IN ('salary', 'hourly', 'per_gig')),
    hourly_rate DECIMAL(10,2) CHECK (hourly_rate >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


CREATE TABLE shifts (
    id SERIAL PRIMARY KEY,
    job_id INT NOT NULL REFERENCES jobs(id),
    shift_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    planned_minutes INT NOT NULL CHECK (planned_minutes > 0),
    actual_minutes INT CHECK (actual_minutes >= 0),
    pay_amount DECIMAL(10,2) CHECK (pay_amount >= 0),
    tips DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (tips >= 0),
    status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK ((start_time IS NULL) = (end_time IS NULL))
);

