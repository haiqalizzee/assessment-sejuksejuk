"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trophy, TrendingUp, Users, AlertTriangle, DollarSign } from "lucide-react"
import { useEffect, useState } from "react"
import { kpiService } from "@/lib/firebase-services"
import type { TechnicianKPI } from "@/app/types"

interface WeeklyMetrics {
  currentWeek: {
    totalJobs: number
    totalRevenue: number
    totalReworks: number
  }
  previousWeek: {
    totalJobs: number
    totalRevenue: number
    totalReworks: number
  }
  percentageChanges: {
    jobs: number
    revenue: number
    reworks: number
  }
}

export default function KPIDashboard() {
  const [technicianKPIs, setTechnicianKPIs] = useState<TechnicianKPI[]>([])
  const [weeklyMetrics, setWeeklyMetrics] = useState<WeeklyMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadKPIData = async () => {
      try {
        setLoading(true)
        const data = await kpiService.getTechnicianKPIsWithComparison()
        setTechnicianKPIs(data.technicianKPIs)
        setWeeklyMetrics(data.weeklyMetrics)
      } catch (error) {
        console.error("Error loading KPI data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadKPIData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-blue-900 mb-2">KPI Dashboard</h2>
          <p className="text-blue-600">Loading performance metrics...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-0 shadow-lg animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-4 w-4 bg-gray-200 rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-32"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const totalJobs = weeklyMetrics?.currentWeek.totalJobs || 0
  const totalRevenue = weeklyMetrics?.currentWeek.totalRevenue || 0
  const totalReworks = weeklyMetrics?.currentWeek.totalReworks || 0

  const getPercentageChangeDisplay = (change: number) => {
    const isPositive = change >= 0
    const icon = isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingUp className="w-3 h-3 mr-1 rotate-180" />
    const color = isPositive ? "text-green-600" : "text-red-600"
    return (
      <p className={`text-xs text-gray-500 flex items-center mt-1 ${color}`}>
        {icon}
        {isPositive ? "+" : ""}{change}% from last week
      </p>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-blue-900 mb-2">KPI Dashboard</h2>
        <p className="text-blue-600">Performance metrics and technician leaderboard</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Jobs</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalJobs}</div>
            {weeklyMetrics && getPercentageChangeDisplay(weeklyMetrics.percentageChanges.jobs)}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">RM {totalRevenue.toLocaleString()}</div>
            {weeklyMetrics && getPercentageChangeDisplay(weeklyMetrics.percentageChanges.revenue)}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Reworks</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{totalReworks}</div>
            {weeklyMetrics && getPercentageChangeDisplay(weeklyMetrics.percentageChanges.reworks)}
          </CardContent>
        </Card>
      </div>

      {/* Technician Leaderboard */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl text-blue-900 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-blue-600" />
            Technician Performance Leaderboard
          </CardTitle>
          <CardDescription>Weekly performance summary for all technicians</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Technician Name</TableHead>
                  <TableHead className="text-center">Jobs Done</TableHead>
                  <TableHead className="text-center">Total Amount</TableHead>
                  <TableHead className="text-center">Reworks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {technicianKPIs
                  .sort((a, b) => b.jobsDone - a.jobsDone)
                  .map((technician, index) => (
                    <TableRow key={technician.name} className="hover:bg-blue-50">
                      <TableCell className="font-medium">
                        <div className="flex items-center justify-center">
                          {index === 0 && <Trophy className="w-4 h-4 text-yellow-500" />}
                          {index === 1 && <Trophy className="w-4 h-4 text-gray-400" />}
                          {index === 2 && <Trophy className="w-4 h-4 text-amber-600" />}
                          {index > 2 && <span className="text-gray-500">{index + 1}</span>}
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">{technician.name}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                          {technician.jobsDone}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center font-semibold text-green-600">
                        RM {technician.totalAmount.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-center">
                        <span
                          className={`font-semibold ${
                            technician.reworks === 0
                              ? "text-green-600"
                              : technician.reworks <= 2
                                ? "text-yellow-600"
                                : "text-red-600"
                          }`}
                        >
                          {technician.reworks}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
