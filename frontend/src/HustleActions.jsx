import { useState } from "react";
import HustleFab from "./HustleFab";
import AddShiftPortal from "./AddShiftPortal";
import ManageHustlesPortal from "./ManageHustlesPortal";
import { requestFormReset } from "react-dom";

/*
  Drop <HustleActions /> where your old "+ Hustle" button was.

  It owns the jobs list so both modals see the same data:
  add a job in Manage hustles and it shows up in Add shift right away.

  Each handler has a TODO for the real API call. Until then everything
  runs on sample data in memory (resets on refresh).
*/


export default function HustleActions({ jobs: realJobs = [], onCreateShift, onDeleteJob, onCreateJob}) {
  const [jobs, setJobs] = useState(realJobs); // TODO: load from GET /jobs
  const [panel, setPanel] = useState(null); // "shift" | "hustles" | null
  

  const close = () => setPanel(null);

  async function createShift(payload) {
    return onCreateShift(payload);    
  }

  async function createJob(data) {
    return onCreateJob(data);
  }

  async function updateJob(id, data) {
    // TODO: const job = await api.put(`/jobs/${id}`, data)
    const job = { ...data, id };
    setJobs((prev) => prev.map((j) => (j.id === id ? job : j)));
    return job;
  }

  async function deleteJob(data) {
    return onDeleteJob(data); 
  }


  return (
    <>
      <HustleFab
        onAddShift={() => setPanel("shift")}
        onManageHustles={() => setPanel("hustles")}
      />

      {panel === "shift" && (
        <AddShiftPortal jobs={realJobs} onCreateShift={createShift} onClose={close} />
      )}

      {panel === "hustles" && (
        <ManageHustlesPortal
          jobs={realJobs}
          onCreateJob={createJob}
          onUpdateJob={updateJob}
          onDeleteJob={deleteJob}
          onClose={close}
        />
      )}
    </>
  );
}
