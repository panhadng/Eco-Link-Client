import { gql } from '@apollo/client';

// User Queries
export const GET_CURRENT_USER = gql`
  query GetCurrentUser {
    currentUser {
      id
      name
      slug
      email
      role
      about
      locationName
      avatar {
        url
      }
      createdAt
      followedByCount
      followingCount
    }
  }
`;

export const GET_USER_BY_SLUG = gql`
  query GetUserBySlug($slug: String!) {
    User(slug: $slug) {
      id
      name
      slug
      role
      about
      locationName
      avatar {
        url
      }
      createdAt
      followedByCount
      followingCount
      followedByCurrentUser
    }
  }
`;

export const GET_USERS = gql`
  query GetUsers($first: Int, $offset: Int) {
    User(first: $first, offset: $offset) {
      id
      name
      slug
      role
      about
      createdAt
      followedByCount
      followingCount
      followedByCurrentUser
    }
  }
`;

// Post Queries
export const GET_POSTS = gql`
  query GetPosts($first: Int, $offset: Int, $orderBy: [_PostOrdering]) {
    Post(first: $first, offset: $offset, orderBy: $orderBy) {
      id
      title
      content
      contentExcerpt
      createdAt
      updatedAt
      commentsCount
      shoutedCount
      shoutedByCurrentUser
      emotionsCount
      image {
        url
        alt
        aspectRatio
      }
      author {
        id
        name
        slug
      }
    }
  }
`;

export const GET_POST_BY_ID = gql`
  query GetPostById($id: ID!) {
    Post(id: $id) {
      id
      title
      content
      contentExcerpt
      createdAt
      updatedAt
      commentsCount
      shoutedCount
      shoutedByCurrentUser
      emotionsCount
      author {
        id
        name
        slug
      }
      comments {
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
  }
`;

export const GET_USER_POSTS = gql`
  query GetUserPosts($authorId: ID!, $first: Int, $offset: Int) {
    Post(filter: { author: { id: $authorId } }, first: $first, offset: $offset, orderBy: createdAt_desc) {
      id
      title
      content
      contentExcerpt
      createdAt
      commentsCount
      shoutedCount
      shoutedByCurrentUser
      emotionsCount
      image {
        url
        alt
        aspectRatio
      }
      author {
        id
        name
        slug
      }
    }
  }
`;

export const GET_USER_SHOUTED_POSTS = gql`
  query GetUserShoutedPosts($userId: ID!) {
    User(id: $userId) {
      id
      shouted {
        id
        title
        content
        contentExcerpt
        createdAt
        commentsCount
        shoutedCount
        shoutedByCurrentUser
        emotionsCount
        image {
          url
          alt
          aspectRatio
        }
        author {
          id
          name
          slug
        }
      }
    }
  }
`;

// Comment Queries
export const GET_COMMENTS = gql`
  query GetComments($postId: ID!) {
    Comment(filter: { post: { id: $postId } }) {
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

// Check if current user has liked a post
export const GET_POST_EMOTIONS_BY_CURRENT_USER = gql`
  query PostsEmotionsByCurrentUser($postId: ID!) {
    PostsEmotionsByCurrentUser(postId: $postId)
  }
`;

// Notification Queries
export const GET_NOTIFICATIONS = gql`
  query GetNotifications($read: Boolean, $orderBy: NotificationOrdering, $first: Int, $offset: Int) {
    notifications(read: $read, orderBy: $orderBy, first: $first, offset: $offset) {
      id
      read
      reason
      createdAt
      updatedAt
      relatedUser {
        id
        name
        slug
        avatar {
          url
        }
      }
      from {
        __typename
        ... on Post {
          id
          title
          slug
          content
          author {
            id
            name
            slug
          }
        }
        ... on Comment {
          id
          content
          author {
            id
            name
            slug
          }
          post {
            id
            title
            author {
              id
              name
              slug
            }
          }
        }
        ... on Group {
          id
          name
          slug
        }
      }
    }
  }
`;

export const GET_GROUPS = gql`
  query GetGroups($first: Int, $offset: Int) {
    Group(first: $first, offset: $offset) {
      id
      name
      slug
      about
      description
      descriptionExcerpt
      groupType
      actionRadius
      locationName
      membersCount
      myRole
      isMutedByMe
      createdAt
      updatedAt
      avatar {
        url
      }
    }
  }
`;

export const GET_GROUP_BY_SLUG = gql`
  query GetGroupBySlug($slug: String!) {
    Group(slug: $slug) {
      id
      name
      slug
      about
      description
      descriptionExcerpt
      groupType
      actionRadius
      locationName
      membersCount
      myRole
      isMutedByMe
      createdAt
      updatedAt
      avatar {
        url
      }
    }
  }
`;

export const GET_GROUP_MEMBERS = gql`
  query GetGroupMembers($id: ID!, $first: Int, $offset: Int) {
    GroupMembers(id: $id, first: $first, offset: $offset) {
      id
      name
      slug
      avatar {
        url
      }
    }
  }
`;

export const GET_GROUP_POSTS = gql`
  query GetGroupPosts($groupId: ID!, $first: Int, $offset: Int) {
    Post(filter: { group: { id: $groupId } }, first: $first, offset: $offset, orderBy: createdAt_desc) {
      id
      title
      content
      contentExcerpt
      createdAt
      commentsCount
      shoutedCount
      shoutedByCurrentUser
      emotionsCount
      image {
        url
        alt
        aspectRatio
      }
      author {
        id
        name
        slug
      }
    }
  }
`;

export const SEARCH_USERS = gql`
  query SearchUsers($term: String!, $first: Int, $offset: Int) {
    User(
      filter: {
        OR: [
          { name_contains: $term }
          { slug_contains: $term }
          { about_contains: $term }
        ]
      }
      first: $first
      offset: $offset
    ) {
      id
      name
      slug
      about
      locationName
      followedByCount
      followingCount
      avatar {
        url
      }
    }
  }
`;

export const SEARCH_POSTS = gql`
  query SearchPosts($term: String!, $first: Int, $offset: Int) {
    Post(
      filter: {
        OR: [
          { title_contains: $term }
          { content_contains: $term }
        ]
      }
      first: $first
      offset: $offset
      orderBy: createdAt_desc
    ) {
      id
      title
      content
      contentExcerpt
      createdAt
      commentsCount
      shoutedCount
      shoutedByCurrentUser
      emotionsCount
      image {
        url
        alt
        aspectRatio
      }
      author {
        id
        name
        slug
      }
    }
  }
`;

