'use client';

import { useState, useEffect, useRef } from 'react';
import { useSubscription } from '@apollo/client';
import { useRooms, useMessages, useCreateMessage } from '@/hooks/useMessages';
import { useAuth } from '@/context/AuthContext';
import { MESSAGE_ADDED_SUBSCRIPTION } from '@/lib/graphql/messages';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { formatDate } from '@/lib/utils';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';
import { ChatBubbleLeftRightIcon, PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

export default function MessagesPage() {
  const { user } = useAuth();
  const { rooms, loading: roomsLoading, refetch: refetchRooms } = useRooms();
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, loading: messagesLoading, refetch: refetchMessages } = useMessages(selectedRoomId || '');
  const { createMessage, loading: sending } = useCreateMessage(selectedRoomId || '');

  const selectedRoom = rooms.find((r: any) => r.id === selectedRoomId);

  // Subscribe to new messages
  const { data: subscriptionData, error: subError } = useSubscription(MESSAGE_ADDED_SUBSCRIPTION);

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Refetch messages when new message arrives via subscription
  useEffect(() => {
    if (subscriptionData?.chatMessageAdded) {
      console.log('🔔 New message received via WebSocket:', subscriptionData.chatMessageAdded);
      refetchMessages();
      refetchRooms();
    }
  }, [subscriptionData, refetchMessages, refetchRooms]);

  useEffect(() => {
    if (subError) {
      console.error('❌ Subscription error:', subError);
    }
  }, [subError]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...imageFiles]);
      
      imageFiles.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setFilePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!messageText.trim() && selectedFiles.length === 0) || !selectedRoomId) return;

    try {
      const variables: {
        roomId: string;
        content?: string;
        files?: Array<{ upload: File; type: string; name: string }>;
      } = {
        roomId: selectedRoomId,
      };

      if (messageText.trim()) {
        variables.content = messageText.trim();
      }

      if (selectedFiles.length > 0) {
        variables.files = selectedFiles.map(file => ({
          upload: file,
          type: file.type,
          name: file.name,
        }));
      }

      await createMessage({ variables });
      setMessageText('');
      setSelectedFiles([]);
      setFilePreviews([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4 max-w-full">
      {/* Room List */}
      <Card className="w-96 flex-shrink-0 overflow-hidden">
        <div className="border-b border-gray-200 p-4 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Messages</h2>
        </div>

        <div className="overflow-y-auto" style={{ height: 'calc(100% - 4rem)' }}>
          {roomsLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
            </div>
          ) : rooms.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 mb-2" />
              <p>No conversations yet</p>
              <p className="text-sm mt-1">Visit a user&apos;s profile to start chatting</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-800">
              {rooms.map((room: any) => (
                <button
                  key={room.id}
                  onClick={() => setSelectedRoomId(room.id)}
                  className={`flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${
                    selectedRoomId === room.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  <Avatar name={room.roomName} src={room.avatar} size="md" />
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center justify-between">
                      <p className="truncate font-semibold text-gray-900 dark:text-white">
                        {room.roomName}
                      </p>
                      {room.unreadCount > 0 && (
                        <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs text-white">
                          {room.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                      {room.lastMessage?.content || 'No messages yet'}
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
      </Card>

      {/* Chat Area */}
      <Card className="flex flex-1 flex-col overflow-hidden">
        {selectedRoom ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center gap-3 border-b border-gray-200 p-4 dark:border-gray-800">
              <Avatar name={selectedRoom.roomName} src={selectedRoom.avatar} size="md" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {selectedRoom.roomName}
                </h3>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4">
              {messagesLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {[...messages].map((message: any) => {
                    const isOwn = message.senderId === user?.id;
                    return (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}
                      >
                        <Avatar name={message.username} src={message.avatar} size="sm" />
                        <div className={`flex flex-col ${isOwn ? 'items-end' : ''}`}>
                          <div
                            className={`rounded-lg px-4 py-2 max-w-md ${
                              isOwn
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white'
                            }`}
                          >
                            {message.content && (
                              <p className="whitespace-pre-wrap break-words">{message.content}</p>
                            )}
                            
                            {/* Display attached images */}
                            {message.files && message.files.length > 0 && (
                              <div className={`space-y-2 ${message.content ? 'mt-2' : ''}`}>
                                {message.files.map((file: any, idx: number) => (
                                  file.type?.startsWith('image/') ? (
                                    <div key={idx} className="relative overflow-hidden rounded-lg">
                                      <Image
                                        src={file.url}
                                        alt={file.name || 'Image'}
                                        width={300}
                                        height={200}
                                        className="object-cover"
                                        unoptimized
                                      />
                                    </div>
                                  ) : (
                                    <a
                                      key={idx}
                                      href={file.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="block rounded bg-gray-200 px-3 py-2 text-sm hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
                                    >
                                      📎 {file.name}
                                    </a>
                                  )
                                ))}
                              </div>
                            )}
                          </div>
                          <span className="mt-1 text-xs text-gray-500 dark:text-gray-400">
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
            <form onSubmit={handleSendMessage} className="border-t border-gray-200 p-4 dark:border-gray-800">
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
                  className="rounded-full p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                  disabled={sending}
                >
                  <PhotoIcon className="h-5 w-5" />
                </button>
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 rounded-full border text-white border-gray-300 bg-gray-50 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800"
                  disabled={sending}
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={(!messageText.trim() && selectedFiles.length === 0) || sending}
                  isLoading={sending}
                >
                  <PaperAirplaneIcon className="h-5 w-5" />
                </Button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <ChatBubbleLeftRightIcon className="mx-auto h-16 w-16 mb-4" />
              <p className="text-lg font-semibold">Select a conversation</p>
              <p className="text-sm">Choose a chat from the list to start messaging</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

