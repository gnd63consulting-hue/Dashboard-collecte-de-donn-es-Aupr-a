import { motion } from 'framer-motion'
import {
  Sparkles,
  TrendingUp,
  Clock,
  Calendar,
  Target,
  Users,
  Zap,
  Brain
} from 'lucide-react'

function InsightCard({ icon: Icon, title, value, description, color = 'gold', delay = 0 }) {
  const colorClasses = {
    gold: 'bg-auprea-gold/20 text-auprea-gold border-auprea-gold/30',
    blue: 'bg-auprea-info/20 text-auprea-info border-auprea-info/30',
    green: 'bg-auprea-success/20 text-auprea-success border-auprea-success/30',
    orange: 'bg-auprea-warning/20 text-auprea-warning border-auprea-warning/30'
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.3 }}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      className={`
        relative p-4 rounded-xl border backdrop-blur-sm
        ${colorClasses[color]}
        overflow-hidden
      `}
    >
      {/* Glow effect */}
      <div className={`absolute -top-10 -right-10 w-24 h-24 rounded-full blur-3xl opacity-30 ${
        color === 'gold' ? 'bg-auprea-gold' :
        color === 'blue' ? 'bg-auprea-info' :
        color === 'green' ? 'bg-auprea-success' :
        'bg-auprea-warning'
      }`} />

      <div className="relative">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${colorClasses[color].split(' ')[0]}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-gray-dark uppercase tracking-wider mb-1">{title}</p>
            <p className={`text-lg font-bold font-mono ${
              color === 'gold' ? 'text-auprea-gold' :
              color === 'blue' ? 'text-auprea-info' :
              color === 'green' ? 'text-auprea-success' :
              'text-auprea-warning'
            }`}>
              {value}
            </p>
            {description && (
              <p className="text-xs text-gray-dark mt-1">{description}</p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function AIInsights({ stats, loading = false }) {
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <div className="skeleton h-8 w-48 mb-6" />
        <div className="grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton h-24 w-full" />
          ))}
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="glass-card p-6 relative overflow-hidden border-auprea-gold/20"
    >
      {/* AI Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(212,175,55,0.5) 1px, transparent 0)`,
            backgroundSize: '24px 24px'
          }}
        />
      </div>

      {/* Animated glow orb */}
      <motion.div
        className="absolute -top-20 -right-20 w-40 h-40 bg-auprea-gold/20 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.3, 0.2]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />

      {/* Header */}
      <div className="relative flex items-center gap-3 mb-6">
        <div className="relative">
          <div className="p-2 bg-gradient-gold rounded-lg">
            <Brain className="w-6 h-6 text-auprea-navy-dark" />
          </div>
          <motion.div
            className="absolute -top-1 -right-1"
            animate={{ scale: [1, 1.2, 1], opacity: [1, 0.6, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles className="w-4 h-4 text-auprea-gold" />
          </motion.div>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            Insights IA
            <motion.span
              className="text-xs px-2 py-0.5 bg-auprea-gold/20 text-auprea-gold rounded-full"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              LIVE
            </motion.span>
          </h3>
          <p className="text-sm text-gray-dark">
            Analyses automatiques de vos données
          </p>
        </div>
      </div>

      {/* Insights Grid */}
      <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InsightCard
          icon={Calendar}
          title="Meilleur jour"
          value={stats.bestDay || 'N/A'}
          description="Jour avec le plus d'inscriptions"
          color="gold"
          delay={0.1}
        />

        <InsightCard
          icon={Clock}
          title="Pic d'activité"
          value={stats.bestHour || 'N/A'}
          description="Heure la plus active"
          color="blue"
          delay={0.2}
        />

        <InsightCard
          icon={Users}
          title="Taux accompagnement"
          value={`${stats.accompagnementRate}%`}
          description="Demandes d'accompagnement"
          color="green"
          delay={0.3}
        />

        <InsightCard
          icon={Target}
          title="Objectif 10K"
          value={stats.estimatedDaysTo10K > 0 ? `~${stats.estimatedDaysTo10K} jours` : 'N/A'}
          description="Temps estimé pour atteindre l'objectif"
          color="orange"
          delay={0.4}
        />
      </div>

      {/* Additional insights */}
      <div className="relative mt-6 pt-6 border-t border-white/10">
        <div className="flex items-center gap-2 text-sm">
          <Zap className="w-4 h-4 text-auprea-gold" />
          <span className="text-gray-dark">Tendance actuelle :</span>
          {stats.todayChange > 0 ? (
            <span className="text-auprea-success flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              En hausse (+{stats.todayChange}% vs hier)
            </span>
          ) : stats.todayChange < 0 ? (
            <span className="text-red-400">
              En baisse ({stats.todayChange}% vs hier)
            </span>
          ) : (
            <span className="text-gray-dark">Stable par rapport à hier</span>
          )}
        </div>

        {stats.total > 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-3 text-xs text-gray-dark"
          >
            <Sparkles className="w-3 h-3 inline mr-1 text-auprea-gold" />
            Moyenne de{' '}
            <span className="text-white font-mono">
              {Math.round(stats.thisWeek / 7 * 10) / 10}
            </span>{' '}
            leads par jour cette semaine
          </motion.p>
        )}
      </div>
    </motion.div>
  )
}
