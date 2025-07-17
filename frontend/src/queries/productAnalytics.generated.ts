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
  startDate?: Types.InputMaybe<Types.Scalars['String']['input']>;
  endDate?: Types.InputMaybe<Types.Scalars['String']['input']>;
}>;


export type ProductAnalyticsQuery = { __typename?: 'Query', productAnalytics: Array<{ __typename?: 'ProductAnalytics', itemName: string, productLine: string, itemGroup: string, totalSales: number, totalQty: number, transactionCount: number, uniqueBranches: number, averagePrice: number }> };



export const ProductAnalyticsDocument = `
    query ProductAnalytics($startDate: String, $endDate: String) {
  productAnalytics(startDate: $startDate, endDate: $endDate) {
    itemName
    productLine
    itemGroup
    totalSales
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
      variables?: ProductAnalyticsQueryVariables,
      options?: UseQueryOptions<ProductAnalyticsQuery, TError, TData>,
      headers?: RequestInit['headers']
    ) => {
    
    return useQuery<ProductAnalyticsQuery, TError, TData>(
      variables === undefined ? ['ProductAnalytics'] : ['ProductAnalytics', variables],
      fetcher<ProductAnalyticsQuery, ProductAnalyticsQueryVariables>(client, ProductAnalyticsDocument, variables, headers),
      options
    )};
