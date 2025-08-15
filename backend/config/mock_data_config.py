"""
Mock Data Configuration

This module provides centralized configuration for mock data usage and fallback behavior.
All components should use these settings to ensure consistent behavior.
"""

import os
from typing import Dict, Any

# Environment variable configuration
USE_MOCK_DATA = os.getenv("USE_MOCK_DATA", "false").lower() == "true"
FORCE_MOCK_DATA = os.getenv("FORCE_MOCK_DATA", "false").lower() == "true"
MOCK_DATA_FALLBACK = os.getenv("MOCK_DATA_FALLBACK", "true").lower() == "true"

# Mock data generation settings
MOCK_TRANSACTION_COUNT = int(os.getenv("MOCK_TRANSACTION_COUNT", "1000"))
MOCK_DATA_QUALITY = os.getenv("MOCK_DATA_QUALITY", "realistic")  # realistic, minimal, extensive

# Mock data banner settings
SHOW_MOCK_DATA_BANNER = os.getenv("SHOW_MOCK_DATA_BANNER", "true").lower() == "true"
MOCK_BANNER_MESSAGE = os.getenv("MOCK_BANNER_MESSAGE", "🎭 Mock Data Mode - This dashboard is displaying mock data for development purposes.")

def get_mock_data_config() -> Dict[str, Any]:
    """Get complete mock data configuration"""
    return {
        "use_mock_data": USE_MOCK_DATA,
        "force_mock_data": FORCE_MOCK_DATA,
        "mock_data_fallback": MOCK_DATA_FALLBACK,
        "transaction_count": MOCK_TRANSACTION_COUNT,
        "data_quality": MOCK_DATA_QUALITY,
        "show_banner": SHOW_MOCK_DATA_BANNER,
        "banner_message": MOCK_BANNER_MESSAGE
    }

def is_mock_data_enabled() -> bool:
    """Check if mock data should be used"""
    return USE_MOCK_DATA or FORCE_MOCK_DATA

def should_show_mock_banner() -> bool:
    """Check if mock data banner should be shown"""
    return SHOW_MOCK_DATA_BANNER and is_mock_data_enabled()

def get_mock_data_status() -> str:
    """Get current mock data status for logging and debugging"""
    if FORCE_MOCK_DATA:
        return "FORCED_MOCK_DATA"
    elif USE_MOCK_DATA:
        return "EXPLICIT_MOCK_DATA"
    elif MOCK_DATA_FALLBACK:
        return "FALLBACK_ENABLED"
    else:
        return "FALLBACK_DISABLED"
