import os
from supabase import create_client, Client
from typing import Optional
from backend.core.clients import supabase_client


def log_user_activity(
    user_id: str,
    action: str,
    details: dict | None = None,
    user_agent: str | None = None,
    ip_address: str | None = None,
):
    """Logs user activity to the Supabase user_activity table."""
    if not supabase_client:
        print("Supabase client not initialized. Cannot log activity.")
        return

    try:
        data_to_insert = {
            "user_id": user_id,
            "action": action,
            "details": details,
        }
        if user_agent:
            data_to_insert["user_agent"] = user_agent
        if ip_address:
            data_to_insert["ip_address"] = ip_address

        # Use the execute() method. Errors will raise exceptions.
        supabase_client.table("user_activity").insert(data_to_insert).execute()

    except Exception as e:
        print(f"Error logging user activity: {e}")
        # Optionally, re-raise the exception if you want the caller to handle it
        # raise e
