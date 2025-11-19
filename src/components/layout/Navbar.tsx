'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useMemo, useRef } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { HomeIcon, UserCircleIcon, MagnifyingGlassIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { HomeIcon as HomeIconSolid, ChatBubbleLeftRightIcon as ChatBubbleLeftRightIconSolid, UserCircleIcon as UserCircleIconSolid } from '@heroicons/react/24/solid';
import { useAuth } from '@/context/AuthContext';
import { Avatar } from '@/components/ui/Avatar';
import { NotificationMenu } from '@/components/notifications/NotificationMenu';
import { useRooms } from '@/hooks/useMessages';
import { Room } from '@/types';

export function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { rooms } = useRooms();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);

  const term = searchParams?.get('term') ?? '';
  
  const isFeedActive = pathname === '/feed' || pathname === '/';
  const isMessagesActive = pathname?.startsWith('/messages');
  const isProfileActive = user && pathname?.startsWith(`/profile/${user.slug}`);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.value = term;
    }
  }, [term]);

  const unreadMessageCount = useMemo(
    () => rooms.reduce((total: number, room: Room) => total + (room.unreadCount ?? 0), 0),
    [rooms]
  );

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = inputRef.current?.value.trim() ?? '';
    if (value.length === 0) {
      router.push('/search');
    } else {
      router.push(`/search?term=${encodeURIComponent(value)}`);
    }
  };

  return (
    <nav className="sticky top-0 z-40 border-b border-gray-200 bg-card text-gray-900 shadow-sm backdrop-blur-none opacity-100 dark:border-gray-800 dark:text-gray-100" style={{ backgroundColor: 'hsl(var(--card))', opacity: 1 }}>
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 py-4">
            <Image
              src="/images/eco-link-logo-nobg.png"
              alt="Eco-Link Logo"
              width={120}
              height={40}
              className="h-10 w-auto"
              priority
              unoptimized
            />
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="hidden flex-1 max-w-md px-8 md:block">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                defaultValue={term}
                placeholder="Search..."
                aria-label="Search"
                className="w-full rounded-full border border-gray-200 bg-background py-2 pl-10 pr-4 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring dark:bg-muted"
              />
              <button type="submit" className="sr-only">
                Search
              </button>
            </div>
          </form>

          {/* Nav Icons */}
          <div className="flex items-center space-x-4">
            <Link 
              href="/feed" 
              className="group relative flex items-center justify-center rounded-lg p-2 transition-colors hover:bg-primary/10"
            >
              <HomeIcon 
                className={`h-6 w-6 text-gray-600 transition-opacity dark:text-gray-300 ${isFeedActive ? 'opacity-0' : 'group-hover:opacity-0'}`}
              />
              <HomeIconSolid 
                className={`absolute h-6 w-6 text-[#0c0c6d] transition-opacity ${isFeedActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
              />
            </Link>
            
            <Link
              href="/messages"
              className="group relative flex items-center justify-center rounded-lg p-2 transition-colors hover:bg-primary/10"
            >
              <ChatBubbleLeftRightIcon 
                className={`h-6 w-6 text-gray-600 transition-opacity dark:text-gray-300 ${isMessagesActive ? 'opacity-0' : 'group-hover:opacity-0'}`}
              />
              <ChatBubbleLeftRightIconSolid 
                className={`absolute h-6 w-6 text-[#0c0c6d] transition-opacity ${isMessagesActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
              />
              {unreadMessageCount > 0 && (
                <span className="absolute -top-1 -right-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-xs font-semibold text-white">
                  {unreadMessageCount > 9 ? '9+' : unreadMessageCount}
                </span>
              )}
            </Link>
            
            <NotificationMenu />

            {user && (
              <div className="relative group">
                <button className="group/avatar flex items-center space-x-2 rounded-lg p-1 transition-colors hover:bg-primary/10">
                  <Avatar name={user.name} size="md" />
                </button>

                {/* Dropdown */}
                <div className="absolute right-0 mt-2 w-48 origin-top-right scale-0 rounded-lg border border-gray-200 bg-card py-1 shadow-lg transition-transform group-hover:scale-100 dark:border-gray-700" style={{ backgroundColor: 'hsl(var(--card))', opacity: 1 }}>
                  <Link
                    href={`/profile/${user.slug}`}
                    className="group/profile relative block px-4 py-2 text-sm text-gray-700 hover:bg-primary/10 hover:text-primary dark:text-gray-300 transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <div className="relative flex items-center justify-center">
                        <UserCircleIcon className={`h-5 w-5 transition-opacity ${isProfileActive ? 'opacity-0' : 'group-hover/profile:opacity-0'}`} />
                        <UserCircleIconSolid className={`absolute h-5 w-5 text-[#0c0c6d] transition-opacity ${isProfileActive ? 'opacity-100' : 'opacity-0 group-hover/profile:opacity-100'}`} />
                      </div>
                      <span>Profile</span>
                    </div>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
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

