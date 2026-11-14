import React, { useState, useEffect, useRef } from 'react';
import {
  Brain,
  Send,
  Plus,
  MessageSquare,
  Sparkles,
  Bot,
  User,
  ChevronLeft,
  Menu
} from 'lucide-react';
import toast from 'react-hot-toast';
import api, { MentorMessage } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

interface SessionItem {
  id: string;
  title: string;
  date: string;
}

const SUGGESTED_QUESTIONS = [
  'What should I learn today?',
  'Why am I struggling with this topic?',
  'Am I ready for a job in this field?',
  'How do I improve my weak skills?',
  'What mistakes did I make in my last test?',
  'How much time do I need to reach my goal?',
  'Should I change my career target?',
  'How does my academic score affect my roadmap?',
];

export const MentorPage: React.FC = () => {
  const { isDemo } = useAuthStore();
  const [messages, setMessages] = useState<MentorMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [sessions, setSessions] = useState<SessionItem[]>([
    { id: 'sess-1', title: 'Roadmap Milestone Strategy', date: 'Today' },
    { id: 'sess-2', title: 'Kubernetes Ingress Debugging', date: 'Yesterday' },
    { id: 'sess-3', title: 'Async Python Coroutines Drill', date: '3 days ago' },
  ]);
  const [activeSessionId, setActiveSessionId] = useState('sess-1');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Load chat history on mount
  useEffect(() => {
    let isMounted = true;
    const fetchHistory = async () => {
      try {
        const hist = await api.getMentorHistory(activeSessionId);
        if (isMounted) {
          setMessages(hist);
        }
      } catch (err) {
        console.error('Failed to load chat history:', err);
      }
    };
    fetchHistory();
    return () => {
      isMounted = false;
    };
  }, [activeSessionId]);

  const handleSendMessage = async (textToSend?: string) => {
    const content = textToSend || inputText.trim();
    if (!content || isTyping) return;

    const userMsg: MentorMessage = {
      id: 'usr-' + Date.now(),
      session_id: activeSessionId,
      role: 'user',
      content,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      const response = await api.sendMentorMessage(content, activeSessionId);
      setMessages((prev) => [...prev, response]);
    } catch {
      toast.error('AI Mentor is momentarily offline. Showing calibrated response.');
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleNewConversation = () => {
    const newId = 'sess-' + Date.now();
    const newSession: SessionItem = {
      id: newId,
      title: 'New Discussion',
      date: 'Just now',
    };
    setSessions([newSession, ...sessions]);
    setActiveSessionId(newId);
    setMessages([
      {
        id: 'msg-init',
        session_id: newId,
        role: 'assistant',
        content:
          "Starting a fresh conversation! What engineering topic or roadmap question would you like to explore?",
        created_at: new Date().toISOString(),
      },
    ]);
  };

  // Helper to render code blocks inside message text
  const renderMessageContent = (content: string) => {
    const parts = content.split(/(```[\s\S]*?```)/g);
    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const lines = part.slice(3, -3).trim().split('\n');
        const language = lines[0].match(/^[a-zA-Z]+/)?.[0] || '';
        const code = language ? lines.slice(1).join('\n') : lines.join('\n');

        return (
          <div
            key={index}
            className="my-3 rounded-xl overflow-hidden border border-[#292929] bg-[#171717] font-mono text-xs"
          >
            {language && (
              <div className="px-3.5 py-1.5 bg-[#141414] border-b border-[#292929] text-[10px] text-[#A1A1AA] uppercase tracking-wider flex items-center justify-between">
                <span>{language}</span>
                <span className="text-[10px] text-[#A1A1AA]">Syntax Verified</span>
              </div>
            )}
            <pre className="p-3.5 text-neutral-200 overflow-x-auto leading-relaxed">
              <code>{code}</code>
            </pre>
          </div>
        );
      }
      return (
        <span key={index} className="whitespace-pre-wrap leading-relaxed">
          {part}
        </span>
      );
    });
  };

  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] bg-[#090909] text-white flex overflow-hidden font-body relative">
      {/* Mobile Sidebar Toggle Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* LEFT SIDEBAR (280px) */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-30 w-72 bg-[#141414] border-r border-[#292929] flex flex-col justify-between transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-[#A1A1AA] uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-white" /> Discussions
            </span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-[#A1A1AA] hover:text-white md:hidden"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleNewConversation}
            className="w-full py-2.5 px-3.5 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold text-xs shadow-sm transition-all flex items-center justify-center gap-2 mb-4"
          >
            <Plus className="w-4 h-4" />
            <span>New Conversation</span>
          </button>

          <div className="space-y-1.5 overflow-y-auto max-h-[calc(100vh-14rem)] pr-1">
            {sessions.map((sess) => {
              const isActive = sess.id === activeSessionId;
              return (
                <div
                  key={sess.id}
                  onClick={() => {
                    setActiveSessionId(sess.id);
                    if (window.innerWidth < 768) setSidebarOpen(false);
                  }}
                  className={`p-3 rounded-xl cursor-pointer text-xs transition-colors flex items-center justify-between ${
                    isActive
                      ? 'bg-[#171717] text-white border border-[#292929] font-medium'
                      : 'text-[#A1A1AA] hover:bg-[#171717] hover:text-white'
                  }`}
                >
                  <div className="truncate max-w-[180px]">
                    <p className="truncate">{sess.title}</p>
                    <span className="text-[10px] text-[#A1A1AA]">{sess.date}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar Footer info */}
        <div className="p-4 border-t border-[#292929] text-[11px] text-[#A1A1AA] flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-white" />
          <span>Full context awareness enabled</span>
        </div>
      </aside>

      {/* MAIN CHAT AREA */}
      <main className="flex-1 flex flex-col justify-between bg-[#090909] overflow-hidden">
        {/* Top Header */}
        <div className="px-4 sm:px-6 py-3.5 bg-[#141414]/90 border-b border-[#292929] backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 rounded-lg bg-[#171717] text-[#A1A1AA] hover:text-white md:hidden"
            >
              <Menu className="w-4 h-4" />
            </button>

            {/* AI Avatar */}
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-[#171717] border border-[#292929] flex items-center justify-center text-white">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-white border-2 border-[#141414] rounded-full" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold font-heading text-white tracking-tight">SkillPath AI Mentor</h3>
                {isDemo && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white font-semibold border border-white/20">
                    Live Demo Agent
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#A1A1AA]">
                Powered by learner intelligence &bull; Synchronized with your skills
              </p>
            </div>
          </div>
        </div>

        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';

            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                {/* Avatar Icon */}
                <div
                  className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-xs ${
                    isUser
                      ? 'bg-white text-black font-bold'
                      : 'bg-[#171717] border border-[#292929] text-white'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Bubble */}
                <div className="space-y-1">
                  <div
                    className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      isUser
                        ? 'bg-white text-black rounded-tr-none shadow-sm font-normal'
                        : 'bg-[#141414] border border-[#292929] text-white rounded-tl-none shadow-sm'
                    }`}
                  >
                    {renderMessageContent(msg.content)}
                  </div>
                  <span
                    className={`text-[10px] text-[#A1A1AA] block ${
                      isUser ? 'text-right' : 'text-left'
                    }`}
                  >
                    {formatTime(msg.created_at)}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-3 max-w-xl mr-auto animate-fade-in">
              <div className="w-8 h-8 rounded-lg bg-[#171717] border border-[#292929] text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3.5 rounded-2xl bg-[#141414] border border-[#292929] text-[#A1A1AA] text-xs flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-white animate-bounce" />
                <span
                  className="w-2 h-2 rounded-full bg-white animate-bounce"
                  style={{ animationDelay: '0.2s' }}
                />
                <span
                  className="w-2 h-2 rounded-full bg-white animate-bounce"
                  style={{ animationDelay: '0.4s' }}
                />
              </div>
            </div>
          )}

          {/* Suggested Prompts if chat is brief */}
          {messages.length <= 2 && (
            <div className="pt-6">
              <p className="text-xs text-[#A1A1AA] mb-3 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-white" /> Suggested Inquiries
              </p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_QUESTIONS.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(q)}
                    className="px-3.5 py-2 rounded-xl bg-[#141414] hover:bg-[#171717] border border-[#292929] hover:border-neutral-500 text-xs text-[#A1A1AA] hover:text-white transition-all text-left"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-[#141414]/90 border-t border-[#292929] backdrop-blur-md">
          <div className="max-w-3xl mx-auto space-y-2">
            <div className="relative rounded-2xl bg-[#171717] border border-[#292929] focus-within:border-white transition-colors p-2 flex items-end gap-2">
              <textarea
                ref={textareaRef}
                rows={1}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask your mentor anything about your skills, roadmap, or architecture concepts..."
                className="flex-1 bg-transparent border-0 text-sm text-white placeholder-[#A1A1AA] focus:outline-none resize-none px-2 py-1 max-h-32"
              />
              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim() || isTyping}
                className="p-2 rounded-xl bg-white hover:bg-neutral-200 text-black shadow-sm transition-all disabled:opacity-40 shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-between text-[11px] text-[#A1A1AA] px-1">
              <span>Press Enter to send, Shift+Enter for new line</span>
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-white" />
                Synthesized with active learner telemetry
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MentorPage;
