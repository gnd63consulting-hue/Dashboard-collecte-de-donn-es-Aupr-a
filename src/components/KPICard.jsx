import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

// Animated counter component
function AnimatedCounter({ value, duration = 1000 }) {
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
      {displayValue.toLocaleString('fr-FR')}
    </span>
  )
}

// Mini sparkline component
function Sparkline({ data, color = '#D4AF37' }) {
  if (!data || data.length === 0) return null

  const max = Math.max(...data, 1)
  const min = Math.min(...data, 0)
  const range = max - min || 1

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100
    const y = 100 - ((value - min) / range) * 100
    return `${x},${y}`
  }).join(' ')

  return (
    <svg className="w-full h-8" viewBox="0 0 100 100" preserveAspectRatio="none">
      <defs>
        <linearGradient id="sparkline-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polygon
        points={`0,100 ${points} 100,100`}
        fill="url(#sparkline-gradient)"
      />
    </svg>
  )
}

export default function KPICard({
  title,
  value,
  subtitle,
  change,
  icon: Icon,
  sparklineData,
  delay = 0,
  loading = false,
  isGold = false
}) {
  const isPositive = change > 0
  const isNeutral = change === 0

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="glass-card p-6"
      >
        <div className="skeleton h-4 w-24 mb-4" />
        <div className="skeleton h-10 w-32 mb-2" />
        <div className="skeleton h-4 w-20" />
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`glass-card p-6 relative overflow-hidden ${
        isGold ? 'border-auprea-gold/30 gold-glow-sm' : ''
      }`}
    >
      {/* Background glow for gold cards */}
      {isGold && (
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-auprea-gold/10 rounded-full blur-3xl" />
      )}

      {/* Icon */}
      {Icon && (
        <div className={`inline-flex p-2 rounded-lg mb-3 ${
          isGold ? 'bg-auprea-gold/20' : 'bg-white/5'
        }`}>
          <Icon className={`w-5 h-5 ${isGold ? 'text-auprea-gold' : 'text-white/70'}`} />
        </div>
      )}

      {/* Title */}
      <p className="text-gray-dark text-sm font-medium mb-2">{title}</p>

      {/* Value */}
      <div className="flex items-end gap-3 mb-2">
        <h3 className={`text-3xl md:text-4xl font-bold font-mono ${
          isGold ? 'text-auprea-gold' : 'text-white'
        }`}>
          <AnimatedCounter value={value} />
        </h3>

        {/* Change indicator */}
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-sm font-medium pb-1 ${
            isPositive ? 'text-auprea-success' :
            isNeutral ? 'text-gray-dark' : 'text-red-400'
          }`}>
            {isPositive ? (
              <TrendingUp className="w-4 h-4" />
            ) : isNeutral ? (
              <Minus className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span>{isPositive ? '+' : ''}{change}%</span>
          </div>
        )}
      </div>

      {/* Subtitle */}
      {subtitle && (
        <p className="text-gray-dark text-xs">{subtitle}</p>
      )}

      {/* Sparkline */}
      {sparklineData && sparklineData.length > 0 && (
        <div className="mt-4 -mx-2">
          <Sparkline data={sparklineData} color={isGold ? '#D4AF37' : '#3B82F6'} />
        </div>
      )}
    </motion.div>
  )
}
