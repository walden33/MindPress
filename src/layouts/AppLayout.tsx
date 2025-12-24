import { Outlet } from "react-router-dom";
import { useMyProfile } from "../hooks/useMyProfile";
import { useSession } from "../hooks/useSession";
import { ProfileHeader } from "../components/profile/ProfileHeader";

export function AppLayout() {
  const { user } = useSession();
  const { profile, setProfile, busy, err } = useMyProfile(!!user);

  if (busy || !profile) {
    return (
      <div className="min-h-screen grid place-items-center text-gray-500">
        {err ? `Profile error: ${err}` : "Loading profile…"}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="p-6">
        <ProfileHeader profile={profile} onProfileUpdated={setProfile} />
      </header>

      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}
