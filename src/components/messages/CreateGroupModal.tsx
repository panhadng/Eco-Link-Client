"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { XMarkIcon, MagnifyingGlassIcon, CheckIcon } from "@heroicons/react/24/outline";
import { Avatar } from "@/components/ui/Avatar";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { CREATE_ROOM, GET_ROOMS } from "@/lib/graphql/messages";
import { SEARCH_USERS } from "@/lib/graphql/queries";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import { User } from "@/types";

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateGroupModal({ isOpen, onClose, onSuccess }: CreateGroupModalProps) {
  const { user: currentUser } = useAuth();
  const [groupName, setGroupName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

  const { data: searchData, loading: searching } = useQuery(SEARCH_USERS, {
    variables: { term: searchTerm, first: 10, offset: 0 },
    skip: !searchTerm || searchTerm.length < 2,
  });

  const [createRoom, { loading: creating }] = useMutation(CREATE_ROOM, {
    refetchQueries: [{ query: GET_ROOMS }],
    onCompleted: () => {
      toast.success("Group chat created!");
      handleClose();
      onSuccess();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create group chat");
    },
  });

  const searchResults: User[] = searchData?.User?.filter(
    (user: User) => user.id !== currentUser?.id && !selectedUsers.find((u) => u.id === user.id)
  ) || [];

  const handleClose = () => {
    setGroupName("");
    setSearchTerm("");
    setSelectedUsers([]);
    onClose();
  };

  const handleToggleUser = (user: User) => {
    if (selectedUsers.find((u) => u.id === user.id)) {
      setSelectedUsers(selectedUsers.filter((u) => u.id !== user.id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const handleCreate = async () => {
    if (!groupName.trim()) {
      toast.error("Group name is required");
      return;
    }

    if (selectedUsers.length === 0) {
      toast.error("Please add at least one member");
      return;
    }

    try {
      await createRoom({
        variables: {
          groupName: groupName.trim(),
          userIds: selectedUsers.map((u) => u.id),
        },
      });
    } catch (error) {
      // Error is handled by onError callback
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-2xl max-h-[90vh] rounded-lg bg-white shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Create Group Chat</h2>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Group Name Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Group Name <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name"
              className="w-full"
            />
          </div>

          {/* Search Users */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add Members
            </label>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search for users..."
                className="w-full pl-10"
              />
            </div>

            {/* Search Results */}
            {searchTerm.length >= 2 && (
              <div className="mt-2 border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
                {searching ? (
                  <div className="p-4 text-center text-gray-500">Searching...</div>
                ) : searchResults.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">No users found</div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {searchResults.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => handleToggleUser(user)}
                        className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 text-left"
                      >
                        <Avatar name={user.name} src={user.avatar?.url} size="sm" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {user.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">@{user.slug}</p>
                        </div>
                        {selectedUsers.find((u) => u.id === user.id) && (
                          <CheckIcon className="h-5 w-5 text-primary shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Selected Users */}
          {selectedUsers.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selected Members ({selectedUsers.length})
              </label>
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1"
                  >
                    <Avatar name={user.name} src={user.avatar?.url} size="sm" />
                    <span className="text-sm text-gray-700">{user.name}</span>
                    <button
                      onClick={() => handleToggleUser(user)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-4 border-t border-gray-200">
          <Button variant="outline" onClick={handleClose} disabled={creating}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={creating || !groupName.trim() || selectedUsers.length === 0} isLoading={creating}>
            Create Group
          </Button>
        </div>
      </div>
    </div>
  );
}

