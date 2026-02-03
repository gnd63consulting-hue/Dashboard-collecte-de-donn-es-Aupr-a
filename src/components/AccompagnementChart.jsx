import { motion } from 'framer-motion'
import { Briefcase, Crown } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

// Custom tooltip
function CustomTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null

  const data = payload[0].payload

  return (
    <div className="custom-tooltip">
      <p className="text-white font-semibold mb-1">{data.type}</p>
      <p className="text-auprea-gold font-mono text-lg">{data.count} leads</p>
      <p className="text-gray-dark text-sm">{data.percentage}% du total</p>
    </div>
  )
}

// Horizontal bar item
function BarItem({ data, index, maxCount, isCoordinateur, delay }) {
  const percentage = maxCount > 0 ? (data.count / maxCount) * 100 : 0

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: delay + index * 0.1, duration: 0.4 }}
      className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
        isCoordinateur ? 'bg-auprea-gold/10' : 'hover:bg-white/5'
      }`}
    >
      {/* Icon for Coordinateur AUPREA */}
      {isCoordinateur && (
        <Crown className="w-4 h-4 text-auprea-gold flex-shrink-0" />
      )}

      {/* Label */}
      <span className={`w-40 text-sm truncate ${
        isCoordinateur ? 'text-auprea-gold font-semibold' : 'text-gray-dark'
      }`}>
        {data.type}
      </span>

      {/* Bar */}
      <div className="flex-1 h-6 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${
            isCoordinateur
              ? 'bg-gradient-to-r from-auprea-gold to-auprea-gold-light'
              : 'bg-gradient-to-r from-auprea-info/70 to-auprea-info/40'
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ delay: delay + index * 0.1 + 0.2, duration: 0.6, ease: 'easeOut' }}
          style={{
            boxShadow: isCoordinateur ? '0 0 10px rgba(212, 175, 55, 0.3)' : 'none'
          }}
        />
      </div>

      {/* Count and percentage */}
      <div className="flex items-center gap-2 w-24 justify-end">
        <span className={`font-mono text-sm font-semibold ${
          isCoordinateur ? 'text-auprea-gold' : 'text-white'
        }`}>
          {data.count}
        </span>
        <span className="text-gray-dark text-xs">
          ({data.percentage}%)
        </span>
      </div>
    </motion.div>
  )
}

export default function AccompagnementChart({ data, loading = false, delay = 0 }) {
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <div className="skeleton h-6 w-48 mb-6" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton h-8 w-full" />
          ))}
        </div>
      </motion.div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="glass-card p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-auprea-info/20 rounded-lg">
            <Briefcase className="w-5 h-5 text-auprea-info" />
          </div>
          <h3 className="text-lg font-semibold text-white">Type d'accompagnement souhaité</h3>
        </div>
        <div className="text-center py-6">
          <Briefcase className="w-10 h-10 text-gray-dark mx-auto mb-2 opacity-50" />
          <p className="text-gray-dark text-sm">Aucune donnée disponible</p>
        </div>
      </motion.div>
    )
  }

  const maxCount = Math.max(...data.map(d => d.count))
  const totalLeads = data.reduce((sum, d) => sum + d.count, 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass-card p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-auprea-info/20 rounded-lg">
            <Briefcase className="w-5 h-5 text-auprea-info" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Type d'accompagnement souhaité</h3>
            <p className="text-sm text-gray-dark">Répartition par professionnel</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold font-mono text-white">{totalLeads}</p>
          <p className="text-xs text-gray-dark">leads</p>
        </div>
      </div>

      {/* Bars */}
      <div className="space-y-2">
        {data.map((item, index) => (
          <BarItem
            key={item.type}
            data={item}
            index={index}
            maxCount={maxCount}
            isCoordinateur={item.type === 'Coordinateur AUPREA'}
            delay={delay}
          />
        ))}
      </div>

      {/* Footer note */}
      {data.some(d => d.type === 'Coordinateur AUPREA') && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.8 }}
          className="mt-4 pt-4 border-t border-white/10"
        >
          <div className="flex items-center gap-2 text-xs text-auprea-gold">
            <Crown className="w-3 h-3" />
            <span>Coordinateur AUPREA : service phare de l'accompagnement personnalisé</span>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
