import * as Types from '../types/graphql';

import { GraphQLClient } from 'graphql-request';
import { RequestInit } from 'graphql-request/dist/types.dom';
import { TopCustomerFieldsFragmentDoc } from './fragments.generated';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';

function fetcher<TData, TVariables extends { [key: string]: any }>(client: GraphQLClient, query: string, variables?: TVariables, requestHeaders?: RequestInit['headers']) {
  return async (): Promise<TData> => client.request({
    document: query,
    variables,
    requestHeaders
  });
}
export type ProductsPageDataQueryVariables = Types.Exact<{
  startDate: Types.Scalars['String']['input'];
  endDate: Types.Scalars['String']['input'];
  branch?: Types.InputMaybe<Types.Scalars['String']['input']>;
  productLine?: Types.InputMaybe<Types.Scalars['String']['input']>;
  n?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  itemNames?: Types.InputMaybe<Array<Types.Scalars['String']['input']> | Types.Scalars['String']['input']>;
  salesPersons?: Types.InputMaybe<Array<Types.Scalars['String']['input']> | Types.Scalars['String']['input']>;
  branchNames?: Types.InputMaybe<Array<Types.Scalars['String']['input']> | Types.Scalars['String']['input']>;
}>;


export type ProductsPageDataQuery = { __typename?: 'Query', revenueSummary: { __typename?: 'RevenueSummary', totalRevenue?: number | null, netSales?: number | null, grossProfit?: number | null, lineItemCount?: number | null, returnsValue?: number | null, totalTransactions: number, averageTransaction?: number | null, uniqueProducts: number, uniqueBranches: number, uniqueEmployees: number, netUnitsSold?: number | null }, productAnalytics: Array<{ __typename?: 'ProductAnalytics', itemName: string, productLine: string, itemGroup: string, totalSales: number, grossProfit?: number | null, margin?: number | null, totalQty: number, transactionCount: number, uniqueBranches: number, averagePrice: number }>, topCustomers: Array<{ __typename?: 'TopCustomerEntry', cardName: string, salesAmount?: number | null, grossProfit?: number | null }>, returnsAnalysis: Array<{ __typename?: 'ReturnsAnalysisEntry', reason: string, count: number }>, salespersonProductMix: Array<{ __typename?: 'SalespersonProductMixEntry', salesperson: string, productLine: string, avgProfitMargin?: number | null }> };



export const ProductsPageDataDocument = `
    query ProductsPageData($startDate: String!, $endDate: String!, $branch: String, $productLine: String, $n: Int, $itemNames: [String!], $salesPersons: [String!], $branchNames: [String!]) {
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
    ${TopCustomerFieldsFragmentDoc}`;

export const useProductsPageDataQuery = <
      TData = ProductsPageDataQuery,
      TError = unknown
    >(
      client: GraphQLClient,
      variables: ProductsPageDataQueryVariables,
      options?: Omit<UseQueryOptions<ProductsPageDataQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<ProductsPageDataQuery, TError, TData>['queryKey'] },
      headers?: RequestInit['headers']
    ) => {
    
    return useQuery<ProductsPageDataQuery, TError, TData>(
      {
    queryKey: ['ProductsPageData', variables],
    queryFn: fetcher<ProductsPageDataQuery, ProductsPageDataQueryVariables>(client, ProductsPageDataDocument, variables, headers),
    ...options
  }
    )};
