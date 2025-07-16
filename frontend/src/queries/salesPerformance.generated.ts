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
export type SalesPerformanceQueryVariables = Types.Exact<{
  startDate?: Types.InputMaybe<Types.Scalars['String']['input']>;
  endDate?: Types.InputMaybe<Types.Scalars['String']['input']>;
}>;


export type SalesPerformanceQuery = { __typename?: 'Query', salesPerformance: Array<{ __typename?: 'SalesPerformance', salesPerson: string, totalSales: number, transactionCount: number, averageSale: number, uniqueBranches: number, uniqueProducts: number }> };



export const SalesPerformanceDocument = `
    query SalesPerformance($startDate: String, $endDate: String) {
  salesPerformance(startDate: $startDate, endDate: $endDate) {
    salesPerson
    totalSales
    transactionCount
    averageSale
    uniqueBranches
    uniqueProducts
  }
}
    `;

export const useSalesPerformanceQuery = <
      TData = SalesPerformanceQuery,
      TError = unknown
    >(
      client: GraphQLClient,
      variables?: SalesPerformanceQueryVariables,
      options?: UseQueryOptions<SalesPerformanceQuery, TError, TData>,
      headers?: RequestInit['headers']
    ) => {
    
    return useQuery<SalesPerformanceQuery, TError, TData>(
      variables === undefined ? ['SalesPerformance'] : ['SalesPerformance', variables],
      fetcher<SalesPerformanceQuery, SalesPerformanceQueryVariables>(client, SalesPerformanceDocument, variables, headers),
      options
    )};
