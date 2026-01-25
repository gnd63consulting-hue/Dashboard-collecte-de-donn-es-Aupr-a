import { motion, AnimatePresence } from 'framer-motion'
import { useState, useMemo } from 'react'
import { Users, Search, ChevronDown, ChevronUp, Mail, Phone, Calendar } from 'lucide-react'

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

  const isYes = value.toLowerCase().includes('oui')

  return (
    <span className={`
      inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
      ${isYes
        ? 'bg-auprea-success/20 text-auprea-success'
        : 'bg-gray-dark/20 text-gray-dark'
      }
    `}>
      {isYes ? 'Oui' : 'Non'}
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
                className="px-4 py-3 text-left text-xs font-medium text-gray-dark uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                onClick={() => toggleSort('created_at')}
              >
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Date
                  <SortIcon field="created_at" />
                </span>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-dark uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                onClick={() => toggleSort('prenom')}
              >
                <span className="flex items-center gap-1">
                  Prénom
                  <SortIcon field="prenom" />
                </span>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-dark uppercase tracking-wider">
                <span className="flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  Email
                </span>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-dark uppercase tracking-wider hidden md:table-cell">
                <span className="flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  Téléphone
                </span>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-dark uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                onClick={() => toggleSort('accompagnement_souhaite')}
              >
                <span className="flex items-center gap-1">
                  Accompagnement
                  <SortIcon field="accompagnement_souhaite" />
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
                  className="table-row-hover"
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-sm text-white font-mono">
                      {formatDate(lead.created_at || lead.date_reponse)}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-sm text-white font-medium">
                      {lead.prenom || '-'}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-sm text-gray-dark font-mono">
                      {maskEmail(lead.email)}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap hidden md:table-cell">
                    <span className="text-sm text-gray-dark font-mono">
                      {maskPhone(lead.telephone)}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <AccompagnementBadge value={lead.accompagnement_souhaite} />
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
