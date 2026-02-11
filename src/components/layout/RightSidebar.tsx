'use client';

import { useMutation, useQuery } from '@apollo/client';
import { useState } from 'react';
import { GET_CURRENT_USER, GET_USERS } from '@/lib/graphql/queries';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { User } from '@/types';
import { FOLLOW_USER, UNFOLLOW_USER } from '@/lib/graphql/mutations';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { UserPlusIcon, UserMinusIcon } from '@heroicons/react/24/outline';

export function RightSidebar() {
  const { user: currentUser, refetchUser: refetchCurrentUser } = useAuth();
  const { data, loading, refetch } = useQuery(GET_USERS, {
    variables: { first: 5, offset: 0 },
  });

  const [followUser] = useMutation(FOLLOW_USER, {
    refetchQueries: [{ query: GET_USERS, variables: { first: 5, offset: 0 } }],
    awaitRefetchQueries: true,
  });
  const [unfollowUser] = useMutation(UNFOLLOW_USER, {
    refetchQueries: [{ query: GET_USERS, variables: { first: 5, offset: 0 } }],
    awaitRefetchQueries: true,
  });

  const users = (data?.User || []).filter((user: User) => user.id !== currentUser?.id);
  const [mutatingUserId, setMutatingUserId] = useState<string | null>(null);

  const handleToggleFollow = async (user: User) => {
    try {
      setMutatingUserId(user.id);
      if (user.followedByCurrentUser) {
        await unfollowUser({ variables: { id: user.id } });
        toast.success(`Unfollowed ${user.name}`);
      } else {
        await followUser({ variables: { id: user.id } });
        toast.success(`Now following ${user.name}`);
      }
      await refetch();
      refetchCurrentUser();
    } catch (error) {
      console.error('Error toggling follow state:', error);
      toast.error('Could not update follow status');
    } finally {
      setMutatingUserId(null);
    }
  };

  return (
    <aside className="hidden w-56 shrink-0 xl:block">
      <div className="sticky top-20 space-y-4">
        {/* Suggested for you - no container, icon-only Follow/Unfollow */}
        <div>
          <h3 className="mb-4 font-semibold text-foreground">Suggested for you</h3>
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="h-10 w-10 rounded-xl bg-muted" />
                  <div className="flex-1">
                    <div className="h-4 w-24 rounded bg-muted" />
                    <div className="mt-1 h-3 w-16 rounded bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {users.slice(0, 5).map((user: User) => (
                <div key={user.id} className="flex items-center justify-between gap-2">
                  <Link href={`/profile/${user.slug}`} className="flex min-w-0 flex-1 items-center gap-3">
                    <Avatar name={user.name} src={user.avatar?.url} size="md" />
                    <div className="min-w-0 flex-1 overflow-hidden">
                      <p className="truncate text-sm font-medium text-foreground">{user.name}</p>
                      <p className="truncate text-xs text-muted-foreground">@{user.slug}</p>
                    </div>
                  </Link>
                  <Button
                    size="icon"
                    variant={user.followedByCurrentUser ? 'secondary' : 'default'}
                    onClick={() => handleToggleFollow(user)}
                    isLoading={mutatingUserId === user.id}
                    aria-label={user.followedByCurrentUser ? 'Unfollow' : 'Follow'}
                  >
                    {user.followedByCurrentUser ? (
                      <UserMinusIcon className="h-4 w-4" />
                    ) : (
                      <UserPlusIcon className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Footer Links - no container */}
        <div>
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <Link href="/about" prefetch={false} className="hover:text-foreground hover:underline">About</Link>
            <span>·</span>
            <Link href="/help" prefetch={false} className="hover:text-foreground hover:underline">Help</Link>
            <span>·</span>
            <Link href="/terms" prefetch={false} className="hover:text-foreground hover:underline">Terms</Link>
            <span>·</span>
            <Link href="/privacy" prefetch={false} className="hover:text-foreground hover:underline">Privacy</Link>
          </div>
          <p className="mt-3 text-xs text-muted-foreground/80">© 2025 EcoLink Social</p>
        </div>
      </div>
    </aside>
  );
}

