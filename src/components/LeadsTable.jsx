import { motion, AnimatePresence } from 'framer-motion'
import { useState, useMemo } from 'react'
import { Users, Search, ChevronDown, ChevronUp, Mail, Phone, Calendar, Zap, TrendingUp, Brain, CheckCircle, Clock } from 'lucide-react'

// Mask email for privacy
function maskEmail(email) {
  if (!email) return '-'
  const [local, domain] = email.split('@')
  if (!domain) return email
  const maskedLocal = local.slice(0, 2) + '***'
  return `${maskedLocal}@${domain}`
}

// Mask phone for privacy
function maskPhone(phone) {
  if (!phone) return '-'
  const cleaned = phone.replace(/\s/g, '')
  if (cleaned.length < 6) return phone
  return cleaned.slice(0, 2) + ' ** ** ** ' + cleaned.slice(-2)
}

// Format date
function formatDate(dateStr) {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Accompagnement badge
function AccompagnementBadge({ value }) {
  if (!value) return <span className="text-gray-dark">-</span>

  // Check for specific accompaniment types
  const isCoordinateur = value.toLowerCase().includes('coordinateur')
  const isYes = value.toLowerCase().includes('oui') || isCoordinateur

  // Show the actual type if it's a specific professional
  const displayValue = isCoordinateur ? 'AUPREA' : (isYes ? 'Oui' : 'Non')

  return (
    <span className={`
      inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
      ${isCoordinateur
        ? 'bg-auprea-gold/20 text-auprea-gold'
        : isYes
        ? 'bg-auprea-success/20 text-auprea-success'
        : 'bg-gray-dark/20 text-gray-dark'
      }
    `}>
      {displayValue}
    </span>
  )
}

// Score badge with color coding
function ScoreBadge({ value, type = 'default' }) {
  if (value === null || value === undefined) {
    return <span className="text-gray-dark text-sm">-</span>
  }

  // Color based on value: 0-40 green, 41-70 yellow, 71-100 red
  let colorClass = 'text-auprea-success'
  let bgClass = 'bg-auprea-success/20'

  if (type === 'urgence') {
    // For urgency, higher is more urgent (red)
    if (value >= 71) {
      colorClass = 'text-red-400'
      bgClass = 'bg-red-400/20'
    } else if (value >= 41) {
      colorClass = 'text-auprea-warning'
      bgClass = 'bg-auprea-warning/20'
    }
  } else if (type === 'potentiel') {
    // For potential, higher is better (green)
    if (value >= 71) {
      colorClass = 'text-auprea-success'
      bgClass = 'bg-auprea-success/20'
    } else if (value >= 41) {
      colorClass = 'text-auprea-warning'
      bgClass = 'bg-auprea-warning/20'
    } else {
      colorClass = 'text-gray-dark'
      bgClass = 'bg-gray-dark/20'
    }
  }

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-mono font-semibold ${bgClass} ${colorClass}`}>
      {value}
    </span>
  )
}

// Profile badge with emoji
function ProfileBadge({ value }) {
  if (!value) return <span className="text-gray-dark text-sm">-</span>

  // Extract emoji and short name
  const emojiMatch = value.match(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA00}-\u{1FA6F}]|[\u{1FA70}-\u{1FAFF}]|[\u{231A}-\u{231B}]|[\u{23E9}-\u{23F3}]|[\u{23F8}-\u{23FA}]|[\u{25AA}-\u{25AB}]|[\u{25B6}]|[\u{25C0}]|[\u{25FB}-\u{25FE}]|[\u{2614}-\u{2615}]|[\u{2648}-\u{2653}]|[\u{267F}]|[\u{2693}]|[\u{26A1}]|[\u{26AA}-\u{26AB}]|[\u{26BD}-\u{26BE}]|[\u{26C4}-\u{26C5}]|[\u{26CE}]|[\u{26D4}]|[\u{26EA}]|[\u{26F2}-\u{26F3}]|[\u{26F5}]|[\u{26FA}]|[\u{26FD}]|[\u{2702}]|[\u{2705}]|[\u{2708}-\u{270D}]|[\u{270F}]|[\u{2712}]|[\u{2714}]|[\u{2716}]|[\u{271D}]|[\u{2721}]|[\u{2728}]|[\u{2733}-\u{2734}]|[\u{2744}]|[\u{2747}]|[\u{274C}]|[\u{274E}]|[\u{2753}-\u{2755}]|[\u{2757}]|[\u{2763}-\u{2764}]|[\u{2795}-\u{2797}]|[\u{27A1}]|[\u{27B0}]|[\u{27BF}]|[\u{2934}-\u{2935}]|[\u{2B05}-\u{2B07}]|[\u{2B1B}-\u{2B1C}]|[\u{2B50}]|[\u{2B55}]|[\u{3030}]|[\u{303D}]|[\u{3297}]|[\u{3299}]/gu)
  const emoji = emojiMatch ? emojiMatch[0] : ''

  // Get short name (without emoji, without "Le/L'" prefix)
  let shortName = value.replace(/[\u{1F300}-\u{1FAFF}]/gu, '').trim()
  shortName = shortName.replace(/^(Le |L')/i, '').trim()

  return (
    <span className="inline-flex items-center gap-1 text-sm text-white" title={value}>
      <span>{emoji}</span>
      <span className="hidden lg:inline truncate max-w-20">{shortName}</span>
    </span>
  )
}

// Analysis status badge
function StatusBadge({ analysedAt }) {
  const isAnalysed = !!analysedAt

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
      isAnalysed
        ? 'bg-auprea-success/20 text-auprea-success'
        : 'bg-auprea-warning/20 text-auprea-warning'
    }`}>
      {isAnalysed ? (
        <>
          <CheckCircle className="w-3 h-3" />
          <span className="hidden sm:inline">Analysé</span>
        </>
      ) : (
        <>
          <Clock className="w-3 h-3" />
          <span className="hidden sm:inline">En attente</span>
        </>
      )}
    </span>
  )
}

export default function LeadsTable({ leads, loading = false }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState('created_at')
  const [sortDirection, setSortDirection] = useState('desc')
  const [visibleCount, setVisibleCount] = useState(10)

  // Filter and sort leads
  const filteredLeads = useMemo(() => {
    let result = [...leads]

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(lead =>
        lead.prenom?.toLowerCase().includes(term) ||
        lead.nom?.toLowerCase().includes(term) ||
        lead.email?.toLowerCase().includes(term)
      )
    }

    // Sort
    result.sort((a, b) => {
      let aVal = a[sortField] || ''
      let bVal = b[sortField] || ''

      if (sortField === 'created_at') {
        aVal = new Date(aVal).getTime()
        bVal = new Date(bVal).getTime()
      }

      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1
      }
      return aVal < bVal ? 1 : -1
    })

    return result
  }, [leads, searchTerm, sortField, sortDirection])

  const visibleLeads = filteredLeads.slice(0, visibleCount)

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const SortIcon = ({ field }) => {
    if (sortField !== field) return null
    return sortDirection === 'asc'
      ? <ChevronUp className="w-4 h-4" />
      : <ChevronDown className="w-4 h-4" />
  }

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <div className="skeleton h-6 w-48 mb-6" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton h-12 w-full" />
          ))}
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="glass-card p-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-auprea-success/20 rounded-lg">
            <Users className="w-5 h-5 text-auprea-success" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              Derniers Leads
            </h3>
            <p className="text-sm text-gray-dark">
              {filteredLeads.length} résultat{filteredLeads.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-dark" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64 pl-10 pr-4 py-2 bg-white/5 border border-white/10
                       rounded-lg text-sm text-white placeholder-gray-dark
                       focus:border-auprea-gold/50 focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th
                className="px-3 py-3 text-left text-xs font-medium text-gray-dark uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                onClick={() => toggleSort('created_at')}
              >
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Date
                  <SortIcon field="created_at" />
                </span>
              </th>
              <th
                className="px-3 py-3 text-left text-xs font-medium text-gray-dark uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                onClick={() => toggleSort('prenom')}
              >
                <span className="flex items-center gap-1">
                  Prénom
                  <SortIcon field="prenom" />
                </span>
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-dark uppercase tracking-wider hidden lg:table-cell">
                <span className="flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  Email
                </span>
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-dark uppercase tracking-wider hidden xl:table-cell">
                <span className="flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  Tél
                </span>
              </th>
              <th
                className="px-3 py-3 text-left text-xs font-medium text-gray-dark uppercase tracking-wider cursor-pointer hover:text-white transition-colors hidden sm:table-cell"
                onClick={() => toggleSort('accompagnement_souhaite')}
              >
                <span className="flex items-center gap-1">
                  Accomp.
                  <SortIcon field="accompagnement_souhaite" />
                </span>
              </th>
              <th
                className="px-3 py-3 text-left text-xs font-medium text-gray-dark uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                onClick={() => toggleSort('score_urgence')}
              >
                <span className="flex items-center gap-1">
                  <Zap className="w-4 h-4 text-red-400" />
                  Urg.
                  <SortIcon field="score_urgence" />
                </span>
              </th>
              <th
                className="px-3 py-3 text-left text-xs font-medium text-gray-dark uppercase tracking-wider cursor-pointer hover:text-white transition-colors hidden md:table-cell"
                onClick={() => toggleSort('score_potentiel')}
              >
                <span className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  Pot.
                  <SortIcon field="score_potentiel" />
                </span>
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-dark uppercase tracking-wider hidden lg:table-cell">
                <span className="flex items-center gap-1">
                  <Brain className="w-4 h-4 text-purple-400" />
                  Profil
                </span>
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-dark uppercase tracking-wider">
                <span className="flex items-center gap-1">
                  Statut
                </span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            <AnimatePresence>
              {visibleLeads.map((lead, index) => (
                <motion.tr
                  key={lead.id || index}
                  initial={lead._isNew ? { opacity: 0, x: -20, backgroundColor: 'rgba(212, 175, 55, 0.2)' } : { opacity: 0 }}
                  animate={{ opacity: 1, x: 0, backgroundColor: 'transparent' }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="table-row-hover cursor-pointer"
                >
                  <td className="px-3 py-3 whitespace-nowrap">
                    <span className="text-sm text-white font-mono">
                      {formatDate(lead.created_at || lead.date_reponse)}
                    </span>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <span className="text-sm text-white font-medium">
                      {lead.prenom || '-'}
                    </span>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap hidden lg:table-cell">
                    <span className="text-sm text-gray-dark font-mono">
                      {maskEmail(lead.email)}
                    </span>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap hidden xl:table-cell">
                    <span className="text-sm text-gray-dark font-mono">
                      {maskPhone(lead.telephone)}
                    </span>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap hidden sm:table-cell">
                    <AccompagnementBadge value={lead.accompagnement_souhaite} />
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <ScoreBadge value={lead.score_urgence} type="urgence" />
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap hidden md:table-cell">
                    <ScoreBadge value={lead.score_potentiel} type="potentiel" />
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap hidden lg:table-cell">
                    <ProfileBadge value={lead.profil_psychologique} />
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <StatusBadge analysedAt={lead.analysed_at} />
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Load more */}
      {visibleCount < filteredLeads.length && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setVisibleCount(prev => prev + 10)}
          className="mt-4 w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10
                     hover:border-auprea-gold/30 rounded-lg text-sm text-gray-dark
                     hover:text-white transition-all duration-200"
        >
          Afficher plus ({filteredLeads.length - visibleCount} restants)
        </motion.button>
      )}

      {/* Empty state */}
      {filteredLeads.length === 0 && (
        <div className="text-center py-8">
          <Users className="w-12 h-12 text-gray-dark mx-auto mb-3" />
          <p className="text-gray-dark">
            {searchTerm ? 'Aucun lead trouvé' : 'Aucun lead pour le moment'}
          </p>
        </div>
      )}
    </motion.div>
  )
}
