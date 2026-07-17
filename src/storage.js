// Supabase-backed storage — scoped per authenticated user.
// Keeps the same async API the app expects (get/set/delete/list).
import { supabase } from "./supabase.js";

let _userId = null;

export function setStorageUser(userId) {
  _userId = userId;
}

export const storage = {
  async get(key) {
    if (!_userId) return null;
    const { data, error } = await supabase
      .from("user_data")
      .select("value")
      .eq("user_id", _userId)
      .eq("key", key)
      .maybeSingle();
    if (error || !data) return null;
    return { key, value: data.value };
  },

  async set(key, value) {
    if (!_userId) return { key, value };
    const { error } = await supabase.from("user_data").upsert(
      { user_id: _userId, key, value },
      { onConflict: "user_id,key" }
    );
    if (error) console.error("storage.set error:", error);
    return { key, value };
  },

  async delete(key) {
    if (!_userId) return { key, deleted: true };
    await supabase
      .from("user_data")
      .delete()
      .eq("user_id", _userId)
      .eq("key", key);
    return { key, deleted: true };
  },

  async list(prefix = "") {
    if (!_userId) return { keys: [], prefix };
    const { data, error } = await supabase
      .from("user_data")
      .select("key")
      .eq("user_id", _userId)
      .like("key", `${prefix}%`);
    if (error || !data) return { keys: [], prefix };
    return { keys: data.map((r) => r.key), prefix };
  },
};
