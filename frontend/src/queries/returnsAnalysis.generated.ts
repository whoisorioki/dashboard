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
export type ReturnsAnalysisQueryVariables = Types.Exact<{
  startDate?: Types.InputMaybe<Types.Scalars['String']['input']>;
  endDate?: Types.InputMaybe<Types.Scalars['String']['input']>;
  itemNames?: Types.InputMaybe<Array<Types.Scalars['String']['input']> | Types.Scalars['String']['input']>;
  salesPersons?: Types.InputMaybe<Array<Types.Scalars['String']['input']> | Types.Scalars['String']['input']>;
  branchNames?: Types.InputMaybe<Array<Types.Scalars['String']['input']> | Types.Scalars['String']['input']>;
  branch?: Types.InputMaybe<Types.Scalars['String']['input']>;
  productLine?: Types.InputMaybe<Types.Scalars['String']['input']>;
}>;


export type ReturnsAnalysisQuery = { __typename?: 'Query', returnsAnalysis: Array<{ __typename?: 'ReturnsAnalysisEntry', reason: string, count: number }> };



export const ReturnsAnalysisDocument = `
    query ReturnsAnalysis($startDate: String, $endDate: String, $itemNames: [String!], $salesPersons: [String!], $branchNames: [String!], $branch: String, $productLine: String) {
  returnsAnalysis(
    startDate: $startDate
    endDate: $endDate
    itemNames: $itemNames
    salesPersons: $salesPersons
    branchNames: $branchNames
    branch: $branch
    productLine: $productLine
  ) {
    reason
    count
  }
}
    `;

export const useReturnsAnalysisQuery = <
      TData = ReturnsAnalysisQuery,
      TError = unknown
    >(
      client: GraphQLClient,
      variables?: ReturnsAnalysisQueryVariables,
      options?: Omit<UseQueryOptions<ReturnsAnalysisQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<ReturnsAnalysisQuery, TError, TData>['queryKey'] },
      headers?: RequestInit['headers']
    ) => {
    
    return useQuery<ReturnsAnalysisQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['ReturnsAnalysis'] : ['ReturnsAnalysis', variables],
    queryFn: fetcher<ReturnsAnalysisQuery, ReturnsAnalysisQueryVariables>(client, ReturnsAnalysisDocument, variables, headers),
    ...options
  }
    )};
