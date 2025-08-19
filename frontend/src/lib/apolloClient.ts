import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';

// Create HTTP link for regular queries and file uploads
const httpLink = createHttpLink({
  uri: 'http://localhost:8000/graphql',
  headers: {
    'Apollo-Require-Preflight': 'true',
  },
});

// Create Apollo Client with upload support
export const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    },
  },
});

export default client;
