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
export type RevenueSummaryQueryVariables = Types.Exact<{
  startDate?: Types.InputMaybe<Types.Scalars['String']['input']>;
  endDate?: Types.InputMaybe<Types.Scalars['String']['input']>;
  branch?: Types.InputMaybe<Types.Scalars['String']['input']>;
  productLine?: Types.InputMaybe<Types.Scalars['String']['input']>;
}>;


export type RevenueSummaryQuery = { __typename?: 'Query', revenueSummary: { __typename?: 'RevenueSummary', totalRevenue?: number | null, totalTransactions: number, averageTransaction?: number | null, uniqueProducts: number, uniqueBranches: number, uniqueEmployees: number } };



export const RevenueSummaryDocument = `
    query RevenueSummary($startDate: String, $endDate: String, $branch: String, $productLine: String) {
  revenueSummary(
    startDate: $startDate
    endDate: $endDate
    branch: $branch
    productLine: $productLine
  ) {
    totalRevenue
    totalTransactions
    averageTransaction
    uniqueProducts
    uniqueBranches
    uniqueEmployees
  }
}
    `;

export const useRevenueSummaryQuery = <
      TData = RevenueSummaryQuery,
      TError = unknown
    >(
      client: GraphQLClient,
      variables?: RevenueSummaryQueryVariables,
      options?: Omit<UseQueryOptions<RevenueSummaryQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<RevenueSummaryQuery, TError, TData>['queryKey'] },
      headers?: RequestInit['headers']
    ) => {
    
    return useQuery<RevenueSummaryQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['RevenueSummary'] : ['RevenueSummary', variables],
    queryFn: fetcher<RevenueSummaryQuery, RevenueSummaryQueryVariables>(client, RevenueSummaryDocument, variables, headers),
    ...options
  }
    )};
