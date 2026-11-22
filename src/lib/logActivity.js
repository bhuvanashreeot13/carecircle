import { supabase } from "./supabaseClient";

// Saves one line in the activity history
export async function logActivity(circleId, userId, action, details) {
  const { error } = await supabase.from("activity_log").insert({
    circle_id: circleId,
    user_id: userId,
    action,
    details,
  });
  if (error) console.error("Could not save activity:", error.message);
}