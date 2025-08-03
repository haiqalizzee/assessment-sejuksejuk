"use client"

import TechnicianManagement from "../../components/admin/TechnicianManagement"
import { usePageTitle } from "@/hooks/use-page-title"

export default function TechniciansPage() {
  usePageTitle("Technicians")
  return <TechnicianManagement />
} 