# Logging & Error Handling Approach

This document describes the standardized logging and error handling strategy for the Kenyan Sales Analytics Dashboard project. It is intended for all developers and maintainers to ensure consistency, observability, and maintainability across the codebase.

---

## 1. Shared Logging Utility

- **Location:** `backend/logging_config.py`
- **Purpose:** Provides a single function, `setup_logging()`, to configure logging format, level, and handlers for all scripts and backend modules.
- **Usage:**
  ```python
  from backend.logging_config import setup_logging
  setup_logging()
  import logging
  logging.info("Message")
  logging.error("Error message")
  ```
- **Benefits:**
  - Consistent log format and level across all scripts and services.
  - Easy to redirect logs to files or external systems by modifying one file.

---

## 2. Error Handling in Scripts

- **Pattern:**
  - All main logic is wrapped in `try/except` blocks.
  - Errors are logged using the shared logging utility.
  - On fatal errors, scripts exit with a non-zero status code (`sys.exit(1)`).
- **Example:**
  ```python
  try:
      # main logic
  except Exception as e:
      logging.error(f"Script failed: {e}")
      sys.exit(1)
  ```

---

## 3. FastAPI Backend: Global Error Handlers

- **Location:** `backend/main.py`
- **Handlers:**
  - `HTTPException`: Returns a structured JSON error envelope with code, message, and request ID.
  - `Exception`: Catches all unhandled errors, logs them, and returns a 500 error envelope.
  - `NoDataError` (Polars): Returns a 400 error if no data is available for the query.
  - `ValueError`: Returns a 400 error for invalid input (e.g., bad date format).
- **Envelope Structure:**
  ```json
  {
    "data": null,
    "error": { "code": "ERROR_CODE", "message": "..." },
    "metadata": { "requestId": "..." }
  }
  ```
- **Benefits:**
  - All API errors are returned in a consistent, frontend-friendly format.
  - All errors are logged for observability and debugging.

---

## 4. Best Practices & Recommendations

- **Always use the shared logging utility in new scripts and backend modules.**
- **Add new global error handlers for any new exception types introduced.**
- **Log all errors and warnings with enough context for debugging.**
- **Consider integrating with external monitoring/alerting tools (e.g., Sentry, Prometheus) for production.**
- **Document any changes to logging or error handling in this file.**

---

## 5. Extending & Maintaining

- To change log format, level, or destination, update `backend/logging_config.py`.
- To add new error handlers, update `backend/main.py` and document them here.
- Review this document and the logging/error handling code regularly as requirements evolve.

---

**For questions or improvements, contact the backend lead or open a PR with your proposed changes.** 