from typing import Any, Optional
from fastapi import Request
import uuid


def envelope(
    data: Any, request: Optional[Request] = None, error: Optional[dict] = None
) -> dict:
    """
    Wraps the response in a standard envelope with data, error, and metadata (including requestId).
    """
    request_id = str(uuid.uuid4())
    if request and hasattr(request, "headers"):
        request_id = request.headers.get("X-Request-ID", request_id)
    return {"data": data, "error": error, "metadata": {"requestId": request_id}}
