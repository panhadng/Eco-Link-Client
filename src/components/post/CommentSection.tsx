'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCreateComment } from '@/hooks/useComments';
import { Comment } from '@/types';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';

interface CommentSectionProps {
  postId: string;
  comments: Comment[];
}

export function CommentSection({ postId, comments }: CommentSectionProps) {
  const { user } = useAuth();
  const { createComment, loading } = useCreateComment(postId);
  const [content, setContent] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      await createComment({
        variables: {
          postId,
          content: content.trim(),
        },
      });
      setContent('');
    } catch (error) {
      console.error('Error creating comment:', error);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Comments ({comments.length})
      </h3>

      {/* Comment Form */}
      {user && (
        <form onSubmit={handleSubmit} className="flex space-x-3">
          <Avatar name={user.name} size="md" />
          <div className="flex-1">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write a comment..."
              rows={3}
              className="mb-2 border border-gray-200 bg-background"
            />
            <Button type="submit" variant="default" size="sm" isLoading={loading} disabled={!content.trim()}>
              Comment
            </Button>
          </div>
        </form>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="flex space-x-3">
            <Avatar name={comment.author.name} size="md" />
            <div className="flex-1">
              <div className="rounded-lg bg-gray-100 p-3 dark:bg-gray-800">
                <Link
                  href={`/profile/${comment.author.slug}`}
                  className="font-semibold text-gray-900 hover:underline dark:text-white"
                >
                  {comment.author.name}
                </Link>
                <p className="mt-1 text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {comment.content}
                </p>
              </div>
              <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                <span>{formatDate(comment.createdAt)}</span>
                <button className="hover:underline">Like</button>
                <button className="hover:underline">Reply</button>
              </div>
            </div>
          </div>
        ))}

        {comments.length === 0 && (
          <p className="py-8 text-center text-gray-500 dark:text-gray-400">
            No comments yet. Be the first to comment!
          </p>
        )}
      </div>
    </div>
  );
}

