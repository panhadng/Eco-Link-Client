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
  PaperClipIcon,
  DocumentIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";
import { CheckIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import { Message, Room } from "@/types";
import { CreateGroupModal } from "@/components/messages/CreateGroupModal";
import { AddMembersModal } from "@/components/messages/AddMembersModal";
import { ViewMembersModal } from "@/components/messages/ViewMembersModal";
import { ImageViewerModal } from "@/components/messages/ImageViewerModal";

type FilterType = "all" | "unread" | "groups" | "direct";

export default function MessagesPage() {
  const { user } = useAuth();
  const { rooms, loading: roomsLoading, refetch: refetchRooms } = useRooms();
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<(string | null)[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showFileMenu, setShowFileMenu] = useState(false);
  const fileMenuRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const markedMessageIdsRef = useRef<Set<string>>(new Set());
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");

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

  // Filter rooms (Remix-style: All, Unread, Groups, Direct)
  const filteredRooms = (() => {
    let list = [...rooms];
    switch (activeFilter) {
      case "unread":
        list = list.filter((r: Room) => (r.unreadCount ?? 0) > 0);
        break;
      case "groups":
        list = list.filter((r: Room) => r.isGroup);
        break;
      case "direct":
        list = list.filter((r: Room) => !r.isGroup);
        break;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (r: Room) =>
          r.roomName?.toLowerCase().includes(q) ||
          r.lastMessage?.content?.toLowerCase().includes(q)
      );
    }
    return list;
  })();
  const unreadCount = rooms.filter((r: Room) => (r.unreadCount ?? 0) > 0).length;
  
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [showAddMembersModal, setShowAddMembersModal] = useState(false);
  const [showViewMembersModal, setShowViewMembersModal] = useState(false);
  const [showGroupMenu, setShowGroupMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editGroupName, setEditGroupName] = useState("");
  const groupMenuRef = useRef<HTMLDivElement>(null);
  const [viewingImage, setViewingImage] = useState<{ url: string; name?: string } | null>(null);
  
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
    
    if (files.length > 0) {
      setSelectedFiles((prev) => [...prev, ...files]);

      files.forEach((file) => {
        if (file.type.startsWith("image/")) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setFilePreviews((prev) => [...prev, reader.result as string]);
          };
          reader.readAsDataURL(file);
        } else {
          // For non-image files, add null to maintain index alignment
          setFilePreviews((prev) => [...prev, null]);
        }
      });
    }
    
    // Reset input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setShowFileMenu(false);
  };

  const handleFileMenuClick = (fileType: 'image' | 'all') => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = fileType === 'image' ? 'image/*' : '*';
      fileInputRef.current.click();
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setFilePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDownloadFile = async (url: string, name: string) => {
    try {
      // Fetch the file as a blob
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch file');
      }
      const blob = await response.blob();
      
      // Create a blob URL and trigger download
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = name;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Error downloading file:', error);
      // Fallback to opening in new tab if download fails
      window.open(url, '_blank');
    }
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
    <div className="w-full max-w-7xl mx-auto h-full md:h-[calc(100vh-8rem)] rounded-3xl overflow-hidden bg-ambient-gradient p-3 md:p-4 min-h-0 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.12)]">
      <div className="flex h-full max-w-full gap-0 md:gap-4 text-foreground relative overflow-hidden" style={{ touchAction: 'pan-x pan-y' }}>
      {/* Left: conversation list (no container) */}
      <div className={`w-full md:w-[340px] shrink-0 overflow-hidden absolute md:relative inset-0 md:inset-auto z-10 md:z-auto transition-transform duration-300 h-full md:h-auto flex flex-col ${
        selectedRoomId ? "-translate-x-full md:translate-x-0" : "translate-x-0"
      }`}>
        <div className="shrink-0 p-5 pb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-foreground tracking-tight">
              Messages
            </h2>
            <button
              onClick={() => setShowCreateGroupModal(true)}
              className="rounded-full p-2.5 bg-black/5 text-muted-foreground hover:text-foreground hover:bg-black/10 transition-colors"
              title="Create group chat"
            >
              <PlusIcon className="h-5 w-5" />
            </button>
          </div>
          {/* Filter pills - All = solid emerald, Unread = grey + green badge */}
          <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide">
            {[
              { key: "all" as const, label: "All" },
              { key: "unread" as const, label: "Unread" },
              { key: "groups" as const, label: "Groups" },
              { key: "direct" as const, label: "Direct" },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveFilter(key)}
                className={`px-3.5 py-1.5 text-sm font-medium rounded-full transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  activeFilter === key
                    ? "bg-[#2F7D5A] text-white"
                    : "bg-black/5 text-muted-foreground hover:bg-black/8 hover:text-foreground"
                }`}
              >
                {label}
                {key === "unread" && unreadCount > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full min-w-[18px] text-center ${
                    activeFilter === "unread" ? "bg-white/20 text-white" : "bg-[#2F7D5A] text-white"
                  }`}>
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>
          {/* Search - pill-shaped with magnifying glass */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full rounded-full bg-white pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div className="overflow-y-auto flex-1 min-h-0 px-3 pb-4">
          {roomsLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : filteredRooms.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 mb-2" />
              <p>
                {activeFilter === "unread"
                  ? "No unread messages"
                  : activeFilter === "groups"
                    ? "No group chats"
                    : activeFilter === "direct"
                      ? "No direct chats"
                      : searchQuery
                        ? "No results found"
                        : "No conversations yet"}
              </p>
              {!searchQuery && rooms.length === 0 && (
                <p className="text-sm mt-1">Visit a user&apos;s profile to start chatting</p>
              )}
            </div>
          ) : (
            <div className="space-y-0">
              {filteredRooms.map((room: Room) => (
                <button
                  key={room.id}
                  onClick={() => setSelectedRoomId(room.id)}
                  className={`w-full flex items-center gap-3 py-3 px-2 text-left transition-all duration-150 rounded-xl mb-0.5 border-l-[5px] ${
                    selectedRoomId === room.id
                      ? "bg-[rgba(159,207,176,0.22)] border-l-[#2F7D5A]"
                      : "bg-transparent border-l-transparent hover:bg-black/2"
                  }`}
                >
                  <Avatar name={room.roomName} src={room.avatar} size="md" />
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`truncate text-sm ${(room.unreadCount ?? 0) > 0 ? "font-semibold text-foreground" : "font-medium text-foreground"}`}>
                        {room.roomName}
                      </p>
                      <span className={`text-[11px] shrink-0 ${(room.unreadCount ?? 0) > 0 ? "text-primary font-medium" : "text-muted-foreground"}`}>
                        {formatDate(room.lastMessageAt || new Date())}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <p className={`truncate text-[13px] ${(room.unreadCount ?? 0) > 0 ? "text-foreground/80 font-medium" : "text-muted-foreground"}`}>
                        {room.lastMessage?.content || "No messages yet"}
                      </p>
                      {(room.unreadCount ?? 0) > 0 && (
                        <span className="shrink-0 h-5 min-w-[20px] px-1.5 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold flex items-center justify-center">
                          {room.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right: chat area (no container) */}
      <div className={`flex flex-1 flex-col overflow-hidden absolute md:relative inset-0 md:inset-auto z-20 md:z-auto transition-transform duration-300 h-full md:h-auto ${
        selectedRoomId ? "translate-x-0" : "translate-x-full md:translate-x-0"
      }`} style={{ touchAction: 'pan-x pan-y' }}>
        {selectedRoom ? (
          <>
            {/* Chat Header - light, name + Online, chevron/menu on right */}
            <div className="flex items-center gap-3 p-4 rounded-t-2xl bg-transparent">
              <button
                onClick={() => setSelectedRoomId(null)}
                className="md:hidden p-2 -ml-2 hover:bg-accent/50 rounded-xl transition-colors text-foreground"
                aria-label="Back to messages"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
              <Avatar
                name={selectedRoom.roomName}
                src={selectedRoom.avatar}
                size="md"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground truncate">
                    {selectedRoom.roomName}
                  </h3>
                  {isGroupChat && (
                    <UserGroupIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {isGroupChat ? "Group" : "Online"}
                </p>
              </div>
              {!isGroupChat && (
                <ChevronUpIcon className="h-5 w-5 text-muted-foreground shrink-0" aria-hidden />
              )}
              {isGroupChat && (
                <div className="relative" ref={groupMenuRef}>
                  <button
                    onClick={() => setShowGroupMenu(!showGroupMenu)}
                    className="p-2 hover:bg-accent/50 rounded-xl transition-colors text-foreground"
                    aria-label="Group options"
                  >
                    <EllipsisVerticalIcon className="h-5 w-5" />
                  </button>
                  {showGroupMenu && (
                    <div className="absolute right-0 top-full mt-2 w-48 rounded-xl bg-panel shadow-glass border border-border z-10">
                      <button
                        onClick={() => {
                          setShowViewMembersModal(true);
                          setShowGroupMenu(false);
                        }}
                        className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-foreground hover:bg-accent/50 rounded-t-xl"
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
                        className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-foreground hover:bg-accent/50"
                      >
                        <PencilIcon className="h-4 w-4" />
                        Edit Group Name
                      </button>
                      <button
                        onClick={() => {
                          setShowAddMembersModal(true);
                          setShowGroupMenu(false);
                        }}
                        className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-foreground hover:bg-accent/50"
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
                        className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-destructive hover:bg-destructive/10"
                      >
                        <ArrowLeftIcon className="h-4 w-4" />
                        Leave Group
                      </button>
                      <button
                        onClick={() => {
                          setShowDeleteModal(true);
                          setShowGroupMenu(false);
                        }}
                        className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-destructive hover:bg-destructive/10 rounded-b-xl"
                      >
                        <TrashIcon className="h-4 w-4" />
                        Delete Group
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Messages - gradient behind bubbles; bubbles keep their own background */}
            <div className="flex-1 overflow-y-auto p-2 md:p-4 bg-messages-chat-gradient">
              {messagesLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
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
                            <span className="mb-1 text-xs font-medium text-muted-foreground">
                              {message.username}
                            </span>
                          )}
                          <div
                            className={`w-full px-3 md:px-4 py-2.5 text-foreground ${
                              isOwn
                                ? "rounded-[18px_18px_6px_18px] border border-[rgba(159,207,176,0.45)]"
                                : "rounded-[18px_18px_18px_6px] border border-[rgba(157,184,231,0.45)]"
                            }`}
                            style={isOwn ? { backgroundColor: 'rgba(228,241,233,0.95)' } : { backgroundColor: 'rgba(232,240,251,0.95)' }}
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
                                        className="relative overflow-hidden rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                        onClick={() => setViewingImage({ url: file.url, name: file.name })}
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
                                      <button
                                        key={idx}
                                        onClick={() => handleDownloadFile(file.url, file.name)}
                                        className="flex w-full items-center gap-2 rounded-lg bg-accent/50 px-3 py-2 text-sm hover:bg-accent transition-colors text-left border border-border"
                                      >
                                        <PaperClipIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                                        <span className="truncate flex-1 text-foreground font-medium">{file.name}</span>
                                        <ArrowDownTrayIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                                      </button>
                                    )
                                )}
                              </div>
                            )}
                          </div>
                          <div className={`mt-1 flex items-center gap-1 text-[11px] text-muted-foreground ${isOwn ? "flex-row-reverse" : ""}`}>
                            <span>{formatDate(message.date)}</span>
                            {isOwn && <CheckIcon className="h-3.5 w-3.5 text-primary shrink-0" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Message Input - pill-shaped, + in light grey circle left, green send right */}
            <form
              onSubmit={handleSendMessage}
              className="p-2 md:p-4 pb-20 md:pb-4 bg-white/70 backdrop-blur-sm"
            >
              {/* File Previews */}
              {filePreviews.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {filePreviews.map((preview, idx) => {
                    const file = selectedFiles[idx];
                    const isImage = file?.type.startsWith("image/");
                    
                    return (
                      <div key={idx} className="relative">
                        {isImage && preview ? (
                          <div className="relative h-20 w-20 overflow-hidden rounded-xl border border-border">
                            <Image
                              src={preview}
                              alt={`Preview ${idx}`}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="flex h-20 w-20 items-center justify-center rounded-xl border-2 border-border bg-accent/30">
                            <DocumentIcon className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                        <div className="absolute -right-2 -top-2 flex items-center gap-1">
                          {!isImage && file && (
                            <span className="rounded-lg bg-primary px-1.5 py-0.5 text-xs text-primary-foreground">
                              {file.name.length > 8 ? file.name.substring(0, 8) + '...' : file.name}
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => removeFile(idx)}
                            className="rounded-full bg-destructive p-1 text-destructive-foreground hover:bg-destructive/90"
                          >
                            <XMarkIcon className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex gap-2 items-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <div className="relative" ref={fileMenuRef}>
                  <button
                    type="button"
                    onClick={() => setShowFileMenu(!showFileMenu)}
                    className="rounded-full p-2.5 bg-black/5 text-muted-foreground hover:bg-black/10 hover:text-foreground transition-colors shrink-0"
                    disabled={sending}
                    aria-label="Attach"
                  >
                    <PlusIcon className="h-5 w-5" />
                  </button>
                  {showFileMenu && (
                    <div className="absolute bottom-full left-0 mb-2 w-48 rounded-xl bg-panel shadow-glass border border-border z-10">
                      <button
                        type="button"
                        onClick={() => handleFileMenuClick('image')}
                        className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-foreground hover:bg-accent/50 rounded-t-xl"
                      >
                        <PhotoIcon className="h-4 w-4" />
                        Images
                      </button>
                      <button
                        type="button"
                        onClick={() => handleFileMenuClick('all')}
                        className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-foreground hover:bg-accent/50 rounded-b-xl"
                      >
                        <PaperClipIcon className="h-4 w-4" />
                        Attachments/Files
                      </button>
                    </div>
                  )}
                </div>
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 rounded-full bg-white px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
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
                  className="shrink-0 rounded-full h-10 w-10 bg-[#2F7D5A] hover:opacity-90 text-white border-0"
                >
                  <PaperAirplaneIcon className="h-5 w-5" />
                </Button>
              </div>
            </form>
          </>
        ) : (
          <div className="hidden md:flex h-full items-center justify-center text-muted-foreground">
            <div className="text-center">
              <ChatBubbleLeftRightIcon className="mx-auto h-16 w-16 mb-4" />
              <p className="text-lg font-semibold text-foreground">Select a conversation</p>
              <p className="text-sm">
                Choose a chat from the list to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
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

      {/* Image Viewer Modal */}
      {viewingImage && (
        <ImageViewerModal
          isOpen={!!viewingImage}
          onClose={() => setViewingImage(null)}
          imageUrl={viewingImage.url}
          imageName={viewingImage.name}
        />
      )}
    </div>
  );
}
