import * as Types from '../types/graphql';

import { GraphQLClient } from 'graphql-request';
import { RequestInit } from 'graphql-request/dist/types.dom';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';

function fetcher<TData, TVariables extends { [key: string]: any }>(client: GraphQLClient, query: string, variables?: TVariables, requestHeaders?: RequestInit['headers']) {
  return async (): Promise<TData> => client.request({
    document: query,
    variables,
    requestHeaders
  });
}
export type MarginTrendsQueryVariables = Types.Exact<{
  startDate?: Types.InputMaybe<Types.Scalars['String']['input']>;
  endDate?: Types.InputMaybe<Types.Scalars['String']['input']>;
}>;


export type MarginTrendsQuery = { __typename?: 'Query', marginTrends: Array<{ __typename?: 'MarginTrendEntry', date: string, marginPct: number }> };



export const MarginTrendsDocument = `
    query MarginTrends($startDate: String, $endDate: String) {
  marginTrends(startDate: $startDate, endDate: $endDate) {
    date
    marginPct
  }
}
    `;

export const useMarginTrendsQuery = <
      TData = MarginTrendsQuery,
      TError = unknown
    >(
      client: GraphQLClient,
      variables?: MarginTrendsQueryVariables,
      options?: UseQueryOptions<MarginTrendsQuery, TError, TData>,
      headers?: RequestInit['headers']
    ) => {
    
    return useQuery<MarginTrendsQuery, TError, TData>(
      variables === undefined ? ['MarginTrends'] : ['MarginTrends', variables],
      fetcher<MarginTrendsQuery, MarginTrendsQueryVariables>(client, MarginTrendsDocument, variables, headers),
      options
    )};
