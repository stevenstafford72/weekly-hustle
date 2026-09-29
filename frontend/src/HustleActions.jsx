import { useState } from "react";
import HustleFab from "./HustleFab";
import AddShiftPortal from "./AddShiftPortal";
import ManageHustlesPortal from "./ManageHustlesPortal";
import { EXAMPLE_JOBS } from "./hustleJobs";

/*
  Drop <HustleActions /> where your old "+ Hustle" button was.

  It owns the jobs list so both modals see the same data:
  add a job in Manage hustles and it shows up in Add shift right away.

  Each handler has a TODO for the real API call. Until then everything
  runs on sample data in memory (resets on refresh).
*/

export default function HustleActions() {
  const [jobs, setJobs] = useState(EXAMPLE_JOBS); // TODO: load from GET /jobs
  const [panel, setPanel] = useState(null); // "shift" | "hustles" | null

  const close = () => setPanel(null);

  async function createShift(payload) {
    // TODO: await api.post("/shifts", payload)
    console.log("create shift", payload);
  }

  async function createJob(data) {
    // TODO: const job = await api.post("/jobs", data)
    const job = { ...data, id: Date.now() };
    setJobs((prev) => [...prev, job]);
    return job;
  }

  async function updateJob(id, data) {
    // TODO: const job = await api.put(`/jobs/${id}`, data)
    const job = { ...data, id };
    setJobs((prev) => prev.map((j) => (j.id === id ? job : j)));
    return job;
  }

  async function deleteJob(id) {
    // TODO: await api.delete(`/jobs/${id}`)
    setJobs((prev) => prev.filter((j) => j.id !== id));
  }

  return (
    <>
      <HustleFab
        onAddShift={() => setPanel("shift")}
        onManageHustles={() => setPanel("hustles")}
      />

      {panel === "shift" && (
        <AddShiftPortal jobs={jobs} onCreateShift={createShift} onClose={close} />
      )}

      {panel === "hustles" && (
        <ManageHustlesPortal
          jobs={jobs}
          onCreateJob={createJob}
          onUpdateJob={updateJob}
          onDeleteJob={deleteJob}
          onClose={close}
        />
      )}
    </>
  );
}
