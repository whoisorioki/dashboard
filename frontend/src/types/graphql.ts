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
  growthPct: Scalars['Float']['output'];
  monthYear: Scalars['String']['output'];
  monthlySales: Scalars['Float']['output'];
};

export type BranchListEntry = {
  __typename?: 'BranchListEntry';
  branch: Scalars['String']['output'];
};

export type BranchPerformance = {
  __typename?: 'BranchPerformance';
  averageSale: Scalars['Float']['output'];
  branch: Scalars['String']['output'];
  totalSales: Scalars['Float']['output'];
  transactionCount: Scalars['Int']['output'];
  uniqueCustomers: Scalars['Int']['output'];
  uniqueProducts: Scalars['Int']['output'];
};

export type BranchProductHeatmap = {
  __typename?: 'BranchProductHeatmap';
  branch: Scalars['String']['output'];
  product: Scalars['String']['output'];
  sales: Scalars['Float']['output'];
};

export type CustomerValueEntry = {
  __typename?: 'CustomerValueEntry';
  cardName: Scalars['String']['output'];
  grossProfit: Scalars['Float']['output'];
  salesAmount: Scalars['Float']['output'];
};

export type DataRange = {
  __typename?: 'DataRange';
  earliestDate: Scalars['String']['output'];
  latestDate: Scalars['String']['output'];
  totalRecords: Scalars['Int']['output'];
};

export type MarginTrendEntry = {
  __typename?: 'MarginTrendEntry';
  date: Scalars['String']['output'];
  marginPct: Scalars['Float']['output'];
};

export type MonthlySalesGrowth = {
  __typename?: 'MonthlySalesGrowth';
  date: Scalars['String']['output'];
  sales: Scalars['Float']['output'];
};

export type ProductAnalytics = {
  __typename?: 'ProductAnalytics';
  averagePrice: Scalars['Float']['output'];
  itemGroup: Scalars['String']['output'];
  itemName: Scalars['String']['output'];
  productLine: Scalars['String']['output'];
  totalQty: Scalars['Float']['output'];
  totalSales: Scalars['Float']['output'];
  transactionCount: Scalars['Int']['output'];
  uniqueBranches: Scalars['Int']['output'];
};

export type ProductPerformance = {
  __typename?: 'ProductPerformance';
  product: Scalars['String']['output'];
  sales: Scalars['Float']['output'];
};

export type ProductProfitabilityEntry = {
  __typename?: 'ProductProfitabilityEntry';
  grossProfit: Scalars['Float']['output'];
  itemName: Scalars['String']['output'];
  productLine: Scalars['String']['output'];
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
  branchList: Array<BranchListEntry>;
  branchPerformance: Array<BranchPerformance>;
  branchProductHeatmap: Array<BranchProductHeatmap>;
  customerValue: Array<CustomerValueEntry>;
  dataRange: DataRange;
  marginTrends: Array<MarginTrendEntry>;
  monthlySalesGrowth: Array<MonthlySalesGrowth>;
  productAnalytics: Array<ProductAnalytics>;
  productPerformance: Array<ProductPerformance>;
  productProfitability: Array<ProductProfitabilityEntry>;
  profitabilityByDimension: Array<ProfitabilityByDimension>;
  returnsAnalysis: Array<ReturnsAnalysisEntry>;
  revenueSummary: RevenueSummary;
  salesPerformance: Array<SalesPerformance>;
  salespersonLeaderboard: Array<SalespersonLeaderboardEntry>;
  salespersonProductMix: Array<SalespersonProductMixEntry>;
  targetAttainment: TargetAttainment;
  topCustomers: Array<TopCustomerEntry>;
};


export type QueryBranchGrowthArgs = {
  branch?: InputMaybe<Scalars['String']['input']>;
  endDate?: InputMaybe<Scalars['String']['input']>;
  productLine?: InputMaybe<Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['String']['input']>;
};


export type QueryBranchListArgs = {
  endDate?: InputMaybe<Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['String']['input']>;
};


export type QueryBranchPerformanceArgs = {
  branch?: InputMaybe<Scalars['String']['input']>;
  endDate?: InputMaybe<Scalars['String']['input']>;
  productLine?: InputMaybe<Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['String']['input']>;
};


export type QueryBranchProductHeatmapArgs = {
  branch?: InputMaybe<Scalars['String']['input']>;
  endDate?: InputMaybe<Scalars['String']['input']>;
  productLine?: InputMaybe<Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['String']['input']>;
};


export type QueryCustomerValueArgs = {
  branch?: InputMaybe<Scalars['String']['input']>;
  branchNames?: InputMaybe<Array<Scalars['String']['input']>>;
  endDate?: InputMaybe<Scalars['String']['input']>;
  itemNames?: InputMaybe<Array<Scalars['String']['input']>>;
  productLine?: InputMaybe<Scalars['String']['input']>;
  salesPersons?: InputMaybe<Array<Scalars['String']['input']>>;
  startDate?: InputMaybe<Scalars['String']['input']>;
};


export type QueryMarginTrendsArgs = {
  endDate?: InputMaybe<Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['String']['input']>;
};


export type QueryMonthlySalesGrowthArgs = {
  branch?: InputMaybe<Scalars['String']['input']>;
  endDate?: InputMaybe<Scalars['String']['input']>;
  productLine?: InputMaybe<Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['String']['input']>;
};


export type QueryProductAnalyticsArgs = {
  branch?: InputMaybe<Scalars['String']['input']>;
  endDate?: InputMaybe<Scalars['String']['input']>;
  productLine?: InputMaybe<Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['String']['input']>;
};


export type QueryProductPerformanceArgs = {
  branch?: InputMaybe<Scalars['String']['input']>;
  endDate?: InputMaybe<Scalars['String']['input']>;
  n?: InputMaybe<Scalars['Int']['input']>;
  productLine?: InputMaybe<Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['String']['input']>;
};


export type QueryProductProfitabilityArgs = {
  branch?: InputMaybe<Scalars['String']['input']>;
  endDate?: InputMaybe<Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['String']['input']>;
};


export type QueryProfitabilityByDimensionArgs = {
  branch?: InputMaybe<Scalars['String']['input']>;
  dimension: Scalars['String']['input'];
  endDate?: InputMaybe<Scalars['String']['input']>;
  productLine?: InputMaybe<Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['String']['input']>;
};


export type QueryReturnsAnalysisArgs = {
  branch?: InputMaybe<Scalars['String']['input']>;
  branchNames?: InputMaybe<Array<Scalars['String']['input']>>;
  endDate?: InputMaybe<Scalars['String']['input']>;
  itemNames?: InputMaybe<Array<Scalars['String']['input']>>;
  mockData?: InputMaybe<Scalars['Boolean']['input']>;
  productLine?: InputMaybe<Scalars['String']['input']>;
  salesPersons?: InputMaybe<Array<Scalars['String']['input']>>;
  startDate?: InputMaybe<Scalars['String']['input']>;
};


export type QueryRevenueSummaryArgs = {
  branch?: InputMaybe<Scalars['String']['input']>;
  endDate?: InputMaybe<Scalars['String']['input']>;
  productLine?: InputMaybe<Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['String']['input']>;
};


export type QuerySalesPerformanceArgs = {
  branch?: InputMaybe<Scalars['String']['input']>;
  endDate?: InputMaybe<Scalars['String']['input']>;
  productLine?: InputMaybe<Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['String']['input']>;
};


export type QuerySalespersonLeaderboardArgs = {
  branch?: InputMaybe<Scalars['String']['input']>;
  endDate?: InputMaybe<Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['String']['input']>;
};


export type QuerySalespersonProductMixArgs = {
  branch?: InputMaybe<Scalars['String']['input']>;
  endDate?: InputMaybe<Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['String']['input']>;
};


export type QueryTargetAttainmentArgs = {
  branch?: InputMaybe<Scalars['String']['input']>;
  endDate?: InputMaybe<Scalars['String']['input']>;
  productLine?: InputMaybe<Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['String']['input']>;
  target?: InputMaybe<Scalars['Float']['input']>;
};


export type QueryTopCustomersArgs = {
  branch?: InputMaybe<Scalars['String']['input']>;
  branchNames?: InputMaybe<Array<Scalars['String']['input']>>;
  endDate?: InputMaybe<Scalars['String']['input']>;
  itemNames?: InputMaybe<Array<Scalars['String']['input']>>;
  n?: InputMaybe<Scalars['Int']['input']>;
  productLine?: InputMaybe<Scalars['String']['input']>;
  salesPersons?: InputMaybe<Array<Scalars['String']['input']>>;
  startDate?: InputMaybe<Scalars['String']['input']>;
};

export type ReturnsAnalysisEntry = {
  __typename?: 'ReturnsAnalysisEntry';
  count: Scalars['Int']['output'];
  reason: Scalars['String']['output'];
};

export type RevenueSummary = {
  __typename?: 'RevenueSummary';
  averageTransaction: Scalars['Float']['output'];
  grossProfit: Scalars['Float']['output'];
  netProfit: Scalars['Float']['output'];
  totalRevenue: Scalars['Float']['output'];
  totalTransactions: Scalars['Int']['output'];
  uniqueBranches: Scalars['Int']['output'];
  uniqueEmployees: Scalars['Int']['output'];
  uniqueProducts: Scalars['Int']['output'];
};

export type SalesPerformance = {
  __typename?: 'SalesPerformance';
  averageSale: Scalars['Float']['output'];
  salesPerson: Scalars['String']['output'];
  totalSales: Scalars['Float']['output'];
  transactionCount: Scalars['Int']['output'];
  uniqueBranches: Scalars['Int']['output'];
  uniqueProducts: Scalars['Int']['output'];
};

export type SalespersonLeaderboardEntry = {
  __typename?: 'SalespersonLeaderboardEntry';
  grossProfit: Scalars['Float']['output'];
  salesAmount: Scalars['Float']['output'];
  salesperson: Scalars['String']['output'];
};

export type SalespersonProductMixEntry = {
  __typename?: 'SalespersonProductMixEntry';
  avgProfitMargin: Scalars['Float']['output'];
  productLine: Scalars['String']['output'];
  salesperson: Scalars['String']['output'];
};

export type TargetAttainment = {
  __typename?: 'TargetAttainment';
  attainmentPercentage: Scalars['Float']['output'];
  target: Scalars['Float']['output'];
  totalSales: Scalars['Float']['output'];
};

export type TopCustomerEntry = {
  __typename?: 'TopCustomerEntry';
  cardName: Scalars['String']['output'];
  grossProfit: Scalars['Float']['output'];
  salesAmount: Scalars['Float']['output'];
};

export type BranchGrowthQueryVariables = Exact<{
  startDate?: InputMaybe<Scalars['String']['input']>;
  endDate?: InputMaybe<Scalars['String']['input']>;
}>;


export type BranchGrowthQuery = { __typename?: 'Query', branchGrowth: Array<{ __typename?: 'BranchGrowth', branch: string, monthYear: string, monthlySales: number, growthPct: number }> };

export type BranchListQueryVariables = Exact<{
  startDate?: InputMaybe<Scalars['String']['input']>;
  endDate?: InputMaybe<Scalars['String']['input']>;
}>;


export type BranchListQuery = { __typename?: 'Query', branchList: Array<{ __typename?: 'BranchListEntry', branch: string }> };

export type BranchPerformanceQueryVariables = Exact<{
  startDate?: InputMaybe<Scalars['String']['input']>;
  endDate?: InputMaybe<Scalars['String']['input']>;
}>;


export type BranchPerformanceQuery = { __typename?: 'Query', branchPerformance: Array<{ __typename?: 'BranchPerformance', branch: string, totalSales: number, transactionCount: number, averageSale: number, uniqueCustomers: number, uniqueProducts: number }> };

export type BranchProductHeatmapQueryVariables = Exact<{
  startDate?: InputMaybe<Scalars['String']['input']>;
  endDate?: InputMaybe<Scalars['String']['input']>;
}>;


export type BranchProductHeatmapQuery = { __typename?: 'Query', branchProductHeatmap: Array<{ __typename?: 'BranchProductHeatmap', branch: string, product: string, sales: number }> };

export type CustomerValueQueryVariables = Exact<{
  startDate?: InputMaybe<Scalars['String']['input']>;
  endDate?: InputMaybe<Scalars['String']['input']>;
}>;


export type CustomerValueQuery = { __typename?: 'Query', customerValue: Array<{ __typename?: 'CustomerValueEntry', cardName: string, salesAmount: number, grossProfit: number }> };

export type DataRangeQueryVariables = Exact<{ [key: string]: never; }>;


export type DataRangeQuery = { __typename?: 'Query', dataRange: { __typename?: 'DataRange', earliestDate: string, latestDate: string, totalRecords: number } };

export type MarginTrendsQueryVariables = Exact<{
  startDate?: InputMaybe<Scalars['String']['input']>;
  endDate?: InputMaybe<Scalars['String']['input']>;
}>;


export type MarginTrendsQuery = { __typename?: 'Query', marginTrends: Array<{ __typename?: 'MarginTrendEntry', date: string, marginPct: number }> };

export type MonthlySalesGrowthQueryVariables = Exact<{
  startDate?: InputMaybe<Scalars['String']['input']>;
  endDate?: InputMaybe<Scalars['String']['input']>;
}>;


export type MonthlySalesGrowthQuery = { __typename?: 'Query', monthlySalesGrowth: Array<{ __typename?: 'MonthlySalesGrowth', date: string, sales: number }> };

export type ProductAnalyticsQueryVariables = Exact<{
  startDate?: InputMaybe<Scalars['String']['input']>;
  endDate?: InputMaybe<Scalars['String']['input']>;
}>;


export type ProductAnalyticsQuery = { __typename?: 'Query', productAnalytics: Array<{ __typename?: 'ProductAnalytics', itemName: string, productLine: string, itemGroup: string, totalSales: number, totalQty: number, transactionCount: number, uniqueBranches: number, averagePrice: number }> };

export type ProductPerformanceQueryVariables = Exact<{
  startDate?: InputMaybe<Scalars['String']['input']>;
  endDate?: InputMaybe<Scalars['String']['input']>;
  n?: InputMaybe<Scalars['Int']['input']>;
}>;


export type ProductPerformanceQuery = { __typename?: 'Query', productPerformance: Array<{ __typename?: 'ProductPerformance', product: string, sales: number }> };

export type ProductProfitabilityQueryVariables = Exact<{
  startDate?: InputMaybe<Scalars['String']['input']>;
  endDate?: InputMaybe<Scalars['String']['input']>;
  branch?: InputMaybe<Scalars['String']['input']>;
}>;


export type ProductProfitabilityQuery = { __typename?: 'Query', productProfitability: Array<{ __typename?: 'ProductProfitabilityEntry', productLine: string, itemName: string, grossProfit: number }> };

export type ProfitabilityByDimensionQueryVariables = Exact<{
  dimension: Scalars['String']['input'];
  startDate?: InputMaybe<Scalars['String']['input']>;
  endDate?: InputMaybe<Scalars['String']['input']>;
}>;


export type ProfitabilityByDimensionQuery = { __typename?: 'Query', profitabilityByDimension: Array<{ __typename?: 'ProfitabilityByDimension', branch?: string | null, productLine?: string | null, itemGroup?: string | null, grossMargin?: number | null, grossProfit?: number | null }> };

export type ReturnsAnalysisQueryVariables = Exact<{
  startDate?: InputMaybe<Scalars['String']['input']>;
  endDate?: InputMaybe<Scalars['String']['input']>;
  itemNames?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  salesPersons?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  branchNames?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  branch?: InputMaybe<Scalars['String']['input']>;
  productLine?: InputMaybe<Scalars['String']['input']>;
  mockData?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type ReturnsAnalysisQuery = { __typename?: 'Query', returnsAnalysis: Array<{ __typename?: 'ReturnsAnalysisEntry', reason: string, count: number }> };

export type RevenueSummaryQueryVariables = Exact<{
  startDate?: InputMaybe<Scalars['String']['input']>;
  endDate?: InputMaybe<Scalars['String']['input']>;
}>;


export type RevenueSummaryQuery = { __typename?: 'Query', revenueSummary: { __typename?: 'RevenueSummary', totalRevenue: number, grossProfit: number, netProfit: number, totalTransactions: number, averageTransaction: number, uniqueProducts: number, uniqueBranches: number, uniqueEmployees: number } };

export type SalesPerformanceQueryVariables = Exact<{
  startDate?: InputMaybe<Scalars['String']['input']>;
  endDate?: InputMaybe<Scalars['String']['input']>;
}>;


export type SalesPerformanceQuery = { __typename?: 'Query', salesPerformance: Array<{ __typename?: 'SalesPerformance', salesPerson: string, totalSales: number, transactionCount: number, averageSale: number, uniqueBranches: number, uniqueProducts: number }> };

export type SalespersonLeaderboardQueryVariables = Exact<{
  startDate?: InputMaybe<Scalars['String']['input']>;
  endDate?: InputMaybe<Scalars['String']['input']>;
  branch?: InputMaybe<Scalars['String']['input']>;
}>;


export type SalespersonLeaderboardQuery = { __typename?: 'Query', salespersonLeaderboard: Array<{ __typename?: 'SalespersonLeaderboardEntry', salesperson: string, salesAmount: number, grossProfit: number }> };

export type SalespersonProductMixQueryVariables = Exact<{
  startDate?: InputMaybe<Scalars['String']['input']>;
  endDate?: InputMaybe<Scalars['String']['input']>;
  branch?: InputMaybe<Scalars['String']['input']>;
}>;


export type SalespersonProductMixQuery = { __typename?: 'Query', salespersonProductMix: Array<{ __typename?: 'SalespersonProductMixEntry', salesperson: string, productLine: string, avgProfitMargin: number }> };

export type TargetAttainmentQueryVariables = Exact<{
  startDate?: InputMaybe<Scalars['String']['input']>;
  endDate?: InputMaybe<Scalars['String']['input']>;
  target?: InputMaybe<Scalars['Float']['input']>;
}>;


export type TargetAttainmentQuery = { __typename?: 'Query', targetAttainment: { __typename?: 'TargetAttainment', attainmentPercentage: number, totalSales: number, target: number } };

export type TopCustomersQueryVariables = Exact<{
  startDate?: InputMaybe<Scalars['String']['input']>;
  endDate?: InputMaybe<Scalars['String']['input']>;
  branch?: InputMaybe<Scalars['String']['input']>;
  n?: InputMaybe<Scalars['Int']['input']>;
  itemNames?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  salesPersons?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  branchNames?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  productLine?: InputMaybe<Scalars['String']['input']>;
}>;


export type TopCustomersQuery = { __typename?: 'Query', topCustomers: Array<{ __typename?: 'TopCustomerEntry', cardName: string, salesAmount: number, grossProfit: number }> };
