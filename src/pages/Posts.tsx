import { Link } from "react-router-dom";
import { usePosts } from "../hooks/usePosts";
import { PostsList } from "../components/posts/PostsList";
import dayjs from "dayjs";

export default function Posts() {
  // show last 90 days by default
  const from = dayjs().subtract(90, "day").format("YYYY-MM-DD");
  const to = dayjs().format("YYYY-MM-DD");

  const { posts, busy, err } = usePosts(from, to, 50);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Posts</h1>
        <Link
          to="/app/posts/new"
          className="rounded-xl bg-black text-white px-3 py-2 text-sm"
        >
          New post
        </Link>
      </div>

      <PostsList title="Recent (90 days)" posts={posts} busy={busy} err={err} />
    </div>
  );
}
