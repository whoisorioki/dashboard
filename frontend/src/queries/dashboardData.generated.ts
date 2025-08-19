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
export type DashboardDataVariables = Types.Exact<{
  startDate: Types.Scalars['String']['input'];
  endDate: Types.Scalars['String']['input'];
  branch?: Types.InputMaybe<Types.Scalars['String']['input']>;
  productLine?: Types.InputMaybe<Types.Scalars['String']['input']>;
  itemGroups?: Types.InputMaybe<Array<Types.Scalars['String']['input']> | Types.Scalars['String']['input']>;
  target?: Types.InputMaybe<Types.Scalars['Float']['input']>;
}>;


export type DashboardData = { __typename?: 'Query', dashboardData: { __typename?: 'DashboardData', revenueSummary: { __typename?: 'RevenueSummary', totalRevenue?: number | null, netSales?: number | null, grossProfit?: number | null, lineItemCount?: number | null, returnsValue?: number | null, totalTransactions: number, averageTransaction?: number | null, uniqueProducts: number, uniqueBranches: number, uniqueEmployees: number, netUnitsSold?: number | null }, monthlySalesGrowth: Array<{ __typename?: 'MonthlySalesGrowth', date: string, totalSales?: number | null, grossProfit?: number | null }>, targetAttainment: { __typename?: 'TargetAttainment', attainmentPercentage?: number | null, totalSales?: number | null, target?: number | null }, productPerformance: Array<{ __typename?: 'ProductPerformance', product: string, sales?: number | null }>, branchProductHeatmap: Array<{ __typename?: 'BranchProductHeatmap', branch: string, product: string, sales?: number | null }>, topCustomers: Array<{ __typename?: 'TopCustomerEntry', cardName: string, salesAmount?: number | null, grossProfit?: number | null }>, marginTrends: Array<{ __typename?: 'MarginTrendEntry', date: string, marginPct?: number | null }>, returnsAnalysis: Array<{ __typename?: 'ReturnsAnalysisEntry', reason: string, count: number }>, profitabilityByDimension: Array<{ __typename?: 'ProfitabilityByDimension', branch?: string | null, grossProfit?: number | null, grossMargin?: number | null }>, branchList: Array<{ __typename?: 'BranchListEntry', branch: string }>, productAnalytics: Array<{ __typename?: 'ProductAnalytics', itemName: string, productLine: string, itemGroup: string, totalSales: number, grossProfit?: number | null, margin?: number | null, totalQty: number, transactionCount: number, uniqueBranches: number, averagePrice: number }>, dataAvailabilityStatus: { __typename?: 'DataAvailabilityStatus', status: string, isMockData: boolean, isFallback: boolean, druidConnected: boolean, message: string } }, systemHealth: { __typename?: 'SystemHealth', status: string }, druidHealth: { __typename?: 'DruidHealth', druidStatus: string, isAvailable: boolean }, druidDatasources: { __typename?: 'DruidDatasources', datasources: Array<string>, count: number }, dataRange: { __typename?: 'DataRange', earliestDate: string, latestDate: string, totalRecords: number }, salesPerformance: Array<{ __typename?: 'SalesPerformance', salesPerson: string, totalSales?: number | null, grossProfit?: number | null, transactionCount: number, averageSale?: number | null, uniqueBranches: number, uniqueProducts: number, avgMargin?: number | null }>, salespersonProductMix: Array<{ __typename?: 'SalespersonProductMixEntry', salesperson: string, productLine: string, avgProfitMargin?: number | null }>, branchPerformance: Array<{ __typename?: 'BranchPerformance', branch: string, totalSales?: number | null, transactionCount: number, averageSale?: number | null, uniqueCustomers: number, uniqueProducts: number }>, branchGrowth: Array<{ __typename?: 'BranchGrowth', branch: string, monthYear: string, monthlySales?: number | null, growthPct?: number | null }> };



export const DashboardDataDocument = `
    query DashboardData($startDate: String!, $endDate: String!, $branch: String, $productLine: String, $itemGroups: [String!], $target: Float) {
  dashboardData(
    startDate: $startDate
    endDate: $endDate
    branch: $branch
    productLine: $productLine
    itemGroups: $itemGroups
    target: $target
  ) {
    revenueSummary {
      totalRevenue
      netSales
      grossProfit
      lineItemCount
      returnsValue
      totalTransactions
      averageTransaction
      uniqueProducts
      uniqueBranches
      uniqueEmployees
      netUnitsSold
    }
    monthlySalesGrowth {
      date
      totalSales
      grossProfit
    }
    targetAttainment {
      attainmentPercentage
      totalSales
      target
    }
    productPerformance {
      product
      sales
    }
    branchProductHeatmap {
      branch
      product
      sales
    }
    topCustomers {
      cardName
      salesAmount
      grossProfit
    }
    marginTrends {
      date
      marginPct
    }
    returnsAnalysis {
      reason
      count
    }
    profitabilityByDimension {
      branch
      grossProfit
      grossMargin
    }
    branchList {
      branch
    }
    productAnalytics {
      itemName
      productLine
      itemGroup
      totalSales
      grossProfit
      margin
      totalQty
      transactionCount
      uniqueBranches
      averagePrice
    }
    dataAvailabilityStatus {
      status
      isMockData
      isFallback
      druidConnected
      message
    }
  }
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
  dataRange {
    earliestDate
    latestDate
    totalRecords
  }
  salesPerformance {
    salesPerson
    totalSales
    grossProfit
    transactionCount
    averageSale
    uniqueBranches
    uniqueProducts
    avgMargin
  }
  salespersonProductMix {
    salesperson
    productLine
    avgProfitMargin
  }
  branchPerformance {
    branch
    totalSales
    transactionCount
    averageSale
    uniqueCustomers
    uniqueProducts
  }
  branchGrowth {
    branch
    monthYear
    monthlySales
    growthPct
  }
}
    `;

export const useDashboardData = <
      TData = Types.DashboardData,
      TError = unknown
    >(
      client: GraphQLClient,
      variables: Types.DashboardDataVariables,
      options?: Omit<UseQueryOptions<Types.DashboardData, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<Types.DashboardData, TError, TData>['queryKey'] },
      headers?: RequestInit['headers']
    ) => {
    
    return useQuery<Types.DashboardData, TError, TData>(
      {
    queryKey: ['DashboardData', variables],
    queryFn: fetcher<Types.DashboardData, Types.DashboardDataVariables>(client, DashboardDataDocument, variables, headers),
    ...options
  }
    )};
