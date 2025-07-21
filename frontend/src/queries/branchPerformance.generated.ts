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
export type BranchPerformanceQueryVariables = Types.Exact<{
  startDate?: Types.InputMaybe<Types.Scalars['String']['input']>;
  endDate?: Types.InputMaybe<Types.Scalars['String']['input']>;
  branch?: Types.InputMaybe<Types.Scalars['String']['input']>;
  productLine?: Types.InputMaybe<Types.Scalars['String']['input']>;
}>;


export type BranchPerformanceQuery = { __typename?: 'Query', branchPerformance: Array<{ __typename?: 'BranchPerformance', branch: string, totalSales: number, transactionCount: number, averageSale: number, uniqueCustomers: number, uniqueProducts: number }> };



export const BranchPerformanceDocument = `
    query BranchPerformance($startDate: String, $endDate: String, $branch: String, $productLine: String) {
  branchPerformance(
    startDate: $startDate
    endDate: $endDate
    branch: $branch
    productLine: $productLine
  ) {
    branch
    totalSales
    transactionCount
    averageSale
    uniqueCustomers
    uniqueProducts
  }
}
    `;

export const useBranchPerformanceQuery = <
      TData = BranchPerformanceQuery,
      TError = unknown
    >(
      client: GraphQLClient,
      variables?: BranchPerformanceQueryVariables,
      options?: Omit<UseQueryOptions<BranchPerformanceQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<BranchPerformanceQuery, TError, TData>['queryKey'] },
      headers?: RequestInit['headers']
    ) => {
    
    return useQuery<BranchPerformanceQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['BranchPerformance'] : ['BranchPerformance', variables],
    queryFn: fetcher<BranchPerformanceQuery, BranchPerformanceQueryVariables>(client, BranchPerformanceDocument, variables, headers),
    ...options
  }
    )};
