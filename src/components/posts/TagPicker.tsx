import { useMemo, useState } from "react";
import type { TagRow } from "../../data/tags";

export function TagPicker({
  allTags,
  selectedIds,
  onChange,
  onCreateTag,
}: {
  allTags: TagRow[];
  selectedIds: string[];
  onChange: (next: string[]) => void;
  onCreateTag: (name: string) => Promise<TagRow | undefined>;
}) {
  const [newTag, setNewTag] = useState("");

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  function toggle(id: string) {
    if (selectedSet.has(id)) onChange(selectedIds.filter((x) => x !== id));
    else onChange([...selectedIds, id]);
  }

  async function createAndSelect() {
    const created = await onCreateTag(newTag);
    if (created) {
      onChange([...selectedIds, created.id]);
      setNewTag("");
    }
  }

  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm space-y-3">
      <div className="font-semibold">Tags</div>

      <div className="flex gap-2">
        <input
          className="flex-1 rounded-xl border px-3 py-2 text-sm"
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          placeholder="Create tag (e.g., gratitude)"
        />
        <button
          className="rounded-xl bg-black text-white px-3 py-2 text-sm disabled:opacity-50"
          disabled={!newTag.trim()}
          onClick={createAndSelect}
        >
          Add
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {allTags.map((t) => {
          const on = selectedSet.has(t.id);
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => toggle(t.id)}
              className={[
                "rounded-full px-3 py-1 text-sm border",
                on
                  ? "bg-black text-white border-black"
                  : "bg-white hover:bg-gray-50",
              ].join(" ")}
              title={t.slug}
            >
              {t.name}
            </button>
          );
        })}
        {allTags.length === 0 && (
          <div className="text-sm text-gray-500">No tags yet.</div>
        )}
      </div>
    </div>
  );
}
