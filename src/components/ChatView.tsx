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
import { useTranslations } from '@/lib/use-translations';
import {
  saveMessage,
  getConversationHistory,
  learnFromConversation,
  getContextSummary,
  type ConversationMessage,
} from '@/lib/conversation-memory';

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
  const t = useTranslations(locale);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load messages from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      // Load from conversation memory
      const history = getConversationHistory();
      if (history.length > 0) {
        // Convert conversation history to Message format
        const loadedMessages: Message[] = history.map((msg, idx) => ({
          id: `loaded-${idx}`,
          text: msg.content,
          isUser: msg.role === 'user',
          timestamp: msg.timestamp || Date.now(),
        }));
        // Keep only last 10 messages for display
        setMessages(loadedMessages.slice(-10));
      } else {
        // Fallback to old storage format
        const saved = localStorage.getItem('hanmate-messages');
        if (saved) {
          const parsed = JSON.parse(saved) as Message[];
          setMessages(parsed.slice(-5));
        }
      }
    } catch (e) {
      // Ignore parse errors
    }
  }, []);

  // Save messages to conversation memory and learn from them
  useEffect(() => {
    if (typeof window === 'undefined' || messages.length === 0) return;
    
    try {
      // Save to conversation memory
      const lastMessage = messages[messages.length - 1];
      if (lastMessage) {
        saveMessage({
          role: lastMessage.isUser ? 'user' : 'assistant',
          content: lastMessage.text,
          timestamp: lastMessage.timestamp,
        });

        // Learn from conversation every few messages
        if (messages.length % 3 === 0) {
          const history = getConversationHistory();
          learnFromConversation(history);
        }
      }

      // Also save to old format for backward compatibility
      localStorage.setItem('hanmate-messages', JSON.stringify(messages.slice(-5)));
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
      // Get conversation history and context
      const history = getConversationHistory();
      const context = getContextSummary();
      
      // Format conversation history for API
      const conversationHistory = history.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await fetch('/api/talk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          conversationHistory,
          context,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to get AI response');
      }

      const data = await response.json();
      
      if (!data.reply || typeof data.reply !== 'string') {
        throw new Error('Invalid response from server');
      }

      const aiMessage = addMessage(data.reply, false);

      // Speak the AI reply after a short delay to ensure message is displayed
      setTimeout(() => {
        speakText(data.reply, locale);
      }, 100);
    } catch (err: any) {
      const errorMsg = err?.message || t('chat.error');
      setError(errorMsg);
      console.error('AI request error:', err);
      
      // Show user-friendly error
      addMessage(
        locale === 'ko' 
          ? '죄송합니다. 응답을 받는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.'
          : 'Sorry, there was a problem getting a response. Please try again in a moment.',
        false
      );
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
      console.warn('Speech synthesis not supported');
      return;
    }

    try {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === 'ko' ? 'ko-KR' : 'en-US';
      utterance.rate = 0.9; // Slightly slower for elders
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // Error handling for speech synthesis
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
      };

      utterance.onend = () => {
        // Speech completed
      };

      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Error speaking text:', error);
      // Fail silently - TTS is nice-to-have, not critical
    }
  };

  return (
    <div className="chat-view">
      <div className="chat-messages">
        {messages.length === 0 && !isLoading && (
          <div className="chat-empty">
            <p className="chat-empty-text">
              {t('chat.empty')}
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
                {t('chat.thinking')}
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

