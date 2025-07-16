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
export type ProfitabilityByDimensionQueryVariables = Types.Exact<{
  dimension: Types.Scalars['String']['input'];
  startDate?: Types.InputMaybe<Types.Scalars['String']['input']>;
  endDate?: Types.InputMaybe<Types.Scalars['String']['input']>;
}>;


export type ProfitabilityByDimensionQuery = { __typename?: 'Query', profitabilityByDimension: Array<{ __typename?: 'ProfitabilityByDimension', branch?: string | null, productLine?: string | null, itemGroup?: string | null, grossMargin?: number | null, grossProfit?: number | null }> };



export const ProfitabilityByDimensionDocument = `
    query ProfitabilityByDimension($dimension: String!, $startDate: String, $endDate: String) {
  profitabilityByDimension(
    dimension: $dimension
    startDate: $startDate
    endDate: $endDate
  ) {
    branch
    productLine
    itemGroup
    grossMargin
    grossProfit
  }
}
    `;

export const useProfitabilityByDimensionQuery = <
      TData = ProfitabilityByDimensionQuery,
      TError = unknown
    >(
      client: GraphQLClient,
      variables: ProfitabilityByDimensionQueryVariables,
      options?: UseQueryOptions<ProfitabilityByDimensionQuery, TError, TData>,
      headers?: RequestInit['headers']
    ) => {
    
    return useQuery<ProfitabilityByDimensionQuery, TError, TData>(
      ['ProfitabilityByDimension', variables],
      fetcher<ProfitabilityByDimensionQuery, ProfitabilityByDimensionQueryVariables>(client, ProfitabilityByDimensionDocument, variables, headers),
      options
    )};
