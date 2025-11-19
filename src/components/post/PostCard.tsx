'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useMemo, startTransition, useRef } from 'react';
import { useMutation, useLazyQuery } from '@apollo/client';
import { useAuth } from '@/context/AuthContext';
import { ADD_POST_EMOTION, REMOVE_POST_EMOTION } from '@/lib/graphql/mutations';
import { GET_POST_LIKERS } from '@/lib/graphql/queries';
import { Emotion, Post } from '@/types';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { ShareButton } from './ShareButton';
import { EditPostModal } from './EditPostModal';
import { ImageViewer } from './ImageViewer';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/utils';
import { getRichTextHtml } from '@/lib/utils/html';
import {
  HeartIcon,
  ChatBubbleLeftIcon,
  EllipsisHorizontalIcon,
  PencilSquareIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { useDeletePost } from '@/hooks/usePosts';

interface PostCardProps {
  post: Post;
  onPostClick?: () => void;
  onPostUpdated?: () => void;
  onPostDeleted?: (postId: string) => void;
}

export function PostCard({ post, onPostClick, onPostUpdated, onPostDeleted }: PostCardProps) {
  const { user } = useAuth();
  const [addEmotion] = useMutation(ADD_POST_EMOTION);
  const [removeEmotion] = useMutation(REMOVE_POST_EMOTION);
  const { deletePost, loading: deleting } = useDeletePost();

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.emotionsCount || 0);
  const [isLikersModalOpen, setIsLikersModalOpen] = useState(false);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isOwnPost = user?.id === post.author.id;

  const [fetchPostLikers, { data: likersData, loading: likersLoading, called: likersCalled, refetch: refetchLikers }] =
    useLazyQuery(GET_POST_LIKERS, {
      fetchPolicy: 'network-only',
    });

  const likersPost = likersData?.Post?.[0];
  const likers: Emotion[] = (likersPost?.emotions as Emotion[]) ?? [];
  const totalLikerCount = likersPost?.emotionsCount ?? likeCount;
  const hasLikedEmotion = useMemo(() => {
    if (!user) {
      return false;
    }
    return (post.emotions ?? []).some(
      (emotion) => emotion.emotion === 'happy' && emotion.User?.id === user.id,
    );
  }, [post.emotions, user?.id]);

  useEffect(() => {
    startTransition(() => {
      setLikeCount(post.emotionsCount || 0);
    });
  }, [post.emotionsCount]);

  useEffect(() => {
    if (!user) {
      setLiked(false);
      return;
    }
    setLiked(hasLikedEmotion);
  }, [user?.id, hasLikedEmotion]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!user) return;

    try {
      if (liked) {
        await removeEmotion({
          variables: {
            to: { id: post.id },
            data: { emotion: 'happy' },
          },
        });
        setLiked(false);
        setLikeCount((prev) => Math.max(0, prev - 1));
      } else {
        await addEmotion({
          variables: {
            to: { id: post.id },
            data: { emotion: 'happy' },
          },
        });
        setLiked(true);
        setLikeCount((prev) => prev + 1);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleDelete = async () => {
    if (deleting) return;
    try {
      await deletePost({ variables: { id: post.id } });
      if (onPostDeleted) {
        onPostDeleted(post.id);
      }
    } catch (error) {
      console.error('Failed to delete post:', error);
    } finally {
      setIsDeleteModalOpen(false);
    }
  };

  const handleEditOpen = () => {
    setIsEditModalOpen(true);
    setMenuOpen(false);
  };

  const handleDeleteOpen = () => {
    setMenuOpen(false);
    setIsDeleteModalOpen(true);
  };

  const handleOpenLikers = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();

    setIsLikersModalOpen(true);

    const variables = { id: post.id };
    if (!likersCalled) {
      void fetchPostLikers({ variables });
    } else {
      void refetchLikers?.(variables);
    }
  };

  const handleCloseLikers = () => {
    setIsLikersModalOpen(false);
  };

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <Link href={`/profile/${post.author.slug}`} className="flex items-center space-x-3">
            <Avatar name={post.author.name} size="md" />
            <div>
              <p className="font-semibold text-gray-900 dark:text-white hover:underline">
                {post.author.name}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                @{post.author.slug} · {formatDate(post.createdAt)}
              </p>
            </div>
          </Link>

          {isOwnPost && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((prev) => !prev)}
                className="rounded-full p-2 text-gray-500 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:text-gray-400 dark:hover:bg-gray-800 dark:focus-visible:ring-gray-600"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
              >
                <EllipsisHorizontalIcon className="h-5 w-5" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 z-20 mt-2 w-40 rounded-lg border border-gray-200 bg-card py-1 shadow-lg dark:border-gray-700">
                  <button
                    onClick={handleEditOpen}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                  >
                    <PencilSquareIcon className="h-4 w-4" />
                    Edit post
                  </button>
                  <button
                    onClick={handleDeleteOpen}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                  >
                    <TrashIcon className="h-4 w-4" />
                    Delete post
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <div
          className="mt-3 cursor-pointer"
          onClick={onPostClick || (() => (window.location.href = `/post/${post.id}`))}
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{post.title}</h3>
          {(() => {
            const content = post.contentExcerpt || post.content;
            const htmlContent = getRichTextHtml(content);
            
            if (htmlContent) {
              return (
                <div
                  className="rich-text mt-2 text-gray-700 dark:text-gray-300"
                  dangerouslySetInnerHTML={{ __html: htmlContent }}
                />
              );
            }
            
            return (
              <p className="mt-2 text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {content}
              </p>
            );
          })()}

          {/* Image */}
          {post.image?.url && (
            <div
              className="mt-3 overflow-hidden rounded-lg cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setIsImageViewerOpen(true);
              }}
            >
              <div className="relative w-full max-h-[600px] flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                <Image
                  src={post.image.url}
                  alt={post.image.alt || post.title}
                  width={800}
                  height={600}
                  className="w-full h-auto max-h-[600px] object-contain transition-transform hover:scale-105"
                  unoptimized
                />
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-3 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleLike}
              className="flex items-center rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-red-50 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-900/20"
              aria-label={liked ? 'Unlike post' : 'Like post'}
            >
              {liked ? (
                <HeartIconSolid className="h-5 w-5 text-red-600" />
              ) : (
                <HeartIcon className="h-5 w-5" />
              )}
            </button>
            <button
              onClick={handleOpenLikers}
              className="text-sm font-medium text-gray-600 underline decoration-transparent transition hover:text-primary hover:decoration-primary dark:text-gray-400"
            >
              {likeCount} like{likeCount === 1 ? '' : 's'}
            </button>
          </div>

          <Link
            href={`/post/${post.id}`}
            className="flex items-center space-x-2 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-primary dark:text-gray-400 dark:hover:bg-gray-800"
          >
            <ChatBubbleLeftIcon className="h-5 w-5" />
            <span>{post.commentsCount}</span>
          </Link>

          <ShareButton
            postId={post.id}
            shoutedByCurrentUser={post.shoutedByCurrentUser}
            shoutedCount={post.shoutedCount}
            postTitle={post.title}
          />
        </div>
      </div>
      {isOwnPost && (
        <>
          <EditPostModal
            post={post}
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            onUpdated={onPostUpdated}
          />

          <Modal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            title="Delete post"
            size="sm"
          >
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Are you sure you want to delete this post? This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)} disabled={deleting}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                isLoading={deleting}
              >
                Delete
              </Button>
            </div>
          </Modal>
        </>
      )}

      <Modal isOpen={isLikersModalOpen} onClose={handleCloseLikers} title="Liked by" size="sm">
        {likersLoading && likers.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading likes…</p>
        ) : (
          <>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Total likes: {totalLikerCount}
            </p>
            <div className="mt-3 max-h-80 space-y-3 overflow-y-auto pr-1">
              {likers.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">No likes yet.</p>
              ) : (
                likers.map((emotion, index) => {
                  const liker = emotion.User;
                  if (!liker) return null;
                  const key = `${liker.id}-${index}`;
                  return (
                    <Link
                      key={key}
                      href={`/profile/${liker.slug}`}
                      className="flex items-center gap-3 rounded-lg p-2 transition hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={handleCloseLikers}
                    >
                      <Avatar name={liker.name} src={liker.avatar?.url} size="sm" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                          {liker.name}
                        </p>
                        <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                          @{liker.slug}
                        </p>
                        {liker.about && (
                          <p className="mt-1 line-clamp-2 text-xs text-gray-600 dark:text-gray-300">
                            {liker.about}
                          </p>
                        )}
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </>
        )}
      </Modal>

      {/* Image Viewer */}
      {post.image?.url && (
        <ImageViewer
          isOpen={isImageViewerOpen}
          onClose={() => setIsImageViewerOpen(false)}
          imageUrl={post.image.url}
          alt={post.image.alt || post.title}
        />
      )}
    </Card>
  );
}

