import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [membership, setMembership] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadMembership(currentUser) {
    if (!currentUser) {
      setMembership(null);
      return;
    }
    const { data, error } = await supabase
      .from("circle_members")
      .select("role, care_circles(id, name, elder_name, join_code)")
      .eq("user_id", currentUser.id)
      .limit(1)
      .maybeSingle();

    if (error || !data || !data.care_circles) {
      setMembership(null);
      return;
    }
    setMembership({
      circleId: data.care_circles.id,
      circleName: data.care_circles.name,
      elderName: data.care_circles.elder_name,
      joinCode: data.care_circles.join_code,
      role: data.role,
    });
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      const u = data.session?.user ?? null;
      setUser(u);
      await loadMembership(u);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (!u) setMembership(null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function signUp(fullName, email, password) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) throw error;
    if (!data.session) {
      throw new Error("Account created, but email confirmation is on. Turn off 'Confirm email' in Supabase.");
    }
    return data;
  }

  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    await loadMembership(data.user);
    return data;
  }

  async function signOut() {
    await supabase.auth.signOut();
    setMembership(null);
  }

  async function refreshMembership() {
    await loadMembership(user);
  }

  const value = { user, membership, loading, signUp, signIn, signOut, refreshMembership };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}