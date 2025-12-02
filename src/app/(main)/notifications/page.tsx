'use client';

import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useSubscription } from '@apollo/client';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

import { useAuth } from '@/context/AuthContext';
import { GET_NOTIFICATIONS } from '@/lib/graphql/queries';
import {
  MARK_ALL_NOTIFICATIONS_AS_READ,
  MARK_NOTIFICATION_AS_READ,
} from '@/lib/graphql/mutations';
import { NOTIFICATION_ADDED } from '@/lib/graphql/subscriptions';
import { Notification } from '@/types';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/utils';
import { getRichTextHtml } from '@/lib/utils/html';

const NOTIFICATION_LIMIT = 50;

type NotificationOrdering = 'updatedAt_desc' | 'updatedAt_asc' | 'createdAt_desc' | 'createdAt_asc';

const notificationOrder: NotificationOrdering = 'updatedAt_desc';

function getNotificationLink(notification: Notification): string {
  const source = notification.from;
  if (!source) return '/feed';

  switch (source.__typename) {
    case 'Post':
      return `/post/${source.id}`;
    case 'Comment':
      if (source.post?.id) {
        return `/post/${source.post.id}`;
      }
      return '/feed';
    case 'Group':
      return source.slug ? `/groups/${source.slug}` : '/groups';
    default:
      return '/feed';
  }
}

function getNotificationMessage(notification: Notification): string {
  const actor = notification.relatedUser?.name ?? 'Someone';
  const source = notification.from;
  switch (notification.reason) {
    case 'mentioned_in_post':
      return `${actor} mentioned you in a post`;
    case 'mentioned_in_comment':
      return `${actor} mentioned you in a comment`;
    case 'commented_on_post':
      return `${actor} commented on your post`;
    case 'user_joined_group':
      return `${actor} joined ${source && source.__typename === 'Group' ? source.name ?? 'your group' : 'your group'}`;
    case 'user_left_group':
      return `${actor} left ${source && source.__typename === 'Group' ? source.name ?? 'your group' : 'your group'}`;
    case 'changed_group_member_role':
      return `${actor} updated a member role${source && source.__typename === 'Group' && source.name ? ` in ${source.name}` : ''}`;
    case 'removed_user_from_group':
      return `${actor} removed someone from ${source && source.__typename === 'Group' ? source.name ?? 'the group' : 'the group'}`;
    case 'followed_user_posted':
      if (source?.__typename === 'Post') {
        const author = source.author?.name ?? 'Someone you follow';
        return `${author} just posted`;
      }
      return `${actor} shared something new`;
    case 'post_in_group':
      if (source?.__typename === 'Group') {
        return `There is a new post in ${source.name ?? 'one of your groups'}`;
      }
      return 'There is a new post in one of your groups';
    default:
      return 'You have a new notification';
  }
}

function getNotificationExcerpt(notification: Notification): string | undefined {
  const source = notification.from;
  if (!source) return undefined;

  if (source.__typename === 'Post') {
    if (source.content) return source.content;
  }

  if (source.__typename === 'Comment') {
    if (source.content) return source.content;
  }

  return undefined;
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [markAllLoading, setMarkAllLoading] = useState(false);

  const { data, loading, refetch } = useQuery(GET_NOTIFICATIONS, {
    variables: {
      orderBy: notificationOrder,
      first: NOTIFICATION_LIMIT,
    },
    skip: !user,
    fetchPolicy: 'network-only',
  });

  const [markNotificationAsRead] = useMutation(MARK_NOTIFICATION_AS_READ);
  const [markAllNotificationsAsRead] = useMutation(
    MARK_ALL_NOTIFICATIONS_AS_READ,
  );

  useSubscription(NOTIFICATION_ADDED, {
    skip: !user,
    onData: () => {
      void refetch();
    },
  });

  const notifications: Notification[] = data?.notifications ?? [];
  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications],
  );

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return;
    setMarkAllLoading(true);
    try {
      await markAllNotificationsAsRead();
      void refetch();
    } catch (error) {
      console.error('Failed to mark all notifications as read', error);
      toast.error('Could not mark all notifications as read');
    } finally {
      setMarkAllLoading(false);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (notification.read) {
      router.push(getNotificationLink(notification));
      return;
    }

    const resourceId = notification.from?.id;
    if (!resourceId) {
      router.push(getNotificationLink(notification));
      return;
    }

    try {
      await markNotificationAsRead({ variables: { id: resourceId } });
      void refetch();
    } catch (error) {
      console.error('Failed to mark notification as read', error);
    }

    router.push(getNotificationLink(notification));
  };

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-full md:h-[calc(100vh-8rem)] max-w-full gap-0 md:gap-4 text-gray-900 relative overflow-hidden">
      <div className="w-full flex flex-col h-full bg-white md:rounded-lg md:border md:border-gray-200 md:shadow-sm md:bg-white">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-gray-200 p-4 shrink-0" style={{ backgroundColor: '#0c0c6d' }}>
          <button
            onClick={() => router.back()}
            className="md:hidden p-2 -ml-2 text-white hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Back"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-semibold text-white flex-1">
            Notifications
          </h2>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={markAllLoading}
              className="text-white hover:bg-white/10"
            >
              {markAllLoading ? 'Marking...' : 'Mark all as read'}
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>You are all caught up!</p>
              <p className="text-sm mt-1">No notifications to display</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => {
                const link = getNotificationLink(notification);
                const message = getNotificationMessage(notification);
                const excerpt = getNotificationExcerpt(notification);
                const timestamp = notification.updatedAt ?? notification.createdAt;

                return (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`flex items-start space-x-3 px-4 py-3 text-sm transition-colors hover:bg-gray-50 w-full text-left ${
                      notification.read ? 'bg-white' : 'bg-primary/5'
                    }`}
                  >
                    <Avatar
                      name={notification.relatedUser?.name ?? 'User'}
                      size="md"
                      src={notification.relatedUser?.avatar?.url}
                    />
                    <div className="flex-1 overflow-hidden min-w-0">
                      <p className="font-medium text-gray-900">{message}</p>
                      {excerpt && (() => {
                        const htmlContent = getRichTextHtml(excerpt);
                        if (htmlContent) {
                          return (
                            <div
                              className="rich-text mt-1 line-clamp-2 text-sm text-gray-600"
                              dangerouslySetInnerHTML={{ __html: htmlContent }}
                            />
                          );
                        }
                        return (
                          <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                            {excerpt}
                          </p>
                        );
                      })()}
                      <p className="mt-1 text-xs text-gray-500">
                        {formatDate(timestamp)}
                      </p>
                    </div>
                    {!notification.read && (
                      <span className="mt-1 h-2 w-2 rounded-full bg-primary shrink-0" aria-hidden="true" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
