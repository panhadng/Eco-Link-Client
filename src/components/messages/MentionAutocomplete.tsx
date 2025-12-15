"use client";

import { useQuery } from "@apollo/client";
import { GET_ROOM } from "@/lib/graphql/messages";
import { Avatar } from "@/components/ui/Avatar";
import { User } from "@/types";

interface MentionAutocompleteProps {
  roomId: string;
  searchTerm: string;
  onSelect: (user: User) => void;
  position: { top: number; left: number };
}

export function MentionAutocomplete({ roomId, searchTerm, onSelect, position }: MentionAutocompleteProps) {
  const { data, loading } = useQuery(GET_ROOM, {
    variables: { roomId },
    skip: !roomId,
  });

  const room = data?.Room?.[0];
  const members = room?.users || [];
  
  // Filter members based on search term
  const filteredMembers = members.filter((user: User) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      user.name?.toLowerCase().includes(search) ||
      user.slug?.toLowerCase().includes(search)
    );
  });

  if (loading || filteredMembers.length === 0) {
    return null;
  }

  return (
    <div
      className="absolute z-50 w-64 max-h-48 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg"
      style={{ top: position.top, left: position.left }}
    >
      <div className="py-1">
        {filteredMembers.slice(0, 5).map((user: User) => (
          <button
            key={user.id}
            onClick={() => onSelect(user)}
            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 text-left"
          >
            <Avatar name={user.name} src={user.avatar?.url} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">@{user.slug}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

