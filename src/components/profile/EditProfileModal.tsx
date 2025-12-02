'use client';

import { useState, useRef, useEffect } from 'react';
import { useMutation } from '@apollo/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UPDATE_USER } from '@/lib/graphql/mutations';
import { GET_CURRENT_USER } from '@/lib/graphql/queries';
import { User } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Avatar } from '@/components/ui/Avatar';
import { CameraIcon, XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import toast from 'react-hot-toast';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onProfileUpdated?: () => void;
}

const editProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  about: z.string().max(500, 'About must be less than 500 characters').optional(),
  locationName: z.string().max(100, 'Location must be less than 100 characters').optional(),
});

type EditProfileFormData = z.infer<typeof editProfileSchema>;

export function EditProfileModal({ isOpen, onClose, user, onProfileUpdated }: EditProfileModalProps) {
  const { refetchUser } = useAuth();
  const [updateUser, { loading }] = useMutation(UPDATE_USER, {
    refetchQueries: [{ query: GET_CURRENT_USER }],
    awaitRefetchQueries: true,
  });
  const [selectedAvatar, setSelectedAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedCoverImage, setSelectedCoverImage] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const coverFileInputRef = useRef<HTMLInputElement>(null);
  const [removeCoverImageFlag, setRemoveCoverImageFlag] = useState(false);

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
    // Clear avatar and cover image selection when modal closes
    if (!isOpen) {
      setTimeout(() => {
        setSelectedAvatar(null);
        setAvatarPreview(null);
        setSelectedCoverImage(null);
        setCoverImagePreview(null);
        setRemoveCoverImageFlag(false);
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

  const handleCoverImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedCoverImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setRemoveCoverImageFlag(false);
    }
  };

  const removeCoverImage = () => {
    if (coverImagePreview || selectedCoverImage) {
      setSelectedCoverImage(null);
      setCoverImagePreview(null);
      if (coverFileInputRef.current) {
        coverFileInputRef.current.value = '';
      }
    } else if (user.coverImage?.url) {
      setRemoveCoverImageFlag(true);
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
        coverImage?: { upload: File; alt: string } | null;
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

      if (removeCoverImageFlag && !selectedCoverImage) {
        variables.coverImage = null;
      } else if (selectedCoverImage) {
        variables.coverImage = {
          upload: selectedCoverImage,
          alt: `${data.name}'s cover image`,
        };
      }

      await updateUser({ variables });
      // Manually refetch user to update AuthContext
      await refetchUser();
      // Call callback to refetch profile page data
      if (onProfileUpdated) {
        onProfileUpdated();
      }
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
        {/* Cover Image Upload */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
            {coverImagePreview ? (
              <Image src={coverImagePreview} alt="Cover preview" fill className="object-cover" />
            ) : user.coverImage?.url && !removeCoverImageFlag ? (
              <Image src={user.coverImage.url} alt="Current cover" fill className="object-cover" unoptimized />
            ) : (
              <span className="text-gray-500">No cover image</span>
            )}
            {(coverImagePreview || (user.coverImage?.url && !removeCoverImageFlag)) && (
              <button
                type="button"
                onClick={removeCoverImage}
                className="absolute right-2 top-2 rounded-full bg-red-500 p-2 text-white hover:bg-red-600"
                title={selectedCoverImage || coverImagePreview ? 'Cancel upload' : 'Remove cover image'}
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            )}
          </div>
          <input
            ref={coverFileInputRef}
            type="file"
            accept="image/*"
            onChange={handleCoverImageSelect}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => coverFileInputRef.current?.click()}
          >
            <PhotoIcon className="mr-2 h-5 w-5" />
            {user.coverImage?.url || coverImagePreview ? 'Change Cover Photo' : 'Upload Cover Photo'}
          </Button>
        </div>

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
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            type="text"
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400"
            {...register('name')}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        {/* About/Bio */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
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
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Location
          </label>
          <input
            type="text"
            placeholder="City, Country"
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400"
            {...register('locationName')}
          />
          {errors.locationName && (
            <p className="mt-1 text-sm text-red-600">{errors.locationName.message}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 border-t border-gray-200 pt-4">
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

