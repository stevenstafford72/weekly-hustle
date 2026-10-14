import WeekBoard from "./WeekBoard";
import { useState, useEffect } from "react";
import { getJobs, getShifts, createShift } from "./api";



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


function App() {
  const [shifts, setShifts] = useState([]);
  const [jobs, setJobs] = useState([]);

  const { start, end } = getWeekRange();

    useEffect(() => {
      getJobs().then(setJobs);
      getShifts(start, end).then(setShifts);
    }, [start, end]);

  async function handleCreateShift(shift) {
    await createShift(shift);
    const updated = await getShifts(start, end);
    setShifts(updated);
  }
  
  return (
    <div style={{ padding: "16px", fontFamily: "sans-serif" }}>
      <h1 style={{ marginRight: "700px", marginBottom: "25px" }}>Weekly Hustle</h1>
       <h2>{start} - {end} </h2>
      <WeekBoard shifts={shifts} jobs={jobs} onCreateShift={handleCreateShift} />
    </div>
  );
}

export default App;