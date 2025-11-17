'use client';

import Link from 'next/link';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { PostCard } from './PostCard';
import { ArrowPathRoundedSquareIcon } from '@heroicons/react/24/solid';
import { Post } from '@/types';

interface SharedPostCardProps {
  post: Post;
  sharedBy: {
    id: string;
    name: string;
    slug: string;
  };
  sharedAt?: string;
}

export function SharedPostCard({ post, sharedBy, sharedAt }: SharedPostCardProps) {
  return (
    <Card className="overflow-hidden">
      {/* Shared By Header */}
      <div className="border-b border-gray-200 bg-[hsl(35,20%,92%)] px-4 py-3 dark:border-gray-700 dark:bg-[hsl(30,10%,18%)]">
        <div className="flex items-center space-x-2">
          <Avatar name={sharedBy.name} size="sm" />
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <Link
                href={`/profile/${sharedBy.slug}`}
                className="font-semibold text-gray-900 hover:underline dark:text-white"
              >
                {sharedBy.name}
              </Link>
              <ArrowPathRoundedSquareIcon className="h-4 w-4 text-[hsl(38,55%,45%)] dark:text-[hsl(38,65%,55%)]" />
              <span className="text-sm text-gray-600 dark:text-gray-400">shared this</span>
            </div>
            {sharedAt && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(sharedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Original Post */}
      <div className="p-4">
        <PostCard post={post} />
      </div>
    </Card>
  );
}

