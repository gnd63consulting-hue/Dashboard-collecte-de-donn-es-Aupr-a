import { motion } from 'framer-motion'
import { Clock } from 'lucide-react'
import { useState } from 'react'

export default function HeatmapChart({ data, loading = false }) {
  const [hoveredCell, setHoveredCell] = useState(null)

  const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
  const hours = Array.from({ length: 24 }, (_, i) => i)

  // Create a map for quick lookup
  const dataMap = new Map()
  data.forEach(d => {
    dataMap.set(`${d.dayIndex}-${d.hour}`, d.value)
  })

  // Find max value for scaling
  const maxValue = Math.max(...data.map(d => d.value), 1)

  // Get intensity based on value
  const getIntensity = (value) => {
    if (value === 0) return 'bg-white/5'
    const ratio = value / maxValue
    if (ratio > 0.8) return 'bg-auprea-gold'
    if (ratio > 0.6) return 'bg-auprea-gold/80'
    if (ratio > 0.4) return 'bg-auprea-gold/60'
    if (ratio > 0.2) return 'bg-auprea-gold/40'
    return 'bg-auprea-gold/20'
  }

  const getGlow = (value) => {
    if (value === 0) return ''
    const ratio = value / maxValue
    if (ratio > 0.6) return 'shadow-[0_0_10px_rgba(212,175,55,0.5)]'
    return ''
  }

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <div className="skeleton h-6 w-48 mb-6" />
        <div className="skeleton h-48 w-full" />
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="glass-card p-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-auprea-warning/20 rounded-lg">
          <Clock className="w-5 h-5 text-auprea-warning" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">
            Activité par Heure
          </h3>
          <p className="text-sm text-gray-dark">
            Moments de pic d'inscription
          </p>
        </div>
      </div>

      {/* Heatmap */}
      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          {/* Hour labels */}
          <div className="flex ml-10 mb-2">
            {hours.filter(h => h % 3 === 0).map(hour => (
              <div
                key={hour}
                className="text-xs text-gray-dark"
                style={{ width: '12.5%', textAlign: 'left' }}
              >
                {hour}h
              </div>
            ))}
          </div>

          {/* Grid */}
          {days.map((day, dayIndex) => (
            <div key={day} className="flex items-center gap-2 mb-1">
              <span className="text-xs text-gray-dark w-8">{day}</span>
              <div className="flex gap-0.5 flex-1">
                {hours.map(hour => {
                  const value = dataMap.get(`${dayIndex}-${hour}`) || 0
                  const isHovered = hoveredCell?.day === dayIndex && hoveredCell?.hour === hour

                  return (
                    <motion.div
                      key={hour}
                      className={`
                        flex-1 h-5 rounded-sm cursor-pointer
                        ${getIntensity(value)}
                        ${getGlow(value)}
                        transition-all duration-200
                      `}
                      whileHover={{ scale: 1.2, zIndex: 10 }}
                      onMouseEnter={() => setHoveredCell({ day: dayIndex, hour, value })}
                      onMouseLeave={() => setHoveredCell(null)}
                    />
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tooltip */}
      {hoveredCell && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 bg-auprea-navy-dark/80 rounded-lg inline-block"
        >
          <p className="text-sm text-white">
            <span className="text-gray-dark">{days[hoveredCell.day]}</span>
            {' '}à{' '}
            <span className="text-gray-dark">{hoveredCell.hour}h</span>
            {' : '}
            <span className="text-auprea-gold font-mono font-bold">
              {hoveredCell.value} leads
            </span>
          </p>
        </motion.div>
      )}

      {/* Legend */}
      <div className="flex items-center justify-end gap-2 mt-4">
        <span className="text-xs text-gray-dark">Moins</span>
        <div className="flex gap-0.5">
          <div className="w-4 h-4 rounded bg-white/5" />
          <div className="w-4 h-4 rounded bg-auprea-gold/20" />
          <div className="w-4 h-4 rounded bg-auprea-gold/40" />
          <div className="w-4 h-4 rounded bg-auprea-gold/60" />
          <div className="w-4 h-4 rounded bg-auprea-gold" />
        </div>
        <span className="text-xs text-gray-dark">Plus</span>
      </div>
    </motion.div>
  )
}
