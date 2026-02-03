import { motion } from 'framer-motion'
import { Brain, Users } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

// Profile colors mapping
const PROFILE_COLORS = {
  'Le Pressé ⚡': { main: '#ef4444', light: '#fca5a5' },
  'Le Prévoyant ✅': { main: '#22c55e', light: '#86efac' },
  'Le Déni 🙈': { main: '#8b5cf6', light: '#c4b5fd' },
  "L'Inquiet 😰": { main: '#f59e0b', light: '#fcd34d' },
  'Le Méthodique 📋': { main: '#3b82f6', light: '#93c5fd' },
  "L'Héritier 👨‍👩‍👧‍👦": { main: '#ec4899', light: '#f9a8d4' }
}

// Get color for profile
function getProfileColor(profil) {
  return PROFILE_COLORS[profil] || { main: '#64748b', light: '#94a3b8' }
}

// Extract emoji from profile name
function extractEmoji(profil) {
  const emojiMatch = profil.match(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA00}-\u{1FA6F}]|[\u{1FA70}-\u{1FAFF}]|[\u{231A}-\u{231B}]|[\u{23E9}-\u{23F3}]|[\u{23F8}-\u{23FA}]|[\u{25AA}-\u{25AB}]|[\u{25B6}]|[\u{25C0}]|[\u{25FB}-\u{25FE}]|[\u{2614}-\u{2615}]|[\u{2648}-\u{2653}]|[\u{267F}]|[\u{2693}]|[\u{26A1}]|[\u{26AA}-\u{26AB}]|[\u{26BD}-\u{26BE}]|[\u{26C4}-\u{26C5}]|[\u{26CE}]|[\u{26D4}]|[\u{26EA}]|[\u{26F2}-\u{26F3}]|[\u{26F5}]|[\u{26FA}]|[\u{26FD}]|[\u{2702}]|[\u{2705}]|[\u{2708}-\u{270D}]|[\u{270F}]|[\u{2712}]|[\u{2714}]|[\u{2716}]|[\u{271D}]|[\u{2721}]|[\u{2728}]|[\u{2733}-\u{2734}]|[\u{2744}]|[\u{2747}]|[\u{274C}]|[\u{274E}]|[\u{2753}-\u{2755}]|[\u{2757}]|[\u{2763}-\u{2764}]|[\u{2795}-\u{2797}]|[\u{27A1}]|[\u{27B0}]|[\u{27BF}]|[\u{2934}-\u{2935}]|[\u{2B05}-\u{2B07}]|[\u{2B1B}-\u{2B1C}]|[\u{2B50}]|[\u{2B55}]|[\u{3030}]|[\u{303D}]|[\u{3297}]|[\u{3299}]/gu)
  return emojiMatch ? emojiMatch[0] : '👤'
}

// Get profile name without emoji
function getProfileName(profil) {
  return profil.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA00}-\u{1FA6F}]|[\u{1FA70}-\u{1FAFF}]|[\u{231A}-\u{231B}]|[\u{23E9}-\u{23F3}]|[\u{23F8}-\u{23FA}]|[\u{25AA}-\u{25AB}]|[\u{25B6}]|[\u{25C0}]|[\u{25FB}-\u{25FE}]|[\u{2614}-\u{2615}]|[\u{2648}-\u{2653}]|[\u{267F}]|[\u{2693}]|[\u{26A1}]|[\u{26AA}-\u{26AB}]|[\u{26BD}-\u{26BE}]|[\u{26C4}-\u{26C5}]|[\u{26CE}]|[\u{26D4}]|[\u{26EA}]|[\u{26F2}-\u{26F3}]|[\u{26F5}]|[\u{26FA}]|[\u{26FD}]|[\u{2702}]|[\u{2705}]|[\u{2708}-\u{270D}]|[\u{270F}]|[\u{2712}]|[\u{2714}]|[\u{2716}]|[\u{271D}]|[\u{2721}]|[\u{2728}]|[\u{2733}-\u{2734}]|[\u{2744}]|[\u{2747}]|[\u{274C}]|[\u{274E}]|[\u{2753}-\u{2755}]|[\u{2757}]|[\u{2763}-\u{2764}]|[\u{2795}-\u{2797}]|[\u{27A1}]|[\u{27B0}]|[\u{27BF}]|[\u{2934}-\u{2935}]|[\u{2B05}-\u{2B07}]|[\u{2B1B}-\u{2B1C}]|[\u{2B50}]|[\u{2B55}]|[\u{3030}]|[\u{303D}]|[\u{3297}]|[\u{3299}]/gu, '').trim()
}

// Custom tooltip for pie chart
function CustomTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null

  const data = payload[0].payload

  return (
    <div className="custom-tooltip">
      <p className="text-white font-semibold mb-1">{data.profil}</p>
      <p className="text-auprea-gold font-mono text-lg">{data.count} leads</p>
      <p className="text-gray-dark text-sm">{data.percentage}% des leads analysés</p>
    </div>
  )
}

// Profile list item
function ProfileItem({ data, index, totalAnalysed, delay }) {
  const colors = getProfileColor(data.profil)
  const emoji = extractEmoji(data.profil)
  const name = getProfileName(data.profil)

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: delay + index * 0.08, duration: 0.4 }}
      className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors"
    >
      {/* Emoji */}
      <span className="text-xl w-8 text-center">{emoji}</span>

      {/* Color indicator */}
      <div
        className="w-3 h-3 rounded-full flex-shrink-0"
        style={{ backgroundColor: colors.main }}
      />

      {/* Name */}
      <span className="flex-1 text-sm text-white truncate">{name}</span>

      {/* Stats */}
      <div className="flex items-center gap-2">
        <span className="font-mono text-sm font-semibold text-white">
          {data.count}
        </span>
        <span
          className="text-xs font-medium px-2 py-0.5 rounded-full"
          style={{
            backgroundColor: `${colors.main}20`,
            color: colors.main
          }}
        >
          {data.percentage}%
        </span>
      </div>
    </motion.div>
  )
}

export default function ProfilChart({ data, loading = false, delay = 0 }) {
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <div className="skeleton h-6 w-48 mb-6" />
        <div className="flex gap-6">
          <div className="skeleton h-40 w-40 rounded-full" />
          <div className="flex-1 space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="skeleton h-8 w-full" />
            ))}
          </div>
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
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <Brain className="w-5 h-5 text-purple-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">Profils Psychologiques</h3>
        </div>
        <div className="text-center py-6">
          <Brain className="w-10 h-10 text-gray-dark mx-auto mb-2 opacity-50" />
          <p className="text-gray-dark text-sm">Aucun profil détecté</p>
          <p className="text-xs text-gray-dark/70 mt-1">
            Les profils sont détectés lors de l'analyse par Tristan
          </p>
        </div>
      </motion.div>
    )
  }

  const totalProfiles = data.reduce((sum, d) => sum + d.count, 0)
  const chartData = data.map(d => ({
    ...d,
    color: getProfileColor(d.profil).main
  }))

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
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <Brain className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Profils Psychologiques</h3>
            <p className="text-sm text-gray-dark">Répartition des leads analysés</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold font-mono text-white">{totalProfiles}</p>
          <p className="text-xs text-gray-dark">profilés</p>
        </div>
      </div>

      {/* Content - Pie chart + List */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Pie chart */}
        <div className="w-full lg:w-48 h-48 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={3}
                dataKey="count"
                animationBegin={delay * 1000}
                animationDuration={1000}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    stroke="rgba(15, 30, 51, 0.5)"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Profile list */}
        <div className="flex-1 space-y-1">
          {data.map((item, index) => (
            <ProfileItem
              key={item.profil}
              data={item}
              index={index}
              totalAnalysed={totalProfiles}
              delay={delay}
            />
          ))}
        </div>
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: delay + 0.8 }}
        className="mt-4 pt-4 border-t border-white/10"
      >
        <div className="flex items-center gap-2 text-xs text-gray-dark">
          <Users className="w-3 h-3" />
          <span>
            Les profils sont détectés automatiquement par l'agent Tristan lors de l'analyse
          </span>
        </div>
      </motion.div>
    </motion.div>
  )
}
