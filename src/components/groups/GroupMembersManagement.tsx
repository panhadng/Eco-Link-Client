'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation } from '@apollo/client';
import toast from 'react-hot-toast';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
  GET_GROUP_MEMBERS,
  GET_GROUP_BY_SLUG,
} from '@/lib/graphql/queries';
import {
  CHANGE_GROUP_MEMBER_ROLE,
  REMOVE_USER_FROM_GROUP,
} from '@/lib/graphql/mutations';
import { GroupMemberRole, User } from '@/types';
import { formatDate } from '@/lib/utils';

interface GroupMembersManagementProps {
  groupId: string;
  groupSlug: string;
}

const ROLE_LABELS: Record<GroupMemberRole, string> = {
  owner: 'Owner',
  admin: 'Admin',
  usual: 'Member',
  pending: 'Pending',
};

const ROLE_OPTIONS: GroupMemberRole[] = ['pending', 'usual', 'admin', 'owner'];

export function GroupMembersManagement({ groupId, groupSlug }: GroupMembersManagementProps) {
  const [selectedMember, setSelectedMember] = useState<User | null>(null);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);

  const { data, loading, refetch } = useQuery(GET_GROUP_MEMBERS, {
    variables: { id: groupId, first: 100, offset: 0 },
    fetchPolicy: 'cache-and-network',
  });

  const [changeRole, { loading: changingRole }] = useMutation(CHANGE_GROUP_MEMBER_ROLE, {
    refetchQueries: [{ query: GET_GROUP_MEMBERS, variables: { id: groupId, first: 100, offset: 0 } }],
  });

  const [removeUser, { loading: removing }] = useMutation(REMOVE_USER_FROM_GROUP, {
    refetchQueries: [
      { query: GET_GROUP_MEMBERS, variables: { id: groupId, first: 100, offset: 0 } },
      { query: GET_GROUP_BY_SLUG, variables: { slug: groupSlug } },
    ],
  });

  const members: User[] = data?.GroupMembers ?? [];

  const handleRoleChange = async (memberId: string, newRole: GroupMemberRole) => {
    try {
      await changeRole({
        variables: {
          groupId,
          userId: memberId,
          roleInGroup: newRole,
        },
      });
      toast.success(`Member role updated to ${ROLE_LABELS[newRole]}`);
      refetch();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to change member role');
    }
  };

  const handleRemove = async () => {
    if (!selectedMember) return;

    try {
      await removeUser({
        variables: {
          groupId,
          userId: selectedMember.id,
        },
      });
      toast.success(`${selectedMember.name} has been removed from the group`);
      setIsRemoveModalOpen(false);
      setSelectedMember(null);
      refetch();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to remove member');
    }
  };

  const openRemoveModal = (member: User) => {
    setSelectedMember(member);
    setIsRemoveModalOpen(true);
  };

  // Group members by role
  const membersByRole = members.reduce(
    (acc, member) => {
      const role = member.myRoleInGroup || 'usual';
      if (!acc[role]) acc[role] = [];
      acc[role].push(member);
      return acc;
    },
    {} as Record<GroupMemberRole, User[]>,
  );

  const roleOrder: GroupMemberRole[] = ['owner', 'admin', 'usual', 'pending'];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Group Members</h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage member roles and permissions. Total: {members.length} member{members.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {members.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-500">No members found.</p>
        </Card>
      ) : (
        <div className="space-y-8">
          {roleOrder.map((role) => {
            const roleMembers = membersByRole[role] || [];
            if (roleMembers.length === 0) return null;

            return (
              <div key={role}>
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
                  {ROLE_LABELS[role]} ({roleMembers.length})
                </h3>
                <div className="space-y-2">
                  {roleMembers.map((member) => (
                    <Card key={member.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <Link
                          href={`/profile/${member.slug}`}
                          className="flex flex-1 items-center gap-4 hover:opacity-80"
                        >
                          <Avatar name={member.name} src={member.avatar?.url} size="md" />
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-gray-900">{member.name}</p>
                            <p className="text-sm text-gray-500">@{member.slug}</p>
                          </div>
                        </Link>

                        <div className="flex items-center gap-3">
                          <select
                            value={member.myRoleInGroup || 'usual'}
                            onChange={(e) => handleRoleChange(member.id, e.target.value as GroupMemberRole)}
                            disabled={changingRole || member.myRoleInGroup === 'owner'}
                            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                          >
                            {ROLE_OPTIONS.map((option) => (
                              <option key={option} value={option} disabled={option === 'owner'}>
                                {ROLE_LABELS[option]}
                              </option>
                            ))}
                          </select>

                          {member.myRoleInGroup !== 'owner' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openRemoveModal(member)}
                              disabled={removing}
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Remove Member Confirmation Modal */}
      {isRemoveModalOpen && selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900">Remove Member</h3>
            <p className="mt-2 text-sm text-gray-600">
              Are you sure you want to remove <strong>{selectedMember.name}</strong> from this group? This action
              cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsRemoveModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleRemove} disabled={removing} isLoading={removing}>
                Remove
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

