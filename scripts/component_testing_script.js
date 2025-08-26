#!/usr/bin/env node

/**
 * Comprehensive Component Testing Script
 * 
 * This script systematically tests every frontend component to identify:
 * - Data loading issues
 * - Visualization problems
 * - Error states
 * - Performance bottlenecks
 */

const puppeteer = require('puppeteer');
const fs = require('fs');

class ComponentTester {
  constructor() {
    this.results = [];
    this.browser = null;
    this.page = null;
  }

  async initialize() {
    console.log('🚀 Initializing Component Tester...');
    
    this.browser = await puppeteer.launch({
      headless: false,
      defaultViewport: { width: 1920, height: 1080 },
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    this.page = await this.browser.newPage();
    
    // Enable console logging
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`❌ Console Error: ${msg.text()}`);
      } else if (msg.type() === 'warn') {
        console.log(`⚠️ Console Warning: ${msg.text()}`);
      }
    });
    
    // Enable request/response logging
    this.page.on('request', request => {
      const url = request.url();
      if (url.includes('localhost:8000')) {
        console.log(`📡 API Request: ${request.method()} ${url}`);
      }
    });
    
    this.page.on('response', response => {
      const url = response.url();
      if (url.includes('localhost:8000')) {
        const status = response.status();
        console.log(`📥 API Response: ${status} ${url}`);
      }
    });
    
    console.log('✅ Browser initialized successfully');
  }

  async testDashboardComponents() {
    console.log('\n📊 Testing Dashboard Components...');
    
    // Navigate to dashboard
    await this.page.goto('http://localhost:3000', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    // Wait for initial load
    await this.page.waitForTimeout(5000);
    
    // Test each component systematically
    await this.testKpiCards();
    await this.testCharts();
    await this.testTables();
    await this.testMaps();
    await this.testFilters();
    await this.testDataFlow();
  }

  async testKpiCards() {
    console.log('\n🔢 Testing KPI Cards...');
    
    try {
      // Look for KPI cards
      const kpiCards = await this.page.$$('[data-testid*="kpi"], .kpi-card, .metric-card, [class*="kpi"]');
      console.log(`Found ${kpiCards.length} KPI cards`);
      
      for (let i = 0; i < kpiCards.length; i++) {
        const card = kpiCards[i];
        
        // Check card content
        const text = await card.evaluate(el => el.textContent);
        const hasValue = /\d+/.test(text);
        const hasLoading = text.includes('Loading') || text.includes('...');
        const hasError = text.includes('Error') || text.includes('Failed');
        
        console.log(`KPI Card ${i + 1}:`);
        console.log(`  Text: ${text.substring(0, 100)}...`);
        console.log(`  Has Value: ${hasValue}`);
        console.log(`  Loading: ${hasLoading}`);
        console.log(`  Error: ${hasError}`);
        
        this.results.push({
          component: 'KPI Card',
          index: i + 1,
          hasValue,
          hasLoading,
          hasError,
          text: text.substring(0, 100),
          timestamp: new Date().toISOString()
        });
      }
      
      // Check for missing KPI cards
      const expectedKpis = ['Total Revenue', 'Gross Profit', 'Total Sales', 'Transaction Count'];
      for (const expected of expectedKpis) {
        const found = await this.page.$(`text=${expected}`);
        if (!found) {
          console.log(`⚠️ Missing KPI: ${expected}`);
          this.results.push({
            component: 'Missing KPI',
            name: expected,
            status: 'missing',
            timestamp: new Date().toISOString()
          });
        }
      }
      
    } catch (error) {
      console.log(`❌ KPI Cards test failed: ${error.message}`);
    }
  }

  async testCharts() {
    console.log('\n📈 Testing Charts...');
    
    try {
      // Look for chart elements
      const charts = await this.page.$$('canvas, svg, [class*="chart"], [class*="graph"]');
      console.log(`Found ${charts.length} chart elements`);
      
      for (let i = 0; i < charts.length; i++) {
        const chart = charts[i];
        
        // Check chart dimensions
        const box = await chart.boundingBox();
        const hasData = await chart.evaluate(el => {
          // Check if chart has data (this is chart-specific)
          if (el.tagName === 'CANVAS') {
            const ctx = el.getContext('2d');
            const imageData = ctx.getImageData(0, 0, el.width, el.height);
            return imageData.data.some(pixel => pixel !== 0);
          }
          return el.children.length > 0;
        });
        
        console.log(`Chart ${i + 1}:`);
        console.log(`  Type: ${await chart.evaluate(el => el.tagName)}`);
        console.log(`  Dimensions: ${box?.width || 'N/A'} x ${box?.height || 'N/A'}`);
        console.log(`  Has Data: ${hasData}`);
        
        this.results.push({
          component: 'Chart',
          index: i + 1,
          type: await chart.evaluate(el => el.tagName),
          dimensions: box ? `${box.width}x${box.height}` : 'N/A',
          hasData,
          timestamp: new Date().toISOString()
        });
      }
      
      // Check for specific chart types
      const chartTypes = ['Monthly Sales Trend', 'Branch Performance', 'Product Analytics'];
      for (const chartType of chartTypes) {
        const found = await this.page.$(`text=${chartType}`);
        if (!found) {
          console.log(`⚠️ Missing Chart: ${chartType}`);
        }
      }
      
    } catch (error) {
      console.log(`❌ Charts test failed: ${error.message}`);
    }
  }

  async testTables() {
    console.log('\n📋 Testing Tables...');
    
    try {
      // Look for table elements
      const tables = await this.page.$$('table, [class*="table"], [role="table"]');
      console.log(`Found ${tables.length} table elements`);
      
      for (let i = 0; i < tables.length; i++) {
        const table = tables[i];
        
        // Check table content
        const rows = await table.$$('tr, [role="row"]');
        const hasData = rows.length > 1; // More than just header
        
        console.log(`Table ${i + 1}:`);
        console.log(`  Rows: ${rows.length}`);
        console.log(`  Has Data: ${hasData}`);
        
        if (hasData) {
          // Check first data row
          const firstDataRow = rows[1];
          const cells = await firstDataRow.$$('td, [role="cell"]');
          const cellTexts = await Promise.all(
            cells.map(cell => cell.evaluate(el => el.textContent))
          );
          console.log(`  Sample Data: ${cellTexts.join(' | ')}`);
        }
        
        this.results.push({
          component: 'Table',
          index: i + 1,
          rows: rows.length,
          hasData,
          sampleData: hasData ? await rows[1]?.evaluate(el => el.textContent) : 'N/A',
          timestamp: new Date().toISOString()
        });
      }
      
    } catch (error) {
      console.log(`❌ Tables test failed: ${error.message}`);
    }
  }

  async testMaps() {
    console.log('\n🗺️ Testing Maps...');
    
    try {
      // Look for map elements
      const maps = await this.page.$$('[class*="map"], [class*="geographic"], iframe[src*="maps"]');
      console.log(`Found ${maps.length} map elements`);
      
      for (let i = 0; i < maps.length; i++) {
        const map = maps[i];
        
        // Check map properties
        const tagName = await map.evaluate(el => el.tagName);
        const hasContent = await map.evaluate(el => {
          if (el.tagName === 'IFRAME') {
            return el.src && el.src.length > 0;
          }
          return el.children.length > 0 || el.textContent.length > 0;
        });
        
        console.log(`Map ${i + 1}:`);
        console.log(`  Type: ${tagName}`);
        console.log(`  Has Content: ${hasContent}`);
        
        this.results.push({
          component: 'Map',
          index: i + 1,
          type: tagName,
          hasContent,
          timestamp: new Date().toISOString()
        });
      }
      
    } catch (error) {
      console.log(`❌ Maps test failed: ${error.message}`);
    }
  }

  async testFilters() {
    console.log('\n🔍 Testing Filters...');
    
    try {
      // Look for filter elements
      const filters = await this.page.$$('input[type="date"], select, [class*="filter"], [class*="picker"]');
      console.log(`Found ${filters.length} filter elements`);
      
      for (let i = 0; i < filters.length; i++) {
        const filter = filters[i];
        
        // Check filter properties
        const tagName = await filter.evaluate(el => el.tagName);
        const type = await filter.evaluate(el => el.type || el.tagName);
        const placeholder = await filter.evaluate(el => el.placeholder || '');
        const value = await filter.evaluate(el => el.value || '');
        
        console.log(`Filter ${i + 1}:`);
        console.log(`  Type: ${type}`);
        console.log(`  Placeholder: ${placeholder}`);
        console.log(`  Current Value: ${value}`);
        
        this.results.push({
          component: 'Filter',
          index: i + 1,
          type,
          placeholder,
          value,
          timestamp: new Date().toISOString()
        });
      }
      
      // Test filter interactions
      await this.testFilterInteractions();
      
    } catch (error) {
      console.log(`❌ Filters test failed: ${error.message}`);
    }
  }

  async testFilterInteractions() {
    console.log('\n🔄 Testing Filter Interactions...');
    
    try {
      // Test date filter changes
      const dateInputs = await this.page.$$('input[type="date"]');
      if (dateInputs.length > 0) {
        console.log('Testing date filter changes...');
        
        const startInput = dateInputs[0];
        const endInput = dateInputs[1] || dateInputs[0];
        
        // Change start date
        await startInput.click();
        await startInput.type('2024-12-01');
        await startInput.press('Enter');
        
        // Change end date
        await endInput.click();
        await endInput.type('2024-12-31');
        await endInput.press('Enter');
        
        // Wait for data to update
        await this.page.waitForTimeout(3000);
        
        console.log('✅ Date filters changed successfully');
        
        // Check if data updated
        const updatedKpis = await this.page.$$('[data-testid*="kpi"], .kpi-card');
        console.log(`KPI cards after filter change: ${updatedKpis.length}`);
        
      }
      
      // Test branch filter
      const branchSelects = await this.page.$$('select');
      if (branchSelects.length > 0) {
        console.log('Testing branch filter...');
        
        const branchSelect = branchSelects[0];
        await branchSelect.select('Nairobi');
        
        await this.page.waitForTimeout(2000);
        console.log('✅ Branch filter changed successfully');
      }
      
    } catch (error) {
      console.log(`❌ Filter interactions test failed: ${error.message}`);
    }
  }

  async testDataFlow() {
    console.log('\n🌊 Testing Data Flow...');
    
    try {
      // Check for loading states
      const loadingElements = await this.page.$$('[class*="loading"], [class*="spinner"], [class*="skeleton"]');
      console.log(`Found ${loadingElements.length} loading elements`);
      
      // Check for error states
      const errorElements = await this.page.$$('[class*="error"], [class*="alert"], [class*="warning"]');
      console.log(`Found ${errorElements.length} error/warning elements`);
      
      // Check for empty states
      const emptyElements = await this.page.$$('[class*="empty"], [class*="no-data"], text="No data available"');
      console.log(`Found ${emptyElements.length} empty state elements`);
      
      // Check data consistency
      await this.checkDataConsistency();
      
    } catch (error) {
      console.log(`❌ Data flow test failed: ${error.message}`);
    }
  }

  async checkDataConsistency() {
    console.log('\n🔍 Checking Data Consistency...');
    
    try {
      // Get all KPI values
      const kpiCards = await this.page.$$('[data-testid*="kpi"], .kpi-card');
      const kpiValues = [];
      
      for (const card of kpiCards) {
        const text = await card.evaluate(el => el.textContent);
        const numbers = text.match(/\d+(?:,\d+)*(?:\.\d+)?/g) || [];
        kpiValues.push(...numbers.map(n => parseFloat(n.replace(/,/g, ''))));
      }
      
      console.log(`Found ${kpiValues.length} numeric values in KPIs`);
      
      // Check for reasonable values
      const hasReasonableValues = kpiValues.every(val => val >= 0 && val < 1000000000);
      console.log(`Values are reasonable: ${hasReasonableValues}`);
      
      // Check for zero values (might indicate loading issues)
      const zeroValues = kpiValues.filter(val => val === 0);
      console.log(`Zero values found: ${zeroValues.length}`);
      
      this.results.push({
        component: 'Data Consistency',
        totalValues: kpiValues.length,
        hasReasonableValues,
        zeroValuesCount: zeroValues.length,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.log(`❌ Data consistency check failed: ${error.message}`);
    }
  }

  async generateReport() {
    console.log('\n📋 Generating Component Test Report...');
    
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalComponents: this.results.length,
        componentsByType: this.groupResultsByType(),
        issuesFound: this.identifyIssues()
      },
      results: this.results,
      recommendations: this.generateRecommendations()
    };
    
    // Save report
    const filename = `component_test_report_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    fs.writeFileSync(filename, JSON.stringify(report, null, 2));
    
    console.log(`📄 Report saved to: ${filename}`);
    
    // Print summary
    console.log('\n📊 Component Test Summary:');
    console.log(`Total Components Tested: ${report.summary.totalComponents}`);
    console.log(`Issues Found: ${report.summary.issuesFound.length}`);
    
    if (report.summary.issuesFound.length > 0) {
      console.log('\n🚨 Issues Found:');
      report.summary.issuesFound.forEach(issue => {
        console.log(`  - ${issue.component}: ${issue.description}`);
      });
    }
    
    return report;
  }

  groupResultsByType() {
    const groups = {};
    this.results.forEach(result => {
      const type = result.component;
      if (!groups[type]) groups[type] = [];
      groups[type].push(result);
    });
    return groups;
  }

  identifyIssues() {
    const issues = [];
    
    this.results.forEach(result => {
      if (result.hasError) {
        issues.push({
          component: result.component,
          description: `Error state detected: ${result.text}`,
          severity: 'high'
        });
      }
      
      if (result.hasLoading) {
        issues.push({
          component: result.component,
          description: `Still in loading state`,
          severity: 'medium'
        });
      }
      
      if (result.component === 'KPI Card' && !result.hasValue) {
        issues.push({
          component: result.component,
          description: `No numeric value displayed`,
          severity: 'high'
        });
      }
      
      if (result.component === 'Chart' && !result.hasData) {
        issues.push({
          component: result.component,
          description: `Chart has no data`,
          severity: 'high'
        });
      }
    });
    
    return issues;
  }

  generateRecommendations() {
    const recommendations = [];
    
    const issues = this.identifyIssues();
    
    if (issues.some(i => i.severity === 'high')) {
      recommendations.push({
        priority: 'CRITICAL',
        action: 'Fix high-severity component issues immediately',
        components: issues.filter(i => i.severity === 'high').map(i => i.component)
      });
    }
    
    if (issues.some(i => i.component === 'KPI Card' && !i.hasValue)) {
      recommendations.push({
        priority: 'HIGH',
        action: 'Investigate KPI data loading issues',
        details: 'KPI cards are not displaying numeric values'
      });
    }
    
    if (issues.some(i => i.component === 'Chart' && !i.hasData)) {
      recommendations.push({
        priority: 'HIGH',
        action: 'Fix chart data rendering issues',
        details: 'Charts are not displaying data properly'
      });
    }
    
    recommendations.push({
      priority: 'MEDIUM',
      action: 'Implement comprehensive error handling',
      details: 'Add proper error boundaries and fallback states'
    });
    
    return recommendations;
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
      console.log('🧹 Browser closed');
    }
  }
}

// Main execution
async function main() {
  const tester = new ComponentTester();
  
  try {
    await tester.initialize();
    await tester.testDashboardComponents();
    await tester.generateReport();
  } catch (error) {
    console.error('❌ Component testing failed:', error);
  } finally {
    await tester.cleanup();
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = ComponentTester;
