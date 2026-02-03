import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageSquare,
  Send,
  Paperclip,
  RefreshCw,
  Bot,
  User,
  Sparkles,
  Loader2,
  AlertCircle,
  Zap,
  FileText,
  BarChart3,
  Users
} from 'lucide-react'

// N8N webhook URL for Tristan agent
const N8N_AGENT_WEBHOOK = import.meta.env.VITE_N8N_AGENT_WEBHOOK || 'https://n8n.srv989411.hstgr.cloud/webhook/auprea-agent-chat'

// Generate unique session ID
function generateSessionId() {
  return `charles-session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

// Get or create session ID
function getSessionId() {
  let sessionId = localStorage.getItem('tristan_session_id')
  if (!sessionId) {
    sessionId = generateSessionId()
    localStorage.setItem('tristan_session_id', sessionId)
  }
  return sessionId
}

// Reset session ID
function resetSessionId() {
  const newSessionId = generateSessionId()
  localStorage.setItem('tristan_session_id', newSessionId)
  return newSessionId
}

// Message bubble component
function MessageBubble({ message, isLast }) {
  const isUser = message.role === 'user'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      {/* Avatar */}
      <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
        isUser
          ? 'bg-auprea-gold/20 border border-auprea-gold/30'
          : 'bg-auprea-info/20 border border-auprea-info/30'
      }`}>
        {isUser ? (
          <User className="w-5 h-5 text-auprea-gold" />
        ) : (
          <Bot className="w-5 h-5 text-auprea-info" />
        )}
      </div>

      {/* Message content */}
      <div className={`flex-1 max-w-[80%] ${isUser ? 'text-right' : ''}`}>
        <div className={`inline-block p-4 rounded-2xl ${
          isUser
            ? 'bg-auprea-gold/10 border border-auprea-gold/20 text-white'
            : 'bg-white/5 border border-white/10 text-white'
        }`}>
          {/* Message content with markdown-like rendering */}
          <div className="text-sm whitespace-pre-wrap leading-relaxed prose prose-invert prose-sm max-w-none">
            {message.content}
          </div>

          {/* Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-2 pt-2 border-t border-white/10">
              {message.attachments.map((attachment, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-gray-dark">
                  <FileText className="w-3 h-3" />
                  <span>{attachment}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Timestamp */}
        <p className={`text-xs text-gray-dark mt-1 ${isUser ? 'text-right' : ''}`}>
          {message.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </motion.div>
  )
}

// Loading indicator for Tristan thinking
function ThinkingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex gap-3"
    >
      <div className="w-10 h-10 rounded-xl bg-auprea-info/20 border border-auprea-info/30 flex items-center justify-center">
        <Bot className="w-5 h-5 text-auprea-info" />
      </div>
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 text-auprea-info animate-spin" />
          <span className="text-sm text-gray-dark">Tristan réfléchit...</span>
        </div>
      </div>
    </motion.div>
  )
}

// Quick suggestion chips
function SuggestionChips({ suggestions, onSelect, disabled }) {
  return (
    <div className="flex flex-wrap gap-2">
      {suggestions.map((suggestion, index) => (
        <motion.button
          key={index}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect(suggestion.text)}
          disabled={disabled}
          className={`
            flex items-center gap-2 px-3 py-2 rounded-xl text-sm
            bg-white/5 border border-white/10 text-gray-dark
            hover:bg-auprea-gold/10 hover:border-auprea-gold/30 hover:text-auprea-gold
            transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          <suggestion.icon className="w-4 h-4" />
          <span>{suggestion.label}</span>
        </motion.button>
      ))}
    </div>
  )
}

// Chat input component
function ChatInput({ onSend, disabled, onFileUpload }) {
  const [message, setMessage] = useState('')
  const inputRef = useRef(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (message.trim() && !disabled) {
      onSend(message.trim())
      setMessage('')
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-3">
      {/* File upload button */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onFileUpload}
        disabled={disabled}
        className="p-3 rounded-xl bg-white/5 border border-white/10 text-gray-dark hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
      >
        <Paperclip className="w-5 h-5" />
      </motion.button>

      {/* Input field */}
      <div className="flex-1 relative">
        <textarea
          ref={inputRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Tapez votre message..."
          disabled={disabled}
          rows={1}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-dark resize-none focus:border-auprea-gold/50 focus:outline-none transition-colors disabled:opacity-50"
          style={{ minHeight: '48px', maxHeight: '120px' }}
        />
      </div>

      {/* Send button */}
      <motion.button
        type="submit"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        disabled={disabled || !message.trim()}
        className="p-3 rounded-xl bg-auprea-gold text-auprea-navy-dark hover:bg-auprea-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Send className="w-5 h-5" />
      </motion.button>
    </form>
  )
}

export default function ChatPage() {
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [sessionId, setSessionId] = useState(getSessionId())
  const messagesEndRef = useRef(null)

  // Quick suggestions
  const suggestions = [
    { icon: Zap, label: 'Analyse les leads non analysés', text: 'Analyse les leads non analysés' },
    { icon: AlertCircle, label: 'Leads urgents', text: 'Montre-moi les leads urgents (score urgence >= 70)' },
    { icon: BarChart3, label: 'Rapport hebdo', text: 'Génère le rapport hebdomadaire' },
    { icon: Users, label: 'Leads haut potentiel', text: 'Montre-moi les leads à haut potentiel (score potentiel >= 70)' }
  ]

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Add initial greeting
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: 'greeting',
        role: 'assistant',
        content: `Salut Charles ! Je suis Tristan, ton co-pilote pour la gestion des leads succession.

Je peux t'aider à :
- Analyser les leads non analysés (calcul des scores, profils psychologiques)
- Identifier les leads urgents ou à haut potentiel
- Générer des fiches de préparation RDV
- Créer des rapports hebdomadaires/mensuels
- Rechercher des infos juridiques dans la base de connaissances

Que veux-tu faire aujourd'hui ?`,
        timestamp: new Date()
      }])
    }
  }, [])

  // Send message to Tristan
  const sendMessage = useCallback(async (content) => {
    // Add user message
    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(N8N_AGENT_WEBHOOK, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          chatInput: content,
          sessionId: sessionId
        })
      })

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }

      const data = await response.json()

      // Add assistant response
      const assistantMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.output || data.response || data.text || 'Je n\'ai pas pu traiter ta demande. Réessaie.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, assistantMessage])
    } catch (err) {
      console.error('Error sending message:', err)
      setError(err.message)

      // Add error message
      const errorMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `Désolé, je n'ai pas pu traiter ta demande. Erreur : ${err.message}

Vérifie que le serveur N8N est accessible ou réessaie dans quelques instants.`,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }, [sessionId])

  // New chat
  const handleNewChat = () => {
    const newSessionId = resetSessionId()
    setSessionId(newSessionId)
    setMessages([{
      id: 'greeting-new',
      role: 'assistant',
      content: `Nouvelle conversation ! Comment puis-je t'aider ?`,
      timestamp: new Date()
    }])
    setError(null)
  }

  // File upload (placeholder)
  const handleFileUpload = () => {
    alert('Fonctionnalité d\'upload de fichier à venir. Pour l\'instant, copie-colle le contenu de ton document dans le chat.')
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-white/10 bg-gradient-to-r from-auprea-navy-dark to-auprea-navy">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-auprea-info/20 rounded-xl border border-auprea-info/30">
              <MessageSquare className="w-6 h-6 text-auprea-info" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-white">Chat avec Tristan</h1>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-auprea-success animate-pulse" />
                <span className="text-sm text-gray-dark">Co-Pilote Succession connecté</span>
              </div>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleNewChat}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-dark hover:text-white hover:bg-white/10 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="text-sm">Nouveau chat</span>
          </motion.button>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((message, index) => (
            <MessageBubble
              key={message.id}
              message={message}
              isLast={index === messages.length - 1}
            />
          ))}

          {/* Loading indicator */}
          <AnimatePresence>
            {isLoading && <ThinkingIndicator />}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area */}
      <div className="flex-shrink-0 px-6 py-4 border-t border-white/10 bg-gradient-to-r from-auprea-navy-dark to-auprea-navy">
        <div className="max-w-4xl mx-auto space-y-4">
          {/* Quick suggestions */}
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-auprea-gold" />
            <span className="text-sm text-gray-dark">Suggestions rapides :</span>
          </div>
          <SuggestionChips
            suggestions={suggestions}
            onSelect={sendMessage}
            disabled={isLoading}
          />

          {/* Input */}
          <ChatInput
            onSend={sendMessage}
            disabled={isLoading}
            onFileUpload={handleFileUpload}
          />
        </div>
      </div>
    </div>
  )
}
