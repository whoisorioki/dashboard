from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from typing import Union
import logging

logger = logging.getLogger(__name__)


class APIException(Exception):
    """Custom API Exception"""

    def __init__(
        self,
        status_code: int,
        message: str,
        error_code: str,
        details: Union[dict, None] = None,
    ):
        self.status_code = status_code
        self.message = message
        self.error_code = error_code
        self.details = details
        super().__init__(self.message)


async def http_exception_handler(request: Request, exc: HTTPException):
    """
    Global handler for FastAPI's HTTPException to ensure consistent JSON error responses.
    """
    logger.error(
        f"HTTPException caught: {exc.status_code} - {exc.detail}", exc_info=True
    )
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {"code": "http_exception", "message": exc.detail, "details": None}
        },
    )


async def api_exception_handler(request: Request, exc: APIException):
    """
    Handler for custom APIExceptions to provide structured error responses.
    """
    logger.error(
        f"APIException caught: {exc.status_code} - {exc.message}", exc_info=True
    )
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": exc.error_code,
                "message": exc.message,
                "details": exc.details,
            }
        },
    )


def add_error_handlers(app):
    """
    Adds the custom exception handlers to the FastAPI app instance.
    """
    app.add_exception_handler(HTTPException, http_exception_handler)
    app.add_exception_handler(APIException, api_exception_handler)
