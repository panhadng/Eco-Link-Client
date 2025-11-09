'use client';

import { usePosts } from '@/hooks/usePosts';
import { CreatePost } from '@/components/post/CreatePost';
import { PostCard } from '@/components/post/PostCard';
import { useInView } from 'react-intersection-observer';
import { useEffect } from 'react';

export default function FeedPage() {
  const { posts, loading, loadMore } = usePosts(10);
  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && !loading) {
      loadMore();
    }
  }, [inView, loading, loadMore]);

  return (
    <div className="space-y-4">
      <CreatePost />

      {loading && posts.length === 0 ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-48 animate-pulse rounded-lg bg-white dark:bg-gray-900"
            />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-lg bg-white p-12 text-center dark:bg-gray-900">
          <p className="text-gray-500 dark:text-gray-400">
            No posts yet. Create the first one!
          </p>
        </div>
      ) : (
        <>
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}

          <div ref={ref} className="py-4 text-center">
            {loading && <div className="text-gray-500">Loading more posts...</div>}
          </div>
        </>
      )}
    </div>
  );
}

