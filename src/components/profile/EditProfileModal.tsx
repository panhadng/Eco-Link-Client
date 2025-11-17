'use client';

import { useState, useRef, useEffect } from 'react';
import { useMutation } from '@apollo/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UPDATE_USER } from '@/lib/graphql/mutations';
import { GET_CURRENT_USER } from '@/lib/graphql/queries';
import { User } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Avatar } from '@/components/ui/Avatar';
import { CameraIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import toast from 'react-hot-toast';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

const editProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  about: z.string().max(500, 'About must be less than 500 characters').optional(),
  locationName: z.string().max(100, 'Location must be less than 100 characters').optional(),
});

type EditProfileFormData = z.infer<typeof editProfileSchema>;

export function EditProfileModal({ isOpen, onClose, user }: EditProfileModalProps) {
  const [updateUser, { loading }] = useMutation(UPDATE_USER, {
    refetchQueries: [{ query: GET_CURRENT_USER }],
  });
  const [selectedAvatar, setSelectedAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditProfileFormData>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      name: user.name,
      about: user.about || '',
      locationName: user.locationName || '',
    },
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    
    // Reset form fields
    reset({
      name: user.name,
      about: user.about || '',
      locationName: user.locationName || '',
    });
  }, [isOpen, user, reset]);

  useEffect(() => {
    // Clear avatar selection when modal closes
    if (!isOpen) {
      setTimeout(() => {
        setSelectedAvatar(null);
        setAvatarPreview(null);
      }, 0);
    }
  }, [isOpen]);

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedAvatar(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAvatar = () => {
    setSelectedAvatar(null);
    setAvatarPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onSubmit = async (data: EditProfileFormData) => {
    try {
      const variables: {
        id: string;
        name: string;
        about: string;
        locationName: string;
        avatar?: { upload: File; alt: string };
      } = {
        id: user.id,
        name: data.name,
        about: data.about || '',
        locationName: data.locationName || '',
      };

      if (selectedAvatar) {
        variables.avatar = {
          upload: selectedAvatar,
          alt: `${data.name}'s avatar`,
        };
      }

      await updateUser({ variables });
      toast.success('Profile updated successfully!');
      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Profile" size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Avatar Upload */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            {avatarPreview ? (
              <div className="relative h-32 w-32 overflow-hidden rounded-full">
                <Image
                  src={avatarPreview}
                  alt="Avatar preview"
                  fill
                  className="object-cover"
                />
              </div>
            ) : user.avatar?.url ? (
              <div className="relative h-32 w-32 overflow-hidden rounded-full">
                <Image
                  src={user.avatar.url}
                  alt={user.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            ) : (
              <Avatar name={user.name} size="xl" />
            )}
            
            {(avatarPreview || selectedAvatar) && (
              <button
                type="button"
                onClick={removeAvatar}
                className="absolute -right-2 -top-2 rounded-full bg-red-500 p-2 text-white hover:bg-red-600"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarSelect}
            className="hidden"
          />
          
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
          >
            <CameraIcon className="mr-2 h-5 w-5" />
            {user.avatar?.url || avatarPreview ? 'Change Avatar' : 'Upload Avatar'}
          </Button>
        </div>

        {/* Name */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Name
          </label>
          <input
            type="text"
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:border-gray-600 dark:focus:ring-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            {...register('name')}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        {/* About/Bio */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            About
          </label>
          <Textarea
            placeholder="Tell us about yourself..."
            rows={4}
            className="w-full"
            error={errors.about?.message}
            {...register('about')}
          />
          <p className="mt-1 text-xs text-gray-500">
            {errors.about ? errors.about.message : 'Max 500 characters'}
          </p>
        </div>

        {/* Location */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Location
          </label>
          <input
            type="text"
            placeholder="City, Country"
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:border-gray-600 dark:focus:ring-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            {...register('locationName')}
          />
          {errors.locationName && (
            <p className="mt-1 text-sm text-red-600">{errors.locationName.message}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 border-t border-gray-200 pt-4 dark:border-gray-700">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={loading}>
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}

