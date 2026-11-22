import { useState } from "react";

export default function AppointmentForm({ onAdd, onCancel }) {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    // Title and date are required
    if (!title.trim() || !date) {
      setError("Please enter a title and a date.");
      return;
    }
    onAdd({
      id: Date.now(),
      title: title.trim(),
      location: location.trim(),
      date,
      time,
      notes: notes.trim(),
    });
  }

  const inputClass =
    "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm";

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-2xl bg-white p-6 shadow">
      <h2 className="text-lg font-semibold text-slate-800">New Appointment</h2>

      <input className={inputClass} placeholder="Title *" value={title}
        onChange={(e) => setTitle(e.target.value)} />
      <input className={inputClass} placeholder="Doctor or location" value={location}
        onChange={(e) => setLocation(e.target.value)} />
      <div className="flex gap-3">
        <input type="date" className={inputClass} value={date}
          onChange={(e) => setDate(e.target.value)} />
        <input type="time" className={inputClass} value={time}
          onChange={(e) => setTime(e.target.value)} />
      </div>
      <textarea className={inputClass} placeholder="Notes" rows="2" value={notes}
        onChange={(e) => setNotes(e.target.value)} />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2">
        <button type="submit"
          className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700">
          Save
        </button>
        <button type="button" onClick={onCancel}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600">
          Cancel
        </button>
      </div>
    </form>
  );
}