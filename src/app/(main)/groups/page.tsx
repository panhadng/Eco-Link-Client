'use client';

import Link from 'next/link';
import { useQuery } from '@apollo/client';

import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { GET_GROUPS } from '@/lib/graphql/queries';
import { Group } from '@/types';

export default function GroupsPage() {
  const { data, loading, error, refetch } = useQuery(GET_GROUPS, {
    variables: {
      first: 20,
      offset: 0,
    },
    fetchPolicy: 'cache-and-network',
  });

  const groups: Group[] = data?.Group ?? [];

  const handleRefresh = () => {
    void refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Groups</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Discover communities, join discussions, and collaborate with other members.
          </p>
        </div>
        <Button variant="outline" onClick={handleRefresh} disabled={loading}>
          Refresh
        </Button>
      </div>

      {error && (
        <Card className="border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
          <p>We couldn&apos;t load groups right now. Please try again.</p>
        </Card>
      )}

      {loading && groups.length === 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, index) => (
            <Card key={index} className="animate-pulse space-y-4 p-6 w-10">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700 " />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-700" />
                  <div className="h-3 w-24 rounded bg-gray-200 dark:bg-gray-700" />
                </div>
              </div>
              <div className="h-3 w-full rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-3 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
            </Card>
          ))}
        </div>
      ) : groups.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400">No groups found yet.</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {groups.map((group) => (
            <Card key={group.id} className="flex flex-col gap-4 p-6 w-full">
              <div className="flex items-center gap-3">
                <Avatar name={group.name} src={group.avatar?.url} size="lg" />
                <div className="min-w-0">
                  <Link
                    href={`/groups/${group.slug}`}
                    className="truncate text-lg font-semibold text-[hsl(38,55%,45%)] hover:underline dark:text-[hsl(38,65%,55%)]"
                  >
                    {group.name}
                  </Link>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {group.membersCount} member{group.membersCount === 1 ? '' : 's'}
                  </p>
                </div>
              </div>

              {group.about && (
                <p className="text-sm text-gray-600 line-clamp-3 dark:text-gray-300">{group.about}</p>
              )}

              <div className="flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400">
                <span className="rounded-full bg-gray-100 px-2 py-1 dark:bg-gray-800">
                  {group.groupType}
                </span>
                <span className="rounded-full bg-gray-100 px-2 py-1 dark:bg-gray-800">
                  {group.actionRadius}
                </span>
                {group.locationName && (
                  <span className="rounded-full bg-gray-100 px-2 py-1 dark:bg-gray-800">
                    {group.locationName}
                  </span>
                )}
              </div>

              <div className="mt-auto flex justify-end">
                <Link href={`/groups/${group.slug}`}>
                  <Button variant="outline" size="sm">
                    View Group
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
