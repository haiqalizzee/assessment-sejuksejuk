# Backend Aggregation with Firebase Firestore

This document explains how to use the backend aggregation functions for calculating weekly metrics and comparing performance data.

## Overview

The backend aggregation system provides real-time calculation of KPIs and performance metrics using Firebase Firestore. Instead of hardcoded values, the system now calculates actual metrics based on your order data.

## Key Functions

### 1. Weekly Metrics Comparison

```typescript
import { kpiService } from "@/lib/firebase-services"

// Get current week vs previous week metrics
const weeklyMetrics = await kpiService.getWeeklyMetrics()

// Returns:
{
  currentWeek: {
    totalJobs: number,
    totalRevenue: number,
    totalReworks: number
  },
  previousWeek: {
    totalJobs: number,
    totalRevenue: number,
    totalReworks: number
  },
  percentageChanges: {
    jobs: number,      // e.g., +12 or -5
    revenue: number,   // e.g., +8 or -3
    reworks: number    // e.g., -25 or +10
  }
}
```

### 2. Technician KPIs with Weekly Comparison

```typescript
// Get both technician KPIs and weekly metrics
const data = await kpiService.getTechnicianKPIsWithComparison()

// Returns:
{
  technicianKPIs: TechnicianKPI[],
  weeklyMetrics: {
    currentWeek: { totalJobs: number, totalRevenue: number, totalReworks: number },
    previousWeek: { totalJobs: number, totalRevenue: number, totalReworks: number },
    percentageChanges: { jobs: number, revenue: number, reworks: number }
  }
}
```

### 3. Monthly Trends

```typescript
// Get current month vs previous month metrics
const monthlyTrends = await kpiService.getMonthlyTrends()

// Returns similar structure to weekly metrics but for monthly comparison
```

### 4. Custom Date Range Analysis

```typescript
// Get orders within a specific date range
const startDate = new Date('2024-01-01')
const endDate = new Date('2024-01-31')
const orders = await kpiService.getOrdersByDateRange(startDate, endDate)
```

## How It Works

### Date Range Calculation

The system calculates date ranges as follows:

- **Current Week**: Monday to Sunday of the current week
- **Previous Week**: Monday to Sunday of the previous week
- **Current Month**: 1st to last day of current month
- **Previous Month**: 1st to last day of previous month

### Metrics Calculation

1. **Total Jobs**: Count of completed orders within the date range
2. **Total Revenue**: Sum of `finalAmount` (or `quotedPrice` as fallback) for completed orders
3. **Total Reworks**: Count of completed orders with "rework" mentioned in `remarks` or `workDone`

### Percentage Change Calculation

```typescript
const calculatePercentageChange = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0
  return Math.round(((current - previous) / previous) * 100)
}
```

## Usage in Components

### KPIDashboard Component

The `KPIDashboard` component now automatically fetches and displays real metrics:

```typescript
// The component fetches data on mount
useEffect(() => {
  const loadKPIData = async () => {
    const data = await kpiService.getTechnicianKPIsWithComparison()
    setTechnicianKPIs(data.technicianKPIs)
    setWeeklyMetrics(data.weeklyMetrics)
  }
  loadKPIData()
}, [])
```

### Displaying Percentage Changes

```typescript
const getPercentageChangeDisplay = (change: number) => {
  const isPositive = change >= 0
  const icon = isPositive ? <TrendingUp /> : <TrendingUp className="rotate-180" />
  const color = isPositive ? "text-green-600" : "text-red-600"
  
  return (
    <p className={`text-xs text-gray-500 flex items-center mt-1 ${color}`}>
      {icon}
      {isPositive ? "+" : ""}{change}% from last week
    </p>
  )
}
```

## Data Requirements

For accurate calculations, ensure your order data includes:

1. **Required Fields**:
   - `status`: Must be "completed" for revenue calculations
   - `createdAt`: Date string for filtering by date range
   - `assignedTechnician`: String for technician grouping

2. **Optional Fields**:
   - `finalAmount`: Final billing amount (preferred over `quotedPrice`)
   - `quotedPrice`: Initial quoted price (fallback for revenue)
   - `remarks`: Text field for identifying reworks
   - `workDone`: Text field for identifying reworks

## Performance Considerations

1. **Real-time Updates**: The system uses Firebase real-time listeners for live updates
2. **Client-side Filtering**: Date filtering is done client-side for simplicity
3. **Caching**: Consider implementing caching for frequently accessed metrics
4. **Pagination**: For large datasets, consider implementing pagination

## Error Handling

All functions include comprehensive error handling:

```typescript
try {
  const metrics = await kpiService.getWeeklyMetrics()
  // Use metrics
} catch (error) {
  console.error("Error calculating metrics:", error)
  // Handle error gracefully
}
```

## Examples

See `lib/kpi-examples.ts` for complete usage examples including:

- Weekly comparison
- Monthly trends
- Custom date ranges
- Error handling patterns

## Migration from Hardcoded Values

If you were previously using hardcoded values like `+12% from last week`, replace them with:

```typescript
// Before (hardcoded)
<p>+12% from last week</p>

// After (dynamic)
{weeklyMetrics && getPercentageChangeDisplay(weeklyMetrics.percentageChanges.jobs)}
```

This ensures your dashboard always shows accurate, real-time data based on your actual order history. 