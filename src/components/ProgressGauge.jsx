import { motion } from 'framer-motion'
import { Target, Sparkles, TrendingUp } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function ProgressGauge({ current, target = 10000, loading = false }) {
  const [animatedProgress, setAnimatedProgress] = useState(0)
  const progress = Math.min((current / target) * 100, 100)
  const remaining = target - current

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(progress)
    }, 500)
    return () => clearTimeout(timer)
  }, [progress])

  // Arc configuration - semi-circle arc
  const size = 220
  const strokeWidth = 16
  const radius = (size - strokeWidth) / 2
  // Arc goes from -180 to 0 degrees (bottom semi-circle inverted to top)
  const startAngle = 140
  const endAngle = 400
  const angleRange = endAngle - startAngle

  // Calculate arc path
  const polarToCartesian = (cx, cy, r, angle) => {
    const rad = (angle - 90) * Math.PI / 180
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad)
    }
  }

  const describeArc = (cx, cy, r, startAng, endAng) => {
    const start = polarToCartesian(cx, cy, r, endAng)
    const end = polarToCartesian(cx, cy, r, startAng)
    const largeArcFlag = endAng - startAng <= 180 ? 0 : 1
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`
  }

  const progressAngle = startAngle + (animatedProgress / 100) * angleRange

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="stat-card stat-card-loading"
      >
        <div className="stat-card-header">
          <div className="skeleton h-4 w-40" />
        </div>
        <div className="skeleton h-40 w-40 rounded-full mx-auto my-4" />
        <div className="skeleton h-4 w-32 mx-auto" />
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      whileHover={{ y: -6, transition: { duration: 0.25 } }}
      className="stat-card stat-card-gold progress-gauge-card"
    >
      {/* Header */}
      <div className="stat-card-header">
        <h3 className="stat-card-title">Progression Objectif</h3>
        <div className="stat-card-icon stat-card-icon-gold">
          <Target className="w-6 h-6" />
        </div>
      </div>

      {/* Arc Progress */}
      <div className="progress-gauge-container">
        <svg width={size} height={size * 0.65} viewBox={`0 0 ${size} ${size * 0.75}`} className="progress-gauge-svg">
          <defs>
            <linearGradient id="progress-arc-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#D4AF37" />
              <stop offset="50%" stopColor="#F4E4BC" />
              <stop offset="100%" stopColor="#D4AF37" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Background arc */}
          <path
            d={describeArc(size / 2, size / 2, radius, startAngle, endAngle)}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Progress arc */}
          <motion.path
            d={describeArc(size / 2, size / 2, radius, startAngle, progressAngle)}
            fill="none"
            stroke="url(#progress-arc-gradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            filter="url(#glow)"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </svg>

        {/* Center content */}
        <div className="progress-gauge-center">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
          >
            <p className="progress-gauge-percentage">
              {animatedProgress.toFixed(0)}%
            </p>
            <p className="progress-gauge-label">
              de {target.toLocaleString('fr-FR')} Objectif
            </p>
            <p className="progress-gauge-sublabel">Atteint</p>
          </motion.div>
        </div>
      </div>

      {/* Bottom stats */}
      <div className="progress-gauge-stats">
        <div className="progress-gauge-stat">
          <p className="progress-gauge-stat-value">
            {current.toLocaleString('fr-FR')}
          </p>
          <p className="progress-gauge-stat-label">Collectés</p>
        </div>
        <div className="progress-gauge-divider" />
        <div className="progress-gauge-stat">
          <p className="progress-gauge-stat-value progress-gauge-stat-value-gold">
            {remaining.toLocaleString('fr-FR')}
          </p>
          <p className="progress-gauge-stat-label">Restants</p>
        </div>
      </div>

      {/* Motivational badge */}
      {progress >= 100 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="progress-gauge-badge progress-gauge-badge-success"
        >
          <Sparkles className="w-4 h-4" />
          <span>Objectif atteint !</span>
          <Sparkles className="w-4 h-4" />
        </motion.div>
      ) : progress >= 75 ? (
        <div className="progress-gauge-badge progress-gauge-badge-gold">
          <TrendingUp className="w-4 h-4" />
          <span>Excellent ! Dernière ligne droite</span>
        </div>
      ) : null}

      {/* Decorative elements */}
      <div className="stat-card-glow" />
      <div className="stat-card-shine" />
    </motion.div>
  )
}
