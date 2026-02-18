


'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { X, Send, Sparkles, Bot, Loader2, Wrench } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import api from '@/app/lib/apiClient'   // ← your existing apiClient

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface Message {
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
}

type SSEEvent =
    | { type: 'token';      content: string }
    | { type: 'tool_start'; tool: string }
    | { type: 'tool_end';   tool: string; result: unknown }
    | { type: 'done';       content?: string }   // content may be full history – never use for display
    | { type: 'error';      content: string }

// ─────────────────────────────────────────────────────────────────────────────
// Thread ID – one UUID per browser, persisted in localStorage
// ─────────────────────────────────────────────────────────────────────────────

function getOrCreateThreadId(): string {
    const key = 'chat_thread_id'
    const existing = localStorage.getItem(key)
    if (existing) return existing
    const id = crypto.randomUUID()
    localStorage.setItem(key, id)
    return id
}

// ─────────────────────────────────────────────────────────────────────────────
// Tool name → human readable label
// ─────────────────────────────────────────────────────────────────────────────

const TOOL_LABELS: Record<string, string> = {
    search_doctors:            'Searching doctors…',
    get_doctor_slots_for_date: 'Checking availability…',
    get_doctor_slots_range:    'Finding open dates…',
    direct_book_appointment:   'Booking appointment…',
    get_my_profile:            'Loading your profile…',
    update_user_profile:       'Updating profile…',
}
const toolLabel = (name: string) => TOOL_LABELS[name] ?? `Running ${name}…`

// ─────────────────────────────────────────────────────────────────────────────
// Markdown renderer – used for all assistant messages (history + streaming)
// ─────────────────────────────────────────────────────────────────────────────

function MarkdownRenderer({ content, isStreaming = false }: { content: string; isStreaming?: boolean }) {
    return (
        <div className="markdown-body text-sm leading-relaxed">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    // Paragraphs
                    p: ({ children }) => (
                        <p className="mb-2 last:mb-0">{children}</p>
                    ),
                    // Headings
                    h1: ({ children }) => <h1 className="text-base font-bold mt-3 mb-1">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-sm font-bold mt-3 mb-1">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-sm font-semibold mt-2 mb-1">{children}</h3>,
                    // Lists
                    ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-0.5">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-0.5">{children}</ol>,
                    li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                    // Inline code
                    code: ({ inline, children, ...props }: React.ComponentPropsWithoutRef<'code'> & { inline?: boolean }) =>
                        inline ? (
                            <code className="bg-gray-100 text-blue-700 px-1 py-0.5 rounded text-xs font-mono" {...props}>
                                {children}
                            </code>
                        ) : (
                            <code className="block bg-gray-100 text-gray-800 p-2 rounded-lg text-xs font-mono overflow-x-auto" {...props}>
                                {children}
                            </code>
                        ),
                    // Code blocks
                    pre: ({ children }) => (
                        <pre className="bg-gray-100 rounded-lg p-2 mb-2 overflow-x-auto text-xs">{children}</pre>
                    ),
                    // Bold / italic
                    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                    em: ({ children }) => <em className="italic">{children}</em>,
                    // Blockquote
                    blockquote: ({ children }) => (
                        <blockquote className="border-l-2 border-blue-300 pl-3 italic text-gray-600 my-2">{children}</blockquote>
                    ),
                    // Horizontal rule
                    hr: () => <hr className="border-gray-200 my-2" />,
                    // Tables (GFM)
                    table: ({ children }) => (
                        <div className="overflow-x-auto mb-2">
                            <table className="min-w-full text-xs border-collapse">{children}</table>
                        </div>
                    ),
                    thead: ({ children }) => <thead className="bg-gray-50">{children}</thead>,
                    tbody: ({ children }) => <tbody>{children}</tbody>,
                    tr: ({ children }) => <tr className="border-b border-gray-200">{children}</tr>,
                    th: ({ children }) => (
                        <th className="px-2 py-1.5 text-left font-semibold text-gray-700 border border-gray-200">{children}</th>
                    ),
                    td: ({ children }) => (
                        <td className="px-2 py-1.5 text-gray-700 border border-gray-200">{children}</td>
                    ),
                    // Links
                    a: ({ href, children }) => (
                        <a href={href} target="_blank" rel="noopener noreferrer"
                            className="text-blue-600 underline hover:text-blue-800">
                            {children}
                        </a>
                    ),
                }}
            >
                {content}
            </ReactMarkdown>
            {isStreaming && (
                <span className="inline-block w-2 h-4 bg-blue-600 ml-0.5 align-middle animate-pulse" />
            )}
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export default function AIChatbot() {
    const [isOpen,           setIsOpen]           = useState(false)
    const [messages,         setMessages]         = useState<Message[]>([])
    const [input,            setInput]            = useState('')
    const [isStreaming,      setIsStreaming]       = useState(false)
    const [streamingContent, setStreamingContent] = useState('')
    const [activeTool,       setActiveTool]       = useState<string | null>(null)
    const [historyLoading,   setHistoryLoading]   = useState(false)

    const messagesEndRef = useRef<HTMLDivElement>(null)
    const textareaRef    = useRef<HTMLTextAreaElement>(null)
    const threadIdRef    = useRef<string>('')

    // ── Init: get/create thread ID then fetch history from backend ───────────
    useEffect(() => {
        const threadId = getOrCreateThreadId()
        threadIdRef.current = threadId

        const loadHistory = async () => {
            setHistoryLoading(true)
            try {
                const token   = localStorage.getItem('access_token')
                const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL ?? ''
                const res     = await api.get(`chat/history/${threadId}`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                })
                const data: { thread_id: string; messages: { role: string; content: string }[] } = res.data

                // Map backend role names → UI roles, skip empty content
                const hydrated: Message[] = data.messages
                    .filter(m => m.content?.trim())
                    .map(m => ({
                        id:        crypto.randomUUID(),
                        role:      m.role === 'human' ? 'user' : 'assistant',
                        content:   m.content,
                        timestamp: new Date(),
                    }))

                setMessages(hydrated)
            } catch {
                // No history yet or auth error – start fresh silently
            } finally {
                setHistoryLoading(false)
            }
        }

        loadHistory()
    }, [])

    // Auto-scroll on new content
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, streamingContent])

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
        }
    }, [input])

    // ─────────────────────────────────────────────────────────────────────────
    // Core SSE streaming function
    // ─────────────────────────────────────────────────────────────────────────

    // Ref to track accumulated streamed content so it's always accessible in
    // async callbacks and the finally block without stale-closure issues.
    const finalContentRef = useRef('')

    const streamResponse = useCallback(async (userMessage: string) => {
        setIsStreaming(true)
        setStreamingContent('')
        setActiveTool(null)
        finalContentRef.current = ''

        const token   = localStorage.getItem('access_token')
        const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL ?? ''

        try {
            const response = await fetch(`${baseURL}chat/message`, {
                method:  'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept':       'text/event-stream',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    message:   userMessage,
                    thread_id: threadIdRef.current,
                }),
            })

            // Delegate 401 handling to apiClient's refresh logic
            if (response.status === 401) {
                try {
                    const res      = await api.post('/refresh-token')
                    const newToken = res.data.access_token
                    localStorage.setItem('access_token', newToken)
                    return streamResponse(userMessage)   // retry once
                } catch {
                    localStorage.removeItem('access_token')
                    window.location.replace('/login')
                    return
                }
            }

            if (!response.ok) throw new Error(`HTTP ${response.status}`)

            const reader  = response.body?.getReader()
            const decoder = new TextDecoder()
            let   buffer  = ''
            // doneEventFired tracks whether the backend sent an explicit 'done'
            // event so we can commit streamed content as a fallback if it didn't.
            let doneEventFired = false

            if (!reader) throw new Error('No response body')

            // ── SSE parse loop ─────────────────────────────────────────────
            while (true) {
                const { done, value } = await reader.read()
                if (done) break

                buffer += decoder.decode(value, { stream: true })

                // Events are delimited by \n\n
                const parts = buffer.split('\n\n')
                buffer = parts.pop() ?? ''      // keep incomplete tail

                for (const part of parts) {
                    const line = part.trim()
                    if (!line.startsWith('data: ')) continue

                    let event: SSEEvent
                    try { event = JSON.parse(line.slice(6)) }
                    catch { continue }

                    switch (event.type) {
                        case 'token':
                            finalContentRef.current += event.content
                            setStreamingContent(finalContentRef.current)
                            break

                        case 'tool_start':
                            setActiveTool(event.tool)
                            break

                        case 'tool_end':
                            setActiveTool(null)
                            break

                        case 'done': {
                            doneEventFired = true
                            // ALWAYS use token-built content from the stream.
                            // event.content from 'done' may contain the full
                            // conversation history from the backend – never use
                            // it for display to avoid message duplication/mixing.
                            const resolved = finalContentRef.current
                            if (resolved) {
                                setMessages(prev => [...prev, {
                                    id:        crypto.randomUUID(),
                                    role:      'assistant',
                                    content:   resolved,
                                    timestamp: new Date(),
                                }])
                            }
                            break
                        }

                        case 'error':
                            doneEventFired = true
                            setMessages(prev => [...prev, {
                                id:        crypto.randomUUID(),
                                role:      'assistant',
                                content:   event.content,
                                timestamp: new Date(),
                            }])
                            break
                    }
                }
            }

            // ── Fallback: stream ended without a 'done' event ──────────────
            // This handles cases where the connection drops or the backend
            // closes the stream without sending a final 'done' event, which
            // was causing messages to disappear and require a page refresh.
            if (!doneEventFired && finalContentRef.current) {
                setMessages(prev => [...prev, {
                    id:        crypto.randomUUID(),
                    role:      'assistant',
                    content:   finalContentRef.current,
                    timestamp: new Date(),
                }])
            }

        } catch (err) {
            console.error('Chat stream error:', err)
            setMessages(prev => [...prev, {
                id:        crypto.randomUUID(),
                role:      'assistant',
                content:   'Sorry, something went wrong. Please try again.',
                timestamp: new Date(),
            }])
        } finally {
            setIsStreaming(false)
            setStreamingContent('')
            setActiveTool(null)
            finalContentRef.current = ''
        }
    }, [])

    // ─────────────────────────────────────────────────────────────────────────
    // Submit
    // ─────────────────────────────────────────────────────────────────────────

    const handleSubmit = async (e: React.FormEvent | React.KeyboardEvent) => {
        e.preventDefault()
        if (!input.trim() || isStreaming) return

        const userMessage: Message = {
            id:        crypto.randomUUID(),
            role:      'user',
            content:   input.trim(),
            timestamp: new Date(),
        }

        setMessages(prev => [...prev, userMessage])
        setInput('')
        if (textareaRef.current) textareaRef.current.style.height = 'auto'

        await streamResponse(userMessage.content)
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Render
    // ─────────────────────────────────────────────────────────────────────────

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(true)}
                className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
                    isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
                }`}
                aria-label="Open AI Assistant"
            >
                <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 animate-pulse opacity-75" />
                    <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full p-4 shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-110">
                        <Sparkles className="w-6 h-6 animate-spin-slow" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping" />
                </div>
            </button>

            {/* Chat Overlay */}
            <div className={`fixed inset-0 z-50 transition-all duration-300 ${
                isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`}>
                {/* Backdrop */}
                <div
                    className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
                        isOpen ? 'opacity-100' : 'opacity-0'
                    }`}
                    onClick={() => setIsOpen(false)}
                />

                {/* Chat Container */}
                <div className={`absolute bottom-0 right-0 md:bottom-6 md:right-6 md:top-6 w-full md:w-[440px] h-[100vh] md:h-auto md:max-h-[calc(100vh-3rem)] bg-white md:rounded-2xl shadow-2xl flex flex-col transition-all duration-500 transform ${
                    isOpen ? 'translate-y-0 scale-100' : 'translate-y-full md:translate-y-8 scale-95'
                }`}>

                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-5 md:rounded-t-2xl flex items-center justify-between flex-shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="bg-white/20 backdrop-blur-sm p-2 rounded-full">
                                    <Bot className="w-6 h-6 text-white" />
                                </div>
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-white text-lg">AI Health Assistant</h3>
                                <p className="text-blue-100 text-xs">Always here to help</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-all duration-200"
                            aria-label="Close chat"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white min-h-0">

                        {/* History loading skeleton */}
                        {historyLoading && (
                            <div className="flex flex-col items-center justify-center h-full gap-3">
                                <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                                <p className="text-sm text-gray-400">Loading conversation…</p>
                            </div>
                        )}

                        {/* Empty state */}
                        {messages.length === 0 && !isStreaming && !historyLoading && (
                            <div className="flex flex-col items-center justify-center h-full text-center px-4">
                                <div className="bg-gradient-to-r from-blue-100 to-purple-100 p-6 rounded-full mb-4 animate-bounce-slow">
                                    <Sparkles className="w-12 h-12 text-blue-600" />
                                </div>
                                <h4 className="text-xl font-semibold text-gray-800 mb-2">
                                    Hi! I'm your AI Health Assistant
                                </h4>
                                <p className="text-gray-600 text-sm max-w-xs">
                                    Ask me about doctors, appointments, or your health. I'm here to help!
                                </p>
                            </div>
                        )}

                        {/* History */}
                        {messages.map((message, index) => (
                            <div
                                key={message.id}
                                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                                style={{ animationDelay: `${index * 0.05}s` }}
                            >
                                <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                                    message.role === 'user'
                                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                                        : 'bg-white border border-gray-200 text-gray-800 shadow-sm'
                                }`}>
                                    {message.role === 'assistant' && (
                                        <div className="flex items-center gap-2 mb-1">
                                            <Bot className="w-4 h-4 text-blue-600" />
                                            <span className="text-xs font-medium text-gray-500">AI Assistant</span>
                                        </div>
                                    )}
                                    {message.role === 'assistant' ? (
                                        <MarkdownRenderer content={message.content} />
                                    ) : (
                                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Tool-use pill (shown while a tool is running, before tokens arrive) */}
                        {isStreaming && activeTool && !streamingContent && (
                            <div className="flex justify-start animate-fade-in">
                                <div className="bg-white border border-blue-100 rounded-2xl px-4 py-3 shadow-sm flex items-center gap-2">
                                    <Wrench className="w-4 h-4 text-purple-500 animate-spin-slow flex-shrink-0" />
                                    <span className="text-xs text-gray-500">{toolLabel(activeTool)}</span>
                                </div>
                            </div>
                        )}

                        {/* Live streaming bubble */}
                        {isStreaming && streamingContent && (
                            <div className="flex justify-start animate-fade-in">
                                <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-white border border-gray-200 text-gray-800 shadow-sm">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Bot className="w-4 h-4 text-blue-600 animate-pulse" />
                                        <span className="text-xs font-medium text-gray-500">AI Assistant</span>
                                    </div>
                                    <MarkdownRenderer content={streamingContent} isStreaming />
                                </div>
                            </div>
                        )}

                        {/* Dots – waiting for first token / tool */}
                        {isStreaming && !streamingContent && !activeTool && (
                            <div className="flex justify-start animate-fade-in">
                                <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
                                    <div className="flex items-center gap-2">
                                        <Bot className="w-4 h-4 text-blue-600" />
                                        <div className="flex gap-1">
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="border-t border-gray-200 px-4 pt-3 pb-4 bg-white md:rounded-b-2xl flex-shrink-0">
                        <div className="flex items-end gap-2">
                            <textarea
                                ref={textareaRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault()
                                        handleSubmit(e)
                                    }
                                }}
                                placeholder="Ask about doctors, appointments…"
                                style={{ height: '46px' }}
                                className="flex-1 min-w-0 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none overflow-hidden max-h-32 text-gray-900 placeholder-gray-400 text-sm leading-5 bg-white transition-all duration-200"
                                rows={1}
                                disabled={isStreaming}
                            />
                            <button
                                onClick={handleSubmit}
                                disabled={!input.trim() || isStreaming}
                                className={`flex-shrink-0 w-[46px] h-[46px] flex items-center justify-center rounded-xl transition-all duration-200 ${
                                    input.trim() && !isStreaming
                                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg hover:scale-105'
                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                }`}
                                aria-label="Send message"
                            >
                                {isStreaming
                                    ? <Loader2 className="w-5 h-5 animate-spin" />
                                    : <Send    className="w-5 h-5" />
                                }
                            </button>
                        </div>
                        <p className="text-xs text-gray-400 mt-2 text-center">
                            AI can make mistakes. Please verify important information.
                        </p>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to   { transform: rotate(360deg); }
                }
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0); }
                    50%      { transform: translateY(-10px); }
                }
                .animate-fade-in     { animation: fade-in     0.3s ease-out; }
                .animate-spin-slow   { animation: spin-slow   3s  linear    infinite; }
                .animate-bounce-slow { animation: bounce-slow 2s  ease-in-out infinite; }
            `}</style>
        </>
    )
}