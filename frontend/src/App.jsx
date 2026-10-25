import WeekBoard from "./WeekBoard";
import { useState, useEffect } from "react";
import { getJobs, getShifts, createShift, deleteShift } from "./api";



function toDateString(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  // Construct the date string in the format YYYY-MM-DD
  return `${y}-${m}-${day}`;
}

function getWeekRange(date = new Date()) {
  const monday = new Date(date);
  monday.setDate(monday.getDate() - monday.getDay() + 1);
  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 6);
  return { start: toDateString(monday), end: toDateString(sunday) };
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function ordinal(n) {
  // 11th, 12th, 13th are special cases
  if (n % 100 >= 11 && n % 100 <= 13) return `${n}th`;
  const suffix = { 1: "st", 2: "nd", 3: "rd" }[n % 10] || "th";
  return `${n}${suffix}`;
}

// Turns "2026-10-19", "2026-10-25" into "Oct 19th - 25th 2026"
function formatWeekRange(start, end) {
  const [startYear, startMonth, startDay] = start.split("-").map(Number);
  const [endYear, endMonth, endDay] = end.split("-").map(Number);

  const startText = `${MONTHS[startMonth - 1]} ${ordinal(startDay)}`;
  // Only repeat the month if the week crosses into a new one
  const endText = startMonth === endMonth
    ? ordinal(endDay)
    : `${MONTHS[endMonth - 1]} ${ordinal(endDay)}`;

  if (startYear !== endYear) {
    return `${startText} ${startYear} - ${endText} ${endYear}`;
  }
  return `${startText} - ${endText} ${endYear}`;
}


function App() {
  const [shifts, setShifts] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [weekRange, setWeekRange] = useState(getWeekRange());

  const { start, end } = weekRange;
  function weekStart() {
    const newStart = new Date(start + "T00:00:00");
    newStart.setDate(newStart.getDate() - 7);
    const newEnd = new Date(newStart);
    newEnd.setDate(newEnd.getDate() + 6);
    setWeekRange({ start: toDateString(newStart), end: toDateString(newEnd) });
  }
  function weekEnd() {
    const newStart = new Date(start + "T00:00:00");
    newStart.setDate(newStart.getDate() + 7);
    const newEnd = new Date(newStart);
    newEnd.setDate(newEnd.getDate() + 6);
    setWeekRange({ start: toDateString(newStart), end: toDateString(newEnd) });
  }

    useEffect(() => {
      getJobs().then(setJobs);
      getShifts(start, end).then(setShifts);
    }, [start, end]);

  async function handleCreateShift(shift) {
    await createShift(shift);
    const updated = await getShifts(start, end);
    setShifts(updated);
  }
  async function handleDeleteShift(shift) {
    await deleteShift(shift);
    const updated = await getShifts(start, end);
    setShifts(updated);
  }

  return (
    <div style={{ padding: "16px", fontFamily: "sans-serif" }}>
      <h1 style={{ marginRight: "700px", marginBottom: "25px" }}>Weekly Hustle</h1>
      <div className="week-navigation" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <button onClick={weekStart}>←</button>
       <h2>{formatWeekRange(start, end)}</h2>
        <button onClick={weekEnd}>→</button>
      </div>
      <WeekBoard shifts={shifts} jobs={jobs} onCreateShift={handleCreateShift} onDeleteShift={handleDeleteShift} />
    </div>
  );
}

export default App;