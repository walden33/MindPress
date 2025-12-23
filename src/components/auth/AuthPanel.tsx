import { useState } from "react";
import supabase from "../../lib/supabaseClient";

export function AuthPanel() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function signIn() {
    try {
      setBusy(true);
      setMsg(null);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      setMsg("Signed in.");
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : "Unexpected error");
    } finally {
      setBusy(false);
    }
  }

  async function signUp() {
    try {
      setBusy(true);
      setMsg(null);
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      setMsg("Signed up. Check your email if confirmation is enabled.");
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : "Unexpected error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-sm w-full rounded-2xl border bg-white p-6 shadow-sm space-y-4">
      <div>
        <h1 className="text-xl font-semibold">MindPress</h1>
        <p className="text-sm text-gray-500">Sign in to continue</p>
      </div>

      <div className="space-y-2">
        <label className="text-sm text-gray-600">Email</label>
        <input
          className="w-full rounded-xl border px-3 py-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm text-gray-600">Password</label>
        <input
          className="w-full rounded-xl border px-3 py-2"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
      </div>

      <div className="flex gap-2">
        <button
          className="flex-1 rounded-xl bg-black text-white py-2 disabled:opacity-50"
          onClick={signIn}
          disabled={busy || !email || !password}
        >
          Sign in
        </button>
        <button
          className="flex-1 rounded-xl border py-2 disabled:opacity-50"
          onClick={signUp}
          disabled={busy || !email || !password}
        >
          Sign up
        </button>
      </div>

      {msg && <div className="text-sm text-gray-600">{msg}</div>}
    </div>
  );
}
