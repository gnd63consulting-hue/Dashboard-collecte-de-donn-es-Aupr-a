import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart3,
  FileText,
  Download,
  Loader2,
  Calendar,
  TrendingUp,
  Users,
  Zap,
  Brain,
  Crown,
  ChevronDown
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

import { useLeads, useLeadStats } from '../hooks/useSupabase'

// N8N webhook URL for Tristan agent
const N8N_AGENT_WEBHOOK = import.meta.env.VITE_N8N_AGENT_WEBHOOK || 'https://n8n.srv989411.hstgr.cloud/webhook/auprea-agent-chat'

// Period options
const PERIODS = [
  { value: 'week', label: 'Cette semaine' },
  { value: 'month', label: 'Ce mois' },
  { value: 'quarter', label: 'Ce trimestre' },
  { value: 'year', label: 'Cette année' }
]

// Custom tooltip for charts
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null

  return (
    <div className="custom-tooltip">
      <p className="text-white font-medium mb-2">{label}</p>
      {payload.map((entry, index) => (
        <p key={index} className="text-sm" style={{ color: entry.color }}>
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  )
}

// Stat card component
function StatCard({ label, value, icon: Icon, color, change }) {
  return (
    <div className="bg-white/5 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className="text-sm text-gray-dark">{label}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className={`text-2xl font-bold font-mono ${color}`}>{value}</span>
        {change !== undefined && (
          <span className={`text-xs ${change >= 0 ? 'text-auprea-success' : 'text-red-400'}`}>
            {change >= 0 ? '+' : ''}{change}%
          </span>
        )}
      </div>
    </div>
  )
}

export default function ReportsPage() {
  const { leads, loading } = useLeads()
  const stats = useLeadStats(leads)

  const [period, setPeriod] = useState('week')
  const [generatingReport, setGeneratingReport] = useState(false)
  const [reportContent, setReportContent] = useState('')
  const [reportType, setReportType] = useState(null)

  // Calculate period stats
  const getPeriodStats = useCallback(() => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    let startDate
    switch (period) {
      case 'week':
        startDate = new Date(today)
        startDate.setDate(startDate.getDate() - startDate.getDay())
        break
      case 'month':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1)
        break
      case 'quarter':
        const quarter = Math.floor(today.getMonth() / 3)
        startDate = new Date(today.getFullYear(), quarter * 3, 1)
        break
      case 'year':
        startDate = new Date(today.getFullYear(), 0, 1)
        break
      default:
        startDate = new Date(today)
        startDate.setDate(startDate.getDate() - 7)
    }

    const periodLeads = leads.filter(l => new Date(l.created_at) >= startDate)
    const analysedLeads = periodLeads.filter(l => l.analysed_at || l.score_urgence !== null)
    const unanalysedLeads = periodLeads.filter(l => !l.analysed_at && l.score_urgence === null)

    // Calculate averages
    const avgUrgence = analysedLeads.length > 0
      ? Math.round(analysedLeads.reduce((sum, l) => sum + (l.score_urgence || 0), 0) / analysedLeads.length)
      : 0
    const avgPotentiel = analysedLeads.length > 0
      ? Math.round(analysedLeads.reduce((sum, l) => sum + (l.score_potentiel || 0), 0) / analysedLeads.length)
      : 0

    // Dominant profile
    const profileCounts = {}
    analysedLeads.forEach(l => {
      if (l.profil_psychologique) {
        profileCounts[l.profil_psychologique] = (profileCounts[l.profil_psychologique] || 0) + 1
      }
    })
    const dominantProfile = Object.entries(profileCounts).sort((a, b) => b[1] - a[1])[0]

    // Dominant accompaniment
    const accompCounts = {}
    periodLeads.forEach(l => {
      if (l.accompagnement_souhaite) {
        accompCounts[l.accompagnement_souhaite] = (accompCounts[l.accompagnement_souhaite] || 0) + 1
      }
    })
    const dominantAccomp = Object.entries(accompCounts).sort((a, b) => b[1] - a[1])[0]

    return {
      newLeads: periodLeads.length,
      analysedLeads: analysedLeads.length,
      unanalysedLeads: unanalysedLeads.length,
      avgUrgence,
      avgPotentiel,
      dominantProfile: dominantProfile ? `${dominantProfile[0]} (${Math.round(dominantProfile[1] / analysedLeads.length * 100)}%)` : '-',
      dominantAccomp: dominantAccomp ? `${dominantAccomp[0]} (${Math.round(dominantAccomp[1] / periodLeads.length * 100)}%)` : '-'
    }
  }, [leads, period])

  const periodStats = getPeriodStats()

  // Generate weekly evolution data for chart
  const getEvolutionData = useCallback(() => {
    const weeks = []
    const now = new Date()

    for (let i = 11; i >= 0; i--) {
      const weekStart = new Date(now)
      weekStart.setDate(weekStart.getDate() - (i * 7) - weekStart.getDay())
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 7)

      const weekLeads = leads.filter(l => {
        const date = new Date(l.created_at)
        return date >= weekStart && date < weekEnd
      })

      const analysedLeads = weekLeads.filter(l => l.analysed_at || l.score_urgence !== null)

      const avgUrgence = analysedLeads.length > 0
        ? Math.round(analysedLeads.reduce((sum, l) => sum + (l.score_urgence || 0), 0) / analysedLeads.length)
        : 0
      const avgComplexite = analysedLeads.length > 0
        ? Math.round(analysedLeads.reduce((sum, l) => sum + (l.score_complexite || 0), 0) / analysedLeads.length)
        : 0
      const avgPotentiel = analysedLeads.length > 0
        ? Math.round(analysedLeads.reduce((sum, l) => sum + (l.score_potentiel || 0), 0) / analysedLeads.length)
        : 0

      weeks.push({
        name: `S${Math.ceil((weekStart.getTime() - new Date(weekStart.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000))}`,
        urgence: avgUrgence,
        complexite: avgComplexite,
        potentiel: avgPotentiel,
        leads: weekLeads.length
      })
    }

    return weeks
  }, [leads])

  const evolutionData = getEvolutionData()

  // Generate report via Tristan
  const generateReport = async (type) => {
    setGeneratingReport(true)
    setReportType(type)
    setReportContent('')

    const message = type === 'weekly'
      ? 'Génère le rapport hebdomadaire complet avec statistiques, tendances et recommandations'
      : 'Génère le rapport mensuel complet avec analyse approfondie, comparaisons et stratégies'

    try {
      const sessionId = `report-${Date.now()}`
      const response = await fetch(N8N_AGENT_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatInput: message,
          sessionId
        })
      })

      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      const data = await response.json()
      setReportContent(data.output || data.response || data.text || 'Rapport généré avec succès')
    } catch (err) {
      console.error('Error generating report:', err)
      setReportContent(`Erreur lors de la génération du rapport : ${err.message}`)
    } finally {
      setGeneratingReport(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="glass-card p-6">
          <div className="skeleton h-8 w-48 mb-6" />
          <div className="skeleton h-64 w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-auprea-gold/20 rounded-xl border border-auprea-gold/30">
            <BarChart3 className="w-6 h-6 text-auprea-gold" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Rapports & Analyses</h1>
            <p className="text-sm text-gray-dark">Statistiques et rapports générés par Tristan</p>
          </div>
        </div>

        {/* Report generation buttons */}
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => generateReport('weekly')}
            disabled={generatingReport}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-dark hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            {generatingReport && reportType === 'weekly' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileText className="w-4 h-4" />
            )}
            Rapport hebdo
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => generateReport('monthly')}
            disabled={generatingReport}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-auprea-gold text-auprea-navy-dark text-sm font-medium hover:bg-auprea-gold-light transition-colors disabled:opacity-50"
          >
            {generatingReport && reportType === 'monthly' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileText className="w-4 h-4" />
            )}
            Rapport mensuel
          </motion.button>
        </div>
      </div>

      {/* Period selector */}
      <div className="glass-card p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 className="text-lg font-semibold text-white">Tableau de synthèse</h2>
          <div className="relative">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white appearance-none cursor-pointer focus:border-auprea-gold/50 focus:outline-none pr-10"
            >
              {PERIODS.map(p => (
                <option key={p.value} value={p.value} className="bg-auprea-navy-dark">
                  {p.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-dark pointer-events-none" />
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Nouveaux leads"
            value={periodStats.newLeads}
            icon={Users}
            color="text-auprea-gold"
          />
          <StatCard
            label="Leads analysés"
            value={periodStats.analysedLeads}
            icon={Brain}
            color="text-auprea-success"
          />
          <StatCard
            label="En attente d'analyse"
            value={periodStats.unanalysedLeads}
            icon={Calendar}
            color="text-auprea-warning"
          />
          <StatCard
            label="Score urgence moy."
            value={`${periodStats.avgUrgence}/100`}
            icon={Zap}
            color="text-red-400"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <StatCard
            label="Score potentiel moy."
            value={`${periodStats.avgPotentiel}/100`}
            icon={TrendingUp}
            color="text-green-400"
          />
          <StatCard
            label="Profil dominant"
            value={periodStats.dominantProfile}
            icon={Brain}
            color="text-purple-400"
          />
          <StatCard
            label="Accompagnement dominant"
            value={periodStats.dominantAccomp}
            icon={Crown}
            color="text-auprea-gold"
          />
        </div>
      </div>

      {/* Evolution chart */}
      <div className="glass-card p-6 mb-6">
        <h2 className="text-lg font-semibold text-white mb-6">Évolution des scores (12 semaines)</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={evolutionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis
                dataKey="name"
                stroke="#64748b"
                fontSize={12}
              />
              <YAxis
                stroke="#64748b"
                fontSize={12}
                domain={[0, 100]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="urgence"
                name="Urgence"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ fill: '#ef4444', strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="complexite"
                name="Complexité"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6', strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="potentiel"
                name="Potentiel"
                stroke="#22c55e"
                strokeWidth={2}
                dot={{ fill: '#22c55e', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Generated report */}
      <AnimatePresence>
        {reportContent && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">
                Dernier rapport Tristan
              </h2>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  const blob = new Blob([reportContent], { type: 'text/plain' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `rapport_${reportType}_${new Date().toISOString().split('T')[0]}.txt`
                  a.click()
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-dark hover:text-white hover:bg-white/10 transition-colors"
              >
                <Download className="w-3 h-3" />
                Exporter
              </motion.button>
            </div>
            <div className="prose prose-invert prose-sm max-w-none">
              <pre className="whitespace-pre-wrap text-sm text-white bg-white/5 rounded-xl p-4 overflow-x-auto">
                {reportContent}
              </pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
