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
export type DashboardDataQueryVariables = Types.Exact<{
  startDate: Types.Scalars['String']['input'];
  endDate: Types.Scalars['String']['input'];
  branch?: Types.InputMaybe<Types.Scalars['String']['input']>;
  productLine?: Types.InputMaybe<Types.Scalars['String']['input']>;
  target?: Types.InputMaybe<Types.Scalars['Float']['input']>;
}>;


export type DashboardDataQuery = { __typename?: 'Query', revenueSummary: { __typename?: 'RevenueSummary', totalRevenue?: number | null, grossProfit?: number | null, totalTransactions: number, averageTransaction?: number | null, uniqueProducts: number, uniqueBranches: number, uniqueEmployees: number }, monthlySalesGrowth: Array<{ __typename?: 'MonthlySalesGrowth', date: string, totalSales?: number | null, grossProfit?: number | null }>, targetAttainment: { __typename?: 'TargetAttainment', attainmentPercentage: number, totalSales: number, target: number }, productPerformance: Array<{ __typename?: 'ProductPerformance', product: string, sales: number }>, branchProductHeatmap: Array<{ __typename?: 'BranchProductHeatmap', branch: string, product: string, sales: number }>, topCustomers: Array<{ __typename?: 'TopCustomerEntry', cardName: string, salesAmount?: number | null, grossProfit?: number | null }>, marginTrends: Array<{ __typename?: 'MarginTrendEntry', date: string, marginPct?: number | null }>, returnsAnalysis: Array<{ __typename?: 'ReturnsAnalysisEntry', reason: string, count: number }>, profitabilityByDimension: Array<{ __typename?: 'ProfitabilityByDimension', branch?: string | null, grossProfit?: number | null, grossMargin?: number | null }>, productAnalytics: Array<{ __typename?: 'ProductAnalytics', itemName: string, productLine: string, itemGroup: string, totalSales: number, grossProfit?: number | null, margin?: number | null, totalQty: number, transactionCount: number, uniqueBranches: number, averagePrice: number }> };



export const DashboardDataDocument = `
    query dashboardData($startDate: String!, $endDate: String!, $branch: String, $productLine: String, $target: Float) {
  revenueSummary(
    startDate: $startDate
    endDate: $endDate
    branch: $branch
    productLine: $productLine
  ) {
    totalRevenue
    grossProfit
    totalTransactions
    averageTransaction
    uniqueProducts
    uniqueBranches
    uniqueEmployees
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
  targetAttainment(
    startDate: $startDate
    endDate: $endDate
    branch: $branch
    productLine: $productLine
    target: $target
  ) {
    attainmentPercentage
    totalSales
    target
  }
  productPerformance(startDate: $startDate, endDate: $endDate, n: 10) {
    product
    sales
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
  topCustomers(startDate: $startDate, endDate: $endDate, n: 5) {
    cardName
    salesAmount
    grossProfit
  }
  marginTrends(startDate: $startDate, endDate: $endDate) {
    date
    marginPct
  }
  returnsAnalysis(startDate: $startDate, endDate: $endDate) {
    reason
    count
  }
  profitabilityByDimension(
    dimension: "Branch"
    startDate: $startDate
    endDate: $endDate
  ) {
    branch
    grossProfit
    grossMargin
  }
  productAnalytics(
    startDate: $startDate
    endDate: $endDate
    branch: $branch
    productLine: $productLine
  ) {
    itemName
    productLine
    itemGroup
    totalSales
    grossProfit
    margin
    totalQty
    transactionCount
    uniqueBranches
    averagePrice
  }
}
    `;

export const useDashboardDataQuery = <
      TData = DashboardDataQuery,
      TError = unknown
    >(
      client: GraphQLClient,
      variables: DashboardDataQueryVariables,
      options?: Omit<UseQueryOptions<DashboardDataQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<DashboardDataQuery, TError, TData>['queryKey'] },
      headers?: RequestInit['headers']
    ) => {
    
    return useQuery<DashboardDataQuery, TError, TData>(
      {
    queryKey: ['dashboardData', variables],
    queryFn: fetcher<DashboardDataQuery, DashboardDataQueryVariables>(client, DashboardDataDocument, variables, headers),
    ...options
  }
    )};
