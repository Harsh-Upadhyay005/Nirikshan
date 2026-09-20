import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/LoginPage'
import { SignupPage } from './pages/SignupPage'
import { NewDashboard } from './pages/NewDashboard'
import { DashboardPage } from './pages/DashboardPage'
import { ProjectPortfolioPage } from './pages/ProjectPortfolioPage'
import { ProjectExplorerPage } from './pages/ProjectExplorerPage'
import { RiskWarningPage } from './pages/RiskWarningPage'
import { CostOverrunPage } from './pages/CostOverrunPage'
import { TimeOverrunPage } from './pages/TimeOverrunPage'
import { AnalyticsPage } from './pages/AnalyticsPage'
import { ReportsPage } from './pages/ReportsPage'
import { DataManagementPage } from './pages/DataManagementPage'
import { UserManagementPage } from './pages/UserManagementPage'
import { SettingsPage } from './pages/SettingsPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/dashboard" element={<NewDashboard />} />
        <Route path="/dashboard-old" element={<DashboardPage />} />
        <Route path="/portfolio" element={<ProjectPortfolioPage />} />
        <Route path="/explorer" element={<ProjectExplorerPage />} />
        <Route path="/risk" element={<RiskWarningPage />} />
        <Route path="/cost" element={<CostOverrunPage />} />
        <Route path="/time" element={<TimeOverrunPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/data" element={<DataManagementPage />} />
        <Route path="/users" element={<UserManagementPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </BrowserRouter>
  )
}
