// User types
export interface User {
  id: string;
  name: string;
  slug: string;
  email: string;
  role: 'user' | 'moderator' | 'admin';
  about?: string;
  avatar?: {
    url: string;
  };
  locationName?: string;
  createdAt: string;
  followedByCount: number;
  followedByCurrentUser?: boolean;
}

// Post types
export interface Post {
  id: string;
  title: string;
  content: string;
  contentExcerpt?: string;
  createdAt: string;
  updatedAt?: string;
  author: User;
  commentsCount: number;
  shoutedCount: number;
  shoutedByCurrentUser?: boolean;
  emotionsCount?: number;
  comments?: Comment[];
  image?: {
    url: string;
    alt?: string;
    aspectRatio?: number;
  };
}

// Comment types
export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: User;
  post?: Post;
}

// Auth types
export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
  slug?: string;
  inviteCode?: string;
}

export interface AuthResponse {
  token: string;
  user?: User;
}

// Message types
export interface Message {
  id: string;
  indexId: number;
  content: string;
  senderId: string;
  username: string;
  avatar?: string;
  date: string;
  saved: boolean;
  distributed: boolean;
  seen: boolean;
  files?: Array<{
    url: string;
    name: string;
    type: string;
  }>;
}

export interface Room {
  id: string;
  roomId: string;
  roomName: string;
  avatar?: string;
  lastMessageAt?: string;
  unreadCount: number;
  lastMessage?: {
    id: string;
    content: string;
    date: string;
  };
}

// API Response types
export interface PaginationParams {
  first?: number;
  offset?: number;
}

export interface FeedFilter {
  authorId?: string;
  orderBy?: string[];
}

