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

export type ProductAnalytics = {
  __typename?: 'ProductAnalytics';
  averagePrice?: Maybe<Scalars['Float']['output']>;
  grossProfit?: Maybe<Scalars['Float']['output']>;
  itemGroup: Scalars['String']['output'];
  itemName: Scalars['String']['output'];
  margin?: Maybe<Scalars['Float']['output']>;
  productLine: Scalars['String']['output'];
  totalQty?: Maybe<Scalars['Float']['output']>;
  totalSales?: Maybe<Scalars['Float']['output']>;
  transactionCount: Scalars['Int']['output'];
  uniqueBranches: Scalars['Int']['output'];
};

export type ProductPerformance = {
  __typename?: 'ProductPerformance';
  product: Scalars['String']['output'];
  sales?: Maybe<Scalars['Float']['output']>;
};

export type ProfitabilityByDimension = {
  __typename?: 'ProfitabilityByDimension';
  branch?: Maybe<Scalars['String']['output']>;
  grossMargin?: Maybe<Scalars['Float']['output']>;
  grossProfit?: Maybe<Scalars['Float']['output']>;
  itemGroup?: Maybe<Scalars['String']['output']>;
  productLine?: Maybe<Scalars['String']['output']>;
};

export type Query = {
  __typename?: 'Query';
  branchGrowth: Array<BranchGrowth>;
  branchPerformance: Array<BranchPerformance>;
  branchProductHeatmap: Array<BranchProductHeatmap>;
  dashboardData: DashboardData;
  dataRange: DataRange;
  dataVersion: DataVersion;
  druidDatasources: DruidDatasources;
  druidHealth: DruidHealth;
  marginTrends: Array<MarginTrendEntry>;
  monthlySalesGrowth: Array<MonthlySalesGrowth>;
  productAnalytics: Array<ProductAnalytics>;
  profitabilityByDimension: Array<ProfitabilityByDimension>;
  returnsAnalysis: Array<ReturnsAnalysisEntry>;
  revenueSummary: RevenueSummary;
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


export type QueryProfitabilityByDimensionArgs = {
  branch?: InputMaybe<Scalars['String']['input']>;
  dimension: Scalars['String']['input'];
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
  changePercent?: Maybe<Scalars['Float']['output']>;
  grossProfit?: Maybe<Scalars['Float']['output']>;
  grossProfitChangePercent?: Maybe<Scalars['Float']['output']>;
  lineItemCount?: Maybe<Scalars['Int']['output']>;
  netSales?: Maybe<Scalars['Float']['output']>;
  netUnitsSold?: Maybe<Scalars['Float']['output']>;
  previousPeriodGrossProfit?: Maybe<Scalars['Float']['output']>;
  previousPeriodSales?: Maybe<Scalars['Float']['output']>;
  returnsValue?: Maybe<Scalars['Float']['output']>;
  totalRevenue?: Maybe<Scalars['Float']['output']>;
  totalSales?: Maybe<Scalars['Float']['output']>;
  totalTransactions: Scalars['Int']['output'];
  uniqueBranches: Scalars['Int']['output'];
  uniqueEmployees: Scalars['Int']['output'];
  uniqueProducts: Scalars['Int']['output'];
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

export type AlertsPageDataQueryVariables = Exact<{ [key: string]: never; }>;


export type AlertsPageDataQuery = { __typename?: 'Query', systemHealth: { __typename?: 'SystemHealth', status: string }, druidHealth: { __typename?: 'DruidHealth', druidStatus: string, isAvailable: boolean }, druidDatasources: { __typename?: 'DruidDatasources', datasources: Array<string>, count: number } };

export type BranchesPageDataQueryVariables = Exact<{
  startDate: Scalars['String']['input'];
  endDate: Scalars['String']['input'];
  branch?: InputMaybe<Scalars['String']['input']>;
  productLine?: InputMaybe<Scalars['String']['input']>;
  itemGroups?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
}>;


export type BranchesPageDataQuery = { __typename?: 'Query', revenueSummary: { __typename?: 'RevenueSummary', totalRevenue?: number | null, netSales?: number | null, grossProfit?: number | null, lineItemCount?: number | null, returnsValue?: number | null, totalTransactions: number, averageTransaction?: number | null, uniqueProducts: number, uniqueBranches: number, uniqueEmployees: number, netUnitsSold?: number | null }, branchPerformance: Array<{ __typename?: 'BranchPerformance', branch: string, totalSales?: number | null, transactionCount: number, averageSale?: number | null, uniqueCustomers: number, uniqueProducts: number }>, branchGrowth: Array<{ __typename?: 'BranchGrowth', branch: string, monthYear: string, monthlySales?: number | null, growthPct?: number | null }>, branchProductHeatmap: Array<{ __typename?: 'BranchProductHeatmap', branch: string, product: string, sales?: number | null }> };

export type DashboardDataQueryVariables = Exact<{
  startDate: Scalars['String']['input'];
  endDate: Scalars['String']['input'];
  branch?: InputMaybe<Scalars['String']['input']>;
  productLine?: InputMaybe<Scalars['String']['input']>;
  itemGroups?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  target?: InputMaybe<Scalars['Float']['input']>;
}>;


export type DashboardDataQuery = { __typename?: 'Query', dashboardData: { __typename?: 'DashboardData', revenueSummary: { __typename?: 'RevenueSummary', totalRevenue?: number | null, netSales?: number | null, grossProfit?: number | null, lineItemCount?: number | null, returnsValue?: number | null, totalTransactions: number, averageTransaction?: number | null, uniqueProducts: number, uniqueBranches: number, uniqueEmployees: number, netUnitsSold?: number | null }, monthlySalesGrowth: Array<{ __typename?: 'MonthlySalesGrowth', date: string, totalSales?: number | null, grossProfit?: number | null }>, targetAttainment: { __typename?: 'TargetAttainment', attainmentPercentage?: number | null, totalSales?: number | null, target?: number | null }, productPerformance: Array<{ __typename?: 'ProductPerformance', product: string, sales?: number | null }>, branchProductHeatmap: Array<{ __typename?: 'BranchProductHeatmap', branch: string, product: string, sales?: number | null }>, topCustomers: Array<{ __typename?: 'TopCustomerEntry', cardName: string, salesAmount?: number | null, grossProfit?: number | null }>, marginTrends: Array<{ __typename?: 'MarginTrendEntry', date: string, marginPct?: number | null }>, returnsAnalysis: Array<{ __typename?: 'ReturnsAnalysisEntry', reason: string, count: number }>, profitabilityByDimension: Array<{ __typename?: 'ProfitabilityByDimension', branch?: string | null, grossProfit?: number | null, grossMargin?: number | null }>, branchList: Array<{ __typename?: 'BranchListEntry', branch: string }>, productAnalytics: Array<{ __typename?: 'ProductAnalytics', itemName: string, productLine: string, itemGroup: string, totalSales?: number | null, grossProfit?: number | null, margin?: number | null, totalQty?: number | null, transactionCount: number, uniqueBranches: number, averagePrice?: number | null }> } };

export type DataRangeQueryVariables = Exact<{ [key: string]: never; }>;


export type DataRangeQuery = { __typename?: 'Query', dataRange: { __typename?: 'DataRange', earliestDate: string, latestDate: string, totalRecords: number } };

export type RevenueSummaryFieldsFragment = { __typename?: 'RevenueSummary', totalRevenue?: number | null, netSales?: number | null, grossProfit?: number | null, lineItemCount?: number | null, returnsValue?: number | null, averageTransaction?: number | null, uniqueProducts: number, uniqueBranches: number, uniqueEmployees: number, netUnitsSold?: number | null };

export type TopCustomerFieldsFragment = { __typename?: 'TopCustomerEntry', cardName: string, salesAmount?: number | null, grossProfit?: number | null };

export type MonthlySalesGrowthFieldsFragment = { __typename?: 'MonthlySalesGrowth', date: string, totalSales?: number | null, grossProfit?: number | null };

export type ProductsPageDataQueryVariables = Exact<{
  startDate: Scalars['String']['input'];
  endDate: Scalars['String']['input'];
  branch?: InputMaybe<Scalars['String']['input']>;
  productLine?: InputMaybe<Scalars['String']['input']>;
  itemGroups?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
}>;


export type ProductsPageDataQuery = { __typename?: 'Query', revenueSummary: { __typename?: 'RevenueSummary', totalRevenue?: number | null, netSales?: number | null, grossProfit?: number | null, lineItemCount?: number | null, returnsValue?: number | null, totalTransactions: number, averageTransaction?: number | null, uniqueProducts: number, uniqueBranches: number, uniqueEmployees: number, netUnitsSold?: number | null }, productAnalytics: Array<{ __typename?: 'ProductAnalytics', itemName: string, productLine: string, itemGroup: string, totalSales?: number | null, grossProfit?: number | null, margin?: number | null, totalQty?: number | null, transactionCount: number, uniqueBranches: number, averagePrice?: number | null }>, topCustomers: Array<{ __typename?: 'TopCustomerEntry', cardName: string, salesAmount?: number | null, grossProfit?: number | null }>, returnsAnalysis: Array<{ __typename?: 'ReturnsAnalysisEntry', reason: string, count: number }>, salespersonProductMix: Array<{ __typename?: 'SalespersonProductMixEntry', salesperson: string, productLine: string, avgProfitMargin?: number | null }> };

export type ProfitabilityPageDataQueryVariables = Exact<{
  startDate: Scalars['String']['input'];
  endDate: Scalars['String']['input'];
  branch?: InputMaybe<Scalars['String']['input']>;
  productLine?: InputMaybe<Scalars['String']['input']>;
  itemGroups?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  dimension: Scalars['String']['input'];
}>;


export type ProfitabilityPageDataQuery = { __typename?: 'Query', marginTrends: Array<{ __typename?: 'MarginTrendEntry', date: string, marginPct?: number | null }>, profitabilityByDimension: Array<{ __typename?: 'ProfitabilityByDimension', branch?: string | null, productLine?: string | null, itemGroup?: string | null, grossProfit?: number | null, grossMargin?: number | null }> };

export type SalesPageDataQueryVariables = Exact<{
  startDate: Scalars['String']['input'];
  endDate: Scalars['String']['input'];
  branch?: InputMaybe<Scalars['String']['input']>;
  productLine?: InputMaybe<Scalars['String']['input']>;
  itemGroups?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
}>;


export type SalesPageDataQuery = { __typename?: 'Query', revenueSummary: { __typename?: 'RevenueSummary', totalRevenue?: number | null, netSales?: number | null, grossProfit?: number | null, lineItemCount?: number | null, returnsValue?: number | null, totalTransactions: number, averageTransaction?: number | null, uniqueProducts: number, uniqueBranches: number, uniqueEmployees: number, netUnitsSold?: number | null }, monthlySalesGrowth: Array<{ __typename?: 'MonthlySalesGrowth', date: string, totalSales?: number | null, grossProfit?: number | null }>, salesPerformance: Array<{ __typename?: 'SalesPerformance', salesPerson: string, totalSales?: number | null, grossProfit?: number | null, transactionCount: number, averageSale?: number | null, uniqueBranches: number, uniqueProducts: number, avgMargin?: number | null }>, salespersonProductMix: Array<{ __typename?: 'SalespersonProductMixEntry', salesperson: string, productLine: string, avgProfitMargin?: number | null }> };
