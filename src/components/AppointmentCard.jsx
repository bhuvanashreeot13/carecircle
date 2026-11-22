import { useAuth } from "../lib/AuthContext";

export default function AppointmentCard({ appointment, onDelete }) {
  const { membership } = useAuth();
  const isAdmin = membership?.role === "admin"; // only admins see Delete

  const when = new Date(appointment.appointment_at);
  const dateText = when.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const hasTime = when.getHours() !== 0 || when.getMinutes() !== 0;
  const timeText = hasTime
    ? when.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
    : "";

  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-slate-800">{appointment.title}</h3>
          {appointment.location && (
            <p className="text-sm text-slate-600">{appointment.location}</p>
          )}
          <p className="mt-1 text-sm font-medium text-teal-700">
            {dateText} {timeText}
          </p>
          {appointment.notes && (
            <p className="mt-2 text-sm text-slate-500">{appointment.notes}</p>
          )}
        </div>
        {isAdmin && (
          <button onClick={() => onDelete(appointment)}
            className="shrink-0 rounded-lg border border-red-300 px-3 py-2 text-sm text-red-600 hover:bg-red-50">
            Delete
          </button>
        )}
      </div>
    </div>
  );
}