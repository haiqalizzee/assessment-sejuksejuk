import { useEffect } from "react"

export function usePageTitle(title: string) {
  useEffect(() => {
    const baseTitle = "Sejuk Sejuk Portal"
    const fullTitle = title ? `${baseTitle} | ${title}` : baseTitle
    
    document.title = fullTitle
    
    // Cleanup function to reset title when component unmounts
    return () => {
      document.title = baseTitle
    }
  }, [title])
} 