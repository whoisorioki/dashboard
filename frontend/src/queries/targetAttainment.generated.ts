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
export type TargetAttainmentQueryVariables = Types.Exact<{
  startDate?: Types.InputMaybe<Types.Scalars['String']['input']>;
  endDate?: Types.InputMaybe<Types.Scalars['String']['input']>;
  target?: Types.InputMaybe<Types.Scalars['Float']['input']>;
}>;


export type TargetAttainmentQuery = { __typename?: 'Query', targetAttainment: { __typename?: 'TargetAttainment', totalSales: number, attainmentPercentage: number } };



export const TargetAttainmentDocument = `
    query TargetAttainment($startDate: String, $endDate: String, $target: Float) {
  targetAttainment(startDate: $startDate, endDate: $endDate, target: $target) {
    totalSales
    attainmentPercentage
  }
}
    `;

export const useTargetAttainmentQuery = <
      TData = TargetAttainmentQuery,
      TError = unknown
    >(
      client: GraphQLClient,
      variables?: TargetAttainmentQueryVariables,
      options?: Omit<UseQueryOptions<TargetAttainmentQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<TargetAttainmentQuery, TError, TData>['queryKey'] },
      headers?: RequestInit['headers']
    ) => {
    
    return useQuery<TargetAttainmentQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['TargetAttainment'] : ['TargetAttainment', variables],
    queryFn: fetcher<TargetAttainmentQuery, TargetAttainmentQueryVariables>(client, TargetAttainmentDocument, variables, headers),
    ...options
  }
    )};
