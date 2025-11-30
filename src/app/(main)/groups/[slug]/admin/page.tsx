'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@apollo/client';
import { ArrowLeftIcon, UserGroupIcon, UserPlusIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { GET_GROUP_BY_SLUG } from '@/lib/graphql/queries';
import { Group, GroupMemberRole } from '@/types';
import { GroupMembersManagement } from '@/components/groups/GroupMembersManagement';
import { GroupInvitationsManagement } from '@/components/groups/GroupInvitationsManagement';
import { GroupSettingsManagement } from '@/components/groups/GroupSettingsManagement';

interface PageParams {
  slug: string;
}

type AdminTab = 'members' | 'invitations' | 'settings';

const MANAGER_ROLES: GroupMemberRole[] = ['owner', 'admin'];

export default function GroupAdminPage({ params }: { params: Promise<PageParams> }) {
  const { slug } = use(params);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AdminTab>('members');

  const {
    data: groupData,
    loading: groupLoading,
    error: groupError,
    refetch: refetchGroup,
  } = useQuery(GET_GROUP_BY_SLUG, {
    variables: { slug },
    fetchPolicy: 'cache-and-network',
  });

  const group: Group | undefined = groupData?.Group?.[0];

  // Check if user has admin/owner permissions
  const canManage = group?.myRole && MANAGER_ROLES.includes(group.myRole);

  if (groupLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (groupError || !group) {
    return (
      <Card className="p-12 text-center">
        <p className="text-red-600 dark:text-red-400">We couldn&apos;t load this group.</p>
        <Link href={`/groups/${slug}`} className="mt-4 inline-block text-primary hover:underline">
          Back to group
        </Link>
      </Card>
    );
  }

  if (!canManage) {
    return (
      <Card className="p-12 text-center">
        <p className="text-red-600 dark:text-red-400">You don&apos;t have permission to access this page.</p>
        <Link href={`/groups/${slug}`} className="mt-4 inline-block text-primary hover:underline">
          Back to group
        </Link>
      </Card>
    );
  }

  const tabs = [
    { id: 'members' as AdminTab, label: 'Members', icon: UserGroupIcon },
    { id: 'invitations' as AdminTab, label: 'Invitations', icon: UserPlusIcon },
    { id: 'settings' as AdminTab, label: 'Settings', icon: Cog6ToothIcon },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/groups/${slug}`}>
            <Button variant="outline" size="icon">
              <ArrowLeftIcon className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Group Admin</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{group.name}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Card className="p-0">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 border-b-2 py-4 px-1 text-sm font-medium transition-colors
                    ${
                      activeTab === tab.id
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    }
                  `}
                >
                  <Icon className="h-5 w-5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'members' && (
            <GroupMembersManagement groupId={group.id} groupSlug={group.slug} />
          )}
          {activeTab === 'invitations' && (
            <GroupInvitationsManagement groupId={group.id} groupSlug={group.slug} />
          )}
          {activeTab === 'settings' && (
            <GroupSettingsManagement group={group} onUpdated={refetchGroup} />
          )}
        </div>
      </Card>
    </div>
  );
}

