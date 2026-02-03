import { useState, createContext, useContext, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import { useLeads } from '../../hooks/useSupabase'
import { Menu } from 'lucide-react'

// Context for sidebar state
const SidebarContext = createContext({ collapsed: false, setCollapsed: () => {}, isMobile: false })

export function useSidebar() {
  return useContext(SidebarContext)
}

export default function AppLayout() {
  const { leads } = useLeads()
  const [collapsed, setCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()

  // Detect mobile screen
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth < 768) {
        setCollapsed(true)
      }
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  // Calculate unanalysed leads count
  const unanalysedCount = leads.filter(lead => !lead.analysed_at && lead.score_urgence === null).length

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed, isMobile }}>
      <div className="min-h-screen relative">
        {/* Background pattern */}
        <div className="bg-pattern" />

        {/* Mobile header with hamburger */}
        {isMobile && (
          <header className="fixed top-0 left-0 right-0 z-50 bg-auprea-navy-dark/95 backdrop-blur-sm border-b border-white/10 px-4 py-3 flex items-center justify-between">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-bold text-white">AUPREA</h1>
            <div className="w-10" /> {/* Spacer for centering */}
          </header>
        )}

        {/* Mobile overlay */}
        {isMobile && mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar - hidden on mobile unless menu is open */}
        <div className={`
          ${isMobile ? 'fixed z-50' : ''}
          ${isMobile && !mobileMenuOpen ? '-translate-x-full' : 'translate-x-0'}
          transition-transform duration-300 ease-in-out
        `}>
          <Sidebar
            unanalysedCount={unanalysedCount}
            collapsed={isMobile ? false : collapsed}
            onCollapsedChange={setCollapsed}
            isMobile={isMobile}
            onClose={() => setMobileMenuOpen(false)}
          />
        </div>

        {/* Main content area */}
        <main
          className="min-h-screen relative z-10 transition-all duration-300 ease-in-out"
          style={{
            marginLeft: isMobile ? 0 : (collapsed ? 72 : 256),
            paddingTop: isMobile ? 60 : 0
          }}
        >
          <Outlet />
        </main>
      </div>
    </SidebarContext.Provider>
  )
}
