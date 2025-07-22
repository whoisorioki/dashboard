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
export type BranchGrowthQueryVariables = Types.Exact<{
  startDate?: Types.InputMaybe<Types.Scalars['String']['input']>;
  endDate?: Types.InputMaybe<Types.Scalars['String']['input']>;
  branch?: Types.InputMaybe<Types.Scalars['String']['input']>;
  productLine?: Types.InputMaybe<Types.Scalars['String']['input']>;
}>;


export type BranchGrowthQuery = { __typename?: 'Query', branchGrowth: Array<{ __typename?: 'BranchGrowth', branch: string, monthYear: string, monthlySales: number, growthPct: number }> };



export const BranchGrowthDocument = `
    query BranchGrowth($startDate: String, $endDate: String, $branch: String, $productLine: String) {
  branchGrowth(
    startDate: $startDate
    endDate: $endDate
    branch: $branch
    productLine: $productLine
  ) {
    branch
    monthYear
    monthlySales
    growthPct
  }
}
    `;

export const useBranchGrowthQuery = <
      TData = BranchGrowthQuery,
      TError = unknown
    >(
      client: GraphQLClient,
      variables?: BranchGrowthQueryVariables,
      options?: Omit<UseQueryOptions<BranchGrowthQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<BranchGrowthQuery, TError, TData>['queryKey'] },
      headers?: RequestInit['headers']
    ) => {
    
    return useQuery<BranchGrowthQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['BranchGrowth'] : ['BranchGrowth', variables],
    queryFn: fetcher<BranchGrowthQuery, BranchGrowthQueryVariables>(client, BranchGrowthDocument, variables, headers),
    ...options
  }
    )};
