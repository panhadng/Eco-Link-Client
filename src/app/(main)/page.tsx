'use client';

import { usePosts } from '@/hooks/usePosts';
import { CreatePost } from '@/components/post/CreatePost';
import { PostCard } from '@/components/post/PostCard';
import { useInView } from 'react-intersection-observer';
import { useEffect } from 'react';
import { Post } from '@/types';
export default function FeedPage() {
  const { posts, loading, loadMore, refetch } = usePosts(10);
  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && !loading) {
      loadMore();
    }
  }, [inView, loading, loadMore]);

  return (
    <div className="space-y-3 md:space-y-4">
      <CreatePost />

      {loading && posts.length === 0 ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 animate-pulse rounded-2xl bg-card border border-border" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <p className="text-muted-foreground">No posts yet. Create the first one!</p>
        </div>
      ) : (
        <>
          {posts.map((post: Post) => (
            <PostCard
              key={post.id}
              post={post}
              onPostUpdated={() => refetch()}
              onPostDeleted={() => refetch()}
            />
          ))}

          <div ref={ref} className="py-4 text-center">
            {loading && <div className="text-muted-foreground">Loading more posts…</div>}
          </div>
        </>
      )}
    </div>
  );
}

