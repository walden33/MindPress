import { useMemo } from "react";
import dayjs from "dayjs";
import { usePostStats } from "../hooks/usePostStats";

export default function Dashboard() {
  const from = useMemo(() => dayjs().startOf("month").format("YYYY-MM-DD"), []);
  const to = useMemo(() => dayjs().endOf("month").format("YYYY-MM-DD"), []);

  const { stats } = usePostStats(from, to);

  return (
    <div className="p-6 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <StatCard label="Total posts" value={stats?.total ?? "—"} />
        <StatCard label="Drafts" value={stats?.drafts ?? "—"} />
        <StatCard label="Published" value={stats?.published ?? "—"} />
      </div>
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
