import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

// Animated counter component
function AnimatedCounter({ value, duration = 1000, suffix = '', prefix = '' }) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    const startValue = displayValue
    const endValue = value
    const startTime = Date.now()

    const animate = () => {
      const now = Date.now()
      const progress = Math.min((now - startTime) / duration, 1)
      // Easing function
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      const currentValue = Math.round(startValue + (endValue - startValue) * easeOutQuart)

      setDisplayValue(currentValue)

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [value, duration])

  return (
    <span className="counter-animate">
      {prefix}{displayValue.toLocaleString('fr-FR')}{suffix}
    </span>
  )
}

// Mini sparkline component
function Sparkline({ data, color = '#D4AF37', height = 40 }) {
  if (!data || data.length === 0) return null

  const max = Math.max(...data, 1)
  const min = Math.min(...data, 0)
  const range = max - min || 1

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100
    const y = 100 - ((value - min) / range) * 100
    return `${x},${y}`
  }).join(' ')

  const uniqueId = `sparkline-gradient-${Math.random().toString(36).substr(2, 9)}`

  return (
    <svg className="w-full" style={{ height }} viewBox="0 0 100 100" preserveAspectRatio="none">
      <defs>
        <linearGradient id={uniqueId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <polygon
        points={`0,100 ${points} 100,100`}
        fill={`url(#${uniqueId})`}
      />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function KPICard({
  title,
  value,
  subtitle,
  change,
  changeLabel = 'vs période préc.',
  icon: Icon,
  sparklineData,
  delay = 0,
  loading = false,
  isGold = false,
  valuePrefix = '',
  valueSuffix = ''
}) {
  const isPositive = change > 0
  const isNeutral = change === 0 || change === undefined

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="stat-card stat-card-loading"
      >
        <div className="stat-card-header">
          <div className="skeleton h-4 w-24" />
          <div className="skeleton h-12 w-12 rounded-xl" />
        </div>
        <div className="skeleton h-12 w-32 mt-4" />
        <div className="skeleton h-4 w-20 mt-3" />
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -6, transition: { duration: 0.25 } }}
      className={`stat-card ${isGold ? 'stat-card-gold' : ''}`}
    >
      {/* Header with title and icon */}
      <div className="stat-card-header">
        <h3 className="stat-card-title">{title}</h3>

        {Icon && (
          <div className={`stat-card-icon ${isGold ? 'stat-card-icon-gold' : ''}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>

      {/* Main value */}
      <div className="stat-card-value-container">
        <p className={`stat-card-value ${isGold ? 'stat-card-value-gold' : ''}`}>
          <AnimatedCounter value={value} prefix={valuePrefix} suffix={valueSuffix} />
        </p>
      </div>

      {/* Change indicator */}
      {change !== undefined && (
        <div className="stat-card-change-container">
          <div className={`stat-card-change ${
            isPositive ? 'stat-card-change-positive' :
            isNeutral ? 'stat-card-change-neutral' : 'stat-card-change-negative'
          }`}>
            {isPositive ? (
              <TrendingUp className="w-4 h-4" />
            ) : isNeutral ? (
              <Minus className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span>{isPositive ? '+' : ''}{change}%</span>
            <span className="stat-card-change-label">{changeLabel}</span>
          </div>
        </div>
      )}

      {/* Subtitle */}
      {subtitle && !change && (
        <p className="stat-card-subtitle">{subtitle}</p>
      )}

      {/* Sparkline */}
      {sparklineData && sparklineData.length > 0 && (
        <div className="stat-card-sparkline">
          <Sparkline
            data={sparklineData}
            color={isGold ? '#D4AF37' : '#3B82F6'}
            height={50}
          />
        </div>
      )}

      {/* Decorative elements */}
      {isGold && (
        <>
          <div className="stat-card-glow" />
          <div className="stat-card-shine" />
        </>
      )}
    </motion.div>
  )
}
