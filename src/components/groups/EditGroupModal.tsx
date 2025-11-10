'use client';

import { useEffect, useState } from 'react';
import { useMutation } from '@apollo/client';
import toast from 'react-hot-toast';

import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { UPDATE_GROUP } from '@/lib/graphql/mutations';
import { Group } from '@/types';

interface EditGroupModalProps {
  group: Group | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated?: () => void;
}

export function EditGroupModal({ group, isOpen, onClose, onUpdated }: EditGroupModalProps) {
  const [name, setName] = useState('');
  const [about, setAbout] = useState('');
  const [description, setDescription] = useState('');
  const [locationName, setLocationName] = useState('');

  const [updateGroup, { loading }] = useMutation(UPDATE_GROUP);

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

  const handleClose = () => {
    onClose();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!group) {
      return;
    }

    try {
      await updateGroup({
        variables: {
          id: group.id,
          name: name.trim() || null,
          about: about.trim() || null,
          description: description.trim() || null,
          locationName: locationName.trim() || null,
        },
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
    <Modal isOpen={isOpen} onClose={handleClose} title="Edit Group" size="lg">
      <form className="space-y-4" onSubmit={handleSubmit}>
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

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
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
