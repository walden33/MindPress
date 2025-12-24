import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getPost, type PostRow } from "../data/posts";

export default function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<PostRow | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!id) return;
      try {
        setBusy(true);
        setErr(null);
        const p = await getPost(id);
        if (!cancelled) setPost(p);
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Link
          to="/app/dashboard"
          className="text-sm text-gray-600 hover:underline"
        >
          ← Back
        </Link>
      </div>

      {err && <div className="text-sm text-red-700">{err}</div>}
      {busy ? (
        <div className="text-sm text-gray-500">Loading…</div>
      ) : !post ? (
        <div className="text-sm text-gray-500">Not found.</div>
      ) : (
        <div className="rounded-2xl border bg-white p-6 shadow-sm space-y-2">
          <div className="text-2xl font-semibold">
            {post.title?.trim() ? post.title : "(Untitled)"}
          </div>
          <div className="text-sm text-gray-500">
            {post.occurred_on} • {post.status} • {post.visibility}
          </div>
          <pre className="whitespace-pre-wrap text-sm leading-6 mt-4">
            {post.content_md}
          </pre>
        </div>
      )}
    </div>
  );
}
