import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../lib/AuthContext";
import { logActivity } from "../lib/logActivity";
import AppointmentCard from "../components/AppointmentCard";
import AppointmentForm from "../components/AppointmentForm";
import TimelineItem from "../components/TimelineItem";

export default function DashboardPage() {
  const { user, membership } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Get appointments and recent activity from the database
  async function loadData() {
    setError("");

    // Start of today, so today's appointments still show
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const { data: apps, error: appsError } = await supabase
      .from("appointments")
      .select("*")
      .eq("circle_id", membership.circleId)
      .gte("appointment_at", startOfToday.toISOString())
      .order("appointment_at", { ascending: true });

    if (appsError) {
      setError("Could not load appointments: " + appsError.message);
    } else {
      setAppointments(apps);
    }

    const { data: logs, error: logsError } = await supabase
      .from("activity_log")
      .select("id, action, details, created_at, profiles(full_name)")
      .eq("circle_id", membership.circleId)
      .order("created_at", { ascending: false })
      .limit(10);

    if (logsError) {
      setError("Could not load timeline: " + logsError.message);
    } else {
      setTimeline(
        logs.map((row) => ({
          id: row.id,
          person: row.profiles?.full_name || "Someone",
          action: row.action,
          details: row.details,
          time: new Date(row.created_at).toLocaleString("en-IN", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          }),
        }))
      );
    }
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, [membership.circleId]);

  // Save a new appointment (the form gives us date and time separately)
  async function handleAdd(form) {
    setError("");
    const appointmentAt = new Date(`${form.date}T${form.time || "00:00"}`);

    const { error: insertError } = await supabase.from("appointments").insert({
      circle_id: membership.circleId,
      title: form.title,
      location: form.location,
      appointment_at: appointmentAt.toISOString(),
      notes: form.notes,
      created_by: user.id,
    });

    if (insertError) {
      setError("Could not save appointment: " + insertError.message);
      return;
    }

    await logActivity(membership.circleId, user.id, "added an appointment", form.title);
    setShowForm(false);
    await loadData();
  }
  // Admins only: delete an appointment
  async function handleDelete(appointment) {
    if (!window.confirm(`Delete "${appointment.title}"?`)) return;
    setError("");
    const { error: deleteError } = await supabase
      .from("appointments")
      .delete()
      .eq("id", appointment.id);
    if (deleteError) {
      setError("Could not delete appointment: " + deleteError.message);
      return;
    }
    await logActivity(membership.circleId, user.id, "deleted an appointment", appointment.title);
    await loadData();
  }
  if (loading) {
    return <p className="text-slate-600">Loading...</p>;
  }

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="rounded-2xl bg-teal-600 p-6 text-white shadow">
        <p className="text-sm opacity-90">Caring for</p>
        <h1 className="text-2xl font-bold">{membership.elderName}</h1>
        <p className="mt-1 text-sm">{appointments.length} upcoming appointment(s)</p>
      </div>

      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}

      {/* Appointments */}
      <section className="rounded-2xl bg-white p-6 shadow">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">Upcoming Appointments</h2>
          {!showForm && (
            <button onClick={() => setShowForm(true)}
              className="rounded-lg bg-teal-600 px-3 py-2 text-sm font-medium text-white hover:bg-teal-700">
              Add Appointment
            </button>
          )}
        </div>

        {showForm && (
          <div className="mb-4">
            <AppointmentForm onAdd={handleAdd} onCancel={() => setShowForm(false)} />
          </div>
        )}

        {appointments.length === 0 ? (
          <p className="text-sm text-slate-500">No upcoming appointments yet. Add the first one!</p>
        ) : (
          <div className="space-y-3">
            {appointments.map((a) => (
           <AppointmentCard key={a.id} appointment={a} onDelete={handleDelete} />   
            ))}
          </div>
        )}
      </section>

      {/* Timeline */}
      <section className="rounded-2xl bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-semibold text-slate-800">Care Timeline</h2>
        {timeline.length === 0 ? (
          <p className="text-sm text-slate-500">No activity yet.</p>
        ) : (
          <ul className="space-y-4">
            {timeline.map((item) => (
              <TimelineItem key={item.id} item={item} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}