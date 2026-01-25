import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'

const VERSION = '1.0.0'

export default function Footer({ lastUpdate }) {
  const currentYear = new Date().getFullYear()

  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
      className="mt-8 glass-card p-6"
    >
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
        {/* Branding */}
        <div className="flex items-center gap-2 text-white/70">
          <span>Powered by</span>
          <span className="text-auprea-gold font-semibold">AUPREA</span>
          <span className="text-auprea-gold/50">×</span>
          <span className="text-white font-semibold">GND Consulting</span>
        </div>

        {/* Meta info */}
        <div className="flex flex-col sm:flex-row items-center gap-4 text-white/60">
          <span className="flex items-center gap-1">
            Dernière maj :{' '}
            <span className="font-mono text-auprea-gold">
              {lastUpdate.toLocaleTimeString('fr-FR')}
            </span>
          </span>
          <span className="hidden sm:inline text-white/20">|</span>
          <span>Version {VERSION}</span>
        </div>

        {/* Copyright */}
        <div className="flex items-center gap-1 text-white/60">
          <span>© {currentYear} AUPREA - Made with</span>
          <Heart className="w-4 h-4 text-red-400 fill-red-400 animate-pulse" />
        </div>
      </div>

      {/* Decorative gold line */}
      <div className="mt-4 h-0.5 w-full bg-gradient-to-r from-transparent via-auprea-gold/50 to-transparent rounded-full" />
    </motion.footer>
  )
}
