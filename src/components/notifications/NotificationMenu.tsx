'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useSubscription } from '@apollo/client';
import Link from 'next/link';
import { BellIcon } from '@heroicons/react/24/outline';
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

const NOTIFICATION_LIMIT = 20;

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

export function NotificationMenu() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const { data, loading, refetch } = useQuery(GET_NOTIFICATIONS, {
    variables: {
      orderBy: notificationOrder,
      first: NOTIFICATION_LIMIT,
    },
    skip: !user,
    fetchPolicy: 'network-only',
  });

  const [markNotificationAsRead] = useMutation(MARK_NOTIFICATION_AS_READ);
  const [markAllNotificationsAsRead, { loading: markAllLoading }] = useMutation(
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

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const toggleMenu = () => {
    if (!user) return;
    setIsOpen((prev) => !prev);
    if (!isOpen) {
      void refetch();
    }
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return;
    try {
      await markAllNotificationsAsRead();
      void refetch();
    } catch (error) {
      console.error('Failed to mark all notifications as read', error);
      toast.error('Could not mark all notifications as read');
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (notification.read) {
      setIsOpen(false);
      return;
    }

    const resourceId = notification.from?.id;
    if (!resourceId) {
      setIsOpen(false);
      return;
    }

    void markNotificationAsRead({ variables: { id: resourceId } })
      .then(() => {
        void refetch();
      })
      .catch((error) => {
        console.error('Failed to mark notification as read', error);
      });

    setIsOpen(false);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={toggleMenu}
        className="relative rounded-lg p-2 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:hover:bg-gray-800"
        aria-label="Notifications"
      >
        <BellIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-xs font-semibold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-[500px] rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-700">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Notifications</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0 || markAllLoading}
            >
              Mark all as read
            </Button>
          </div>

          <div className="max-h-[600px] overflow-y-auto">
            {loading ? (
              <div className="space-y-3 p-4">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="flex animate-pulse space-x-3">
                    <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-32 rounded bg-gray-200 dark:bg-gray-700" />
                      <div className="h-3 w-24 rounded bg-gray-200 dark:bg-gray-700" />
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-sm text-gray-500 dark:text-gray-400">
                You are all caught up!
              </div>
            ) : (
              <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                {notifications.map((notification) => {
                  const link = getNotificationLink(notification);
                  const message = getNotificationMessage(notification);
                  const excerpt = getNotificationExcerpt(notification);
                  const timestamp = notification.updatedAt ?? notification.createdAt;

                  return (
                    <li key={notification.id}>
                      <Link
                        href={link}
                        onClick={() => handleNotificationClick(notification)}
                        className={`flex items-start space-x-3 px-4 py-3 text-sm transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${
                          notification.read ? 'bg-white dark:bg-gray-900' : 'bg-blue-50/60 dark:bg-blue-900/20'
                        }`}
                      >
                        <Avatar
                          name={notification.relatedUser?.name ?? 'User'}
                          size="md"
                          src={notification.relatedUser?.avatar?.url}
                        />
                        <div className="flex-1 overflow-hidden">
                          <p className="font-medium text-gray-900 dark:text-gray-100">{message}</p>
                          {excerpt && (() => {
                            const htmlContent = getRichTextHtml(excerpt);
                            if (htmlContent) {
                              return (
                                <div
                                  className="rich-text mt-1 line-clamp-3 text-sm text-gray-600 dark:text-gray-400"
                                  dangerouslySetInnerHTML={{ __html: htmlContent }}
                                />
                              );
                            }
                            return (
                              <p className="mt-1 line-clamp-3 text-sm text-gray-600 dark:text-gray-400">
                                {excerpt}
                              </p>
                            );
                          })()}
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                            {formatDate(timestamp)}
                          </p>
                        </div>
                        {!notification.read && (
                          <span className="mt-1 h-2 w-2 rounded-full bg-blue-500" aria-hidden="true" />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
