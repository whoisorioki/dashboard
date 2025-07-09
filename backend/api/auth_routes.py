from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional, Union
import os
from datetime import datetime
from supabase import create_client, Client
import json
from dotenv import load_dotenv
from backend.services.user_analytics import user_analytics
from backend.services.user_activity import log_user_activity

# Load environment variables from the backend .env file
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

# Initialize Supabase client
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv(
    "SUPABASE_SERVICE_KEY"
)  # Service role key for backend operations

supabase_client: Union[Client, None] = None
if SUPABASE_URL and SUPABASE_SERVICE_KEY:
    try:
        supabase_client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    except Exception as e:
        print(f"Failed to initialize Supabase client: {e}")
        supabase_client = None
else:
    print("Warning: Supabase credentials not configured. Auth endpoints will not work.")

router = APIRouter(prefix="/api/auth", tags=["authentication"])
security = HTTPBearer()


# Pydantic models for request/response
class UserActivity(BaseModel):
    user_id: Optional[str]
    action: str
    timestamp: str
    user_agent: Optional[str]
    ip_address: Optional[str]
    details: Optional[dict] = None  # Add the missing details field


class UserProfile(BaseModel):
    id: str
    email: str
    full_name: Optional[str]
    role: str
    created_at: str


async def verify_token(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    """Verify Supabase JWT token"""
    if not supabase_client:
        raise HTTPException(
            status_code=500, detail="Authentication service not configured"
        )

    try:
        # Verify the JWT token with Supabase
        user_response = supabase_client.auth.get_user(credentials.credentials)
        if not user_response or not user_response.user:
            raise HTTPException(status_code=401, detail="Invalid token")

        # Convert to dict safely
        user_dict = (
            user_response.user.model_dump()
            if hasattr(user_response.user, "model_dump")
            else dict(user_response.user)
        )
        return user_dict
    except Exception as e:
        raise HTTPException(
            status_code=401, detail=f"Token verification failed: {str(e)}"
        )


@router.post("/logout")
async def logout_user(
    current_user: dict = Depends(verify_token), request: Request = Depends()
):
    """Logout a user"""
    if not supabase_client:
        raise HTTPException(
            status_code=500, detail="Authentication service not configured"
        )

    # Log user activity for logout
    user_id = current_user.get("id")
    if user_id:
        client_ip = getattr(request.client, "host", None)
        user_agent = request.headers.get("User-Agent")
        log_user_activity(
            user_id=user_id,
            action="logout",
            user_agent=user_agent,
            ip_address=client_ip,
        )

    try:
        supabase_client.auth.sign_out()
        return {"status": "success", "message": "User logged out"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Logout failed: {str(e)}")


@router.post("/user-activity")
async def track_user_activity(activity: UserActivity, request: Request):
    """Track user activity for analytics - stores in Druid and Supabase user_activity table"""

    # Get real IP address
    client_ip = (
        getattr(request.client, "host", "unknown") if request.client else "unknown"
    )
    forwarded_for = request.headers.get("X-Forwarded-For")
    if forwarded_for:
        client_ip = forwarded_for.split(",")[0].strip()

    # Prepare activity data for Druid ingestion
    activity_data = {
        "timestamp": activity.timestamp,
        "user_id": activity.user_id,
        "action": activity.action,
        "user_agent": activity.user_agent,
        "ip_address": (
            client_ip if activity.ip_address == "auto" else activity.ip_address
        ),
        "session_id": request.headers.get("X-Session-ID"),  # Can be added by frontend
    }

    # Send to Druid via analytics service (keep existing Druid logging if needed)
    await user_analytics.track_user_session(activity_data)

    # Log activity to Supabase user_activity table using the new service
    user_id = activity.user_id  # Get user_id from the incoming activity data
    if user_id:
        client_ip = getattr(request.client, "host", None)
        user_agent = request.headers.get("User-Agent")
        # Use details from the incoming activity data, or construct if needed
        details = activity.details  # Assuming details is part of UserActivity model

        log_user_activity(
            user_id=user_id,
            action=activity.action,
            details=details,
            user_agent=user_agent,
            ip_address=client_ip,
        )

    return {"status": "success", "message": "Activity tracked"}


@router.get("/profile")
async def get_user_profile(
    current_user: dict = Depends(verify_token), request: Request = Depends()
):
    """Get current user's profile"""

    # Log user activity
    user_id = current_user.get("id")
    if user_id:
        client_ip = getattr(request.client, "host", None)
        user_agent = request.headers.get("User-Agent")
        log_user_activity(
            user_id=user_id,
            action="view_profile",
            user_agent=user_agent,
            ip_address=client_ip,
        )

    return UserProfile(
        id=current_user["id"],
        email=current_user["email"],
        full_name=current_user.get("user_metadata", {}).get("full_name"),
        role=current_user.get("user_metadata", {}).get("role", "user"),
        created_at=current_user["created_at"],
    )


@router.get("/users")
async def list_users(current_user: dict = Depends(verify_token)):
    """List all users (admin only)"""

    # Check if user is admin
    user_role = current_user.get("user_metadata", {}).get("role", "user")
    if user_role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    if not supabase_client:
        raise HTTPException(
            status_code=500, detail="Authentication service not configured"
        )

    try:
        # This requires admin privileges in Supabase
        response = supabase_client.auth.admin.list_users()
        return {"users": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list users: {str(e)}")


@router.put("/users/{user_id}/role")
async def update_user_role(
    user_id: str, role: str, current_user: dict = Depends(verify_token)
):
    """Update user role (admin only)"""

    # Check if current user is admin
    user_role = current_user.get("user_metadata", {}).get("role", "user")
    if user_role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    if not supabase_client:
        raise HTTPException(
            status_code=500, detail="Authentication service not configured"
        )

    if role not in ["admin", "user", "viewer"]:
        raise HTTPException(status_code=400, detail="Invalid role")

    try:
        # Update user metadata
        supabase_client.auth.admin.update_user_by_id(
            user_id, {"user_metadata": {"role": role}}
        )
        return {"status": "success", "message": f"User role updated to {role}"}
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to update user role: {str(e)}"
        )


@router.get("/health")
async def auth_health_check():
    """Health check for authentication service"""

    supabase_status = "connected" if supabase_client else "not_configured"

    return {
        "status": "ok",
        "supabase_status": supabase_status,
        "timestamp": datetime.now().isoformat(),
    }
