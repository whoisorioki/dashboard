"""
User analytics service for integrating authentication data with Druid
"""

import json
import httpx
from datetime import datetime
from typing import Dict, Any, Optional
import os
from dotenv import load_dotenv

load_dotenv()


class UserAnalyticsService:
    """Service for tracking user analytics in Druid"""

    def __init__(self):
        self.druid_host = os.getenv("DRUID_BROKER_HOST", "localhost")
        self.druid_port = os.getenv("DRUID_BROKER_PORT", "8888")
        self.druid_base_url = f"http://{self.druid_host}:{self.druid_port}"

    async def track_user_session(self, session_data: Dict[str, Any]) -> bool:
        """
        Track user session data in Druid for analytics

        Args:
            session_data: Dictionary containing session information

        Returns:
            bool: True if successful, False otherwise
        """
        try:
            # Format data for Druid ingestion
            druid_data = {
                "__time": session_data.get("timestamp", datetime.now().isoformat()),
                "user_id": session_data.get("user_id"),
                "session_action": session_data.get(
                    "action"
                ),  # login, logout, page_view, etc.
                "ip_address": session_data.get("ip_address"),
                "user_agent": session_data.get("user_agent"),
                "session_duration": session_data.get("session_duration", 0),
                "page_url": session_data.get("page_url"),
                "browser": self._extract_browser(session_data.get("user_agent", "")),
                "platform": self._extract_platform(session_data.get("user_agent", "")),
            }

            # Send to Druid ingestion endpoint
            await self._send_to_druid(druid_data, "user_sessions")
            return True

        except Exception as e:
            print(f"Failed to track user session: {e}")
            return False

    async def track_user_interaction(self, interaction_data: Dict[str, Any]) -> bool:
        """
        Track user interactions (clicks, form submissions, etc.)

        Args:
            interaction_data: Dictionary containing interaction information

        Returns:
            bool: True if successful, False otherwise
        """
        try:
            druid_data = {
                "__time": interaction_data.get("timestamp", datetime.now().isoformat()),
                "user_id": interaction_data.get("user_id"),
                "interaction_type": interaction_data.get(
                    "type"
                ),  # click, form_submit, etc.
                "element_id": interaction_data.get("element_id"),
                "page_url": interaction_data.get("page_url"),
                "interaction_value": interaction_data.get("value"),
                "session_id": interaction_data.get("session_id"),
            }

            await self._send_to_druid(druid_data, "user_interactions")
            return True

        except Exception as e:
            print(f"Failed to track user interaction: {e}")
            return False

    async def track_dashboard_usage(self, usage_data: Dict[str, Any]) -> bool:
        """
        Track dashboard-specific usage patterns

        Args:
            usage_data: Dictionary containing usage information

        Returns:
            bool: True if successful, False otherwise
        """
        try:
            druid_data = {
                "__time": usage_data.get("timestamp", datetime.now().isoformat()),
                "user_id": usage_data.get("user_id"),
                "dashboard_action": usage_data.get(
                    "action"
                ),  # view_chart, filter_data, etc.
                "dashboard_component": usage_data.get(
                    "component"
                ),  # chart_name, filter_name, etc.
                "filter_applied": json.dumps(usage_data.get("filters", {})),
                "date_range": usage_data.get("date_range"),
                "response_time_ms": usage_data.get("response_time_ms"),
                "data_size": usage_data.get("data_size"),
            }

            await self._send_to_druid(druid_data, "dashboard_usage")
            return True

        except Exception as e:
            print(f"Failed to track dashboard usage: {e}")
            return False

    async def _send_to_druid(self, data: Dict[str, Any], datasource: str) -> None:
        """
        Send data to Druid ingestion endpoint

        Args:
            data: Data to ingest
            datasource: Target datasource name
        """
        ingestion_spec = {
            "type": "index_parallel",
            "spec": {
                "ioConfig": {
                    "type": "index_parallel",
                    "inputSource": {"type": "inline", "data": json.dumps([data])},
                    "inputFormat": {"type": "json"},
                },
                "tuningConfig": {
                    "type": "index_parallel",
                    "partitionsSpec": {"type": "dynamic"},
                },
                "dataSchema": {
                    "dataSource": datasource,
                    "timestampSpec": {"column": "__time", "format": "iso"},
                    "dimensionsSpec": {"dimensions": list(data.keys())},
                    "granularitySpec": {
                        "type": "uniform",
                        "segmentGranularity": "DAY",
                        "queryGranularity": "MINUTE",
                        "rollup": False,
                    },
                },
            },
        }

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.druid_base_url}/druid/indexer/v1/task",
                json=ingestion_spec,
                timeout=30.0,
            )
            response.raise_for_status()

    def _extract_browser(self, user_agent: str) -> str:
        """Extract browser name from user agent string"""
        user_agent_lower = user_agent.lower()

        if "chrome" in user_agent_lower and "edge" not in user_agent_lower:
            return "Chrome"
        elif "firefox" in user_agent_lower:
            return "Firefox"
        elif "safari" in user_agent_lower and "chrome" not in user_agent_lower:
            return "Safari"
        elif "edge" in user_agent_lower:
            return "Edge"
        elif "opera" in user_agent_lower:
            return "Opera"
        else:
            return "Other"

    def _extract_platform(self, user_agent: str) -> str:
        """Extract platform from user agent string"""
        user_agent_lower = user_agent.lower()

        if "windows" in user_agent_lower:
            return "Windows"
        elif "mac" in user_agent_lower:
            return "macOS"
        elif "linux" in user_agent_lower:
            return "Linux"
        elif "android" in user_agent_lower:
            return "Android"
        elif "iphone" in user_agent_lower or "ipad" in user_agent_lower:
            return "iOS"
        else:
            return "Other"


# Create a global instance
user_analytics = UserAnalyticsService()
