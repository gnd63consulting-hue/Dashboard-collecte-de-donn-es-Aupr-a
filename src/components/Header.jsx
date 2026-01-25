import { RefreshCw, Wifi, WifiOff } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

const LOGO_URL = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Logo%20AUPREA_COULEUR-1-F1U6ZEBxH9Ta2Xy0J0MnBGXxbIrv4o.png'

export default function Header({ isConnected, lastUpdate, onRefresh, loading }) {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTime = (date) => {
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const formatDate = (date) => {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <header className="glass-card mb-6 p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Logo and Title */}
        <div className="flex items-center gap-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
          >
            <img
              src={LOGO_URL}
              alt="AUPREA Logo"
              className="h-12 md:h-16 w-auto object-contain"
            />
            <div className="absolute -inset-2 bg-gradient-glow opacity-50 blur-xl -z-10" />
          </motion.div>

          <div>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl md:text-2xl font-bold text-white"
            >
              Dashboard{' '}
              <span className="text-gradient-gold">Mon Bilan Succession</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-gray-dark text-sm mt-1"
            >
              Statistiques temps réel de collecte des leads
            </motion.p>
          </div>
        </div>

        {/* Status and Actions */}
        <div className="flex items-center gap-4 md:gap-6">
          {/* Connection Status */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2"
          >
            {isConnected ? (
              <>
                <div className="relative">
                  <div className="w-3 h-3 bg-auprea-success rounded-full pulse-live" />
                  <div className="absolute inset-0 w-3 h-3 bg-auprea-success rounded-full animate-ping" />
                </div>
                <span className="text-sm text-auprea-success flex items-center gap-1">
                  <Wifi className="w-4 h-4" />
                  <span className="hidden sm:inline">Connecté</span>
                </span>
              </>
            ) : (
              <>
                <div className="w-3 h-3 bg-red-500 rounded-full" />
                <span className="text-sm text-red-500 flex items-center gap-1">
                  <WifiOff className="w-4 h-4" />
                  <span className="hidden sm:inline">Déconnecté</span>
                </span>
              </>
            )}
          </motion.div>

          {/* Date/Time */}
          <div className="hidden md:block text-right">
            <p className="text-white font-mono text-lg">{formatTime(currentTime)}</p>
            <p className="text-gray-dark text-xs capitalize">{formatDate(currentTime)}</p>
          </div>

          {/* Refresh Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-auprea-navy hover:bg-auprea-navy-dark
                       border border-auprea-gold/30 hover:border-auprea-gold/60 rounded-lg
                       transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 text-auprea-gold ${loading ? 'animate-spin' : ''}`} />
            <span className="text-sm text-white hidden sm:inline">Actualiser</span>
          </motion.button>
        </div>
      </div>

      {/* Last Update Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-gray-dark"
      >
        <span>Dernière mise à jour : {lastUpdate.toLocaleString('fr-FR')}</span>
        <span>Actualisation automatique toutes les 30 secondes</span>
      </motion.div>
    </header>
  )
}
