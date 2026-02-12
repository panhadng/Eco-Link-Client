import { ApolloClient, InMemoryCache, from, split } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { WebSocketLink } from '@apollo/client/link/ws';
import { getMainDefinition } from '@apollo/client/utilities';
import { createUploadLink } from './upload-link';
import { getAuthToken } from './auth';

// Ensure GraphQL URI has a path (e.g. /graphql). Root URLs often redirect and break CORS preflight.
const normalizeGraphQLUri = (uri: string): string => {
  const trimmed = uri.trim().replace(/\/+$/, '');
  try {
    const url = new URL(trimmed);
    if (url.pathname === '' || url.pathname === '/') {
      url.pathname = '/graphql';
      return url.toString();
    }
    return trimmed;
  } catch {
    return uri;
  }
};

// Auto-detect protocol based on current page protocol
const getGraphQLUri = () => {
  const envUri = process.env.NEXT_PUBLIC_GRAPHQL_URI;
  if (envUri) return normalizeGraphQLUri(envUri);

  if (typeof window !== 'undefined') {
    if (window.location.protocol === 'https:') {
      return 'https://ecolink.flyonit.com.au/graphql';
    }
  }
  return 'http://localhost:4000/graphql';
};

// Strip quotes and whitespace that can come from .env (e.g. NEXT_PUBLIC_WS_URI="wss://...")
const normalizeWsUri = (uri: string): string => {
  return uri.trim().replace(/^["']|["']$/g, '');
};

const getWebSocketUri = () => {
  const raw = process.env.NEXT_PUBLIC_WS_URI;
  const envUri = raw ? normalizeWsUri(raw) : '';
  if (envUri) {
    console.log('[Apollo Client] Using WebSocket URI from env:', envUri);
    return envUri;
  }
  
  // If WS_URI is not set, derive it from the GraphQL URI
  const graphqlUri = getGraphQLUri();
  
  // Convert HTTP/HTTPS to WS/WSS and use the same path
  if (graphqlUri.startsWith('https://')) {
    const wsUri = graphqlUri.replace('https://', 'wss://');
    console.log('[Apollo Client] Auto-detected WebSocket URI from GraphQL URI:', wsUri);
    return wsUri;
  } else if (graphqlUri.startsWith('http://')) {
    const wsUri = graphqlUri.replace('http://', 'ws://');
    console.log('[Apollo Client] Auto-detected WebSocket URI from GraphQL URI:', wsUri);
    return wsUri;
  }
  
  // Fallback for local development
  if (typeof window !== 'undefined') {
    if (window.location.protocol === 'https:') {
      // Use domain for WebSocket - nginx will proxy to backend
      return 'wss://eco-link.flyonit.com.au/graphql';
      // OLD CODE (for direct IP connection - kept for reference):
      // return 'wss://13.203.0.20:4000/graphql';
    }
  }
  return 'ws://localhost:4000/graphql';
};

const uploadLink = createUploadLink({
  uri: getGraphQLUri(),
});

const wsLink = typeof window !== 'undefined' ? (() => {
  const wsUri = getWebSocketUri();
  console.log('[Apollo Client] Creating WebSocketLink with URI:', wsUri);
  
  return new WebSocketLink({
    uri: wsUri,
    options: {
      reconnect: true,
      lazy: true,
      connectionParams: () => {
        const token = getAuthToken();
        console.log('[Apollo Client] WebSocket connecting with token:', token ? 'YES' : 'NO');
        return {
          headers: {
            authorization: token ? `Bearer ${token}` : '',
          },
        };
      },
      connectionCallback: (error) => {
        if (error) {
          console.error('[Apollo Client] WebSocket connection error:', error);
        } else {
          console.log('[Apollo Client] WebSocket connected successfully');
        }
      },
    },
  });
})() : null;

const authLink = setContext((_, { headers }) => {
  // Get token from localStorage
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`);
    });
  }
  
  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
  }
});

// Split between HTTP and WebSocket
const splitLink = typeof window !== 'undefined' && wsLink
  ? split(
      ({ query }) => {
        const definition = getMainDefinition(query);
        return (
          definition.kind === 'OperationDefinition' &&
          definition.operation === 'subscription'
        );
      },
      wsLink,
      from([errorLink, authLink, uploadLink])
    )
  : from([errorLink, authLink, uploadLink]);

const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          Post: {
            merge(_existing = [], incoming) {
              return incoming;
            },
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
  },
});

export default client;

