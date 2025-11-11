'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@apollo/client';

import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { PostCard } from '@/components/post/PostCard';
import { SEARCH_USERS, SEARCH_POSTS, GET_GROUPS } from '@/lib/graphql/queries';
import { Group, Post, User } from '@/types';

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState('');

  const term = useMemo(() => (searchParams?.get('term') ?? '').trim(), [searchParams]);
  const hasSearchTerm = term.length > 0;

  useEffect(() => {
    setSearchValue(term);
  }, [term]);

  const {
    data: userData,
    loading: usersLoading,
    error: usersError,
  } = useQuery(SEARCH_USERS, {
    variables: { term, first: 10, offset: 0 },
    skip: !hasSearchTerm,
  });

  const {
    data: groupData,
    loading: groupsLoading,
    error: groupsError,
  } = useQuery(GET_GROUPS, {
    variables: { first: 100, offset: 0 },
    skip: !hasSearchTerm,
  });

  const {
    data: postData,
    loading: postsLoading,
    error: postsError,
    refetch: refetchPosts,
  } = useQuery(SEARCH_POSTS, {
    variables: { term, first: 10, offset: 0 },
    skip: !hasSearchTerm,
  });

  const userResults: User[] = userData?.User ?? [];
  const allGroups: Group[] = groupData?.Group ?? [];
  const groupResults: Group[] = useMemo(() => {
    if (!hasSearchTerm) return [];
    const needle = term.toLowerCase();
    return allGroups.filter((group) => {
      const haystacks = [group.name, group.slug, group.about, group.description, group.descriptionExcerpt, group.locationName];
      return haystacks.some((value) => value?.toLowerCase().includes(needle));
    });
  }, [allGroups, hasSearchTerm, term]);
  const postResults: Post[] = postData?.Post ?? [];

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = searchValue.trim();
    if (trimmed.length === 0) {
      router.push('/search');
    } else {
      router.push(`/search?term=${encodeURIComponent(trimmed)}`);
    }
  };

  const isLoading = hasSearchTerm && (usersLoading || groupsLoading || postsLoading);
  const hasError = usersError || groupsError || postsError;
  const showNoResults =
    hasSearchTerm &&
    !isLoading &&
    !hasError &&
    userResults.length === 0 &&
    groupResults.length === 0 &&
    postResults.length === 0;

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Search</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Find people, groups, and posts across the community.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Input
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder="Search users, groups, posts..."
            className="sm:flex-1"
          />
          <Button type="submit" className="sm:px-6">
            Search
          </Button>
        </form>

        {!hasSearchTerm && (
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            Try searching for a person, a group, or a topic to get started.
          </p>
        )}
      </Card>

      {isLoading && (
        <Card className="p-6 text-sm text-gray-500 dark:text-gray-400">Searching…</Card>
      )}

      {hasError && (
        <Card className="p-6 text-sm text-red-600 dark:text-red-400">
          Something went wrong while searching. Please try again.
        </Card>
      )}

      {showNoResults && (
        <Card className="p-6 text-sm text-gray-500 dark:text-gray-400">
          No matches found for “{term}”.
        </Card>
      )}

      {userResults.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">People</h2>
          {userResults.map((user) => (
            <Card key={user.id} className="flex items-center justify-between gap-4 p-4">
              <div className="flex items-center gap-3">
                <Avatar name={user.name} src={user.avatar?.url} size="md" />
                <div className="min-w-0">
                  <Link
                    href={`/profile/${user.slug}`}
                    className="block truncate text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400"
                  >
                    {user.name}
                  </Link>
                  <p className="truncate text-xs text-gray-500 dark:text-gray-400">@{user.slug}</p>
                  {user.about && (
                    <p className="mt-1 line-clamp-2 text-xs text-gray-600 dark:text-gray-300">{user.about}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {user.followedByCount} follower{user.followedByCount === 1 ? '' : 's'} •{' '}
                    {user.followingCount} following
                  </p>
                </div>
              </div>
              <Link
                href={`/profile/${user.slug}`}
                className="text-sm text-blue-600 hover:underline dark:text-blue-400"
              >
                View profile
              </Link>
            </Card>
          ))}
        </section>
      )}

      {groupResults.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Groups</h2>
          {groupResults.map((group) => (
            <Card key={group.id} className="p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <Link
                    href={`/groups/${group.slug}`}
                    className="text-lg font-semibold text-blue-600 hover:underline dark:text-blue-400"
                  >
                    {group.name}
                  </Link>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {group.membersCount} member{group.membersCount === 1 ? '' : 's'} · {group.groupType}
                  </p>
                  {group.descriptionExcerpt && (
                    <p className="mt-2 line-clamp-2 text-sm text-gray-600 dark:text-gray-300">
                      {group.descriptionExcerpt}
                    </p>
                  )}
                </div>
                <Link
                  href={`/groups/${group.slug}`}
                  className="text-sm text-blue-600 hover:underline dark:text-blue-400"
                >
                  View group
                </Link>
              </div>
            </Card>
          ))}
        </section>
      )}

      {postResults.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Posts</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Showing {postResults.length} result{postResults.length === 1 ? '' : 's'}
            </p>
          </div>
          <div className="space-y-4">
            {postResults.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onPostUpdated={() => void refetchPosts()}
                onPostDeleted={() => void refetchPosts()}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
