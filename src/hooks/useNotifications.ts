import { useQuery } from '@apollo/client';
import { GET_NOTIFICATIONS } from '@/lib/graphql/queries';
import { useAuth } from '@/context/AuthContext';
import { useMemo } from 'react';

export function useNotificationCount() {
  const { user } = useAuth();

  const { data } = useQuery(GET_NOTIFICATIONS, {
    variables: {
      orderBy: 'updatedAt_desc',
      first: 100,
    },
    skip: !user,
    fetchPolicy: 'cache-and-network',
  });

  const unreadCount = useMemo(() => {
    if (!data?.notifications) return 0;
    return data.notifications.filter((notification: { read: boolean }) => !notification.read).length;
  }, [data]);

  return { unreadCount };
}
