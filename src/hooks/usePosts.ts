import { useQuery, useMutation } from '@apollo/client';
import { GET_POSTS, GET_POST_BY_ID } from '@/lib/graphql/queries';
import {
  CREATE_POST,
  DELETE_POST,
  UPDATE_POST,
  SHOUT_POST,
  UNSHOUT_POST,
} from '@/lib/graphql/mutations';
import toast from 'react-hot-toast';

export function usePosts(limit = 10) {
  const { data, loading, error, fetchMore, refetch } = useQuery(GET_POSTS, {
    variables: {
      first: limit,
      offset: 0,
      orderBy: ['createdAt_desc'],
    },
  });

  const loadMore = () => {
    if (data?.Post) {
      fetchMore({
        variables: {
          offset: data.Post.length,
        },
      });
    }
  };

  return {
    posts: data?.Post || [],
    loading,
    error,
    loadMore,
    refetch,
  };
}

export function usePost(id: string) {
  const { data, loading, error, refetch } = useQuery(GET_POST_BY_ID, {
    variables: { id },
    skip: !id,
  });

  return {
    post: data?.Post?.[0],
    loading,
    error,
    refetch,
  };
}

export function useCreatePost() {
  const [createPost, { loading }] = useMutation(CREATE_POST, {
    refetchQueries: [{ query: GET_POSTS, variables: { first: 10, offset: 0, orderBy: ['createdAt_desc'] } }],
    onCompleted: () => {
      toast.success('Post created successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create post');
    },
  });

  return {
    createPost,
    loading,
  };
}

export function useDeletePost() {
  const [deletePost, { loading }] = useMutation(DELETE_POST, {
    refetchQueries: [{ query: GET_POSTS, variables: { first: 10, offset: 0, orderBy: ['createdAt_desc'] } }],
    onCompleted: () => {
      toast.success('Post deleted successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete post');
    },
  });

  return {
    deletePost,
    loading,
  };
}

export function useUpdatePost() {
  const [updatePost, { loading }] = useMutation(UPDATE_POST, {
    refetchQueries: [{ query: GET_POSTS, variables: { first: 10, offset: 0, orderBy: ['createdAt_desc'] } }],
    onCompleted: () => {
      toast.success('Post updated successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update post');
    },
  });

  return {
    updatePost,
    loading,
  };
}

export function useShoutPost() {
  const [shout] = useMutation(SHOUT_POST, {
    onError: (error) => {
      toast.error(error.message || 'Failed to like post');
    },
  });

  const [unshout] = useMutation(UNSHOUT_POST, {
    onError: (error) => {
      toast.error(error.message || 'Failed to unlike post');
    },
  });

  return {
    shout,
    unshout,
  };
}

