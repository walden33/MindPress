import dayjs from "dayjs";
import { Link } from "react-router-dom";
import type { PostRow } from "../../data/posts";

export function PostsList({
  title = "Recent posts",
  posts,
  busy,
  err,
  emptyHint = "No posts found in this range.",
}: {
  title?: string;
  posts: PostRow[];
  busy: boolean;
  err: string | null;
  emptyHint?: string;
}) {
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-base font-semibold">{title}</div>
          <div className="text-sm text-gray-500">Click a row to open</div>
        </div>

        <Link
          to="/app/posts"
          className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-50"
        >
          View all
        </Link>
      </div>

      {err && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {err}
        </div>
      )}

      {busy ? (
        <div className="text-sm text-gray-500">Loading posts…</div>
      ) : posts.length === 0 ? (
        <div className="text-sm text-gray-500">{emptyHint}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500">
                <th className="py-2 pr-3 font-medium">Date</th>
                <th className="py-2 pr-3 font-medium">Title</th>
                <th className="py-2 pr-3 font-medium">Status</th>
                <th className="py-2 pr-3 font-medium">Visibility</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => (
                <tr key={p.id} className="border-t hover:bg-gray-50">
                  <td className="py-2 pr-3 whitespace-nowrap">
                    {dayjs(p.occurred_on).format("MMM D")}
                  </td>
                  <td className="py-2 pr-3">
                    <Link
                      to={`/app/posts/${p.id}`}
                      className="font-medium hover:underline"
                    >
                      {p.title?.trim() ? p.title : "(Untitled)"}
                    </Link>
                    {p.summary ? (
                      <div className="text-xs text-gray-500 line-clamp-1">
                        {p.summary}
                      </div>
                    ) : null}
                  </td>
                  <td className="py-2 pr-3 capitalize">{p.status}</td>
                  <td className="py-2 pr-3 capitalize">{p.visibility}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
