import { motion } from 'framer-motion'
import { Heart, ExternalLink } from 'lucide-react'

const VERSION = '1.0.0'

export default function Footer({ lastUpdate }) {
  const currentYear = new Date().getFullYear()

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1 }}
      className="mt-8 pt-6 border-t border-white/10"
    >
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-dark">
        {/* Branding */}
        <div className="flex items-center gap-2">
          <span>Powered by</span>
          <span className="text-white font-medium">AUPREA</span>
          <span className="text-auprea-gold">×</span>
          <span className="text-white font-medium">GND Consulting</span>
        </div>

        {/* Meta info */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <span className="flex items-center gap-1">
            Dernière maj :{' '}
            <span className="font-mono text-white">
              {lastUpdate.toLocaleTimeString('fr-FR')}
            </span>
          </span>
          <span className="hidden sm:inline text-white/20">|</span>
          <span>Version {VERSION}</span>
        </div>

        {/* Copyright */}
        <div className="flex items-center gap-1">
          <span>© {currentYear} AUPREA - Made with</span>
          <Heart className="w-4 h-4 text-red-400 fill-red-400" />
        </div>
      </div>

      {/* Decorative line */}
      <div className="mt-6 h-1 w-full bg-gradient-to-r from-transparent via-auprea-gold/30 to-transparent rounded-full" />
    </motion.footer>
  )
}
