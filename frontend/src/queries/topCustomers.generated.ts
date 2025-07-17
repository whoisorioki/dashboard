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
export type TopCustomersQueryVariables = Types.Exact<{
  startDate?: Types.InputMaybe<Types.Scalars['String']['input']>;
  endDate?: Types.InputMaybe<Types.Scalars['String']['input']>;
  branch?: Types.InputMaybe<Types.Scalars['String']['input']>;
  n?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  itemNames?: Types.InputMaybe<Array<Types.Scalars['String']['input']> | Types.Scalars['String']['input']>;
  salesPersons?: Types.InputMaybe<Array<Types.Scalars['String']['input']> | Types.Scalars['String']['input']>;
  branchNames?: Types.InputMaybe<Array<Types.Scalars['String']['input']> | Types.Scalars['String']['input']>;
  productLine?: Types.InputMaybe<Types.Scalars['String']['input']>;
}>;


export type TopCustomersQuery = { __typename?: 'Query', topCustomers: Array<{ __typename?: 'TopCustomerEntry', cardName: string, salesAmount: number, grossProfit: number }> };



export const TopCustomersDocument = `
    query TopCustomers($startDate: String, $endDate: String, $branch: String, $n: Int, $itemNames: [String!], $salesPersons: [String!], $branchNames: [String!], $productLine: String) {
  topCustomers(
    startDate: $startDate
    endDate: $endDate
    branch: $branch
    n: $n
    itemNames: $itemNames
    salesPersons: $salesPersons
    branchNames: $branchNames
    productLine: $productLine
  ) {
    cardName
    salesAmount
    grossProfit
  }
}
    `;

export const useTopCustomersQuery = <
      TData = TopCustomersQuery,
      TError = unknown
    >(
      client: GraphQLClient,
      variables?: TopCustomersQueryVariables,
      options?: Omit<UseQueryOptions<TopCustomersQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<TopCustomersQuery, TError, TData>['queryKey'] },
      headers?: RequestInit['headers']
    ) => {
    
    return useQuery<TopCustomersQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['TopCustomers'] : ['TopCustomers', variables],
    queryFn: fetcher<TopCustomersQuery, TopCustomersQueryVariables>(client, TopCustomersDocument, variables, headers),
    ...options
  }
    )};
