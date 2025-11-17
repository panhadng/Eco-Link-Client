'use client';

import { use, useMemo, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery } from '@apollo/client';
import { useRouter } from 'next/navigation';
import {
  GET_CURRENT_USER,
  GET_USER_BY_SLUG,
  GET_USER_POSTS,
  GET_USER_SHOUTED_POSTS,
} from '@/lib/graphql/queries';
import { useAuth } from '@/context/AuthContext';
import { useCreateRoom } from '@/hooks/useMessages';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PostCard } from '@/components/post/PostCard';
import { SharedPostCard } from '@/components/post/SharedPostCard';
import { EditProfileModal } from '@/components/profile/EditProfileModal';
import { MapPinIcon, CalendarIcon, ChatBubbleLeftRightIcon, UserPlusIcon, UserMinusIcon } from '@heroicons/react/24/outline';
import { formatDate } from '@/lib/utils';
import Image from 'next/image';
import { Post } from '@/types';
import { FOLLOW_USER, UNFOLLOW_USER } from '@/lib/graphql/mutations';
import toast from 'react-hot-toast';

export default function ProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const { user: currentUser, refetchUser: refetchCurrentUser } = useAuth();
  const { createRoom, loading: creatingRoom } = useCreateRoom();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { data: userData, loading: userLoading, refetch: refetchProfile } = useQuery(GET_USER_BY_SLUG, {
    variables: { slug },
  });

  const user = userData?.User?.[0];

  const [followUser, { loading: followLoading }] = useMutation(FOLLOW_USER, {
    refetchQueries: [
      { query: GET_USER_BY_SLUG, variables: { slug } },
      { query: GET_CURRENT_USER },
    ],
    awaitRefetchQueries: true,
  });

  const [unfollowUser, { loading: unfollowLoading }] = useMutation(UNFOLLOW_USER, {
    refetchQueries: [
      { query: GET_USER_BY_SLUG, variables: { slug } },
      { query: GET_CURRENT_USER },
    ],
    awaitRefetchQueries: true,
  });

  const { data: postsData, loading: postsLoading, refetch: refetchUserPosts } = useQuery(GET_USER_POSTS, {
    variables: {
      authorId: user?.id,
      first: 20,
      offset: 0,
    },
    skip: !user?.id, // Don't run query until we have the user ID
  });

  const { data: sharedData, loading: sharedLoading } = useQuery(GET_USER_SHOUTED_POSTS, {
    variables: {
      userId: user?.id,
    },
    skip: !user?.id, // Fetch as soon as we have user ID to show count
  });

  const isFollowing = Boolean(user?.followedByCurrentUser);

  const handleFollowToggle = async () => {
    if (!user?.id) return;
    try {
      if (isFollowing) {
        await unfollowUser({ variables: { id: user.id } });
        toast.success(`Unfollowed ${user.name}`);
      } else {
        await followUser({ variables: { id: user.id } });
        toast.success(`Now following ${user.name}`);
      }
      await refetchProfile();
      refetchCurrentUser();
    } catch (error) {
      console.error('Error updating follow status:', error);
      toast.error('Could not update follow status');
    }
  };

  // Combine and sort posts by date
  const allPosts = useMemo(() => {
    const posts = postsData?.Post || [];
    const sharedPosts = sharedData?.User?.[0]?.shouted || [];
    
    const authoredPosts = posts.map((post: Post) => ({
      ...post,
      type: 'authored' as const,
      sortDate: new Date(post.createdAt).getTime(),
    }));

    const shared = sharedPosts.map((post: Post) => ({
      ...post,
      type: 'shared' as const,
      sortDate: new Date(post.createdAt).getTime(), // Using post creation date, ideally would use share date
    }));

    return [...authoredPosts, ...shared].sort((a, b) => b.sortDate - a.sortDate);
  }, [postsData, sharedData]);

  if (userLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-lg bg-white p-12 text-center dark:bg-gray-900">
        <p className="text-gray-500 dark:text-gray-400">User not found</p>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === user.id;

  const handleStartChat = async () => {
    if (!user?.id) return;
    try {
      const { data } = await createRoom({
        variables: { userId: user.id },
      });
      if (data?.CreateRoom) {
        router.push('/messages');
      }
    } catch (error) {
      console.error('Error creating room:', error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Profile Header */}
      <Card className="overflow-hidden">
        {/* Cover Photo */}
        <div className="h-32 bg-[linear-gradient(to_right,#3b82f6,#9333ea)]" />

        {/* Profile Info */}
        <div className="relative px-6 pb-6">
          <div className="flex items-end justify-between">
            {user.avatar?.url ? (
              <div className="relative -mt-12 h-32 w-32 overflow-hidden rounded-full border-4 border-white dark:border-gray-900">
                <Image
                  src={user.avatar.url}
                  alt={user.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            ) : (
              <Avatar
                name={user.name}
                size="xl"
                className="-mt-12 border-4 border-white dark:border-gray-900"
              />
            )}

            {isOwnProfile ? (
              <Button variant="outline" className="mt-4 dark:text-white" onClick={() => setIsEditModalOpen(true)}>
                Edit Profile
              </Button>
            ) : (
              <div className="mt-4 flex gap-2">
                <Button
                  variant={isFollowing ? 'outline' : 'default'}
                  onClick={handleFollowToggle}
                  isLoading={followLoading || unfollowLoading}
                >
                  {isFollowing ? (
                    <>
                      <UserMinusIcon className="h-5 w-5 mr-2" />
                      Unfollow
                    </>
                  ) : (
                    <>
                      <UserPlusIcon className="h-5 w-5 mr-2" />
                      Follow
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleStartChat}
                  isLoading={creatingRoom}
                  className="dark:text-white"
                >
                  <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2 dark:text-white" />
                  Message
                </Button>
              </div>
            )}
          </div>

          <div className="mt-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{user.name}</h1>
            <p className="text-gray-500 dark:text-gray-400">@{user.slug}</p>

            {user.about && (
              <p className="mt-3 text-gray-700 dark:text-gray-300">{user.about}</p>
            )}

            <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
              {user.locationName && (
                <div className="flex items-center space-x-1">
                  <MapPinIcon className="h-4 w-4" />
                  <span>{user.locationName}</span>
                </div>
              )}
              <div className="flex items-center space-x-1">
                <CalendarIcon className="h-4 w-4" />
                <span>Joined {formatDate(user.createdAt)}</span>
              </div>
            </div>

            <div className="mt-4 flex space-x-6 text-sm">
              <Link
                href={`/profile/${user.slug}/followers`}
                className="transition hover:text-blue-600 dark:hover:text-blue-400"
              >
                <span className="font-semibold text-gray-900 dark:text-white">
                  {user.followedByCount}
                </span>{' '}
                <span className="text-gray-500 dark:text-gray-400">Followers</span>
              </Link>
              <Link
                href={`/profile/${user.slug}/following`}
                className="transition hover:text-blue-600 dark:hover:text-blue-400"
              >
                <span className="font-semibold text-gray-900 dark:text-white">
                  {user.followingCount ?? 0}
                </span>{' '}
                <span className="text-gray-500 dark:text-gray-400">Following</span>
              </Link>
            </div>
          </div>
        </div>
      </Card>

      {/* Posts Feed */}
      <div>
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
          Posts & Activity
        </h2>

        {postsLoading || sharedLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-48 animate-pulse rounded-lg bg-white dark:bg-gray-900"
              />
            ))}
          </div>
        ) : allPosts.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400">No posts yet</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {allPosts.map((post: Post & { type: 'authored' | 'shared' }) => {
              if (post.type === 'shared') {
                return (
                  <SharedPostCard
                    key={`shared-${post.id}`}
                    post={post}
                    sharedBy={{
                      id: user.id,
                      name: user.name,
                      slug: user.slug,
                    }}
                  />
                );
              }
              return (
                <PostCard
                  key={post.id}
                  post={post}
                  onPostUpdated={() => void refetchUserPosts()}
                  onPostDeleted={() => void refetchUserPosts()}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {isOwnProfile && currentUser && (
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          user={currentUser}
        />
      )}
    </div>
  );
}

