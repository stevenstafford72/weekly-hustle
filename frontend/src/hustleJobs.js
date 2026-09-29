// Shared job options + helpers used by ManageHustlesPortal and HustleActions.

export const JOB_TYPES = [
  { value: "delivery", label: "Delivery" },
  { value: "rideshare", label: "Rideshare" },
  { value: "security", label: "Security" },
  { value: "valet", label: "Valet" },
  { value: "food_service", label: "Food service" },
  { value: "retail", label: "Retail" },
  { value: "tech", label: "Tech" },
  { value: "other", label: "Other" },
];

export const PAY_TYPES = [
  { value: "hourly", label: "Hourly", suffix: "/hr", rateLabel: "Hourly rate", placeholder: "18.00" },
  { value: "per_gig", label: "Per gig", suffix: "/gig", rateLabel: "Average pay per gig", placeholder: "8.00" },
  { value: "salary", label: "Salary", suffix: "/yr", rateLabel: "Yearly salary", placeholder: "55000" },
];

export const JOB_COLORS = [
  { value: "#4f7cf7", name: "Blue" },
  { value: "#22b07d", name: "Green" },
  { value: "#f2a93b", name: "Amber" },
  { value: "#e5484d", name: "Red" },
  { value: "#a36bf5", name: "Purple" },
  { value: "#2bb5c8", name: "Teal" },
  { value: "#e76fb3", name: "Pink" },
  { value: "#8a8f98", name: "Gray" },
];

// Shape every job follows (matches what the form sends to the API)
export const EMPTY_JOB = {
  name: "",
  is_hustle: true, // false = main job (context for reports, hidden from Add shift)
  job_type: "delivery",
  pay_type: "hourly",
  pay_rate: null,
  gets_tips: false,
  color: JOB_COLORS[0].value,
  notes: "",
};

// Sample data until GET /jobs is wired up
export const EXAMPLE_JOBS = [
  { id: 1, name: "Tech job", is_hustle: false, job_type: "tech", pay_type: "salary", pay_rate: null, gets_tips: false, color: "#8a8f98", notes: "" },
  { id: 2, name: "Security", is_hustle: true, job_type: "security", pay_type: "hourly", pay_rate: 18, gets_tips: false, color: "#4f7cf7", notes: "" },
  { id: 3, name: "Valet", is_hustle: true, job_type: "valet", pay_type: "hourly", pay_rate: 12, gets_tips: true, color: "#f2a93b", notes: "" },
  { id: 4, name: "DoorDash", is_hustle: true, job_type: "delivery", pay_type: "per_gig", pay_rate: 8, gets_tips: true, color: "#e5484d", notes: "" },
  { id: 5, name: "Uber", is_hustle: true, job_type: "rideshare", pay_type: "per_gig", pay_rate: 12, gets_tips: true, color: "#22b07d", notes: "" },
];

function formatMoney(n) {
  return Number.isInteger(n) ? n.toLocaleString() : n.toFixed(2);
}

// "$18/hr", "about $8/gig + tips", "$55,000/yr", "hourly"
export function describePay(job) {
  const pay = PAY_TYPES.find((p) => p.value === job.pay_type) ?? PAY_TYPES[0];
  const rate = job.pay_rate;
  let text;

  if (rate == null || rate === "") {
    text = pay.label.toLowerCase();
  } else if (pay.value === "salary") {
    text = `$${Math.round(rate).toLocaleString()}${pay.suffix}`;
  } else {
    const prefix = pay.value === "per_gig" ? "about " : "";
    text = `${prefix}$${formatMoney(Number(rate))}${pay.suffix}`;
  }

  return job.gets_tips && pay.value !== "salary" ? `${text} + tips` : text;
}

// "Delivery, about $8/gig + tips"
export function describeJob(job) {
  const type = JOB_TYPES.find((t) => t.value === job.job_type)?.label ?? "Other";
  const pay = describePay(job);
  // Skip the type when the name already says it ("Security" -> "$18/hr")
  const sameAsName = type.toLowerCase() === job.name.trim().toLowerCase();
  return sameAsName ? pay.charAt(0).toUpperCase() + pay.slice(1) : `${type}, ${pay}`;
}

// First color not already used, so new jobs are easy to tell apart
export function nextFreeColor(jobs) {
  const used = new Set(jobs.map((j) => j.color));
  return (JOB_COLORS.find((c) => !used.has(c.value)) ?? JOB_COLORS[0]).value;
}
