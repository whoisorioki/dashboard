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
export type DataRangeQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type DataRangeQuery = { __typename?: 'Query', dataRange: { __typename?: 'DataRange', earliestDate: string, latestDate: string, totalRecords: number } };



export const DataRangeDocument = `
    query DataRange {
  dataRange {
    earliestDate
    latestDate
    totalRecords
  }
}
    `;

export const useDataRangeQuery = <
      TData = DataRangeQuery,
      TError = unknown
    >(
      client: GraphQLClient,
      variables?: DataRangeQueryVariables,
      options?: UseQueryOptions<DataRangeQuery, TError, TData>,
      headers?: RequestInit['headers']
    ) => {
    
    return useQuery<DataRangeQuery, TError, TData>(
      variables === undefined ? ['DataRange'] : ['DataRange', variables],
      fetcher<DataRangeQuery, DataRangeQueryVariables>(client, DataRangeDocument, variables, headers),
      options
    )};
