# Sales Analytics Dashboard

A full-stack dashboard application for visualizing and analyzing sales data, featuring a React Material-UI frontend and a FastAPI backend with Apache Druid. This project is designed to provide actionable insights into sales performance, profitability, and customer behavior.

## Features

-   **Executive Summary:** A high-level overview of key business metrics, including profitability and target attainment.
-   **Performance Deep Dive:** Granular analysis of sales performance by salesperson, product, and branch.
-   **Profitability Analysis:** Detailed exploration of margins, costs, and profitability drivers.
-   **Interactive Visualizations:** A rich set of charts and tables for data exploration.
-   **Role-Based Access Control:** Secure access to data and features based on user roles.

## Technologies Used

-   **Frontend:** React, TypeScript, Material-UI, Recharts, TanStack Query
-   **Backend:** FastAPI, Python, Polars
-   **Database:** Apache Druid, PostgreSQL
-   **Authentication:** Supabase

## Project Structure

```
.
├── backend/
│   ├── api/
│   ├── core/
│   ├── services/
│   └── ...
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── pages/
│   │   └── ...
│   └── ...
├── .venv/
├── docker-compose.yml
├── ingest-data.sh
└── ...
```

## Setup and Installation

### Prerequisites

-   Docker and Docker Compose
-   Python 3.10+
-   Node.js 18+

### 1. Clone the Repository

```bash
git clone <repository-url>
cd <repository-name>
```

### 2. Set Up Environment Variables

Create a `.env` file in the `backend` directory and add the following environment variables:

```
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_service_key
```

### 3. Start the Services

This project uses Docker Compose to manage the backend services (FastAPI, Druid, PostgreSQL).

```bash
docker compose up -d
```

### 4. Install Frontend Dependencies

```bash
cd frontend
npm install
```

## Running the Application

### 1. Start the Backend Server

```powershell
# In the project root directory
.\start-backend.ps1
```

### 2. Start the Frontend Development Server

```powershell
# In a new terminal, in the project root directory
.\start-frontend.ps1
```

The application will be available at `http://localhost:5173`.

### 3. Ingest Data into Druid

To populate the Druid database with sample data, run the following script from the project root:

```bash
./ingest-data.sh
```

This script will ingest data from the PostgreSQL database into Druid. You may need to run this script multiple times if the ingestion task fails.

## Development

### Backend

The backend is a FastAPI application. To run it in development mode with hot-reloading, use the `start-backend.ps1` script.

### Frontend

The frontend is a React application built with Vite. To run it in development mode with hot-reloading, use the `start-frontend.ps1` script.
