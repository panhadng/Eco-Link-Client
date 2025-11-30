'use client';

import { useEffect, useState, useRef } from 'react';
import { useMutation } from '@apollo/client';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { TrashIcon, CameraIcon, XMarkIcon } from '@heroicons/react/24/outline';

import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { UPDATE_GROUP, DELETE_GROUP } from '@/lib/graphql/mutations';
import { GET_GROUPS } from '@/lib/graphql/queries';
import { Group } from '@/types';

interface EditGroupModalProps {
  group: Group | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated?: () => void;
  onDeleted?: () => void;
}

export function EditGroupModal({ group, isOpen, onClose, onUpdated, onDeleted }: EditGroupModalProps) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [about, setAbout] = useState('');
  const [description, setDescription] = useState('');
  const [locationName, setLocationName] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [removeAvatarFlag, setRemoveAvatarFlag] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [updateGroup, { loading }] = useMutation(UPDATE_GROUP);
  const [deleteGroup, { loading: deleteLoading }] = useMutation(DELETE_GROUP);

  useEffect(() => {
    if (!group || !isOpen) {
      return;
    }
    setTimeout(() => {
      setName(group.name ?? '');
      setAbout(group.about ?? '');
      setDescription(group.description ?? '');
      setLocationName(group.locationName ?? '');
    }, 0);
  }, [group, isOpen]);

  useEffect(() => {
    // Clear avatar selection when modal closes
    if (!isOpen) {
      setTimeout(() => {
        setSelectedAvatar(null);
        setAvatarPreview(null);
        setRemoveAvatarFlag(false);
      }, 0);
    }
  }, [isOpen]);

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedAvatar(file);
      setRemoveAvatarFlag(false); // Reset remove flag when selecting new avatar
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAvatar = () => {
    if (avatarPreview || selectedAvatar) {
      // Cancel the upload
      setSelectedAvatar(null);
      setAvatarPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } else if (group?.avatar?.url) {
      // Mark for removal
      setRemoveAvatarFlag(true);
      setSelectedAvatar(null);
      setAvatarPreview(null);
    }
  };

  const handleClose = () => {
    onClose();
    setIsDeleteModalOpen(false);
  };

  const handleDelete = async () => {
    if (!group) return;

    try {
      await deleteGroup({
        variables: { id: group.id },
        refetchQueries: [{ query: GET_GROUPS }],
        awaitRefetchQueries: true,
      });

      toast.success('Group deleted successfully');
      handleClose();
      
      // Small delay to ensure cache is updated before redirect
      setTimeout(() => {
        if (onDeleted) {
          onDeleted();
        } else {
          router.push('/groups');
        }
      }, 100);
    } catch (error) {
      console.error('Failed to delete group', error);
      const message = error instanceof Error ? error.message : 'Failed to delete group';
      toast.error(message);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!group) {
      return;
    }

    try {
      const variables: {
        id: string;
        name?: string;
        about?: string | null;
        description?: string | null;
        locationName?: string | null;
        avatar?: { upload: File; alt: string } | null;
      } = {
        id: group.id,
        name: name.trim() || undefined,
        about: about.trim() || null,
        description: description.trim() || null,
        locationName: locationName.trim() || null,
      };

      if (removeAvatarFlag && !selectedAvatar) {
        // Remove avatar by setting it to null
        variables.avatar = null;
      } else if (selectedAvatar) {
        variables.avatar = {
          upload: selectedAvatar,
          alt: `${name.trim() || group.name}'s avatar`,
        };
      }

      await updateGroup({
        variables,
      });

      toast.success('Group updated successfully');
      if (onUpdated) {
        onUpdated();
      }
      handleClose();
    } catch (error) {
      console.error('Failed to update group', error);
      const message = error instanceof Error ? error.message : 'Failed to update group';
      toast.error(message);
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={handleClose} title="Edit Group" size="lg">
        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Avatar Upload */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              {avatarPreview ? (
                <div className="relative h-32 w-32 overflow-hidden rounded-xl">
                  <Image
                    src={avatarPreview}
                    alt="Avatar preview"
                    fill
                    className="object-cover"
                  />
                </div>
              ) : group?.avatar?.url && !removeAvatarFlag ? (
                <div className="relative h-32 w-32 overflow-hidden rounded-xl">
                  <Image
                    src={group.avatar.url}
                    alt={group.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ) : (
                <Avatar name={group?.name || 'Group'} size="xl" />
              )}
              
              {(avatarPreview || selectedAvatar || (group?.avatar?.url && !removeAvatarFlag)) && (
                <button
                  type="button"
                  onClick={removeAvatar}
                  className="absolute -right-2 -top-2 rounded-full bg-red-500 p-2 text-white hover:bg-red-600"
                  title={avatarPreview || selectedAvatar ? 'Cancel upload' : 'Remove avatar'}
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
              onClick={() => {
                setRemoveAvatarFlag(false); // Reset remove flag when clicking upload
                fileInputRef.current?.click();
              }}
            >
              <CameraIcon className="mr-2 h-5 w-5" />
              {(group?.avatar?.url && !removeAvatarFlag) || avatarPreview ? 'Change Avatar' : 'Upload Avatar'}
            </Button>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Group Name
            </label>
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Enter group name"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              About
            </label>
            <Textarea
              value={about}
              onChange={(event) => setAbout(event.target.value)}
              placeholder="Short summary of the group"
              rows={3}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description
            </label>
            <Textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Full description"
              rows={5}
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Location
            </label>
            <Input
              value={locationName}
              onChange={(event) => setLocationName(event.target.value)}
              placeholder="Optional location"
            />
          </div>

          <div className="flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-700">
            <Button
              type="button"
              variant="destructive"
              onClick={() => setIsDeleteModalOpen(true)}
              disabled={loading || deleteLoading}
              className="border border-gray-300 dark:border-gray-700"
            >
              <TrashIcon className="mr-2 h-4 w-4" />
              Delete Group
            </Button>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={handleClose} disabled={loading || deleteLoading}>
                Cancel
              </Button>
              <Button type="submit" isLoading={loading} disabled={loading || deleteLoading}>
                Save Changes
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Group"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            Are you sure you want to delete <strong>{group?.name}</strong>? This action cannot be undone. All posts, members, and data associated with this group will be permanently removed.
          </p>
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={deleteLoading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              isLoading={deleteLoading}
              disabled={deleteLoading}
            >
              <TrashIcon className="mr-2 h-4 w-4" />
              Delete Group
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
