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
  startDate?: Types.InputMaybe<Types.Scalars['String']['input']>;
  endDate?: Types.InputMaybe<Types.Scalars['String']['input']>;
}>;


export type BranchProductHeatmapQuery = { __typename?: 'Query', branchProductHeatmap: Array<{ __typename?: 'BranchProductHeatmap', branch: string, product: string, sales: number }> };



export const BranchProductHeatmapDocument = `
    query BranchProductHeatmap($startDate: String, $endDate: String) {
  branchProductHeatmap(startDate: $startDate, endDate: $endDate) {
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
      variables?: BranchProductHeatmapQueryVariables,
      options?: UseQueryOptions<BranchProductHeatmapQuery, TError, TData>,
      headers?: RequestInit['headers']
    ) => {
    
    return useQuery<BranchProductHeatmapQuery, TError, TData>(
      variables === undefined ? ['BranchProductHeatmap'] : ['BranchProductHeatmap', variables],
      fetcher<BranchProductHeatmapQuery, BranchProductHeatmapQueryVariables>(client, BranchProductHeatmapDocument, variables, headers),
      options
    )};
