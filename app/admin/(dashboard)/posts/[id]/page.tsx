import { notFound } from "next/navigation";

import { getPost } from "@/lib/admin/posts";
import { PostForm } from "@/components/admin/post-form";

export default async function AdminPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (id === "new") {
    return <PostForm post={null} />;
  }

  const numericId = Number(id);
  if (!Number.isInteger(numericId)) notFound();

  const post = await getPost(numericId);
  if (!post) notFound();

  return <PostForm post={post} />;
}
