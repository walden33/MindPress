import { useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import type { ProfileRow } from "../../data/profile";
import { updateMyProfile } from "../../data/profile";

export function ProfileHeader({
  profile,
  onProfileUpdated,
}: {
  profile: ProfileRow;
  onProfileUpdated: (p: ProfileRow) => void;
}) {
  const initialName = useMemo(
    () => profile.display_name ?? "",
    [profile.display_name],
  );
  const [name, setName] = useState(initialName);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function saveName() {
    try {
      setBusy(true);
      setMsg(null);
      const updated = await updateMyProfile({
        display_name: name.trim() || null,
        avatar_url: profile.avatar_url,
      });
      onProfileUpdated(updated);
      setMsg("Saved.");
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : "Unexpected error");
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full border overflow-hidden bg-gray-50 flex items-center justify-center">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt="avatar"
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-sm text-gray-500">MP</span>
          )}
        </div>

        <div>
          <div className="text-sm text-gray-500">Signed in</div>
          <div className="font-medium">{profile.display_name ?? "Unnamed"}</div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          className="rounded-xl border px-3 py-2 text-sm"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Display name"
        />
        <button
          className="rounded-xl bg-black text-white px-3 py-2 text-sm disabled:opacity-50"
          onClick={saveName}
          disabled={busy}
        >
          Save
        </button>
        <button
          className="rounded-xl border px-3 py-2 text-sm"
          onClick={signOut}
        >
          Sign out
        </button>
      </div>

      {msg && <div className="text-sm text-gray-500">{msg}</div>}
    </div>
  );
}
