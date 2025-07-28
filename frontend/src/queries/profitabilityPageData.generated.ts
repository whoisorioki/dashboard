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
export type ProfitabilityPageDataQueryVariables = Types.Exact<{
  startDate: Types.Scalars['String']['input'];
  endDate: Types.Scalars['String']['input'];
  branch?: Types.InputMaybe<Types.Scalars['String']['input']>;
  productLine?: Types.InputMaybe<Types.Scalars['String']['input']>;
  dimension: Types.Scalars['String']['input'];
}>;


export type ProfitabilityPageDataQuery = { __typename?: 'Query', marginTrends: Array<{ __typename?: 'MarginTrendEntry', date: string, marginPct?: number | null }>, profitabilityByDimension: Array<{ __typename?: 'ProfitabilityByDimension', branch?: string | null, productLine?: string | null, itemGroup?: string | null, grossProfit?: number | null, grossMargin?: number | null }> };



export const ProfitabilityPageDataDocument = `
    query ProfitabilityPageData($startDate: String!, $endDate: String!, $branch: String, $productLine: String, $dimension: String!) {
  marginTrends(
    startDate: $startDate
    endDate: $endDate
    branch: $branch
    productLine: $productLine
  ) {
    date
    marginPct
  }
  profitabilityByDimension(
    dimension: $dimension
    startDate: $startDate
    endDate: $endDate
    branch: $branch
    productLine: $productLine
  ) {
    branch
    productLine
    itemGroup
    grossProfit
    grossMargin
  }
}
    `;

export const useProfitabilityPageDataQuery = <
      TData = ProfitabilityPageDataQuery,
      TError = unknown
    >(
      client: GraphQLClient,
      variables: ProfitabilityPageDataQueryVariables,
      options?: Omit<UseQueryOptions<ProfitabilityPageDataQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<ProfitabilityPageDataQuery, TError, TData>['queryKey'] },
      headers?: RequestInit['headers']
    ) => {
    
    return useQuery<ProfitabilityPageDataQuery, TError, TData>(
      {
    queryKey: ['ProfitabilityPageData', variables],
    queryFn: fetcher<ProfitabilityPageDataQuery, ProfitabilityPageDataQueryVariables>(client, ProfitabilityPageDataDocument, variables, headers),
    ...options
  }
    )};
