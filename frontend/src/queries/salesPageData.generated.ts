import * as Types from '../types/graphql';

import { GraphQLClient } from 'graphql-request';
import { RequestInit } from 'graphql-request/dist/types.dom';
import { MonthlySalesGrowthFieldsFragmentDoc } from './fragments.generated';
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


export type SalesPageDataQuery = { __typename?: 'Query', revenueSummary: { __typename?: 'RevenueSummary', totalRevenue?: number | null, netSales?: number | null, grossProfit?: number | null, lineItemCount?: number | null, returnsValue?: number | null, totalTransactions: number, averageTransaction?: number | null, uniqueProducts: number, uniqueBranches: number, uniqueEmployees: number, netUnitsSold?: number | null }, monthlySalesGrowth: Array<{ __typename?: 'MonthlySalesGrowth', date: string, totalSales?: number | null, grossProfit?: number | null }>, salesPerformance: Array<{ __typename?: 'SalesPerformance', salesPerson: string, totalSales: number, grossProfit?: number | null, transactionCount: number, averageSale: number, uniqueBranches: number, uniqueProducts: number, avgMargin?: number | null }>, salespersonProductMix: Array<{ __typename?: 'SalespersonProductMixEntry', salesperson: string, productLine: string, avgProfitMargin?: number | null }> };



export const SalesPageDataDocument = `
    query SalesPageData($startDate: String!, $endDate: String!, $branch: String, $productLine: String) {
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
  salespersonProductMix(
    startDate: $startDate
    endDate: $endDate
    branch: $branch
    productLine: $productLine
  ) {
    salesperson
    productLine
    avgProfitMargin
  }
}
    ${MonthlySalesGrowthFieldsFragmentDoc}`;

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
    queryKey: ['SalesPageData', variables],
    queryFn: fetcher<SalesPageDataQuery, SalesPageDataQueryVariables>(client, SalesPageDataDocument, variables, headers),
    ...options
  }
    )};
