import * as Types from '../types/graphql';

import { GraphQLClient } from 'graphql-request';
import { RequestInit } from 'graphql-request/dist/types.dom';
import { MonthlySalesGrowthFieldsFragmentDoc, TopCustomerFieldsFragmentDoc } from './fragments.generated';
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
  n?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  itemNames?: Types.InputMaybe<Array<Types.Scalars['String']['input']> | Types.Scalars['String']['input']>;
  salesPersons?: Types.InputMaybe<Array<Types.Scalars['String']['input']> | Types.Scalars['String']['input']>;
  branchNames?: Types.InputMaybe<Array<Types.Scalars['String']['input']> | Types.Scalars['String']['input']>;
}>;


export type DashboardDataQuery = { __typename?: 'Query', revenueSummary: { __typename?: 'RevenueSummary', totalRevenue?: number | null, netSales?: number | null, grossProfit?: number | null, lineItemCount?: number | null, returnsValue?: number | null, totalTransactions: number, averageTransaction?: number | null, uniqueProducts: number, uniqueBranches: number, uniqueEmployees: number, netUnitsSold?: number | null }, monthlySalesGrowth: Array<{ __typename?: 'MonthlySalesGrowth', date: string, totalSales?: number | null, grossProfit?: number | null }>, targetAttainment: { __typename?: 'TargetAttainment', attainmentPercentage: number, totalSales: number, target: number }, productPerformance: Array<{ __typename?: 'ProductPerformance', product: string, sales: number }>, branchProductHeatmap: Array<{ __typename?: 'BranchProductHeatmap', branch: string, product: string, sales: number }>, topCustomers: Array<{ __typename?: 'TopCustomerEntry', cardName: string, salesAmount?: number | null, grossProfit?: number | null }>, marginTrends: Array<{ __typename?: 'MarginTrendEntry', date: string, marginPct?: number | null }>, returnsAnalysis: Array<{ __typename?: 'ReturnsAnalysisEntry', reason: string, count: number }>, profitabilityByDimension: Array<{ __typename?: 'ProfitabilityByDimension', branch?: string | null, grossProfit?: number | null, grossMargin?: number | null }> };



export const DashboardDataDocument = `
    query DashboardData($startDate: String!, $endDate: String!, $branch: String, $productLine: String, $target: Float, $n: Int, $itemNames: [String!], $salesPersons: [String!], $branchNames: [String!]) {
  revenueSummary(
    startDate: $startDate
    endDate: $endDate
    branch: $branch
    productLine: $productLine
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
  monthlySalesGrowth(
    startDate: $startDate
    endDate: $endDate
    branch: $branch
    productLine: $productLine
  ) {
    ...MonthlySalesGrowthFields
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
  productPerformance(
    startDate: $startDate
    endDate: $endDate
    branch: $branch
    productLine: $productLine
    n: $n
  ) {
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
  topCustomers(
    startDate: $startDate
    endDate: $endDate
    branch: $branch
    n: $n
    itemNames: $itemNames
    salesPersons: $salesPersons
    branchNames: $branchNames
    productLine: $productLine
  ) {
    ...TopCustomerFields
  }
  marginTrends(
    startDate: $startDate
    endDate: $endDate
    branch: $branch
    productLine: $productLine
  ) {
    date
    marginPct
  }
  returnsAnalysis(
    startDate: $startDate
    endDate: $endDate
    branch: $branch
    productLine: $productLine
    itemNames: $itemNames
    salesPersons: $salesPersons
    branchNames: $branchNames
  ) {
    reason
    count
  }
  profitabilityByDimension(
    dimension: "Branch"
    startDate: $startDate
    endDate: $endDate
    branch: $branch
    productLine: $productLine
  ) {
    branch
    grossProfit
    grossMargin
  }
}
    ${MonthlySalesGrowthFieldsFragmentDoc}
${TopCustomerFieldsFragmentDoc}`;

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
    queryKey: ['DashboardData', variables],
    queryFn: fetcher<DashboardDataQuery, DashboardDataQueryVariables>(client, DashboardDataDocument, variables, headers),
    ...options
  }
    )};
