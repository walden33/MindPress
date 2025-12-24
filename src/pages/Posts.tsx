import dayjs from "dayjs";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PostsList } from "../components/posts/PostsList";
import { createDraftPost } from "../data/posts";
import { usePosts } from "../hooks/usePosts";
import { errorMessage } from "../utils/errorMessage";

export default function Posts() {
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // show last 90 days by default
  const from = dayjs().subtract(90, "day").format("YYYY-MM-DD");
  const to = dayjs().format("YYYY-MM-DD");

  const { posts, busy, err: listErr } = usePosts(from, to, 50);

  async function onNewPost() {
    if (creating) return;
    try {
      setCreating(true);
      setErr(null);

      const p = await createDraftPost({
        occurred_on: dayjs().format("YYYY-MM-DD"),
      });
      navigate(`/app/posts/${p.id}`);
    } catch (e: unknown) {
      setErr(errorMessage(e));
      console.error("createDraftPost failed:", e);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Posts</h1>

        <button
          type="button"
          className="rounded-xl bg-black text-white px-3 py-2 text-sm disabled:opacity-50"
          onClick={() => void onNewPost()}
          disabled={creating}
        >
          {creating ? "Creating…" : "New post"}
        </button>
      </div>

      {err && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {err}
        </div>
      )}

      <PostsList
        title="Recent (90 days)"
        posts={posts}
        busy={busy}
        err={listErr}
      />
    </div>
  );
}
