import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Activity, Zap, TrendingUp, Target } from 'lucide-react'

// Individual circular gauge component
function CircularGauge({
  value,
  label,
  color,
  icon: Icon,
  subtitle,
  delay = 0,
  size = 120
}) {
  const [animatedValue, setAnimatedValue] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValue(value)
    }, 300)
    return () => clearTimeout(timer)
  }, [value])

  const strokeWidth = 8
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (animatedValue / 100) * circumference

  // Color mappings
  const colorClasses = {
    red: {
      gradient: 'from-red-500 to-orange-500',
      text: 'text-red-400',
      glow: 'rgba(239, 68, 68, 0.3)',
      stroke: '#ef4444'
    },
    blue: {
      gradient: 'from-blue-500 to-cyan-500',
      text: 'text-blue-400',
      glow: 'rgba(59, 130, 246, 0.3)',
      stroke: '#3b82f6'
    },
    green: {
      gradient: 'from-green-500 to-emerald-500',
      text: 'text-green-400',
      glow: 'rgba(34, 197, 94, 0.3)',
      stroke: '#22c55e'
    },
    gold: {
      gradient: 'from-auprea-gold to-auprea-gold-light',
      text: 'text-auprea-gold',
      glow: 'rgba(212, 175, 55, 0.4)',
      stroke: '#D4AF37'
    }
  }

  const colors = colorClasses[color] || colorClasses.gold

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="glass-card p-4 flex flex-col items-center relative overflow-hidden"
    >
      {/* Background glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full blur-3xl opacity-30"
        style={{ backgroundColor: colors.stroke }}
      />

      {/* Icon and label */}
      <div className="flex items-center gap-2 mb-3">
        <div className={`p-1.5 rounded-lg bg-white/5`}>
          <Icon className={`w-4 h-4 ${colors.text}`} />
        </div>
        <span className="text-xs font-medium text-gray-dark uppercase tracking-wide">
          {label}
        </span>
      </div>

      {/* Circular gauge */}
      <div className="relative">
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth={strokeWidth}
          />

          {/* Progress circle */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={colors.stroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: delay + 0.3 }}
            style={{
              filter: `drop-shadow(0 0 6px ${colors.glow})`
            }}
          />
        </svg>

        {/* Center value */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className={`text-2xl font-bold font-mono ${colors.text}`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: delay + 0.5, type: 'spring' }}
          >
            {animatedValue}%
          </motion.span>
        </div>
      </div>

      {/* Subtitle */}
      <p className="text-xs text-gray-dark mt-2 text-center">
        {subtitle}
      </p>
    </motion.div>
  )
}

export default function ScoreGauges({ scoreStats, loading = false }) {
  const { avgUrgence, avgComplexite, avgPotentiel, avgGlobal, totalAnalysed, totalLeads } = scoreStats || {}

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-4"
          >
            <div className="skeleton h-4 w-24 mx-auto mb-4" />
            <div className="skeleton h-28 w-28 rounded-full mx-auto mb-3" />
            <div className="skeleton h-3 w-20 mx-auto" />
          </motion.div>
        ))}
      </div>
    )
  }

  // No analysed leads yet
  if (totalAnalysed === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-auprea-gold/20 rounded-lg">
            <Activity className="w-5 h-5 text-auprea-gold" />
          </div>
          <h3 className="text-lg font-semibold text-white">Scores des Leads</h3>
        </div>
        <div className="text-center py-8">
          <Activity className="w-12 h-12 text-gray-dark mx-auto mb-3 opacity-50" />
          <p className="text-gray-dark">Aucun lead analysé pour le moment</p>
          <p className="text-sm text-gray-dark/70 mt-1">
            Utilisez le chat Tristan pour analyser vos leads
          </p>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="p-2 bg-auprea-gold/20 rounded-lg">
          <Activity className="w-5 h-5 text-auprea-gold" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Scores Moyens des Leads</h3>
          <p className="text-sm text-gray-dark">
            {totalAnalysed} lead{totalAnalysed > 1 ? 's' : ''} analysé{totalAnalysed > 1 ? 's' : ''} sur {totalLeads}
          </p>
        </div>
      </motion.div>

      {/* Gauges grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <CircularGauge
          value={avgUrgence}
          label="Urgence"
          color="red"
          icon={Zap}
          subtitle="Moy. urgence"
          delay={0}
        />
        <CircularGauge
          value={avgComplexite}
          label="Complexité"
          color="blue"
          icon={Activity}
          subtitle="Moy. complexité"
          delay={0.1}
        />
        <CircularGauge
          value={avgPotentiel}
          label="Potentiel"
          color="green"
          icon={TrendingUp}
          subtitle="Moy. potentiel"
          delay={0.2}
        />
        <CircularGauge
          value={avgGlobal}
          label="Score Global"
          color="gold"
          icon={Target}
          subtitle="Score pondéré"
          delay={0.3}
          size={130}
        />
      </div>

      {/* Legend */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="glass-card p-3"
      >
        <p className="text-xs text-gray-dark text-center">
          <span className="text-auprea-gold font-medium">Score Global</span> =
          (Urgence × 0.4) + (Potentiel × 0.35) + (Complexité × 0.25)
        </p>
      </motion.div>
    </div>
  )
}
