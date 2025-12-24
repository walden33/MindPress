import { useMemo } from "react";
import dayjs from "dayjs";
import { usePostStats } from "../hooks/usePostStats";
import { usePosts } from "../hooks/usePosts";
import { PostsList } from "../components/posts/PostsList";

export default function Dashboard() {
  const from = useMemo(() => dayjs().startOf("month").format("YYYY-MM-DD"), []);
  const to = useMemo(() => dayjs().endOf("month").format("YYYY-MM-DD"), []);

  const { stats } = usePostStats(from, to);
  const { posts, busy, err } = usePosts(from, to, 10);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <StatCard label="Total posts" value={stats?.total ?? "—"} />
        <StatCard label="Drafts" value={stats?.drafts ?? "—"} />
        <StatCard label="Published" value={stats?.published ?? "—"} />
      </div>

      <PostsList
        title="This month"
        posts={posts}
        busy={busy}
        err={err}
        emptyHint="No posts yet this month."
      />
    </div>
  );
}

type StatValue = number | string;

function StatCard({ label, value }: { label: string; value: StatValue }) {
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-3xl font-semibold">{value}</div>
    </div>
  );
}
