REPLACE INTO sales_analytics
OVERWRITE ALL
SELECT
    TIME_FLOOR(parsed_timestamp, 'P1D') AS __time,
    COALESCE(NULLIF("ProductLine", 'SELECT'), 'Unknown') AS "ProductLine",
    COALESCE("ItemGroup", 'Unknown') AS "ItemGroup",
    "Branch",
    "SalesPerson",
    "AcctName",
    "ItemName",
    "CardName",
    SUM(CASE WHEN "DocType" = 'AR Invoice' THEN "SalesAmount" ELSE 0 END) AS "grossRevenue",
    SUM(CASE WHEN "DocType" = 'AR Credit Note' THEN "SalesAmount" ELSE 0 END) AS "returnsValue",
    SUM(CASE WHEN "DocType" = 'AR Invoice' THEN "SalesQty" ELSE 0 END) AS "unitsSold",
    SUM(CASE WHEN "DocType" = 'AR Credit Note' THEN "SalesQty" ELSE 0 END) AS "unitsReturned",
    SUM("CostOfSales") AS "totalCost",
    COUNT(*) AS "lineItemCount"
FROM (
    SELECT *,
        COALESCE(TIME_PARSE("DocDate", 'yyyy-MM-dd HH:mm:ss', 'UTC'), TIMESTAMP '1970-01-01') AS parsed_timestamp,
        "DocDate" AS original_date -- Keep original for debugging
    FROM TABLE(
        EXTERN(
            '{"type":"sql","database":{"type":"postgresql","connectorConfig":{"connectURI":"jdbc:postgresql://192.168.1.30:5432/DataCentral","user":"DataReader","password":"Security@321"}},"sqls":["SELECT to_char(\"DocDate\", ''YYYY-MM-DD 00:00:00'') AS \"DocDate\", \"ProductLine\", \"ItemGroup\", \"Branch\", \"SalesPerson\", \"AcctName\", \"ItemName\", \"CardName\", \"DocType\", \"SalesAmount\", \"SalesQty\", \"CostOfSales\" FROM \"Sales\" ORDER BY \"DocDate\" DESC LIMIT 500000"]}',
            '{"type":"json"}',
            '[{"name":"DocDate","type":"string"},{"name":"ProductLine","type":"string"},{"name":"ItemGroup","type":"string"},{"name":"Branch","type":"string"},{"name":"SalesPerson","type":"string"},{"name":"AcctName","type":"string"},{"name":"ItemName","type":"string"},{"name":"CardName","type":"string"},{"name":"DocType","type":"string"},{"name":"SalesAmount","type":"double"},{"name":"SalesQty","type":"double"},{"name":"CostOfSales","type":"double"}]'
        )
    )
) AS sub
WHERE "DocDate" IS NOT NULL
GROUP BY 1, 2, 3, 4, 5, 6, 7, 8
PARTITIONED BY DAY
CLUSTERED BY "Branch", "ProductLine", "SalesPerson"