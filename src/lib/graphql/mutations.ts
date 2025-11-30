import { gql } from '@apollo/client';

// Auth Mutations
export const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password)
  }
`;

export const SIGNUP = gql`
  mutation Signup($email: String!, $locale: String!, $inviteCode: String) {
    Signup(email: $email, locale: $locale, inviteCode: $inviteCode) {
      email
      createdAt
    }
  }
`;

export const SIGNUP_VERIFICATION = gql`
  mutation SignupVerification(
    $nonce: String!
    $email: String!
    $name: String!
    $password: String!
    $slug: String
    $termsAndConditionsAgreedVersion: String!
    $locale: String
  ) {
    SignupVerification(
      nonce: $nonce
      email: $email
      name: $name
      password: $password
      slug: $slug
      termsAndConditionsAgreedVersion: $termsAndConditionsAgreedVersion
      locale: $locale
    ) {
      id
      name
      slug
      email
    }
  }
`;

export const SIMPLE_SIGNUP = gql`
  mutation SimpleSignup(
    $email: String!
    $name: String!
    $password: String!
    $termsAndConditionsAgreedVersion: String!
    $locale: String
  ) {
    SimpleSignup(
      email: $email
      name: $name
      password: $password
      termsAndConditionsAgreedVersion: $termsAndConditionsAgreedVersion
      locale: $locale
    ) {
      id
      name
      slug
      email
    }
  }
`;

// Post Mutations
export const CREATE_POST = gql`
  mutation CreatePost(
    $title: String!
    $content: String!
    $visibility: Visibility
    $image: ImageInput
    $groupId: ID
  ) {
    CreatePost(
      title: $title
      content: $content
      visibility: $visibility
      image: $image
      groupId: $groupId
    ) {
      id
      title
      content
      contentExcerpt
      createdAt
      author {
        id
        name
        slug
        avatar {
          url
        }
      }
      commentsCount
      shoutedCount
      image {
        url
        alt
        aspectRatio
      }
      group {
        id
        name
        slug
        groupType
        avatar {
          url
        }
      }
    }
  }
`;

export const UPDATE_POST = gql`
  mutation UpdatePost($id: ID!, $title: String!, $content: String!) {
    UpdatePost(id: $id, title: $title, content: $content) {
      id
      title
      content
      updatedAt
    }
  }
`;

export const DELETE_POST = gql`
  mutation DeletePost($id: ID!) {
    DeletePost(id: $id) {
      id
    }
  }
`;

// Comment Mutations
export const CREATE_COMMENT = gql`
  mutation CreateComment($postId: ID!, $content: String!) {
    CreateComment(postId: $postId, content: $content) {
      id
      content
      createdAt
      author {
        id
        name
        slug
      }
    }
  }
`;

export const DELETE_COMMENT = gql`
  mutation DeleteComment($id: ID!) {
    DeleteComment(id: $id) {
      id
    }
  }
`;

// Like/Shout Mutations
export const SHOUT_POST = gql`
  mutation ShoutPost($id: ID!) {
    shout(id: $id, type: Post)
  }
`;

export const UNSHOUT_POST = gql`
  mutation UnshoutPost($id: ID!) {
    unshout(id: $id, type: Post)
  }
`;

// Emotion/Like Mutations
export const ADD_POST_EMOTION = gql`
  mutation AddPostEmotions($to: _PostInput!, $data: _EMOTEDInput!) {
    AddPostEmotions(to: $to, data: $data) {
      from {
        id
      }
      to {
        id
      }
      emotion
    }
  }
`;

export const REMOVE_POST_EMOTION = gql`
  mutation RemovePostEmotions($to: _PostInput!, $data: _EMOTEDInput!) {
    RemovePostEmotions(to: $to, data: $data) {
      from {
        id
      }
      to {
        id
      }
      emotion
    }
  }
`;

// Follow Mutations
export const FOLLOW_USER = gql`
  mutation FollowUser($id: ID!) {
    followUser(id: $id) {
      id
      name
      slug
      followedByCount
    }
  }
`;

export const UNFOLLOW_USER = gql`
  mutation UnfollowUser($id: ID!) {
    unfollowUser(id: $id) {
      id
      name
      slug
      followedByCount
    }
  }
`;

// Update User
export const UPDATE_USER = gql`
  mutation UpdateUser(
    $coverImage: ImageInput
    $id: ID!
    $name: String
    $about: String
    $locationName: String
    $avatar: ImageInput
  ) {
    UpdateUser(
      id: $id
      name: $name
      about: $about
      locationName: $locationName
      avatar: $avatar
      coverImage: $coverImage
    ) {
      id
      name
      about
      locationName
      avatar {
        url
      }
      coverImage {
        url
      }
    }
  }
`;

// Notification Mutations
export const MARK_NOTIFICATION_AS_READ = gql`
  mutation MarkNotificationAsRead($id: ID!) {
    markAsRead(id: $id) {
      id
      read
      updatedAt
    }
  }
`;

export const MARK_ALL_NOTIFICATIONS_AS_READ = gql`
  mutation MarkAllNotificationsAsRead {
    markAllAsRead {
      id
      read
      updatedAt
    }
  }
`;

// Group Mutations
export const CREATE_GROUP = gql`
  mutation CreateGroup(
    $name: String!
    $description: String!
    $about: String
    $groupType: GroupType!
    $actionRadius: GroupActionRadius!
    $locationName: String
    $categoryIds: [ID]
  ) {
    CreateGroup(
      name: $name
      description: $description
      about: $about
      groupType: $groupType
      actionRadius: $actionRadius
      locationName: $locationName
      categoryIds: $categoryIds
    ) {
      id
      name
      slug
      about
      description
      groupType
      actionRadius
      locationName
      membersCount
      myRole
      avatar {
        url
      }
    }
  }
`;

export const DELETE_GROUP = gql`
  mutation DeleteGroup($id: ID!) {
    DeleteGroup(id: $id) {
      id
      name
      slug
      deleted
    }
  }
`;

export const UPDATE_GROUP = gql`
  mutation UpdateGroup(
    $id: ID!
    $name: String
    $slug: String
    $about: String
    $description: String
    $actionRadius: GroupActionRadius
    $categoryIds: [ID]
    $avatar: ImageInput
    $locationName: String
  ) {
    UpdateGroup(
      id: $id
      name: $name
      slug: $slug
      about: $about
      description: $description
      actionRadius: $actionRadius
      categoryIds: $categoryIds
      avatar: $avatar
      locationName: $locationName
    ) {
      id
      name
      slug
      about
      description
      actionRadius
      locationName
      membersCount
      myRole
      avatar {
        url
      }
    }
  }
`;

export const JOIN_GROUP = gql`
  mutation JoinGroup($groupId: ID!, $userId: ID!) {
    JoinGroup(groupId: $groupId, userId: $userId) {
      id
      name
      slug
    }
  }
`;

export const LEAVE_GROUP = gql`
  mutation LeaveGroup($groupId: ID!, $userId: ID!) {
    LeaveGroup(groupId: $groupId, userId: $userId) {
      id
      name
      slug
    }
  }
`;

export const CHANGE_GROUP_MEMBER_ROLE = gql`
  mutation ChangeGroupMemberRole($groupId: ID!, $userId: ID!, $roleInGroup: GroupMemberRole!) {
    ChangeGroupMemberRole(groupId: $groupId, userId: $userId, roleInGroup: $roleInGroup) {
      id
      name
      slug
      myRoleInGroup
    }
  }
`;

export const REMOVE_USER_FROM_GROUP = gql`
  mutation RemoveUserFromGroup($groupId: ID!, $userId: ID!) {
    RemoveUserFromGroup(groupId: $groupId, userId: $userId) {
      id
      name
      slug
    }
  }
`;

export const GENERATE_GROUP_INVITE_CODE = gql`
  mutation GenerateGroupInviteCode($groupId: ID!, $expiresAt: String, $comment: String) {
    generateGroupInviteCode(groupId: $groupId, expiresAt: $expiresAt, comment: $comment) {
      code
      createdAt
      expiresAt
      comment
      isValid
      invitedTo {
        id
        name
        slug
      }
    }
  }
`;

export const INVALIDATE_INVITE_CODE = gql`
  mutation InvalidateInviteCode($code: String!) {
    invalidateInviteCode(code: $code) {
      code
      expiresAt
    }
  }
`;

