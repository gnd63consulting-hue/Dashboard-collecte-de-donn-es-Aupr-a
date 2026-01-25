import { motion } from 'framer-motion'
import { Target, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function ProgressGauge({ current, target = 10000, loading = false }) {
  const [animatedProgress, setAnimatedProgress] = useState(0)
  const progress = Math.min((current / target) * 100, 100)
  const remaining = target - current

  useEffect(() => {
    // Animate progress
    const timer = setTimeout(() => {
      setAnimatedProgress(progress)
    }, 500)
    return () => clearTimeout(timer)
  }, [progress])

  // SVG circle dimensions
  const size = 200
  const strokeWidth = 12
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (animatedProgress / 100) * circumference

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <div className="skeleton h-6 w-40 mb-4 mx-auto" />
        <div className="skeleton h-48 w-48 rounded-full mx-auto mb-4" />
        <div className="skeleton h-4 w-32 mx-auto" />
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="glass-card p-6 relative overflow-hidden border-auprea-gold/20"
    >
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-auprea-gold/10 rounded-full blur-3xl" />

      {/* Header */}
      <div className="flex items-center justify-center gap-2 mb-6">
        <Target className="w-5 h-5 text-auprea-gold" />
        <h3 className="text-lg font-semibold text-white">Objectif 10 000 Leads</h3>
      </div>

      {/* Circular Progress */}
      <div className="relative flex items-center justify-center">
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
            stroke="url(#progress-gradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            className="drop-shadow-[0_0_10px_rgba(212,175,55,0.5)]"
          />

          {/* Gradient definition */}
          <defs>
            <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#D4AF37" />
              <stop offset="50%" stopColor="#F4E4BC" />
              <stop offset="100%" stopColor="#D4AF37" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.8, type: 'spring' }}
            className="text-center"
          >
            <p className="text-4xl md:text-5xl font-bold font-mono text-auprea-gold">
              {progress.toFixed(1)}%
            </p>
            <p className="text-gray-dark text-sm mt-1">
              {current.toLocaleString('fr-FR')} / {target.toLocaleString('fr-FR')}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Stats below */}
      <div className="mt-6 grid grid-cols-2 gap-4 text-center">
        <div className="bg-white/5 rounded-lg p-3">
          <p className="text-2xl font-bold font-mono text-white">
            {current.toLocaleString('fr-FR')}
          </p>
          <p className="text-xs text-gray-dark">Leads collectés</p>
        </div>
        <div className="bg-white/5 rounded-lg p-3">
          <p className="text-2xl font-bold font-mono text-auprea-gold">
            {remaining.toLocaleString('fr-FR')}
          </p>
          <p className="text-xs text-gray-dark">Restants</p>
        </div>
      </div>

      {/* Motivational message */}
      {progress >= 100 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-4 flex items-center justify-center gap-2 text-auprea-success"
        >
          <Sparkles className="w-5 h-5 sparkle" />
          <span className="font-semibold">Objectif atteint !</span>
          <Sparkles className="w-5 h-5 sparkle" />
        </motion.div>
      ) : progress >= 75 ? (
        <p className="mt-4 text-center text-sm text-auprea-gold">
          Excellent ! Plus que {remaining.toLocaleString('fr-FR')} leads !
        </p>
      ) : progress >= 50 ? (
        <p className="mt-4 text-center text-sm text-auprea-info">
          Déjà à mi-chemin, continuez !
        </p>
      ) : progress >= 25 ? (
        <p className="mt-4 text-center text-sm text-gray-dark">
          Bonne progression !
        </p>
      ) : null}
    </motion.div>
  )
}
