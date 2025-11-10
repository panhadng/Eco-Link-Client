'use client';

import { useQuery } from '@apollo/client';
import { GET_USERS } from '@/lib/graphql/queries';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { User } from '@/types';

export function RightSidebar() {
  const { data, loading } = useQuery(GET_USERS, {
    variables: { first: 5, offset: 0 },
  });

  const users = data?.User || [];

  return (
    <aside className="hidden w-80 shrink-0 text-gray-900 dark:text-gray-100 xl:block">
      <div className="sticky top-20 space-y-4">
        {/* Suggestions Card */}
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">Suggested for you</h3>

          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center space-x-3 animate-pulse">
                  <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700" />
                  <div className="flex-1">
                    <div className="h-4 w-24 bg-gray-200 rounded dark:bg-gray-700" />
                    <div className="h-3 w-16 mt-1 bg-gray-200 rounded dark:bg-gray-700" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {users.slice(0, 5).map((user: User) => (
                <div key={user.id} className="flex items-center justify-between">
                  <Link
                    href={`/profile/${user.slug}`}
                    className="flex items-center space-x-3 flex-1 min-w-0"
                  >
                    <Avatar name={user.name} size="md" />
                    <div className="flex-1 overflow-hidden">
                      <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                        {user.name}
                      </p>
                      <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                        @{user.slug}
                      </p>
                    </div>
                  </Link>
                  <Button size="sm" variant="outline">
                    Follow
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Links */}
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400">
            <Link href="/about" className="hover:underline">About</Link>
            <span>·</span>
            <Link href="/help" className="hover:underline">Help</Link>
            <span>·</span>
            <Link href="/terms" className="hover:underline">Terms</Link>
            <span>·</span>
            <Link href="/privacy" className="hover:underline">Privacy</Link>
          </div>
          <p className="mt-3 text-xs text-gray-400">© 2024 EcoLink Social</p>
        </div>
      </div>
    </aside>
  );
}

