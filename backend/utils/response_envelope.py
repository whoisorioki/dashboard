from typing import Any, Optional
from fastapi import Request
import uuid


def envelope(data, request, error=None, warning=None, metadata=None):
    response = {
        "data": data,
        "error": error,
        "metadata": metadata or {"requestId": str(id(request))},
    }
    if warning:
        response["warning"] = warning
    return response
