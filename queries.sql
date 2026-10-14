
-- Pay per shift: uses the shift's pay_amount if set, otherwise hourly_rate × time

 SELECT s.id, j.name, s.planned_minutes,  (COALESCE(j.hourly_rate * s.planned_minutes / 60, 0)) AS pay FROM shifts s JOIN jobs j on j.id = s.job_id;