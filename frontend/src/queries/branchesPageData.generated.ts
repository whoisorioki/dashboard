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
export type BranchesPageDataQueryVariables = Types.Exact<{
  startDate: Types.Scalars['String']['input'];
  endDate: Types.Scalars['String']['input'];
}>;


export type BranchesPageDataQuery = { __typename?: 'Query', branchPerformance: Array<{ __typename?: 'BranchPerformance', branch: string, totalSales: number, transactionCount: number, averageSale: number, uniqueCustomers: number, uniqueProducts: number }>, branchGrowth: Array<{ __typename?: 'BranchGrowth', branch: string, monthYear: string, monthlySales: number, growthPct: number }> };



export const BranchesPageDataDocument = `
    query branchesPageData($startDate: String!, $endDate: String!) {
  branchPerformance(startDate: $startDate, endDate: $endDate) {
    branch
    totalSales
    transactionCount
    averageSale
    uniqueCustomers
    uniqueProducts
  }
  branchGrowth(startDate: $startDate, endDate: $endDate) {
    branch
    monthYear
    monthlySales
    growthPct
  }
}
    `;

export const useBranchesPageDataQuery = <
      TData = BranchesPageDataQuery,
      TError = unknown
    >(
      client: GraphQLClient,
      variables: BranchesPageDataQueryVariables,
      options?: Omit<UseQueryOptions<BranchesPageDataQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<BranchesPageDataQuery, TError, TData>['queryKey'] },
      headers?: RequestInit['headers']
    ) => {
    
    return useQuery<BranchesPageDataQuery, TError, TData>(
      {
    queryKey: ['branchesPageData', variables],
    queryFn: fetcher<BranchesPageDataQuery, BranchesPageDataQueryVariables>(client, BranchesPageDataDocument, variables, headers),
    ...options
  }
    )};
