# Sales Analytics Dashboard

A full-stack dashboard application for visualizing sales data, featuring a React Material-UI frontend and a FastAPI backend with Apache Druid.

## Architecture

- **Frontend**: React + TypeScript with Material-UI and Recharts
- **Backend**: FastAPI with Python 3.12+
- **Data Processing**: Polars for high-performance DataFrame operations
- **Analytics Database**: Apache Druid for real-time analytics
- **APIs**: Both REST and GraphQL endpoints
- **Data Visualization**: Interactive charts and KPI cards

## Project Structure

- `frontend/`: React + TypeScript frontend built with Material-UI and Recharts
- `backend/`: Python FastAPI backend serving analytics data

## Setup and Installation

### Backend Setup

1. Navigate to the root directory
2. Activate the virtual environment:
   ```
   .\.venv\Scripts\activate  # Windows
   source .venv/bin/activate  # Linux/macOS
   ```
3. Install backend dependencies:
   ```
   pip install -r backend/requirements.txt
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```
2. Install frontend dependencies:
   ```
   npm install
   ```

## Quick Start (Recommended)

We've created a comprehensive system manager script for easy deployment:

```powershell
# Start both backend and frontend services
.\start-system.ps1 -Both

# Check system status
.\start-system.ps1 -Status

# Run connection tests
.\start-system.ps1 -Test
```

For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).

## Running the Application

### Quick Start

We've provided convenient scripts to start both the backend and frontend servers:```

```

1. **For the backend:**
   ```
   .\start-backend.ps1  # Windows PowerShell
   ```
   This script will:
   - Create a virtual environment if it doesn't exist
   - Install required dependencies
   - Activate the virtual environment
   - Start the FastAPI server at http://localhost:8000

2. **For the frontend:**
   ```
   .\start-frontend.ps1  # Windows PowerShell
   ```
   This script will:
   - Install node dependencies if needed
   - Start the Vite development server
   - Open http://localhost:5173 in your browser

3. Open your browser and navigate to `http://localhost:5173` if it doesn't open automatically

### Manual Start

If you prefer to start the services manually:

#### Backend Server
1. Activate the virtual environment:
   ```
   .\.venv\Scripts\activate  # Windows
   ```
2. Navigate to the backend directory:
   ```
   cd backend
   ```
3. Start the FastAPI server:
   ```
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

#### Frontend Development Server
1. Navigate to the frontend directory:
   ```
   cd frontend
   ```
2. Start the Vite development server:
   ```
   npm run dev
   ```

## Prerequisites

1. **Druid Cluster**: Ensure Apache Druid is running (port 8888)
2. **Python 3.12+**: Required for backend
3. **Node.js 18+**: Required for frontend

## Features

- Real-time data visualization with charts and KPI cards
- Dark/light theme switching
- Date range filtering
- Mock data mode for development without backend
- Responsive design for desktop and mobile views

## API Endpoints

- `/api/kpis/monthly-sales-growth`: Monthly sales data over time
- `/api/kpis/sales-target-attainment`: Sales target achievement data
- `/api/kpis/product-performance`: Top/bottom performing products
- `/api/kpis/branch-product-heatmap`: Heat map of sales by branch and product

## Project Structure

```
.
├── frontend/                # React frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── context/         # React contexts
│   │   ├── hooks/           # Custom React hooks
│   │   ├── pages/           # Page components
│   │   └── theme/           # Material UI theme config
│   └── public/              # Static assets
│
├── backend/
│   ├── api/                 # API layer
│   │   ├── routes.py        # REST endpoints
│   │   ├── kpi_routes.py    # KPI-specific endpoints
│   │   └── schema.py        # GraphQL schema
│   ├── core/                # Core infrastructure
│   │   └── druid_client.py  # Druid connection management
│   ├── services/            # Business logic
│   │   ├── sales_data.py    # Data fetching
│   │   ├── kpi_service.py   # KPI calculations
│   │   └── data_processing.py # Data transformation
│   └── models/              # Data models
│
├── .venv/                   # Python virtual environment
├── start-backend.ps1        # Backend startup script
└── start-frontend.ps1       # Frontend startup script
```

## Technologies Used

### Frontend
- React with TypeScript
- Material UI for components
- Recharts for data visualization
- SWR for data fetching

### Backend
- FastAPI
- Polars for data processing
- Apache Druid for data storage
- GraphQL support

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
