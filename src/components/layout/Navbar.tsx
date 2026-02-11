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
      {/* Top Navbar - Remix-style glass header */}
      <nav className="sticky top-0 z-40 w-full border-b border-border/40 glass-ultra pt-[env(safe-area-inset-top)] text-foreground">
        <div className="mx-auto flex h-14 md:h-16 max-w-7xl items-center justify-between px-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 md:h-9 md:w-9 items-center justify-center rounded-xl bg-primary shadow-sm">
              <span className="text-sm md:text-lg font-bold text-primary-foreground">E</span>
            </div>
            <span className="text-lg md:text-xl font-bold text-foreground hidden sm:inline">
              eco<span className="text-primary">link</span>
            </span>
          </Link>

          {/* Search Bar - Desktop Only */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                ref={inputRef}
                type="text"
                defaultValue={term}
                placeholder="Search…"
                aria-label="Search"
                className="w-full rounded-xl bg-white py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button type="submit" className="sr-only">Search</button>
            </div>
          </form>

          <div className="md:hidden flex-1" />

          {/* Mobile Menu Button */}
          <div className="md:hidden relative" ref={mobileMenuRef}>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-panel transition-colors"
              aria-label="Menu"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
            {isMobileMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl border border-border bg-card shadow-lg z-50 py-1">
                <Link
                  href="/groups"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors first:rounded-t-xl ${
                    isGroupsActive ? 'bg-accent text-primary font-semibold' : 'text-muted-foreground hover:bg-panel hover:text-foreground'
                  }`}
                >
                  <UserGroupIcon className="h-5 w-5" />
                  <span>Groups</span>
                </Link>
                <Link
                  href="/saved"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                    isSavedActive ? 'bg-accent text-primary font-semibold' : 'text-muted-foreground hover:bg-panel hover:text-foreground'
                  }`}
                >
                  <BookmarkIcon className="h-5 w-5" />
                  <span>Saved</span>
                </Link>
                <button
                  onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }}
                  className="flex w-full items-center gap-3 px-4 py-3 text-sm text-destructive hover:bg-destructive/10 transition-colors last:rounded-b-xl"
                >
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Nav Icons - Desktop Only */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              href="/feed"
              className={`relative inline-flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-xl transition-colors ${
                isFeedActive ? 'bg-accent text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-panel'
              }`}
            >
              <HomeIcon className={`h-5 w-5 ${isFeedActive ? 'opacity-0' : ''}`} />
              <HomeIconSolid className={`absolute h-5 w-5 ${isFeedActive ? '' : 'opacity-0'}`} />
            </Link>
            <Link
              href="/messages"
              className={`relative inline-flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-xl transition-colors ${
                isMessagesActive ? 'bg-accent text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-panel'
              }`}
            >
              <ChatBubbleLeftRightIcon className={`h-5 w-5 ${isMessagesActive ? 'opacity-0' : ''}`} />
              <ChatBubbleLeftRightIconSolid className={`absolute h-5 w-5 ${isMessagesActive ? '' : 'opacity-0'}`} />
              {unreadMessageCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                  {unreadMessageCount > 99 ? '99+' : unreadMessageCount}
                </span>
              )}
            </Link>
            <NotificationMenu />
            {user && (
              <div className="relative group">
                <button className="flex items-center rounded-xl p-1 transition-colors hover:bg-panel">
                  <Avatar name={user.name} src={user.avatar?.url} size="md" />
                </button>
                <div className="absolute right-0 mt-2 w-48 origin-top-right scale-0 rounded-xl border border-border bg-card py-1 shadow-lg transition-transform group-hover:scale-100">
                  <Link
                    href={`/profile/${user.slug}`}
                    className={`block px-4 py-2 text-sm transition-colors hover:bg-panel ${
                      isProfileActive ? 'text-primary font-semibold' : 'text-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <UserCircleIcon className="h-5 w-5" />
                      <span>Profile</span>
                    </div>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full px-4 py-2 text-left text-sm text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Nav - Remix style */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border/40 glass-ultra pb-[env(safe-area-inset-bottom)] text-foreground">
        <div className="flex h-16 items-center px-2">
          <Link href="/feed" className="flex flex-1 flex-col items-center justify-center py-1 transition-colors active:bg-panel rounded-xl">
            <div className="relative flex items-center justify-center">
              <HomeIcon className={`h-6 w-6 text-muted-foreground transition-opacity ${isFeedActive ? 'opacity-0' : 'opacity-100'}`} />
              <HomeIconSolid className={`absolute h-6 w-6 text-primary transition-opacity ${isFeedActive ? 'opacity-100' : 'opacity-0'}`} />
            </div>
            <span className={`mt-0.5 text-xs leading-tight ${isFeedActive ? 'font-semibold text-primary' : 'text-muted-foreground'}`}>Home</span>
          </Link>
          <Link href="/search" className="flex flex-1 flex-col items-center justify-center py-1 transition-colors active:bg-panel rounded-xl">
            <div className="relative flex items-center justify-center">
              <MagnifyingGlassIcon className={`h-6 w-6 text-muted-foreground transition-opacity ${isSearchActive ? 'opacity-0' : 'opacity-100'}`} />
              <MagnifyingGlassIconSolid className={`absolute h-6 w-6 text-primary transition-opacity ${isSearchActive ? 'opacity-100' : 'opacity-0'}`} />
            </div>
            <span className={`mt-0.5 text-xs leading-tight ${isSearchActive ? 'font-semibold text-primary' : 'text-muted-foreground'}`}>Search</span>
          </Link>
          <Link href="/messages" className="flex flex-1 flex-col items-center justify-center py-1 transition-colors active:bg-panel rounded-xl relative">
            <div className="relative flex items-center justify-center">
              <ChatBubbleLeftRightIcon className={`h-6 w-6 text-muted-foreground transition-opacity ${isMessagesActive ? 'opacity-0' : 'opacity-100'}`} />
              <ChatBubbleLeftRightIconSolid className={`absolute h-6 w-6 text-primary transition-opacity ${isMessagesActive ? 'opacity-100' : 'opacity-0'}`} />
              {unreadMessageCount > 0 && (
                <span className="absolute -top-0.5 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                  {unreadMessageCount > 99 ? '99+' : unreadMessageCount}
                </span>
              )}
            </div>
            <span className={`mt-0.5 text-xs leading-tight ${isMessagesActive ? 'font-semibold text-primary' : 'text-muted-foreground'}`}>Messages</span>
          </Link>
          <div className="flex flex-1 flex-col items-center justify-center py-1">
            <NotificationMenu />
          </div>
          <Link href={user?.slug ? `/profile/${user.slug}` : '/'} className="flex flex-1 flex-col items-center justify-center py-1 transition-colors active:bg-panel rounded-xl">
            <div className="relative flex items-center justify-center">
              <UserCircleIcon className={`h-6 w-6 text-muted-foreground transition-opacity ${isProfileActive ? 'opacity-0' : 'opacity-100'}`} />
              <UserCircleIconSolid className={`absolute h-6 w-6 text-primary transition-opacity ${isProfileActive ? 'opacity-100' : 'opacity-0'}`} />
            </div>
            <span className={`mt-0.5 text-xs leading-tight ${isProfileActive ? 'font-semibold text-primary' : 'text-muted-foreground'}`}>Profile</span>
          </Link>
        </div>
      </nav>
    </>
  );
}

