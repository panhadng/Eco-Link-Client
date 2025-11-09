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

