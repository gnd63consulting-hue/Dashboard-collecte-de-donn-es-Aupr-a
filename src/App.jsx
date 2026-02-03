import { motion, AnimatePresence } from 'framer-motion'
import { Users, Calendar, TrendingUp, AlertCircle } from 'lucide-react'

// Components
import Header from './components/Header'
import KPICard from './components/KPICard'
import ProgressGauge from './components/ProgressGauge'
import ScoreGauges from './components/ScoreGauges'
import AccompagnementChart from './components/AccompagnementChart'
import ProfilChart from './components/ProfilChart'
import LeadsChart from './components/LeadsChart'
import WeekdayChart from './components/WeekdayChart'
import HeatmapChart from './components/HeatmapChart'
import LeadsTable from './components/LeadsTable'
import AIInsights from './components/AIInsights'
import Footer from './components/Footer'

// Hooks
import { useLeads, useLeadStats } from './hooks/useSupabase'

function ErrorBanner({ error, onRetry }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10 }}
      className="mb-6 p-5 bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-200 rounded-2xl flex items-center justify-between shadow-lg shadow-red-100/50"
    >
      <div className="flex items-center gap-4">
        <div className="p-3 bg-red-500 rounded-xl shadow-lg shadow-red-500/30">
          <AlertCircle className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="text-red-700 font-semibold text-lg">Erreur de connexion</p>
          <p className="text-red-600/80 text-sm mt-1">{error}</p>
        </div>
      </div>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onRetry}
        className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl text-sm transition-all shadow-lg shadow-red-500/30 hover:shadow-red-500/40"
      >
        Réessayer
      </motion.button>
    </motion.div>
  )
}

function App() {
  // Fetch leads with real-time updates
  const { leads, loading, error, lastUpdate, isConnected, refresh } = useLeads()

  // Compute statistics
  const stats = useLeadStats(leads)

  return (
    <div className="min-h-screen relative">
      {/* Background pattern */}
      <div className="bg-pattern" />

      {/* Main content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <Header
          isConnected={isConnected}
          lastUpdate={lastUpdate}
          onRefresh={refresh}
          loading={loading}
        />

        {/* Error Banner */}
        <AnimatePresence>
          {error && <ErrorBanner error={error} onRetry={refresh} />}
        </AnimatePresence>

        {/* KPI Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <KPICard
            title="Total Leads"
            value={stats.total}
            icon={Users}
            loading={loading}
            isGold={true}
            delay={0}
          />
          <KPICard
            title="Aujourd'hui"
            value={stats.today}
            subtitle={`Hier : ${stats.yesterday}`}
            change={stats.todayChange}
            icon={Calendar}
            loading={loading}
            delay={0.1}
          />
          <KPICard
            title="Cette semaine"
            value={stats.thisWeek}
            subtitle={`Semaine dernière : ${stats.lastWeek}`}
            change={stats.weeklyChange}
            sparklineData={stats.weeklySparkline}
            icon={TrendingUp}
            loading={loading}
            delay={0.2}
          />
          <ProgressGauge
            current={stats.total}
            target={10000}
            loading={loading}
          />
        </div>

        {/* Score Gauges - Charles' Request #1 */}
        <div className="mb-6">
          <ScoreGauges
            scoreStats={stats.scoreStats}
            loading={loading}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Main chart - takes 2 columns */}
          <div className="lg:col-span-2">
            <LeadsChart
              data={stats.dailyData}
              loading={loading}
            />
          </div>

          {/* Side charts */}
          <div className="space-y-6">
            <WeekdayChart
              data={stats.weekdayData}
              bestDay={stats.bestDay}
              loading={loading}
            />
          </div>
        </div>

        {/* Second Row - Heatmap and AI Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <HeatmapChart
            data={stats.heatmapData}
            loading={loading}
          />
          <AIInsights
            stats={stats}
            loading={loading}
          />
        </div>

        {/* Third Row - Accompaniment and Profile Distribution - Charles' Request #2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <AccompagnementChart
            data={stats.accompagnementDistribution}
            loading={loading}
            delay={0.4}
          />
          <ProfilChart
            data={stats.profilDistribution}
            loading={loading}
            delay={0.5}
          />
        </div>

        {/* Leads Table */}
        <LeadsTable
          leads={leads}
          loading={loading}
        />

        {/* Footer */}
        <Footer lastUpdate={lastUpdate} />
      </div>
    </div>
  )
}

export default App
