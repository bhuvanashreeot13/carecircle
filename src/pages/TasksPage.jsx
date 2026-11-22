import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../lib/AuthContext";
import { logActivity } from "../lib/logActivity";
import TaskCard from "../components/TaskCard";
import TaskForm from "../components/TaskForm";

export default function TasksPage() {
  const { user, membership } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Today's date as YYYY-MM-DD (local time), used to find overdue tasks
  const today = new Date().toLocaleDateString("en-CA");

  async function loadData() {
    setError("");

    // Family members of this circle (with their names)
    const { data: memberRows, error: membersError } = await supabase
      .from("circle_members")
      .select("user_id, role, profiles(full_name)")
      .eq("circle_id", membership.circleId);

    if (membersError) {
      setError("Could not load members: " + membersError.message);
    } else {
      setMembers(memberRows);
    }

    // Tasks of this circle
    const { data: taskRows, error: tasksError } = await supabase
      .from("tasks")
      .select("*")
      .eq("circle_id", membership.circleId)
      .order("due_date", { ascending: true });

    if (tasksError) {
      setError("Could not load tasks: " + tasksError.message);
    } else {
      setTasks(taskRows);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, [membership.circleId]);

  // Turn a user id into a name
  function nameOf(id) {
    const m = members.find((member) => member.user_id === id);
    return m?.profiles?.full_name || "Unknown";
  }

  async function handleAdd(form) {
    setError("");
    const { error: insertError } = await supabase.from("tasks").insert({
      circle_id: membership.circleId,
      title: form.title,
      description: form.description,
      assigned_to: form.assignedTo,
      due_date: form.dueDate,
      created_by: user.id,
    });

    if (insertError) {
      setError("Could not save task: " + insertError.message);
      return;
    }
    await logActivity(membership.circleId, user.id, "created a task", form.title);
    setShowForm(false);
    await loadData();
  }

  async function handleComplete(task) {
    setError("");
    const { error: updateError } = await supabase
      .from("tasks")
      .update({
        status: "completed",
        completed_by: user.id,
        completed_at: new Date().toISOString(),
      })
      .eq("id", task.id);

    if (updateError) {
      setError("Could not complete task: " + updateError.message);
      return;
    }
    await logActivity(membership.circleId, user.id, "completed a task", task.title);
    await loadData();
  }
  // Admins only: delete a task
  async function handleDelete(task) {
    if (!window.confirm(`Delete task "${task.title}"?`)) return;
    setError("");
    const { error: deleteError } = await supabase
      .from("tasks")
      .delete()
      .eq("id", task.id);
    if (deleteError) {
      setError("Could not delete task: " + deleteError.message);
      return;
    }
    await logActivity(membership.circleId, user.id, "deleted a task", task.title);
    await loadData();
  }
  if (loading) {
    return <p className="text-slate-600">Loading...</p>;
  }

  // Sort tasks into three groups
  const overdueTasks = tasks.filter((t) => t.status === "pending" && t.due_date && t.due_date < today);
  const pendingTasks = tasks.filter((t) => t.status === "pending" && !(t.due_date && t.due_date < today));
  const completedTasks = tasks.filter((t) => t.status === "completed");

    return (
    <div className="space-y-6">
      {/* Summary row */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="rounded-2xl bg-red-50 p-4 shadow">
          <p className="text-2xl font-bold text-red-600">{overdueTasks.length}</p>
          <p className="text-sm text-slate-600">Overdue</p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow">
          <p className="text-2xl font-bold text-teal-700">{pendingTasks.length}</p>
          <p className="text-sm text-slate-600">Pending</p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow">
          <p className="text-2xl font-bold text-green-700">{completedTasks.length}</p>
          <p className="text-sm text-slate-600">Completed</p>
        </div>
      </div>

      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}

      <section className="rounded-2xl bg-white p-6 shadow">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-slate-800">Tasks</h1>
          {!showForm && (
            <button onClick={() => setShowForm(true)}
              className="rounded-lg bg-teal-600 px-3 py-2 text-sm font-medium text-white hover:bg-teal-700">
              Add Task
            </button>
          )}
        </div>

        {showForm && (
          <div className="mb-4">
            <TaskForm members={members} onAdd={handleAdd} onCancel={() => setShowForm(false)} />
          </div>
        )}

        {tasks.length === 0 && !showForm && (
          <p className="text-sm text-slate-500">No tasks yet. Add the first one!</p>
        )}

        {overdueTasks.length > 0 && (
          <div className="mb-6">
            <h2 className="mb-2 font-semibold text-red-600">Overdue</h2>
            <div className="space-y-3">
              {overdueTasks.map((t) => (
                <TaskCard key={t.id} task={t} isOverdue={true}
                  assigneeName={nameOf(t.assigned_to)}
                  onComplete={handleComplete} onDelete={handleDelete} />
              ))}
            </div>
          </div>
        )}

        {pendingTasks.length > 0 && (
          <div className="mb-6">
            <h2 className="mb-2 font-semibold text-slate-800">Pending</h2>
            <div className="space-y-3">
              {pendingTasks.map((t) => (
                <TaskCard key={t.id} task={t} isOverdue={false}
                  assigneeName={nameOf(t.assigned_to)}
                  onComplete={handleComplete} onDelete={handleDelete} />
              ))}
            </div>
          </div>
        )}

        {completedTasks.length > 0 && (
          <div>
            <h2 className="mb-2 font-semibold text-green-700">Completed</h2>
            <div className="space-y-3">
              {completedTasks.map((t) => (
                <TaskCard key={t.id} task={t} isOverdue={false}
                  assigneeName={nameOf(t.assigned_to)}
                  completedByName={nameOf(t.completed_by)}
                  onDelete={handleDelete} />
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}