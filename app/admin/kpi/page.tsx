"use client"

import KPIDashboard from "../../components/admin/KPIDashboard"
import { usePageTitle } from "@/hooks/use-page-title"

export default function KPIPage() {
  usePageTitle("KPI Dashboard")
  return <KPIDashboard />
} 