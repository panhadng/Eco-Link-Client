import { useMutation } from '@apollo/client';
import { CREATE_COMMENT, DELETE_COMMENT } from '@/lib/graphql/mutations';
import { GET_POST_BY_ID } from '@/lib/graphql/queries';
import toast from 'react-hot-toast';

export function useCreateComment(postId: string) {
  const [createComment, { loading }] = useMutation(CREATE_COMMENT, {
    refetchQueries: [{ query: GET_POST_BY_ID, variables: { id: postId } }],
    onCompleted: () => {
      toast.success('Comment added!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to add comment');
    },
  });

  return {
    createComment,
    loading,
  };
}

export function useDeleteComment(postId: string) {
  const [deleteComment, { loading }] = useMutation(DELETE_COMMENT, {
    refetchQueries: [{ query: GET_POST_BY_ID, variables: { id: postId } }],
    onCompleted: () => {
      toast.success('Comment deleted!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete comment');
    },
  });

  return {
    deleteComment,
    loading,
  };
}

