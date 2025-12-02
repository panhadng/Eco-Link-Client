'use client';

import { useState } from 'react';
import { useShoutPost } from '@/hooks/usePosts';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ShareIcon } from '@heroicons/react/24/outline';
import { ArrowPathRoundedSquareIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

interface ShareButtonProps {
  postId: string;
  shoutedByCurrentUser?: boolean;
  shoutedCount: number;
  postTitle: string;
}

export function ShareButton({ postId, shoutedByCurrentUser, shoutedCount, postTitle }: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isShared, setIsShared] = useState(shoutedByCurrentUser || false);
  const [shareCount, setShareCount] = useState(shoutedCount);
  const { shout, unshout } = useShoutPost();

  const handleShare = async () => {
    try {
      if (isShared) {
        await unshout({ variables: { id: postId } });
        setShareCount((prev) => Math.max(0, prev - 1));
        setIsShared(false);
        toast.success('Removed from your profile');
      } else {
        await shout({ variables: { id: postId } });
        setShareCount((prev) => prev + 1);
        setIsShared(true);
        toast.success('Shared to your profile!');
      }
      setIsOpen(false);
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/post/${postId}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard!');
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center space-x-2 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-green-50 hover:text-green-600"
      >
        {isShared ? (
          <ArrowPathRoundedSquareIcon className="h-5 w-5 text-green-600" />
        ) : (
          <ShareIcon className="h-5 w-5" />
        )}
        <span>{shareCount > 0 ? shareCount : 'Share'}</span>
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Share Post">
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            <strong>{postTitle}</strong>
          </p>

          <div className="space-y-2">
            {isShared ? (
              <Button
                variant="destructive"
                className="w-full justify-start"
                onClick={handleShare}
              >
                <ArrowPathRoundedSquareIcon className="mr-2 h-5 w-5" />
                Remove from your profile
              </Button>
            ) : (
              <Button
                variant="default"
                className="w-full justify-start"
                onClick={handleShare}
              >
                <ArrowPathRoundedSquareIcon className="mr-2 h-5 w-5" />
                Share to your profile
              </Button>
            )}

            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleCopyLink}
            >
              <ShareIcon className="mr-2 h-5 w-5" />
              Copy link to post
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

