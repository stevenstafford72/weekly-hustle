import { useEffect, useMemo, useRef, useState } from "react";
import "./AddShiftPortal.css";

// Placeholder jobs until the jobs endpoint is wired up.
// As soon as a non-empty `jobs` prop is passed in, these are ignored.
const EXAMPLE_JOBS = [
  { id: 1, name: "DoorDash", is_hustle: true },
  { id: 2, name: "Instacart", is_hustle: true },
  { id: 3, name: "Uber", is_hustle: true },
  { id: 4, name: "Event Staffing", is_hustle: true },
];

const DAY = 24 * 60;
const STEP = 30; // minutes between time options
const DEFAULT_START = 9 * 60; // 9:00 AM
const QUICK_LENGTHS = [60, 120, 180, 240, 360, 480];
const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

// Every start time in 30-minute steps: 12:00 AM ... 11:30 PM
const START_OPTIONS = Array.from({ length: DAY / STEP }, (_, i) => i * STEP);
// Every possible shift length: 30m ... 23h 30m
const LENGTH_OPTIONS = Array.from({ length: DAY / STEP - 1 }, (_, i) => (i + 1) * STEP);

/* ---------- date + time helpers ---------- */

function toISODate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseISODate(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function addDays(date, n) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + n);
  return copy;
}

// minutes since midnight -> "HH:MM" (24h, what the API expects)
function toHHMM(minutes) {
  const m = ((minutes % DAY) + DAY) % DAY;
  const h = String(Math.floor(m / 60)).padStart(2, "0");
  const mm = String(m % 60).padStart(2, "0");
  return `${h}:${mm}`;
}

// minutes since midnight -> "5:30 PM"
function formatClock(minutes) {
  const m = ((minutes % DAY) + DAY) % DAY;
  const h = Math.floor(m / 60);
  const suffix = h < 12 ? "AM" : "PM";
  const h12 = h % 12 || 12;
  return `${h12}:${String(m % 60).padStart(2, "0")} ${suffix}`;
}

function formatLength(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (!h) return `${m}m`;
  return m ? `${h}h ${m}m` : `${h}h`;
}

function formatDateLabel(iso) {
  const now = new Date();
  const date = parseISODate(iso);
  const short = date.toLocaleDateString(undefined, { month: "short", day: "numeric" });

  if (iso === toISODate(now)) return `Today, ${short}`;
  if (iso === toISODate(addDays(now, 1))) return `Tomorrow, ${short}`;

  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

/* ---------- small pieces ---------- */

function CalendarIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="3" stroke="currentColor" strokeWidth="2" />
      <path d="M3 10h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function MiniCalendar({ value, onSelect }) {
  const selected = parseISODate(value);
  const [view, setView] = useState(
    () => new Date(selected.getFullYear(), selected.getMonth(), 1)
  );

  const todayISO = toISODate(new Date());
  const tomorrowISO = toISODate(addDays(new Date(), 1));

  const year = view.getFullYear();
  const month = view.getMonth();
  const leadingBlanks = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [
    ...Array(leadingBlanks).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="mini-cal" role="group" aria-label="Choose shift date">
      <div className="mini-cal-head">
        <button
          type="button"
          className="mini-cal-nav"
          onClick={() => setView(new Date(year, month - 1, 1))}
          aria-label="Previous month"
        >
          ‹
        </button>

        <span>
          {view.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
        </span>

        <button
          type="button"
          className="mini-cal-nav"
          onClick={() => setView(new Date(year, month + 1, 1))}
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      <div className="mini-cal-grid">
        {WEEKDAYS.map((w) => (
          <span key={w} className="mini-cal-dow">
            {w}
          </span>
        ))}

        {cells.map((day, i) => {
          if (!day) return <span key={`blank-${i}`} />;

          const date = new Date(year, month, day);
          const iso = toISODate(date);
          const classes = [
            "mini-cal-day",
            iso === value && "is-selected",
            iso === todayISO && "is-today",
            iso < todayISO && "is-past",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <button
              key={iso}
              type="button"
              className={classes}
              onClick={() => onSelect(iso)}
              aria-pressed={iso === value}
              aria-label={date.toLocaleDateString(undefined, {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            >
              {day}
            </button>
          );
        })}
      </div>

      <div className="mini-cal-foot">
        <button type="button" className="shift-chip" onClick={() => onSelect(todayISO)}>
          Today
        </button>
        <button type="button" className="shift-chip" onClick={() => onSelect(tomorrowISO)}>
          Tomorrow
        </button>
      </div>
    </div>
  );
}

/* ---------- main component ---------- */

export default function AddShiftPortal({ jobs = [], onCreateShift, onClose }) {
  const usingSampleJobs = jobs.length === 0;

  const hustleJobs = useMemo(
    () => (usingSampleJobs ? EXAMPLE_JOBS : jobs).filter((job) => job.is_hustle),
    [jobs, usingSampleJobs]
  );

  // Computed when the modal opens, so it's never stuck on yesterday.
  const [shiftDate, setShiftDate] = useState(() => toISODate(new Date()));
  const [jobId, setJobId] = useState(() =>
    hustleJobs.length === 1 ? String(hustleJobs[0].id) : ""
  );
  const [startMin, setStartMin] = useState(DEFAULT_START);
  // Length is the source of truth; end time is derived from it.
  // That way changing the start keeps the same shift length.
  const [length, setLength] = useState(null);

  const [calendarOpen, setCalendarOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const dateFieldRef = useRef(null);

  const endMin = length ? startMin + length : null;

  // Escape closes the calendar first, then the modal.
  useEffect(() => {
    function handleKey(e) {
      if (e.key !== "Escape" || saving) return;
      if (calendarOpen) setCalendarOpen(false);
      else onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [calendarOpen, saving, onClose]);

  // Clicking anywhere outside the date field closes the calendar.
  useEffect(() => {
    if (!calendarOpen) return;
    function handleDown(e) {
      if (dateFieldRef.current && !dateFieldRef.current.contains(e.target)) {
        setCalendarOpen(false);
      }
    }
    document.addEventListener("mousedown", handleDown);
    return () => document.removeEventListener("mousedown", handleDown);
  }, [calendarOpen]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!jobId) {
      setError("Pick a job for this shift.");
      return;
    }
    if (!length) {
      setError("Pick an end time or a shift length.");
      return;
    }
    if (!onCreateShift) {
      setError("Shift creation API is not connected.");
      return;
    }

    const payload = {
      job_id: Number(jobId),
      shift_date: shiftDate,
      start_time: toHHMM(startMin),
      end_time: toHHMM(endMin),
      planned_minutes: length,
      status: "planned",
    };

    try {
      setSaving(true);
      await onCreateShift(payload);
      onClose();
    } catch (err) {
      setError(err.message || "Couldn't save the shift. Try again.");
      setSaving(false);
    }
  }

  return (
    <div
      className="shift-modal-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !saving) onClose();
      }}
    >
      <div
        className="shift-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="shift-modal-title"
      >
        <header className="shift-modal-header">
          <h2 id="shift-modal-title">Add hustle</h2>
          <button
            type="button"
            className="shift-close-btn"
            onClick={onClose}
            disabled={saving}
            aria-label="Close"
          >
            ×
          </button>
        </header>

        <form className="shift-form" onSubmit={handleSubmit} noValidate>
          {/* Date */}
          <div className="shift-field" ref={dateFieldRef}>
            <span className="shift-label" id="shift-date-label">
              Date
            </span>
            <button
              type="button"
              className="shift-date-btn"
              aria-labelledby="shift-date-label shift-date-value"
              aria-expanded={calendarOpen}
              onClick={() => setCalendarOpen((open) => !open)}
            >
              <CalendarIcon />
              <span id="shift-date-value" className="shift-date-text">
                {formatDateLabel(shiftDate)}
              </span>
              <span className="shift-caret" aria-hidden="true">
                ▾
              </span>
            </button>

            {calendarOpen && (
              <MiniCalendar
                value={shiftDate}
                onSelect={(iso) => {
                  setShiftDate(iso);
                  setCalendarOpen(false);
                }}
              />
            )}
          </div>

          {/* Job */}
          <div className="shift-field">
            <label htmlFor="shift-job" className="shift-label">
              Job
              {usingSampleJobs && <em className="shift-sample-tag">sample data</em>}
            </label>
            <select
              id="shift-job"
              className="shift-input"
              value={jobId}
              onChange={(e) => setJobId(e.target.value)}
            >
              <option value="">Select a job</option>
              {hustleJobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.name}
                </option>
              ))}
            </select>
          </div>

          {/* Start / end / length */}
          <div className="shift-time-row">
            <div className="shift-field">
              <label htmlFor="shift-start" className="shift-label">
                Start
              </label>
              <select
                id="shift-start"
                className="shift-input"
                value={startMin}
                onChange={(e) => setStartMin(Number(e.target.value))}
              >
                {START_OPTIONS.map((m) => (
                  <option key={m} value={m}>
                    {formatClock(m)}
                  </option>
                ))}
              </select>
            </div>

            <div className="shift-field">
              <label htmlFor="shift-end" className="shift-label">
                End
              </label>
              <select
                id="shift-end"
                className="shift-input"
                value={length ?? ""}
                onChange={(e) =>
                  setLength(e.target.value === "" ? null : Number(e.target.value))
                }
              >
                <option value="">Select</option>
                {LENGTH_OPTIONS.map((len) => {
                  const end = startMin + len;
                  return (
                    <option key={len} value={len}>
                      {formatClock(end)}
                      {end >= DAY ? " (+1 day)" : ""}
                    </option>
                  );
                })}
              </select>
            </div>

            <span
              className={`shift-length-pill${length ? "" : " is-empty"}`}
              aria-live="polite"
              aria-label={length ? `Shift length ${formatLength(length)}` : "No shift length yet"}
            >
              {length ? formatLength(length) : "–"}
            </span>
          </div>

          {/* Quick lengths */}
          <div className="shift-chips" role="group" aria-label="Quick shift length">
            {QUICK_LENGTHS.map((len) => (
              <button
                key={len}
                type="button"
                className={`shift-chip${length === len ? " is-active" : ""}`}
                aria-pressed={length === len}
                onClick={() => setLength(len)}
              >
                {formatLength(len)}
              </button>
            ))}
          </div>

          {error && (
            <div className="shift-form-error" role="alert">
              {error}
            </div>
          )}

          <div className="shift-actions">
            <button
              type="button"
              className="shift-cancel-btn"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button type="submit" className="shift-save-btn" disabled={saving}>
              {saving ? "Saving..." : "Save hustle"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}