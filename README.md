# Sales Dashboard

A high-performance analytics dashboard backend built with FastAPI, Polars, Apache Druid, and Strawberry GraphQL.

## Architecture

- **Backend**: FastAPI with Python 3.12+
- **Data Processing**: Polars for high-performance DataFrame operations
- **Analytics Database**: Apache Druid for real-time analytics
- **APIs**: Both REST and GraphQL endpoints
- **Data Visualization**: KPI calculations and structured data for frontend consumption

## Features

- 🚀 High-performance data processing with Polars
- 📊 Advanced KPI calculations (growth, targets, performance metrics)
- 🔄 Real-time data from Apache Druid
- 🌐 REST and GraphQL APIs
- 📈 Ready for dashboard frontend integration
- 🐋 Docker-based Druid cluster

## Project Structure

```
backend/
├── api/                    # API layer
│   ├── routes.py          # REST endpoints
│   ├── kpi_routes.py      # KPI-specific endpoints
│   └── schema.py          # GraphQL schema
├── core/                  # Core infrastructure
│   └── druid_client.py    # Druid connection management
├── services/              # Business logic
│   ├── sales_data.py      # Data fetching and processing
│   ├── kpi_service.py     # KPI calculations
│   └── data_processing.py # Data transformation utilities
├── models/                # Data models (future use)
├── druid/                 # Druid cluster configuration
│   └── distribution/docker/
│       └── docker-compose.yml
├── requirements.txt       # Python dependencies
├── .env.example          # Environment template
└── main.py               # FastAPI application entry point
```

## Quick Start

### 1. Clone Repository
```bash
git clone <repository-url>
cd Sales-Dashboard
```

### 2. Setup Environment
```bash
cd backend
cp .env.example .env
# Edit .env if needed
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Start Druid Cluster
```bash
cd druid/distribution/docker
docker-compose up -d
```

Wait for all services to be healthy (check `docker-compose ps`).

### 5. Start FastAPI Server
```bash
cd ../../..  # Back to backend/
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

## API Endpoints

### Health Checks
- `GET /` - Basic health check
- `GET /api/health` - API health check
- `GET /api/health/druid` - Druid connectivity check

### Data Endpoints
- `GET /api/sales` - Get filtered sales data
- `GET /api/druid/datasources` - List available datasources

### KPI Endpoints
- `GET /api/kpis/monthly-sales-growth` - Monthly sales growth analysis
- `GET /api/kpis/sales-target-attainment` - Sales target vs actual
- `GET /api/kpis/product-performance` - Top/bottom performing products
- `GET /api/kpis/branch-product-heatmap` - Sales heatmap by branch and product

### GraphQL
- `GET /graphql` - GraphQL playground and API

## Usage Examples

### Monthly Sales Growth
```bash
curl "http://localhost:8000/api/kpis/monthly-sales-growth?start_date=2023-01-01&end_date=2023-12-31"
```

### Sales Target Attainment
```bash
curl "http://localhost:8000/api/kpis/sales-target-attainment?start_date=2023-01-01&end_date=2023-12-31&target=500000"
```

### Product Performance
```bash
curl "http://localhost:8000/api/kpis/product-performance?start_date=2023-01-01&end_date=2023-12-31&n=5"
```

## Druid Console

Access the Druid console at: `http://localhost:8888/unified-console.html`

## Development

### Running Tests
```bash
# Add test commands here when implemented
```

### Code Style
This project follows Python PEP 8 standards.

### Adding New KPIs
1. Add calculation function to `services/kpi_service.py`
2. Create endpoint in `api/kpi_routes.py`
3. Update documentation

## Production Deployment

For production deployment:
1. Set `ENV=production` in `.env`
2. Configure proper Druid cluster
3. Set up reverse proxy (nginx)
4. Configure SSL certificates
5. Set up monitoring and logging

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

[Add your license here]
