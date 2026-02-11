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

const mainItems = [
  { name: 'Home', href: '/feed', icon: HomeIcon, iconSolid: HomeIconSolid },
  { name: 'Saved', href: '/saved', icon: BookmarkIcon, iconSolid: BookmarkIconSolid },
];

const communityItems = [
  { name: 'Messages', href: '/messages', icon: ChatBubbleLeftRightIcon, iconSolid: ChatBubbleLeftRightIconSolid },
  { name: 'Groups', href: '/groups', icon: UserGroupIcon, iconSolid: UserGroupIconSolid },
];

const accountItems = [
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon, iconSolid: Cog6ToothIconSolid },
];

function NavLink({
  item,
  isActive,
  prefetch,
}: {
  item: (typeof mainItems)[0];
  isActive: boolean;
  prefetch?: boolean;
}) {
  const Icon = item.icon;
  const IconSolid = item.iconSolid;
  return (
    <Link
      href={item.href}
      prefetch={prefetch}
      className={`group relative flex w-full items-center gap-4 px-4 py-3 rounded-xl text-base transition-all ${
        isActive
          ? 'bg-accent text-foreground font-semibold border border-primary/20 shadow-sm before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-7 before:w-[5px] before:bg-primary before:rounded-full before:content-[""]'
          : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
      }`}
    >
      <div className="relative flex h-5 w-5 shrink-0 items-center justify-center">
        <Icon className={`h-5 w-5 stroke-[1.5] ${isActive ? 'opacity-0' : 'opacity-100 group-hover:opacity-0'}`} />
        <IconSolid className={`absolute h-5 w-5 text-primary ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
      </div>
      <span>{item.name}</span>
    </Link>
  );
}

export function Sidebar() {
  const { user } = useAuth();
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 lg:block">
      <div className="sticky top-20 h-fit w-64">
        <div className="px-6 py-8 rounded-3xl border border-border/80 bg-card/80 backdrop-blur-xl shadow-glass">
          {/* Profile Section */}
          {user && (
            <>
              <Link href={`/profile/${user.slug}`} className="block text-center mb-6 group">
                <div className="relative inline-block">
                  <Avatar name={user.name} src={user.avatar?.url} size="xl" className="mx-auto h-20 w-20 ring-2 ring-border/20 shadow-sm transition-transform group-hover:scale-105" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-foreground group-hover:text-primary transition-colors">{user.name}</h3>
                <p className="text-sm text-muted-foreground">@{user.slug}</p>
              </Link>
              <div className="my-6 h-px bg-border/50" />
              <div className="flex justify-around text-center mb-6">
                <Link href={`/profile/${user.slug}/followers`} className="transition hover:text-primary">
                  <p className="text-lg font-semibold text-foreground">{user.followedByCount}</p>
                  <p className="text-xs text-muted-foreground">Followers</p>
                </Link>
                <Link href={`/profile/${user.slug}/following`} className="transition hover:text-primary">
                  <p className="text-lg font-semibold text-foreground">{user.followingCount ?? 0}</p>
                  <p className="text-xs text-muted-foreground">Following</p>
                </Link>
              </div>
              <div className="my-6 h-px bg-border/50" />
            </>
          )}

          {/* Main */}
          <div className="mb-6">
            <p className="mb-3 px-2 text-xs font-medium text-muted-foreground tracking-wider">MAIN</p>
            <nav className="space-y-1">
              {mainItems.map((item) => (
                <NavLink key={item.name} item={item} isActive={pathname === item.href} prefetch={item.href !== '/saved'} />
              ))}
            </nav>
          </div>
          <div className="mb-6">
            <p className="mb-3 px-2 text-xs font-medium text-muted-foreground tracking-wider">COMMUNITY</p>
            <nav className="space-y-1">
              {communityItems.map((item) => (
                <NavLink
                  key={item.name}
                  item={item}
                  isActive={pathname === item.href || pathname?.startsWith(item.href + '/')}
                  prefetch={true}
                />
              ))}
            </nav>
          </div>
          <div className="my-6 h-px bg-border/50" />
          <div>
            <p className="mb-3 px-2 text-xs font-medium text-muted-foreground tracking-wider">ACCOUNT</p>
            <nav className="space-y-1">
              {accountItems.map((item) => (
                <NavLink
                  key={item.name}
                  item={item}
                  isActive={pathname === item.href || pathname?.startsWith(item.href + '/')}
                  prefetch={false}
                />
              ))}
            </nav>
          </div>
        </div>
      </div>
    </aside>
  );
}

