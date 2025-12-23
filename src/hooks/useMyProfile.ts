import { useEffect, useState } from "react";
import type { ProfileRow } from "../data/profile";
import { getMyProfile } from "../data/profile";

export function useMyProfile(isSignedIn: boolean) {
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!isSignedIn) {
        setProfile(null);
        setErr(null);
        return;
      }

      try {
        setBusy(true);
        setErr(null);
        const p = await getMyProfile();
        if (!cancelled) setProfile(p);
      } catch (e: unknown) {
        if (!cancelled) {
          setErr(e instanceof Error ? e.message : "Unexpected error");
        }
      } finally {
        if (!cancelled) setBusy(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [isSignedIn]);

  return { profile, setProfile, busy, err };
}
