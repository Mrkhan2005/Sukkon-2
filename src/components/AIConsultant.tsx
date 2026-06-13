import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Send, BrainCircuit, User, ArrowRight, ShieldCheck, HeartPulse, HelpCircle } from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  isThinking?: boolean;
}

const PRESET_PROMPTS = [
  {
    title: 'Senior Wellness Care',
    query: 'Which therapist and duration is best for my 72yo grandmother suffering from lower back stiffness and mobility blocks?'
  },
  {
    title: 'Chronic Desk Pain',
    query: 'I work 10 hours daily at a design desk and have chronic neck and shoulder fatigue. Recommend the best package and therapist.'
  },
  {
    title: 'Therapist Verification',
    query: 'How do you perform background checks and medical verification for female therapists visiting PECHS or Clifton homes?'
  }
];

export default function AIConsultant() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: `Welcome to **Sukoon AI Smart Wellness Consultant**. 

I am equipped with **High reasoning capabilities** powered by Google Gemini to analyze your physical symptoms, age requirements, and therapist matching.

*How can I assist you on your wellness journey today?*`
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [thinkingTime, setThinkingTime] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to message bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  // Thinking elapsed timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGenerating) {
      setThinkingTime(0);
      interval = setInterval(() => {
        setThinkingTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isGenerating) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      text: textToSend
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsGenerating(true);

    try {
      // Gather chat history (without welcome message)
      const formattedHistory = messages
        .filter(m => m.id !== 'welcome')
        .map(m => ({
          role: m.role,
          text: m.text
        }));

      const response = await fetch('/api/gemini/consult', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history: [...formattedHistory, { role: 'user', text: textToSend }]
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessages(prev => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            role: 'assistant',
            text: data.text
          }
        ]);
      } else {
        setMessages(prev => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: 'assistant',
            text: `⚠️ **System Integration Notice:** ${data.error || 'Connection timed out. Please ensure your Gemini Secrets are declared.'}`
          }
        ]);
      }
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          text: `⚠️ **Network Notice:** Unable to reach the reasoning server. Your Express dev server may still be spinning up.`
        }
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  const renderMarkdown = (text: string) => {
    // Simple robust markdown formatter for lists, bolding, line breaks
    return text.split('\n').map((line, idx) => {
      let trimmed = line.trim();
      let element = line;

      // Check bullet items
      if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
        const cleaned = trimmed.substring(2);
        return (
          <li key={idx} className="ml-5 list-disc my-1 text-slate-700 dark:text-slate-300">
            {formatBold(cleaned)}
          </li>
        );
      }

      // Check number lists
      const numMatch = trimmed.match(/^(\d+)\.\s(.*)/);
      if (numMatch) {
        return (
          <li key={idx} className="ml-5 list-decimal my-1 text-slate-700 dark:text-slate-300">
            {formatBold(numMatch[2])}
          </li>
        );
      }

      return (
        <p key={idx} className="my-1.5 leading-relaxed text-slate-700 dark:text-slate-300 min-h-[1rem]">
          {formatBold(line)}
        </p>
      );
    });
  };

  const formatBold = (str: string) => {
    const parts = str.split('**');
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        return <strong key={i} className="font-semibold text-brand-teal dark:text-brand-emerald">{part}</strong>;
      }
      return part;
    });
  };

  return (
    <div id="ai-advisor-window" className="w-full max-w-4xl mx-auto rounded-3xl overflow-hidden shadow-2xl glass-panel border border-slate-200/50 dark:border-slate-800/80 flex flex-col h-[640px]">
      {/* Advisor Header */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-800/80 bg-gradient-to-r from-teal-50/50 via-white to-emerald-50/30 dark:from-slate-900/50 dark:via-slate-950 dark:to-slate-900/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="p-3 rounded-2xl bg-brand-teal/10 dark:bg-brand-emerald/10 text-brand-teal dark:text-brand-emerald animate-pulse-glow">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-950 rounded-full"></span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-medium text-lg text-slate-800 dark:text-slate-100">Sukoon Wellness AI Guide</h3>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200/50 dark:border-amber-800">
                Thinking Mode Active
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Senior care, joint diagnostics, & therapist pairing advisor</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1"><ShieldCheck className="w-4 h-4 text-emerald-500" /> HIPAA Compliant standards</span>
        </div>
      </div>

      {/* Messages Box */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-brand-teal/10 dark:bg-brand-emerald/10 flex items-center justify-center text-brand-teal dark:text-brand-emerald flex-shrink-0 mt-1">
                  <HeartPulse className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[80%] rounded-2xl p-4 shadow-sm text-sm ${
                  msg.role === 'user'
                    ? 'bg-brand-teal text-white rounded-tr-none'
                    : 'bg-white/80 dark:bg-slate-900/90 border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none'
                }`}
              >
                {msg.role === 'user' ? (
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                ) : (
                  <div>{renderMarkdown(msg.text)}</div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-brand-teal flex items-center justify-center text-white flex-shrink-0 mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </motion.div>
          ))}

          {isGenerating && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-4 justify-start"
            >
              <div className="w-8 h-8 rounded-full bg-brand-teal/10 dark:bg-brand-emerald/10 flex items-center justify-center text-brand-teal dark:text-brand-emerald flex-shrink-0 mt-1">
                <BrainCircuit className="w-4 h-4 animate-spin-slow" />
              </div>

              <div className="bg-white/80 dark:bg-slate-900/90 border border-slate-100 dark:border-slate-800 rounded-2xl rounded-tl-none p-4 shadow-sm max-w-[80%] min-w-[280px]">
                {/* Advanced thinking log visualizer */}
                <div className="flex items-center gap-2.5 mb-2 border-b border-slate-50 dark:border-slate-800 pb-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                  <p className="text-[11px] font-mono uppercase tracking-wider text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1.5">
                    Analyzing clinical therapist matrix... {thinkingTime}s elapsed
                  </p>
                </div>
                
                <div className="space-y-2 py-1">
                  <div className="h-2 rounded bg-slate-100 dark:bg-slate-850 animate-pulse w-full"></div>
                  <div className="h-2 rounded bg-slate-100 dark:bg-slate-850 animate-pulse w-[92%]"></div>
                  <div className="h-2 rounded bg-slate-100 dark:bg-slate-850 animate-pulse w-[81%]"></div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Helper Preset chips */}
      {messages.length === 1 && (
        <div className="px-6 py-2.5 bg-slate-50/50 dark:bg-slate-950/20 border-t border-slate-100 dark:border-slate-850">
          <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 dark:text-slate-500 mb-2 flex items-center gap-1"><HelpCircle className="w-3.5 h-3.5" /> Tap an expert formulation to consult:</p>
          <div className="flex flex-wrap gap-2">
            {PRESET_PROMPTS.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(preset.query)}
                className="text-[11px] sm:text-xs text-left px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 hover:border-brand-teal dark:hover:border-brand-emerald bg-white dark:bg-slate-900 hover:bg-teal-50/30 dark:hover:bg-teal-950/10 text-slate-600 dark:text-slate-300 font-medium transition-all duration-300 flex items-center gap-1 group cursor-pointer"
              >
                <span>{preset.title}</span>
                <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-brand-teal dark:group-hover:text-brand-emerald group-hover:translate-x-0.5 transition-transform" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(inputMessage);
        }}
        className="p-4 border-t border-slate-100 dark:border-slate-850 bg-white/50 dark:bg-slate-950/50 flex gap-2"
      >
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Ask about therapist fields, joint stiffness, senior relief..."
          disabled={isGenerating}
          className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal dark:focus:ring-brand-emerald dark:text-slate-200 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!inputMessage.trim() || isGenerating}
          className="p-3 bg-brand-teal dark:bg-brand-emerald hover:opacity-90 active:scale-95 text-white rounded-2xl shadow-md transition-all duration-300 flex-shrink-0 disabled:opacity-40 disabled:scale-100 cursor-pointer"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
