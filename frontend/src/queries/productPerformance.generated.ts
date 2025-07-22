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
export type ProductPerformanceQueryVariables = Types.Exact<{
  startDate?: Types.InputMaybe<Types.Scalars['String']['input']>;
  endDate?: Types.InputMaybe<Types.Scalars['String']['input']>;
  n?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  branch?: Types.InputMaybe<Types.Scalars['String']['input']>;
  productLine?: Types.InputMaybe<Types.Scalars['String']['input']>;
}>;


export type ProductPerformanceQuery = { __typename?: 'Query', productPerformance: Array<{ __typename?: 'ProductPerformance', product: string, sales: number }> };



export const ProductPerformanceDocument = `
    query ProductPerformance($startDate: String, $endDate: String, $n: Int, $branch: String, $productLine: String) {
  productPerformance(
    startDate: $startDate
    endDate: $endDate
    n: $n
    branch: $branch
    productLine: $productLine
  ) {
    product
    sales
  }
}
    `;

export const useProductPerformanceQuery = <
      TData = ProductPerformanceQuery,
      TError = unknown
    >(
      client: GraphQLClient,
      variables?: ProductPerformanceQueryVariables,
      options?: Omit<UseQueryOptions<ProductPerformanceQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<ProductPerformanceQuery, TError, TData>['queryKey'] },
      headers?: RequestInit['headers']
    ) => {
    
    return useQuery<ProductPerformanceQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['ProductPerformance'] : ['ProductPerformance', variables],
    queryFn: fetcher<ProductPerformanceQuery, ProductPerformanceQueryVariables>(client, ProductPerformanceDocument, variables, headers),
    ...options
  }
    )};
