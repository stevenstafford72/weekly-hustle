
import "./WeekBoard.css";
import HustleActions from "./HustleActions";

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Helper Function to find the Monday of the week for todays date unless another date is provided as an argument
function getMonday(date) {
  // Create a new Date object based on the provided date or today if nothing is provided
  const d = new Date(date);
  // Calculate the number of days since the last Monday
  const daysSinceMonday = (d.getDay() + 6) % 7;

  // Subtract the number of days since Monday to get the date of the most recent Monday
  d.setDate(d.getDate() - daysSinceMonday);
  // Reset the time to the start of the day
  d.setHours(0, 0, 0, 0);

  // Return the calculated Monday date
  return d;
}

// Helper Function to convert a Date object to a string in the format YYYY-MM-DD
function toDateString(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  // Construct the date string in the format YYYY-MM-DD
  return `${y}-${m}-${day}`;
}

// Helper Function to format a time string (HH:MM) into a 12-hour format with am/pm
function formatTime(t) {
  if (!t) return "";

  const [h, m] = t.slice(0, 5).split(":").map(Number);
  const suffix = h >= 12 ? "pm" : "am";
  const hour12 = h % 12 || 12;

  return m
    ? `${hour12}:${String(m).padStart(2, "0")}${suffix}`
    : `${hour12}${suffix}`;
}

// Helper Function to get today's date as a string in the format YYYY-MM-DD
function getToday() {
  return toDateString(new Date());
}

// Helper Function to format a duration in minutes into a human-readable string (e.g., "2h 30m")
export default function WeekBoard({
  shifts = [],
  jobs = [],
  weekOf = new Date(),
  onCreateShift,
}) {
  const monday = getMonday(weekOf);
  const todayStr = getToday();


  const days = DAY_NAMES.map((name, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);

    const dateStr = toDateString(d);

    const dayShifts = shifts
      .filter((s) => s.shift_date === dateStr)
      .sort((a, b) =>
        (a.start_time ?? "99").localeCompare(
          b.start_time ?? "99"
        )
      );

    const totalMinutes = dayShifts.reduce(
      (sum, s) => sum + Number(s.planned_minutes || 0),
      0
    );

    const totalPay = dayShifts.reduce(
      (sum, s) =>
        sum +
        Number(s.pay_amount ?? s.pay ?? 0) +
        Number(s.tips ?? 0),
      0
    );

    return {
      name,
      date: d,
      dateStr,
      shifts: dayShifts,
      totalMinutes,
      totalPay,
    };
  });


  

  return (
    <>
      <div className="board">
        {days.map((day) => (
          <div
            className={`column ${
              day.dateStr === todayStr ? "today" : ""
            }`}
            key={day.dateStr}
          >
            <div className="day-header">
              <div className="day-name">{day.name}</div>

              <div className="day-date">
                {day.date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </div>
            </div>

            <div className="cards">
              {day.shifts.map((s) => {
                return (
                  <div
                    className="card"
                    key={s.id}
                  >
                    <div className="card-job">
                      <span className="dot" />
                      {jobs.find((job) => job.id === s.job_id)?.name ?? "Unknown"}
                    </div>

                    <div className="card-time">
                      {s.start_time && s.end_time
                        ? `${formatTime(s.start_time)} – ${formatTime(
                            s.end_time
                          )}`
                        : formatMinutes(s.planned_minutes)}
                    </div>

                    <div className="card-pay">
                      $
                      {Number(
                        s.pay_amount ?? s.pay ?? 0
                      ).toFixed(2)}
                    </div>
                  </div>
                );
              })}
            </div>

            
          </div>
        ))}
      </div>
        <HustleActions jobs={jobs} onCreateShift={onCreateShift} />
    </>
  );
}