import { useState } from "react";

export default function TaskForm({ members, onAdd, onCancel }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    // Title, assignee and due date are required
    if (!title.trim() || !assignedTo || !dueDate) {
      setError("Please enter a title, choose who it is assigned to, and set a due date.");
      return;
    }
    onAdd({
      title: title.trim(),
      description: description.trim(),
      assignedTo,
      dueDate,
    });
  }

  const inputClass = "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm";

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-2xl border border-slate-200 p-4">
      <h2 className="text-lg font-semibold text-slate-800">New Task</h2>

      <input className={inputClass} placeholder="Task title *" value={title}
        onChange={(e) => setTitle(e.target.value)} />
      <textarea className={inputClass} placeholder="Description (optional)" rows="2" value={description}
        onChange={(e) => setDescription(e.target.value)} />

      <select className={inputClass} value={assignedTo}
        onChange={(e) => setAssignedTo(e.target.value)}>
        <option value="">Assign to... *</option>
        {members.map((m) => (
          <option key={m.user_id} value={m.user_id}>
            {m.profiles?.full_name || "Unnamed member"}
          </option>
        ))}
      </select>

      <input type="date" className={inputClass} value={dueDate}
        onChange={(e) => setDueDate(e.target.value)} />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2">
        <button type="submit"
          className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700">
          Save task
        </button>
        <button type="button" onClick={onCancel}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600">
          Cancel
        </button>
      </div>
    </form>
  );
}