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
export type MonthlySalesGrowthQueryVariables = Types.Exact<{
  startDate: Types.Scalars['String']['input'];
  endDate: Types.Scalars['String']['input'];
  branch?: Types.InputMaybe<Types.Scalars['String']['input']>;
  productLine?: Types.InputMaybe<Types.Scalars['String']['input']>;
}>;


export type MonthlySalesGrowthQuery = { __typename?: 'Query', monthlySalesGrowth: Array<{ __typename?: 'MonthlySalesGrowth', date: string, totalSales?: number | null, grossProfit?: number | null }> };



export const MonthlySalesGrowthDocument = `
    query monthlySalesGrowth($startDate: String!, $endDate: String!, $branch: String, $productLine: String) {
  monthlySalesGrowth(
    startDate: $startDate
    endDate: $endDate
    branch: $branch
    productLine: $productLine
  ) {
    date
    totalSales
    grossProfit
  }
}
    `;

export const useMonthlySalesGrowthQuery = <
      TData = MonthlySalesGrowthQuery,
      TError = unknown
    >(
      client: GraphQLClient,
      variables: MonthlySalesGrowthQueryVariables,
      options?: Omit<UseQueryOptions<MonthlySalesGrowthQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<MonthlySalesGrowthQuery, TError, TData>['queryKey'] },
      headers?: RequestInit['headers']
    ) => {
    
    return useQuery<MonthlySalesGrowthQuery, TError, TData>(
      {
    queryKey: ['monthlySalesGrowth', variables],
    queryFn: fetcher<MonthlySalesGrowthQuery, MonthlySalesGrowthQueryVariables>(client, MonthlySalesGrowthDocument, variables, headers),
    ...options
  }
    )};
