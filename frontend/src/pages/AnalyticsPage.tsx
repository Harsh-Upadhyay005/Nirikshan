import { BarChart3 } from 'lucide-react'
import { PlaceholderPage } from './PlaceholderPage'

export function AnalyticsPage() {
  return (
    <PlaceholderPage
      title="Analytics & Insights"
      description="Advanced analytics dashboard with custom reports, data visualization, trend analysis, and performance benchmarking across infrastructure projects."
      icon={<BarChart3 size={40} color="white" />}
    />
  )
}
