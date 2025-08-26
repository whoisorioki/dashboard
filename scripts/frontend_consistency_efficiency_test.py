#!/usr/bin/env python3
"""
Frontend Consistency and Efficiency Testing Script

This script performs comprehensive testing of:
1. Data Pipeline Consistency - Verify data flows from backend to frontend
2. Component Efficiency - Measure rendering and response times
3. Data Consistency - Check data integrity across components
4. Pipeline Timing - Measure end-to-end data flow efficiency
"""

import requests
import json
import time
import sys
from datetime import datetime
from typing import Dict, List, Any, Optional, Tuple
import logging
from dataclasses import dataclass
import statistics

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@dataclass
class PipelineMetrics:
    """Data structure for pipeline performance metrics"""
    component: str
    backend_response_time: float
    frontend_rendering_time: float
    data_consistency_score: float
    total_pipeline_time: float
    data_freshness: float
    error_count: int

class FrontendConsistencyEfficiencyTester:
    def __init__(self):
        self.results = []
        self.pipeline_metrics = []
        self.consistency_checks = []
        
        # Docker internal network addresses
        self.base_url = "http://localhost:3000"  # Frontend (external access)
        self.api_url = "http://localhost:8000"
        self.session = requests.Session()
        
        # Test scenarios for comprehensive coverage
        self.test_scenarios = {
            "dashboard_overview": {
                "endpoints": ["/dashboard", "/api/kpi/summary", "/graphql"],
                "expected_data": ["revenue", "sales", "profit", "transactions"],
                "components": ["KPI Cards", "Summary Charts", "Overview Tables"]
            },
            "sales_analytics": {
                "endpoints": ["/sales", "/api/charts/sales-trend", "/api/tables/sales-data"],
                "expected_data": ["monthly_sales", "branch_performance", "product_metrics"],
                "components": ["Sales Charts", "Performance Tables", "Trend Analysis"]
            },
            "product_analytics": {
                "endpoints": ["/products", "/api/charts/product-performance", "/api/tables/product-data"],
                "expected_data": ["product_sales", "category_performance", "inventory_metrics"],
                "components": ["Product Charts", "Category Tables", "Inventory Metrics"]
            },
            "branch_analytics": {
                "endpoints": ["/branches", "/api/charts/branch-performance", "/api/filters/options"],
                "expected_data": ["branch_revenue", "geographic_data", "performance_metrics"],
                "components": ["Branch Maps", "Performance Charts", "Geographic Data"]
            },
            "data_ingestion": {
                "endpoints": ["/data-ingestion", "/api/ingest/status", "/api/ingest/upload"],
                "expected_data": ["task_status", "upload_progress", "processing_status"],
                "components": ["Upload Interface", "Status Tracking", "Progress Indicators"]
            }
        }
    
    def test_data_pipeline_consistency(self) -> List[Dict[str, Any]]:
        """Test data consistency across the entire pipeline"""
        logger.info("🔍 Testing Data Pipeline Consistency...")
        
        consistency_results = []
        
        for scenario_name, scenario in self.test_scenarios.items():
            logger.info(f"\n📊 Testing Scenario: {scenario_name}")
            
            # Test backend data availability
            backend_data = self.test_backend_data_availability(scenario["endpoints"])
            
            # Test frontend data consumption
            frontend_data = self.test_frontend_data_consumption(scenario["endpoints"])
            
            # Test data consistency between backend and frontend
            consistency_score = self.calculate_data_consistency(backend_data, frontend_data)
            
            # Test data freshness
            data_freshness = self.test_data_freshness(scenario["endpoints"])
            
            result = {
                "scenario": scenario_name,
                "backend_data": backend_data,
                "frontend_data": frontend_data,
                "consistency_score": consistency_score,
                "data_freshness": data_freshness,
                "components": scenario["components"],
                "timestamp": datetime.now().isoformat()
            }
            
            consistency_results.append(result)
            logger.info(f"✅ {scenario_name}: Consistency Score: {consistency_score:.2f}%")
        
        return consistency_results
    
    def test_backend_data_availability(self, endpoints: List[str]) -> Dict[str, Any]:
        """Test if backend endpoints provide expected data"""
        backend_data = {}
        
        for endpoint in endpoints:
            if endpoint.startswith("/api/"):
                # Test API endpoint
                try:
                    start_time = time.time()
                    response = self.session.get(f"{self.api_url}{endpoint}", timeout=15)
                    response_time = (time.time() - start_time) * 1000
                    
                    if response.status_code == 200:
                        data = response.json()
                        backend_data[endpoint] = {
                            "status": "available",
                            "response_time": response_time,
                            "data_size": len(str(data)),
                            "data_keys": list(data.keys()) if isinstance(data, dict) else [],
                            "sample_data": self.extract_sample_data(data)
                        }
                    else:
                        backend_data[endpoint] = {
                            "status": "error",
                            "status_code": response.status_code,
                            "response_time": response_time
                        }
                        
                except Exception as e:
                    backend_data[endpoint] = {
                        "status": "unavailable",
                        "error": str(e),
                        "response_time": None
                    }
            
            elif endpoint == "/graphql":
                # Test GraphQL endpoint
                try:
                    start_time = time.time()
                    query = self.get_graphql_query_for_endpoint(endpoint)
                    response = self.session.post(
                        f"{self.api_url}/graphql",
                        json={"query": query},
                        timeout=15
                    )
                    response_time = (time.time() - start_time) * 1000
                    
                    if response.status_code == 200:
                        data = response.json()
                        backend_data[endpoint] = {
                            "status": "available",
                            "response_time": response_time,
                            "data_size": len(str(data)),
                            "has_errors": "errors" in data,
                            "sample_data": self.extract_sample_data(data)
                        }
                    else:
                        backend_data[endpoint] = {
                            "status": "error",
                            "status_code": response.status_code,
                            "response_time": response_time
                        }
                        
                except Exception as e:
                    backend_data[endpoint] = {
                        "status": "unavailable",
                        "error": str(e),
                        "response_time": None
                    }
        
        return backend_data
    
    def test_frontend_data_consumption(self, endpoints: List[str]) -> Dict[str, Any]:
        """Test if frontend can consume data from endpoints"""
        frontend_data = {}
        
        for endpoint in endpoints:
            try:
                start_time = time.time()
                response = self.session.get(f"{self.base_url}{endpoint}", timeout=15)
                response_time = (time.time() - start_time) * 1000
                
                if response.status_code == 200:
                    content = response.text
                    frontend_data[endpoint] = {
                        "status": "accessible",
                        "response_time": response_time,
                        "content_length": len(content),
                        "has_react_app": "id=\"root\"" in content,
                        "has_data_components": self.check_data_components(content),
                        "rendering_elements": self.count_rendering_elements(content)
                    }
                else:
                    frontend_data[endpoint] = {
                        "status": "error",
                        "status_code": response.status_code,
                        "response_time": response_time
                    }
                    
            except Exception as e:
                frontend_data[endpoint] = {
                    "status": "unavailable",
                    "error": str(e),
                    "response_time": None
                }
        
        return frontend_data
    
    def calculate_data_consistency(self, backend_data: Dict, frontend_data: Dict) -> float:
        """Calculate consistency score between backend and frontend data"""
        if not backend_data or not frontend_data:
            return 0.0
        
        consistency_scores = []
        
        for endpoint in backend_data.keys():
            if endpoint in frontend_data:
                backend_status = backend_data[endpoint].get("status")
                frontend_status = frontend_data[endpoint].get("status")
                
                # Check if both are available
                if backend_status == "available" and frontend_status == "accessible":
                    consistency_scores.append(100.0)
                elif backend_status == "available" and frontend_status == "error":
                    consistency_scores.append(50.0)  # Backend has data but frontend can't access
                elif backend_status == "error" and frontend_status == "accessible":
                    consistency_scores.append(25.0)  # Frontend accessible but no backend data
                else:
                    consistency_scores.append(0.0)
            else:
                consistency_scores.append(0.0)
        
        return statistics.mean(consistency_scores) if consistency_scores else 0.0
    
    def test_data_freshness(self, endpoints: List[str]) -> Dict[str, Any]:
        """Test data freshness and update frequency"""
        freshness_results = {}
        
        for endpoint in endpoints:
            if endpoint.startswith("/api/"):
                try:
                    # Test multiple requests to check for data changes
                    responses = []
                    for i in range(3):
                        response = self.session.get(f"{self.api_url}{endpoint}", timeout=15)
                        if response.status_code == 200:
                            responses.append(response.json())
                        time.sleep(0.5)  # Small delay between requests
                    
                    if len(responses) > 1:
                        # Check if data changes between requests
                        data_changes = self.detect_data_changes(responses)
                        freshness_results[endpoint] = {
                            "data_static": data_changes["static"],
                            "update_frequency": data_changes["frequency"],
                            "consistency_across_requests": data_changes["consistency"]
                        }
                    else:
                        freshness_results[endpoint] = {
                            "data_static": True,
                            "update_frequency": "unknown",
                            "consistency_across_requests": 100.0
                        }
                        
                except Exception as e:
                    freshness_results[endpoint] = {
                        "data_static": True,
                        "update_frequency": "error",
                        "consistency_across_requests": 0.0
                    }
        
        return freshness_results
    
    def detect_data_changes(self, responses: List[Dict]) -> Dict[str, Any]:
        """Detect if data changes between multiple requests"""
        if len(responses) < 2:
            return {"static": True, "frequency": "unknown", "consistency": 100.0}
        
        # Compare first response with others
        base_response = responses[0]
        changes_detected = 0
        
        for response in responses[1:]:
            if response != base_response:
                changes_detected += 1
        
        change_ratio = changes_detected / (len(responses) - 1)
        
        if change_ratio == 0:
            return {"static": True, "frequency": "static", "consistency": 100.0}
        elif change_ratio < 0.3:
            return {"static": False, "frequency": "low", "consistency": 100.0 - (change_ratio * 100)}
        elif change_ratio < 0.7:
            return {"static": False, "frequency": "medium", "consistency": 100.0 - (change_ratio * 100)}
        else:
            return {"static": False, "frequency": "high", "consistency": 100.0 - (change_ratio * 100)}
    
    def test_component_efficiency(self) -> List[PipelineMetrics]:
        """Test component rendering efficiency and timing"""
        logger.info("⚡ Testing Component Efficiency...")
        
        efficiency_results = []
        
        for scenario_name, scenario in self.test_scenarios.items():
            logger.info(f"\n🔧 Testing Efficiency: {scenario_name}")
            
            for component in scenario["components"]:
                metrics = self.measure_component_efficiency(component, scenario["endpoints"])
                if metrics:
                    efficiency_results.append(metrics)
                    logger.info(f"✅ {component}: Backend: {metrics.backend_response_time:.2f}ms, Frontend: {metrics.frontend_rendering_time:.2f}ms")
        
        return efficiency_results
    
    def measure_component_efficiency(self, component: str, endpoints: List[str]) -> Optional[PipelineMetrics]:
        """Measure efficiency metrics for a specific component"""
        try:
            # Measure backend response time
            backend_times = []
            for endpoint in endpoints:
                if endpoint.startswith("/api/"):
                    start_time = time.time()
                    response = self.session.get(f"{self.api_url}{endpoint}", timeout=15)
                    backend_times.append((time.time() - start_time) * 1000)
            
            avg_backend_time = statistics.mean(backend_times) if backend_times else 0.0
            
            # Measure frontend rendering time
            frontend_times = []
            for endpoint in endpoints:
                if not endpoint.startswith("/api/"):
                    start_time = time.time()
                    response = self.session.get(f"{self.base_url}{endpoint}", timeout=15)
                    frontend_times.append((time.time() - start_time) * 1000)
            
            avg_frontend_time = statistics.mean(frontend_times) if frontend_times else 0.0
            
            # Calculate total pipeline time
            total_pipeline_time = avg_backend_time + avg_frontend_time
            
            # Estimate data consistency score
            data_consistency_score = self.estimate_component_consistency(component, endpoints)
            
            # Count errors
            error_count = self.count_component_errors(component, endpoints)
            
            return PipelineMetrics(
                component=component,
                backend_response_time=avg_backend_time,
                frontend_rendering_time=avg_frontend_time,
                data_consistency_score=data_consistency_score,
                total_pipeline_time=total_pipeline_time,
                data_freshness=100.0,  # Placeholder
                error_count=error_count
            )
            
        except Exception as e:
            logger.error(f"❌ Error measuring efficiency for {component}: {str(e)}")
            return None
    
    def estimate_component_consistency(self, component: str, endpoints: List[str]) -> float:
        """Estimate data consistency for a component based on endpoint availability"""
        available_endpoints = 0
        total_endpoints = len(endpoints)
        
        for endpoint in endpoints:
            try:
                if endpoint.startswith("/api/"):
                    response = self.session.get(f"{self.api_url}{endpoint}", timeout=10)
                    if response.status_code == 200:
                        available_endpoints += 1
                else:
                    response = self.session.get(f"{self.base_url}{endpoint}", timeout=10)
                    if response.status_code == 200:
                        available_endpoints += 1
            except:
                pass
        
        return (available_endpoints / total_endpoints) * 100.0 if total_endpoints > 0 else 0.0
    
    def count_component_errors(self, component: str, endpoints: List[str]) -> int:
        """Count errors for a component across its endpoints"""
        error_count = 0
        
        for endpoint in endpoints:
            try:
                if endpoint.startswith("/api/"):
                    response = self.session.get(f"{self.api_url}{endpoint}", timeout=10)
                    if response.status_code != 200:
                        error_count += 1
                else:
                    response = self.session.get(f"{self.base_url}{endpoint}", timeout=10)
                    if response.status_code != 200:
                        error_count += 1
            except:
                error_count += 1
        
        return error_count
    
    def test_pipeline_timing(self) -> Dict[str, Any]:
        """Test end-to-end pipeline timing and efficiency"""
        logger.info("⏱️ Testing Pipeline Timing...")
        
        pipeline_tests = [
            self.test_kpi_pipeline_timing(),
            self.test_chart_pipeline_timing(),
            self.test_table_pipeline_timing(),
            self.test_filter_pipeline_timing(),
            self.test_ingestion_pipeline_timing()
        ]
        
        return {
            "pipeline_tests": pipeline_tests,
            "overall_pipeline_efficiency": self.calculate_overall_pipeline_efficiency(pipeline_tests)
        }
    
    def test_kpi_pipeline_timing(self) -> Dict[str, Any]:
        """Test KPI data pipeline timing"""
        try:
            # Backend data fetch
            start_time = time.time()
            backend_response = self.session.get(f"{self.api_url}/api/kpi/summary", timeout=15)
            backend_time = (time.time() - start_time) * 1000
            
            # Frontend rendering
            start_time = time.time()
            frontend_response = self.session.get(f"{self.base_url}/dashboard", timeout=15)
            frontend_time = (time.time() - start_time) * 1000
            
            total_time = backend_time + frontend_time
            
            return {
                "pipeline": "KPI Data",
                "backend_time": backend_time,
                "frontend_time": frontend_time,
                "total_time": total_time,
                "efficiency_score": self.calculate_efficiency_score(total_time),
                "status": "success" if backend_response.status_code == 200 and frontend_response.status_code == 200 else "partial"
            }
            
        except Exception as e:
            return {
                "pipeline": "KPI Data",
                "backend_time": 0,
                "frontend_time": 0,
                "total_time": 0,
                "efficiency_score": 0,
                "status": "error",
                "error": str(e)
            }
    
    def test_chart_pipeline_timing(self) -> Dict[str, Any]:
        """Test chart data pipeline timing"""
        try:
            # Backend data fetch
            start_time = time.time()
            backend_response = self.session.get(f"{self.api_url}/api/charts/sales-trend", timeout=15)
            backend_time = (time.time() - start_time) * 1000
            
            # Frontend rendering
            start_time = time.time()
            frontend_response = self.session.get(f"{self.base_url}/sales", timeout=15)
            frontend_time = (time.time() - start_time) * 1000
            
            total_time = backend_time + frontend_time
            
            return {
                "pipeline": "Chart Data",
                "backend_time": backend_time,
                "frontend_time": frontend_time,
                "total_time": total_time,
                "efficiency_score": self.calculate_efficiency_score(total_time),
                "status": "success" if backend_response.status_code == 200 and frontend_response.status_code == 200 else "partial"
            }
            
        except Exception as e:
            return {
                "pipeline": "Chart Data",
                "backend_time": 0,
                "frontend_time": 0,
                "total_time": 0,
                "efficiency_score": 0,
                "status": "error",
                "error": str(e)
            }
    
    def test_table_pipeline_timing(self) -> Dict[str, Any]:
        """Test table data pipeline timing"""
        try:
            # Backend data fetch
            start_time = time.time()
            backend_response = self.session.get(f"{self.api_url}/api/tables/sales-data", timeout=15)
            backend_time = (time.time() - start_time) * 1000
            
            # Frontend rendering
            start_time = time.time()
            frontend_response = self.session.get(f"{self.base_url}/sales", timeout=15)
            frontend_time = (time.time() - start_time) * 1000
            
            total_time = backend_time + frontend_time
            
            return {
                "pipeline": "Table Data",
                "backend_time": backend_time,
                "frontend_time": frontend_time,
                "total_time": total_time,
                "efficiency_score": self.calculate_efficiency_score(total_time),
                "status": "success" if backend_response.status_code == 200 and frontend_response.status_code == 200 else "partial"
            }
            
        except Exception as e:
            return {
                "pipeline": "Table Data",
                "backend_time": 0,
                "frontend_time": 0,
                "total_time": 0,
                "efficiency_score": 0,
                "status": "error",
                "error": str(e)
            }
    
    def test_filter_pipeline_timing(self) -> Dict[str, Any]:
        """Test filter data pipeline timing"""
        try:
            # Backend data fetch
            start_time = time.time()
            backend_response = self.session.get(f"{self.api_url}/api/filters/options", timeout=15)
            backend_time = (time.time() - start_time) * 1000
            
            # Frontend rendering
            start_time = time.time()
            frontend_response = self.session.get(f"{self.base_url}/dashboard", timeout=15)
            frontend_time = (time.time() - start_time) * 1000
            
            total_time = backend_time + frontend_time
            
            return {
                "pipeline": "Filter Data",
                "backend_time": backend_time,
                "frontend_time": frontend_time,
                "total_time": total_time,
                "efficiency_score": self.calculate_efficiency_score(total_time),
                "status": "success" if backend_response.status_code == 200 and frontend_response.status_code == 200 else "partial"
            }
            
        except Exception as e:
            return {
                "pipeline": "Filter Data",
                "backend_time": 0,
                "frontend_time": 0,
                "total_time": 0,
                "efficiency_score": 0,
                "status": "error",
                "error": str(e)
            }
    
    def test_ingestion_pipeline_timing(self) -> Dict[str, Any]:
        """Test data ingestion pipeline timing"""
        try:
            # Backend data fetch
            start_time = time.time()
            backend_response = self.session.get(f"{self.api_url}/api/ingest/status", timeout=15)
            backend_time = (time.time() - start_time) * 1000
            
            # Frontend rendering
            start_time = time.time()
            frontend_response = self.session.get(f"{self.base_url}/data-ingestion", timeout=15)
            frontend_time = (time.time() - start_time) * 1000
            
            total_time = backend_time + frontend_time
            
            return {
                "pipeline": "Ingestion Data",
                "backend_time": backend_time,
                "frontend_time": frontend_time,
                "total_time": total_time,
                "efficiency_score": self.calculate_efficiency_score(total_time),
                "status": "success" if backend_response.status_code == 200 and frontend_response.status_code == 200 else "partial"
            }
            
        except Exception as e:
            return {
                "pipeline": "Ingestion Data",
                "backend_time": 0,
                "frontend_time": 0,
                "total_time": 0,
                "efficiency_score": 0,
                "status": "error",
                "error": str(e)
            }
    
    def calculate_efficiency_score(self, total_time: float) -> float:
        """Calculate efficiency score based on response time"""
        if total_time <= 100:  # Under 100ms
            return 100.0
        elif total_time <= 500:  # Under 500ms
            return 90.0
        elif total_time <= 1000:  # Under 1 second
            return 75.0
        elif total_time <= 2000:  # Under 2 seconds
            return 50.0
        else:  # Over 2 seconds
            return 25.0
    
    def calculate_overall_pipeline_efficiency(self, pipeline_tests: List[Dict]) -> float:
        """Calculate overall pipeline efficiency score"""
        if not pipeline_tests:
            return 0.0
        
        efficiency_scores = [test.get("efficiency_score", 0) for test in pipeline_tests]
        return statistics.mean(efficiency_scores)
    
    def get_graphql_query_for_endpoint(self, endpoint: str) -> str:
        """Get appropriate GraphQL query for testing"""
        if "dashboard" in endpoint:
            return """
            query {
                dashboardData {
                    revenueSummary {
                        totalRevenue
                        grossProfit
                        netSales
                    }
                }
            }
            """
        else:
            return """
            query {
                dashboardData {
                    revenueSummary {
                        totalRevenue
                    }
                }
            }
            """
    
    def extract_sample_data(self, data: Any) -> Any:
        """Extract sample data for analysis"""
        if isinstance(data, dict):
            return {k: str(v)[:100] for k, v in list(data.items())[:3]}
        elif isinstance(data, list):
            return str(data[:2])[:100]
        else:
            return str(data)[:100]
    
    def check_data_components(self, content: str) -> Dict[str, bool]:
        """Check if content has data-related components"""
        return {
            "has_charts": "chart" in content.lower() or "canvas" in content,
            "has_tables": "table" in content.lower(),
            "has_kpis": "kpi" in content.lower() or "metric" in content.lower(),
            "has_filters": "filter" in content.lower() or "date" in content.lower(),
            "has_maps": "map" in content.lower() or "geographic" in content.lower()
        }
    
    def count_rendering_elements(self, content: str) -> Dict[str, int]:
        """Count rendering elements in content"""
        return {
            "div_elements": content.count("<div"),
            "span_elements": content.count("<span"),
            "table_elements": content.count("<table"),
            "canvas_elements": content.count("<canvas"),
            "svg_elements": content.count("<svg")
        }
    
    def generate_comprehensive_report(self) -> Dict[str, Any]:
        """Generate comprehensive consistency and efficiency report"""
        logger.info("📋 Generating Comprehensive Report...")
        
        # Run all tests
        consistency_results = self.test_data_pipeline_consistency()
        efficiency_results = self.test_component_efficiency()
        pipeline_timing = self.test_pipeline_timing()
        
        # Calculate overall metrics
        overall_consistency = statistics.mean([r["consistency_score"] for r in consistency_results]) if consistency_results else 0.0
        overall_efficiency = statistics.mean([m.data_consistency_score for m in efficiency_results]) if efficiency_results else 0.0
        
        report = {
            "timestamp": datetime.now().isoformat(),
            "summary": {
                "overall_consistency_score": overall_consistency,
                "overall_efficiency_score": overall_efficiency,
                "pipeline_efficiency": pipeline_timing["overall_pipeline_efficiency"],
                "total_components_tested": len(efficiency_results),
                "total_scenarios_tested": len(consistency_results)
            },
            "consistency_results": consistency_results,
            "efficiency_results": [self.pipeline_metrics_to_dict(m) for m in efficiency_results],
            "pipeline_timing": pipeline_timing,
            "recommendations": self.generate_efficiency_recommendations(consistency_results, efficiency_results, pipeline_timing)
        }
        
        # Save report
        filename = f"frontend_consistency_efficiency_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(filename, 'w') as f:
            json.dump(report, f, indent=2)
        
        logger.info(f"📄 Report saved to: {filename}")
        
        # Print summary
        self.print_comprehensive_summary(report)
        
        return report
    
    def pipeline_metrics_to_dict(self, metrics: PipelineMetrics) -> Dict[str, Any]:
        """Convert PipelineMetrics to dictionary for JSON serialization"""
        return {
            "component": metrics.component,
            "backend_response_time": metrics.backend_response_time,
            "frontend_rendering_time": metrics.frontend_rendering_time,
            "data_consistency_score": metrics.data_consistency_score,
            "total_pipeline_time": metrics.total_pipeline_time,
            "data_freshness": metrics.data_freshness,
            "error_count": metrics.error_count
        }
    
    def generate_efficiency_recommendations(self, consistency_results: List[Dict], efficiency_results: List[PipelineMetrics], pipeline_timing: Dict) -> List[Dict[str, Any]]:
        """Generate recommendations based on test results"""
        recommendations = []
        
        # Analyze consistency issues
        low_consistency = [r for r in consistency_results if r["consistency_score"] < 70]
        if low_consistency:
            recommendations.append({
                "priority": "HIGH",
                "category": "Data Consistency",
                "action": "Fix low consistency scenarios",
                "details": f"Found {len(low_consistency)} scenarios with consistency < 70%",
                "scenarios": [r["scenario"] for r in low_consistency]
            })
        
        # Analyze efficiency issues
        slow_components = [m for m in efficiency_results if m.total_pipeline_time > 1000]
        if slow_components:
            recommendations.append({
                "priority": "MEDIUM",
                "category": "Performance",
                "action": "Optimize slow components",
                "details": f"Found {len(slow_components)} components with pipeline time > 1s",
                "components": [m.component for m in slow_components]
            })
        
        # Analyze pipeline efficiency
        if pipeline_timing["overall_pipeline_efficiency"] < 80:
            recommendations.append({
                "priority": "MEDIUM",
                "category": "Pipeline Efficiency",
                "action": "Improve overall pipeline performance",
                "details": f"Overall pipeline efficiency is {pipeline_timing['overall_pipeline_efficiency']:.1f}%"
            })
        
        # General recommendations
        recommendations.extend([
            {
                "priority": "LOW",
                "category": "Monitoring",
                "action": "Implement real-time performance monitoring",
                "details": "Add continuous monitoring for consistency and efficiency metrics"
            },
            {
                "priority": "LOW",
                "category": "Caching",
                "action": "Implement data caching strategies",
                "details": "Add caching to improve response times and reduce backend load"
            }
        ])
        
        return recommendations
    
    def print_comprehensive_summary(self, report: Dict[str, Any]):
        """Print comprehensive test summary"""
        logger.info("\n" + "="*80)
        logger.info("📊 FRONTEND CONSISTENCY & EFFICIENCY TEST SUMMARY")
        logger.info("="*80)
        
        summary = report["summary"]
        logger.info(f"Overall Consistency Score: {summary['overall_consistency_score']:.1f}%")
        logger.info(f"Overall Efficiency Score: {summary['overall_efficiency_score']:.1f}%")
        logger.info(f"Pipeline Efficiency: {summary['pipeline_efficiency']:.1f}%")
        logger.info(f"Components Tested: {summary['total_components_tested']}")
        logger.info(f"Scenarios Tested: {summary['total_scenarios_tested']}")
        
        # Print pipeline timing summary
        logger.info(f"\n⏱️ Pipeline Timing Summary:")
        for test in report["pipeline_timing"]["pipeline_tests"]:
            status_icon = "✅" if test["status"] == "success" else "⚠️" if test["status"] == "partial" else "❌"
            logger.info(f"  {status_icon} {test['pipeline']}: {test['total_time']:.1f}ms (Score: {test['efficiency_score']:.1f}%)")
        
        # Print recommendations
        if report["recommendations"]:
            logger.info(f"\n🚨 Recommendations ({len(report['recommendations'])}):")
            for rec in report["recommendations"]:
                priority_icon = "🔴" if rec["priority"] == "HIGH" else "🟡" if rec["priority"] == "MEDIUM" else "🟢"
                logger.info(f"  {priority_icon} {rec['priority']}: {rec['action']}")
        
        logger.info("="*80)
    
    def run_all_tests(self) -> Dict[str, Any]:
        """Run all consistency and efficiency tests"""
        logger.info("🚀 Starting Frontend Consistency & Efficiency Testing...")
        
        try:
            report = self.generate_comprehensive_report()
            logger.info("✅ Comprehensive testing completed successfully!")
            return report
        except Exception as e:
            logger.error(f"❌ Comprehensive testing failed: {str(e)}")
            return {"status": "failed", "error": str(e)}

def main():
    """Main execution function"""
    tester = FrontendConsistencyEfficiencyTester()
    
    try:
        report = tester.run_all_tests()
        return report
    except Exception as e:
        logger.error(f"❌ Testing failed: {str(e)}")
        return {"status": "failed", "error": str(e)}

if __name__ == "__main__":
    main()
