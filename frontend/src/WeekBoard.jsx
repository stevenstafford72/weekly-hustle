
import { useState } from "react";
import "./WeekBoard.css";
import AddShiftPortal from "./AddShiftPortal";
import HustleActions from "./HustleActions";

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const PALETTE = [
  { bg: "#eef3ff", accent: "#4f7cf7" },
  { bg: "#f3efff", accent: "#8b6cf0" },
  { bg: "#eaf7f0", accent: "#22a06b" },
  { bg: "#fff4e8", accent: "#e8893a" },
  { bg: "#ffffff", accent: "#e0628a" },
];

function colorFor(name = "") {
  let hash = 0;

  for (const ch of name) {
    hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  }

  return PALETTE[hash % PALETTE.length];
}

function getMonday(date) {
  const d = new Date(date);
  const daysSinceMonday = (d.getDay() + 6) % 7;

  d.setDate(d.getDate() - daysSinceMonday);
  d.setHours(0, 0, 0, 0);

  return d;
}

function toDateString(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${y}-${m}-${day}`;
}

function formatTime(t) {
  if (!t) return "";

  const [h, m] = t.slice(0, 5).split(":").map(Number);
  const suffix = h >= 12 ? "pm" : "am";
  const hour12 = h % 12 || 12;

  return m
    ? `${hour12}:${String(m).padStart(2, "0")}${suffix}`
    : `${hour12}${suffix}`;
}

function formatMinutes(mins = 0) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;

  return m ? `${h}h ${m}m` : `${h}h`;
}

function getToday() {
  return toDateString(new Date());
}

export default function WeekBoard({
  shifts = [],
  jobs = [],
  weekOf = new Date(),
  onCreateShift,
}) {
  const monday = getMonday(weekOf);
  const todayStr = getToday();

  const [showAddShift, setShowAddShift] = useState(false);

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
                const c = colorFor(s.job_name);

                return (
                  <div
                    className="card"
                    key={s.id}
                    style={{
                      "--card-bg": c.bg,
                      "--card-accent": c.accent,
                    }}
                  >
                    <div className="card-job">
                      <span className="dot" />
                      {s.job_name}
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

            <div className="day-total">
              <span>{formatMinutes(day.totalMinutes)}</span>
              <span>${day.totalPay.toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>
      <HustleActions show={showAddShift} onClose={() => setShowAddShift(false)} />

      {/* Floating Add Hustle Button */}
      <HustleActions show={showAddShift} onClose={() => setShowAddShift(false)} />

      {/* Separate shift portal */}
      {showAddShift && (
        <AddShiftPortal
          jobs={jobs}
          onCreateShift={onCreateShift}
          onClose={() => setShowAddShift(false)}
        />
      )}
    </>
  );
}