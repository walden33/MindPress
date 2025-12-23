import { AuthPanel } from "./components/auth/AuthPanel";
import { ProfileHeader } from "./components/profile/ProfileHeader";
import { useSession } from "./hooks/useSession";
import { useMyProfile } from "./hooks/useMyProfile";

export default function App() {
  const { user, busy: authBusy } = useSession();
  const { profile, setProfile, busy: profileBusy, err } = useMyProfile(!!user);

  if (authBusy) {
    return (
      <div className="min-h-screen grid place-items-center text-gray-600">
        Loading…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen grid place-items-center bg-gray-50 p-6">
        <AuthPanel />
      </div>
    );
  }

  if (profileBusy || !profile) {
    return (
      <div className="min-h-screen grid place-items-center text-gray-600">
        {err ? `Profile error: ${err}` : "Loading profile…"}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-4">
      <ProfileHeader profile={profile} onProfileUpdated={setProfile} />
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="text-lg font-semibold">Dashboard (next)</div>
        <div className="text-sm text-gray-500">
          Now that auth + profiles work, we’ll add posts & check-ins.
        </div>
      </div>
    </div>
  );
}
