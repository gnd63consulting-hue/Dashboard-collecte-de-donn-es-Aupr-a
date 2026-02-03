import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen,
  Upload,
  FileText,
  Trash2,
  Search,
  ChevronDown,
  ExternalLink,
  Loader2,
  CheckCircle,
  AlertCircle,
  Database,
  Clock,
  Tag
} from 'lucide-react'

import { supabase } from '../lib/supabase'

// N8N webhook URL for RAG ingestion
const N8N_RAG_WEBHOOK = import.meta.env.VITE_N8N_RAG_WEBHOOK || 'https://n8n.srv989411.hstgr.cloud/webhook/auprea-rag-ingest'

// Categories
const CATEGORIES = [
  { value: 'Juridique', label: 'Juridique', description: 'Succession, testament, donation' },
  { value: 'Fiscal', label: 'Fiscal', description: 'Droits de succession, abattements' },
  { value: 'Outre-mer', label: 'Outre-mer', description: 'Loi Letchimy, indivision' },
  { value: 'Produits AUPREA', label: 'Produits AUPREA', description: 'Carnet inventaire, offres' },
  { value: 'Assurance vie', label: 'Assurance vie', description: 'Contrats, clauses' },
  { value: 'Immobilier', label: 'Immobilier', description: 'Patrimoine immobilier' },
  { value: 'Entreprise', label: 'Entreprise', description: 'Transmission entreprise' },
  { value: 'Autre', label: 'Autre', description: 'Autres documents' }
]

// Document card component
function DocumentCard({ document, onDelete, onView }) {
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Supprimer ce document de la base de connaissances ?')) return

    setDeleting(true)
    try {
      // Delete all chunks with this title
      const { error } = await supabase
        .from('knowledge_base')
        .delete()
        .eq('metadata->>title', document.title)

      if (error) throw error
      onDelete(document.title)
    } catch (err) {
      console.error('Error deleting document:', err)
      alert('Erreur lors de la suppression')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="glass-card p-4"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="p-2 bg-auprea-info/20 rounded-lg flex-shrink-0">
            <FileText className="w-5 h-5 text-auprea-info" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-medium truncate">{document.title}</h3>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-white/10 text-gray-dark">
                <Tag className="w-3 h-3" />
                {document.category}
              </span>
              <span className="text-xs text-gray-dark">
                {document.chunkCount} chunks
              </span>
            </div>
            {document.sourceUrl && (
              <a
                href={document.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-auprea-gold hover:underline mt-2"
              >
                <ExternalLink className="w-3 h-3" />
                Source
              </a>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDelete}
            disabled={deleting}
            className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50"
          >
            {deleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </motion.button>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-gray-dark">
        <span>Ingéré le {new Date(document.ingestedAt).toLocaleDateString('fr-FR')}</span>
        {document.sourceArticle && (
          <span>{document.sourceArticle}</span>
        )}
      </div>
    </motion.div>
  )
}

// Upload form component
function UploadForm({ onSuccess }) {
  const [content, setContent] = useState('')
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Juridique')
  const [sourceUrl, setSourceUrl] = useState('')
  const [sourceArticle, setSourceArticle] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!content.trim() || !title.trim()) {
      setError('Le titre et le contenu sont requis')
      return
    }

    setUploading(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch(N8N_RAG_WEBHOOK, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: content.trim(),
          title: title.trim(),
          category,
          source_url: sourceUrl.trim(),
          source_article: sourceArticle.trim()
        })
      })

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }

      const data = await response.json()
      console.log('Ingestion response:', data)

      setSuccess(true)
      setContent('')
      setTitle('')
      setSourceUrl('')
      setSourceArticle('')

      // Notify parent
      onSuccess()

      // Clear success message after 3s
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      console.error('Error ingesting document:', err)
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Read file content
    const reader = new FileReader()
    reader.onload = (event) => {
      setContent(event.target?.result || '')
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ''))
      }
    }
    reader.readAsText(file)
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-auprea-gold/20 rounded-lg">
          <Upload className="w-5 h-5 text-auprea-gold" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">Ingérer un nouveau document</h2>
          <p className="text-sm text-gray-dark">Ajoutez du contenu à la base de connaissances</p>
        </div>
      </div>

      {/* File upload zone */}
      <div className="mb-6">
        <label
          htmlFor="file-upload"
          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/20 rounded-xl hover:border-auprea-gold/50 transition-colors cursor-pointer bg-white/5"
        >
          <Upload className="w-8 h-8 text-gray-dark mb-2" />
          <span className="text-sm text-gray-dark">Cliquer pour sélectionner un fichier</span>
          <span className="text-xs text-gray-dark/70 mt-1">TXT, MD (ou collez le contenu ci-dessous)</span>
          <input
            id="file-upload"
            type="file"
            accept=".txt,.md,.text"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>

      {/* Form fields */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-dark mb-1">Titre *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Guide succession sans testament"
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-dark focus:border-auprea-gold/50 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-sm text-gray-dark mb-1">Catégorie *</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white appearance-none cursor-pointer focus:border-auprea-gold/50 focus:outline-none"
          >
            {CATEGORIES.map(cat => (
              <option key={cat.value} value={cat.value} className="bg-auprea-navy-dark">
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-dark mb-1">URL Source</label>
            <input
              type="url"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="https://www.service-public.fr/..."
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-dark focus:border-auprea-gold/50 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-dark mb-1">Article de loi</label>
            <input
              type="text"
              value={sourceArticle}
              onChange={(e) => setSourceArticle(e.target.value)}
              placeholder="Article 731 Code Civil"
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-dark focus:border-auprea-gold/50 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-dark mb-1">Contenu *</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Collez le contenu du document ici..."
            rows={8}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-dark resize-none focus:border-auprea-gold/50 focus:outline-none"
            required
          />
          <p className="text-xs text-gray-dark mt-1">
            {content.length} caractères
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Success message */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2 p-3 bg-auprea-success/10 border border-auprea-success/30 rounded-lg text-auprea-success"
            >
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">Document ingéré avec succès !</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit button */}
        <motion.button
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={uploading || !content.trim() || !title.trim()}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-auprea-gold text-auprea-navy-dark font-semibold hover:bg-auprea-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Ingestion en cours...
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              Ingérer dans la base
            </>
          )}
        </motion.button>
      </div>
    </form>
  )
}

export default function KnowledgeBasePage() {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')

  // Fetch documents
  const fetchDocuments = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('knowledge_base')
        .select('id, content, metadata, is_active')
        .eq('is_active', true)
        .order('id', { ascending: false })

      if (error) throw error

      // Group by title
      const groupedDocs = new Map()
      data?.forEach(item => {
        const title = item.metadata?.title || 'Sans titre'
        if (!groupedDocs.has(title)) {
          groupedDocs.set(title, {
            title,
            category: item.metadata?.category || 'Autre',
            sourceUrl: item.metadata?.source_url,
            sourceArticle: item.metadata?.source_article,
            chunkCount: 1,
            ingestedAt: item.metadata?.date_publication || new Date().toISOString()
          })
        } else {
          groupedDocs.get(title).chunkCount++
        }
      })

      setDocuments(Array.from(groupedDocs.values()))
    } catch (err) {
      console.error('Error fetching documents:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  // Handle document deletion
  const handleDelete = (title) => {
    setDocuments(docs => docs.filter(d => d.title !== title))
  }

  // Filter documents
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  // Count by category
  const categoryCounts = CATEGORIES.reduce((acc, cat) => {
    acc[cat.value] = documents.filter(d => d.category === cat.value).length
    return acc
  }, {})

  const totalChunks = documents.reduce((sum, d) => sum + d.chunkCount, 0)

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-auprea-gold/20 rounded-xl border border-auprea-gold/30">
          <BookOpen className="w-6 h-6 text-auprea-gold" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Base de connaissances</h1>
          <p className="text-sm text-gray-dark">Gérez les documents pour l'assistant Tristan</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload form */}
        <div className="lg:col-span-1">
          <UploadForm onSuccess={fetchDocuments} />

          {/* Stats */}
          <div className="glass-card p-4 mt-6">
            <div className="flex items-center gap-2 mb-4">
              <Database className="w-4 h-4 text-auprea-gold" />
              <span className="text-sm font-medium text-white">Statistiques KB</span>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-dark">Total documents</span>
                <span className="text-white font-mono">{documents.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-dark">Total chunks</span>
                <span className="text-white font-mono">{totalChunks}</span>
              </div>
              <div className="pt-3 border-t border-white/10">
                <p className="text-xs text-gray-dark mb-2">Par catégorie :</p>
                {CATEGORIES.map(cat => (
                  categoryCounts[cat.value] > 0 && (
                    <div key={cat.value} className="flex justify-between text-xs mb-1">
                      <span className="text-gray-dark">{cat.label}</span>
                      <span className="text-white">{categoryCounts[cat.value]}</span>
                    </div>
                  )
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Documents list */}
        <div className="lg:col-span-2">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-dark" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-dark focus:border-auprea-gold/50 focus:outline-none"
              />
            </div>
            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white appearance-none cursor-pointer focus:border-auprea-gold/50 focus:outline-none pr-10"
              >
                <option value="all" className="bg-auprea-navy-dark">Toutes catégories</option>
                {CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value} className="bg-auprea-navy-dark">
                    {cat.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-dark pointer-events-none" />
            </div>
          </div>

          {/* Documents */}
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="glass-card p-4">
                  <div className="skeleton h-6 w-48 mb-2" />
                  <div className="skeleton h-4 w-32" />
                </div>
              ))}
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <BookOpen className="w-12 h-12 text-gray-dark mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold text-white mb-2">Aucun document</h3>
              <p className="text-gray-dark">
                {searchTerm || categoryFilter !== 'all'
                  ? 'Aucun document ne correspond à vos critères'
                  : 'Commencez par ingérer votre premier document'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {filteredDocuments.map(doc => (
                  <DocumentCard
                    key={doc.title}
                    document={doc}
                    onDelete={handleDelete}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
