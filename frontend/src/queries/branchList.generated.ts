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
export type BranchListQueryVariables = Types.Exact<{
  startDate?: Types.InputMaybe<Types.Scalars['String']['input']>;
  endDate?: Types.InputMaybe<Types.Scalars['String']['input']>;
}>;


export type BranchListQuery = { __typename?: 'Query', branchList: Array<{ __typename?: 'BranchListEntry', branch: string }> };



export const BranchListDocument = `
    query BranchList($startDate: String, $endDate: String) {
  branchList(startDate: $startDate, endDate: $endDate) {
    branch
  }
}
    `;

export const useBranchListQuery = <
      TData = BranchListQuery,
      TError = unknown
    >(
      client: GraphQLClient,
      variables?: BranchListQueryVariables,
      options?: Omit<UseQueryOptions<BranchListQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<BranchListQuery, TError, TData>['queryKey'] },
      headers?: RequestInit['headers']
    ) => {
    
    return useQuery<BranchListQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['BranchList'] : ['BranchList', variables],
    queryFn: fetcher<BranchListQuery, BranchListQueryVariables>(client, BranchListDocument, variables, headers),
    ...options
  }
    )};
