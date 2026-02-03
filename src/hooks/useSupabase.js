import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase, LEADS_TABLE } from '../lib/supabase'

// Hook for fetching leads with real-time updates
export function useLeads(refreshInterval = 30000) {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [isConnected, setIsConnected] = useState(true)
  const previousCountRef = useRef(0)

  const fetchLeads = useCallback(async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from(LEADS_TABLE)
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      // Mark new leads
      const previousCount = previousCountRef.current
      const currentCount = data?.length || 0

      if (previousCount > 0 && currentCount > previousCount) {
        const newLeadsCount = currentCount - previousCount
        data.slice(0, newLeadsCount).forEach(lead => {
          lead._isNew = true
        })
      }

      previousCountRef.current = currentCount
      setLeads(data || [])
      setLastUpdate(new Date())
      setIsConnected(true)
      setError(null)
    } catch (err) {
      console.error('Error fetching leads:', err)
      setError(err.message)
      setIsConnected(false)
    } finally {
      setLoading(false)
    }
  }, [])

  // Manual refresh function
  const refresh = useCallback(() => {
    setLoading(true)
    fetchLeads()
  }, [fetchLeads])

  // Initial fetch and interval setup
  useEffect(() => {
    fetchLeads()

    // Set up auto-refresh
    const interval = setInterval(fetchLeads, refreshInterval)

    // Set up real-time subscription
    const subscription = supabase
      .channel('leads_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: LEADS_TABLE
        },
        (payload) => {
          console.log('Real-time update:', payload)
          fetchLeads()
        }
      )
      .subscribe()

    return () => {
      clearInterval(interval)
      subscription.unsubscribe()
    }
  }, [fetchLeads, refreshInterval])

  return {
    leads,
    loading,
    error,
    lastUpdate,
    isConnected,
    refresh
  }
}

// Hook for computed statistics
export function useLeadStats(leads) {
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    yesterday: 0,
    thisWeek: 0,
    lastWeek: 0,
    todayChange: 0,
    weeklyChange: 0,
    dailyData: [],
    weekdayData: [],
    hourlyData: [],
    heatmapData: [],
    accompagnementRate: 0,
    bestDay: '',
    bestHour: '',
    estimatedDaysTo10K: 0,
    weeklySparkline: [],
    // New score statistics
    scoreStats: {
      avgUrgence: 0,
      avgComplexite: 0,
      avgPotentiel: 0,
      avgGlobal: 0,
      totalAnalysed: 0,
      totalLeads: 0
    },
    // Accompaniment type distribution
    accompagnementDistribution: [],
    // Profile distribution
    profilDistribution: []
  })

  useEffect(() => {
    if (!leads || leads.length === 0) {
      setStats(prev => ({ ...prev, total: 0 }))
      return
    }

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    const startOfWeek = new Date(today)
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())

    const startOfLastWeek = new Date(startOfWeek)
    startOfLastWeek.setDate(startOfLastWeek.getDate() - 7)

    // Count leads by period
    let todayCount = 0
    let yesterdayCount = 0
    let thisWeekCount = 0
    let lastWeekCount = 0
    let accompagnementCount = 0

    // Data for charts
    const dailyMap = new Map()
    const weekdayCount = [0, 0, 0, 0, 0, 0, 0] // Sun-Sat
    const hourCount = Array(24).fill(0)
    const heatmap = Array(7).fill(null).map(() => Array(24).fill(0))

    leads.forEach(lead => {
      const createdAt = lead.created_at ? new Date(lead.created_at) : null
      if (!createdAt) return

      // Today / Yesterday
      if (createdAt >= today) {
        todayCount++
      } else if (createdAt >= yesterday && createdAt < today) {
        yesterdayCount++
      }

      // This week / Last week
      if (createdAt >= startOfWeek) {
        thisWeekCount++
      } else if (createdAt >= startOfLastWeek && createdAt < startOfWeek) {
        lastWeekCount++
      }

      // Accompagnement rate
      if (lead.accompagnement_souhaite &&
          lead.accompagnement_souhaite.toLowerCase().includes('oui')) {
        accompagnementCount++
      }

      // Daily data (last 90 days)
      const dateKey = createdAt.toISOString().split('T')[0]
      dailyMap.set(dateKey, (dailyMap.get(dateKey) || 0) + 1)

      // Weekday data
      const dayOfWeek = createdAt.getDay()
      weekdayCount[dayOfWeek]++

      // Hour data
      const hour = createdAt.getHours()
      hourCount[hour]++

      // Heatmap data
      heatmap[dayOfWeek][hour]++
    })

    // Calculate changes
    const todayChange = yesterdayCount > 0
      ? Math.round(((todayCount - yesterdayCount) / yesterdayCount) * 100)
      : todayCount > 0 ? 100 : 0

    const weeklyChange = lastWeekCount > 0
      ? Math.round(((thisWeekCount - lastWeekCount) / lastWeekCount) * 100)
      : thisWeekCount > 0 ? 100 : 0

    // Format daily data for chart (last 90 days)
    const dailyData = []
    for (let i = 89; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateKey = date.toISOString().split('T')[0]
      dailyData.push({
        date: dateKey,
        count: dailyMap.get(dateKey) || 0,
        label: date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
      })
    }

    // Weekly sparkline (last 7 days)
    const weeklySparkline = dailyData.slice(-7).map(d => d.count)

    // Weekday data formatted
    const weekdayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
    const weekdayData = weekdayCount.map((count, index) => ({
      day: weekdayNames[index],
      count,
      fullName: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'][index]
    }))

    // Find best day
    const maxWeekday = Math.max(...weekdayCount)
    const bestDayIndex = weekdayCount.indexOf(maxWeekday)
    const bestDay = weekdayData[bestDayIndex]?.fullName || ''

    // Hourly data formatted
    const hourlyData = hourCount.map((count, hour) => ({
      hour: `${hour.toString().padStart(2, '0')}h`,
      count
    }))

    // Find best hour
    const maxHour = Math.max(...hourCount)
    const bestHourIndex = hourCount.indexOf(maxHour)
    const bestHour = `${bestHourIndex}h - ${bestHourIndex + 1}h`

    // Heatmap data formatted
    const heatmapData = []
    weekdayNames.forEach((day, dayIndex) => {
      for (let hour = 0; hour < 24; hour++) {
        heatmapData.push({
          day,
          dayIndex,
          hour,
          value: heatmap[dayIndex][hour]
        })
      }
    })

    // Calculate estimated days to 10K
    const totalDays = leads.length > 0 ?
      Math.ceil((now - new Date(leads[leads.length - 1]?.created_at || now)) / (1000 * 60 * 60 * 24)) : 1
    const avgPerDay = leads.length / Math.max(totalDays, 1)
    const remaining = 10000 - leads.length
    const estimatedDaysTo10K = avgPerDay > 0 ? Math.ceil(remaining / avgPerDay) : Infinity

    // Accompagnement rate
    const accompagnementRate = leads.length > 0
      ? Math.round((accompagnementCount / leads.length) * 100)
      : 0

    // === NEW: Score Statistics ===
    let totalUrgence = 0
    let totalComplexite = 0
    let totalPotentiel = 0
    let analysedCount = 0

    // Accompaniment type distribution
    const accompagnementTypeMap = new Map()

    // Profile distribution
    const profilMap = new Map()

    leads.forEach(lead => {
      // Count scores for analysed leads
      if (lead.analysed_at || lead.score_urgence !== null) {
        analysedCount++
        totalUrgence += lead.score_urgence || 0
        totalComplexite += lead.score_complexite || 0
        totalPotentiel += lead.score_potentiel || 0
      }

      // Count accompaniment types
      const accompType = lead.accompagnement_souhaite || 'Non renseigné'
      accompagnementTypeMap.set(accompType, (accompagnementTypeMap.get(accompType) || 0) + 1)

      // Count profiles
      if (lead.profil_psychologique) {
        profilMap.set(lead.profil_psychologique, (profilMap.get(lead.profil_psychologique) || 0) + 1)
      }
    })

    // Calculate averages
    const avgUrgence = analysedCount > 0 ? Math.round(totalUrgence / analysedCount) : 0
    const avgComplexite = analysedCount > 0 ? Math.round(totalComplexite / analysedCount) : 0
    const avgPotentiel = analysedCount > 0 ? Math.round(totalPotentiel / analysedCount) : 0
    // Global score = (urgence × 0.4 + potentiel × 0.35 + complexité × 0.25)
    const avgGlobal = analysedCount > 0
      ? Math.round(avgUrgence * 0.4 + avgPotentiel * 0.35 + avgComplexite * 0.25)
      : 0

    const scoreStats = {
      avgUrgence,
      avgComplexite,
      avgPotentiel,
      avgGlobal,
      totalAnalysed: analysedCount,
      totalLeads: leads.length
    }

    // Format accompaniment distribution - order with "Coordinateur AUPREA" first
    const accompagnementOrder = [
      'Coordinateur AUPREA',
      'Notaire',
      'Avocat',
      'CGP',
      'Autre',
      'Non',
      'Non renseigné'
    ]

    const accompagnementDistribution = accompagnementOrder
      .filter(type => accompagnementTypeMap.has(type))
      .map(type => ({
        type,
        count: accompagnementTypeMap.get(type),
        percentage: Math.round((accompagnementTypeMap.get(type) / leads.length) * 100)
      }))

    // Add any other types not in the predefined order
    accompagnementTypeMap.forEach((count, type) => {
      if (!accompagnementOrder.includes(type)) {
        accompagnementDistribution.push({
          type,
          count,
          percentage: Math.round((count / leads.length) * 100)
        })
      }
    })

    // Format profile distribution
    const profilOrder = [
      'Le Pressé ⚡',
      'Le Prévoyant ✅',
      'Le Déni 🙈',
      "L'Inquiet 😰",
      'Le Méthodique 📋',
      "L'Héritier 👨‍👩‍👧‍👦"
    ]

    const profilDistribution = profilOrder
      .map(profil => ({
        profil,
        count: profilMap.get(profil) || 0,
        percentage: profilMap.get(profil)
          ? Math.round((profilMap.get(profil) / analysedCount) * 100)
          : 0
      }))
      .filter(p => p.count > 0)

    setStats({
      total: leads.length,
      today: todayCount,
      yesterday: yesterdayCount,
      thisWeek: thisWeekCount,
      lastWeek: lastWeekCount,
      todayChange,
      weeklyChange,
      dailyData,
      weekdayData,
      hourlyData,
      heatmapData,
      accompagnementRate,
      bestDay,
      bestHour,
      estimatedDaysTo10K: isFinite(estimatedDaysTo10K) ? estimatedDaysTo10K : 0,
      weeklySparkline,
      // New statistics
      scoreStats,
      accompagnementDistribution,
      profilDistribution
    })
  }, [leads])

  return stats
}
