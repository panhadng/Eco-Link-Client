import { gql } from '@apollo/client';

export const NOTIFICATION_ADDED = gql`
  subscription NotificationAdded {
    notificationAdded {
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
