import supabase from "../lib/supabaseClient";

export type PostRow = {
  id: string;
  user_id: string;
  title: string;
  content_md: string;
  occurred_on: string; // YYYY-MM-DD
  status: "draft" | "published" | "archived";
  visibility: "private" | "public";
  published_at: string | null;
  summary: string | null;
  cover_image_path: string | null;
  created_at: string;
  updated_at: string;
};

function errMsg(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (typeof e === "object" && e !== null && "message" in e) {
    const m = (e as { message?: unknown }).message;
    if (typeof m === "string") return m;
  }
  return "Unexpected error";
}

export async function listPosts({
  from,
  to,
  limit = 50,
}: {
  from?: string;
  to?: string;
  limit?: number;
}): Promise<PostRow[]> {
  let q = supabase
    .from("posts")
    .select("*")
    .order("occurred_on", { ascending: false })
    .limit(limit);

  if (from) q = q.gte("occurred_on", from);
  if (to) q = q.lte("occurred_on", to);

  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data ?? []) as PostRow[];
}

export async function getPost(id: string): Promise<PostRow> {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw new Error(error.message);
  return data as PostRow;
}

export async function deletePost(id: string): Promise<void> {
  const { error } = await supabase.from("posts").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function getPostStats({
  from,
  to,
}: {
  from?: string;
  to?: string;
}): Promise<{ total: number; drafts: number; published: number }> {
  let base = supabase.from("posts").select("id, status, occurred_on");
  if (from) base = base.gte("occurred_on", from);
  if (to) base = base.lte("occurred_on", to);

  const { data, error } = await base;
  if (error) throw new Error(error.message);

  const rows = data ?? [];
  const total = rows.length;
  const drafts = rows.filter((r) => r.status === "draft").length;
  const published = rows.filter((r) => r.status === "published").length;

  return { total, drafts, published };
}

export async function createDraftPost(params?: {
  occurred_on?: string;
}): Promise<PostRow> {
  const { data: auth, error: authErr } = await supabase.auth.getUser();
  if (authErr) throw new Error(authErr.message);

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

  if (error) throw new Error(error.message);
  return data as PostRow;
}

export async function updatePost(
  id: string,
  patch: Partial<
    Pick<
      PostRow,
      | "title"
      | "content_md"
      | "summary"
      | "occurred_on"
      | "status"
      | "visibility"
      | "published_at"
      | "cover_image_path"
    >
  >,
): Promise<PostRow> {
  const { data, error } = await supabase
    .from("posts")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as PostRow;
}

export async function uploadCoverImage(
  file: File,
  postId: string,
): Promise<{ path: string; publicUrl: string }> {
  try {
    const { data: auth, error: authErr } = await supabase.auth.getUser();
    if (authErr) throw new Error(authErr.message);

    const user = auth.user;
    if (!user) throw new Error("Not signed in");

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${user.id}/${postId}/${Date.now()}-${safeName}`;

    const { error: upErr } = await supabase.storage
      .from("covers")
      .upload(path, file, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });
    if (upErr) throw new Error(upErr.message);

    const { data } = supabase.storage.from("covers").getPublicUrl(path);
    return { path, publicUrl: data.publicUrl };
  } catch (e: unknown) {
    throw new Error(errMsg(e));
  }
}
