'use client';

import Link from 'next/link';
import {
  HomeIcon,
  UserGroupIcon,
  BookmarkIcon,
  Cog6ToothIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '@/context/AuthContext';
import { Avatar } from '@/components/ui/Avatar';

export function Sidebar() {
  const { user } = useAuth();

  const menuItems = [
    { name: 'Home', href: '/feed', icon: HomeIcon },
    { name: 'Messages', href: '/messages', icon: ChatBubbleLeftRightIcon },
    { name: 'Groups', href: '/groups', icon: UserGroupIcon },
    { name: 'Saved', href: '/saved', icon: BookmarkIcon },
    { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
  ];

  return (
    <aside className="hidden w-64 shrink-0 text-gray-900 dark:text-gray-100 lg:block">
      <div className="sticky top-20 space-y-4">
        {/* User Profile Card */}
        {user && (
          <div className="rounded-lg border border-gray-200 bg-[hsl(35,20%,99%)] p-4 dark:border-gray-800 dark:bg-[hsl(30,12%,12%)]">
            <Link href={`/profile/${user.slug}`} className="flex items-center space-x-3">
              <Avatar name={user.name} size="lg" />
              <div className="flex-1 overflow-hidden">
                <p className="truncate font-semibold text-gray-900 dark:text-white">{user.name}</p>
                <p className="truncate text-sm text-gray-500 dark:text-gray-400">@{user.slug}</p>
              </div>
            </Link>
            <div className="mt-4 flex justify-around border-t border-gray-200 pt-3 text-center dark:border-gray-700">
              <Link
                href={`/profile/${user.slug}/followers`}
                className="block transition hover:text-[hsl(38,55%,45%)] dark:hover:text-[hsl(38,65%,55%)]"
              >
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{user.followedByCount}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Followers</p>
              </Link>
              <Link
                href={`/profile/${user.slug}/following`}
                className="block transition hover:text-[hsl(38,55%,45%)] dark:hover:text-[hsl(38,65%,55%)]"
              >
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {user.followingCount ?? 0}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Following</p>
              </Link>
            </div>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="rounded-lg border border-gray-200 bg-[hsl(35,20%,99%)] dark:border-gray-800 dark:bg-[hsl(30,12%,12%)]">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <item.icon className="h-6 w-6" />
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}

