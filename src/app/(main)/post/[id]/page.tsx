'use client';

import { use } from 'react';
import { usePost } from '@/hooks/usePosts';
import { PostCard } from '@/components/post/PostCard';
import { CommentSection } from '@/components/post/CommentSection';
import { Card } from '@/components/ui/Card';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { post, loading, refetch } = usePost(id);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="rounded-lg bg-white p-12 text-center dark:bg-gray-900">
        <p className="text-gray-500 dark:text-gray-400">Post not found</p>
        <Link href="/" className="mt-4 inline-block text-primary hover:underline">
          Go back home
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Link
        href="/"
        className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
      >
        <ArrowLeftIcon className="h-5 w-5" />
        <span>Back to feed</span>
      </Link>

      <PostCard
        post={post}
        onPostUpdated={() => void refetch()}
        onPostDeleted={() => void refetch()}
      />

      <Card className="p-6">
        <CommentSection postId={post.id} comments={post.comments || []} />
      </Card>
    </div>
  );
}

