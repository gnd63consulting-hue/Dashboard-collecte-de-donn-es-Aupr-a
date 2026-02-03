import { useState, createContext, useContext } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import { useLeads } from '../../hooks/useSupabase'

// Context for sidebar state
const SidebarContext = createContext({ collapsed: false, setCollapsed: () => {} })

export function useSidebar() {
  return useContext(SidebarContext)
}

export default function AppLayout() {
  const { leads } = useLeads()
  const [collapsed, setCollapsed] = useState(false)

  // Calculate unanalysed leads count
  const unanalysedCount = leads.filter(lead => !lead.analysed_at && lead.score_urgence === null).length

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
      <div className="min-h-screen relative">
        {/* Background pattern */}
        <div className="bg-pattern" />

        {/* Sidebar */}
        <Sidebar
          unanalysedCount={unanalysedCount}
          collapsed={collapsed}
          onCollapsedChange={setCollapsed}
        />

        {/* Main content area with left margin for sidebar */}
        <main
          className="min-h-screen relative z-10 transition-all duration-300 ease-in-out"
          style={{ marginLeft: collapsed ? 72 : 256 }}
        >
          <Outlet />
        </main>
      </div>
    </SidebarContext.Provider>
  )
}
