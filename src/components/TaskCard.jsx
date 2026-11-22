import { useAuth } from "../lib/AuthContext";

export default function TaskCard({ task, assigneeName, completedByName, isOverdue, onComplete, onDelete }) {
  const { user, membership } = useAuth();
  const isAdmin = membership?.role === "admin";
  const isDone = task.status === "completed";

  // Only the assigned person or an admin can complete a task
  const canComplete = !isDone && (isAdmin || task.assigned_to === user.id);

  const borderClass = isOverdue ? "border-red-400 bg-red-50" : "border-slate-200";

  const dueText = task.due_date
    ? new Date(task.due_date + "T00:00:00").toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "No due date";

  return (
    <div className={`rounded-xl border p-4 ${borderClass}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className={`font-semibold ${isDone ? "text-slate-500 line-through" : "text-slate-800"}`}>
            {task.title}
          </h3>
          {task.description && (
            <p className="mt-1 text-sm text-slate-600">{task.description}</p>
          )}
          <p className="mt-2 text-sm text-slate-600">Assigned to: {assigneeName}</p>
          <p className={`text-sm font-medium ${isOverdue ? "text-red-600" : "text-teal-700"}`}>
            {isOverdue ? "Overdue - due " : "Due "}
            {dueText}
          </p>
          {isDone && (
            <p className="mt-1 text-sm text-green-700">
              Completed by {completedByName}
              {task.completed_at &&
                " on " +
                  new Date(task.completed_at).toLocaleString("en-IN", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
            </p>
          )}
        </div>

        <div className="flex shrink-0 flex-col gap-2">
          {canComplete && (
            <button onClick={() => onComplete(task)}
              className="rounded-lg bg-teal-600 px-3 py-2 text-sm font-medium text-white hover:bg-teal-700">
              Mark complete
            </button>
          )}
          {isAdmin && (
            <button onClick={() => onDelete(task)}
              className="rounded-lg border border-red-300 px-3 py-2 text-sm text-red-600 hover:bg-red-50">
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}