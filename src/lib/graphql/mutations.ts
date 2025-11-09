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

// Post Mutations
export const CREATE_POST = gql`
  mutation CreatePost($title: String!, $content: String!, $visibility: Visibility, $image: ImageInput) {
    CreatePost(title: $title, content: $content, visibility: $visibility, image: $image) {
      id
      title
      content
      contentExcerpt
      createdAt
      author {
        id
        name
        slug
      }
      commentsCount
      shoutedCount
      image {
        url
        alt
        aspectRatio
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
    ) {
      id
      name
      about
      locationName
      avatar {
        url
      }
    }
  }
`;

