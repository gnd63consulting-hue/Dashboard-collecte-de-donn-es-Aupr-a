import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send,
  Paperclip,
  Plus,
  Sparkles,
  Zap,
  AlertCircle,
  BarChart3,
  Users
} from 'lucide-react'

// ─── API & Session ──────────────────────────────────────────
const N8N_AGENT_WEBHOOK = import.meta.env.VITE_N8N_AGENT_WEBHOOK || 'https://n8n.srv989411.hstgr.cloud/webhook/auprea-agent-chat/chat'

function generateSessionId() {
  return `charles-session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

function getSessionId() {
  let sessionId = localStorage.getItem('tristan_session_id')
  if (!sessionId) {
    sessionId = generateSessionId()
    localStorage.setItem('tristan_session_id', sessionId)
  }
  return sessionId
}

function resetSessionId() {
  const newSessionId = generateSessionId()
  localStorage.setItem('tristan_session_id', newSessionId)
  return newSessionId
}

// ─── Ambient Orbs ───────────────────────────────────────────
function AmbientOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      <div
        className="absolute rounded-full"
        style={{
          width: 500, height: 500,
          background: 'radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 70%)',
          top: '-10%', right: '-10%',
          animation: 'chat-float1 20s ease-in-out infinite',
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          width: 400, height: 400,
          background: 'radial-gradient(circle, rgba(59,130,246,0.04) 0%, transparent 70%)',
          bottom: '10%', left: '-5%',
          animation: 'chat-float2 25s ease-in-out infinite',
        }}
      />
    </div>
  )
}

// ─── Noise Overlay ──────────────────────────────────────────
function NoiseOverlay() {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        zIndex: 1,
        opacity: 0.015,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundSize: '128px 128px',
      }}
    />
  )
}

// ─── Tristan Avatar ─────────────────────────────────────────
function TristanAvatar({ size = 36, showRing = false, showOnline = false }) {
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <div
        className="flex items-center justify-center rounded-full"
        style={{
          width: size, height: size,
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          boxShadow: '0 0 20px rgba(245,158,11,0.25), inset 0 1px 1px rgba(255,255,255,0.2)',
          color: '#1a1a2e',
          fontWeight: 700,
          fontSize: size * 0.44,
        }}
      >
        <Sparkles style={{ width: size * 0.42, height: size * 0.42 }} />
      </div>
      {showRing && (
        <div
          className="absolute rounded-full"
          style={{
            inset: -3,
            border: '2px solid rgba(245,158,11,0.3)',
            animation: 'chat-pulse-ring 3s ease-in-out infinite',
          }}
        />
      )}
      {showOnline && (
        <div
          className="absolute"
          style={{
            bottom: 0, right: 0,
            width: 12, height: 12,
            borderRadius: '50%',
            background: '#22c55e',
            border: '2px solid #080d1a',
            boxShadow: '0 0 8px rgba(34,197,94,0.4)',
          }}
        />
      )}
    </div>
  )
}

// ─── Typing Indicator ───────────────────────────────────────
function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="flex items-start gap-3"
      style={{ padding: '4px 0' }}
    >
      <TristanAvatar size={36} />
      <div
        className="flex items-center gap-1.5"
        style={{
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '4px 18px 18px 18px',
          padding: '14px 20px',
        }}
      >
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="rounded-full"
            style={{
              width: 8, height: 8,
              background: 'rgba(245,158,11,0.6)',
              animation: `chat-typing-dot 1.4s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>
    </motion.div>
  )
}

// ─── Markdown renderer (bold + newlines) ────────────────────
function renderMarkdown(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} style={{ color: '#f5f5f5', fontWeight: 600 }}>
          {part.slice(2, -2)}
        </strong>
      )
    }
    return part.split('\n').map((line, j) => (
      <span key={`${i}-${j}`}>
        {j > 0 && <br />}
        {line}
      </span>
    ))
  })
}

// ─── Message Bubble ─────────────────────────────────────────
function MessageBubble({ message, onAction }) {
  const isBot = message.role === 'assistant'

  const formatTime = (timestamp) => {
    if (timestamp instanceof Date) {
      return timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    }
    return timestamp || ''
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={`flex items-start gap-3 ${isBot ? '' : 'flex-row-reverse'}`}
      style={{ maxWidth: '100%' }}
    >
      {isBot && <TristanAvatar size={36} />}

      <div className="flex flex-col gap-2" style={{ maxWidth: '75%' }}>
        {/* Bubble */}
        <div
          className="relative overflow-hidden"
          style={{
            padding: '14px 18px',
            borderRadius: isBot ? '4px 18px 18px 18px' : '18px 4px 18px 18px',
            background: isBot
              ? 'rgba(255,255,255,0.04)'
              : 'linear-gradient(135deg, rgba(245,158,11,0.15) 0%, rgba(217,119,6,0.1) 100%)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: isBot
              ? '1px solid rgba(255,255,255,0.06)'
              : '1px solid rgba(245,158,11,0.2)',
            color: isBot ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.9)',
            fontSize: 14,
            lineHeight: 1.7,
            fontFamily: "'DM Sans', sans-serif",
            letterSpacing: '0.01em',
          }}
        >
          {/* Shine line on bot messages */}
          {isBot && (
            <div
              className="absolute top-0 left-0 right-0"
              style={{
                height: 1,
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)',
              }}
            />
          )}
          {renderMarkdown(message.content)}
        </div>

        {/* Sources */}
        {message.sources && message.sources.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {message.sources.map((src, i) => (
              <span
                key={i}
                style={{
                  fontSize: 11,
                  color: 'rgba(245,158,11,0.6)',
                  background: 'rgba(245,158,11,0.06)',
                  border: '1px solid rgba(245,158,11,0.1)',
                  borderRadius: 20,
                  padding: '3px 10px',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                📋 {src}
              </span>
            ))}
          </div>
        )}

        {/* Action buttons */}
        {message.actions && message.actions.length > 0 && (
          <div className="flex flex-wrap gap-2" style={{ marginTop: 2 }}>
            {message.actions.map((action, i) => (
              <button
                key={i}
                onClick={() => onAction?.(action)}
                className="transition-all duration-300 hover:-translate-y-px"
                style={{
                  fontSize: 13,
                  color: 'rgba(245,158,11,0.9)',
                  background: 'rgba(245,158,11,0.08)',
                  border: '1px solid rgba(245,158,11,0.15)',
                  borderRadius: 24,
                  padding: '8px 16px',
                  cursor: 'pointer',
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 500,
                  letterSpacing: '0.01em',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(245,158,11,0.15)'
                  e.currentTarget.style.borderColor = 'rgba(245,158,11,0.3)'
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(245,158,11,0.15)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(245,158,11,0.08)'
                  e.currentTarget.style.borderColor = 'rgba(245,158,11,0.15)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                {action}
              </button>
            ))}
          </div>
        )}

        {/* Timestamp */}
        <span
          style={{
            fontSize: 11,
            color: 'rgba(255,255,255,0.25)',
            fontFamily: "'DM Sans', sans-serif",
            alignSelf: isBot ? 'flex-start' : 'flex-end',
            marginTop: -2,
          }}
        >
          {formatTime(message.timestamp)}
        </span>
      </div>
    </motion.div>
  )
}

// ─── Date Separator ─────────────────────────────────────────
function DateSeparator({ label = "Aujourd'hui" }) {
  return (
    <div className="flex items-center gap-4 my-2">
      <div className="flex-1" style={{ height: 1, background: 'rgba(255,255,255,0.04)' }} />
      <span
        style={{
          fontSize: 11,
          color: 'rgba(255,255,255,0.2)',
          fontFamily: "'DM Sans', sans-serif",
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          fontWeight: 500,
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </span>
      <div className="flex-1" style={{ height: 1, background: 'rgba(255,255,255,0.04)' }} />
    </div>
  )
}

// ─── Quick Suggestion Chips ─────────────────────────────────
function SuggestionChips({ suggestions, onSelect, disabled }) {
  return (
    <div className="flex flex-wrap gap-2 justify-center px-4">
      {suggestions.map((s, i) => (
        <button
          key={i}
          onClick={() => !disabled && onSelect(s.text)}
          disabled={disabled}
          className="flex items-center gap-1.5 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            fontSize: 13,
            color: 'rgba(255,255,255,0.5)',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 24,
            padding: '8px 14px',
            cursor: disabled ? 'not-allowed' : 'pointer',
            fontFamily: "'DM Sans', sans-serif",
            animation: `chat-fade-in-chip 0.4s ease ${i * 0.08}s both`,
          }}
          onMouseEnter={e => {
            if (disabled) return
            e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'
            e.currentTarget.style.color = 'rgba(255,255,255,0.8)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
            e.currentTarget.style.color = 'rgba(255,255,255,0.5)'
          }}
        >
          <s.icon className="w-4 h-4" />
          <span>{s.label}</span>
        </button>
      ))}
    </div>
  )
}

// ─── Chat Input ─────────────────────────────────────────────
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

  const hasText = message.trim().length > 0

  return (
    <form onSubmit={handleSubmit}>
      <div
        className="flex items-center gap-3"
        style={{
          background: 'rgba(255,255,255,0.03)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 16,
          padding: '4px 4px 4px 18px',
          boxShadow: '0 4px 30px rgba(0,0,0,0.2)',
        }}
      >
        {/* Attachment */}
        <button
          type="button"
          onClick={onFileUpload}
          disabled={disabled}
          className="transition-colors duration-200 disabled:opacity-40"
          style={{
            background: 'none', border: 'none',
            color: 'rgba(255,255,255,0.25)',
            cursor: disabled ? 'not-allowed' : 'pointer',
            padding: 4, lineHeight: 1,
          }}
          onMouseEnter={e => { if (!disabled) e.currentTarget.style.color = 'rgba(255,255,255,0.6)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.25)' }}
        >
          <Paperclip className="w-5 h-5" />
        </button>

        {/* Input */}
        <input
          ref={inputRef}
          value={message}
          onChange={e => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Posez votre question à Tristan..."
          disabled={disabled}
          className="flex-1 bg-transparent border-none outline-none disabled:opacity-50"
          style={{
            color: 'rgba(255,255,255,0.85)',
            fontSize: 14,
            fontFamily: "'DM Sans', sans-serif",
            letterSpacing: '0.01em',
            padding: '12px 0',
          }}
        />

        {/* Send button */}
        <button
          type="submit"
          disabled={disabled || !hasText}
          className="flex items-center justify-center flex-shrink-0 disabled:cursor-not-allowed"
          style={{
            width: 44, height: 44,
            borderRadius: 12,
            background: hasText
              ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
              : 'rgba(255,255,255,0.04)',
            border: 'none',
            cursor: (disabled || !hasText) ? 'default' : 'pointer',
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            boxShadow: hasText ? '0 4px 20px rgba(245,158,11,0.3)' : 'none',
            transform: hasText ? 'scale(1)' : 'scale(0.95)',
          }}
        >
          <Send
            className="w-[18px] h-[18px]"
            style={{
              color: hasText ? '#1a1a2e' : 'rgba(255,255,255,0.2)',
              transition: 'color 0.3s',
              marginLeft: 1,
            }}
          />
        </button>
      </div>

      {/* Footer */}
      <p
        className="text-center"
        style={{
          fontSize: 10,
          color: 'rgba(255,255,255,0.12)',
          marginTop: 10,
          fontFamily: "'DM Sans', sans-serif",
          letterSpacing: '0.04em',
        }}
      >
        Propulsé par AUPREA × GND Consulting
      </p>
    </form>
  )
}

// ─── Main Chat Page ─────────────────────────────────────────
export default function ChatPage() {
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [sessionId, setSessionId] = useState(getSessionId())
  const messagesEndRef = useRef(null)

  // Quick suggestions
  const suggestions = [
    { icon: Zap, label: 'Analyse leads non analysés', text: 'Analyse les leads non analysés' },
    { icon: AlertCircle, label: 'Leads urgents', text: 'Montre-moi les leads urgents (score urgence >= 70)' },
    { icon: BarChart3, label: 'Rapport hebdo', text: 'Génère le rapport hebdomadaire' },
    { icon: Users, label: 'Leads haut potentiel', text: 'Montre-moi les leads à haut potentiel (score potentiel >= 70)' },
  ]

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  // Initial greeting
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: 'greeting',
        role: 'assistant',
        content: `Salut Charles ! Je suis Tristan, ton co-pilote pour la gestion des leads succession.\n\nJe peux t'aider à :\n- Analyser les leads non analysés (calcul des scores, profils psychologiques)\n- Identifier les leads urgents ou à haut potentiel\n- Générer des fiches de préparation RDV\n- Créer des rapports hebdomadaires/mensuels\n- Rechercher des infos juridiques dans la base de connaissances\n\nQue veux-tu faire aujourd'hui ?`,
        timestamp: new Date(),
        actions: ['Analyser mes leads', 'Rapport hebdomadaire', 'Base de connaissances'],
      }])
    }
  }, [])

  // Send message to Tristan
  const sendMessage = useCallback(async (content) => {
    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(N8N_AGENT_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sendMessage',
          chatInput: content,
          sessionId: sessionId,
        }),
      })

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }

      const data = await response.json()

      const assistantMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.output || data.response || data.text || "Je n'ai pas pu traiter ta demande. Réessaie.",
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, assistantMessage])
    } catch (err) {
      console.error('Error sending message:', err)
      setError(err.message)

      const errorMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `Désolé, je n'ai pas pu traiter ta demande. Erreur : ${err.message}\n\nVérifie que le serveur N8N est accessible ou réessaie dans quelques instants.`,
        timestamp: new Date(),
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
      content: 'Nouvelle conversation ! Comment puis-je t\'aider ?',
      timestamp: new Date(),
    }])
    setError(null)
  }

  // File upload placeholder
  const handleFileUpload = () => {
    alert("Fonctionnalité d'upload de fichier à venir. Pour l'instant, copie-colle le contenu de ton document dans le chat.")
  }

  return (
    <div
      className="relative flex flex-col overflow-hidden"
      style={{
        height: '100vh',
        background: '#080d1a',
        fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* Background layers */}
      <AmbientOrbs />
      <NoiseOverlay />

      {/* ─── HEADER ─── */}
      <div
        className="flex items-center justify-between flex-shrink-0 relative"
        style={{
          padding: '16px 24px',
          borderBottom: '1px solid rgba(255,255,255,0.04)',
          background: 'rgba(8,13,26,0.8)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          zIndex: 10,
        }}
      >
        <div className="flex items-center gap-3.5">
          <TristanAvatar size={42} showRing showOnline />
          <div>
            <div
              className="flex items-center gap-2"
              style={{
                fontSize: 17, fontWeight: 600,
                color: 'rgba(255,255,255,0.95)',
                letterSpacing: '-0.01em',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Tristan
              <span
                style={{
                  fontSize: 10, fontWeight: 500,
                  color: 'rgba(245,158,11,0.8)',
                  background: 'rgba(245,158,11,0.1)',
                  border: '1px solid rgba(245,158,11,0.15)',
                  borderRadius: 20,
                  padding: '2px 8px',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                }}
              >
                IA
              </span>
            </div>
            <div
              className="flex items-center gap-1.5"
              style={{
                fontSize: 12,
                color: 'rgba(255,255,255,0.35)',
                fontFamily: "'DM Sans', sans-serif",
                marginTop: 1,
              }}
            >
              <span
                className="inline-block rounded-full"
                style={{
                  width: 6, height: 6,
                  background: '#22c55e',
                  boxShadow: '0 0 6px rgba(34,197,94,0.4)',
                }}
              />
              Co-Pilote Succession connecté
            </div>
          </div>
        </div>

        <button
          onClick={handleNewChat}
          className="flex items-center gap-1.5 transition-all duration-200"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 12,
            padding: '8px 16px',
            color: 'rgba(255,255,255,0.5)',
            fontSize: 13,
            cursor: 'pointer',
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 500,
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
            e.currentTarget.style.color = 'rgba(255,255,255,0.8)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
            e.currentTarget.style.color = 'rgba(255,255,255,0.5)'
          }}
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Nouveau chat</span>
        </button>
      </div>

      {/* ─── MESSAGES AREA ─── */}
      <div
        className="flex-1 overflow-y-auto chat-messages relative"
        style={{ padding: '24px 24px 12px', zIndex: 2 }}
      >
        <div className="max-w-3xl mx-auto flex flex-col gap-5">
          <DateSeparator />

          {messages.map(msg => (
            <MessageBubble
              key={msg.id}
              message={msg}
              onAction={sendMessage}
            />
          ))}

          <AnimatePresence>
            {isLoading && <TypingIndicator />}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* ─── SUGGESTIONS ─── */}
      <div
        className="flex-shrink-0 relative"
        style={{
          padding: '12px 0',
          borderTop: '1px solid rgba(255,255,255,0.03)',
          zIndex: 2,
        }}
      >
        <div
          className="flex items-center justify-center gap-1.5 text-center"
          style={{
            fontSize: 11,
            color: 'rgba(255,255,255,0.2)',
            marginBottom: 10,
            fontFamily: "'DM Sans', sans-serif",
            letterSpacing: '0.05em',
          }}
        >
          <span style={{ color: 'rgba(245,158,11,0.5)' }}>✦</span>
          Suggestions rapides
        </div>
        <SuggestionChips
          suggestions={suggestions}
          onSelect={sendMessage}
          disabled={isLoading}
        />
      </div>

      {/* ─── INPUT AREA ─── */}
      <div
        className="flex-shrink-0 relative"
        style={{ padding: '16px 24px 20px', zIndex: 2 }}
      >
        <div className="max-w-3xl mx-auto">
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
