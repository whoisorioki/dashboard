/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  Upload: { input: any; output: any; }
};

export type AlertsPageData = {
  __typename?: 'AlertsPageData';
  dataVersion: DataVersion;
  druidDatasources: DruidDatasources;
  druidHealth: DruidHealth;
  systemHealth: SystemHealth;
};

export type BranchGrowth = {
  __typename?: 'BranchGrowth';
  branch: Scalars['String']['output'];
  growthPct?: Maybe<Scalars['Float']['output']>;
  monthYear: Scalars['String']['output'];
  monthlySales?: Maybe<Scalars['Float']['output']>;
};

export type BranchListEntry = {
  __typename?: 'BranchListEntry';
  branch: Scalars['String']['output'];
};

export type BranchPerformance = {
  __typename?: 'BranchPerformance';
  averageSale?: Maybe<Scalars['Float']['output']>;
  branch: Scalars['String']['output'];
  totalSales?: Maybe<Scalars['Float']['output']>;
  transactionCount: Scalars['Int']['output'];
  uniqueCustomers: Scalars['Int']['output'];
  uniqueProducts: Scalars['Int']['output'];
};

export type BranchProductHeatmap = {
  __typename?: 'BranchProductHeatmap';
  branch: Scalars['String']['output'];
  product: Scalars['String']['output'];
  sales?: Maybe<Scalars['Float']['output']>;
};

export type DashboardData = {
  __typename?: 'DashboardData';
  branchList: Array<BranchListEntry>;
  branchProductHeatmap: Array<BranchProductHeatmap>;
  /** Current data availability status */
  dataAvailabilityStatus: DataAvailabilityStatus;
  marginTrends: Array<MarginTrendEntry>;
  monthlySalesGrowth: Array<MonthlySalesGrowth>;
  productAnalytics: Array<ProductAnalytics>;
  productPerformance: Array<ProductPerformance>;
  profitabilityByDimension: Array<ProfitabilityByDimension>;
  returnsAnalysis: Array<ReturnsAnalysisEntry>;
  revenueSummary: RevenueSummary;
  targetAttainment: TargetAttainment;
  topCustomers: Array<TopCustomerEntry>;
};

export type DataAvailabilityStatus = {
  __typename?: 'DataAvailabilityStatus';
  /** Whether Druid is connected */
  druidConnected: Scalars['Boolean']['output'];
  /** Whether fallback mode is active */
  isFallback: Scalars['Boolean']['output'];
  /** Whether mock data is being used */
  isMockData: Scalars['Boolean']['output'];
  /** Human-readable status message */
  message: Scalars['String']['output'];
  /** Current data availability status */
  status: Scalars['String']['output'];
};

export type DataRange = {
  __typename?: 'DataRange';
  earliestDate: Scalars['String']['output'];
  latestDate: Scalars['String']['output'];
  totalRecords: Scalars['Int']['output'];
};

export type DataVersion = {
  __typename?: 'DataVersion';
  lastIngestionTime: Scalars['String']['output'];
};

export type DruidDatasources = {
  __typename?: 'DruidDatasources';
  count: Scalars['Int']['output'];
  datasources: Array<Scalars['String']['output']>;
};

export type DruidHealth = {
  __typename?: 'DruidHealth';
  druidStatus: Scalars['String']['output'];
  isAvailable: Scalars['Boolean']['output'];
};

export type IngestionTaskStatus = {
  __typename?: 'IngestionTaskStatus';
  createdAt: Scalars['String']['output'];
  datasourceName: Scalars['String']['output'];
  fileSize?: Maybe<Scalars['Int']['output']>;
  originalFilename: Scalars['String']['output'];
  status: Scalars['String']['output'];
  taskId: Scalars['String']['output'];
};

export type MarginTrendEntry = {
  __typename?: 'MarginTrendEntry';
  date: Scalars['String']['output'];
  marginPct?: Maybe<Scalars['Float']['output']>;
};

export type MonthlySalesGrowth = {
  __typename?: 'MonthlySalesGrowth';
  date: Scalars['String']['output'];
  grossProfit?: Maybe<Scalars['Float']['output']>;
  totalSales?: Maybe<Scalars['Float']['output']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  uploadSalesData: IngestionTaskStatus;
};


export type MutationUploadSalesDataArgs = {
  dataSourceName: Scalars['String']['input'];
  file: Scalars['Upload']['input'];
};

export type ProductAnalytics = {
  __typename?: 'ProductAnalytics';
  averagePrice: Scalars['Float']['output'];
  grossProfit?: Maybe<Scalars['Float']['output']>;
  itemGroup: Scalars['String']['output'];
  itemName: Scalars['String']['output'];
  margin?: Maybe<Scalars['Float']['output']>;
  productLine: Scalars['String']['output'];
  totalQty: Scalars['Float']['output'];
  totalSales: Scalars['Float']['output'];
  transactionCount: Scalars['Int']['output'];
  uniqueBranches: Scalars['Int']['output'];
};

export type ProductPerformance = {
  __typename?: 'ProductPerformance';
  product: Scalars['String']['output'];
  sales?: Maybe<Scalars['Float']['output']>;
};

export type ProductsPageData = {
  __typename?: 'ProductsPageData';
  branchProductHeatmap: Array<BranchProductHeatmap>;
  monthlySalesGrowth: Array<MonthlySalesGrowth>;
  productAnalytics: Array<ProductAnalytics>;
  revenueSummary: RevenueSummary;
  topCustomers: Array<TopCustomerEntry>;
};

export type ProfitabilityByDimension = {
  __typename?: 'ProfitabilityByDimension';
  branch?: Maybe<Scalars['String']['output']>;
  grossMargin?: Maybe<Scalars['Float']['output']>;
  grossProfit?: Maybe<Scalars['Float']['output']>;
  itemGroup?: Maybe<Scalars['String']['output']>;
  productLine?: Maybe<Scalars['String']['output']>;
};

export type ProfitabilityPageData = {
  __typename?: 'ProfitabilityPageData';
  marginTrends: Array<MarginTrendEntry>;
  productAnalytics: Array<ProductAnalytics>;
  profitabilityByDimension: Array<ProfitabilityByDimension>;
  revenueSummary: RevenueSummary;
};

export type Query = {
  __typename?: 'Query';
  alertsPageData: AlertsPageData;
  branchGrowth: Array<BranchGrowth>;
  branchPerformance: Array<BranchPerformance>;
  branchProductHeatmap: Array<BranchProductHeatmap>;
  dashboardData: DashboardData;
  dataRange: DataRange;
  dataVersion: DataVersion;
  druidDatasources: DruidDatasources;
  druidHealth: DruidHealth;
  getIngestionTaskStatus?: Maybe<IngestionTaskStatus>;
  listIngestionTasks: Array<IngestionTaskStatus>;
  marginTrends: Array<MarginTrendEntry>;
  monthlySalesGrowth: Array<MonthlySalesGrowth>;
  productAnalytics: Array<ProductAnalytics>;
  productsPageData: ProductsPageData;
  profitabilityByDimension: Array<ProfitabilityByDimension>;
  profitabilityPageData: ProfitabilityPageData;
  returnsAnalysis: Array<ReturnsAnalysisEntry>;
  revenueSummary: RevenueSummary;
  salesPageData: SalesPageData;
  salesPerformance: Array<SalesPerformance>;
  salespersonProductMix: Array<SalespersonProductMixEntry>;
  systemHealth: SystemHealth;
  topCustomers: Array<TopCustomerEntry>;
};


export type QueryBranchGrowthArgs = {
  branch?: InputMaybe<Scalars['String']['input']>;
  endDate?: InputMaybe<Scalars['String']['input']>;
  itemGroups?: InputMaybe<Array<Scalars['String']['input']>>;
  productLine?: InputMaybe<Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['String']['input']>;
};


export type QueryBranchPerformanceArgs = {
  branch?: InputMaybe<Scalars['String']['input']>;
  endDate?: InputMaybe<Scalars['String']['input']>;
  itemGroups?: InputMaybe<Array<Scalars['String']['input']>>;
  productLine?: InputMaybe<Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['String']['input']>;
};


export type QueryBranchProductHeatmapArgs = {
  branch?: InputMaybe<Scalars['String']['input']>;
  endDate?: InputMaybe<Scalars['String']['input']>;
  itemGroups?: InputMaybe<Array<Scalars['String']['input']>>;
  productLine?: InputMaybe<Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['String']['input']>;
};


export type QueryDashboardDataArgs = {
  branch?: InputMaybe<Scalars['String']['input']>;
  endDate?: InputMaybe<Scalars['String']['input']>;
  itemGroups?: InputMaybe<Array<Scalars['String']['input']>>;
  productLine?: InputMaybe<Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['String']['input']>;
  target?: InputMaybe<Scalars['Float']['input']>;
};


export type QueryGetIngestionTaskStatusArgs = {
  taskId: Scalars['String']['input'];
};


export type QueryListIngestionTasksArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
};


export type QueryMarginTrendsArgs = {
  branch?: InputMaybe<Scalars['String']['input']>;
  endDate?: InputMaybe<Scalars['String']['input']>;
  itemGroups?: InputMaybe<Array<Scalars['String']['input']>>;
  productLine?: InputMaybe<Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['String']['input']>;
};


export type QueryMonthlySalesGrowthArgs = {
  branch?: InputMaybe<Scalars['String']['input']>;
  endDate?: InputMaybe<Scalars['String']['input']>;
  itemGroups?: InputMaybe<Array<Scalars['String']['input']>>;
  productLine?: InputMaybe<Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['String']['input']>;
};


export type QueryProductAnalyticsArgs = {
  branch?: InputMaybe<Scalars['String']['input']>;
  endDate?: InputMaybe<Scalars['String']['input']>;
  itemGroups?: InputMaybe<Array<Scalars['String']['input']>>;
  productLine?: InputMaybe<Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['String']['input']>;
};


export type QueryProductsPageDataArgs = {
  branch?: InputMaybe<Scalars['String']['input']>;
  endDate?: InputMaybe<Scalars['String']['input']>;
  itemGroups?: InputMaybe<Array<Scalars['String']['input']>>;
  productLine?: InputMaybe<Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['String']['input']>;
};


export type QueryProfitabilityByDimensionArgs = {
  branch?: InputMaybe<Scalars['String']['input']>;
  dimension: Scalars['String']['input'];
  endDate?: InputMaybe<Scalars['String']['input']>;
  itemGroups?: InputMaybe<Array<Scalars['String']['input']>>;
  productLine?: InputMaybe<Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['String']['input']>;
};


export type QueryProfitabilityPageDataArgs = {
  branch?: InputMaybe<Scalars['String']['input']>;
  dimension?: Scalars['String']['input'];
  endDate?: InputMaybe<Scalars['String']['input']>;
  itemGroups?: InputMaybe<Array<Scalars['String']['input']>>;
  productLine?: InputMaybe<Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['String']['input']>;
};


export type QueryReturnsAnalysisArgs = {
  branch?: InputMaybe<Scalars['String']['input']>;
  endDate?: InputMaybe<Scalars['String']['input']>;
  itemGroups?: InputMaybe<Array<Scalars['String']['input']>>;
  productLine?: InputMaybe<Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['String']['input']>;
};


export type QueryRevenueSummaryArgs = {
  branch?: InputMaybe<Scalars['String']['input']>;
  endDate?: InputMaybe<Scalars['String']['input']>;
  itemGroups?: InputMaybe<Array<Scalars['String']['input']>>;
  productLine?: InputMaybe<Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['String']['input']>;
};


export type QuerySalesPageDataArgs = {
  branch?: InputMaybe<Scalars['String']['input']>;
  endDate?: InputMaybe<Scalars['String']['input']>;
  itemGroups?: InputMaybe<Array<Scalars['String']['input']>>;
  productLine?: InputMaybe<Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['String']['input']>;
};


export type QuerySalesPerformanceArgs = {
  branch?: InputMaybe<Scalars['String']['input']>;
  endDate?: InputMaybe<Scalars['String']['input']>;
  itemGroups?: InputMaybe<Array<Scalars['String']['input']>>;
  productLine?: InputMaybe<Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['String']['input']>;
};


export type QuerySalespersonProductMixArgs = {
  branch?: InputMaybe<Scalars['String']['input']>;
  endDate?: InputMaybe<Scalars['String']['input']>;
  itemGroups?: InputMaybe<Array<Scalars['String']['input']>>;
  productLine?: InputMaybe<Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['String']['input']>;
};


export type QueryTopCustomersArgs = {
  branch?: InputMaybe<Scalars['String']['input']>;
  endDate?: InputMaybe<Scalars['String']['input']>;
  itemGroups?: InputMaybe<Array<Scalars['String']['input']>>;
  productLine?: InputMaybe<Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['String']['input']>;
};

export type ReturnsAnalysisEntry = {
  __typename?: 'ReturnsAnalysisEntry';
  count: Scalars['Int']['output'];
  reason: Scalars['String']['output'];
};

export type RevenueSummary = {
  __typename?: 'RevenueSummary';
  averageTransaction?: Maybe<Scalars['Float']['output']>;
  grossProfit?: Maybe<Scalars['Float']['output']>;
  lineItemCount?: Maybe<Scalars['Int']['output']>;
  netSales?: Maybe<Scalars['Float']['output']>;
  netUnitsSold?: Maybe<Scalars['Float']['output']>;
  returnsValue?: Maybe<Scalars['Float']['output']>;
  totalRevenue?: Maybe<Scalars['Float']['output']>;
  totalTransactions: Scalars['Int']['output'];
  uniqueBranches: Scalars['Int']['output'];
  uniqueEmployees: Scalars['Int']['output'];
  uniqueProducts: Scalars['Int']['output'];
};

export type SalesPageData = {
  __typename?: 'SalesPageData';
  monthlySalesGrowth: Array<MonthlySalesGrowth>;
  returnsAnalysis: Array<ReturnsAnalysisEntry>;
  revenueSummary: RevenueSummary;
  salesPerformance: Array<SalesPerformance>;
  salespersonProductMix: Array<SalespersonProductMixEntry>;
  topCustomers: Array<TopCustomerEntry>;
};

export type SalesPerformance = {
  __typename?: 'SalesPerformance';
  averageSale?: Maybe<Scalars['Float']['output']>;
  avgMargin?: Maybe<Scalars['Float']['output']>;
  grossProfit?: Maybe<Scalars['Float']['output']>;
  salesPerson: Scalars['String']['output'];
  totalSales?: Maybe<Scalars['Float']['output']>;
  transactionCount: Scalars['Int']['output'];
  uniqueBranches: Scalars['Int']['output'];
  uniqueProducts: Scalars['Int']['output'];
};

export type SalespersonProductMixEntry = {
  __typename?: 'SalespersonProductMixEntry';
  avgProfitMargin?: Maybe<Scalars['Float']['output']>;
  productLine: Scalars['String']['output'];
  salesperson: Scalars['String']['output'];
};

export type SystemHealth = {
  __typename?: 'SystemHealth';
  status: Scalars['String']['output'];
};

export type TargetAttainment = {
  __typename?: 'TargetAttainment';
  attainmentPercentage?: Maybe<Scalars['Float']['output']>;
  target?: Maybe<Scalars['Float']['output']>;
  totalSales?: Maybe<Scalars['Float']['output']>;
};

export type TopCustomerEntry = {
  __typename?: 'TopCustomerEntry';
  cardName: Scalars['String']['output'];
  grossProfit?: Maybe<Scalars['Float']['output']>;
  salesAmount?: Maybe<Scalars['Float']['output']>;
};

export type GetIngestionTaskStatusQueryVariables = Exact<{
  taskId: Scalars['String']['input'];
}>;


export type GetIngestionTaskStatusQuery = { __typename?: 'Query', getIngestionTaskStatus?: { __typename?: 'IngestionTaskStatus', taskId: string, status: string, datasourceName: string, originalFilename: string, fileSize?: number | null, createdAt: string } | null };


export const GetIngestionTaskStatusDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetIngestionTaskStatus"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"taskId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getIngestionTaskStatus"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"taskId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"taskId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"taskId"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"datasourceName"}},{"kind":"Field","name":{"kind":"Name","value":"originalFilename"}},{"kind":"Field","name":{"kind":"Name","value":"fileSize"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<GetIngestionTaskStatusQuery, GetIngestionTaskStatusQueryVariables>;