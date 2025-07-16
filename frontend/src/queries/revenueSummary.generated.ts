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
}>;


export type RevenueSummaryQuery = { __typename?: 'Query', revenueSummary: { __typename?: 'RevenueSummary', totalRevenue: number, totalTransactions: number, averageTransaction: number, uniqueProducts: number, uniqueBranches: number, uniqueEmployees: number } };



export const RevenueSummaryDocument = `
    query RevenueSummary($startDate: String, $endDate: String) {
  revenueSummary(startDate: $startDate, endDate: $endDate) {
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
      options?: UseQueryOptions<RevenueSummaryQuery, TError, TData>,
      headers?: RequestInit['headers']
    ) => {
    
    return useQuery<RevenueSummaryQuery, TError, TData>(
      variables === undefined ? ['RevenueSummary'] : ['RevenueSummary', variables],
      fetcher<RevenueSummaryQuery, RevenueSummaryQueryVariables>(client, RevenueSummaryDocument, variables, headers),
      options
    )};
