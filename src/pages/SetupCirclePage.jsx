import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../lib/AuthContext";

export default function SetupCirclePage() {
  const { refreshMembership, signOut } = useAuth();
  const navigate = useNavigate();

  const [circleName, setCircleName] = useState("");
  const [elderName, setElderName] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleCreate(e) {
    e.preventDefault();
    setError("");
    if (!circleName.trim() || !elderName.trim()) {
      setError("Please fill in both names.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.rpc("create_circle", {
      circle_name: circleName.trim(),
      elder: elderName.trim(),
    });
    if (error) {
      setError(error.message);
      setBusy(false);
      return;
    }
    await refreshMembership();
    navigate("/");
  }

  async function handleJoin(e) {
    e.preventDefault();
    setError("");
    if (!code.trim()) {
      setError("Please enter the join code.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.rpc("join_circle", { code: code.trim() });
    if (error) {
      setError(error.message);
      setBusy(false);
      return;
    }
    await refreshMembership();
    navigate("/");
  }

  const inputClass = "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm";
  const buttonClass =
    "rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50";

  return (
    <div className="mx-auto max-w-md space-y-6 p-4">
      <h1 className="text-2xl font-bold text-teal-700">Set up your care circle</h1>

      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}

      <form onSubmit={handleCreate} className="space-y-3 rounded-2xl bg-white p-6 shadow">
        <h2 className="font-semibold text-slate-800">Create a new circle</h2>
        <input className={inputClass} placeholder="Circle name (e.g. Sharma Family)" value={circleName}
          onChange={(e) => setCircleName(e.target.value)} />
        <input className={inputClass} placeholder="Relative's name (e.g. Grandma Asha)" value={elderName}
          onChange={(e) => setElderName(e.target.value)} />
        <button type="submit" disabled={busy} className={buttonClass}>Create circle</button>
      </form>

      <form onSubmit={handleJoin} className="space-y-3 rounded-2xl bg-white p-6 shadow">
        <h2 className="font-semibold text-slate-800">Join with a code</h2>
        <input className={inputClass} placeholder="6-character code" value={code}
          onChange={(e) => setCode(e.target.value)} />
        <button type="submit" disabled={busy} className={buttonClass}>Join circle</button>
      </form>

      <button onClick={async () => { await signOut(); navigate("/login"); }}
        className="text-sm text-slate-500 underline">
        Log out
      </button>
    </div>
  );
}