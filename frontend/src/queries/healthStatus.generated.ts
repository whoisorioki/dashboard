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
export type HealthStatusQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type HealthStatusQuery = { __typename?: 'Query', systemHealth: { __typename?: 'SystemHealth', status: string }, druidHealth: { __typename?: 'DruidHealth', druidStatus: string, isAvailable: boolean }, druidDatasources: { __typename?: 'DruidDatasources', datasources: Array<string>, count: number }, dataVersion: { __typename?: 'DataVersion', lastIngestionTime: string } };



export const HealthStatusDocument = `
    query HealthStatus {
  systemHealth {
    status
  }
  druidHealth {
    druidStatus
    isAvailable
  }
  druidDatasources {
    datasources
    count
  }
  dataVersion {
    lastIngestionTime
  }
}
    `;

export const useHealthStatusQuery = <
      TData = HealthStatusQuery,
      TError = unknown
    >(
      client: GraphQLClient,
      variables?: HealthStatusQueryVariables,
      options?: Omit<UseQueryOptions<HealthStatusQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<HealthStatusQuery, TError, TData>['queryKey'] },
      headers?: RequestInit['headers']
    ) => {
    
    return useQuery<HealthStatusQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['HealthStatus'] : ['HealthStatus', variables],
    queryFn: fetcher<HealthStatusQuery, HealthStatusQueryVariables>(client, HealthStatusDocument, variables, headers),
    ...options
  }
    )};
