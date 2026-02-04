import { useState, createContext, useContext, useEffect, useCallback } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import { useLeads } from '../../hooks/useSupabase'
import { Menu, X, Sparkles } from 'lucide-react'

// Context for sidebar state
const SidebarContext = createContext({ collapsed: false, setCollapsed: () => {}, isMobile: false })

export function useSidebar() {
  return useContext(SidebarContext)
}

export default function AppLayout() {
  const { leads } = useLeads()
  const [collapsed, setCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()

  // Detect mobile/desktop on resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (!mobile) {
        setMobileMenuOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  // Lock body scroll when mobile menu is open (prevents iOS scroll-through)
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [mobileMenuOpen])

  // Calculate unanalysed leads count
  const unanalysedCount = leads.filter(lead => !lead.analysed_at && lead.score_urgence === null).length

  // Close menu handler
  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false)
  }, [])

  // Touch handler for iOS Safari — fires on touchend as fallback when onClick fails
  const handleTouchClose = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    closeMobileMenu()
  }, [closeMobileMenu])

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed, isMobile }}>
      <div className="min-h-screen relative">
        {/* Background pattern */}
        <div className="bg-pattern" />

        {/* ========================================= */}
        {/* MOBILE: Header with hamburger             */}
        {/* Hidden on desktop via md:hidden            */}
        {/* ========================================= */}
        <header className="md:hidden fixed top-0 left-0 right-0 z-40 bg-auprea-navy-dark/95 backdrop-blur-sm border-b border-white/10 px-4 py-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors touch-manipulation"
            aria-label="Ouvrir le menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-auprea-gold" />
            <h1 className="text-lg font-bold text-white">AUPREA</h1>
          </div>
          <div className="w-10" />
        </header>

        {/* ========================================= */}
        {/* MOBILE: Dark overlay when menu is open    */}
        {/* ========================================= */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/60 md:hidden"
            onClick={closeMobileMenu}
            onTouchEnd={handleTouchClose}
            role="button"
            tabIndex={-1}
            aria-label="Fermer le menu"
          />
        )}

        {/* ========================================= */}
        {/* MOBILE: Sidebar drawer (slide from left)  */}
        {/* Always in DOM on mobile for CSS animation  */}
        {/* Hidden on desktop via md:hidden            */}
        {/* ========================================= */}
        <aside
          className={`
            md:hidden fixed top-0 left-0 bottom-0 z-50
            w-64 bg-gradient-to-b from-auprea-navy-dark to-auprea-navy
            border-r border-white/10 flex flex-col shadow-2xl
            transition-transform duration-300 ease-in-out
            ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
        >
          {/* Header with logo + close button */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-auprea-gold to-auprea-gold-light flex items-center justify-center shadow-lg shadow-auprea-gold/20">
                <Sparkles className="w-5 h-5 text-auprea-navy-dark" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">AUPREA</h2>
                <p className="text-xs text-gray-dark">Mon Bilan Succession</p>
              </div>
            </div>
            <button
              type="button"
              onClick={closeMobileMenu}
              onTouchEnd={handleTouchClose}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 active:bg-white/30 text-white transition-colors touch-manipulation"
              aria-label="Fermer le menu"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation items */}
          <Sidebar
            unanalysedCount={unanalysedCount}
            collapsed={false}
            isMobile={true}
            onClose={closeMobileMenu}
            renderAsNav={true}
          />
        </aside>

        {/* ========================================= */}
        {/* DESKTOP: Permanent sidebar                */}
        {/* Hidden on mobile via hidden, shown md+    */}
        {/* ========================================= */}
        <div className="hidden md:block">
          <Sidebar
            unanalysedCount={unanalysedCount}
            collapsed={collapsed}
            onCollapsedChange={setCollapsed}
            isMobile={false}
          />
        </div>

        {/* ========================================= */}
        {/* MAIN CONTENT                              */}
        {/* ========================================= */}
        <main
          className="min-h-screen relative z-10 transition-[margin] duration-300 ease-in-out pt-[60px] md:pt-0"
          style={{ marginLeft: isMobile ? 0 : (collapsed ? 72 : 256) }}
        >
          <Outlet />
        </main>
      </div>
    </SidebarContext.Provider>
  )
}
