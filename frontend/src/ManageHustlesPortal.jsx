import { useEffect, useState } from "react";
import "./AddShiftPortal.css"; // shared modal look: .shift-modal, .shift-input, .shift-chip, buttons
import "./ManageHustlesPortal.css";
import {
  EMPTY_JOB,
  JOB_COLORS,
  JOB_TYPES,
  PAY_TYPES,
  describeJob,
  nextFreeColor,
} from "./hustleJobs";

/*
  One modal, two views:
    list  -> tap a job to edit it, or "Add hustle"
    form  -> add / edit / delete a single job
  Swapping views inside the same modal avoids stacking pop-ups.

  Props:
    jobs          array of jobs
    onCreateJob   async (data) => createdJob
    onUpdateJob   async (id, data) => updatedJob
    onDeleteJob   async (id) => void
    onClose       () => void
*/

export default function ManageHustlesPortal({
  jobs = [],
  onCreateJob,
  onUpdateJob,
  onDeleteJob,
  onClose,
}) {
  // null = list view, "new" = adding, a job id = editing that job
  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const isNew = editing === "new";
  const editingJob = editing && !isNew ? jobs.find((j) => j.id === editing) : null;
  const sideHustles = jobs.filter((j) => j.is_hustle);
  const mainJobs = jobs.filter((j) => !j.is_hustle);

  function openForm(id) {
    setError("");
    setEditing(id);
  }

  function backToList() {
    setError("");
    setEditing(null);
  }

  // Escape goes back to the list first, then closes
  useEffect(() => {
    function handleKey(e) {
      if (e.key !== "Escape" || busy) return;
      if (editing !== null) backToList();
      else onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [editing, busy, onClose]);

  async function runAction(action, fallbackMessage) {
    setBusy(true);
    setError("");
    try {
      await action();
      setEditing(null);
    } catch (err) {
      setError(err.message || fallbackMessage);
    } finally {
      setBusy(false);
    }
  }

  function handleSave(data) {
    if (isNew && !onCreateJob) return setError("Job creation API is not connected.");
    if (!isNew && !onUpdateJob) return setError("Job update API is not connected.");

    runAction(
      () => (isNew ? onCreateJob(data) : onUpdateJob(editing, data)),
      "Couldn't save this hustle. Try again."
    );
  }

  function handleDelete() {
    if (!onDeleteJob) return setError("Job delete API is not connected.");
    runAction(() => onDeleteJob(editing), "Couldn't delete this hustle. Try again.");
  }

  const inForm = editing !== null;
  const title = !inForm ? "Manage hustles" : isNew ? "New hustle" : "Edit hustle";

  return (
    <div
      className="shift-modal-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !busy) onClose();
      }}
    >
      <div
        className="shift-modal hm-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="hm-title"
      >
        <header className="shift-modal-header">
          <div className="hm-title-row">
            {inForm && (
              <button
                type="button"
                className="shift-close-btn"
                onClick={backToList}
                disabled={busy}
                aria-label="Back to hustles"
              >
                ‹
              </button>
            )}
            <h2 id="hm-title">{title}</h2>
          </div>

          <button
            type="button"
            className="shift-close-btn"
            onClick={onClose}
            disabled={busy}
            aria-label="Close"
          >
            ×
          </button>
        </header>

        {inForm ? (
          <JobForm
            key={editing}
            initial={editingJob ?? { ...EMPTY_JOB, color: nextFreeColor(jobs) }}
            isNew={isNew}
            busy={busy}
            error={error}
            onSave={handleSave}
            onDelete={handleDelete}
            onCancel={backToList}
          />
        ) : (
          <div className="hm-list-view">
            {jobs.length === 0 ? (
              <div className="hm-empty">
                <p className="hm-empty-title">No hustles yet</p>
                <p>Add the jobs you pick up shifts for and they'll show up in Add shift.</p>
              </div>
            ) : (
              <>
                <JobGroup title="Side hustles" jobs={sideHustles} onPick={openForm} />
                <JobGroup
                  title={mainJobs.length > 1 ? "Main jobs" : "Main job"}
                  jobs={mainJobs}
                  onPick={openForm}
                />
              </>
            )}

            <button type="button" className="hm-add-btn" onClick={() => openForm("new")}>
              + Add hustle
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- list ---------- */

function JobGroup({ title, jobs, onPick }) {
  if (jobs.length === 0) return null;

  return (
    <section className="hm-group">
      <h3 className="hm-group-title">{title}</h3>
      <ul className="hm-list">
        {jobs.map((job) => (
          <li key={job.id}>
            <button type="button" className="hm-row" onClick={() => onPick(job.id)}>
              <span className="hm-dot" style={{ "--dot": job.color }} aria-hidden="true" />
              <span className="hm-row-text">
                <span className="hm-row-name">{job.name}</span>
                <span className="hm-row-meta">{describeJob(job)}</span>
              </span>
              <span className="hm-row-chevron" aria-hidden="true">
                ›
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ---------- form ---------- */

function Segmented({ labelledBy, options, value, onChange }) {
  return (
    <div className="hm-segmented" role="radiogroup" aria-labelledby={labelledBy}>
      {options.map((opt) => (
        <button
          key={String(opt.value)}
          type="button"
          role="radio"
          aria-checked={value === opt.value}
          className={`hm-segment${value === opt.value ? " is-active" : ""}`}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function JobForm({ initial, isNew, busy, error, onSave, onDelete, onCancel }) {
  const [form, setForm] = useState(() => ({
    ...EMPTY_JOB,
    ...initial,
    pay_rate: initial.pay_rate ?? "",
    notes: initial.notes ?? "",
  }));
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [localError, setLocalError] = useState("");

  const pay = PAY_TYPES.find((p) => p.value === form.pay_type) ?? PAY_TYPES[0];
  const shownError = localError || error;

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setLocalError("");

    const name = form.name.trim();
    if (!name) {
      setLocalError("Give this hustle a name.");
      return;
    }

    let rate = null;
    if (form.pay_rate !== "") {
      rate = Number(form.pay_rate);
      if (!Number.isFinite(rate) || rate < 0) {
        setLocalError("Enter a pay amount of 0 or more, or leave it blank.");
        return;
      }
    }

    onSave({
      name,
      is_hustle: form.is_hustle,
      job_type: form.job_type,
      pay_type: form.pay_type,
      pay_rate: rate,
      gets_tips: form.pay_type === "salary" ? false : form.gets_tips,
      color: form.color,
      notes: form.notes.trim(),
    });
  }

  return (
    <form className="shift-form" onSubmit={handleSubmit} noValidate>
      <div className="shift-field">
        <label htmlFor="hm-name" className="shift-label">
          Name
        </label>
        <input
          id="hm-name"
          className="shift-input"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="e.g. DoorDash"
          maxLength={60}
          autoFocus={isNew}
        />
      </div>

      <div className="shift-field">
        <span className="shift-label" id="hm-color-label">
          Color
        </span>
        <div className="hm-swatches" role="radiogroup" aria-labelledby="hm-color-label">
          {JOB_COLORS.map((c) => (
            <button
              key={c.value}
              type="button"
              role="radio"
              aria-checked={form.color === c.value}
              aria-label={c.name}
              className={`hm-swatch${form.color === c.value ? " is-active" : ""}`}
              style={{ "--swatch": c.value }}
              onClick={() => set("color", c.value)}
            />
          ))}
        </div>
      </div>

      <div className="shift-field">
        <span className="shift-label" id="hm-kind-label">
          Counts as
        </span>
        <Segmented
          labelledBy="hm-kind-label"
          value={form.is_hustle}
          onChange={(v) => set("is_hustle", v)}
          options={[
            { value: true, label: "Side hustle" },
            { value: false, label: "Main job" },
          ]}
        />
        {!form.is_hustle && (
          <p className="hm-hint">
            Main jobs give your reports context. They don't show up in Add shift.
          </p>
        )}
      </div>

      <div className="shift-field">
        <label htmlFor="hm-type" className="shift-label">
          Type of work
        </label>
        <select
          id="hm-type"
          className="shift-input"
          value={form.job_type}
          onChange={(e) => set("job_type", e.target.value)}
        >
          {JOB_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div className="shift-field">
        <span className="shift-label" id="hm-pay-label">
          Pay
        </span>
        <Segmented
          labelledBy="hm-pay-label"
          value={form.pay_type}
          onChange={(v) => set("pay_type", v)}
          options={PAY_TYPES.map((p) => ({ value: p.value, label: p.label }))}
        />

        <div className="hm-pay-row">
          <label className="hm-money">
            <span className="hm-money-affix" aria-hidden="true">
              $
            </span>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              aria-label={`${pay.rateLabel} (optional)`}
              placeholder={pay.placeholder}
              value={form.pay_rate}
              onChange={(e) => set("pay_rate", e.target.value)}
            />
            <span className="hm-money-affix" aria-hidden="true">
              {pay.suffix}
            </span>
          </label>

          {form.pay_type !== "salary" && (
            <label className="hm-check">
              <input
                type="checkbox"
                checked={form.gets_tips}
                onChange={(e) => set("gets_tips", e.target.checked)}
              />
              Gets tips
            </label>
          )}
        </div>
      </div>

      <div className="shift-field">
        <label htmlFor="hm-notes" className="shift-label">
          Notes <span className="hm-optional">optional</span>
        </label>
        <textarea
          id="hm-notes"
          className="shift-input hm-notes"
          rows={2}
          value={form.notes}
          onChange={(e) => set("notes", e.target.value)}
          placeholder="Anything worth remembering about this job"
          maxLength={300}
        />
      </div>

      {shownError && (
        <div className="shift-form-error" role="alert">
          {shownError}
        </div>
      )}

      {confirmingDelete ? (
        <div className="hm-confirm" role="alert">
          <p>
            Delete <strong>{initial.name}</strong>? You won't be able to add new shifts for it.
          </p>
          <div className="shift-actions">
            <button
              type="button"
              className="shift-cancel-btn"
              onClick={() => setConfirmingDelete(false)}
              disabled={busy}
            >
              Keep it
            </button>
            <button type="button" className="hm-delete-btn" onClick={onDelete} disabled={busy}>
              {busy ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      ) : (
        <div className="shift-actions">
          {!isNew && (
            <button
              type="button"
              className="hm-text-danger"
              onClick={() => setConfirmingDelete(true)}
              disabled={busy}
            >
              Delete
            </button>
          )}
          <button type="button" className="shift-cancel-btn" onClick={onCancel} disabled={busy}>
            Cancel
          </button>
          <button type="submit" className="shift-save-btn" disabled={busy}>
            {busy ? "Saving..." : isNew ? "Add hustle" : "Save changes"}
          </button>
        </div>
      )}
    </form>
  );
}
