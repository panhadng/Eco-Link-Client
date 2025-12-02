'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import toast from 'react-hot-toast';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  GET_GROUP_BY_SLUG,
} from '@/lib/graphql/queries';
import {
  GENERATE_GROUP_INVITE_CODE,
  INVALIDATE_INVITE_CODE,
} from '@/lib/graphql/mutations';
import { InviteCode } from '@/types';
import { ClipboardDocumentIcon, TrashIcon, CheckIcon } from '@heroicons/react/24/outline';

interface GroupInvitationsManagementProps {
  groupId: string;
  groupSlug: string;
}

export function GroupInvitationsManagement({ groupId, groupSlug }: GroupInvitationsManagementProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [comment, setComment] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const { data, loading, refetch } = useQuery(GET_GROUP_BY_SLUG, {
    variables: { slug: groupSlug },
    fetchPolicy: 'cache-and-network',
  });

  const [generateInvite, { loading: generating }] = useMutation(GENERATE_GROUP_INVITE_CODE, {
    refetchQueries: [{ query: GET_GROUP_BY_SLUG, variables: { slug: groupSlug } }],
  });

  const [invalidateInvite, { loading: invalidating }] = useMutation(INVALIDATE_INVITE_CODE, {
    refetchQueries: [{ query: GET_GROUP_BY_SLUG, variables: { slug: groupSlug } }],
  });

  const group = data?.Group?.[0];
  const inviteCodes: InviteCode[] = group?.inviteCodes || [];

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
        toast.success('Invite link created successfully!');
        setShowCreateForm(false);
        setComment('');
        setExpiresAt('');
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to generate invite code');
    }
  };

  const handleCopyInviteLink = async (code: string) => {
    const inviteLink = `${window.location.origin}/register?method=invite-code&inviteCode=${code}`;
    
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopiedCode(code);
      toast.success('Invite link copied to clipboard!');
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (error) {
      toast.error('Failed to copy invite link');
    }
  };

  const handleInvalidateInvite = async (code: string) => {
    if (!confirm('Are you sure you want to invalidate this invite code? It will no longer be usable.')) {
      return;
    }

    try {
      await invalidateInvite({
        variables: { code },
      });
      toast.success('Invite code invalidated');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to invalidate invite code');
    }
  };

  const isExpired = (inviteCode: InviteCode) => {
    if (!inviteCode.expiresAt) return false;
    return new Date(inviteCode.expiresAt) < new Date();
  };

  const isValid = (inviteCode: InviteCode) => {
    if (inviteCode.isValid === false) return false;
    return !isExpired(inviteCode);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Invitations</h2>
          <p className="mt-1 text-sm text-gray-500">
            Create and manage invite links for your group. Share these links to invite new members.
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(!showCreateForm)} disabled={generating}>
          {showCreateForm ? 'Cancel' : 'Create Invite Link'}
        </Button>
      </div>

      {/* Create Invite Form */}
      {showCreateForm && (
        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Create New Invite Link</h3>
          <form onSubmit={handleGenerateInvite} className="space-y-4">
            <Input
              label="Comment (optional)"
              type="text"
              placeholder="e.g., Event invite, Special promotion"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />

            <Input
              label="Expires At (optional)"
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
            />

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={generating} isLoading={generating}>
                Generate Invite Link
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Existing Invite Codes */}
      {inviteCodes.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-500">No invite codes created yet.</p>
          <p className="mt-2 text-sm text-gray-400">
            Click &quot;Create Invite Link&quot; to generate your first invite code.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {inviteCodes.map((inviteCode) => {
            const inviteLink = `${window.location.origin}/register?method=invite-code&inviteCode=${inviteCode.code}`;
            const expired = isExpired(inviteCode);
            const valid = isValid(inviteCode);

            return (
              <Card key={inviteCode.code} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <code className="rounded-md bg-gray-100 px-2 py-1 text-sm font-mono text-gray-900">
                        {inviteCode.code}
                      </code>
                      {valid && (
                        <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                          Active
                        </span>
                      )}
                      {expired && (
                        <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
                          Expired
                        </span>
                      )}
                      {!valid && !expired && (
                        <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800">
                          Invalid
                        </span>
                      )}
                    </div>

                    <div className="text-sm text-gray-600">
                      <p>
                        Created: {inviteCode.createdAt ? new Date(inviteCode.createdAt).toLocaleDateString() : 'Unknown'}
                      </p>
                      {inviteCode.expiresAt && (
                        <p>
                          Expires: {new Date(inviteCode.expiresAt).toLocaleDateString()}
                        </p>
                      )}
                      <p>Used: {inviteCode.redeemedByCount || 0} time{(inviteCode.redeemedByCount || 0) !== 1 ? 's' : ''}</p>
                      {inviteCode.comment && (
                        <p className="mt-1 italic">&quot;{inviteCode.comment}&quot;</p>
                      )}
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                      <Input
                        type="text"
                        readOnly
                        value={inviteLink}
                        className="flex-1 font-mono text-sm"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyInviteLink(inviteCode.code)}
                        title="Copy invite link"
                      >
                        {copiedCode === inviteCode.code ? (
                          <CheckIcon className="h-4 w-4 text-green-600" />
                        ) : (
                          <ClipboardDocumentIcon className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleInvalidateInvite(inviteCode.code)}
                    disabled={invalidating || expired || !valid}
                    title="Invalidate this invite code"
                  >
                    <TrashIcon className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

