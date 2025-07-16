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
}>;


export type TargetAttainmentQuery = { __typename?: 'Query', targetAttainment: { __typename?: 'TargetAttainment', attainmentPercentage: number, totalSales: number } };



export const TargetAttainmentDocument = `
    query TargetAttainment($startDate: String, $endDate: String) {
  targetAttainment(startDate: $startDate, endDate: $endDate) {
    attainmentPercentage
    totalSales
  }
}
    `;

export const useTargetAttainmentQuery = <
      TData = TargetAttainmentQuery,
      TError = unknown
    >(
      client: GraphQLClient,
      variables?: TargetAttainmentQueryVariables,
      options?: UseQueryOptions<TargetAttainmentQuery, TError, TData>,
      headers?: RequestInit['headers']
    ) => {
    
    return useQuery<TargetAttainmentQuery, TError, TData>(
      variables === undefined ? ['TargetAttainment'] : ['TargetAttainment', variables],
      fetcher<TargetAttainmentQuery, TargetAttainmentQueryVariables>(client, TargetAttainmentDocument, variables, headers),
      options
    )};
