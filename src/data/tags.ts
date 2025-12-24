import supabase from "../lib/supabaseClient";

export type TagRow = {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
};

function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export async function listMyTags(): Promise<TagRow[]> {
  const { data, error } = await supabase
    .from("tags")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw error;
  return (data ?? []) as TagRow[];
}

export async function createMyTag(name: string): Promise<TagRow> {
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) throw new Error("Not signed in");

  const slug = slugify(name);

  const { data, error } = await supabase
    .from("tags")
    .insert({
      user_id: user.id,
      name: name.trim(),
      slug,
    })
    .select("*")
    .single();

  if (error) throw error;
  return data as TagRow;
}

export async function getMyTagIdsForPost(postId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("post_tags")
    .select("tag_id")
    .eq("post_id", postId);

  if (error) throw error;
  return (data ?? []).map((r) => r.tag_id as string);
}

export async function setMyPostTags(
  postId: string,
  tagIds: string[],
): Promise<void> {
  // Remove existing joins, then insert desired ones.
  const { error: delErr } = await supabase
    .from("post_tags")
    .delete()
    .eq("post_id", postId);
  if (delErr) throw delErr;

  if (tagIds.length === 0) return;

  const rows = tagIds.map((tag_id) => ({ post_id: postId, tag_id }));
  const { error: insErr } = await supabase.from("post_tags").insert(rows);
  if (insErr) throw insErr;
}
