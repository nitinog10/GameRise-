import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/axios';
import Navigation from '../components/Navigation';

const CoachAvatar = React.lazy(() => import('../components/CoachAvatar'));

const SUGGESTED_QUESTIONS = [
  'How do I improve my aim?',
  'Best strategy for ranked?',
  'What role suits me?',
  'How to deal with tilt?',
  'Tips for clutch situations?',
];

const AiCoach = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const preselectedGame = searchParams.get('game') || '';

  const [games, setGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState(preselectedGame);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const { data } = await api.get('/api/games');
        setGames(data.games || []);
      } catch (error) {
        console.error('Failed to fetch games:', error);
      }
    };
    fetchGames();
  }, []);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const { data } = await api.get('/api/ai-coach/sessions');
        setSessions(data.sessions || []);
      } catch (error) {
        console.error('Failed to fetch sessions:', error);
      }
    };
    fetchSessions();
  }, [sessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadSession = async (sid) => {
    try {
      const { data } = await api.get(`/api/ai-coach/sessions/${sid}`);
      if (data.session) {
        setSessionId(data.session.sessionId);
        setSelectedGame(data.session.gameSlug || '');
        setMessages((data.session.messages || []).map(m => ({ role: m.role, content: m.content })));
        setSidebarOpen(false);
      }
    } catch (error) {
      console.error('Failed to load session:', error);
    }
  };

  const sendMessage = async (messageText) => {
    const text = messageText || input.trim();
    if (!text || isStreaming) return;

    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setInput('');
    setIsStreaming(true);
    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/ai-coach`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          message: text,
          gameSlug: selectedGame || null,
          conversationHistory: messages.filter(m => m.content),
          sessionId: sessionId || null
        })
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === 'token') {
                fullResponse += data.text;
                setMessages(prev => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { role: 'assistant', content: fullResponse };
                  return updated;
                });
              } else if (data.type === 'session') {
                setSessionId(data.sessionId);
              } else if (data.type === 'error') {
                setMessages(prev => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { role: 'assistant', content: `⚠️ ${data.error}` };
                  return updated;
                });
              }
            } catch (e) {}
          }
        }
      }
    } catch (error) {
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: 'assistant', content: '⚠️ Connection error. Please try again.' };
        return updated;
      });
    } finally {
      setIsStreaming(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setSessionId(null);
    setInput('');
  };

  const formatMessage = (content) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-dark-200 text-neon px-1.5 py-0.5 rounded text-xs font-mono">$1</code>')
      .replace(/\n/g, '<br/>');
  };

  const getGameEmoji = (slug) => {
    const map = { valorant: '🎯', bgmi: '🔫', codm: '💥' };
    return map[slug] || '💬';
  };

  return (
    <div className="h-screen bg-dark flex flex-col overflow-hidden">
      <Navigation />

      <div className="flex flex-1 pt-16 min-h-0">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed md:relative md:translate-x-0 z-30 w-64 h-[calc(100vh-4rem)] bg-dark-50 border-r border-white/[0.04] flex flex-col transition-transform duration-300`}>
          <div className="p-4 border-b border-white/[0.04]">
            <button onClick={startNewChat} className="btn-primary w-full text-sm py-2.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Chat
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            {sessions.map(s => (
              <button
                key={s.sessionId}
                onClick={() => loadSession(s.sessionId)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all ${
                  sessionId === s.sessionId
                    ? 'bg-white/[0.06] text-white'
                    : 'text-gray-500 hover:bg-white/[0.03] hover:text-gray-300'
                }`}
              >
                <div className="flex items-center gap-2 font-medium truncate">
                  <span className="text-xs">{getGameEmoji(s.gameSlug)}</span>
                  {s.gameSlug ? s.gameSlug.toUpperCase() : 'General'}
                </div>
                <div className="text-[10px] text-gray-600 mt-0.5 ml-5">
                  {new Date(s.createdAt).toLocaleDateString()}
                </div>
              </button>
            ))}
            {sessions.length === 0 && (
              <p className="text-gray-600 text-xs text-center py-8">No sessions yet</p>
            )}
          </div>
        </aside>

        {/* Sidebar overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Main */}
        <main className="flex-1 flex flex-col min-w-0">
          {/* Chat Header */}
          <div className="flex items-center gap-3 px-4 md:px-6 py-3 border-b border-white/[0.04] bg-dark/50 backdrop-blur-sm">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden text-gray-400 hover:text-white p-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Mini avatar */}
            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-accent-purple/20">
              <Suspense fallback={<div className="w-full h-full bg-accent-purple/10 flex items-center justify-center text-xs">🤖</div>}>
                <CoachAvatar size={32} isSpeaking={isStreaming} isThinking={isStreaming && messages[messages.length - 1]?.content === ''} />
              </Suspense>
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-sm font-semibold text-white">AI Esports Coach</h1>
              <div className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${isStreaming ? 'bg-amber-400 animate-pulse-soft' : 'bg-neon'}`} />
                <span className="text-[10px] text-gray-500 uppercase tracking-wider">
                  {isStreaming ? 'Thinking' : 'Online'}
                </span>
              </div>
            </div>

            <select
              value={selectedGame}
              onChange={(e) => setSelectedGame(e.target.value)}
              className="input py-1.5 px-3 text-xs w-auto max-w-[140px] rounded-lg"
            >
              <option value="">All Games</option>
              {games.map(g => (
                <option key={g.slug} value={g.slug}>{g.name}</option>
              ))}
            </select>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-5">
            {messages.length === 0 ? (
              /* Empty State */
              <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in">
                <div className="mb-6 animate-float">
                  <Suspense fallback={
                    <div className="w-40 h-40 rounded-full bg-accent-purple/5 border border-accent-purple/10 flex items-center justify-center">
                      <span className="text-5xl">🤖</span>
                    </div>
                  }>
                    <CoachAvatar size={160} isSpeaking={false} isThinking={false} />
                  </Suspense>
                </div>

                <h2 className="text-2xl font-bold text-white mb-1">
                  Hey, {user?.username}
                </h2>
                <p className="text-gray-500 text-sm mb-8 max-w-sm">
                  I know Valorant, BGMI, and CODM inside out. Ask me anything about strategies, aim, roles, or mental game.
                </p>

                {selectedGame && (
                  <div className="mb-6 badge badge-green">
                    🎮 {games.find(g => g.slug === selectedGame)?.name || selectedGame} selected
                  </div>
                )}

                <div className="flex flex-wrap gap-2 justify-center max-w-md">
                  {SUGGESTED_QUESTIONS.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(q)}
                      className="btn-ghost text-xs py-2 px-4"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Message List */
              <>
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}>
                    {msg.role === 'assistant' && (
                      <div className="w-7 h-7 rounded-full bg-accent-purple/10 flex items-center justify-center mr-3 flex-shrink-0 mt-1">
                        <span className="text-[10px]">🤖</span>
                      </div>
                    )}
                    <div className={`max-w-[75%] md:max-w-[60%] px-4 py-3 ${msg.role === 'user' ? 'bubble-user' : 'bubble-ai'}`}>
                      {msg.role === 'assistant' && (
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-[10px] font-semibold text-accent-purple uppercase tracking-wider">AI Coach</span>
                          {idx === messages.length - 1 && isStreaming && (
                            <span className="w-1 h-1 rounded-full bg-accent-purple animate-pulse-soft" />
                          )}
                        </div>
                      )}
                      <div
                        className="text-sm leading-relaxed text-gray-300 whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{ __html: formatMessage(msg.content || '') }}
                      />
                      {msg.role === 'assistant' && idx === messages.length - 1 && isStreaming && !msg.content && (
                        <div className="flex gap-1.5 py-1">
                          {[0, 1, 2].map(i => (
                            <span key={i} className="w-1.5 h-1.5 bg-accent-purple/40 rounded-full" style={{ animation: `typing 1.4s ease-in-out ${i * 0.2}s infinite` }} />
                          ))}
                        </div>
                      )}
                    </div>
                    {msg.role === 'user' && (
                      <div className="w-7 h-7 rounded-full bg-neon/10 flex items-center justify-center ml-3 flex-shrink-0 mt-1">
                        <span className="text-neon text-[10px] font-bold">{user?.username?.[0]?.toUpperCase()}</span>
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input */}
          <div className="px-4 md:px-8 py-4 border-t border-white/[0.04] bg-dark/50 backdrop-blur-sm">
            <div className="flex gap-2 max-w-3xl mx-auto items-end">
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={isStreaming ? 'AI Coach is responding...' : 'Ask your coach anything...'}
                  disabled={isStreaming}
                  className="input pr-10"
                />
              </div>
              <button
                onClick={() => sendMessage()}
                disabled={isStreaming || !input.trim()}
                className="btn-primary py-3 px-5 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {isStreaming ? (
                  <span className="inline-block w-4 h-4 border-2 border-dark border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </button>
            </div>
            <p className="text-center text-[10px] text-gray-600 mt-2">
              AI Coach can make mistakes. Verify important strategies.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AiCoach;
