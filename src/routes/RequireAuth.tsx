import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSession } from "../hooks/useSession";

export function RequireAuth() {
  const { user, busy } = useSession();
  const location = useLocation();

  if (busy) {
    return <div className="p-6 text-gray-500">Loading…</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
