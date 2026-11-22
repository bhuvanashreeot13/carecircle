import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";

export default function LoginPage() {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const [isSignUp, setIsSignUp] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (isSignUp && !fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }
    setBusy(true);
    try {
      if (isSignUp) {
        await signUp(fullName.trim(), email, password);
      } else {
        await signIn(email, password);
      }
      navigate("/"); // ProtectedRoute sends new users to /setup
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
  }

  const inputClass = "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm";

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4 rounded-2xl bg-white p-8 shadow">
        <h1 className="text-2xl font-bold text-teal-700">CareCircle</h1>
        <p className="text-sm text-slate-500">Better Care, Together</p>
        <h2 className="text-lg font-semibold text-slate-800">
          {isSignUp ? "Sign up" : "Log in"}
        </h2>

        {isSignUp && (
          <input className={inputClass} placeholder="Full name" value={fullName}
            onChange={(e) => setFullName(e.target.value)} />
        )}
        <input type="email" className={inputClass} placeholder="Email" value={email}
          onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" className={inputClass} placeholder="Password (min 6 characters)" value={password}
          onChange={(e) => setPassword(e.target.value)} required minLength={6} />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button type="submit" disabled={busy}
          className="w-full rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50">
          {busy ? "Please wait..." : isSignUp ? "Create account" : "Log in"}
        </button>

        <button type="button" onClick={() => { setIsSignUp(!isSignUp); setError(""); }}
          className="w-full text-sm text-teal-700 underline">
          {isSignUp ? "Already have an account? Log in" : "New here? Sign up"}
        </button>
      </form>
    </div>
  );
}