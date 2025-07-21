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
export type ProductsPageDataQueryVariables = Types.Exact<{
  startDate: Types.Scalars['String']['input'];
  endDate: Types.Scalars['String']['input'];
  branch?: Types.InputMaybe<Types.Scalars['String']['input']>;
  productLine?: Types.InputMaybe<Types.Scalars['String']['input']>;
}>;


export type ProductsPageDataQuery = { __typename?: 'Query', productAnalytics: Array<{ __typename?: 'ProductAnalytics', itemName: string, productLine: string, itemGroup: string, totalSales: number, grossProfit?: number | null, margin?: number | null, totalQty: number, transactionCount: number, uniqueBranches: number, averagePrice: number }>, revenueSummary: { __typename?: 'RevenueSummary', totalRevenue?: number | null, totalTransactions: number, averageTransaction?: number | null, uniqueProducts: number, uniqueBranches: number, uniqueEmployees: number } };



export const ProductsPageDataDocument = `
    query productsPageData($startDate: String!, $endDate: String!, $branch: String, $productLine: String) {
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
  revenueSummary(
    startDate: $startDate
    endDate: $endDate
    branch: $branch
    productLine: $productLine
  ) {
    totalRevenue
    totalTransactions
    averageTransaction
    uniqueProducts
    uniqueBranches
    uniqueEmployees
  }
}
    `;

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
    queryKey: ['productsPageData', variables],
    queryFn: fetcher<ProductsPageDataQuery, ProductsPageDataQueryVariables>(client, ProductsPageDataDocument, variables, headers),
    ...options
  }
    )};
