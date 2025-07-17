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
export type ProductProfitabilityQueryVariables = Types.Exact<{
  startDate?: Types.InputMaybe<Types.Scalars['String']['input']>;
  endDate?: Types.InputMaybe<Types.Scalars['String']['input']>;
  branch?: Types.InputMaybe<Types.Scalars['String']['input']>;
}>;


export type ProductProfitabilityQuery = { __typename?: 'Query', productProfitability: Array<{ __typename?: 'ProductProfitabilityEntry', productLine: string, itemName: string, grossProfit: number }> };



export const ProductProfitabilityDocument = `
    query ProductProfitability($startDate: String, $endDate: String, $branch: String) {
  productProfitability(startDate: $startDate, endDate: $endDate, branch: $branch) {
    productLine
    itemName
    grossProfit
  }
}
    `;

export const useProductProfitabilityQuery = <
      TData = ProductProfitabilityQuery,
      TError = unknown
    >(
      client: GraphQLClient,
      variables?: ProductProfitabilityQueryVariables,
      options?: Omit<UseQueryOptions<ProductProfitabilityQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<ProductProfitabilityQuery, TError, TData>['queryKey'] },
      headers?: RequestInit['headers']
    ) => {
    
    return useQuery<ProductProfitabilityQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['ProductProfitability'] : ['ProductProfitability', variables],
    queryFn: fetcher<ProductProfitabilityQuery, ProductProfitabilityQueryVariables>(client, ProductProfitabilityDocument, variables, headers),
    ...options
  }
    )};
