import { supabase } from "../lib/supabaseClient";

export type ProfileRow = {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export async function getMyProfile(): Promise<ProfileRow | null> {
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("user_id, display_name, avatar_url, created_at, updated_at")
    .eq("user_id", user.id)
    .single();

  if (error) throw error;
  return data as ProfileRow;
}

export async function updateMyProfile(
  input: Pick<ProfileRow, "display_name" | "avatar_url">,
) {
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) throw new Error("Not signed in");

  const { data, error } = await supabase
    .from("profiles")
    .update({
      display_name: input.display_name,
      avatar_url: input.avatar_url,
    })
    .eq("user_id", user.id)
    .select("user_id, display_name, avatar_url, created_at, updated_at")
    .single();

  if (error) throw error;
  return data as ProfileRow;
}
