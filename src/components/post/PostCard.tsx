'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, startTransition } from 'react';
import { useMutation } from '@apollo/client';
import { useAuth } from '@/context/AuthContext';
import { ADD_POST_EMOTION, REMOVE_POST_EMOTION } from '@/lib/graphql/mutations';
import { Post } from '@/types';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { ShareButton } from './ShareButton';
import { formatDate } from '@/lib/utils';
import {
  HeartIcon,
  ChatBubbleLeftIcon,
  EllipsisHorizontalIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';

interface PostCardProps {
  post: Post;
  onPostClick?: () => void;
}

export function PostCard({ post, onPostClick }: PostCardProps) {
  const { user } = useAuth();
  const [addEmotion] = useMutation(ADD_POST_EMOTION);
  const [removeEmotion] = useMutation(REMOVE_POST_EMOTION);
  
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.emotionsCount || 0);

  useEffect(() => {
    startTransition(() => {
      setLikeCount(post.emotionsCount || 0);
    });
  }, [post.emotionsCount]);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!user) return;

    try {
      if (liked) {
        await removeEmotion({
          variables: {
            to: { id: post.id },
            data: { emotion: 'happy' },
          },
        });
        setLiked(false);
        setLikeCount((prev) => Math.max(0, prev - 1));
      } else {
        await addEmotion({
          variables: {
            to: { id: post.id },
            data: { emotion: 'happy' },
          },
        });
        setLiked(true);
        setLikeCount((prev) => prev + 1);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <Link href={`/profile/${post.author.slug}`} className="flex items-center space-x-3">
            <Avatar name={post.author.name} size="md" />
            <div>
              <p className="font-semibold text-gray-900 dark:text-white hover:underline">
                {post.author.name}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                @{post.author.slug} · {formatDate(post.createdAt)}
              </p>
            </div>
          </Link>

          <button className="rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800">
            <EllipsisHorizontalIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div
          className="mt-3 cursor-pointer"
          onClick={onPostClick || (() => (window.location.href = `/post/${post.id}`))}
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{post.title}</h3>
          <p className="mt-2 text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {post.contentExcerpt || post.content}
          </p>

          {/* Image */}
          {post.image?.url && (
            <div className="mt-3 overflow-hidden rounded-lg">
              <div className="relative aspect-video w-full">
                <Image
                  src={post.image.url}
                  alt={post.image.alt || post.title}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-3 dark:border-gray-700">
          <button
            onClick={handleLike}
            className="flex items-center space-x-2 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-red-50 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-900/20"
          >
            {liked ? (
              <HeartIconSolid className="h-5 w-5 text-red-600" />
            ) : (
              <HeartIcon className="h-5 w-5" />
            )}
            <span>{likeCount}</span>
          </button>

          <Link
            href={`/post/${post.id}`}
            className="flex items-center space-x-2 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 dark:text-gray-400 dark:hover:bg-blue-900/20"
          >
            <ChatBubbleLeftIcon className="h-5 w-5" />
            <span>{post.commentsCount}</span>
          </Link>

          <ShareButton
            postId={post.id}
            shoutedByCurrentUser={post.shoutedByCurrentUser}
            shoutedCount={post.shoutedCount}
            postTitle={post.title}
          />
        </div>
      </div>
    </Card>
  );
}

