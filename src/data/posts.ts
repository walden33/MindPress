import supabase from "../lib/supabaseClient";

export type PostRow = {
  id: string;
  user_id: string;
  title: string;
  content_md: string;
  occurred_on: string; // date as ISO
  status: "draft" | "published" | "archived";
  visibility: "private" | "public";
  published_at: string | null;
  summary: string | null;
  cover_image_path: string | null;
  created_at: string;
  updated_at: string;
};

export async function listPosts({
  from,
  to,
  limit = 50,
}: {
  from?: string; // YYYY-MM-DD
  to?: string; // YYYY-MM-DD
  limit?: number;
}) {
  let q = supabase
    .from("posts")
    .select("*")
    .order("occurred_on", { ascending: false })
    .limit(limit);

  if (from) q = q.gte("occurred_on", from);
  if (to) q = q.lte("occurred_on", to);

  const { data, error } = await q;
  if (error) throw error;
  return data as PostRow[];
}

export async function getPost(id: string) {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as PostRow;
}

export async function upsertPost(
  input: Partial<PostRow> & Pick<PostRow, "id">,
) {
  const { data, error } = await supabase
    .from("posts")
    .upsert(input)
    .select("*")
    .single();
  if (error) throw error;
  return data as PostRow;
}

export async function deletePost(id: string) {
  const { error } = await supabase.from("posts").delete().eq("id", id);
  if (error) throw error;
}

// “Summary stats” example: count drafts/published in range
export async function getPostStats({
  from,
  to,
}: {
  from?: string;
  to?: string;
}) {
  let base = supabase.from("posts").select("id, status, occurred_on");
  if (from) base = base.gte("occurred_on", from);
  if (to) base = base.lte("occurred_on", to);

  const { data, error } = await base;
  if (error) throw error;

  const total = data.length;
  const drafts = data.filter((r) => r.status === "draft").length;
  const published = data.filter((r) => r.status === "published").length;
  return { total, drafts, published };
}

export async function createDraftPost(params?: {
  occurred_on?: string;
}): Promise<PostRow> {
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) throw new Error("Not signed in");

  const { data, error } = await supabase
    .from("posts")
    .insert({
      user_id: user.id,
      title: "",
      content_md: "",
      status: "draft",
      visibility: "private",
      occurred_on: params?.occurred_on,
    })
    .select("*")
    .single();

  if (error) throw error;
  return data as PostRow;
}

export async function uploadCoverImage(
  file: File,
  postId: string,
): Promise<{ path: string; publicUrl: string }> {
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) throw new Error("Not signed in");

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${user.id}/${postId}/${Date.now()}-${safeName}`;

  const { error: upErr } = await supabase.storage
    .from("covers")
    .upload(path, file, { contentType: file.type });

  if (upErr) throw upErr;

  const { data } = supabase.storage.from("covers").getPublicUrl(path);
  return { path, publicUrl: data.publicUrl };
}
