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
export type SalespersonProductMixQueryVariables = Types.Exact<{
  startDate?: Types.InputMaybe<Types.Scalars['String']['input']>;
  endDate?: Types.InputMaybe<Types.Scalars['String']['input']>;
  branch?: Types.InputMaybe<Types.Scalars['String']['input']>;
}>;


export type SalespersonProductMixQuery = { __typename?: 'Query', salespersonProductMix: Array<{ __typename?: 'SalespersonProductMixEntry', salesperson: string, productLine: string, avgProfitMargin: number }> };



export const SalespersonProductMixDocument = `
    query SalespersonProductMix($startDate: String, $endDate: String, $branch: String) {
  salespersonProductMix(startDate: $startDate, endDate: $endDate, branch: $branch) {
    salesperson
    productLine
    avgProfitMargin
  }
}
    `;

export const useSalespersonProductMixQuery = <
      TData = SalespersonProductMixQuery,
      TError = unknown
    >(
      client: GraphQLClient,
      variables?: SalespersonProductMixQueryVariables,
      options?: UseQueryOptions<SalespersonProductMixQuery, TError, TData>,
      headers?: RequestInit['headers']
    ) => {
    
    return useQuery<SalespersonProductMixQuery, TError, TData>(
      variables === undefined ? ['SalespersonProductMix'] : ['SalespersonProductMix', variables],
      fetcher<SalespersonProductMixQuery, SalespersonProductMixQueryVariables>(client, SalespersonProductMixDocument, variables, headers),
      options
    )};
