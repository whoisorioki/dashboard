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
export type SalespersonLeaderboardQueryVariables = Types.Exact<{
  startDate?: Types.InputMaybe<Types.Scalars['String']['input']>;
  endDate?: Types.InputMaybe<Types.Scalars['String']['input']>;
  branch?: Types.InputMaybe<Types.Scalars['String']['input']>;
  productLine?: Types.InputMaybe<Types.Scalars['String']['input']>;
}>;


export type SalespersonLeaderboardQuery = { __typename?: 'Query', salespersonLeaderboard: Array<{ __typename?: 'SalespersonLeaderboardEntry', salesperson: string, salesAmount?: number | null, grossProfit?: number | null }> };



export const SalespersonLeaderboardDocument = `
    query SalespersonLeaderboard($startDate: String, $endDate: String, $branch: String, $productLine: String) {
  salespersonLeaderboard(
    startDate: $startDate
    endDate: $endDate
    branch: $branch
    productLine: $productLine
  ) {
    salesperson
    salesAmount
    grossProfit
  }
}
    `;

export const useSalespersonLeaderboardQuery = <
      TData = SalespersonLeaderboardQuery,
      TError = unknown
    >(
      client: GraphQLClient,
      variables?: SalespersonLeaderboardQueryVariables,
      options?: Omit<UseQueryOptions<SalespersonLeaderboardQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<SalespersonLeaderboardQuery, TError, TData>['queryKey'] },
      headers?: RequestInit['headers']
    ) => {
    
    return useQuery<SalespersonLeaderboardQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['SalespersonLeaderboard'] : ['SalespersonLeaderboard', variables],
    queryFn: fetcher<SalespersonLeaderboardQuery, SalespersonLeaderboardQueryVariables>(client, SalespersonLeaderboardDocument, variables, headers),
    ...options
  }
    )};
