import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/axios';

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

    // Add user message
    const userMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsStreaming(true);

    // Add placeholder for AI response
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
              } else if (data.type === 'done') {
                // Streaming complete
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
              // Ignore parse errors for incomplete chunks
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
    // Simple markdown-like formatting
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-800 px-1 rounded text-neon">$1</code>')
      .replace(/\n/g, '<br/>');
  };

  return (
    <div className="min-h-screen bg-dark flex">
      {/* Sidebar - Session History */}
      <div className={`${showSidebar ? 'translate-x-0' : '-translate-x-full'} fixed md:relative md:translate-x-0 z-20 w-72 h-full bg-[#12121a] border-r border-gray-800 transition-transform duration-200 flex flex-col`}>
        <div className="p-4 border-b border-gray-800">
          <h2 className="text-lg font-bold text-neon">AI Coach</h2>
          <p className="text-xs text-gray-500 mt-1">Session History</p>
        </div>

        <div className="p-3">
          <button
            onClick={startNewChat}
            className="w-full px-4 py-2 bg-neon text-dark font-bold rounded-lg hover:bg-green-400 transition text-sm"
          >
            + New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {sessions.map(session => (
            <button
              key={session.sessionId}
              onClick={() => loadSession(session.sessionId)}
              className={`w-full text-left px-3 py-2 rounded-lg transition text-sm ${
                sessionId === session.sessionId
                  ? 'bg-gray-800 text-neon'
                  : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
              }`}
            >
              <div className="font-medium truncate">
                {session.gameSlug ? session.gameSlug.toUpperCase() : 'General'} Chat
              </div>
              <div className="text-xs text-gray-600 mt-1">
                {new Date(session.createdAt).toLocaleDateString()}
              </div>
            </button>
          ))}
          {sessions.length === 0 && (
            <p className="text-gray-600 text-xs text-center py-4">No sessions yet</p>
          )}
        </div>

        <div className="p-3 border-t border-gray-800">
          <Link
            to="/"
            className="block text-center text-gray-500 hover:text-white text-sm transition"
          >
            ← Back to Home
          </Link>
        </div>
      </div>

      {/* Sidebar overlay for mobile */}
      {showSidebar && (
        <div
          className="fixed inset-0 bg-black/50 z-10 md:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="bg-[#12121a] border-b border-gray-800 px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="md:hidden text-gray-400 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex-1">
            <h1 className="text-xl font-bold text-white">AI Esports Coach</h1>
            <p className="text-xs text-gray-500">Powered by Claude • Game-aware coaching</p>
          </div>

          {/* Game Selector */}
          <select
            value={selectedGame}
            onChange={(e) => setSelectedGame(e.target.value)}
            className="bg-gray-800 text-white text-sm rounded-lg px-3 py-2 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-neon"
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
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="text-6xl mb-4">🎮</div>
              <h2 className="text-2xl font-bold text-white mb-2">Welcome, {user?.username}!</h2>
              <p className="text-gray-400 mb-8 max-w-md">
                I'm your AI esports coach. Ask me anything about improving your gameplay, strategies, or mental game.
              </p>

              {selectedGame && (
                <div className="mb-6 px-4 py-2 bg-gray-800 rounded-lg">
                  <span className="text-gray-400 text-sm">Context: </span>
                  <span className="text-neon font-medium">{games.find(g => g.slug === selectedGame)?.name || selectedGame}</span>
                </div>
              )}

              <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                {SUGGESTED_QUESTIONS.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(q)}
                    className="px-4 py-2 bg-gray-800 text-gray-300 rounded-full text-sm hover:bg-gray-700 hover:text-neon transition border border-gray-700"
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
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] md:max-w-[70%] px-4 py-3 rounded-2xl ${
                  msg.role === 'user'
                    ? 'bg-neon/20 text-white border border-neon/30'
                    : 'bg-[#1a1a24] text-gray-200 border border-gray-800'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-neon text-xs font-bold">AI COACH</span>
                    {idx === messages.length - 1 && isStreaming && (
                      <span className="inline-block w-2 h-2 bg-neon rounded-full animate-pulse" />
                    )}
                  </div>
                )}
                <div
                  className="text-sm leading-relaxed whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: formatMessage(msg.content || '') }}
                />
                {msg.role === 'assistant' && idx === messages.length - 1 && isStreaming && !msg.content && (
                  <div className="flex gap-1 py-2">
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-[#12121a] border-t border-gray-800 px-4 py-3">
          <div className="flex gap-2 max-w-4xl mx-auto">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isStreaming ? 'AI is typing...' : 'Ask your coach anything...'}
              disabled={isStreaming}
              className="flex-1 px-4 py-3 bg-gray-800 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-neon disabled:opacity-50 text-sm"
            />
            <button
              onClick={() => sendMessage()}
              disabled={isStreaming || !input.trim()}
              className="px-6 py-3 bg-neon text-dark font-bold rounded-xl hover:bg-green-400 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {isStreaming ? (
                <span className="inline-block w-4 h-4 border-2 border-dark border-t-transparent rounded-full animate-spin" />
              ) : (
                'Send'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiCoach;
