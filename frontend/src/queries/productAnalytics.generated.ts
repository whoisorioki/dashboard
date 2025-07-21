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
export type ProductAnalyticsQueryVariables = Types.Exact<{
  startDate: Types.Scalars['String']['input'];
  endDate: Types.Scalars['String']['input'];
  branch?: Types.InputMaybe<Types.Scalars['String']['input']>;
  productLine?: Types.InputMaybe<Types.Scalars['String']['input']>;
}>;


export type ProductAnalyticsQuery = { __typename?: 'Query', productAnalytics: Array<{ __typename?: 'ProductAnalytics', itemName: string, productLine: string, itemGroup: string, totalSales: number, grossProfit?: number | null, margin?: number | null, totalQty: number, transactionCount: number, uniqueBranches: number, averagePrice: number }> };



export const ProductAnalyticsDocument = `
    query productAnalytics($startDate: String!, $endDate: String!, $branch: String, $productLine: String) {
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

export const useProductAnalyticsQuery = <
      TData = ProductAnalyticsQuery,
      TError = unknown
    >(
      client: GraphQLClient,
      variables: ProductAnalyticsQueryVariables,
      options?: Omit<UseQueryOptions<ProductAnalyticsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<ProductAnalyticsQuery, TError, TData>['queryKey'] },
      headers?: RequestInit['headers']
    ) => {
    
    return useQuery<ProductAnalyticsQuery, TError, TData>(
      {
    queryKey: ['productAnalytics', variables],
    queryFn: fetcher<ProductAnalyticsQuery, ProductAnalyticsQueryVariables>(client, ProductAnalyticsDocument, variables, headers),
    ...options
  }
    )};
