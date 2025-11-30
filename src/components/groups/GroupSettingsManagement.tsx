'use client';

import { useState } from 'react';
import { useMutation } from '@apollo/client';
import toast from 'react-hot-toast';
import { Group } from '@/types';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { UPDATE_GROUP } from '@/lib/graphql/mutations';

interface GroupSettingsManagementProps {
  group: Group;
  onUpdated?: () => void;
}

export function GroupSettingsManagement({ group, onUpdated }: GroupSettingsManagementProps) {
  const [name, setName] = useState(group.name || '');
  const [about, setAbout] = useState(group.about || '');
  const [description, setDescription] = useState(group.description || '');
  const [locationName, setLocationName] = useState(group.locationName || '');

  const [updateGroup, { loading }] = useMutation(UPDATE_GROUP);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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

      toast.success('Group settings updated successfully!');
      if (onUpdated) {
        onUpdated();
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update group settings');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Group Settings</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Update your group information, description, and other settings.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Group Name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            About (Short description)
          </label>
          <Textarea
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            rows={3}
            className="mt-1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Description
          </label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
            required
            className="mt-1"
          />
        </div>

        <Input
          label="Location"
          type="text"
          value={locationName}
          onChange={(e) => setLocationName(e.target.value)}
          placeholder="e.g., New York, USA"
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={loading} isLoading={loading}>
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}

