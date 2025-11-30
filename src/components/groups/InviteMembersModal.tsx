'use client';

import { useState } from 'react';
import { useMutation } from '@apollo/client';
import toast from 'react-hot-toast';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { GENERATE_GROUP_INVITE_CODE } from '@/lib/graphql/mutations';
import { GET_GROUP_BY_SLUG } from '@/lib/graphql/queries';
import { ClipboardDocumentIcon, CheckIcon, LinkIcon } from '@heroicons/react/24/outline';

interface InviteMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  groupSlug: string;
  groupName: string;
}

export function InviteMembersModal({
  isOpen,
  onClose,
  groupId,
  groupSlug,
  groupName,
}: InviteMembersModalProps) {
  const [comment, setComment] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [generatedInviteCode, setGeneratedInviteCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [generateInvite, { loading: generating }] = useMutation(GENERATE_GROUP_INVITE_CODE, {
    refetchQueries: [{ query: GET_GROUP_BY_SLUG, variables: { slug: groupSlug } }],
  });

  const handleGenerateInvite = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const result = await generateInvite({
        variables: {
          groupId,
          comment: comment.trim() || null,
          expiresAt: expiresAt || null,
        },
      });

      if (result.data?.generateGroupInviteCode) {
        setGeneratedInviteCode(result.data.generateGroupInviteCode.code);
        toast.success('Invite link created successfully!');
        // Clear form
        setComment('');
        setExpiresAt('');
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to generate invite code');
    }
  };

  const inviteLink = generatedInviteCode
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/register?method=invite-code&inviteCode=${generatedInviteCode}`
    : '';

  const handleCopyInviteLink = async () => {
    if (!inviteLink) return;

    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      toast.success('Invite link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy invite link');
    }
  };

  const handleClose = () => {
    setGeneratedInviteCode(null);
    setComment('');
    setExpiresAt('');
    setCopied(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Invite Members" size="md">
      <div className="space-y-6">
        {!generatedInviteCode ? (
          <form onSubmit={handleGenerateInvite} className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Create an invite link for <strong>{groupName}</strong>. Share this link with people you want to invite to join the group.
            </p>

            <div>
              <Input
                label="Comment (optional)"
                type="text"
                placeholder="e.g., Event invite, Special promotion"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <p className="mt-1 text-xs text-gray-500">Optional note about this invite</p>
            </div>

            <div>
              <Input
                label="Expires At (optional)"
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
              />
              <p className="mt-1 text-xs text-gray-500">Leave empty for no expiration</p>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={handleClose} disabled={generating}>
                Cancel
              </Button>
              <Button type="submit" disabled={generating} isLoading={generating}>
                <LinkIcon className="mr-2 h-4 w-4" />
                Generate Invite Link
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
              <p className="text-sm font-medium text-green-800 dark:text-green-400">
                Invite link created successfully!
              </p>
              <p className="mt-1 text-xs text-green-700 dark:text-green-500">
                Copy and share this link with people you want to invite.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Invite Link
              </label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  readOnly
                  value={inviteLink}
                  className="flex-1 font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyInviteLink}
                  title="Copy invite link"
                >
                  {copied ? (
                    <CheckIcon className="h-4 w-4 text-green-600" />
                  ) : (
                    <ClipboardDocumentIcon className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setGeneratedInviteCode(null);
                  setComment('');
                  setExpiresAt('');
                }}
              >
                Create Another Link
              </Button>
              <Button onClick={handleClose}>
                Done
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

