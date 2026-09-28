import { useState, useEffect } from "react";
import { getJobs } from "./api";          // the function you just wrote

function App() {
  const [jobs, setJobs] = useState([]);     // starts as an empty list
  const [error, setError] = useState(null);

  useEffect(() => {
    getJobs()
      .then((data) => setJobs(data))       // save the jobs into state
      .catch((err) => setError(err.message));
  }, []);                                    // [] = run once when the page loads

  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h1>Weekly Hustle</h1>
      <ul>
        {jobs.map((job) => (
          <li key={job.id}>{job.name}</li>   // unique key, then what to show
        ))}
      </ul>
      
    </div>
  );
}

export default App;