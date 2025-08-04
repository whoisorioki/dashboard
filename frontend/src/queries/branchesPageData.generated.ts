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
  branch?: Types.InputMaybe<Types.Scalars['String']['input']>;
  productLine?: Types.InputMaybe<Types.Scalars['String']['input']>;
  itemGroups?: Types.InputMaybe<Array<Types.Scalars['String']['input']> | Types.Scalars['String']['input']>;
}>;


export type BranchesPageDataQuery = { __typename?: 'Query', revenueSummary: { __typename?: 'RevenueSummary', totalRevenue?: number | null, netSales?: number | null, grossProfit?: number | null, lineItemCount?: number | null, returnsValue?: number | null, totalTransactions: number, averageTransaction?: number | null, uniqueProducts: number, uniqueBranches: number, uniqueEmployees: number, netUnitsSold?: number | null }, branchPerformance: Array<{ __typename?: 'BranchPerformance', branch: string, totalSales?: number | null, transactionCount: number, averageSale?: number | null, uniqueCustomers: number, uniqueProducts: number }>, branchGrowth: Array<{ __typename?: 'BranchGrowth', branch: string, monthYear: string, monthlySales?: number | null, growthPct?: number | null }>, branchProductHeatmap: Array<{ __typename?: 'BranchProductHeatmap', branch: string, product: string, sales?: number | null }> };



export const BranchesPageDataDocument = `
    query BranchesPageData($startDate: String!, $endDate: String!, $branch: String, $productLine: String, $itemGroups: [String!]) {
  revenueSummary(
    startDate: $startDate
    endDate: $endDate
    branch: $branch
    productLine: $productLine
    itemGroups: $itemGroups
  ) {
    totalRevenue
    netSales
    grossProfit
    lineItemCount
    returnsValue
    totalTransactions
    averageTransaction
    uniqueProducts
    uniqueBranches
    uniqueEmployees
    netUnitsSold
  }
  branchPerformance(
    startDate: $startDate
    endDate: $endDate
    branch: $branch
    productLine: $productLine
    itemGroups: $itemGroups
  ) {
    branch
    totalSales
    transactionCount
    averageSale
    uniqueCustomers
    uniqueProducts
  }
  branchGrowth(
    startDate: $startDate
    endDate: $endDate
    branch: $branch
    productLine: $productLine
    itemGroups: $itemGroups
  ) {
    branch
    monthYear
    monthlySales
    growthPct
  }
  branchProductHeatmap(
    startDate: $startDate
    endDate: $endDate
    branch: $branch
    productLine: $productLine
  ) {
    branch
    product
    sales
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
    queryKey: ['BranchesPageData', variables],
    queryFn: fetcher<BranchesPageDataQuery, BranchesPageDataQueryVariables>(client, BranchesPageDataDocument, variables, headers),
    ...options
  }
    )};
