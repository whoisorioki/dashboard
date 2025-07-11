"""
Centralized module to hold shared client instances.
This helps prevent circular imports by providing a single, neutral
location for services and API layers to access initialized clients.
"""

from typing import Optional, Union
from supabase import Client as SupabaseClient

# The Supabase client instance.
# It is initialized as None and will be set during the application startup lifespan.
supabase_client: Union[SupabaseClient, None] = None
