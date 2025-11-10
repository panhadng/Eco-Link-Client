'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { HomeIcon, UserCircleIcon, MagnifyingGlassIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/context/AuthContext';
import { Avatar } from '@/components/ui/Avatar';
import { NotificationMenu } from '@/components/notifications/NotificationMenu';
import { useRooms } from '@/hooks/useMessages';

export function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { rooms } = useRooms();

  const unreadMessageCount = useMemo(
    () => rooms.reduce((total, room) => total + (room.unreadCount ?? 0), 0),
    [rooms]
  );

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <nav className="sticky top-0 z-40 border-b border-gray-200 bg-white text-gray-900 shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[linear-gradient(to_bottom_right,#3b82f6,#9333ea)]">
              <span className="text-xl font-bold text-white">E</span>
            </div>
            <span className="hidden text-xl font-bold text-gray-900 dark:text-white sm:inline">
              EcoLink
            </span>
          </Link>

          {/* Search Bar */}
          <div className="hidden flex-1 max-w-md px-8 md:block">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full rounded-full border border-gray-300 bg-gray-50 py-2 pl-10 pr-4 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              />
            </div>
          </div>

          {/* Nav Icons */}
          <div className="flex items-center space-x-4">
            <Link href="/feed" className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800">
              <HomeIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
            </Link>
            
            <Link
              href="/messages"
              className="relative rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ChatBubbleLeftRightIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
              {unreadMessageCount > 0 && (
                <span className="absolute -top-1 -right-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-xs font-semibold text-white">
                  {unreadMessageCount > 9 ? '9+' : unreadMessageCount}
                </span>
              )}
            </Link>
            
            <NotificationMenu />

            {user && (
              <div className="relative group">
                <button className="flex items-center space-x-2">
                  <Avatar name={user.name} size="md" />
                </button>

                {/* Dropdown */}
                <div className="absolute right-0 mt-2 w-48 origin-top-right scale-0 rounded-lg border border-gray-200 bg-white py-1 shadow-lg transition-transform group-hover:scale-100 dark:border-gray-700 dark:bg-gray-800">
                  <Link
                    href={`/profile/${user.slug}`}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    <div className="flex items-center space-x-2">
                      <UserCircleIcon className="h-5 w-5" />
                      <span>Profile</span>
                    </div>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

