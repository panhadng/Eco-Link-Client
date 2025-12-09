import { gql } from '@apollo/client';

// Room Queries
export const GET_ROOMS = gql`
  query GetRooms {
    Room(orderBy: lastMessageAt_desc) {
      id
      roomId
      roomName
      avatar
      lastMessageAt
      unreadCount
      isGroup
      groupName
      lastMessage {
        id
        content
        date
      }
    }
  }
`;

// Message Queries
export const GET_MESSAGES = gql`
  query GetMessages($roomId: ID!, $first: Int, $offset: Int) {
    Message(roomId: $roomId, first: $first, offset: $offset, orderBy: indexId_desc) {
      id
      indexId
      content
      senderId
      username
      avatar
      date
      saved
      distributed
      seen
      files {
        url
        name
        type
      }
    }
  }
`;

// Room Mutations
export const CREATE_ROOM = gql`
  mutation CreateRoom($userId: ID, $userIds: [ID!], $groupName: String) {
    CreateRoom(userId: $userId, userIds: $userIds, groupName: $groupName) {
      id
      roomId
      roomName
      isGroup
      groupName
      groupAvatar
      avatar
    }
  }
`;

// Message Mutations
export const CREATE_MESSAGE = gql`
  mutation CreateMessage($roomId: ID!, $content: String, $files: [FileInput]) {
    CreateMessage(roomId: $roomId, content: $content, files: $files) {
      id
      indexId
      content
      senderId
      username
      avatar
      date
      saved
      distributed
      seen
      files {
        url
        name
        type
      }
    }
  }
`;

export const MARK_MESSAGES_AS_SEEN = gql`
  mutation MarkMessagesAsSeen($messageIds: [String!]!) {
    MarkMessagesAsSeen(messageIds: $messageIds)
  }
`;

// Subscriptions
export const MESSAGE_ADDED_SUBSCRIPTION = gql`
  subscription OnMessageAdded {
    chatMessageAdded {
      id
      indexId
      content
      senderId
      username
      avatar
      date
      saved
      distributed
      seen
      room {
        id
      }
      files {
        url
        name
        type
      }
    }
  }
`;

export const ROOM_COUNT_UPDATED_SUBSCRIPTION = gql`
  subscription OnRoomCountUpdated {
    roomCountUpdated
  }
`;

export const UPDATE_ROOM_NAME = gql`
  mutation UpdateRoomName($roomId: ID!, $groupName: String!) {
    UpdateRoomName(roomId: $roomId, groupName: $groupName) {
      id
      roomId
      roomName
      groupName
      isGroup
    }
  }
`;

export const LEAVE_ROOM = gql`
  mutation LeaveRoom($roomId: ID!) {
    LeaveRoom(roomId: $roomId)
  }
`;

export const DELETE_ROOM = gql`
  mutation DeleteRoom($roomId: ID!) {
    DeleteRoom(roomId: $roomId)
  }
`;

export const ADD_USERS_TO_ROOM = gql`
  mutation AddUsersToRoom($roomId: ID!, $userIds: [ID!]!) {
    AddUsersToRoom(roomId: $roomId, userIds: $userIds) {
      id
      roomId
      isGroup
      groupName
    }
  }
`;

// Query to get a single room with users
export const GET_ROOM = gql`
  query GetRoom($roomId: ID!) {
    Room(id: $roomId) {
      id
      roomId
      roomName
      avatar
      isGroup
      groupName
      users {
        id
        name
        slug
        avatar {
          url
        }
      }
    }
  }
`;

