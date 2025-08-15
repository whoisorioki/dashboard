# Mock Data System - Sales Analytics Dashboard

## 🎯 Overview

The Sales Analytics Dashboard includes a comprehensive mock data system that provides realistic fallback data when real data sources are unavailable. This system ensures the dashboard remains functional for development, testing, and demonstration purposes.

## 🏗️ Architecture

### Centralized Fallback Mechanism

The mock data system is designed as a **centralized fallback mechanism** rather than a separate service. This approach:

- ✅ **Eliminates redundancy** - No duplicate metric calculations
- ✅ **Ensures consistency** - All components use the same data source
- ✅ **Simplifies maintenance** - Single source of truth for data fetching
- ✅ **Provides seamless fallback** - Automatic switching between real and mock data

### Data Flow

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Data Request  │──▶│  Availability    │──▶ │  Data Source    │
│   (Frontend)    │    │  Check           │    │  (Real/Mock)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │  Mock Data       │
                       │  Fetcher         │
                       └──────────────────┘
```

## ⚙️ Configuration

### Environment Variables

| Variable                 | Default | Description                                          |
| ------------------------ | ------- | ---------------------------------------------------- |
| `USE_MOCK_DATA`          | `false` | Enable mock data explicitly                          |
| `FORCE_MOCK_DATA`        | `false` | Force mock data regardless of real data availability |
| `MOCK_DATA_FALLBACK`     | `true`  | Enable automatic fallback to mock data               |
| `MOCK_TRANSACTION_COUNT` | `1000`  | Number of mock transactions to generate              |
| `SHOW_MOCK_DATA_BANNER`  | `true`  | Show mock data banner in frontend                    |

### Configuration Examples

#### Development Mode (Mock Data)

```bash
USE_MOCK_DATA=true
MOCK_DATA_FALLBACK=true
SHOW_MOCK_DATA_BANNER=true
```

#### Production Mode (Real Data Only)

```bash
USE_MOCK_DATA=false
FORCE_MOCK_DATA=false
MOCK_DATA_FALLBACK=false
```

#### Fallback Mode (Real Data with Mock Fallback)

```bash
USE_MOCK_DATA=false
FORCE_MOCK_DATA=false
MOCK_DATA_FALLBACK=true
```

## 🔧 Implementation

### Backend Components

#### 1. Data Availability Check (`backend/core/druid_client.py`)

```python
class DataAvailabilityStatus:
    REAL_DATA_AVAILABLE = "real_data_available"
    MOCK_DATA_FALLBACK = "mock_data_fallback"
    FORCED_MOCK_DATA = "forced_mock_data"
    NO_DATA_AVAILABLE = "no_data_available"
```

#### 2. Centralized Mock Data Fetcher (`backend/services/mock_data_service.py`)

```python
class MockDataFetcher:
    def fetch_mock_data(
        self,
        start_date: str,
        end_date: str,
        item_names: Optional[List[str]] = None,
        sales_persons: Optional[List[str]] = None,
        branch_names: Optional[List[str]] = None,
        item_groups: Optional[List[str]] = None,
        num_transactions: int = 1000
    ) -> pl.LazyFrame:
        # Returns data in exact same format as real data
```

#### 3. Integrated Data Fetching (`backend/services/sales_data.py`)

```python
async def fetch_sales_data(...) -> pl.LazyFrame:
    # Check data availability status
    data_status = druid_conn.check_data_availability()

    # Automatically fall back to mock data if needed
    if data_status in [DataAvailabilityStatus.FORCED_MOCK_DATA, DataAvailabilityStatus.MOCK_DATA_FALLBACK]:
        return mock_data_fetcher.fetch_mock_data(...)

    # Otherwise fetch real data
    return await _fetch_real_data(...)
```

### Frontend Components

#### Mock Data Banner (`frontend/src/components/MockDataBanner.tsx`)

```typescript
interface MockDataBannerProps {
  isVisible?: boolean;
  message?: string;
  dataStatus?: string;
}
```

## 📊 Data Standards

### Schema Compliance

The mock data system generates data that **exactly matches** the real data schema:

| Column          | Type     | Description            | Mock Data                            |
| --------------- | -------- | ---------------------- | ------------------------------------ |
| `__time`        | datetime | Transaction timestamp  | Random dates within range            |
| `ProductLine`   | string   | Product line/category  | Realistic Kenyan business categories |
| `ItemGroup`     | string   | Product group          | Specific product groupings           |
| `Branch`        | string   | Branch/location        | Kenyan city branches                 |
| `SalesPerson`   | string   | Salesperson name       | Realistic Kenyan names               |
| `AcctName`      | string   | Account/customer name  | Kenyan business names                |
| `ItemName`      | string   | Product/item name      | Realistic product names              |
| `CardName`      | string   | Customer card name     | Same as AcctName                     |
| `grossRevenue`  | float    | Gross revenue (KES)    | Realistic pricing (500-50,000 KES)   |
| `returnsValue`  | float    | Value of returns (KES) | 10-30% of transactions have returns  |
| `unitsSold`     | float    | Units sold             | 1-10 units per transaction           |
| `unitsReturned` | float    | Units returned         | 0 or 1-10 units                      |
| `totalCost`     | float    | Total cost (KES)       | 60-80% of revenue                    |
| `lineItemCount` | int      | Line item count        | 1-3 items per transaction            |

### Data Quality

- **Realistic Values**: All monetary values are in Kenyan Shillings (KES)
- **Proper Relationships**: Cost ratios, return rates, and quantities are realistic
- **Geographic Accuracy**: Uses actual Kenyan cities and business names
- **Temporal Distribution**: Random dates within specified ranges
- **Filter Support**: Supports all the same filters as real data

## 🚀 Usage

### Starting with Mock Data

1. **Set environment variables**:

   ```bash
   export USE_MOCK_DATA=true
   export MOCK_DATA_FALLBACK=true
   ```

2. **Start the backend**:

   ```bash
   cd backend
   python main.py
   ```

3. **Start the frontend**:
   ```bash
   cd frontend
   npm start
   ```

### Switching Between Data Sources

The system automatically detects data availability and switches accordingly:

1. **Real Data Available**: Uses real data from Druid
2. **Real Data Unavailable**: Falls back to mock data (if fallback enabled)
3. **Forced Mock Data**: Always uses mock data regardless of real data availability

### Monitoring Data Source

Check the data source status in the frontend banner or backend logs:

```python
# Backend status check
status = druid_conn.get_connection_status()
print(f"Data Status: {status['status']}")
```

## 🔍 Troubleshooting

### Common Issues

1. **Mock data not showing**:

   - Check `MOCK_DATA_FALLBACK` environment variable
   - Verify Druid connection status
   - Check backend logs for data availability status

2. **Banner not displaying**:

   - Ensure `SHOW_MOCK_DATA_BANNER=true`
   - Check frontend component integration
   - Verify data status is being passed correctly

3. **Data quality issues**:
   - Adjust `MOCK_TRANSACTION_COUNT` for more/less data
   - Modify mock data constants in `MockDataFetcher`
   - Check data generation logic

### Debugging

Enable detailed logging:

```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

Check data availability:

```python
from core.druid_client import druid_conn
status = druid_conn.get_connection_status()
print(status)
```

## 📈 Benefits

### Development

- ✅ **No dependency on real data** for development
- ✅ **Consistent data structure** across environments
- ✅ **Realistic test scenarios** with varied data

### Testing

- ✅ **Predictable data** for automated tests
- ✅ **Edge case simulation** with controlled data generation
- ✅ **Performance testing** with configurable data volumes

### Demonstration

- ✅ **Always functional** dashboard regardless of data availability
- ✅ **Professional presentation** with realistic data
- ✅ **Configurable scenarios** for different use cases

## 🔄 Migration to Real Data

When transitioning to real data:

1. **Set environment variables**:

   ```bash
   export USE_MOCK_DATA=false
   export FORCE_MOCK_DATA=false
   export MOCK_DATA_FALLBACK=true  # Keep as safety net
   ```

2. **Verify data availability**:

   - Check Druid connection
   - Validate data schema
   - Test data quality

3. **Monitor fallback behavior**:
   - Watch for automatic fallbacks
   - Adjust fallback settings as needed
   - Remove fallback when confident in real data

## 📝 Best Practices

1. **Always enable fallback** in production for reliability
2. **Use realistic mock data** that matches real data patterns
3. **Monitor data source status** regularly
4. **Test both real and mock data** scenarios
5. **Document data source changes** for team awareness
6. **Use environment-specific configurations** for different deployments

---

This mock data system ensures the Sales Analytics Dashboard remains functional and professional in all scenarios while maintaining data quality and consistency standards.
