import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Users,
  Search,
  Filter,
  Download,
  ChevronDown,
  Zap,
  TrendingUp,
  Brain,
  Clock,
  CheckCircle,
  Crown,
  MessageSquare,
  Eye
} from 'lucide-react'

import { useLeads } from '../hooks/useSupabase'

// Filter options
const STATUS_FILTERS = [
  { value: 'all', label: 'Tous', count: null },
  { value: 'unanalysed', label: 'Non analysés', count: null, icon: Clock },
  { value: 'analysed', label: 'Analysés', count: null, icon: CheckCircle }
]

const URGENCY_FILTERS = [
  { value: 'all', label: 'Tous' },
  { value: 'high', label: 'Élevée (71-100)' },
  { value: 'medium', label: 'Moyenne (41-70)' },
  { value: 'low', label: 'Faible (0-40)' }
]

const POTENTIAL_FILTERS = [
  { value: 'all', label: 'Tous' },
  { value: 'high', label: 'Élevé (71-100)' },
  { value: 'medium', label: 'Moyen (41-70)' },
  { value: 'low', label: 'Faible (0-40)' }
]

const PROFILE_OPTIONS = [
  'Le Pressé ⚡',
  'Le Prévoyant ✅',
  'Le Déni 🙈',
  "L'Inquiet 😰",
  'Le Méthodique 📋',
  "L'Héritier 👨‍👩‍👧‍👦"
]

const ACCOMPAGNEMENT_OPTIONS = [
  'Coordinateur AUPREA',
  'Notaire',
  'Avocat',
  'CGP',
  'Autre',
  'Non'
]

// Get score color class
function getScoreColor(value, type) {
  if (value === null || value === undefined) return 'text-gray-dark'

  if (type === 'urgence') {
    if (value >= 71) return 'text-red-400'
    if (value >= 41) return 'text-auprea-warning'
    return 'text-auprea-success'
  } else {
    if (value >= 71) return 'text-auprea-success'
    if (value >= 41) return 'text-auprea-warning'
    return 'text-gray-dark'
  }
}

// Lead card component
function LeadCard({ lead, onClick }) {
  const isAnalysed = !!lead.analysed_at || lead.score_urgence !== null
  const isCoordinateur = lead.accompagnement_souhaite?.includes('Coordinateur')

  // Extract emoji from profile
  const getEmoji = (profil) => {
    if (!profil) return null
    const match = profil.match(/[\u{1F300}-\u{1FAFF}]/gu)
    return match ? match[0] : null
  }

  const getShortProfile = (profil) => {
    if (!profil) return null
    return profil.replace(/[\u{1F300}-\u{1FAFF}]/gu, '').replace(/^(Le |L')/i, '').trim()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="glass-card p-5 cursor-pointer"
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-white">
              {lead.prenom} {lead.nom || ''}
            </h3>
            {lead.profil_psychologique && (
              <span className="text-xl" title={lead.profil_psychologique}>
                {getEmoji(lead.profil_psychologique)}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-dark font-mono mt-1">
            {lead.email || 'Email non renseigné'}
          </p>
        </div>

        {/* Status badge */}
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          isAnalysed
            ? 'bg-auprea-success/20 text-auprea-success'
            : 'bg-auprea-warning/20 text-auprea-warning'
        }`}>
          {isAnalysed ? 'Analysé' : 'En attente'}
        </span>
      </div>

      {/* Scores */}
      {isAnalysed ? (
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Zap className="w-4 h-4 text-red-400" />
              <span className="text-xs text-gray-dark">Urgence</span>
            </div>
            <p className={`text-xl font-bold font-mono ${getScoreColor(lead.score_urgence, 'urgence')}`}>
              {lead.score_urgence ?? '-'}
            </p>
          </div>
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Brain className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-gray-dark">Complexité</span>
            </div>
            <p className={`text-xl font-bold font-mono text-blue-400`}>
              {lead.score_complexite ?? '-'}
            </p>
          </div>
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-xs text-gray-dark">Potentiel</span>
            </div>
            <p className={`text-xl font-bold font-mono ${getScoreColor(lead.score_potentiel, 'potentiel')}`}>
              {lead.score_potentiel ?? '-'}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white/5 rounded-lg p-4 mb-4 text-center">
          <p className="text-sm text-gray-dark">Scores en attente d'analyse</p>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-white/10">
        <div className="flex items-center gap-2">
          {isCoordinateur && <Crown className="w-4 h-4 text-auprea-gold" />}
          <span className={`text-sm ${isCoordinateur ? 'text-auprea-gold' : 'text-gray-dark'}`}>
            {lead.accompagnement_souhaite || 'Non renseigné'}
          </span>
        </div>
        <span className="text-xs text-gray-dark">
          {new Date(lead.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
        </span>
      </div>

      {/* Profile name */}
      {lead.profil_psychologique && (
        <div className="mt-3 pt-3 border-t border-white/10">
          <span className="text-sm text-gray-dark">
            Profil : <span className="text-white">{getShortProfile(lead.profil_psychologique)}</span>
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="mt-4 flex gap-2">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={(e) => {
            e.stopPropagation()
            onClick()
          }}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-dark hover:text-white hover:bg-white/10 transition-colors"
        >
          <Eye className="w-4 h-4" />
          Voir détail
        </motion.button>
        {!isAnalysed && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={(e) => {
              e.stopPropagation()
              // Navigate to chat with pre-filled message
              window.location.href = `/chat?message=Analyse le lead ${lead.prenom} ${lead.nom || ''} (ID: ${lead.id})`
            }}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-auprea-gold/10 border border-auprea-gold/30 text-sm text-auprea-gold hover:bg-auprea-gold/20 transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            Analyser
          </motion.button>
        )}
      </div>
    </motion.div>
  )
}

// Filter dropdown component
function FilterDropdown({ label, value, options, onChange, icon: Icon }) {
  return (
    <div className="relative">
      <label className="block text-xs text-gray-dark mb-1">{label}</label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-dark" />
        )}
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`
            w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg
            text-sm text-white appearance-none cursor-pointer
            focus:border-auprea-gold/50 focus:outline-none transition-colors
            ${Icon ? 'pl-10' : ''}
          `}
        >
          {options.map(option => (
            <option key={option.value || option} value={option.value || option} className="bg-auprea-navy-dark">
              {option.label || option}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-dark pointer-events-none" />
      </div>
    </div>
  )
}

export default function LeadsPage() {
  const navigate = useNavigate()
  const { leads, loading } = useLeads()

  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [urgencyFilter, setUrgencyFilter] = useState('all')
  const [potentialFilter, setPotentialFilter] = useState('all')
  const [profileFilter, setProfileFilter] = useState('all')
  const [accompagnementFilter, setAccompagnementFilter] = useState('all')

  // Filter leads
  const filteredLeads = useMemo(() => {
    let result = [...leads]

    // Search
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(lead =>
        lead.prenom?.toLowerCase().includes(term) ||
        lead.nom?.toLowerCase().includes(term) ||
        lead.email?.toLowerCase().includes(term)
      )
    }

    // Status filter
    if (statusFilter === 'unanalysed') {
      result = result.filter(lead => !lead.analysed_at && lead.score_urgence === null)
    } else if (statusFilter === 'analysed') {
      result = result.filter(lead => lead.analysed_at || lead.score_urgence !== null)
    }

    // Urgency filter
    if (urgencyFilter === 'high') {
      result = result.filter(lead => lead.score_urgence >= 71)
    } else if (urgencyFilter === 'medium') {
      result = result.filter(lead => lead.score_urgence >= 41 && lead.score_urgence < 71)
    } else if (urgencyFilter === 'low') {
      result = result.filter(lead => lead.score_urgence !== null && lead.score_urgence < 41)
    }

    // Potential filter
    if (potentialFilter === 'high') {
      result = result.filter(lead => lead.score_potentiel >= 71)
    } else if (potentialFilter === 'medium') {
      result = result.filter(lead => lead.score_potentiel >= 41 && lead.score_potentiel < 71)
    } else if (potentialFilter === 'low') {
      result = result.filter(lead => lead.score_potentiel !== null && lead.score_potentiel < 41)
    }

    // Profile filter
    if (profileFilter !== 'all') {
      result = result.filter(lead => lead.profil_psychologique === profileFilter)
    }

    // Accompagnement filter
    if (accompagnementFilter !== 'all') {
      result = result.filter(lead =>
        lead.accompagnement_souhaite?.includes(accompagnementFilter)
      )
    }

    return result
  }, [leads, searchTerm, statusFilter, urgencyFilter, potentialFilter, profileFilter, accompagnementFilter])

  // Count stats
  const unanalysedCount = leads.filter(l => !l.analysed_at && l.score_urgence === null).length
  const analysedCount = leads.length - unanalysedCount
  const urgentCount = leads.filter(l => l.score_urgence >= 70).length
  const highPotentialCount = leads.filter(l => l.score_potentiel >= 70).length

  // Export to CSV
  const handleExport = () => {
    const headers = ['Prénom', 'Nom', 'Email', 'Téléphone', 'Accompagnement', 'Urgence', 'Complexité', 'Potentiel', 'Profil', 'Date']
    const rows = filteredLeads.map(lead => [
      lead.prenom || '',
      lead.nom || '',
      lead.email || '',
      lead.telephone || '',
      lead.accompagnement_souhaite || '',
      lead.score_urgence ?? '',
      lead.score_complexite ?? '',
      lead.score_potentiel ?? '',
      lead.profil_psychologique || '',
      new Date(lead.created_at).toLocaleDateString('fr-FR')
    ])

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `leads_auprea_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="glass-card p-6 mb-6">
          <div className="skeleton h-8 w-48 mb-4" />
          <div className="skeleton h-4 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass-card p-6">
              <div className="skeleton h-6 w-32 mb-4" />
              <div className="skeleton h-20 w-full mb-4" />
              <div className="skeleton h-4 w-24" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-auprea-gold/20 rounded-xl border border-auprea-gold/30">
            <Users className="w-6 h-6 text-auprea-gold" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Gestion des Leads</h1>
            <p className="text-sm text-gray-dark">
              {filteredLeads.length} lead{filteredLeads.length > 1 ? 's' : ''} sur {leads.length}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 lg:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-dark" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-dark focus:border-auprea-gold/50 focus:outline-none"
            />
          </div>

          {/* Export */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-dark hover:text-white hover:bg-white/10 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Exporter CSV</span>
          </motion.button>
        </div>
      </div>

      {/* Quick filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            statusFilter === 'all'
              ? 'bg-auprea-gold/20 text-auprea-gold border border-auprea-gold/30'
              : 'bg-white/5 text-gray-dark border border-transparent hover:bg-white/10'
          }`}
        >
          Tous ({leads.length})
        </button>
        <button
          onClick={() => setStatusFilter('unanalysed')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            statusFilter === 'unanalysed'
              ? 'bg-auprea-warning/20 text-auprea-warning border border-auprea-warning/30'
              : 'bg-white/5 text-gray-dark border border-transparent hover:bg-white/10'
          }`}
        >
          <Clock className="w-4 h-4" />
          Non analysés ({unanalysedCount})
        </button>
        <button
          onClick={() => {
            setStatusFilter('analysed')
            setUrgencyFilter('high')
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            urgencyFilter === 'high'
              ? 'bg-red-400/20 text-red-400 border border-red-400/30'
              : 'bg-white/5 text-gray-dark border border-transparent hover:bg-white/10'
          }`}
        >
          <Zap className="w-4 h-4" />
          Urgents ({urgentCount})
        </button>
        <button
          onClick={() => {
            setStatusFilter('analysed')
            setPotentialFilter('high')
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            potentialFilter === 'high'
              ? 'bg-auprea-success/20 text-auprea-success border border-auprea-success/30'
              : 'bg-white/5 text-gray-dark border border-transparent hover:bg-white/10'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Haut potentiel ({highPotentialCount})
        </button>
        <button
          onClick={() => setAccompagnementFilter('Coordinateur AUPREA')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            accompagnementFilter === 'Coordinateur AUPREA'
              ? 'bg-auprea-gold/20 text-auprea-gold border border-auprea-gold/30'
              : 'bg-white/5 text-gray-dark border border-transparent hover:bg-white/10'
          }`}
        >
          <Crown className="w-4 h-4" />
          Coordinateur AUPREA
        </button>
      </div>

      {/* Advanced filters */}
      <div className="glass-card p-4 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-auprea-gold" />
          <span className="text-sm font-medium text-white">Filtres avancés</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <FilterDropdown
            label="Statut"
            value={statusFilter}
            options={[{ value: 'all', label: 'Tous' }, { value: 'unanalysed', label: 'Non analysés' }, { value: 'analysed', label: 'Analysés' }]}
            onChange={setStatusFilter}
          />
          <FilterDropdown
            label="Urgence"
            value={urgencyFilter}
            options={URGENCY_FILTERS}
            onChange={setUrgencyFilter}
            icon={Zap}
          />
          <FilterDropdown
            label="Potentiel"
            value={potentialFilter}
            options={POTENTIAL_FILTERS}
            onChange={setPotentialFilter}
            icon={TrendingUp}
          />
          <FilterDropdown
            label="Profil"
            value={profileFilter}
            options={[{ value: 'all', label: 'Tous' }, ...PROFILE_OPTIONS.map(p => ({ value: p, label: p }))]}
            onChange={setProfileFilter}
            icon={Brain}
          />
          <FilterDropdown
            label="Accompagnement"
            value={accompagnementFilter}
            options={[{ value: 'all', label: 'Tous' }, ...ACCOMPAGNEMENT_OPTIONS.map(a => ({ value: a, label: a }))]}
            onChange={setAccompagnementFilter}
          />
        </div>
        {(statusFilter !== 'all' || urgencyFilter !== 'all' || potentialFilter !== 'all' || profileFilter !== 'all' || accompagnementFilter !== 'all') && (
          <button
            onClick={() => {
              setStatusFilter('all')
              setUrgencyFilter('all')
              setPotentialFilter('all')
              setProfileFilter('all')
              setAccompagnementFilter('all')
            }}
            className="mt-4 text-sm text-auprea-gold hover:underline"
          >
            Réinitialiser les filtres
          </button>
        )}
      </div>

      {/* Leads grid */}
      {filteredLeads.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Users className="w-12 h-12 text-gray-dark mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold text-white mb-2">Aucun lead trouvé</h3>
          <p className="text-gray-dark">Essayez de modifier vos filtres de recherche</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLeads.map(lead => (
            <LeadCard
              key={lead.id}
              lead={lead}
              onClick={() => navigate(`/leads/${lead.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
