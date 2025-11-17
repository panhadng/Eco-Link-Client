'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { useQuery } from '@apollo/client';

import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { GET_USER_FOLLOWERS, GET_USER_FOLLOWING } from '@/lib/graphql/queries';
import { User } from '@/types';

type ConnectionType = 'followers' | 'following';

interface ConnectionsPageProps {
  slug: string;
  type: ConnectionType;
}

const PAGE_SIZE = 20;

const buildFilter = (term: string | null) => {
  if (!term) return undefined;
  return {
    OR: [
      { name_contains: term },
      { slug_contains: term },
      { about_contains: term },
    ],
  };
};

const connectionLabels: Record<ConnectionType, { title: string; placeholder: string }> = {
  followers: {
    title: 'Followers',
    placeholder: 'Search followers…',
  },
  following: {
    title: 'Following',
    placeholder: 'Search following…',
  },
};

export function ConnectionsPage({ slug, type }: ConnectionsPageProps) {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);

    return () => clearTimeout(timeout);
  }, [search]);

  const filter = useMemo(() => buildFilter(debouncedSearch || null), [debouncedSearch]);
  const query = type === 'followers' ? GET_USER_FOLLOWERS : GET_USER_FOLLOWING;

  const { data, loading, error, fetchMore } = useQuery(query, {
    variables: {
      slug,
      first: PAGE_SIZE,
      offset: 0,
      filter,
    },
    fetchPolicy: 'network-only',
  });

  const user: (User & {
    followedBy?: User[];
    following?: User[];
  }) | undefined = data?.User?.[0];

  const connections = type === 'followers' ? user?.followedBy ?? [] : user?.following ?? [];
  const totalCount =
    type === 'followers' ? user?.followedByCount ?? 0 : user?.followingCount ?? 0;

  const hasMore = connections.length < totalCount;

  const handleLoadMore = () => {
    if (!hasMore || loading) return;

    fetchMore({
      variables: {
        offset: connections.length,
      },
      updateQuery: (previousResult, { fetchMoreResult }) => {
        if (!fetchMoreResult) {
          return previousResult;
        }

        const previousUser = previousResult.User?.[0];
        const nextUser = fetchMoreResult.User?.[0];

        if (!previousUser || !nextUser) {
          return previousResult;
        }

        const mergedUser = {
          ...previousUser,
          followedBy:
            type === 'followers'
              ? [...(previousUser.followedBy ?? []), ...(nextUser.followedBy ?? [])]
              : previousUser.followedBy,
          following:
            type === 'following'
              ? [...(previousUser.following ?? []), ...(nextUser.following ?? [])]
              : previousUser.following,
        };

        return {
          ...previousResult,
          User: [mergedUser],
        };
      },
    });
  };

  const { title, placeholder } = connectionLabels[type];
  const displayName = user?.name ?? 'this profile';
  const subtitleText =
    type === 'followers'
      ? `People who follow ${displayName}.`
      : `People ${displayName} follows.`;
  const emptyMessage =
    type === 'followers'
      ? 'No followers to show yet.'
      : 'Not following anyone yet.';

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              {title}
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{subtitleText}</p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Total: {totalCount}
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/profile/${slug}/followers`}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                type === 'followers'
                  ? 'bg-[hsl(38,55%,45%)] text-white shadow-sm dark:bg-[hsl(38,65%,55%)]'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              Followers
            </Link>
            <Link
              href={`/profile/${slug}/following`}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                type === 'following'
                  ? 'bg-[hsl(38,55%,45%)] text-white shadow-sm dark:bg-[hsl(38,65%,55%)]'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              Following
            </Link>
          </div>
        </div>

        <div className="mt-6">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={placeholder}
          />
        </div>
      </Card>

      {loading && connections.length === 0 && (
        <Card className="space-y-3 p-6">
          <div className="h-12 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
          <div className="h-12 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
          <div className="h-12 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
        </Card>
      )}

      {error && (
        <Card className="p-6 text-sm text-red-600 dark:text-red-400">
          Could not load {title.toLowerCase()}. Please try again later.
        </Card>
      )}

      {!loading && connections.length === 0 && !error && (
        <Card className="p-6 text-sm text-gray-500 dark:text-gray-400">{emptyMessage}</Card>
      )}

      <div className="space-y-3">
        {connections.map((connection) => (
          <Card key={connection.id} className="flex items-center justify-between gap-4 p-4">
            <div className="flex items-center gap-3">
              <Avatar
                name={connection.name}
                src={connection.avatar?.url}
                size="md"
              />
              <div className="min-w-0">
                <Link
                  href={`/profile/${connection.slug}`}
                  className="block truncate text-sm font-semibold text-[hsl(38,55%,45%)] hover:underline dark:text-[hsl(38,65%,55%)]"
                >
                  {connection.name}
                </Link>
                <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                  @{connection.slug}
                </p>
                {connection.about && (
                  <p className="mt-1 line-clamp-2 text-xs text-gray-600 dark:text-gray-300">
                    {connection.about}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {connection.followedByCount} follower
                  {connection.followedByCount === 1 ? '' : 's'} • {connection.followingCount}{' '}
                  following
                </p>
              </div>
            </div>
            <Link
              href={`/profile/${connection.slug}`}
              className="text-sm text-[hsl(38,55%,45%)] hover:underline dark:text-[hsl(38,65%,55%)]"
            >
              View profile
            </Link>
          </Card>
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center">
          <Button onClick={handleLoadMore} disabled={loading}>
            {loading ? 'Loading…' : 'Load more'}
          </Button>
        </div>
      )}
    </div>
  );
}

