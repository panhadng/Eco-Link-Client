import { useQuery, useMutation } from '@apollo/client';
import {
  GET_ROOMS,
  GET_MESSAGES,
  CREATE_ROOM,
  CREATE_MESSAGE,
} from '@/lib/graphql/messages';
import toast from 'react-hot-toast';

export function useRooms() {
  const { data, loading, error, refetch } = useQuery(GET_ROOMS, {
    fetchPolicy: 'cache-and-network',
  });

  return {
    rooms: data?.Room || [],
    loading,
    error,
    refetch,
  };
}

export function useMessages(roomId: string) {
  const { data, loading, error, fetchMore, refetch } = useQuery(GET_MESSAGES, {
    variables: {
      roomId,
      first: 50,
      offset: 0,
    },
    skip: !roomId,
    fetchPolicy: 'cache-and-network',
  });

  return {
    messages: data?.Message || [],
    loading,
    error,
    fetchMore,
    refetch,
  };
}

export function useCreateRoom() {
  const [createRoom, { loading }] = useMutation(CREATE_ROOM, {
    refetchQueries: [{ query: GET_ROOMS }],
    onCompleted: () => {
      toast.success('Chat started!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to start chat');
    },
  });

  return {
    createRoom,
    loading,
  };
}

export function useCreateMessage(roomId: string) {
  const [createMessage, { loading }] = useMutation(CREATE_MESSAGE, {
    refetchQueries: [
      { query: GET_MESSAGES, variables: { roomId, first: 50, offset: 0 } },
      { query: GET_ROOMS },
    ],
    onError: (error) => {
      toast.error(error.message || 'Failed to send message');
    },
  });

  return {
    createMessage,
    loading,
  };
}

