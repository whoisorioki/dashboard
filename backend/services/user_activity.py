import os
from supabase import create_client, Client
from typing import Optional  # Import Optional for type hinting

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

# Initialize Supabase client with service role key for backend operations
# This bypasses RLS, which is necessary for the backend to write to user_activity table
# regardless of the user performing the action.

# Declare supabase variable before conditional assignment
supabase: Optional[Client] = None

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    print("Error: Supabase URL or Service Role Key not found in environment variables.")
    # supabase remains None
else:
    try:
        # Assign to the already declared supabase variable
        supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    except Exception as e:
        print(f"Error initializing Supabase client: {e}")
        # supabase remains None


def log_user_activity(
    user_id: str,
    action: str,
    details: dict | None = None,
    user_agent: str | None = None,
    ip_address: str | None = None,
):
    """Logs user activity to the Supabase user_activity table."""
    if not supabase:
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
        response = supabase.table("user_activity").insert([data_to_insert]).execute()

        # In Supabase client v2, successful inserts might return response.data as an empty list
        # or the inserted rows depending on the API version and parameters.
        # The primary way to check for failure is the exception handling above.
        # We can optionally check response.data if we expect returned rows, but for logging,
        # simply not raising an exception is usually sufficient for success indication.
        # print(f"Successfully logged activity: {response.data}") # Optional: for debugging

    except Exception as e:
        # This block catches exceptions raised by execute() on failure
        print(f"An error occurred while logging user activity: {e}")
