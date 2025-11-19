'use client';

import { useState, useRef, useCallback, FormEvent } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/context/AuthContext';
import { useCreatePost } from '@/hooks/usePosts';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Card } from '@/components/ui/Card';
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

const createPostSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  content: z.string().min(3, 'Content must be at least 3 characters'),
});

type CreatePostFormData = z.infer<typeof createPostSchema>;

type CreatePostVariables = {
  title: string;
  content: string;
  visibility?: string;
  groupId?: string;
  image?: {
    upload: File;
    alt: string;
  };
};

interface CreatePostProps {
  groupId?: string;
  groupName?: string;
  placeholder?: string;
  onCreated?: () => void;
}

export function CreatePost({ groupId, groupName, placeholder, onCreated }: CreatePostProps = {}) {
  const { user } = useAuth();
  const { createPost, loading } = useCreatePost();
  const [expanded, setExpanded] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreatePostFormData>({
    resolver: zodResolver(createPostSchema),
  });

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = useCallback(() => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const onSubmit = useCallback(
    async (data: CreatePostFormData) => {
      try {
        const variables: CreatePostVariables = {
          title: data.title,
          content: data.content,
          visibility: 'public',
        };

        if (groupId) {
          variables.groupId = groupId;
        }

        if (selectedImage) {
          variables.image = {
            upload: selectedImage,
            alt: data.title,
          };
        }

        await createPost({ variables });
        reset();
        setExpanded(false);
        removeImage();
        onCreated?.();
      } catch (error) {
        console.error('Error creating post:', error);
      }
    },
    [createPost, groupId, onCreated, removeImage, reset, selectedImage],
  );

  const onSubmitForm = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      void handleSubmit(onSubmit)(event);
    },
    [handleSubmit, onSubmit]
  );

  if (!user) return null;

  const firstName = user.name.split(' ')[0];
  const collapsedPrompt =
    placeholder ?? (groupName ? `Share something with ${groupName}` : `What's on your mind, ${firstName}?`);
  const submitLabel = groupId ? 'Share' : 'Post';

  return (
    <Card className="p-4">
      <form onSubmit={onSubmitForm}>
        <div className="flex space-x-3">
          <Avatar name={user.name} size="md" />
          <div className="flex-1">
            {!expanded ? (
              <button
                type="button"
                onClick={() => setExpanded(true)}
                className="w-full rounded-full border border-gray-300 bg-muted px-4 py-2 text-left text-gray-500 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-700"
              >
                {collapsedPrompt}
              </button>
            ) : (
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Post title..."
                  className="w-full border-0 border-b border-gray-300 bg-background p-2 text-lg font-semibold text-gray-900 focus:border-gray-400 focus:outline-none dark:border-gray-700 dark:text-gray-100 dark:focus:border-gray-600"
                  {...register('title')}
                />
                {errors.title && (
                  <p className="text-sm text-red-600">{errors.title.message}</p>
                )}

                <Textarea
                  placeholder="What's on your mind?"
                  rows={4}
                  error={errors.content?.message}
                  className="w-full resize-none border-0 bg-background p-2 focus:ring-0"
                  {...register('content')}
                />

                {imagePreview && (
                  <div className="relative">
                    <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute right-2 top-2 rounded-full bg-gray-900/80 p-2 text-white hover:bg-gray-900"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between border-t border-gray-200 pt-3 dark:border-gray-700">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center space-x-2 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                  >
                    <PhotoIcon className="h-5 w-5" />
                    <span>Photo</span>
                  </button>

                  <div className="flex space-x-2">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        reset();
                        setExpanded(false);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" isLoading={loading}>
                      {submitLabel}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </form>
    </Card>
  );
}

