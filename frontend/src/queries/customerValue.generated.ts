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
export type CustomerValueQueryVariables = Types.Exact<{
  startDate?: Types.InputMaybe<Types.Scalars['String']['input']>;
  endDate?: Types.InputMaybe<Types.Scalars['String']['input']>;
}>;


export type CustomerValueQuery = { __typename?: 'Query', customerValue: Array<{ __typename?: 'CustomerValueEntry', cardName: string, salesAmount: number, grossProfit: number }> };



export const CustomerValueDocument = `
    query CustomerValue($startDate: String, $endDate: String) {
  customerValue(startDate: $startDate, endDate: $endDate) {
    cardName
    salesAmount
    grossProfit
  }
}
    `;

export const useCustomerValueQuery = <
      TData = CustomerValueQuery,
      TError = unknown
    >(
      client: GraphQLClient,
      variables?: CustomerValueQueryVariables,
      options?: Omit<UseQueryOptions<CustomerValueQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<CustomerValueQuery, TError, TData>['queryKey'] },
      headers?: RequestInit['headers']
    ) => {
    
    return useQuery<CustomerValueQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['CustomerValue'] : ['CustomerValue', variables],
    queryFn: fetcher<CustomerValueQuery, CustomerValueQueryVariables>(client, CustomerValueDocument, variables, headers),
    ...options
  }
    )};
