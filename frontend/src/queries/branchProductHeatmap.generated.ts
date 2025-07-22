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
export type BranchProductHeatmapQueryVariables = Types.Exact<{
  startDate: Types.Scalars['String']['input'];
  endDate: Types.Scalars['String']['input'];
  branch?: Types.InputMaybe<Types.Scalars['String']['input']>;
  productLine?: Types.InputMaybe<Types.Scalars['String']['input']>;
}>;


export type BranchProductHeatmapQuery = { __typename?: 'Query', branchProductHeatmap: Array<{ __typename?: 'BranchProductHeatmap', branch: string, product: string, sales: number }> };



export const BranchProductHeatmapDocument = `
    query branchProductHeatmap($startDate: String!, $endDate: String!, $branch: String, $productLine: String) {
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
}
    `;

export const useBranchProductHeatmapQuery = <
      TData = BranchProductHeatmapQuery,
      TError = unknown
    >(
      client: GraphQLClient,
      variables: BranchProductHeatmapQueryVariables,
      options?: Omit<UseQueryOptions<BranchProductHeatmapQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<BranchProductHeatmapQuery, TError, TData>['queryKey'] },
      headers?: RequestInit['headers']
    ) => {
    
    return useQuery<BranchProductHeatmapQuery, TError, TData>(
      {
    queryKey: ['branchProductHeatmap', variables],
    queryFn: fetcher<BranchProductHeatmapQuery, BranchProductHeatmapQueryVariables>(client, BranchProductHeatmapDocument, variables, headers),
    ...options
  }
    )};
