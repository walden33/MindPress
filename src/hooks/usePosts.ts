import { useEffect, useState } from "react";
import { listPosts, type PostRow } from "../data/posts";

export function usePosts(from?: string, to?: string, limit = 10) {
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setBusy(true);
        setErr(null);

        const rows = await listPosts({ from, to, limit });
        if (!cancelled) setPosts(rows);
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
  }, [from, to, limit]);

  return { posts, busy, err };
}
