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
  branch?: Types.InputMaybe<Types.Scalars['String']['input']>;
  productLine?: Types.InputMaybe<Types.Scalars['String']['input']>;
}>;


export type MarginTrendsQuery = { __typename?: 'Query', marginTrends: Array<{ __typename?: 'MarginTrendEntry', date: string, marginPct?: number | null }> };



export const MarginTrendsDocument = `
    query MarginTrends($startDate: String, $endDate: String, $branch: String, $productLine: String) {
  marginTrends(
    startDate: $startDate
    endDate: $endDate
    branch: $branch
    productLine: $productLine
  ) {
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
      options?: Omit<UseQueryOptions<MarginTrendsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<MarginTrendsQuery, TError, TData>['queryKey'] },
      headers?: RequestInit['headers']
    ) => {
    
    return useQuery<MarginTrendsQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['MarginTrends'] : ['MarginTrends', variables],
    queryFn: fetcher<MarginTrendsQuery, MarginTrendsQueryVariables>(client, MarginTrendsDocument, variables, headers),
    ...options
  }
    )};
