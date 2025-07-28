import * as Types from '../types/graphql';

export type RevenueSummaryFieldsFragment = { __typename?: 'RevenueSummary', totalRevenue?: number | null, netSales?: number | null, grossProfit?: number | null, lineItemCount?: number | null, returnsValue?: number | null, averageTransaction?: number | null, uniqueProducts: number, uniqueBranches: number, uniqueEmployees: number, netUnitsSold?: number | null };

export type TopCustomerFieldsFragment = { __typename?: 'TopCustomerEntry', cardName: string, salesAmount?: number | null, grossProfit?: number | null };

export type MonthlySalesGrowthFieldsFragment = { __typename?: 'MonthlySalesGrowth', date: string, totalSales?: number | null, grossProfit?: number | null };


export const RevenueSummaryFieldsFragmentDoc = `
    fragment RevenueSummaryFields on RevenueSummary {
  totalRevenue
  netSales
  grossProfit
  lineItemCount
  returnsValue
  averageTransaction
  uniqueProducts
  uniqueBranches
  uniqueEmployees
  netUnitsSold
}
    `;
export const TopCustomerFieldsFragmentDoc = `
    fragment TopCustomerFields on TopCustomerEntry {
  cardName
  salesAmount
  grossProfit
}
    `;
export const MonthlySalesGrowthFieldsFragmentDoc = `
    fragment MonthlySalesGrowthFields on MonthlySalesGrowth {
  date
  totalSales
  grossProfit
}
    `;