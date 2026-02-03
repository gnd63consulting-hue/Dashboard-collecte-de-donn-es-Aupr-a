import { useState, createContext, useContext, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import { useLeads } from '../../hooks/useSupabase'
import { Menu, X } from 'lucide-react'

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
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (mobile) {
        setMobileMenuOpen(false) // Close menu when switching to mobile
      }
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    if (isMobile) {
      setMobileMenuOpen(false)
    }
  }, [location.pathname, isMobile])

  // Calculate unanalysed leads count
  const unanalysedCount = leads.filter(lead => !lead.analysed_at && lead.score_urgence === null).length

  // Close menu handler
  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
  }

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed, isMobile }}>
      <div className="min-h-screen relative">
        {/* Background pattern */}
        <div className="bg-pattern" />

        {/* Mobile header with hamburger - always visible on mobile */}
        {isMobile && (
          <header className="fixed top-0 left-0 right-0 z-40 bg-auprea-navy-dark/95 backdrop-blur-sm border-b border-white/10 px-4 py-3 flex items-center justify-between">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors"
              aria-label="Ouvrir le menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-bold text-white">AUPREA</h1>
            <div className="w-10" />
          </header>
        )}

        {/* Mobile sidebar overlay and drawer */}
        {isMobile && mobileMenuOpen && (
          <>
            {/* Dark overlay - click to close (z-50) */}
            <div
              className="fixed inset-0 bg-black/60 z-50"
              onClick={closeMobileMenu}
              onTouchEnd={closeMobileMenu}
              aria-hidden="true"
            />

            {/* Sidebar drawer (z-[60] - higher than overlay) */}
            <div className="fixed inset-y-0 left-0 z-[60] w-64 bg-gradient-to-b from-auprea-navy-dark to-auprea-navy border-r border-white/10 flex flex-col shadow-2xl">
              {/* Header with close button */}
              <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-auprea-gold to-auprea-gold-light flex items-center justify-center">
                    <span className="text-auprea-navy-dark font-bold text-sm">A</span>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">AUPREA</h2>
                    <p className="text-xs text-gray-dark">Mon Bilan Succession</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    closeMobileMenu()
                  }}
                  onTouchEnd={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    closeMobileMenu()
                  }}
                  className="p-3 rounded-lg bg-white/10 hover:bg-white/20 active:bg-white/30 text-white transition-colors touch-manipulation"
                  aria-label="Fermer le menu"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Navigation */}
              <Sidebar
                unanalysedCount={unanalysedCount}
                collapsed={false}
                isMobile={true}
                onClose={closeMobileMenu}
                renderAsNav={true}
              />
            </div>
          </>
        )}

        {/* Desktop sidebar - always visible */}
        {!isMobile && (
          <Sidebar
            unanalysedCount={unanalysedCount}
            collapsed={collapsed}
            onCollapsedChange={setCollapsed}
            isMobile={false}
          />
        )}

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
