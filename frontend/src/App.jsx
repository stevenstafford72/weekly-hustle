import WeekBoard from "./WeekBoard";

const sampleShifts = [
  // Tech Job: Mon–Fri, 8am–4pm (8 hours)
  { id: 1,  job_name: "Tech Job", shift_date: "2026-09-28", start_time: "08:00", end_time: "16:00", planned_minutes: 480, pay: 175.0 },
  { id: 2,  job_name: "Tech Job", shift_date: "2026-09-29", start_time: "08:00", end_time: "16:00", planned_minutes: 480, pay: 175.0 },
  { id: 3,  job_name: "Tech Job", shift_date: "2026-09-30", start_time: "08:00", end_time: "16:00", planned_minutes: 480, pay: 175.0 },
  { id: 4,  job_name: "Tech Job", shift_date: "2026-10-01", start_time: "08:00", end_time: "16:00", planned_minutes: 480, pay: 175.0 },
  { id: 5,  job_name: "Tech Job", shift_date: "2026-10-02", start_time: "08:00", end_time: "16:00", planned_minutes: 480, pay: 175.0 },

  // Uber: Mon, Wed, Fri evenings
  { id: 6,  job_name: "Uber", shift_date: "2026-09-28", start_time: "17:00", end_time: "19:15", planned_minutes: 135, pay: 48.5 },
  { id: 7,  job_name: "Uber", shift_date: "2026-09-30", start_time: "17:30", end_time: "20:00", planned_minutes: 150, pay: 55.0 },
  { id: 8,  job_name: "Uber", shift_date: "2026-10-02", start_time: "18:00", end_time: "21:00", planned_minutes: 180, pay: 68.0 },

  // Valet: Sunday evening
  { id: 9,  job_name: "Valet", shift_date: "2026-10-04", start_time: "18:00", end_time: "23:00", planned_minutes: 300, pay: 75.0 },
];

function App() {
  return (
    <div style={{ padding: "16px", fontFamily: "sans-serif" }}>
      <h1 style={{ marginRight: "700px", marginBottom: "25px" }}>Weekly Hustle</h1>
       <h2>September 28 - October 4, 2026</h2>
      <WeekBoard shifts={sampleShifts} />
    </div>
  );
}

export default App;