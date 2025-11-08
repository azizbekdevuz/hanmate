'use client';

/**
 * VoiceInterface Component
 * 
 * Main component that integrates voice input, chat display, and social mock.
 * This is the core interaction interface for HanMate.
 */

import { useState, useRef } from 'react';
import { VoiceButton } from './VoiceButton';
import { ChatView, type ChatViewHandle } from './ChatView';
import { SocialMock } from './SocialMock';
import { type Locale } from '@/lib/i18n';

interface VoiceInterfaceProps {
  locale: Locale;
}

export function VoiceInterface({ locale }: VoiceInterfaceProps) {
  const [error, setError] = useState<string | null>(null);
  const chatViewRef = useRef<ChatViewHandle>(null);

  const handleTranscript = (text: string) => {
    setError(null);
    if (chatViewRef.current) {
      chatViewRef.current.handleUserMessage(text);
    }
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  return (
    <div className="voice-interface">
      <div className="voice-interface-main">
        {/* Chat View */}
        <ChatView 
          locale={locale} 
          ref={chatViewRef}
        />

        {/* Voice Button */}
        <div className="voice-interface-controls">
          <VoiceButton
            onTranscript={handleTranscript}
            onError={handleError}
            locale={locale}
          />
          {error && (
            <div className="voice-interface-error">
              <p className="voice-interface-error-text">{error}</p>
            </div>
          )}
        </div>
      </div>

      {/* Social Mock Section */}
      <div className="voice-interface-social">
        <SocialMock locale={locale} />
      </div>
    </div>
  );
}

