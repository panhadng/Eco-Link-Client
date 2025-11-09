'use client';

import { useState, useRef } from 'react';
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

export function CreatePost() {
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

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onSubmit = async (data: CreatePostFormData) => {
    try {
      const variables: any = {
        title: data.title,
        content: data.content,
        visibility: 'public',
      };

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
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  if (!user) return null;

  return (
    <Card className="p-4">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex space-x-3">
          <Avatar name={user.name} size="md" />
          <div className="flex-1">
            {!expanded ? (
              <button
                type="button"
                onClick={() => setExpanded(true)}
                className="w-full rounded-full border border-gray-300 bg-gray-50 px-4 py-2 text-left text-gray-500 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
              >
                What&apos;s on your mind, {user.name.split(' ')[0]}?
              </button>
            ) : (
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Post title..."
                  className="w-full border-0 border-b border-gray-300 bg-transparent p-2 text-lg font-semibold focus:border-blue-500 focus:outline-none dark:border-gray-700 text-white"
                  {...register('title')}
                />
                {errors.title && (
                  <p className="text-sm text-red-600">{errors.title.message}</p>
                )}

                <Textarea
                  placeholder="What's on your mind?"
                  rows={4}
                  error={errors.content?.message}
                  className="w-full resize-none border-0 p-2 focus:ring-0 text-white"
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
                      Post
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

