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
export type AlertsPageDataQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type AlertsPageDataQuery = { __typename?: 'Query', systemHealth: { __typename?: 'SystemHealth', status: string }, druidHealth: { __typename?: 'DruidHealth', druidStatus: string, isAvailable: boolean }, druidDatasources: { __typename?: 'DruidDatasources', datasources: Array<string>, count: number } };



export const AlertsPageDataDocument = `
    query AlertsPageData {
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
}
    `;

export const useAlertsPageDataQuery = <
      TData = AlertsPageDataQuery,
      TError = unknown
    >(
      client: GraphQLClient,
      variables?: AlertsPageDataQueryVariables,
      options?: Omit<UseQueryOptions<AlertsPageDataQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<AlertsPageDataQuery, TError, TData>['queryKey'] },
      headers?: RequestInit['headers']
    ) => {
    
    return useQuery<AlertsPageDataQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['AlertsPageData'] : ['AlertsPageData', variables],
    queryFn: fetcher<AlertsPageDataQuery, AlertsPageDataQueryVariables>(client, AlertsPageDataDocument, variables, headers),
    ...options
  }
    )};
