import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import { TrendingUp, Calendar } from 'lucide-react'

const TIME_FILTERS = [
  { label: '7J', days: 7 },
  { label: '30J', days: 30 },
  { label: '90J', days: 90 },
  { label: 'Tout', days: null }
]

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null

  return (
    <div className="custom-tooltip">
      <p className="text-white font-medium mb-1">{label}</p>
      <p className="text-auprea-gold font-mono text-lg">
        {payload[0].value} leads
      </p>
    </div>
  )
}

export default function LeadsChart({ data, loading = false }) {
  const [selectedFilter, setSelectedFilter] = useState(1) // 30 days default

  // Filter data based on selection
  const filteredData = TIME_FILTERS[selectedFilter].days
    ? data.slice(-TIME_FILTERS[selectedFilter].days)
    : data

  // Calculate total for period
  const periodTotal = filteredData.reduce((sum, d) => sum + d.count, 0)

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <div className="skeleton h-6 w-48 mb-6" />
        <div className="skeleton h-64 w-full" />
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass-card p-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-auprea-gold/20 rounded-lg">
            <TrendingUp className="w-5 h-5 text-auprea-gold" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              Évolution des Leads
            </h3>
            <p className="text-sm text-gray-dark">
              {periodTotal.toLocaleString('fr-FR')} leads sur la période
            </p>
          </div>
        </div>

        {/* Time filter buttons */}
        <div className="flex gap-2">
          {TIME_FILTERS.map((filter, index) => (
            <motion.button
              key={filter.label}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedFilter(index)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-all duration-200 ${
                selectedFilter === index
                  ? 'bg-auprea-gold text-auprea-navy-dark font-medium'
                  : 'bg-white/5 text-gray-dark hover:bg-white/10 hover:text-white'
              }`}
            >
              {filter.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-64 md:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={filteredData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.1)"
              vertical={false}
            />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748B', fontSize: 12 }}
              interval="preserveStartEnd"
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748B', fontSize: 12 }}
              width={40}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#D4AF37"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorCount)"
              animationDuration={1500}
              animationEasing="ease-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}
