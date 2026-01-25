import { motion } from 'framer-motion'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts'
import { Calendar } from 'lucide-react'

function CustomTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null

  return (
    <div className="custom-tooltip">
      <p className="text-white font-medium mb-1">{payload[0].payload.fullName}</p>
      <p className="text-auprea-gold font-mono text-lg">
        {payload[0].value} leads
      </p>
    </div>
  )
}

export default function WeekdayChart({ data, bestDay, loading = false }) {
  const maxCount = Math.max(...data.map(d => d.count), 1)

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
      transition={{ delay: 0.3 }}
      className="glass-card p-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-auprea-info/20 rounded-lg">
          <Calendar className="w-5 h-5 text-auprea-info" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">
            Répartition par Jour
          </h3>
          {bestDay && (
            <p className="text-sm text-gray-dark">
              Meilleur jour : <span className="text-auprea-gold">{bestDay}</span>
            </p>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748B', fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748B', fontSize: 12 }}
              width={40}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
            <Bar
              dataKey="count"
              radius={[4, 4, 0, 0]}
              animationDuration={1500}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.count === maxCount ? '#D4AF37' : 'rgba(59, 130, 246, 0.6)'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}
