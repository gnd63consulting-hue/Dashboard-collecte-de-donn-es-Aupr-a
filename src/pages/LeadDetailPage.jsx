import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  Zap,
  Brain,
  TrendingUp,
  Target,
  Crown,
  MessageSquare,
  FileText,
  RefreshCw,
  Download,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock
} from 'lucide-react'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts'

import { supabase, LEADS_TABLE } from '../lib/supabase'

// Quiz question labels
const QUIZ_QUESTIONS = {
  q01_documents_rassembles: 'Documents rassemblés',
  q02_beneficiaires_identifies: 'Bénéficiaires identifiés',
  q03_contrats_assurance_vie: 'Contrats assurance vie',
  q04_dispositions_bancaires: 'Dispositions bancaires',
  q05_volontes_funeraires: 'Volontés funéraires',
  q06_testament: 'Testament',
  q07_regime_matrimonial: 'Régime matrimonial',
  q08_donation_entre_epoux: 'Donation entre époux',
  q09_mandat_protection: 'Mandat de protection',
  q10_clauses_beneficiaires: 'Clauses bénéficiaires',
  q11_transmission_entreprise: 'Transmission entreprise',
  q12_patrimoine_immobilier: 'Patrimoine immobilier',
  q13_dettes_en_cours: 'Dettes en cours',
  q14_situation_fiscale: 'Situation fiscale',
  q15_personnes_informees: 'Personnes informées',
  q16_documents_accessibles: 'Documents accessibles',
  q17_anticiper_transmission: 'Anticiper transmission'
}

// Response badge component
function ResponseBadge({ value }) {
  if (!value) return <span className="text-gray-dark text-sm">-</span>

  const normalized = value.toLowerCase()
  let icon, colorClass

  if (normalized === 'oui') {
    icon = <CheckCircle className="w-4 h-4" />
    colorClass = 'bg-auprea-success/20 text-auprea-success'
  } else if (normalized === 'non') {
    icon = <XCircle className="w-4 h-4" />
    colorClass = 'bg-red-400/20 text-red-400'
  } else {
    icon = <AlertTriangle className="w-4 h-4" />
    colorClass = 'bg-auprea-warning/20 text-auprea-warning'
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
      {icon}
      {value}
    </span>
  )
}

// Score gauge component
function ScoreGauge({ value, label, color, icon: Icon }) {
  const percentage = value ?? 0

  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-1 mb-2">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className="text-sm text-gray-dark">{label}</span>
      </div>
      <div className={`text-3xl font-bold font-mono ${color}`}>
        {value ?? '-'}
      </div>
      <div className="w-full h-2 bg-white/10 rounded-full mt-2 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className={`h-full rounded-full ${
            color.includes('red') ? 'bg-red-400' :
            color.includes('blue') ? 'bg-blue-400' :
            color.includes('green') ? 'bg-green-400' :
            'bg-auprea-gold'
          }`}
        />
      </div>
    </div>
  )
}

export default function LeadDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [lead, setLead] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch lead data
  useEffect(() => {
    async function fetchLead() {
      try {
        const { data, error: fetchError } = await supabase
          .from(LEADS_TABLE)
          .select('*')
          .eq('id', id)
          .single()

        if (fetchError) throw fetchError
        setLead(data)
      } catch (err) {
        console.error('Error fetching lead:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchLead()
  }, [id])

  // Calculate global score
  const calculateGlobalScore = (lead) => {
    if (!lead || lead.score_urgence === null) return null
    const urgence = lead.score_urgence || 0
    const complexite = lead.score_complexite || 0
    const potentiel = lead.score_potentiel || 0
    return Math.round(urgence * 0.4 + potentiel * 0.35 + complexite * 0.25)
  }

  // Prepare radar chart data
  const radarData = lead ? [
    { subject: 'Urgence', value: lead.score_urgence || 0, fullMark: 100 },
    { subject: 'Complexité', value: lead.score_complexite || 0, fullMark: 100 },
    { subject: 'Potentiel', value: lead.score_potentiel || 0, fullMark: 100 }
  ] : []

  // Count quiz responses
  const countResponses = (lead) => {
    if (!lead) return { oui: 0, non: 0, partiellement: 0 }

    let oui = 0, non = 0, partiellement = 0

    Object.keys(QUIZ_QUESTIONS).forEach(key => {
      const value = lead[key]?.toLowerCase()
      if (value === 'oui') oui++
      else if (value === 'non') non++
      else if (value === 'partiellement') partiellement++
    })

    return { oui, non, partiellement }
  }

  const responseCounts = countResponses(lead)
  const globalScore = calculateGlobalScore(lead)
  const isAnalysed = lead?.analysed_at || lead?.score_urgence !== null
  const age = lead?.annee_naissance ? new Date().getFullYear() - lead.annee_naissance : null

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="glass-card p-6">
          <div className="skeleton h-8 w-48 mb-4" />
          <div className="skeleton h-40 w-full mb-4" />
          <div className="skeleton h-20 w-full" />
        </div>
      </div>
    )
  }

  if (error || !lead) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="glass-card p-12 text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Lead non trouvé</h2>
          <p className="text-gray-dark mb-6">{error || 'Ce lead n\'existe pas ou a été supprimé'}</p>
          <Link
            to="/leads"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-auprea-gold text-auprea-navy-dark font-medium hover:bg-auprea-gold-light transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour aux leads
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Back button */}
      <Link
        to="/leads"
        className="inline-flex items-center gap-2 text-gray-dark hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour aux leads
      </Link>

      {/* Identity card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 mb-6"
      >
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-auprea-gold/20 rounded-xl border border-auprea-gold/30">
              <User className="w-8 h-8 text-auprea-gold" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-white">
                  {lead.prenom} {lead.nom || ''}
                </h1>
                {lead.profil_psychologique && (
                  <span className="text-2xl" title={lead.profil_psychologique}>
                    {lead.profil_psychologique.match(/[\u{1F300}-\u{1FAFF}]/gu)?.[0] || ''}
                  </span>
                )}
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-dark">
                  <Mail className="w-4 h-4" />
                  <span>{lead.email || 'Non renseigné'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-dark">
                  <Phone className="w-4 h-4" />
                  <span>{lead.telephone || 'Non renseigné'}</span>
                </div>
                {age && (
                  <div className="flex items-center gap-2 text-gray-dark">
                    <Calendar className="w-4 h-4" />
                    <span>Né en {lead.annee_naissance} ({age} ans)</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-3">
            {/* Status */}
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${
              isAnalysed
                ? 'bg-auprea-success/20 text-auprea-success'
                : 'bg-auprea-warning/20 text-auprea-warning'
            }`}>
              {isAnalysed ? 'Analysé' : 'En attente d\'analyse'}
            </span>

            {/* Accompaniment */}
            <div className="flex items-center gap-2">
              {lead.accompagnement_souhaite?.includes('Coordinateur') && (
                <Crown className="w-4 h-4 text-auprea-gold" />
              )}
              <span className={`text-sm ${
                lead.accompagnement_souhaite?.includes('Coordinateur')
                  ? 'text-auprea-gold font-medium'
                  : 'text-gray-dark'
              }`}>
                {lead.accompagnement_souhaite || 'Non renseigné'}
              </span>
            </div>

            {/* Dates */}
            <div className="text-xs text-gray-dark text-right">
              <div>Inscrit le {new Date(lead.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
              {lead.analysed_at && (
                <div>Analysé le {new Date(lead.analysed_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
              )}
            </div>
          </div>
        </div>

        {/* Profile info */}
        {lead.profil_psychologique && (
          <div className="mt-6 pt-6 border-t border-white/10">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-400" />
              <span className="text-white font-medium">Profil : {lead.profil_psychologique}</span>
            </div>
          </div>
        )}
      </motion.div>

      {/* Scores section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6 mb-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <Target className="w-5 h-5 text-auprea-gold" />
          <h2 className="text-lg font-semibold text-white">Scores</h2>
        </div>

        {isAnalysed ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Radar chart */}
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                  />
                  <PolarRadiusAxis
                    angle={30}
                    domain={[0, 100]}
                    tick={{ fill: '#64748b', fontSize: 10 }}
                  />
                  <Radar
                    name="Score"
                    dataKey="value"
                    stroke="#D4AF37"
                    fill="#D4AF37"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 30, 51, 0.95)',
                      border: '1px solid rgba(212, 175, 55, 0.3)',
                      borderRadius: '12px'
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Score details */}
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <ScoreGauge
                  value={lead.score_urgence}
                  label="Urgence"
                  color="text-red-400"
                  icon={Zap}
                />
                <ScoreGauge
                  value={lead.score_complexite}
                  label="Complexité"
                  color="text-blue-400"
                  icon={Brain}
                />
                <ScoreGauge
                  value={lead.score_potentiel}
                  label="Potentiel"
                  color="text-green-400"
                  icon={TrendingUp}
                />
                <ScoreGauge
                  value={globalScore}
                  label="Score Global"
                  color="text-auprea-gold"
                  icon={Target}
                />
              </div>

              {/* Score formula */}
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-xs text-gray-dark mb-2">Calcul du score global :</p>
                <p className="text-sm text-white font-mono">
                  ({lead.score_urgence} × 0.4) + ({lead.score_potentiel} × 0.35) + ({lead.score_complexite} × 0.25) = <span className="text-auprea-gold font-bold">{globalScore}</span>
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-gray-dark mx-auto mb-4 opacity-50" />
            <p className="text-gray-dark">Scores en attente d'analyse par Tristan</p>
          </div>
        )}
      </motion.div>

      {/* Quiz responses */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-6 mb-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-auprea-info" />
            <h2 className="text-lg font-semibold text-white">Réponses au quiz</h2>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-auprea-success">{responseCounts.oui} Oui</span>
            <span className="text-red-400">{responseCounts.non} Non</span>
            <span className="text-auprea-warning">{responseCounts.partiellement} Partiellement</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(QUIZ_QUESTIONS).map(([key, label]) => (
            <div
              key={key}
              className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
            >
              <span className="text-sm text-gray-dark">{label}</span>
              <ResponseBadge value={lead[key]} />
            </div>
          ))}
        </div>
      </motion.div>

      {/* Brief d'approche */}
      {lead.brief_approche && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6 mb-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <MessageSquare className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-semibold text-white">Brief d'approche</h2>
          </div>
          <div className="prose prose-invert prose-sm max-w-none">
            <p className="text-white whitespace-pre-wrap">{lead.brief_approche}</p>
          </div>
        </motion.div>
      )}

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card p-6"
      >
        <h2 className="text-lg font-semibold text-white mb-4">Actions</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(`/chat?message=Parlons du lead ${lead.prenom} ${lead.nom || ''} (ID: ${lead.id})`)}
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 border border-white/10 text-gray-dark hover:text-white hover:bg-white/10 transition-colors"
          >
            <MessageSquare className="w-6 h-6" />
            <span className="text-sm">Discuter avec Tristan</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(`/chat?message=Génère la fiche de préparation RDV pour ${lead.prenom} ${lead.nom || ''} (ID: ${lead.id})`)}
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 border border-white/10 text-gray-dark hover:text-white hover:bg-white/10 transition-colors"
          >
            <FileText className="w-6 h-6" />
            <span className="text-sm">Générer fiche RDV</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(`/chat?message=Re-analyse le lead ${lead.prenom} ${lead.nom || ''} (ID: ${lead.id}) et mets à jour ses scores`)}
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 border border-white/10 text-gray-dark hover:text-white hover:bg-white/10 transition-colors"
          >
            <RefreshCw className="w-6 h-6" />
            <span className="text-sm">Re-analyser</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              // Generate simple PDF/print view
              window.print()
            }}
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-auprea-gold/10 border border-auprea-gold/30 text-auprea-gold hover:bg-auprea-gold/20 transition-colors"
          >
            <Download className="w-6 h-6" />
            <span className="text-sm">Exporter PDF</span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}
