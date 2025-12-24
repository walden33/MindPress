import { useEffect, useState } from "react";
import type { TagRow } from "../data/tags";
import { createMyTag, listMyTags } from "../data/tags";

export function useTagsForEditor() {
  const [tags, setTags] = useState<TagRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function refresh() {
    try {
      setBusy(true);
      setErr(null);
      const t = await listMyTags();
      setTags(t);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Unexpected error");
    } finally {
      setBusy(false);
    }
  }

  async function createTag(name: string) {
    const trimmed = name.trim();
    if (!trimmed) return;
    const created = await createMyTag(trimmed);
    setTags((prev) =>
      [...prev, created].sort((a, b) => a.name.localeCompare(b.name)),
    );
    return created;
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { tags, busy, err, refresh, createTag };
}
