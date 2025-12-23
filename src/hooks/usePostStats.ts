import { useEffect, useState } from "react";
import { getPostStats } from "../data/posts";

type PostStats = {
  total: number;
  drafts: number;
  published: number;
};

export function usePostStats(from?: string, to?: string) {
  const [stats, setStats] = useState<PostStats | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setBusy(true);
        setErr(null);

        const s = await getPostStats({ from, to });
        if (!cancelled) setStats(s);
      } catch (e: unknown) {
        if (!cancelled) {
          if (e instanceof Error) {
            setErr(e.message);
          } else {
            setErr("Unexpected error");
          }
        }
      } finally {
        if (!cancelled) setBusy(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [from, to]);

  return { stats, busy, err };
}
