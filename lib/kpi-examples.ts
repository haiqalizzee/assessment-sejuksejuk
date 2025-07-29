import { kpiService } from "./firebase-services"

// Example 1: Get weekly metrics for comparison
export async function getWeeklyComparisonExample() {
  try {
    const weeklyMetrics = await kpiService.getWeeklyMetrics()
    
    console.log("Current Week Metrics:", weeklyMetrics.currentWeek)
    console.log("Previous Week Metrics:", weeklyMetrics.previousWeek)
    console.log("Percentage Changes:", weeklyMetrics.percentageChanges)
    
    return weeklyMetrics
  } catch (error) {
    console.error("Error getting weekly metrics:", error)
    return null
  }
}

// Example 2: Get technician KPIs with weekly comparison
export async function getTechnicianKPIsWithComparisonExample() {
  try {
    const data = await kpiService.getTechnicianKPIsWithComparison()
    
    console.log("Technician KPIs:", data.technicianKPIs)
    console.log("Weekly Metrics:", data.weeklyMetrics)
    
    return data
  } catch (error) {
    console.error("Error getting KPIs with comparison:", error)
    return null
  }
}

// Example 3: Get monthly trends
export async function getMonthlyTrendsExample() {
  try {
    const monthlyTrends = await kpiService.getMonthlyTrends()
    
    console.log("Current Month:", monthlyTrends.currentMonth)
    console.log("Previous Month:", monthlyTrends.previousMonth)
    console.log("Percentage Changes:", monthlyTrends.percentageChanges)
    
    return monthlyTrends
  } catch (error) {
    console.error("Error getting monthly trends:", error)
    return null
  }
}

// Example 4: Get orders by date range
export async function getOrdersByDateRangeExample() {
  try {
    const startDate = new Date('2024-01-01')
    const endDate = new Date('2024-01-31')
    
    const orders = await kpiService.getOrdersByDateRange(startDate, endDate)
    
    console.log(`Orders from ${startDate.toDateString()} to ${endDate.toDateString()}:`, orders.length)
    
    return orders
  } catch (error) {
    console.error("Error getting orders by date range:", error)
    return []
  }
}

// Example 5: Calculate custom date range metrics
export async function getCustomDateRangeMetrics(startDate: Date, endDate: Date) {
  try {
    const orders = await kpiService.getOrdersByDateRange(startDate, endDate)
    
    const completedOrders = orders.filter(order => order.status === "completed")
    
    const metrics = {
      totalOrders: orders.length,
      completedOrders: completedOrders.length,
      totalRevenue: completedOrders.reduce((sum, order) => 
        sum + (order.finalAmount || order.quotedPrice), 0
      ),
      reworks: completedOrders.filter(order => 
        order.remarks?.toLowerCase().includes('rework') || 
        order.workDone?.toLowerCase().includes('rework')
      ).length
    }
    
    console.log("Custom Date Range Metrics:", metrics)
    return metrics
  } catch (error) {
    console.error("Error calculating custom date range metrics:", error)
    return null
  }
} 