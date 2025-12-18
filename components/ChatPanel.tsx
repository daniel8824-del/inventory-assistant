import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Sparkles, Loader2, RotateCcw } from 'lucide-react';
import { CHAT_WEBHOOK_URL } from '../constants';
import { ChatMessage, N8nResponse } from '../types';

const ChatPanel = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'bot',
      content: '안녕하세요! 케이원솔루션 재고관리 AI 어시스턴트입니다. LED 부품 재고에 대해 무엇이든 물어보세요.',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Create a session ID once per page load
  const sessionId = useRef(`kone-session-${Date.now()}`);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch(CHAT_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatInput: userMsg.content,
          sessionId: sessionId.current
        })
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const data: N8nResponse | N8nResponse[] = await response.json();
      
      // Handle diverse n8n response structures
      let botContent = "응답을 가져오지 못했습니다.";
      if (Array.isArray(data)) {
        botContent = data[0]?.output || data[0]?.response || botContent;
      } else {
        botContent = data.output || data.response || botContent;
      }

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: botContent,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);

    } catch (error) {
      console.error('Chat error:', error);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: '죄송합니다. 서버 연결에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // 팝업창으로 링크 열기
  const openPopup = (url: string) => {
    const width = 520;
    const height = 750;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;
    
    window.open(
      url,
      'agentPopup',
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
    );
  };

  // Helper to render message content with basic formatting links
  // Converts [text](url) to clickable links safely
  const renderContent = (content: string) => {
    const parts = content.split(/(\[.*?\]\(.*?\))/g);
    return parts.map((part, index) => {
      const match = part.match(/^\[(.*?)\]\((.*?)\)$/);
      if (match) {
        return (
          <button 
            key={index} 
            onClick={() => openPopup(match[2])}
            className="block w-full mt-2 mb-2 text-center py-2 px-3 bg-agent-cyan/10 border border-agent-cyan/30 border-dashed rounded text-agent-cyan font-semibold text-xs hover:bg-agent-cyan/20 transition-colors cursor-pointer"
          >
            {match[1]}
          </button>
        );
      }
      return <span key={index} className="whitespace-pre-wrap">{part}</span>;
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#080809] border-l border-border shadow-2xl lg:shadow-none">
      {/* Header */}
      <div className="p-6 border-b border-border flex items-center gap-4 bg-[#080809]">
        <div className="w-10 h-10 rounded-xl bg-agent-cyan flex items-center justify-center text-black shadow-[0_0_15px_rgba(6,182,212,0.2)]">
          <Bot size={24} strokeWidth={2.5} />
        </div>
        <div>
          <div className="font-bold text-zinc-100 text-sm">INV-Agent Alpha</div>
          <div className="text-[10px] font-mono text-status-safe flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-status-safe animate-pulse"></span>
            AI Assistant Active
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className={`
              max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed relative word-break-all
              ${msg.role === 'user' 
                ? 'bg-agent-cyan text-black font-semibold rounded-tr-none' 
                : `bg-[#161618] border border-border text-zinc-300 rounded-tl-none ${msg.isError ? 'border-status-risk/50 text-status-risk' : ''}`
              }
            `}>
              {renderContent(msg.content)}
            </div>
            <span className="text-[9px] text-zinc-600 mt-1 px-1 font-mono">
              {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
        {isLoading && (
          <div className="flex flex-col items-start animate-pulse">
            <div className="bg-[#161618] border border-border px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-2 text-zinc-400 text-sm">
               <Loader2 size={14} className="animate-spin" />
               <span>분석 중...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-5 border-t border-border bg-[#080809]">
        <div className="bg-[#111113] border border-border rounded-xl p-3 focus-within:border-agent-cyan/50 transition-colors">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="메시지를 입력하세요..."
            rows={2}
            className="w-full bg-transparent border-none text-zinc-200 placeholder-zinc-600 text-sm resize-none focus:outline-none font-sans"
            disabled={isLoading}
          />
          <div className="flex justify-between items-center mt-2">
            <div className="flex gap-3 text-zinc-600">
               <button 
                 className="hover:text-agent-cyan transition-colors disabled:opacity-30 disabled:cursor-not-allowed" 
                 title="Quick Analysis (준비 중)"
                 disabled
               >
                  <Sparkles size={16} />
               </button>
               <button 
                 className="hover:text-agent-cyan transition-colors" 
                 title="대화 초기화" 
                 onClick={() => setMessages(prev => prev.slice(0,1))}
               >
                  <RotateCcw size={16} />
               </button>
            </div>
            <button 
              onClick={handleSend}
              disabled={!inputValue.trim() || isLoading}
              className={`
                flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all
                ${!inputValue.trim() || isLoading 
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
                  : 'bg-agent-cyan text-black hover:bg-cyan-400'
                }
              `}
            >
              <span>전송</span>
              <Send size={12} />
            </button>
          </div>
        </div>
        <div className="text-center mt-3">
           <span className="text-[10px] text-zinc-700 font-mono tracking-wider">DATAWAVE ENGINE | SESSION ACTIVE</span>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;