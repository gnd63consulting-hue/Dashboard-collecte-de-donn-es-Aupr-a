import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  BookOpen,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react'

// AUPREA Logo component
function AupreaLogo({ collapsed }) {
  return (
    <div className={`flex items-center gap-3 px-4 py-5 border-b border-white/10 ${collapsed ? 'justify-center' : ''}`}>
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-auprea-gold to-auprea-gold-light flex items-center justify-center shadow-lg shadow-auprea-gold/20">
        <Sparkles className="w-5 h-5 text-auprea-navy-dark" />
      </div>
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            className="overflow-hidden"
          >
            <h1 className="text-lg font-bold text-white whitespace-nowrap">AUPREA</h1>
            <p className="text-xs text-gray-dark whitespace-nowrap">Mon Bilan Succession</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Navigation items
const navItems = [
  {
    path: '/',
    icon: LayoutDashboard,
    label: 'Tableau de bord',
    badge: null
  },
  {
    path: '/chat',
    icon: MessageSquare,
    label: 'Chat Tristan',
    badge: 'unanalysed' // Will show count of unanalysed leads
  },
  {
    path: '/leads',
    icon: Users,
    label: 'Leads',
    badge: null
  },
  {
    path: '/knowledge-base',
    icon: BookOpen,
    label: 'Base de connaissances',
    badge: null
  },
  {
    path: '/reports',
    icon: BarChart3,
    label: 'Rapports',
    badge: null
  }
]

// Navigation item component
function NavItem({ item, collapsed, unanalysedCount }) {
  const location = useLocation()
  const isActive = location.pathname === item.path

  const showBadge = item.badge === 'unanalysed' && unanalysedCount > 0

  return (
    <NavLink
      to={item.path}
      className={`
        flex items-center gap-3 px-4 py-3 mx-2 rounded-xl transition-all duration-200
        ${isActive
          ? 'bg-auprea-gold/20 text-auprea-gold border border-auprea-gold/30'
          : 'text-gray-dark hover:bg-white/5 hover:text-white border border-transparent'
        }
        ${collapsed ? 'justify-center' : ''}
      `}
    >
      <div className="relative">
        <item.icon className={`w-5 h-5 ${isActive ? 'text-auprea-gold' : ''}`} />
        {/* Badge for unanalysed leads */}
        {showBadge && collapsed && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-auprea-warning text-auprea-navy-dark text-xs font-bold rounded-full flex items-center justify-center">
            {unanalysedCount > 9 ? '9+' : unanalysedCount}
          </span>
        )}
      </div>

      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            className="flex-1 flex items-center justify-between overflow-hidden"
          >
            <span className={`whitespace-nowrap text-sm font-medium ${isActive ? 'text-auprea-gold' : ''}`}>
              {item.label}
            </span>

            {/* Badge for unanalysed leads */}
            {showBadge && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="ml-2 px-2 py-0.5 bg-auprea-warning text-auprea-navy-dark text-xs font-bold rounded-full"
              >
                {unanalysedCount}
              </motion.span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </NavLink>
  )
}

export default function Sidebar({ unanalysedCount = 0, collapsed = false, onCollapsedChange }) {
  const toggleCollapsed = () => {
    onCollapsedChange?.(!collapsed)
  }

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 256 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed left-0 top-0 h-screen bg-gradient-to-b from-auprea-navy-dark to-auprea-navy flex flex-col z-50 border-r border-white/10"
    >
      {/* Logo */}
      <AupreaLogo collapsed={collapsed} />

      {/* Navigation */}
      <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
        {navItems.map(item => (
          <NavItem
            key={item.path}
            item={item}
            collapsed={collapsed}
            unanalysedCount={unanalysedCount}
          />
        ))}
      </nav>

      {/* Collapse toggle */}
      <div className="border-t border-white/10 p-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleCollapsed}
          className={`
            w-full flex items-center gap-2 px-3 py-2 rounded-lg
            bg-white/5 hover:bg-white/10 text-gray-dark hover:text-white
            transition-colors duration-200
            ${collapsed ? 'justify-center' : ''}
          `}
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm">Réduire</span>
            </>
          )}
        </motion.button>
      </div>

      {/* Footer */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-4 py-3 border-t border-white/10"
          >
            <p className="text-xs text-gray-dark text-center">
              Powered by AUPREA
            </p>
            <p className="text-xs text-gray-dark/50 text-center">
              GND Consulting
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.aside>
  )
}
