#!/bin/bash

# This script submits a Druid native ingestion task.
# It replaces the 'sales_analytics' datasource with the 500,000 most recent rows.

curl -X 'POST' -H 'Content-Type:application/json' --data-binary @ingestion-spec.json http://localhost:8081/druid/indexer/v1/task
