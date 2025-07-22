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
  startDate: Types.Scalars['String']['input'];
  endDate: Types.Scalars['String']['input'];
  branch?: Types.InputMaybe<Types.Scalars['String']['input']>;
  productLine?: Types.InputMaybe<Types.Scalars['String']['input']>;
}>;


export type SalesPerformanceQuery = { __typename?: 'Query', salesPerformance: Array<{ __typename?: 'SalesPerformance', salesPerson: string, totalSales: number, grossProfit?: number | null, avgMargin?: number | null, transactionCount: number, averageSale: number, uniqueBranches: number, uniqueProducts: number }> };



export const SalesPerformanceDocument = `
    query salesPerformance($startDate: String!, $endDate: String!, $branch: String, $productLine: String) {
  salesPerformance(
    startDate: $startDate
    endDate: $endDate
    branch: $branch
    productLine: $productLine
  ) {
    salesPerson
    totalSales
    grossProfit
    avgMargin
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
      variables: SalesPerformanceQueryVariables,
      options?: Omit<UseQueryOptions<SalesPerformanceQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<SalesPerformanceQuery, TError, TData>['queryKey'] },
      headers?: RequestInit['headers']
    ) => {
    
    return useQuery<SalesPerformanceQuery, TError, TData>(
      {
    queryKey: ['salesPerformance', variables],
    queryFn: fetcher<SalesPerformanceQuery, SalesPerformanceQueryVariables>(client, SalesPerformanceDocument, variables, headers),
    ...options
  }
    )};
