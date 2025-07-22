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
export type SalesPageDataQueryVariables = Types.Exact<{
  startDate: Types.Scalars['String']['input'];
  endDate: Types.Scalars['String']['input'];
  branch?: Types.InputMaybe<Types.Scalars['String']['input']>;
  productLine?: Types.InputMaybe<Types.Scalars['String']['input']>;
}>;


export type SalesPageDataQuery = { __typename?: 'Query', salesPerformance: Array<{ __typename?: 'SalesPerformance', salesPerson: string, totalSales: number, grossProfit?: number | null, transactionCount: number, averageSale: number, uniqueBranches: number, uniqueProducts: number, avgMargin?: number | null }>, revenueSummary: { __typename?: 'RevenueSummary', totalRevenue?: number | null, totalTransactions: number, averageTransaction?: number | null, uniqueEmployees: number, uniqueProducts: number, uniqueBranches: number }, monthlySalesGrowth: Array<{ __typename?: 'MonthlySalesGrowth', date: string, totalSales?: number | null, grossProfit?: number | null }> };



export const SalesPageDataDocument = `
    query salesPageData($startDate: String!, $endDate: String!, $branch: String, $productLine: String) {
  salesPerformance(
    startDate: $startDate
    endDate: $endDate
    branch: $branch
    productLine: $productLine
  ) {
    salesPerson
    totalSales
    grossProfit
    transactionCount
    averageSale
    uniqueBranches
    uniqueProducts
    avgMargin
  }
  revenueSummary(
    startDate: $startDate
    endDate: $endDate
    branch: $branch
    productLine: $productLine
  ) {
    totalRevenue
    totalTransactions
    averageTransaction
    uniqueEmployees
    uniqueProducts
    uniqueBranches
  }
  monthlySalesGrowth(
    startDate: $startDate
    endDate: $endDate
    branch: $branch
    productLine: $productLine
  ) {
    date
    totalSales
    grossProfit
  }
}
    `;

export const useSalesPageDataQuery = <
      TData = SalesPageDataQuery,
      TError = unknown
    >(
      client: GraphQLClient,
      variables: SalesPageDataQueryVariables,
      options?: Omit<UseQueryOptions<SalesPageDataQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<SalesPageDataQuery, TError, TData>['queryKey'] },
      headers?: RequestInit['headers']
    ) => {
    
    return useQuery<SalesPageDataQuery, TError, TData>(
      {
    queryKey: ['salesPageData', variables],
    queryFn: fetcher<SalesPageDataQuery, SalesPageDataQueryVariables>(client, SalesPageDataDocument, variables, headers),
    ...options
  }
    )};
