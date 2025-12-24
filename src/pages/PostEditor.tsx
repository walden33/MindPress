import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  getPost,
  type PostRow,
  updatePost,
  uploadCoverImage,
} from "../data/posts";
import { getMyTagIdsForPost, setMyPostTags } from "../data/tags";
import { useTagsForEditor } from "../hooks/useTagsForEditor";
import { TagPicker } from "../components/posts/TagPicker";
import supabase from "../lib/supabaseClient";

type SaveState = "idle" | "saving" | "saved" | "error";

export default function PostEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [post, setPost] = useState<PostRow | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);

  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  const { tags, createTag } = useTagsForEditor();

  const canSave = useMemo(
    () => !!post && saveState !== "saving",
    [post, saveState],
  );

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!id) return;

      try {
        setBusy(true);
        setErr(null);

        const p = await getPost(id);
        if (cancelled) return;

        setPost(p);

        // Load selected tag IDs
        const tagIds = await getMyTagIdsForPost(p.id);
        if (!cancelled) setSelectedTagIds(tagIds);

        // Resolve cover public url if storing just the path
        if (p.cover_image_path) {
          const { data } = supabase.storage
            .from("covers")
            .getPublicUrl(p.cover_image_path);
          if (!cancelled) setCoverUrl(data.publicUrl);
        } else {
          if (!cancelled) setCoverUrl(null);
        }
      } catch (e: unknown) {
        if (!cancelled)
          setErr(e instanceof Error ? e.message : "Unexpected error");
      } finally {
        if (!cancelled) setBusy(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  async function save(reason?: string) {
    if (!post) return;
    try {
      setSaveState("saving");
      setSaveMsg(null);

      const updated = await updatePost(post.id, {
        title: post.title,
        content_md: post.content_md,
        summary: post.summary,
        occurred_on: post.occurred_on,
        status: post.status,
        visibility: post.visibility,
        published_at: post.published_at,
        cover_image_path: post.cover_image_path,
      });

      await setMyPostTags(updated.id, selectedTagIds);

      setPost(updated);
      setSaveState("saved");
      setSaveMsg(reason ? `Saved (${reason}).` : "Saved.");
      window.setTimeout(() => setSaveState("idle"), 1200);
    } catch (e: unknown) {
      setSaveState("error");
      setSaveMsg(e instanceof Error ? e.message : "Save failed");
    }
  }

  async function onPickCover(file: File) {
    if (!post) return;
    try {
      setSaveMsg(null);
      setSaveState("saving");
      const { path, publicUrl } = await uploadCoverImage(file, post.id);

      const updated = await updatePost(post.id, { cover_image_path: path });
      setPost(updated);
      setCoverUrl(publicUrl);

      setSaveState("saved");
      setSaveMsg("Cover uploaded.");
      window.setTimeout(() => setSaveState("idle"), 1200);
    } catch (e: unknown) {
      setSaveState("error");
      setSaveMsg(e instanceof Error ? e.message : "Cover upload failed");
    }
  }

  if (busy) return <div className="text-sm text-gray-500">Loading…</div>;
  if (err) return <div className="text-sm text-red-700">{err}</div>;
  if (!post) return <div className="text-sm text-gray-500">Not found.</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <Link
          to="/app/dashboard"
          className="text-sm text-gray-600 hover:underline"
        >
          ← Back
        </Link>

        <div className="flex items-center gap-2">
          <div className="text-sm text-gray-500">
            {saveState === "saving"
              ? "Saving…"
              : saveState === "saved"
                ? "Saved"
                : ""}
          </div>

          <button
            className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-50"
            onClick={() => navigate("/app/posts")}
            type="button"
          >
            All posts
          </button>

          <button
            className="rounded-xl bg-black text-white px-3 py-2 text-sm disabled:opacity-50"
            onClick={() => void save("manual")}
            disabled={!canSave}
            type="button"
          >
            Save
          </button>
        </div>
      </div>

      {saveMsg && (
        <div
          className={[
            "rounded-xl border p-3 text-sm",
            saveState === "error"
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-gray-200 bg-white text-gray-700",
          ].join(" ")}
        >
          {saveMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main editor */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl border bg-white p-4 shadow-sm space-y-3">
            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-600">Title</label>
              <input
                className="rounded-xl border px-3 py-2"
                value={post.title}
                onChange={(e) => setPost({ ...post, title: e.target.value })}
                placeholder="Untitled"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-2">
                <label className="text-sm text-gray-600">Date</label>
                <input
                  className="w-full rounded-xl border px-3 py-2 text-sm"
                  type="date"
                  value={dayjs(post.occurred_on).format("YYYY-MM-DD")}
                  onChange={(e) =>
                    setPost({ ...post, occurred_on: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-600">Status</label>
                <select
                  className="w-full rounded-xl border px-3 py-2 text-sm"
                  value={post.status}
                  onChange={(e) =>
                    setPost({
                      ...post,
                      status: e.target.value as PostRow["status"],
                    })
                  }
                >
                  <option value="draft">draft</option>
                  <option value="published">published</option>
                  <option value="archived">archived</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-600">Visibility</label>
                <select
                  className="w-full rounded-xl border px-3 py-2 text-sm"
                  value={post.visibility}
                  onChange={(e) =>
                    setPost({
                      ...post,
                      visibility: e.target.value as PostRow["visibility"],
                    })
                  }
                >
                  <option value="private">private</option>
                  <option value="public">public</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-600">Summary</label>
              <textarea
                className="w-full rounded-xl border px-3 py-2 text-sm min-h-[80px]"
                value={post.summary ?? ""}
                onChange={(e) =>
                  setPost({ ...post, summary: e.target.value || null })
                }
                placeholder="Optional short summary…"
              />
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-4 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <div className="font-semibold">Content (Markdown)</div>
              <button
                className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-50"
                onClick={() => void save("content")}
                type="button"
              >
                Save content
              </button>
            </div>

            <textarea
              className="w-full rounded-xl border px-3 py-2 text-sm min-h-[420px] font-mono"
              value={post.content_md}
              onChange={(e) => setPost({ ...post, content_md: e.target.value })}
              placeholder="Write here…"
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="rounded-2xl border bg-white p-4 shadow-sm space-y-3">
            <div className="font-semibold">Cover image</div>

            {coverUrl ? (
              <img
                src={coverUrl}
                alt="cover"
                className="w-full rounded-xl border object-cover"
              />
            ) : (
              <div className="rounded-xl border bg-gray-50 p-6 text-sm text-gray-500">
                No cover image
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void onPickCover(f);
                e.currentTarget.value = "";
              }}
            />

            <div className="text-xs text-gray-500">
              Stored in Storage bucket <span className="font-mono">covers</span>
              .
            </div>
          </div>

          <TagPicker
            allTags={tags}
            selectedIds={selectedTagIds}
            onChange={setSelectedTagIds}
            onCreateTag={createTag}
          />

          <div className="rounded-2xl border bg-white p-4 shadow-sm space-y-2">
            <div className="font-semibold">Publishing notes</div>
            <div className="text-sm text-gray-600">
              When you set <b>status=published</b>, your trigger will set{" "}
              <b>published_at</b> automatically.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
