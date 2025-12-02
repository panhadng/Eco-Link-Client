'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { HomeIcon, UserCircleIcon, MagnifyingGlassIcon, ChatBubbleLeftRightIcon, BellIcon, Bars3Icon, UserGroupIcon, BookmarkIcon } from '@heroicons/react/24/outline';
import { HomeIcon as HomeIconSolid, ChatBubbleLeftRightIcon as ChatBubbleLeftRightIconSolid, UserCircleIcon as UserCircleIconSolid, BellIcon as BellIconSolid, MagnifyingGlassIcon as MagnifyingGlassIconSolid } from '@heroicons/react/24/solid';
import { useAuth } from '@/context/AuthContext';
import { Avatar } from '@/components/ui/Avatar';
import { NotificationMenu } from '@/components/notifications/NotificationMenu';
import { useRooms } from '@/hooks/useMessages';
import { useNotificationCount } from '@/hooks/useNotifications';
import { Room } from '@/types';

export function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { rooms } = useRooms();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const term = searchParams?.get('term') ?? '';
  
  const isFeedActive = pathname === '/feed' || pathname === '/';
  const isSearchActive = pathname?.startsWith('/search');
  const isMessagesActive = pathname?.startsWith('/messages');
  const isNotificationsActive = pathname?.startsWith('/notifications');
  const isGroupsActive = pathname?.startsWith('/groups');
  const isSavedActive = pathname?.startsWith('/saved');
  const isProfileActive = user && pathname?.startsWith(`/profile/${user.slug}`);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.value = term;
    }
  }, [term]);

  useEffect(() => {
    if (!isMobileMenuOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isMobileMenuOpen]);

  const unreadMessageCount = useMemo(
    () => rooms.reduce((total: number, room: Room) => total + (room.unreadCount ?? 0), 0),
    [rooms]
  );
  const { unreadCount: unreadNotificationCount } = useNotificationCount();

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
    <>
      {/* Top Navbar - Mobile & Desktop */}
      <nav className="sticky top-0 z-40 border-b border-gray-200 bg-card text-gray-900 shadow-sm backdrop-blur-none opacity-100" style={{ backgroundColor: 'hsl(var(--card))', opacity: 1 }}>
        <div className="mx-auto max-w-7xl px-2 md:px-4">
          <div className="flex h-14 md:h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 py-2">
              <div className="h-8 flex items-center overflow-hidden">
                <Image
                  src="/images/eco-link-logo-nobg.png"
                  alt="Eco-Link Logo"
                  width={100}
                  height={32}
                  className="h-8 w-auto object-contain"
                  style={{ maxHeight: '32px', height: '32px', width: 'auto' }}
                  priority
                  unoptimized
                />
              </div>
            </Link>

            {/* Search Bar - Desktop Only */}
            <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md px-8">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  ref={inputRef}
                  type="text"
                  defaultValue={term}
                  placeholder="Search..."
                  aria-label="Search"
                  className="w-full rounded-full border border-gray-200 bg-background py-2 pl-10 pr-4 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                />
                <button type="submit" className="sr-only">
                  Search
                </button>
              </div>
            </form>

            {/* Mobile Menu Button */}
            <div className="md:hidden relative" ref={mobileMenuRef}>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg transition-colors hover:bg-primary/10"
                aria-label="Menu"
              >
                <Bars3Icon className="h-6 w-6 text-gray-900" />
              </button>

              {/* Mobile Dropdown Menu */}
              {isMobileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-lg border border-gray-200 bg-card shadow-lg z-50" style={{ backgroundColor: 'hsl(var(--card))' }}>
                  <Link
                    href="/groups"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 text-sm transition-colors hover:bg-primary/10 hover:text-primary first:rounded-t-lg ${
                      isGroupsActive ? 'text-[#0c0c6d] font-semibold bg-primary/5' : 'text-gray-700'
                    }`}
                  >
                    <UserGroupIcon className="h-5 w-5" />
                    <span>Groups</span>
                  </Link>
                  <Link
                    href="/saved"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 text-sm transition-colors hover:bg-primary/10 hover:text-primary ${
                      isSavedActive ? 'text-[#0c0c6d] font-semibold bg-primary/5' : 'text-gray-700'
                    }`}
                  >
                    <BookmarkIcon className="h-5 w-5" />
                    <span>Saved</span>
                  </Link>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors last:rounded-b-lg"
                  >
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>

            {/* Nav Icons - Desktop Only */}
            <div className="hidden md:flex items-center space-x-4">
            <Link 
              href="/feed" 
              className="group relative flex items-center justify-center rounded-lg p-2 transition-colors hover:bg-primary/10"
            >
              <HomeIcon 
                className={`h-6 w-6 text-gray-600 transition-opacity ${isFeedActive ? 'opacity-0' : 'group-hover:opacity-0'}`}
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
                className={`h-6 w-6 text-gray-600 transition-opacity ${isMessagesActive ? 'opacity-0' : 'group-hover:opacity-0'}`}
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
                  <Avatar name={user.name} src={user.avatar?.url} size="md" />
                </button>

                {/* Dropdown */}
                <div className="absolute right-0 mt-2 w-48 origin-top-right scale-0 rounded-lg border border-gray-200 bg-card py-1 shadow-lg transition-transform group-hover:scale-100" style={{ backgroundColor: 'hsl(var(--card))', opacity: 1 }}>
                  <Link
                    href={`/profile/${user.slug}`}
                    className="group/profile relative block px-4 py-2 text-sm text-gray-700 hover:bg-primary/10 hover:text-primary transition-colors"
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
                    className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
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

      {/* Mobile Bottom Navbar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-card text-gray-900 shadow-lg" style={{ backgroundColor: 'hsl(var(--card))' }}>
        <div className="flex items-center h-16 px-2">
          <Link 
            href="/feed" 
            className="flex flex-col items-center justify-center transition-colors active:bg-primary/10 py-1 flex-1"
          >
            <div className="relative flex items-center justify-center">
              <HomeIcon 
                className={`h-6 w-6 text-gray-600 transition-opacity ${isFeedActive ? 'opacity-0' : 'opacity-100'}`}
              />
              <HomeIconSolid 
                className={`absolute h-6 w-6 text-[#0c0c6d] transition-opacity ${isFeedActive ? 'opacity-100' : 'opacity-0'}`}
              />
            </div>
            <span className={`text-xs leading-tight mt-0.5 ${isFeedActive ? 'text-[#0c0c6d] font-semibold' : 'text-gray-600'}`}>Home</span>
          </Link>
          
          <Link
            href="/search"
            className="flex flex-col items-center justify-center transition-colors active:bg-primary/10 py-1 flex-1"
          >
            <div className="relative flex items-center justify-center">
              <MagnifyingGlassIcon 
                className={`h-6 w-6 text-gray-600 transition-opacity ${isSearchActive ? 'opacity-0' : 'opacity-100'}`}
              />
              <MagnifyingGlassIconSolid 
                className={`absolute h-6 w-6 text-[#0c0c6d] transition-opacity ${isSearchActive ? 'opacity-100' : 'opacity-0'}`}
              />
            </div>
            <span className={`text-xs leading-tight mt-0.5 ${isSearchActive ? 'text-[#0c0c6d] font-semibold' : 'text-gray-600'}`}>Search</span>
          </Link>
          
          <Link
            href="/messages"
            className="flex flex-col items-center justify-center transition-colors active:bg-primary/10 py-1 flex-1"
          >
            <div className="relative flex items-center justify-center">
              <ChatBubbleLeftRightIcon 
                className={`h-6 w-6 text-gray-600 transition-opacity ${isMessagesActive ? 'opacity-0' : 'opacity-100'}`}
              />
              <ChatBubbleLeftRightIconSolid 
                className={`absolute h-6 w-6 text-[#0c0c6d] transition-opacity ${isMessagesActive ? 'opacity-100' : 'opacity-0'}`}
              />
              {unreadMessageCount > 0 && (
                <span className="absolute -top-0.5 -right-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-xs font-semibold text-white">
                  {unreadMessageCount > 9 ? '9+' : unreadMessageCount}
                </span>
              )}
            </div>
            <span className={`text-xs leading-tight mt-0.5 ${isMessagesActive ? 'text-[#0c0c6d] font-semibold' : 'text-gray-600'}`}>Messages</span>
          </Link>
          
          <Link
            href="/notifications"
            className="flex flex-col items-center justify-center transition-colors active:bg-primary/10 py-1 relative flex-1"
          >
            <div className="relative flex items-center justify-center">
              <BellIcon 
                className={`h-6 w-6 text-gray-600 transition-opacity ${isNotificationsActive ? 'opacity-0' : 'opacity-100'}`}
              />
              <BellIconSolid 
                className={`absolute h-6 w-6 text-[#0c0c6d] transition-opacity ${isNotificationsActive ? 'opacity-100' : 'opacity-0'}`}
              />
              {unreadNotificationCount > 0 && (
                <span className="absolute -top-0.5 -right-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-xs font-semibold text-white">
                  {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                </span>
              )}
            </div>
            <span className={`text-xs leading-tight mt-0.5 ${isNotificationsActive ? 'text-[#0c0c6d] font-semibold' : 'text-gray-600'}`}>Notifications</span>
          </Link>
          
          <Link
            href={`/profile/${user?.slug || ''}`}
            className="flex flex-col items-center justify-center transition-colors active:bg-primary/10 py-1 flex-1"
          >
            <div className="relative flex items-center justify-center">
              <UserCircleIcon 
                className={`h-6 w-6 text-gray-600 transition-opacity ${isProfileActive ? 'opacity-0' : 'opacity-100'}`}
              />
              <UserCircleIconSolid 
                className={`absolute h-6 w-6 text-[#0c0c6d] transition-opacity ${isProfileActive ? 'opacity-100' : 'opacity-0'}`}
              />
            </div>
            <span className={`text-xs leading-tight mt-0.5 ${isProfileActive ? 'text-[#0c0c6d] font-semibold' : 'text-gray-600'}`}>Profile</span>
          </Link>
        </div>
      </nav>
    </>
  );
}

