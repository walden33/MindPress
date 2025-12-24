import { NavLink, Outlet } from "react-router-dom";
import { useMyProfile } from "../hooks/useMyProfile";
import { useSession } from "../hooks/useSession";
import { ProfileHeader } from "../components/profile/ProfileHeader";

function NavItem({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "block rounded-xl px-3 py-2 text-sm border",
          isActive
            ? "bg-black text-white border-black"
            : "bg-white hover:bg-gray-50",
        ].join(" ")
      }
      end
    >
      {label}
    </NavLink>
  );
}

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

      <div className="px-6 pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-4">
          {/* Left nav */}
          <aside className="rounded-2xl border bg-white p-4 shadow-sm h-fit">
            <div className="text-xs font-semibold text-gray-500 mb-3">NAV</div>
            <div className="space-y-2">
              <NavItem to="/app/dashboard" label="Dashboard" />
              <NavItem to="/app/posts" label="Posts" />
            </div>

            <div className="mt-4 pt-4 border-t">
              <div className="text-xs text-gray-500">
                MindPress MVP • private by default
              </div>
            </div>
          </aside>

          {/* Main content */}
          <main>
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
