'use client';

import { use, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useMutation, useQuery } from '@apollo/client';
import toast from 'react-hot-toast';
import {
  ClockIcon,
  PencilSquareIcon,
  UserMinusIcon,
  UserPlusIcon,
} from '@heroicons/react/24/outline';

import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { PostCard } from '@/components/post/PostCard';
import { EditGroupModal } from '@/components/groups/EditGroupModal';
import { useAuth } from '@/context/AuthContext';
import {
  GET_GROUP_BY_SLUG,
  GET_GROUP_MEMBERS,
  GET_GROUP_POSTS,
} from '@/lib/graphql/queries';
import { JOIN_GROUP, LEAVE_GROUP } from '@/lib/graphql/mutations';
import { formatDate } from '@/lib/utils';
import { Group, GroupMemberRole, Post, User } from '@/types';

interface PageParams {
  slug: string;
}

const MANAGER_ROLES: GroupMemberRole[] = ['owner', 'admin'];

const htmlTagRegex = /<\/?[a-z][\s\S]*>/i;

const escapeHtml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const applyInlineFormatting = (value: string) => {
  let result = escapeHtml(value);
  result = result.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  result = result.replace(/__(.+?)__/g, '<strong>$1</strong>');
  result = result.replace(/\*(?!\*)(.+?)\*/g, '<em>$1</em>');
  result = result.replace(/_(?!_)(.+?)_/g, '<em>$1</em>');
  result = result.replace(/`([^`]+)`/g, '<code>$1</code>');
  result = result.replace(/~~(.+?)~~/g, '<del>$1</del>');
  result = result.replace(
    /\[(.+?)]\((https?:\/\/[^\s)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
  );
  return result;
};

const markdownToHtml = (markdown: string): string => {
  const lines = markdown.split(/\r?\n/);
  const htmlParts: string[] = [];
  let listOpen = false;
  let blockquoteOpen = false;

  const closeList = () => {
    if (listOpen) {
      htmlParts.push('</ul>');
      listOpen = false;
    }
  };

  const closeBlockquote = () => {
    if (blockquoteOpen) {
      htmlParts.push('</blockquote>');
      blockquoteOpen = false;
    }
  };

  lines.forEach((rawLine) => {
    const line = rawLine.trim();

    if (!line) {
      closeList();
      closeBlockquote();
      return;
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      closeList();
      closeBlockquote();
      const level = headingMatch[1].length;
      htmlParts.push(`<h${level}>${applyInlineFormatting(headingMatch[2].trim())}</h${level}>`);
      return;
    }

    if (line.startsWith('>')) {
      closeList();
      if (!blockquoteOpen) {
        htmlParts.push('<blockquote>');
        blockquoteOpen = true;
      }
      htmlParts.push(`<p>${applyInlineFormatting(line.replace(/^>\s?/, ''))}</p>`);
      return;
    }

    if (/^[-*+]\s+/.test(line)) {
      closeBlockquote();
      if (!listOpen) {
        htmlParts.push('<ul>');
        listOpen = true;
      }
      htmlParts.push(`<li>${applyInlineFormatting(line.replace(/^[-*+]\s+/, ''))}</li>`);
      return;
    }

    closeList();
    closeBlockquote();
    htmlParts.push(`<p>${applyInlineFormatting(line)}</p>`);
  });

  closeList();
  closeBlockquote();

  return htmlParts.join('');
};

const getRichTextHtml = (content?: string | null): string | null => {
  if (!content) return null;
  const trimmed = content.trim();
  if (!trimmed) return null;
  if (htmlTagRegex.test(trimmed)) {
    return trimmed;
  }
  return markdownToHtml(trimmed);
};

function getMembershipLabel(role?: GroupMemberRole | null) {
  if (!role) return null;
  switch (role) {
    case 'owner':
      return 'You manage this group';
    case 'admin':
      return 'You are an admin';
    case 'usual':
      return 'Member';
    case 'pending':
      return 'Request pending';
    default:
      return null;
  }
}

export default function GroupDetailPage({ params }: { params: Promise<PageParams> }) {
  const { slug } = use(params);
  const { user } = useAuth();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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

  const aboutHtml = useMemo(() => getRichTextHtml(group?.about), [group?.about]);
  const descriptionHtml = useMemo(() => getRichTextHtml(group?.description), [group?.description]);

  const {
    data: membersData,
    loading: membersLoading,
    refetch: refetchMembers,
  } = useQuery(GET_GROUP_MEMBERS, {
    variables: { id: group?.id, first: 12, offset: 0 },
    skip: !group?.id,
    fetchPolicy: 'cache-and-network',
  });

  const {
    data: postsData,
    loading: postsLoading,
    refetch: refetchPosts,
  } = useQuery(GET_GROUP_POSTS, {
    variables: { groupId: group?.id, first: 20, offset: 0 },
    skip: !group?.id,
    fetchPolicy: 'cache-and-network',
  });

  const [joinGroup, { loading: joinLoading }] = useMutation(JOIN_GROUP);
  const [leaveGroup, { loading: leaveLoading }] = useMutation(LEAVE_GROUP);

  const members: User[] = membersData?.GroupMembers ?? [];
  const posts: Post[] = postsData?.Post ?? [];

  const membershipLabel = getMembershipLabel(group?.myRole);
  const isMember = Boolean(group?.myRole && group?.myRole !== 'pending');
  const isPending = group?.myRole === 'pending';
  const canManage = group?.myRole && MANAGER_ROLES.includes(group.myRole);

  const handleJoinOrLeave = async () => {
    if (!group || !user) {
      toast.error('You need to be logged in to manage membership');
      return;
    }

    try {
      if (isMember) {
        await leaveGroup({ variables: { groupId: group.id, userId: user.id } });
        toast.success('You have left the group');
      } else {
        await joinGroup({ variables: { groupId: group.id, userId: user.id } });
        toast.success('Joined the group');
      }
      await Promise.all([refetchGroup(), refetchMembers()]);
    } catch (error) {
      console.error('Failed to update membership', error);
      const message = error instanceof Error ? error.message : 'Unable to update membership';
      toast.error(message);
    }
  };

  const handleAfterUpdate = async () => {
    await Promise.all([refetchGroup(), refetchPosts()]);
  };

  const isLoading = groupLoading || (!group && (membersLoading || postsLoading));

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (groupError) {
    return (
      <Card className="p-12 text-center">
        <p className="text-red-600 dark:text-red-400">We couldn&apos;t load this group.</p>
      </Card>
    );
  }

  if (!group) {
    return (
      <Card className="p-12 text-center">
        <p className="text-gray-500 dark:text-gray-400">Group not found.</p>
        <Link href="/groups" className="mt-4 inline-block text-blue-600 hover:underline dark:text-blue-400">
          Back to groups
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-[linear-gradient(to_right,#3b82f6,#9333ea)]"
          aria-hidden="true"
        />
        <div className="relative z-10 px-4 pb-6 pt-24 sm:px-6 sm:pt-28">
          <div className="rounded-xl bg-white/95 p-6 shadow-sm backdrop-blur dark:bg-gray-900/85">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                {group.avatar?.url ? (
                    <div className="relative -mt-24 h-32 w-32 overflow-hidden rounded-full border-4 border-white shadow-lg dark:border-gray-900">
                      <Image src={group.avatar.url} alt={group.name} fill className="object-cover" unoptimized />
                    </div>
                ) : (
                  <Avatar
                    name={group.name}
                    size="xl"
                    className="-mt-24 h-32 w-32 border-4 border-white text-3xl shadow-lg dark:border-gray-900 rounded-xl"
                  />
                )}
                <div className="text-gray-900 dark:text-white">
                  <h1 className="text-2xl font-bold sm:text-3xl">{group.name}</h1>
                  {group.locationName && (
                    <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{group.locationName}</p>
                  )}
                  {membershipLabel && (
                    <p className="mt-2 text-sm font-medium text-blue-600 dark:text-blue-400">{membershipLabel}</p>
                  )}
                </div>
              </div>
              <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center sm:justify-end sm:gap-3">
                <Button
                  onClick={handleJoinOrLeave}
                  disabled={joinLoading || leaveLoading || isPending}
                  isLoading={joinLoading || leaveLoading}
                  size="icon"
                  variant={isMember ? 'destructive' : 'default'}
                  aria-label={
                    isMember ? 'Leave group' : isPending ? 'Request pending approval' : 'Join group'
                  }
                  title={
                    isMember ? 'Leave group' : isPending ? 'Request pending approval' : 'Join group'
                  }
                >
                  {isMember ? (
                    <UserMinusIcon className="h-5 w-5" />
                  ) : isPending ? (
                    <ClockIcon className="h-5 w-5" />
                  ) : (
                    <UserPlusIcon className="h-5 w-5" />
                  )}
                </Button>
                {canManage && (
                  <Button
                    variant="outline"
                    onClick={() => setIsEditModalOpen(true)}
                    size="icon"
                    aria-label="Edit group"
                    title="Edit group"
                  >
                    <PencilSquareIcon className="h-5 w-5" />
                  </Button>
                )}
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-300">
              <span className="rounded-full bg-gray-100 px-3 py-1 font-medium capitalize tracking-wide dark:bg-gray-800">
                {group.groupType}
              </span>
              <span className="rounded-full bg-gray-100 px-3 py-1 font-medium capitalize tracking-wide dark:bg-gray-800">
                {group.actionRadius}
              </span>
              <span className="rounded-full bg-gray-100 px-3 py-1 font-medium dark:bg-gray-800">
                {group.membersCount} member{group.membersCount === 1 ? '' : 's'}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* About */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">About this group</h2>
        {aboutHtml && (
          <div className="rich-text mt-2" dangerouslySetInnerHTML={{ __html: aboutHtml }} />
        )}
        {descriptionHtml && (
          <div
            className={`rich-text ${aboutHtml ? 'mt-6' : 'mt-2'}`}
            dangerouslySetInnerHTML={{ __html: descriptionHtml }}
          />
        )}
        {!aboutHtml && !descriptionHtml && (
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">No description has been added for this group yet.</p>
        )}
        <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
          <p>Created {group.createdAt ? formatDate(group.createdAt) : 'recently'}</p>
          {group.isMutedByMe && <p>You have muted notifications for this group.</p>}
        </div>
      </Card>

      {/* Members */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Members</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Showing {members.length} of {group.membersCount} member{group.membersCount === 1 ? '' : 's'}
          </p>
        </div>
        {membersLoading ? (
          <div className="mt-4 flex gap-3">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="flex flex-col items-center gap-2 text-center">
                <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700" />
                <div className="h-3 w-12 rounded bg-gray-200 dark:bg-gray-700" />
              </div>
            ))}
          </div>
        ) : members.length === 0 ? (
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">No members yet.</p>
        ) : (
          <div className="mt-4 flex flex-wrap gap-4">
            {members.map((member) => (
              <Link key={member.id} href={`/profile/${member.slug}`} className="flex w-40 items-center gap-3 rounded-md border border-gray-200 p-3 hover:border-blue-300 dark:border-gray-800 dark:hover:border-blue-700">
                <Avatar name={member.name} src={member.avatar?.url} size="sm" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{member.name}</p>
                  <p className="truncate text-xs text-gray-500 dark:text-gray-400">@{member.slug}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>

      {/* Posts */}
      <div>
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">Recent Posts</h2>
        {postsLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <Card key={index} className="h-40 animate-pulse bg-gray-100 dark:bg-gray-900" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400">No posts yet.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>

      {canManage && (
        <EditGroupModal
          group={group}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onUpdated={handleAfterUpdate}
        />
      )}
    </div>
  );
}
