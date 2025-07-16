// Raw Druid Schema Types - Exact field names from Druid
export interface DruidSalesData {
  __time: string;
  productLine: string;
  itemGroup: string;
  branch: string;
  salesPerson: string;
  acctName: string;
  itemName: string;
  cardName: string;
  grossRevenue: number;
  returnsValue: number;
  unitsSold: number;
  unitsReturned: number;
  totalCost: number;
  lineItemCount: number;
}

// API Options Type
export interface UseApiOptions {
  [key: string]: string | number | boolean | undefined;
}
