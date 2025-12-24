import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createDraftPost } from "../data/posts";
import { errorMessage } from "../utils/errorMessage";

export default function NewPost() {
  const navigate = useNavigate();
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const p = await createDraftPost({
          occurred_on: dayjs().format("YYYY-MM-DD"),
        });
        if (!cancelled) navigate(`/app/posts/${p.id}`, { replace: true });
      } catch (e: unknown) {
        if (!cancelled) setErr(errorMessage(e));
        // Optional debug:
        console.error("createDraftPost failed:", e);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  if (err) return <div className="text-sm text-red-700">{err}</div>;
  return <div className="text-sm text-gray-500">Creating…</div>;
}
