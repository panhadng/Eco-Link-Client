'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  UserGroupIcon,
  BookmarkIcon,
  Cog6ToothIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  UserGroupIcon as UserGroupIconSolid,
  BookmarkIcon as BookmarkIconSolid,
  Cog6ToothIcon as Cog6ToothIconSolid,
  ChatBubbleLeftRightIcon as ChatBubbleLeftRightIconSolid,
} from '@heroicons/react/24/solid';
import { useAuth } from '@/context/AuthContext';
import { Avatar } from '@/components/ui/Avatar';

export function Sidebar() {
  const { user } = useAuth();
  const pathname = usePathname();

  const menuItems = [
    { name: 'Home', href: '/feed', icon: HomeIcon, iconSolid: HomeIconSolid },
    { name: 'Messages', href: '/messages', icon: ChatBubbleLeftRightIcon, iconSolid: ChatBubbleLeftRightIconSolid },
    { name: 'Groups', href: '/groups', icon: UserGroupIcon, iconSolid: UserGroupIconSolid },
    { name: 'Saved', href: '/saved', icon: BookmarkIcon, iconSolid: BookmarkIconSolid },
    { name: 'Settings', href: '/settings', icon: Cog6ToothIcon, iconSolid: Cog6ToothIconSolid },
  ];

  return (
    <aside className="hidden w-64 shrink-0 text-gray-900 lg:block">
      <div className="sticky top-[4rem] space-y-4">
        {/* User Profile Card */}
        {user && (
          <div className="rounded-lg border border-gray-200 bg-card p-4">
            <Link href={`/profile/${user.slug}`} className="flex items-center space-x-3">
              <Avatar name={user.name} src={user.avatar?.url} size="lg" />
              <div className="flex-1 overflow-hidden">
                <p className="truncate font-semibold text-gray-900">{user.name}</p>
                <p className="truncate text-sm text-gray-500">@{user.slug}</p>
              </div>
            </Link>
            <div className="mt-4 flex justify-around border-t border-gray-200 pt-3 text-center">
              <Link
                href={`/profile/${user.slug}/followers`}
                className="block transition hover:text-primary"
              >
                <p className="text-lg font-semibold text-gray-900">{user.followedByCount}</p>
                <p className="text-xs text-gray-500">Followers</p>
              </Link>
              <Link
                href={`/profile/${user.slug}/following`}
                className="block transition hover:text-primary"
              >
                <p className="text-lg font-semibold text-gray-900">
                  {user.followingCount ?? 0}
                </p>
                <p className="text-xs text-gray-500">Following</p>
              </Link>
            </div>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="rounded-lg border border-gray-200 bg-card">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/feed' && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                prefetch={item.href === '/saved' || item.href === '/settings' ? false : undefined}
                className="group relative flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-primary/10 hover:text-primary first:rounded-t-lg last:rounded-b-lg transition-colors"
              >
                <item.icon className={`h-6 w-6 transition-opacity ${isActive ? 'opacity-0' : 'group-hover:opacity-0'}`} />
                <item.iconSolid className={`absolute left-4 h-6 w-6 text-[#0c0c6d] transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}

