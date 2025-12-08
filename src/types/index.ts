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
  coverImage?: {
    url: string;
  };
  locationName?: string;
  createdAt: string;
  followedByCount: number;
  followingCount: number;
  followedByCurrentUser?: boolean;
  myRoleInGroup?: GroupMemberRole; // Role in a specific group context
}

// Post types
export interface Post {
  id: string;
  title: string;
  content: string;
  contentExcerpt?: string;
  createdAt: string;
  updatedAt?: string;
  author: User | null;
  commentsCount: number;
  shoutedCount: number;
  shoutedByCurrentUser?: boolean;
  emotionsCount?: number;
  emotions?: Emotion[];
  comments?: Comment[];
  image?: {
    url: string;
    alt?: string;
    aspectRatio?: number;
  };
  group?: {
    id: string;
    name: string;
    slug: string;
    groupType: string;
    avatar?: {
      url: string;
    };
  } | null;
}

export interface Emotion {
  emotion: string;
  User?: User;
}

// Comment types
export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: User | null;
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
  isGroup?: boolean;
  groupName?: string;
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

// Notification types
export type NotificationReason =
  | 'mentioned_in_post'
  | 'mentioned_in_comment'
  | 'commented_on_post'
  | 'user_joined_group'
  | 'user_left_group'
  | 'changed_group_member_role'
  | 'removed_user_from_group'
  | 'followed_user_posted'
  | 'post_in_group';

export interface NotificationRelatedUser {
  id: string;
  name?: string;
  slug?: string;
  avatar?: {
    url: string;
  };
}

export type NotificationSource =
  | {
      __typename: 'Post';
      id: string;
      title?: string | null;
      slug?: string | null;
      content?: string | null;
      author?: NotificationRelatedUser | null;
    }
  | {
      __typename: 'Comment';
      id: string;
      content?: string | null;
      author?: NotificationRelatedUser | null;
      post?: {
        id: string;
        title?: string | null;
        author?: NotificationRelatedUser | null;
      } | null;
    }
  | {
      __typename: 'Group';
      id: string;
      name?: string | null;
      slug?: string | null;
    };

export interface Notification {
  id: string;
  read?: boolean | null;
  reason?: NotificationReason | null;
  createdAt: string;
  updatedAt?: string | null;
  relatedUser?: NotificationRelatedUser | null;
  from?: NotificationSource | null;
}

export type GroupMemberRole = 'pending' | 'usual' | 'admin' | 'owner';

export interface Group {
  id: string;
  name: string;
  slug: string;
  about?: string | null;
  description: string;
  descriptionExcerpt?: string | null;
  groupType: string;
  actionRadius: string;
  locationName?: string | null;
  membersCount: number;
  myRole?: GroupMemberRole | null;
  isMutedByMe?: boolean;
  avatar?: {
    url: string;
  };
  createdAt?: string;
  updatedAt?: string;
  inviteCodes?: InviteCode[];
}

export interface InviteCode {
  code: string;
  createdAt: string;
  expiresAt?: string | null;
  comment?: string | null;
  redeemedByCount?: number;
  isValid?: boolean;
  invitedTo?: {
    id: string;
    name: string;
    slug: string;
  };
}