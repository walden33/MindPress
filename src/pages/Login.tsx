import { Navigate } from "react-router-dom";
import { useSession } from "../hooks/useSession";
import { AuthPanel } from "../components/auth/AuthPanel";

export default function Login() {
  const { user, busy } = useSession();

  if (busy) return null;
  if (user) return <Navigate to="/app/dashboard" replace />;

  return (
    <div className="min-h-screen grid place-items-center bg-gray-50 p-6">
      <AuthPanel />
    </div>
  );
}
