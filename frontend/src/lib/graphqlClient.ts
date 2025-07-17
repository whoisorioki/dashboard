import { GraphQLClient } from "graphql-request";

export const graphqlClient = new GraphQLClient(
  import.meta.env.VITE_API_BASE_URL
    ? `${import.meta.env.VITE_API_BASE_URL}/graphql`
    : "http://localhost:8000/graphql"
);
