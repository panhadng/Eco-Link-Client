"use client";

import { useQuery } from "@apollo/client";
import { XMarkIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import { Avatar } from "@/components/ui/Avatar";
import { GET_ROOM } from "@/lib/graphql/messages";
import { useAuth } from "@/context/AuthContext";

interface ViewMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: string;
}

export function ViewMembersModal({ isOpen, onClose, roomId }: ViewMembersModalProps) {
  const { user: currentUser } = useAuth();
  
  const { data, loading, error } = useQuery(GET_ROOM, {
    variables: { roomId },
    skip: !isOpen || !roomId,
  });

  const room = data?.Room?.[0];
  const members = room?.users || [];
  const memberCount = members.length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md max-h-[80vh] rounded-lg bg-white shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <UserGroupIcon className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Group Members</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">
              <p>Failed to load members</p>
              <p className="text-sm text-gray-500 mt-2">{error.message}</p>
            </div>
          ) : (
            <>
              {/* Member Count */}
              <div className="mb-4 pb-4 border-b border-gray-200">
                <p className="text-sm font-medium text-gray-700">
                  {memberCount} {memberCount === 1 ? "member" : "members"}
                </p>
              </div>

              {/* Members List */}
              <div className="space-y-2">
                {members.map((member: any) => {
                  const isCurrentUser = member.id === currentUser?.id;
                  return (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Avatar
                        name={member.name}
                        src={member.avatar?.url}
                        size="md"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {member.name}
                          {isCurrentUser && (
                            <span className="ml-2 text-xs text-gray-500">(You)</span>
                          )}
                        </p>
                        <p className="text-xs text-gray-500 truncate">@{member.slug}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

