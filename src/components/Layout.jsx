import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";

const linkClass = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-medium ${
    isActive ? "bg-teal-100 text-teal-800" : "text-slate-600 hover:bg-slate-100"
  }`;

export default function Layout() {
  const { user, membership, signOut } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await signOut();
    navigate("/login");
  }

  const name = user?.user_metadata?.full_name || user?.email;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-2 px-4 py-3">
          <span className="text-xl font-bold text-teal-700">CareCircle</span>
          <nav className="flex gap-1">
            <NavLink to="/" end className={linkClass}>Dashboard</NavLink>
            <NavLink to="/tasks" className={linkClass}>Tasks</NavLink>
            <NavLink to="/activity" className={linkClass}>Activity</NavLink>
          </nav>
          <button onClick={handleLogout}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-600">
            Log out
          </button>
        </div>
        <div className="mx-auto flex max-w-4xl flex-wrap justify-between gap-2 border-t border-slate-100 px-4 py-2 text-xs text-slate-500">
          <span>
            {name}{" "}
            {membership && (
              <span className="ml-1 rounded-full bg-teal-100 px-2 py-0.5 font-medium capitalize text-teal-800">
                {membership.role}
              </span>
            )}
          </span>
          {membership && (
            <span>
              {membership.circleName} - Join code:{" "}
              <strong className="text-slate-700">{membership.joinCode}</strong>
            </span>
          )}
        </div>
      </header>
      <main className="mx-auto max-w-4xl p-4">
        <Outlet />
      </main>
    </div>
  );
}