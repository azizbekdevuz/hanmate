/**
 * ChatBubble Component
 * 
 * Displays a message in a chat bubble format.
 * Supports user messages and AI replies with different styling.
 */

import { type Locale } from '@/lib/i18n';

interface ChatBubbleProps {
  message: string;
  isUser: boolean;
  locale: Locale;
}

export function ChatBubble({ message, isUser, locale }: ChatBubbleProps) {
  return (
    <div className={`chat-bubble ${isUser ? 'chat-bubble-user' : 'chat-bubble-ai'}`}>
      <div className="chat-bubble-content">
        <p className="chat-bubble-text">{message}</p>
      </div>
    </div>
  );
}

