'use client';

/**
 * ChatView Component
 * 
 * Manages the conversation state and displays chat messages.
 * Handles loading states and error messages.
 */

import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { ChatBubble } from './ChatBubble';
import { type Locale } from '@/lib/i18n';

export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: number;
}

export interface ChatViewHandle {
  handleUserMessage: (text: string) => void;
}

interface ChatViewProps {
  locale: Locale;
  onNewMessage?: (message: Message) => void;
}

export const ChatView = forwardRef<ChatViewHandle, ChatViewProps>(function ChatView({ locale, onNewMessage }, ref) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load messages from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const saved = localStorage.getItem('hanmate-messages');
      if (saved) {
        const parsed = JSON.parse(saved) as Message[];
        // Keep only last 5 messages
        setMessages(parsed.slice(-5));
      }
    } catch (e) {
      // Ignore parse errors
    }
  }, []);

  // Save messages to localStorage
  useEffect(() => {
    if (typeof window === 'undefined' || messages.length === 0) return;
    
    try {
      localStorage.setItem('hanmate-messages', JSON.stringify(messages));
    } catch (e) {
      // Ignore storage errors
    }
  }, [messages]);

  // Auto-scroll to bottom when new message arrives
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const addMessage = (text: string, isUser: boolean) => {
    const newMessage: Message = {
      id: `${Date.now()}-${Math.random()}`,
      text,
      isUser,
      timestamp: Date.now(),
    };
    
    setMessages((prev) => {
      const updated = [...prev, newMessage];
      // Keep only last 5 messages
      return updated.slice(-5);
    });
    
    onNewMessage?.(newMessage);
    return newMessage;
  };

  const sendToAI = async (userMessage: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/talk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      const aiMessage = addMessage(data.reply, false);

      // Speak the AI reply
      speakText(data.reply, locale);
    } catch (err) {
      const errorMsg = locale === 'ko'
        ? '응답을 받는 중 오류가 발생했습니다. 다시 시도해주세요.'
        : 'An error occurred while getting a response. Please try again.';
      setError(errorMsg);
      console.error('AI request error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserMessage = (text: string) => {
    if (!text.trim()) return;
    
    addMessage(text, true);
    sendToAI(text);
  };

  // Expose handleUserMessage via ref
  useImperativeHandle(ref, () => ({
    handleUserMessage,
  }));

  const speakText = (text: string, lang: Locale) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'ko' ? 'ko-KR' : 'en-US';
    utterance.rate = 0.9; // Slightly slower for elders
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="chat-view">
      <div className="chat-messages">
        {messages.length === 0 && !isLoading && (
          <div className="chat-empty">
            <p className="chat-empty-text">
              {locale === 'ko' 
                ? '말씀을 시작해주세요. 제가 들어드리겠습니다.' 
                : 'Please start speaking. I\'m here to listen.'}
            </p>
          </div>
        )}
        
        {messages.map((message) => (
          <ChatBubble
            key={message.id}
            message={message.text}
            isUser={message.isUser}
            locale={locale}
          />
        ))}
        
        {isLoading && (
          <div className="chat-bubble chat-bubble-ai">
            <div className="chat-bubble-content">
              <p className="chat-bubble-text chat-loading">
                {locale === 'ko' ? '생각 중이에요...' : 'Thinking...'}
              </p>
            </div>
          </div>
        )}
        
        {error && (
          <div className="chat-error">
            <p className="chat-error-text">{error}</p>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
});

