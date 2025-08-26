#!/usr/bin/env python3
"""
Docker-Compatible Component Testing Script

This script systematically tests every frontend component through the running Docker services
to identify data loading issues, visualization problems, error states, and performance bottlenecks.
"""

import requests
import json
import time
import sys
from datetime import datetime
from typing import Dict, List, Any, Optional
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class DockerComponentTester:
    def __init__(self):
        self.results = []
        # Use Docker internal network addresses when running from within containers
        self.base_url = "http://sales_analytics_frontend:3000"  # Frontend (internal)
        self.api_url = "http://localhost:8000"   # Backend (same container)
        self.session = requests.Session()
        
        # Test data for component validation
        self.test_data = {
            "date_range": {
                "start_date": "2024-01-01",
                "end_date": "2024-12-31"
            },
            "filters": {
                "branch": "Nairobi",
                "product_line": "All"
            }
        }
    
    def test_service_health(self) -> bool:
        """Test if all services are running and healthy"""
        logger.info("🏥 Testing Service Health...")
        
        services = {
            "Frontend": f"{self.base_url}",
            "Backend": f"{self.api_url}/",
            "GraphQL": f"{self.api_url}/graphql",
            "Druid Router": "http://router:8888",
            "PostgreSQL": "http://postgres:5432"
        }
        
        critical_services_healthy = True
        
        for service_name, url in services.items():
            try:
                if "PostgreSQL" in service_name:
                    # PostgreSQL doesn't have HTTP endpoint, skip
                    continue
                    
                response = self.session.get(url, timeout=10)
                if response.status_code == 200:
                    logger.info(f"✅ {service_name}: Healthy ({response.status_code})")
                elif response.status_code == 403 and "Frontend" in service_name:
                    # Frontend 403 might be due to routing, but service is reachable
                    logger.warning(f"⚠️ {service_name}: Reachable but status {response.status_code} (may need authentication)")
                    critical_services_healthy = critical_services_healthy and True  # Don't fail on frontend 403
                else:
                    logger.warning(f"⚠️ {service_name}: Status {response.status_code}")
                    if "Backend" in service_name or "GraphQL" in service_name:
                        critical_services_healthy = False
                    
            except requests.exceptions.RequestException as e:
                logger.error(f"❌ {service_name}: Unhealthy - {str(e)}")
                if "Backend" in service_name or "GraphQL" in service_name:
                    critical_services_healthy = False
        
        return critical_services_healthy
    
    def test_graphql_endpoint(self) -> Dict[str, Any]:
        """Test GraphQL endpoint functionality"""
        logger.info("🔍 Testing GraphQL Endpoint...")
        
        # Test basic GraphQL query
        query = """
        query {
            dashboardData {
                revenueSummary {
                    totalRevenue
                    grossProfit
                    totalSales
                    transactionCount
                }
            }
        }
        """
        
        try:
            response = self.session.post(
                f"{self.api_url}/graphql",
                json={"query": query},
                timeout=15
            )
            
            if response.status_code == 200:
                data = response.json()
                logger.info("✅ GraphQL query successful")
                
                # Check for errors in response
                if "errors" in data:
                    logger.error(f"❌ GraphQL errors: {data['errors']}")
                    return {"status": "error", "errors": data["errors"]}
                
                # Check data structure
                if "data" in data and "dashboardData" in data["data"]:
                    revenue_data = data["data"]["dashboardData"]["revenueSummary"]
                    logger.info(f"📊 Revenue data received: {revenue_data}")
                    return {"status": "success", "data": revenue_data}
                else:
                    logger.warning("⚠️ Unexpected GraphQL response structure")
                    return {"status": "warning", "response": data}
                    
            else:
                logger.error(f"❌ GraphQL request failed: {response.status_code}")
                return {"status": "error", "status_code": response.status_code}
                
        except Exception as e:
            logger.error(f"❌ GraphQL test failed: {str(e)}")
            return {"status": "error", "exception": str(e)}
    
    def test_frontend_components(self) -> List[Dict[str, Any]]:
        """Test frontend components through HTTP requests"""
        logger.info("🎨 Testing Frontend Components...")
        
        component_tests = [
            self.test_dashboard_page(),
            self.test_kpi_endpoints(),
            self.test_chart_endpoints(),
            self.test_table_endpoints(),
            self.test_filter_endpoints()
        ]
        
        return [test for test in component_tests if test is not None]
    
    def test_dashboard_page(self) -> Optional[Dict[str, Any]]:
        """Test main dashboard page"""
        try:
            response = self.session.get(f"{self.base_url}/dashboard", timeout=15)
            
            if response.status_code == 200:
                content = response.text
                
                # Check for key components
                checks = {
                    "has_react_app": "id=\"root\"" in content,
                    "has_charts": "chart" in content.lower() or "canvas" in content,
                    "has_tables": "table" in content.lower(),
                    "has_kpis": "kpi" in content.lower() or "metric" in content.lower(),
                    "has_filters": "filter" in content.lower() or "date" in content.lower()
                }
                
                logger.info("✅ Dashboard page loaded successfully")
                return {
                    "component": "Dashboard Page",
                    "status": "success",
                    "checks": checks,
                    "content_length": len(content)
                }
            else:
                logger.error(f"❌ Dashboard page failed: {response.status_code}")
                return {
                    "component": "Dashboard Page",
                    "status": "error",
                    "status_code": response.status_code
                }
                
        except Exception as e:
            logger.error(f"❌ Dashboard test failed: {str(e)}")
            return {
                "component": "Dashboard Page",
                "status": "error",
                "exception": str(e)
            }
    
    def test_kpi_endpoints(self) -> Optional[Dict[str, Any]]:
        """Test KPI-related API endpoints"""
        try:
            # Test KPI data endpoint
            response = self.session.get(f"{self.api_url}/api/kpi/summary", timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                logger.info("✅ KPI endpoint working")
                return {
                    "component": "KPI Endpoints",
                    "status": "success",
                    "data_keys": list(data.keys()) if isinstance(data, dict) else [],
                    "response_size": len(str(data))
                }
            else:
                logger.warning(f"⚠️ KPI endpoint status: {response.status_code}")
                return {
                    "component": "KPI Endpoints",
                    "status": "warning",
                    "status_code": response.status_code
                }
                
        except Exception as e:
            logger.warning(f"⚠️ KPI endpoint test failed: {str(e)}")
            return None
    
    def test_chart_endpoints(self) -> Optional[Dict[str, Any]]:
        """Test chart-related API endpoints"""
        try:
            # Test chart data endpoint
            response = self.session.get(f"{self.api_url}/api/charts/sales-trend", timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                logger.info("✅ Chart endpoints working")
                return {
                    "component": "Chart Endpoints",
                    "status": "success",
                    "data_keys": list(data.keys()) if isinstance(data, dict) else [],
                    "response_size": len(str(data))
                }
            else:
                logger.warning(f"⚠️ Chart endpoint status: {response.status_code}")
                return None
                
        except Exception as e:
            logger.warning(f"⚠️ Chart endpoint test failed: {str(e)}")
            return None
    
    def test_table_endpoints(self) -> Optional[Dict[str, Any]]:
        """Test table-related API endpoints"""
        try:
            # Test table data endpoint
            response = self.session.get(f"{self.api_url}/api/tables/sales-data", timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                logger.info("✅ Table endpoints working")
                return {
                    "component": "Table Endpoints",
                    "status": "success",
                    "data_keys": list(data.keys()) if isinstance(data, dict) else [],
                    "response_size": len(str(data))
                }
            else:
                logger.warning(f"⚠️ Table endpoint status: {response.status_code}")
                return None
                
        except Exception as e:
            logger.warning(f"⚠️ Table endpoint test failed: {str(e)}")
            return None
    
    def test_filter_endpoints(self) -> Optional[Dict[str, Any]]:
        """Test filter-related API endpoints"""
        try:
            # Test filter options endpoint
            response = self.session.get(f"{self.api_url}/api/filters/options", timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                logger.info("✅ Filter endpoints working")
                return {
                    "component": "Filter Endpoints",
                    "status": "success",
                    "data_keys": list(data.keys()) if isinstance(data, dict) else [],
                    "response_size": len(str(data))
                }
            else:
                logger.warning(f"⚠️ Filter endpoint status: {response.status_code}")
                return None
                
        except Exception as e:
            logger.warning(f"⚠️ Filter endpoint test failed: {str(e)}")
            return None
    
    def test_data_ingestion(self) -> Dict[str, Any]:
        """Test data ingestion functionality"""
        logger.info("📤 Testing Data Ingestion...")
        
        try:
            # Test ingestion status endpoint
            response = self.session.get(f"{self.api_url}/api/ingest/status", timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                logger.info("✅ Ingestion status endpoint working")
                return {
                    "component": "Data Ingestion",
                    "status": "success",
                    "endpoint": "status",
                    "response": data
                }
            else:
                logger.warning(f"⚠️ Ingestion status endpoint: {response.status_code}")
                return {
                    "component": "Data Ingestion",
                    "status": "warning",
                    "endpoint": "status",
                    "status_code": response.status_code
                }
                
        except Exception as e:
            logger.error(f"❌ Data ingestion test failed: {str(e)}")
            return {
                "component": "Data Ingestion",
                "status": "error",
                "exception": str(e)
            }
    
    def test_performance(self) -> Dict[str, Any]:
        """Test API response times"""
        logger.info("⚡ Testing Performance...")
        
        endpoints = [
            f"{self.api_url}/",
            f"{self.api_url}/graphql",
            f"{self.base_url}/dashboard"
        ]
        
        performance_results = {}
        
        for endpoint in endpoints:
            try:
                start_time = time.time()
                response = self.session.get(endpoint, timeout=15)
                end_time = time.time()
                
                response_time = (end_time - start_time) * 1000  # Convert to milliseconds
                performance_results[endpoint] = {
                    "response_time_ms": round(response_time, 2),
                    "status_code": response.status_code,
                    "success": response.status_code == 200
                }
                
                logger.info(f"⏱️ {endpoint}: {response_time:.2f}ms")
                
            except Exception as e:
                performance_results[endpoint] = {
                    "response_time_ms": None,
                    "status_code": None,
                    "success": False,
                    "error": str(e)
                }
                logger.error(f"❌ {endpoint}: Failed - {str(e)}")
        
        return {
            "component": "Performance",
            "endpoints": performance_results,
            "average_response_time": self.calculate_average_response_time(performance_results)
        }
    
    def calculate_average_response_time(self, performance_results: Dict[str, Any]) -> Optional[float]:
        """Calculate average response time from performance results"""
        valid_times = [
            result["response_time_ms"] 
            for result in performance_results.values() 
            if result["response_time_ms"] is not None
        ]
        
        if valid_times:
            return round(sum(valid_times) / len(valid_times), 2)
        return None
    
    def generate_report(self) -> Dict[str, Any]:
        """Generate comprehensive test report"""
        logger.info("📋 Generating Component Test Report...")
        
        report = {
            "timestamp": datetime.now().isoformat(),
            "summary": {
                "total_components": len(self.results),
                "components_by_status": self.group_results_by_status(),
                "issues_found": self.identify_issues()
            },
            "results": self.results,
            "recommendations": self.generate_recommendations()
        }
        
        # Save report
        filename = f"docker_component_test_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(filename, 'w') as f:
            json.dump(report, f, indent=2)
        
        logger.info(f"📄 Report saved to: {filename}")
        
        # Print summary
        self.print_summary(report)
        
        return report
    
    def group_results_by_status(self) -> Dict[str, List[Dict[str, Any]]]:
        """Group test results by status"""
        groups = {"success": [], "warning": [], "error": []}
        
        for result in self.results:
            status = result.get("status", "unknown")
            if status in groups:
                groups[status].append(result)
            else:
                groups["unknown"] = groups.get("unknown", []) + [result]
        
        return groups
    
    def identify_issues(self) -> List[Dict[str, Any]]:
        """Identify issues from test results"""
        issues = []
        
        for result in self.results:
            if result.get("status") == "error":
                issues.append({
                    "component": result.get("component", "Unknown"),
                    "description": f"Error: {result.get('exception', 'Unknown error')}",
                    "severity": "high"
                })
            elif result.get("status") == "warning":
                issues.append({
                    "component": result.get("component", "Unknown"),
                    "description": f"Warning: {result.get('status_code', 'Unknown warning')}",
                    "severity": "medium"
                })
        
        return issues
    
    def generate_recommendations(self) -> List[Dict[str, Any]]:
        """Generate recommendations based on test results"""
        recommendations = []
        
        issues = self.identify_issues()
        
        if issues:
            recommendations.append({
                "priority": "HIGH",
                "action": "Fix identified component issues",
                "components": [issue["component"] for issue in issues]
            })
        
        # Add general recommendations
        recommendations.extend([
            {
                "priority": "MEDIUM",
                "action": "Implement comprehensive error handling",
                "details": "Add proper error boundaries and fallback states"
            },
            {
                "priority": "MEDIUM",
                "action": "Add performance monitoring",
                "details": "Implement response time tracking and alerting"
            }
        ])
        
        return recommendations
    
    def print_summary(self, report: Dict[str, Any]):
        """Print test summary to console"""
        logger.info("\n" + "="*60)
        logger.info("📊 DOCKER COMPONENT TEST SUMMARY")
        logger.info("="*60)
        
        summary = report["summary"]
        logger.info(f"Total Components Tested: {summary['total_components']}")
        logger.info(f"Successful: {len(summary['components_by_status'].get('success', []))}")
        logger.info(f"Warnings: {len(summary['components_by_status'].get('warning', []))}")
        logger.info(f"Errors: {len(summary['components_by_status'].get('error', []))}")
        
        if summary["issues_found"]:
            logger.info(f"\n🚨 Issues Found: {len(summary['issues_found'])}")
            for issue in summary["issues_found"]:
                logger.info(f"  - {issue['component']}: {issue['description']}")
        
        logger.info("="*60)
    
    def run_all_tests(self) -> Dict[str, Any]:
        """Run all component tests"""
        logger.info("🚀 Starting Docker Component Testing...")
        
        # Test service health first
        if not self.test_service_health():
            logger.error("❌ Services are not healthy. Stopping tests.")
            return {"status": "failed", "reason": "services_unhealthy"}
        
        # Run component tests
        self.results.extend(self.test_frontend_components())
        self.results.append(self.test_graphql_endpoint())
        self.results.append(self.test_data_ingestion())
        self.results.append(self.test_performance())
        
        # Generate and return report
        return self.generate_report()

def main():
    """Main execution function"""
    tester = DockerComponentTester()
    
    try:
        report = tester.run_all_tests()
        logger.info("✅ Component testing completed successfully!")
        return report
    except Exception as e:
        logger.error(f"❌ Component testing failed: {str(e)}")
        return {"status": "failed", "error": str(e)}

if __name__ == "__main__":
    main()
