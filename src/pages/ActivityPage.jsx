import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../lib/AuthContext";

export default function ActivityPage() {
  const { membership } = useAuth();
  const [members, setMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [activity, setActivity] = useState([]);
  const [filter, setFilter] = useState("all"); // "all" or a member's user id
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadData() {
    setError("");

    // Family members with their names and roles
    const { data: memberRows, error: membersError } = await supabase
      .from("circle_members")
      .select("user_id, role, profiles(full_name)")
      .eq("circle_id", membership.circleId);
    if (membersError) {
      setError("Could not load members: " + membersError.message);
    } else {
      setMembers(memberRows);
    }

    // Tasks (used to count pending and completed per person)
    const { data: taskRows, error: tasksError } = await supabase
      .from("tasks")
      .select("id, status, assigned_to, completed_by")
      .eq("circle_id", membership.circleId);
    if (tasksError) {
      setError("Could not load tasks: " + tasksError.message);
    } else {
      setTasks(taskRows);
    }

    // Full activity history, newest first
    const { data: logRows, error: logError } = await supabase
      .from("activity_log")
      .select("id, user_id, action, details, created_at, profiles(full_name)")
      .eq("circle_id", membership.circleId)
      .order("created_at", { ascending: false });
    if (logError) {
      setError("Could not load activity: " + logError.message);
    } else {
      setActivity(logRows);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, [membership.circleId]);

  if (loading) {
    return <p className="text-slate-600">Loading...</p>;
  }

  // Only show history for the chosen member (or everyone)
  const shownActivity =
    filter === "all" ? activity : activity.filter((row) => row.user_id === filter);

  return (
    <div className="space-y-6">
      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}

      {/* Family members */}
      <section className="rounded-2xl bg-white p-6 shadow">
        <h1 className="mb-4 text-lg font-semibold text-slate-800">Family Members</h1>
        <div className="grid gap-3 sm:grid-cols-2">
          {members.map((m) => {
            const pending = tasks.filter(
              (t) => t.assigned_to === m.user_id && t.status === "pending"
            ).length;
            const completed = tasks.filter(
              (t) => t.completed_by === m.user_id
            ).length;
            return (
              <div key={m.user_id} className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-800">
                    {m.profiles?.full_name || "Unnamed member"}
                  </h3>
                  <span className="rounded-full bg-teal-100 px-2 py-1 text-xs font-medium capitalize text-teal-800">
                    {m.role}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-600">Pending tasks: {pending}</p>
                <p className="text-sm text-slate-600">Tasks completed: {completed}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Activity history */}
      <section className="rounded-2xl bg-white p-6 shadow">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-slate-800">Activity History</h2>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="all">All members</option>
            {members.map((m) => (
              <option key={m.user_id} value={m.user_id}>
                {m.profiles?.full_name || "Unnamed member"}
              </option>
            ))}
          </select>
        </div>

        {shownActivity.length === 0 ? (
          <p className="text-sm text-slate-500">No activity yet.</p>
        ) : (
          <ul className="space-y-4">
            {shownActivity.map((row) => (
              <li key={row.id} className="border-l-2 border-teal-300 pl-4">
                <p className="text-sm text-slate-800">
                  <span className="font-semibold">{row.profiles?.full_name || "Someone"}</span>{" "}
                  {row.action}
                  {row.details && `: ${row.details}`}
                </p>
                <p className="text-xs text-slate-500">
                  {new Date(row.created_at).toLocaleString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}