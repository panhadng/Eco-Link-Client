'use client';

import { useEffect, useState } from 'react';
import { useUpdatePost } from '@/hooks/usePosts';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Post } from '@/types';

interface EditPostModalProps {
  post: Post | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated?: () => void;
}

export function EditPostModal({ post, isOpen, onClose, onUpdated }: EditPostModalProps) {
  const { updatePost, loading } = useUpdatePost();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (post && isOpen) {
      setTitle(post.title ?? '');
      setContent(post.content ?? '');
    }
  }, [post, isOpen]);

  const handleClose = () => {
    onClose();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!post) return;

    try {
      await updatePost({
        variables: {
          id: post.id,
          title: title.trim(),
          content: content.trim(),
        },
      });
      if (onUpdated) {
        onUpdated();
      }
      handleClose();
    } catch (error) {
      console.error('Failed to update post', error);
    }
  };

  const isSaveDisabled = title.trim().length < 3 || content.trim().length < 3;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Edit Post" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Title
          </label>
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Post title"
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Content
          </label>
          <Textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            rows={6}
            required
          />
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Note: updating the post only changes the title and text. To change the image, delete the post and create a new one.
          </p>
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" isLoading={loading} disabled={isSaveDisabled}>
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}
