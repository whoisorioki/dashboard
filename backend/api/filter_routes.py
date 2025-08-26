from fastapi import APIRouter, Request
from utils.response_envelope import envelope
import logging

router = APIRouter(prefix="/api/filters", tags=["filters"])

logger = logging.getLogger("backend.api.filter_routes")


@router.get("/options")
async def get_filter_options(request: Request):
    """
    Get available filter options for the dashboard.
    
    Returns lists of available branches, product lines, and date ranges.
    """
    try:
        filter_options = {
            "branches": ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret", "Thika"],
            "productLines": ["Sedan", "SUV", "Truck", "Motorcycle", "Van", "Bus"],
            "dateRanges": [
                "Last 7 days",
                "Last 30 days", 
                "Last 90 days",
                "Last 6 months",
                "Last year",
                "Custom range"
            ],
            "salesPersons": [
                "John Doe",
                "Jane Smith", 
                "Mike Johnson",
                "Sarah Wilson",
                "David Brown",
                "Lisa Davis"
            ],
            "categories": [
                "Passenger Vehicles",
                "Commercial Vehicles",
                "Motorcycles",
                "Accessories",
                "Services"
            ]
        }
        
        return envelope(filter_options, request)
        
    except Exception as e:
        logger.error(f"Error getting filter options: {str(e)}")
        return envelope({"error": "Failed to get filter options"}, request)
