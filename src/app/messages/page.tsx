"use client";

import { useState, useEffect, useRef } from "react";
import { useMutation, useSubscription } from "@apollo/client";
import { useRooms, useMessages, useCreateMessage } from "@/hooks/useMessages";
import { useAuth } from "@/context/AuthContext";
import {
  MARK_MESSAGES_AS_SEEN,
  MESSAGE_ADDED_SUBSCRIPTION,
  UPDATE_ROOM_NAME,
  LEAVE_ROOM,
  DELETE_ROOM,
} from "@/lib/graphql/messages";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";
import { PaperAirplaneIcon } from "@heroicons/react/24/solid";
import {
  ChatBubbleLeftRightIcon,
  PhotoIcon,
  XMarkIcon,
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  EllipsisVerticalIcon,
  UserGroupIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import { Message, Room } from "@/types";
import { CreateGroupModal } from "@/components/messages/CreateGroupModal";
import { AddMembersModal } from "@/components/messages/AddMembersModal";
import { ViewMembersModal } from "@/components/messages/ViewMembersModal";

export default function MessagesPage() {
  const { user } = useAuth();
  const { rooms, loading: roomsLoading, refetch: refetchRooms } = useRooms();
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const markedMessageIdsRef = useRef<Set<string>>(new Set());

  const {
    messages,
    loading: messagesLoading,
    refetch: refetchMessages,
  } = useMessages(selectedRoomId || "");
  const { createMessage, loading: sending } = useCreateMessage(
    selectedRoomId || ""
  );
  const [markMessagesAsSeen] = useMutation(MARK_MESSAGES_AS_SEEN);

  const selectedRoom = rooms.find((r: Room) => r.id === selectedRoomId);
  const isGroupChat = selectedRoom?.isGroup;
  
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [showAddMembersModal, setShowAddMembersModal] = useState(false);
  const [showViewMembersModal, setShowViewMembersModal] = useState(false);
  const [showGroupMenu, setShowGroupMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editGroupName, setEditGroupName] = useState("");
  const groupMenuRef = useRef<HTMLDivElement>(null);
  
  const [updateRoomName] = useMutation(UPDATE_ROOM_NAME);
  const [leaveRoom] = useMutation(LEAVE_ROOM);
  const [deleteRoom] = useMutation(DELETE_ROOM);

  // Subscribe to new messages
  const { data: subscriptionData, error: subError } = useSubscription(
    MESSAGE_ADDED_SUBSCRIPTION
  );

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Track processed subscription message IDs to prevent duplicate refetches
  const processedSubscriptionIdsRef = useRef<Set<string>>(new Set());
  
  // Initialize processed IDs with current messages when room changes or messages load
  useEffect(() => {
    if (selectedRoomId && messages.length > 0) {
      // Clear and repopulate with current message IDs
      processedSubscriptionIdsRef.current = new Set(messages.map((msg: Message) => msg.id).filter(Boolean));
    } else if (!selectedRoomId) {
      // Clear when no room is selected
      processedSubscriptionIdsRef.current.clear();
    }
  }, [selectedRoomId, messages.length]); // Update when room changes or message count changes
  
  // Refetch messages when new message arrives via subscription
  // IMPORTANT: In group chats, we skip refetch to prevent duplicates since messages are already in cache
  useEffect(() => {
    if (subscriptionData?.chatMessageAdded) {
      const newMessage = subscriptionData.chatMessageAdded;
      const messageId = newMessage?.id;
      
      // Skip if we've already processed this message ID (prevent duplicate refetches)
      if (messageId && processedSubscriptionIdsRef.current.has(messageId)) {
        return;
      }
      
      // Only refetch if message is for current room and not from current user
      // (our own messages are already added via mutation)
      const messageRoomId = newMessage?.room?.id;
      const isForCurrentRoom = selectedRoomId && messageRoomId === selectedRoomId;
      const isFromCurrentUser = newMessage?.senderId === user?.id;
      
      // Check if message already exists in current messages (prevent duplicate refetch)
      const messageExists = messages.some((msg: Message) => msg.id === messageId);
      
      if (isForCurrentRoom && !isFromCurrentUser && !messageExists) {
        // Mark as processed before refetch
        if (messageId) {
          processedSubscriptionIdsRef.current.add(messageId);
        }
        
        refetchMessages();
        refetchRooms();
      } else if (!isForCurrentRoom) {
        // Just update rooms for other rooms
        refetchRooms();
      } else if (messageExists) {
        // Message already exists, mark as processed but don't refetch
        if (messageId) {
          processedSubscriptionIdsRef.current.add(messageId);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subscriptionData, refetchMessages, refetchRooms, selectedRoomId, user?.id]);

  useEffect(() => {
    markedMessageIdsRef.current = new Set();
  }, [selectedRoomId]);

  useEffect(() => {
    if (!selectedRoomId || !user || messages.length === 0) {
      return;
    }

    const unseenMessages = messages.filter(
      (message: Message) => !message.seen && message.senderId !== user.id
    );

    if (unseenMessages.length === 0) {
      return;
    }

    const newMessageIds = unseenMessages
      .map((message: Message) => message.id)
      .filter((id: string) => !markedMessageIdsRef.current.has(id));

    if (newMessageIds.length === 0) {
      return;
    }

    newMessageIds.forEach((id: string) => markedMessageIdsRef.current.add(id));

    markMessagesAsSeen({ variables: { messageIds: newMessageIds } })
      .then(() => {
        void Promise.all([refetchMessages(), refetchRooms()]);
      })
      .catch((error) => {
        console.error("Failed to mark messages as seen", error);
        newMessageIds.forEach((id: string) => markedMessageIdsRef.current.delete(id));
      });
  }, [messages, selectedRoomId, user, markMessagesAsSeen, refetchMessages, refetchRooms]);

  useEffect(() => {
    if (subError) {
      console.error("❌ Subscription error:", subError);
    }
  }, [subError]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    if (imageFiles.length > 0) {
      setSelectedFiles((prev) => [...prev, ...imageFiles]);

      imageFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreviews((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setFilePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedMessage = messageText.trim();

    if ((!trimmedMessage && selectedFiles.length === 0) || !selectedRoomId)
      return;

    try {
      const variables: {
        roomId: string;
        content?: string;
        files?: Array<{ upload: File; type: string; name: string }>;
      } = {
        roomId: selectedRoomId,
      };

      if (trimmedMessage) {
        variables.content = trimmedMessage;
      }

      if (selectedFiles.length > 0) {
        variables.files = selectedFiles.map((file) => ({
          upload: file,
          type: file.type,
          name: file.name,
        }));

        if (!trimmedMessage) {
          variables.content = '';
        }
      }

      await createMessage({ variables });
      setMessageText("");
      setSelectedFiles([]);
      setFilePreviews([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="flex h-full md:h-[calc(100vh-8rem)] max-w-full gap-0 md:gap-4 text-gray-900 relative overflow-hidden" style={{ touchAction: 'pan-x pan-y' }}>
      {/* Room List */}
      <div className={`w-full md:w-96 shrink-0 overflow-hidden absolute md:relative inset-0 md:inset-auto z-10 md:z-auto transition-transform duration-300 h-full md:h-auto flex flex-col bg-white ${
        selectedRoomId ? "-translate-x-full md:translate-x-0" : "translate-x-0"
      } ${!selectedRoomId ? "md:rounded-lg md:border md:border-gray-200 md:shadow-sm" : ""}`}>
        <div className="border-b border-gray-200 p-4 shrink-0 flex items-center justify-between" style={{ backgroundColor: '#0c0c6d' }}>
          <h2 className="text-lg font-semibold text-white">
            Messages
          </h2>
          <button
            onClick={() => setShowCreateGroupModal(true)}
            className="rounded-lg p-2 text-white hover:bg-white/10 transition-colors"
            title="Create group chat"
          >
            <PlusIcon className="h-5 w-5" />
          </button>
        </div>

        <div
          className="overflow-y-auto flex-1 min-h-0"
        >
          {roomsLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : rooms.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 mb-2" />
              <p>No conversations yet</p>
              <p className="text-sm mt-1">
                Visit a user&apos;s profile to start chatting
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {rooms.map((room: Room) => (
                <button
                  key={room.id}
                  onClick={() => setSelectedRoomId(room.id)}
                  className={`flex w-full items-start gap-3 p-4 text-left transition-colors ${
                    selectedRoomId === room.id
                      ? "bg-gray-200"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <Avatar name={room.roomName} src={room.avatar} size="md" />
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center justify-between">
                      <p className="truncate font-semibold text-gray-900">
                        {room.roomName}
                      </p>
                      {room.unreadCount > 0 && (
                        <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                          {room.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="truncate text-sm text-gray-500">
                      {room.lastMessage?.content || "No messages yet"}
                    </p>
                    {room.lastMessageAt && (
                      <p className="text-xs text-gray-400">
                        {formatDate(room.lastMessageAt)}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex flex-1 flex-col overflow-hidden absolute md:relative inset-0 md:inset-auto z-20 md:z-auto transition-transform duration-300 h-full md:h-auto bg-white ${
        selectedRoomId ? "translate-x-0" : "translate-x-full md:translate-x-0"
      } ${selectedRoomId ? "md:rounded-lg md:border md:border-gray-200 md:shadow-sm" : ""}`} style={{ touchAction: 'pan-x pan-y' }}>
        {selectedRoom ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center gap-3 border-b border-gray-200 p-4" style={{ backgroundColor: '#0c0c6d' }}>
              <button
                onClick={() => setSelectedRoomId(null)}
                className="md:hidden p-2 -ml-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Back to messages"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
              <Avatar
                name={selectedRoom.roomName}
                src={selectedRoom.avatar}
                size="md"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-white">
                    {selectedRoom.roomName}
                  </h3>
                  {isGroupChat && (
                    <UserGroupIcon className="h-4 w-4 text-white/80" />
                  )}
                </div>
              </div>
              {isGroupChat && (
                <div className="relative" ref={groupMenuRef}>
                  <button
                    onClick={() => setShowGroupMenu(!showGroupMenu)}
                    className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                    aria-label="Group options"
                  >
                    <EllipsisVerticalIcon className="h-5 w-5" />
                  </button>
                  {showGroupMenu && (
                    <div className="absolute right-0 top-full mt-2 w-48 rounded-lg bg-white shadow-lg border border-gray-200 z-10">
                      <button
                        onClick={() => {
                          setShowViewMembersModal(true);
                          setShowGroupMenu(false);
                        }}
                        className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <UserGroupIcon className="h-4 w-4" />
                        View Members
                      </button>
                      <button
                        onClick={() => {
                          setEditGroupName(selectedRoom.groupName || selectedRoom.roomName);
                          setShowEditModal(true);
                          setShowGroupMenu(false);
                        }}
                        className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <PencilIcon className="h-4 w-4" />
                        Edit Group Name
                      </button>
                      <button
                        onClick={() => {
                          setShowAddMembersModal(true);
                          setShowGroupMenu(false);
                        }}
                        className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <PlusIcon className="h-4 w-4" />
                        Add Members
                      </button>
                      <button
                        onClick={async () => {
                          if (confirm("Are you sure you want to leave this group?")) {
                            try {
                              await leaveRoom({ variables: { roomId: selectedRoomId } });
                              setSelectedRoomId(null);
                              refetchRooms();
                            } catch (error) {
                              console.error("Error leaving room:", error);
                            }
                          }
                          setShowGroupMenu(false);
                        }}
                        className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                      >
                        <ArrowLeftIcon className="h-4 w-4" />
                        Leave Group
                      </button>
                      <button
                        onClick={() => {
                          setShowDeleteModal(true);
                          setShowGroupMenu(false);
                        }}
                        className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                      >
                        <TrashIcon className="h-4 w-4" />
                        Delete Group
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-2 md:p-4">
              {messagesLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {(() => {
                    // Final safety check: deduplicate by ID (in case duplicates somehow slip through)
                    const seenIds = new Set<string>();
                    return messages.filter((msg: Message) => {
                      if (!msg?.id || seenIds.has(msg.id)) {
                        return false;
                      }
                      seenIds.add(msg.id);
                      return true;
                    });
                  })().map((message: Message) => {
                    const isOwn = message.senderId === user?.id;
                    return (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${isOwn ? "flex-row-reverse" : ""}`}
                      >
                        <Avatar
                          name={message.username}
                          src={message.avatar}
                          size="sm"
                        />
                        <div
                          className={`flex flex-col ${isOwn ? "items-end" : ""} max-w-[85%] md:max-w-md`}
                        >
                          {/* Show sender name in group chats for messages not from current user */}
                          {isGroupChat && !isOwn && (
                            <span className="mb-1 text-xs font-medium text-gray-600">
                              {message.username}
                            </span>
                          )}
                          <div
                            className={`w-full rounded-lg px-3 md:px-4 py-2 ${
                              isOwn
                                ? "text-white"
                                : "text-white"
                            }`}
                            style={isOwn ? { backgroundColor: '#0c0c6d' } : { backgroundColor: '#52ba00' }}
                          >
                            {message.content && (
                              <p className="whitespace-pre-wrap wrap-break-word text-sm md:text-base">
                                {message.content}
                              </p>
                            )}

                            {/* Display attached images */}
                            {message.files && message.files.length > 0 && (
                              <div
                                className={`space-y-2 ${message.content ? "mt-2" : ""}`}
                              >
                                {message.files.map(
                                  (
                                    file: {
                                      url: string;
                                      name: string;
                                      type: string;
                                    },
                                    idx: number
                                  ) =>
                                    file.type?.startsWith("image/") ? (
                                      <div
                                        key={idx}
                                        className="relative overflow-hidden rounded-lg image-zoomable"
                                      >
                                        <Image
                                          src={file.url}
                                          alt={file.name || "Image"}
                                          width={300}
                                          height={200}
                                          className="object-cover w-full h-auto"
                                          unoptimized
                                        />
                                      </div>
                                    ) : (
                                      <a
                                        key={idx}
                                        href={file.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block rounded bg-gray-200 px-3 py-2 text-sm hover:bg-gray-300"
                                      >
                                        📎 {file.name}
                                      </a>
                                    )
                                )}
                              </div>
                            )}
                          </div>
                          <span className="mt-1 text-xs text-gray-500">
                            {formatDate(message.date)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Message Input */}
            <form
              onSubmit={handleSendMessage}
              className="border-t border-gray-200 p-2 md:p-4 pb-20 md:pb-4"
            >
              {/* File Previews */}
              {filePreviews.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {filePreviews.map((preview, idx) => (
                    <div key={idx} className="relative">
                      <div className="relative h-20 w-20 overflow-hidden rounded-lg">
                        <Image
                          src={preview}
                          alt={`Preview ${idx}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(idx)}
                        className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                      >
                        <XMarkIcon className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-full p-2 text-gray-600 hover:bg-gray-100"
                  disabled={sending}
                >
                  <PhotoIcon className="h-5 w-5" />
                </button>
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 rounded-full border border-gray-300 bg-gray-50 px-4 py-2 text-sm text-gray-900 light:text-black focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
                  disabled={sending}
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={
                    (!messageText.trim() && selectedFiles.length === 0) ||
                    sending
                  }
                  isLoading={sending}
                >
                  <PaperAirplaneIcon className="h-5 w-5" />
                </Button>
              </div>
            </form>
          </>
        ) : (
          <div className="hidden md:flex h-full items-center justify-center text-gray-500">
            <div className="text-center">
              <ChatBubbleLeftRightIcon className="mx-auto h-16 w-16 mb-4" />
              <p className="text-lg font-semibold">Select a conversation</p>
              <p className="text-sm">
                Choose a chat from the list to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
      
      {/* Edit Group Name Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl mx-4">
            <h3 className="mb-4 text-lg font-semibold">Edit Group Name</h3>
            <input
              type="text"
              value={editGroupName}
              onChange={(e) => setEditGroupName(e.target.value)}
              placeholder="Group name"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 mb-4"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditGroupName("");
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!editGroupName.trim()) return;
                  try {
                    await updateRoomName({
                      variables: { roomId: selectedRoomId, groupName: editGroupName.trim() },
                    });
                    refetchRooms();
                    setShowEditModal(false);
                    setEditGroupName("");
                  } catch (error) {
                    console.error("Error updating room name:", error);
                  }
                }}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Group Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl mx-4">
            <h3 className="mb-4 text-lg font-semibold">Delete Group</h3>
            <p className="mb-4 text-gray-700">
              Are you sure you want to delete &quot;{selectedRoom?.roomName}&quot;? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    await deleteRoom({ variables: { roomId: selectedRoomId } });
                    setSelectedRoomId(null);
                    refetchRooms();
                    setShowDeleteModal(false);
                  } catch (error) {
                    console.error("Error deleting room:", error);
                  }
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Group Modal */}
      <CreateGroupModal
        isOpen={showCreateGroupModal}
        onClose={() => setShowCreateGroupModal(false)}
        onSuccess={() => {
          refetchRooms();
          setShowCreateGroupModal(false);
        }}
      />

      {/* Add Members Modal */}
      {selectedRoomId && (
        <AddMembersModal
          isOpen={showAddMembersModal}
          onClose={() => setShowAddMembersModal(false)}
          roomId={selectedRoomId}
        />
      )}

      {/* View Members Modal */}
      {selectedRoomId && (
        <ViewMembersModal
          isOpen={showViewMembersModal}
          onClose={() => setShowViewMembersModal(false)}
          roomId={selectedRoomId}
        />
      )}
    </div>
  );
}
