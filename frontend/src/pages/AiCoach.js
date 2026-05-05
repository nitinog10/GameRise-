import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/axios';

const CoachAvatar = React.lazy(() => import('../components/CoachAvatar'));

const SUGGESTED_QUESTIONS = [
  'How do I improve my aim?',
  'Best strategy for ranked?',
  'What role suits me?',
  'How to deal with tilt?',
  'Tips for clutch situations?'
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
  const [showSidebar, setShowSidebar] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Fetch games list for dropdown
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

  // Fetch recent sessions
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

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load a past session
  const loadSession = async (sid) => {
    try {
      const { data } = await api.get(`/api/ai-coach/sessions/${sid}`);
      if (data.session) {
        setSessionId(data.session.sessionId);
        setSelectedGame(data.session.gameSlug || '');
        const loadedMessages = (data.session.messages || []).map(msg => ({
          role: msg.role,
          content: msg.content
        }));
        setMessages(loadedMessages);
        setShowSidebar(false);
      }
    } catch (error) {
      console.error('Failed to load session:', error);
    }
  };

  // Send message to AI coach
  const sendMessage = async (messageText) => {
    const text = messageText || input.trim();
    if (!text || isStreaming) return;

    const userMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsStreaming(true);

    const aiMessage = { role: 'assistant', content: '' };
    setMessages(prev => [...prev, aiMessage]);

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
                  updated[updated.length - 1] = {
                    role: 'assistant',
                    content: fullResponse
                  };
                  return updated;
                });
              } else if (data.type === 'session') {
                setSessionId(data.sessionId);
              } else if (data.type === 'error') {
                setMessages(prev => {
                  const updated = [...prev];
                  updated[updated.length - 1] = {
                    role: 'assistant',
                    content: `⚠️ Error: ${data.error}. Please try again.`
                  };
                  return updated;
                });
              }
            } catch (e) {
              // Ignore parse errors
            }
          }
        }
      }
    } catch (error) {
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: 'assistant',
          content: '⚠️ Failed to connect to AI Coach. Please check your connection and try again.'
        };
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
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-800 px-1.5 py-0.5 rounded text-neon text-xs">$1</code>')
      .replace(/\n/g, '<br/>');
  };

  return (
    <div className="min-h-screen bg-dark bg-coach-gradient bg-dots flex">
      {/* Sidebar */}
      <div className={`${showSidebar ? 'translate-x-0' : '-translate-x-full'} fixed md:relative md:translate-x-0 z-30 w-72 h-full glass-strong flex flex-col transition-transform duration-300`}>
        <div className="p-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-neon flex items-center justify-center">
              <span className="text-dark font-bold text-sm">🤖</span>
            </div>
            <div>
              <h2 className="text-white font-bold">AI Coach</h2>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">Session History</p>
            </div>
          </div>
        </div>

        <div className="p-3">
          <button
            onClick={startNewChat}
            className="w-full btn-neon text-sm py-2.5 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          {sessions.map(session => (
            <button
              key={session.sessionId}
              onClick={() => loadSession(session.sessionId)}
              className={`w-full text-left px-3 py-2.5 rounded-xl transition-all text-sm group ${
                sessionId === session.sessionId
                  ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                  : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'
              }`}
            >
              <div className="font-medium truncate flex items-center gap-2">
                <span className="text-xs">
                  {session.gameSlug === 'valorant' ? '🎯' : session.gameSlug === 'bgmi' ? '🔫' : session.gameSlug === 'codm' ? '💥' : '💬'}
                </span>
                {session.gameSlug ? session.gameSlug.toUpperCase() : 'General'} Chat
              </div>
              <div className="text-[10px] text-gray-600 mt-0.5">
                {new Date(session.createdAt).toLocaleDateString()}
              </div>
            </button>
          ))}
          {sessions.length === 0 && (
            <p className="text-gray-600 text-xs text-center py-8">No sessions yet.<br />Start a conversation!</p>
          )}
        </div>

        <div className="p-3 border-t border-white/5">
          <Link
            to="/"
            className="flex items-center gap-2 text-gray-500 hover:text-white text-sm transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>

      {/* Sidebar overlay for mobile */}
      {showSidebar && (
        <div
          className="fixed inset-0 bg-black/60 z-20 md:hidden backdrop-blur-sm"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="glass-strong px-4 md:px-6 py-3 flex items-center gap-3 border-b border-white/5">
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="md:hidden text-gray-400 hover:text-white p-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* 3D Avatar mini */}
          <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 neon-border-purple">
            <Suspense fallback={
              <div className="w-full h-full bg-purple-500/20 flex items-center justify-center text-sm">🤖</div>
            }>
              <CoachAvatar size={40} isSpeaking={isStreaming} isThinking={isStreaming && messages[messages.length - 1]?.content === ''} />
            </Suspense>
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-white font-bold text-sm">AI Esports Coach</h1>
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${isStreaming ? 'bg-amber-400 animate-pulse' : 'bg-neon'}`} />
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">
                {isStreaming ? 'Thinking...' : 'Online • Game-aware'}
              </p>
            </div>
          </div>

          {/* Game Selector */}
          <select
            value={selectedGame}
            onChange={(e) => setSelectedGame(e.target.value)}
            className="input-glass input-glass-purple text-sm rounded-xl px-3 py-2 w-auto max-w-[160px]"
          >
            <option value="">All Games</option>
            {games.map(game => (
              <option key={game.slug} value={game.slug}>
                {game.name}
              </option>
            ))}
          </select>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-5">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in">
              {/* Large 3D Avatar */}
              <div className="mb-6 animate-float">
                <Suspense fallback={
                  <div className="w-48 h-48 rounded-full bg-purple-500/10 flex items-center justify-center neon-border-purple">
                    <span className="text-6xl">🤖</span>
                  </div>
                }>
                  <CoachAvatar size={200} isSpeaking={false} isThinking={false} />
                </Suspense>
              </div>

              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                Hey, {user?.username}! 👋
              </h2>
              <p className="text-gray-400 mb-2 max-w-md text-sm">
                I'm your AI esports coach. I know Valorant, BGMI, CODM inside out.
              </p>
              <p className="text-gray-500 mb-8 max-w-md text-xs">
                Ask me anything — strategies, aim tips, role advice, mental game, or tournament prep.
              </p>

              {selectedGame && (
                <div className="mb-6 px-4 py-2 glass rounded-xl flex items-center gap-2">
                  <span className="text-neon text-xs">🎮</span>
                  <span className="text-gray-300 text-sm font-medium">
                    {games.find(g => g.slug === selectedGame)?.name || selectedGame}
                  </span>
                  <span className="text-gray-600 text-xs">selected</span>
                </div>
              )}

              <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                {SUGGESTED_QUESTIONS.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(q)}
                    className="px-4 py-2 glass rounded-xl text-sm text-gray-300 hover:text-neon hover:border-neon/30 transition-all border border-transparent hover:border-neon/20"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center mr-3 flex-shrink-0 mt-1">
                  <span className="text-xs">🤖</span>
                </div>
              )}
              <div
                className={`max-w-[80%] md:max-w-[65%] px-5 py-3.5 ${
                  msg.role === 'user'
                    ? 'chat-bubble-user'
                    : 'chat-bubble-ai'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-purple-400 text-[10px] font-bold uppercase tracking-wider">AI Coach</span>
                    {idx === messages.length - 1 && isStreaming && (
                      <span className="inline-block w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse" />
                    )}
                  </div>
                )}
                <div
                  className="text-sm leading-relaxed whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: formatMessage(msg.content || '') }}
                />
                {msg.role === 'assistant' && idx === messages.length - 1 && isStreaming && !msg.content && (
                  <div className="flex gap-1.5 py-2">
                    {[0, 1, 2].map(i => (
                      <span
                        key={i}
                        className="w-2 h-2 bg-purple-400/60 rounded-full"
                        style={{ animation: `typing-dot 1.4s ease-in-out ${i * 0.2}s infinite` }}
                      />
                    ))}
                  </div>
                )}
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-neon/20 flex items-center justify-center ml-3 flex-shrink-0 mt-1">
                  <span className="text-neon text-xs font-bold">{user?.username?.[0]?.toUpperCase()}</span>
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="glass-strong border-t border-white/5 px-4 md:px-8 py-4">
          <div className="flex gap-3 max-w-4xl mx-auto items-end">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isStreaming ? 'AI Coach is typing...' : 'Ask your coach anything...'}
                disabled={isStreaming}
                className="input-glass input-glass-purple w-full pr-12"
              />
              {!isStreaming && input.trim() && (
                <button
                  onClick={() => sendMessage()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center hover:bg-purple-500/30 transition"
                >
                  <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              )}
            </div>
            <button
              onClick={() => sendMessage()}
              disabled={isStreaming || !input.trim()}
              className="btn-purple py-3.5 px-6 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isStreaming ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Send'
              )}
            </button>
          </div>
          <p className="text-center text-[10px] text-gray-600 mt-2">
            AI Coach can make mistakes. Verify important strategies.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AiCoach;
